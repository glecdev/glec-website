# Resend Domain Verification Guide

> **근본 원인**: Resend API는 작동하지만 도메인(`glec.io`)이 인증되지 않아 외부 이메일 전송 불가

---

## 🔍 문제 요약

### 발견된 문제
```http
POST https://api.resend.com/emails
Authorization: Bearer re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi

Response: 403 Forbidden
{
  "message": "You can only send testing emails to your own email address (contact@glec.io).
              To send emails to other recipients, please verify a domain at resend.com/domains"
}
```

### 테스트 결과
| Test Email | Status | Details |
|------------|--------|---------|
| `ghdi0506@gmail.com` | ❌ **403 Forbidden** | Domain not verified |
| `contact@glec.io` | ✅ **200 OK** | Email ID: 276ae009-6f75-449a-a592-2c5b2f472f0a |

**결론**: API 키는 유효하지만, `glec.io` 도메인이 Resend에서 인증되지 않아 외부 수신자(ghdi0506@gmail.com)에게 전송 불가.

---

## 📊 5 Whys 근본 원인 분석 (최종)

1. **Why**: 이메일이 ghdi0506@gmail.com에 도착하지 않음
   - **Because**: API가 403 에러를 반환함

2. **Why**: API가 403 에러를 반환함
   - **Because**: Resend가 도메인 인증되지 않은 발신자는 외부 수신자에게 전송 불가

3. **Why**: 도메인이 인증되지 않음
   - **Because**: `glec.io` 도메인의 DNS 레코드에 Resend SPF/DKIM이 미설정

4. **Why**: DNS 레코드가 미설정됨
   - **Because**: Resend Dashboard에서 도메인 추가 및 검증 단계를 완료하지 않음

5. **Why**: 도메인 검증 단계를 완료하지 않음
   - **Root Cause**: 프로젝트 초기 설정 시 Resend 도메인 검증 누락

---

## ✅ 해결 방법

### 단계 1: Resend Dashboard에서 도메인 추가

1. **Resend Dashboard 로그인**
   - URL: https://resend.com/login
   - 계정: Resend API 키(`re_CWuvh2PM...`)와 연결된 계정

2. **도메인 추가**
   - Navigate to: https://resend.com/domains
   - Click: **"Add Domain"**
   - Enter: `glec.io`

3. **DNS 레코드 받기**
   - Resend가 제공하는 3개의 DNS 레코드를 메모:
     1. **SPF Record** (TXT)
     2. **DKIM Record** (TXT)
     3. **MX Record** (optional, for receiving emails)

**예시 DNS 레코드** (실제 값은 Resend Dashboard에서 확인):
```dns
# SPF (TXT Record)
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM (TXT Record)
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNAD...

# DMARC (TXT Record) - Recommended
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@glec.io
```

---

### 단계 2: DNS 레코드 추가

#### Option A: Cloudflare DNS (추천)

1. **Cloudflare Dashboard 로그인**
   - URL: https://dash.cloudflare.com/
   - Select domain: `glec.io`

2. **DNS 레코드 추가**
   - Navigate to: **DNS → Records**
   - Click: **"Add record"**

3. **SPF 레코드 추가**
   ```
   Type: TXT
   Name: @ (또는 glec.io)
   Content: v=spf1 include:_spf.resend.com ~all
   TTL: Auto
   ```

4. **DKIM 레코드 추가**
   ```
   Type: TXT
   Name: resend._domainkey
   Content: [Resend Dashboard에서 복사]
   TTL: Auto
   ```

5. **DMARC 레코드 추가** (선택사항)
   ```
   Type: TXT
   Name: _dmarc
   Content: v=DMARC1; p=none; rua=mailto:dmarc@glec.io
   TTL: Auto
   ```

#### Option B: 다른 DNS 제공자

도메인이 다른 곳(가비아, AWS Route53 등)에 있는 경우:
- 해당 DNS 관리 페이지에서 위 3개의 TXT 레코드 추가
- TTL은 3600초(1시간) 또는 자동으로 설정

---

### 단계 3: Resend에서 도메인 검증

1. **DNS 전파 대기** (5-30분)
   ```bash
   # DNS 레코드 확인 (Linux/Mac)
   dig TXT glec.io
   dig TXT resend._domainkey.glec.io

   # DNS 레코드 확인 (Windows)
   nslookup -type=TXT glec.io
   nslookup -type=TXT resend._domainkey.glec.io
   ```

2. **Resend Dashboard에서 검증**
   - Navigate to: https://resend.com/domains
   - Find: `glec.io`
   - Click: **"Verify Domain"**

3. **검증 완료 확인**
   - Status: **"Verified" (녹색)** ✅
   - 이제 `noreply@glec.io`, `contact@glec.io` 등 모든 `@glec.io` 이메일 사용 가능

---

### 단계 4: API 코드 업데이트

현재 코드에서 `from` 이메일 주소를 `noreply@glec.io`로 사용 중:

**파일**: `app/api/library/download/route.ts`

```typescript
// Line 303
await resend.emails.send({
  from: 'GLEC <noreply@glec.io>',  // ← 이미 glec.io 도메인 사용 중
  to: lead.email,
  subject: `[GLEC] ${libraryItem.title} 다운로드`,
  html: emailHtml,
});
```

**✅ 코드 변경 불필요** - 도메인 인증만 완료하면 됨.

---

### 단계 5: 테스트 재실행

도메인 검증 완료 후:

```bash
# Production 테스트 (ghdi0506@gmail.com로 재전송)
node test-library-production.js
```

**예상 결과**:
```json
{
  "success": true,
  "message": "이메일로 다운로드 링크를 전송했습니다",
  "data": {
    "lead_id": "...",
    "email_sent": true
  }
}
```

이번에는 ghdi0506@gmail.com에 **실제로 이메일이 도착**해야 합니다.

---

## 📧 이메일 도메인 옵션

### Option 1: `noreply@glec.io` (현재)
**장점**:
- 브랜드 신뢰도 향상
- 스팸 필터 회피 가능성 높음
- 전문적인 인상

**단점**:
- DNS 설정 필요
- 도메인 소유 필요

**권장**: ✅ **프로덕션 환경**

### Option 2: `onboarding@resend.dev` (테스트용)
**장점**:
- 도메인 검증 불필요
- 즉시 사용 가능

**단점**:
- Resend 계정 소유자(contact@glec.io)에게만 전송 가능
- 외부 수신자에게 전송 불가 (403 에러)

**권장**: ⚠️ **개발/테스트 환경만**

---

## 🔧 환경 변수 업데이트

도메인 검증 완료 후 환경 변수도 업데이트:

### Local Development (`.env.local`)
```bash
# 현재 (이미 올바름)
RESEND_API_KEY="re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi"
RESEND_FROM_EMAIL="onboarding@resend.dev"  # ← 변경 필요

# 변경 후
RESEND_API_KEY="re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi"
RESEND_FROM_EMAIL="noreply@glec.io"  # ✅ glec.io 도메인으로 변경
```

### Vercel Production
1. Navigate to: https://vercel.com/glecdev/glec-website/settings/environment-variables
2. Edit: `RESEND_FROM_EMAIL`
3. Value: `noreply@glec.io`
4. Save and redeploy

---

## 🧪 검증 체크리스트

도메인 검증 완료 후 다음 항목을 확인:

- [ ] Resend Dashboard에서 `glec.io` 도메인 status: **"Verified"**
- [ ] DNS 레코드 확인: `dig TXT glec.io` (SPF)
- [ ] DNS 레코드 확인: `dig TXT resend._domainkey.glec.io` (DKIM)
- [ ] Resend API 직접 테스트: `node test-resend-api-directly.js`
- [ ] Production E2E 테스트: `node test-library-production.js`
- [ ] 실제 이메일 수신 확인: ghdi0506@gmail.com 받은편지함
- [ ] 스팸 폴더 확인
- [ ] Admin UI에서 `email_sent: true` 확인
- [ ] Resend Dashboard에서 전송 로그 확인

---

## 📊 Resend Dashboard 모니터링

도메인 검증 후 모니터링할 항목:

### 1. Emails (전송 로그)
- URL: https://resend.com/emails
- 모든 전송된 이메일 ID, status, recipient 확인
- Delivered / Bounced / Complained 상태 추적

### 2. Analytics
- URL: https://resend.com/analytics
- 전송 성공률, 오픈률, 클릭률 추적

### 3. Domains
- URL: https://resend.com/domains
- `glec.io` 도메인 status: Verified ✅
- DNS 레코드 상태 실시간 확인

### 4. API Keys
- URL: https://resend.com/api-keys
- `re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi` 상태 확인
- 사용량(quota) 모니터링

---

## ⚠️ 주의사항

### 1. DNS 전파 시간
- SPF/DKIM 레코드 추가 후 **5-30분** 소요
- 일부 지역은 **최대 24시간** 걸릴 수 있음
- 조급하게 여러 번 검증하지 말 것

### 2. 기존 SPF 레코드
- 이미 SPF 레코드가 있는 경우:
  ```dns
  # 기존
  v=spf1 include:_spf.google.com ~all

  # 변경 후 (Resend 추가)
  v=spf1 include:_spf.google.com include:_spf.resend.com ~all
  ```
- ⚠️ SPF 레코드는 **도메인당 1개만** 가능
- 여러 서비스 사용 시 `include:` 구문으로 병합

### 3. DMARC 정책
- 초기에는 `p=none` (모니터링만)
- 충분한 데이터 수집 후 `p=quarantine` 또는 `p=reject`로 변경

### 4. 이메일 전송 제한
- Resend Free Plan: 100 emails/day
- Resend Pro Plan: 50,000 emails/month
- 초과 시 403 에러 발생

---

## 🚀 완료 후 다음 단계

도메인 검증 완료 후:

1. **Webhook 설정** (선택사항)
   - Guide: [RESEND_WEBHOOK_SETUP.md](./RESEND_WEBHOOK_SETUP.md)
   - Email opened/clicked 이벤트 추적

2. **Custom 도메인 이메일**
   - `noreply@glec.io`: 자동화된 알림
   - `support@glec.io`: 고객 지원
   - `sales@glec.io`: 영업 문의

3. **Email Template 개선**
   - React Email 라이브러리 사용
   - 별도 템플릿 파일로 분리
   - A/B 테스트

4. **모니터링 & 알림**
   - Resend Dashboard에서 실시간 모니터링
   - 전송 실패 시 Slack/이메일 알림

---

## 📞 문제 해결 (Troubleshooting)

### 문제 1: DNS 레코드가 검증되지 않음
```bash
# DNS 전파 확인
dig TXT glec.io
dig TXT resend._domainkey.glec.io

# 또는 온라인 도구 사용
https://dnschecker.org/
```

**해결 방법**:
- DNS 레코드가 올바른지 재확인
- 30분-1시간 대기 후 재시도
- Cloudflare Proxy 상태 확인 (DNS only로 설정)

### 문제 2: 여전히 403 에러
**원인**: 도메인 검증 미완료 또는 캐시

**해결 방법**:
1. Resend Dashboard에서 도메인 status 확인
2. API 키 재생성 시도
3. Resend support에 문의 (support@resend.com)

### 문제 3: 이메일이 스팸으로 분류
**원인**: SPF/DKIM은 있지만 도메인 평판 부족

**해결 방법**:
1. DMARC 레코드 추가
2. 천천히 전송량 증가 (warming up)
3. 수신자가 "스팸 아님" 표시
4. Resend의 "Deliverability Score" 확인

---

## 📚 참고 자료

- Resend Docs: https://resend.com/docs
- Domain Verification: https://resend.com/docs/dashboard/domains/introduction
- DNS Records: https://resend.com/docs/dashboard/domains/dns-records
- SPF Syntax: https://www.rfc-editor.org/rfc/rfc7208
- DKIM Specification: https://www.rfc-editor.org/rfc/rfc6376
- DMARC Guide: https://dmarc.org/overview/

---

**최종 업데이트**: 2025-10-11
**근본 원인**: Resend 도메인 미인증 (403 Forbidden)
**해결 방법**: `glec.io` 도메인을 Resend에서 검증 (SPF/DKIM DNS 레코드 추가)
**테스트 결과**: contact@glec.io로는 전송 성공 (Email ID: 276ae009-6f75-449a-a592-2c5b2f472f0a)
