# Resend 설정 필요 정보

> **현재 상태**: Resend API 키는 유효하지만 제한된 권한 (Sending only)
> **필요 작업**: 도메인 인증 및 Full Access API 키 생성

---

## 🔑 현재 API 키 상태

### API 키 정보
```
API Key: re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi
권한: Sending only (restricted)
상태: ✅ 작동 중 (contact@glec.io로 전송 성공)
```

### 확인된 제한사항
```json
{
  "statusCode": 401,
  "message": "This API key is restricted to only send emails",
  "name": "restricted_api_key"
}
```

**의미**:
- ✅ 이메일 전송: 가능
- ❌ 도메인 조회 (GET /domains): 불가능
- ❌ 도메인 추가/수정: 불가능
- ❌ 이메일 로그 조회: 불가능

---

## 📋 Resend Dashboard 접근 필요 정보

### 1. Resend 계정 정보
**필요**: Resend Dashboard 로그인 계정

**확인 방법**:
- API 키 생성 시 사용한 이메일 주소
- 또는 API 응답에서 언급된 계정 이메일: **contact@glec.io**

**로그인 URL**: https://resend.com/login

**추정**:
- 계정 이메일: contact@glec.io (API 응답 기준)
- 비밀번호: (사용자 확인 필요)

---

### 2. 도메인 인증 체크리스트

#### Step 1: Resend Dashboard 로그인
- [ ] URL: https://resend.com/login
- [ ] 계정: contact@glec.io (추정)
- [ ] 비밀번호: (확인 필요)

#### Step 2: 도메인 목록 확인
- [ ] Navigate to: https://resend.com/domains
- [ ] 확인: `glec.io` 도메인이 추가되어 있는지?
  - ✅ Yes → Step 3으로 이동 (DNS 레코드 확인)
  - ❌ No → Step 2-1로 이동 (도메인 추가)

#### Step 2-1: 도메인 추가 (필요 시)
- [ ] Click: "Add Domain"
- [ ] Enter: `glec.io`
- [ ] Click: "Add"

#### Step 3: DNS 레코드 확인
Resend가 제공하는 DNS 레코드를 복사:

**예상 레코드** (실제 값은 Dashboard에서 확인):
```dns
# SPF Record
Type: TXT
Name: @ (또는 glec.io)
Value: v=spf1 include:_spf.resend.com ~all
TTL: Auto

# DKIM Record
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCS... (긴 문자열)
TTL: Auto
```

**실제 값 확인 위치**:
- Resend Dashboard → Domains → glec.io → Records

#### Step 4: Cloudflare DNS 설정
- [ ] Cloudflare Dashboard 로그인: https://dash.cloudflare.com/
- [ ] Select domain: `glec.io`
- [ ] Navigate to: DNS → Records
- [ ] Add SPF record (Resend에서 복사한 값)
- [ ] Add DKIM record (Resend에서 복사한 값)
- [ ] Save

#### Step 5: 도메인 검증
- [ ] Resend Dashboard → Domains → glec.io
- [ ] Click: "Verify Domain"
- [ ] Wait: 5-30 minutes (DNS 전파 대기)
- [ ] Status: "Verified" (녹색) 확인

#### Step 6: 테스트
```bash
# 도메인 검증 완료 후
node test-library-production.js
```

**예상 결과**: ghdi0506@gmail.com로 이메일 수신 성공

---

### 3. Full Access API 키 생성 (선택사항)

**목적**: 도메인 조회, 이메일 로그 조회 등 관리 기능 사용

**생성 방법**:
1. Resend Dashboard 로그인
2. Navigate to: https://resend.com/api-keys
3. Click: "Create API Key"
4. Name: `GLEC Full Access`
5. Permission: **Full Access** (not "Sending access only")
6. Click: "Create"
7. Copy API key: `re_...` (한 번만 표시됨)

**환경 변수 추가** (.env.local):
```bash
# Sending only (현재)
RESEND_API_KEY="re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi"

# Full access (추가)
RESEND_ADMIN_API_KEY="re_[새로운_키]"
```

**사용 예시**:
```javascript
// 이메일 전송 (Sending key)
const resend = new Resend(process.env.RESEND_API_KEY);

// 도메인 조회 (Admin key)
const resendAdmin = new Resend(process.env.RESEND_ADMIN_API_KEY);
```

---

## 🔐 DNS 관리 권한 필요 정보

### Cloudflare 계정 정보
**필요**: Cloudflare Dashboard 접근 권한

**확인 사항**:
- [ ] Cloudflare 계정 로그인 가능?
- [ ] `glec.io` 도메인 DNS 관리 권한 보유?
- [ ] TXT 레코드 추가 권한 보유?

**로그인 URL**: https://dash.cloudflare.com/

**Alternative**: 다른 DNS 제공자 (가비아, AWS Route53 등)
- 해당 DNS 관리 페이지에서 동일한 TXT 레코드 추가

---

## 📧 테스트 이메일 주소

### 현재 상태
| Email | Status | Reason |
|-------|--------|--------|
| contact@glec.io | ✅ 수신 가능 | Resend 계정 소유자 이메일 |
| ghdi0506@gmail.com | ❌ 수신 불가 | 도메인 미인증 (403 Forbidden) |

### 도메인 인증 후
| Email | Status | Reason |
|-------|--------|--------|
| contact@glec.io | ✅ 수신 가능 | 계속 사용 가능 |
| ghdi0506@gmail.com | ✅ 수신 가능 | 도메인 인증 완료 후 |
| **모든 외부 이메일** | ✅ 수신 가능 | 제한 없음 |

---

## 🎯 빠른 시작 가이드

### Option A: 최소한의 설정 (권장)

**목표**: ghdi0506@gmail.com로 이메일 전송 가능하게 하기

**필요한 것**:
1. Resend Dashboard 접근 (contact@glec.io 계정)
2. Cloudflare DNS 관리 권한

**작업 시간**: 15-40분

**단계**:
1. Resend Dashboard에서 glec.io 도메인 추가/확인
2. DNS 레코드 (SPF, DKIM) 복사
3. Cloudflare에 DNS 레코드 추가
4. Resend에서 도메인 검증
5. 테스트 실행

**상세 가이드**: [RESEND_DOMAIN_VERIFICATION_GUIDE.md](./RESEND_DOMAIN_VERIFICATION_GUIDE.md)

### Option B: 완전한 설정

**목표**: 도메인 인증 + Full Access API 키 + Monitoring

**필요한 것**:
1. Option A의 모든 것
2. Full Access API 키 생성
3. Resend Webhook 설정 (선택사항)

**작업 시간**: 1-2시간

**단계**:
1. Option A 완료
2. Full Access API 키 생성
3. Webhook endpoint 설정 (email.opened, email.clicked 추적)
4. Monitoring dashboard 설정

**상세 가이드**:
- [RESEND_DOMAIN_VERIFICATION_GUIDE.md](./RESEND_DOMAIN_VERIFICATION_GUIDE.md)
- [RESEND_WEBHOOK_SETUP.md](./RESEND_WEBHOOK_SETUP.md)

---

## ✅ 확인 체크리스트

### 사용자 확인 필요
- [ ] Resend 계정 로그인 가능? (contact@glec.io)
- [ ] Cloudflare DNS 관리 권한 보유?
- [ ] glec.io 도메인이 Resend에 추가되어 있음?
- [ ] DNS 레코드 (SPF, DKIM) 값을 확인함?

### 작업 완료 후 확인
- [ ] Resend Dashboard에서 glec.io status: "Verified"
- [ ] DNS 레코드 전파 확인: `nslookup -type=TXT glec.io`
- [ ] 테스트 스크립트 실행: `node test-library-production.js`
- [ ] ghdi0506@gmail.com 이메일 수신 확인
- [ ] Admin UI에서 email_sent: true 확인

---

## 🚨 긴급 우회 방법 (임시)

도메인 인증이 시간이 걸리는 경우:

### 임시 방법 1: contact@glec.io로 전송
**장점**: 즉시 작동
**단점**: 실제 사용자 이메일로 전송 불가

```typescript
// app/api/library/download/route.ts
await resend.emails.send({
  from: 'GLEC <onboarding@resend.dev>',
  to: 'contact@glec.io',  // ← 임시로 변경
  subject: `[GLEC] ${libraryItem.title} 다운로드`,
  html: emailHtml,
});
```

### 임시 방법 2: 다른 이메일 서비스
**대안**: SendGrid, Mailgun, AWS SES 등
**작업 시간**: 2-4시간

---

## 📞 문의 사항

### Resend Support
- Email: support@resend.com
- Docs: https://resend.com/docs
- Status: https://status.resend.com

### 프로젝트 관련
- Root Cause Analysis: [ROOT_CAUSE_ANALYSIS_EMAIL_DELIVERY_FAILURE.md](./ROOT_CAUSE_ANALYSIS_EMAIL_DELIVERY_FAILURE.md)
- Domain Verification Guide: [RESEND_DOMAIN_VERIFICATION_GUIDE.md](./RESEND_DOMAIN_VERIFICATION_GUIDE.md)

---

**최종 업데이트**: 2025-10-11
**현재 상태**: ⚠️ Resend 도메인 미인증
**필요 액션**: Resend Dashboard 접근 → 도메인 인증 → DNS 레코드 추가
**예상 완료 시간**: 15-40분
