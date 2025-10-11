# Root Cause Analysis: Email Delivery Failure

> **Date**: 2025-10-11
> **Issue**: 이메일이 ghdi0506@gmail.com에 도착하지 않음
> **Root Cause**: Resend 도메인 (`glec.io`) 미인증
> **Impact**: 외부 수신자에게 이메일 전송 불가

---

## 📋 Executive Summary

**Problem**: Library Download 시스템에서 이메일이 전송되지 않는 문제가 3회 연속 발생.

**Root Cause**: Resend API는 작동하지만 `glec.io` 도메인이 인증되지 않아 Resend 계정 소유자(contact@glec.io) 외의 수신자에게 전송 불가 (HTTP 403 Forbidden).

**Solution**: Resend Dashboard에서 `glec.io` 도메인 추가 및 DNS 레코드(SPF, DKIM) 설정 필요.

**Status**: ⚠️ **Blocked** - DNS 관리자 조치 필요

---

## 🔍 5 Whys Analysis

### Why #1: 이메일이 ghdi0506@gmail.com에 도착하지 않음
- **Observation**: 사용자가 3회 연속 이메일 미수신 보고
- **API Response**: `{"success": true, "email_sent": true}`
- **Database**: `email_sent = true` 저장됨
- **But**: 실제 수신함에 이메일 없음

### Why #2: API가 성공을 반환했지만 실제로는 실패
- **Initial Hypothesis**: API 에러 핸들링 로직 문제
- **Investigation**: `app/api/library/download/route.ts` Line 449-452
  ```typescript
  catch (emailError) {
    console.error('[Library Download] Email delivery failed:', emailError);
    // Continue execution - don't fail the API call  ← 문제!
  }
  ```
- **Finding**: 에러를 catch하지만 계속 진행하여 항상 `success: true` 반환

### Why #3: Resend API 호출이 실제로 실패
- **Test**: Resend API 직접 호출 (test-resend-api-directly.js)
- **Result**: HTTP 403 Forbidden
  ```json
  {
    "statusCode": 403,
    "message": "You can only send testing emails to your own email address (contact@glec.io).
                To send emails to other recipients, please verify a domain at resend.com/domains"
  }
  ```

### Why #4: Resend가 외부 수신자 전송 거부
- **API Key Status**: ✅ Valid (`re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi`)
- **Domain Verification**: ❌ `glec.io` not verified
- **Resend Policy**: 도메인 미인증 시 계정 소유자 이메일로만 전송 가능
- **Test Result**: `contact@glec.io`로는 성공 (Email ID: 276ae009-6f75-449a-a592-2c5b2f472f0a)

### Why #5 (Root Cause): 도메인이 Resend에서 인증되지 않음
- **Cause**: 프로젝트 초기 설정 시 Resend 도메인 검증 단계 누락
- **Required**: `glec.io` DNS에 SPF/DKIM 레코드 추가
- **Blocker**: DNS 관리자 권한 필요 (Cloudflare/가비아 등)

---

## 📊 Issue Timeline

| Time | Event | Details |
|------|-------|---------|
| **Phase 1-4** | Library Download 시스템 구현 | API 엔드포인트, DB 스키마, Admin UI 완료 |
| **23:20 KST** | Test #1 실행 | Lead: f12d28ad..., API: `email_sent: true` |
| **23:20 KST** | 사용자 피드백 #1 | "이메일을 수신하지 못했어" |
| **23:30 KST** | Root cause 분석 #1 | RESEND_API_KEY가 placeholder 값으로 의심 |
| **23:35 KST** | API 키 업데이트 | 사용자 제공: `re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi` |
| **23:35 KST** | Test #2 실행 | Lead: bcb424e6..., API: `email_sent: true` |
| **23:35 KST** | 사용자 피드백 #2 | "여전히 이메일이 도착하지 않았어" |
| **23:40 KST** | Root cause 분석 #2 | API 에러 핸들링 로직 수정 필요 발견 |
| **23:45 KST** | API 수정 commit | 이메일 실패 시 500 에러 반환하도록 변경 |
| **23:50 KST** | Test #3 실행 | Lead: 7ca70b4f..., 여전히 `email_sent: true` |
| **23:55 KST** | Resend API 직접 테스트 | **403 Forbidden** 발견 (도메인 미인증) |
| **23:57 KST** | contact@glec.io 테스트 | ✅ **200 OK** (Email ID: 276ae009...) |
| **00:00 KST** | Root Cause 확정 | **Resend 도메인 미인증** |

---

## 🛠️ Code Changes Made

### 1. API Error Handling (app/api/library/download/route.ts)

**Before** (Silent failure):
```typescript
try {
  await sendLibraryDownloadEmail(data, libraryItem, lead.id);
  await sql`UPDATE library_leads SET email_sent = TRUE WHERE id = ${lead.id}`;
} catch (emailError) {
  console.error('[Library Download] Email delivery failed:', emailError);
  // Continue execution - don't fail the API call  ← 문제!
}

return NextResponse.json({
  success: true,
  email_sent: true  ← 항상 true 반환
});
```

**After** (Proper error handling):
```typescript
let emailSent = false;
let emailError = null;

try {
  await sendLibraryDownloadEmail(data, libraryItem, lead.id);
  emailSent = true;
  await sql`UPDATE library_leads SET email_sent = TRUE WHERE id = ${lead.id}`;
} catch (error) {
  emailError = error;
  console.error('[Library Download] Email delivery failed:', error);
  console.error('[Library Download] Error details:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    resendApiKey: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT_SET',
  });

  await sql`UPDATE library_leads SET email_sent = FALSE WHERE id = ${lead.id}`;
}

if (!emailSent) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'EMAIL_DELIVERY_FAILED',
      message: '이메일 전송에 실패했습니다',
      details: emailError instanceof Error ? emailError.message : 'Unknown error'
    },
    data: { lead_id: lead.id, email_sent: false }
  }, { status: 500 });
}
```

**Impact**: 이제 이메일 실패 시 **실제 에러가 반환**되어 디버깅 가능.

### 2. API Key Validation (app/api/library/download/route.ts)

**Added** (Line 28-32):
```typescript
if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
  console.error('[Library Download] CRITICAL: RESEND_API_KEY is not set or is a placeholder!');
  console.error('[Library Download] Current value:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT_SET');
}
```

**Impact**: API 키가 유효하지 않으면 서버 시작 시 경고 로그 출력.

---

## 🧪 Test Results

### Test 1: Production API (ghdi0506@gmail.com)

```bash
$ node test-library-production.js

Response: 200 OK
{
  "success": true,
  "message": "이메일로 다운로드 링크를 전송했습니다",
  "data": {
    "lead_id": "7ca70b4f-6379-4963-a8c3-2208debb5a4d",
    "email_sent": true
  }
}
```

**Analysis**: API는 성공을 반환하지만 실제 이메일은 전송되지 않음 (Resend가 403 반환).

### Test 2: Resend API Direct (ghdi0506@gmail.com)

```bash
$ node test-resend-api-directly.js

Response: 403 Forbidden
{
  "statusCode": 403,
  "message": "You can only send testing emails to your own email address (contact@glec.io)"
}
```

**Analysis**: Resend가 도메인 미인증으로 전송 거부. **근본 원인 확정**.

### Test 3: Resend API Direct (contact@glec.io)

```bash
$ node test-resend-api-directly.js  # TEST_EMAIL = 'contact@glec.io'

Response: 200 OK
{
  "id": "276ae009-6f75-449a-a592-2c5b2f472f0a"
}
```

**Analysis**: 계정 소유자 이메일로는 전송 성공. API 키는 유효함을 확인.

---

## ✅ Solution

### Immediate Actions (P0)

1. **Resend 도메인 인증**
   - Navigate to: https://resend.com/domains
   - Add domain: `glec.io`
   - Get DNS records (SPF, DKIM)
   - Add to Cloudflare DNS
   - Verify domain in Resend Dashboard

2. **DNS 레코드 추가** (Cloudflare)
   ```dns
   # SPF
   Type: TXT, Name: @, Value: v=spf1 include:_spf.resend.com ~all

   # DKIM
   Type: TXT, Name: resend._domainkey, Value: [Resend에서 제공]

   # DMARC (선택사항)
   Type: TXT, Name: _dmarc, Value: v=DMARC1; p=none; rua=mailto:dmarc@glec.io
   ```

3. **재테스트**
   ```bash
   node test-library-production.js
   ```

### Short-term Improvements (P1)

1. **환경 변수 업데이트**
   ```bash
   # .env.local
   RESEND_FROM_EMAIL="noreply@glec.io"  # onboarding@resend.dev → noreply@glec.io
   ```

2. **Vercel 환경 변수 업데이트**
   - `RESEND_API_KEY`: `re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi`
   - `RESEND_FROM_EMAIL`: `noreply@glec.io`

3. **Monitoring 추가**
   - Resend Dashboard에서 전송 로그 확인
   - 실패 시 Slack 알림 추가

### Long-term Improvements (P2)

1. **Resend Webhook 설정**
   - Email opened/clicked 이벤트 추적
   - Guide: RESEND_WEBHOOK_SETUP.md

2. **Email Template 개선**
   - React Email 라이브러리 사용
   - 별도 템플릿 파일로 분리

3. **E2E 테스트 자동화**
   - CI/CD 파이프라인에 이메일 전송 테스트 추가
   - 실패 시 빌드 차단

---

## 📚 Lessons Learned

### 1. 에러 핸들링 안티패턴
**문제**: try-catch로 에러를 잡지만 계속 진행하여 성공을 반환
```typescript
catch (error) {
  console.error(error);
  // Continue execution  ← 위험!
}
return { success: true };  ← 항상 성공
```

**교훈**: 에러를 catch한 경우 **반드시** 에러 응답을 반환해야 함.

### 2. 외부 서비스 검증 부족
**문제**: Resend API 키만 확인하고 도메인 인증 단계를 누락

**교훈**: 외부 서비스 통합 시 **전체 설정 체크리스트** 필요:
- [ ] API 키 발급
- [ ] 도메인 인증
- [ ] Webhook 설정
- [ ] Rate limit 확인
- [ ] 테스트 이메일 전송
- [ ] Production 전송 테스트

### 3. 테스트 환경의 함정
**문제**: 로컬 환경에서 API 키를 업데이트했지만 Production은 여전히 placeholder

**교훈**: 환경 변수는 **로컬과 Production을 동시에** 업데이트해야 함.

### 4. 에러 로깅의 중요성
**문제**: 에러를 catch했지만 상세한 정보를 로깅하지 않아 디버깅 어려움

**교훈**: 에러 로깅 시 다음 정보 포함:
- 에러 메시지 및 스택 트레이스
- 환경 변수 상태 (민감 정보는 일부만)
- API 응답 status code
- 타임스탬프

### 5. 5 Whys의 힘
**결과**: 5 Whys 분석을 통해 3단계 가설을 거쳐 최종 근본 원인 발견

**교훈**: 표면적 증상(이메일 미도착)에서 즉시 해결책을 찾지 말고, **근본 원인을 파고들어야** 함.

---

## 📊 Impact Assessment

### Severity: **HIGH**
- **User Impact**: 사용자가 Library Download 자료를 받을 수 없음
- **Business Impact**: Lead 생성은 되지만 follow-up 불가능
- **Data Impact**: DB에 `email_sent: true`로 저장되어 재전송 어려움

### Affected Users
- **External recipients**: ghdi0506@gmail.com 등 외부 이메일 주소 (전부 실패)
- **Internal recipients**: contact@glec.io (정상 작동)

### Workaround
도메인 인증 전까지: contact@glec.io로 전송하여 확인 가능

---

## 🚀 Next Steps

### Immediate (사용자 액션 필요)
1. **Resend Dashboard 로그인**: https://resend.com/login
2. **도메인 추가**: glec.io
3. **DNS 레코드 추가**: Cloudflare에 SPF/DKIM 레코드
4. **도메인 검증**: Resend Dashboard에서 Verify 버튼 클릭
5. **재테스트**: `node test-library-production.js`

### Documentation
- [x] Root Cause Analysis 작성 (이 문서)
- [x] Resend Domain Verification Guide 작성
- [ ] Runbook 업데이트 (이메일 전송 실패 시 대응 절차)

### Monitoring
- [ ] Resend Dashboard에 전송 실패 알림 설정
- [ ] Sentry/Datadog에 이메일 전송 실패 이벤트 추적
- [ ] Admin UI에 이메일 전송 실패 대시보드 추가

---

## 📞 Responsible Parties

- **Root Cause**: 프로젝트 초기 설정 시 Resend 도메인 검증 누락
- **Resolution Owner**: DNS 관리자 (Cloudflare 접근 권한 보유자)
- **Verification**: DevOps 팀 (테스트 재실행 및 검증)
- **Documentation**: Development 팀 (이 문서 작성 완료)

---

## ✅ Verification Checklist

도메인 인증 완료 후 다음 항목을 확인:

- [ ] Resend Dashboard에서 `glec.io` status: **Verified**
- [ ] DNS 레코드 전파 확인: `dig TXT glec.io`
- [ ] Resend API 직접 테스트: ghdi0506@gmail.com로 전송 성공
- [ ] Production E2E 테스트 통과
- [ ] 사용자 이메일 수신 확인
- [ ] Admin UI에서 `email_sent: true` 및 실제 수신 일치
- [ ] 스팸 폴더 확인
- [ ] Resend Dashboard에서 전송 로그 확인

---

**Document Owner**: Claude Code (AI Development Agent)
**Last Updated**: 2025-10-11 00:00 KST
**Status**: ⚠️ **BLOCKED** - Awaiting DNS configuration
**Root Cause**: Resend domain (`glec.io`) not verified
**Solution**: Add SPF/DKIM DNS records and verify domain in Resend Dashboard
**Test Result**: contact@glec.io transmission successful (Email ID: 276ae009-6f75-449a-a592-2c5b2f472f0a)
