# Vercel 환경 변수 업데이트 가이드

> **목적**: Vercel Production에 Resend API 키 업데이트
> **API Key**: `re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi`

---

## 🚀 Vercel Dashboard에서 환경 변수 업데이트 (권장)

### Step 1: Vercel Dashboard 접속
1. 브라우저에서 https://vercel.com 접속
2. 로그인 (GitHub 계정 연동)
3. **glec-website** 프로젝트 선택

### Step 2: 환경 변수 설정 페이지 이동
1. 프로젝트 대시보드에서 **Settings** 클릭
2. 좌측 메뉴에서 **Environment Variables** 클릭

### Step 3: RESEND_API_KEY 업데이트
1. 기존 `RESEND_API_KEY` 찾기
2. **Edit** 버튼 클릭
3. Value 변경:
   ```
   re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi
   ```
4. Environment: **Production** 체크 (✅)
5. **Save** 클릭

### Step 4: RESEND_FROM_EMAIL 업데이트 (선택)
1. `RESEND_FROM_EMAIL` 찾기 (없으면 Add New 클릭)
2. Name: `RESEND_FROM_EMAIL`
3. Value: `onboarding@resend.dev` (Resend 테스트 도메인)
4. Environment: **Production** 체크 (✅)
5. **Save** 클릭

### Step 5: 재배포 (자동)
- 환경 변수 변경 시 자동으로 재배포 트리거됨
- 또는 **Deployments** 탭에서 최신 배포의 **Redeploy** 클릭

---

## 📊 검증 방법

### Option A: 테스트 스크립트 실행
```bash
cd glec-website
node test-library-production.js
```

**Expected Output**:
```
✅ Email sent: true
🎉 Test completed! Check ghdi0506@gmail.com for the download link.
```

### Option B: 이메일 확인
1. ghdi0506@gmail.com 받은편지함 확인
2. From: **GLEC <onboarding@resend.dev>** (또는 noreply@glec.io)
3. Subject: **"[GLEC] GLEC Framework v3.0 한글 버전 다운로드"**
4. 본문에 Google Drive 다운로드 링크 있음

### Option C: Admin UI 확인
1. https://glec-website.vercel.app/admin/customer-leads 접속
2. Search: `ghdi0506@gmail.com`
3. 최신 Lead 확인:
   - ID: `bcb424e6-0283-4f8c-a470-efc59b5fa0ca`
   - Email Sent: ✅ TRUE
   - Company: GLEC Production Test

---

## 🔧 CLI로 환경 변수 업데이트 (대체 방법)

### 기존 변수 제거
```bash
npx vercel env rm RESEND_API_KEY production
# Confirm: y
```

### 새 변수 추가
```bash
npx vercel env add RESEND_API_KEY production
# Enter value when prompted:
re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi
```

### FROM_EMAIL 추가
```bash
npx vercel env add RESEND_FROM_EMAIL production
# Enter value:
onboarding@resend.dev
```

### 재배포
```bash
npx vercel --prod
```

---

## 🎯 현재 상태 (2025-10-11)

### Local Development (.env.local)
✅ **Updated**:
```bash
RESEND_API_KEY="re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi"
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

### Vercel Production
⏳ **Pending Update**:
- Old value: `re_placeholder_for_build`
- New value: `re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi`
- Status: **Waiting for manual update via Dashboard**

---

## 📧 Test Results (Latest)

### Production Test #2
- **Date**: 2025-10-11 23:35 KST
- **Lead ID**: bcb424e6-0283-4f8c-a470-efc59b5fa0ca
- **Email**: ghdi0506@gmail.com
- **API Response**: `email_sent: true` ✅
- **Admin API Confirmation**: ✅ Lead found with email_sent: true
- **Actual Email Delivery**: ⏳ **Awaiting user confirmation**

**Action Required**:
1. ✅ API reports email sent successfully
2. ✅ Admin UI shows lead with email_sent: true
3. ⏳ User needs to check ghdi0506@gmail.com inbox
4. ⏳ If email NOT received → Update Vercel env vars (see Step 1 above)

---

## ❓ Troubleshooting

### 이메일이 여전히 안 오는 경우

#### 1. Vercel 환경 변수 확인
```bash
npx vercel env ls
# RESEND_API_KEY 값이 re_CWuvh2PM... 인지 확인
```

#### 2. Resend Dashboard 확인
- https://resend.com/dashboard 접속
- **Emails** 탭 → Recent Deliveries 확인
- ghdi0506@gmail.com으로 전송된 이메일 찾기
- Status: Delivered / Bounced / Failed 확인

#### 3. 스팸함 확인
- Gmail Spam 폴더 확인
- From: `onboarding@resend.dev` 또는 `noreply@glec.io` 검색

#### 4. API 키 유효성 확인
```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "ghdi0506@gmail.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

**Expected Response**:
```json
{
  "id": "re_xxxxx",
  "from": "onboarding@resend.dev",
  "to": "ghdi0506@gmail.com",
  "created_at": "2025-10-11T..."
}
```

---

## ✅ Success Checklist

- [✅] `.env.local` updated with real API key
- [⏳] Vercel Production env updated (manual step required)
- [✅] Production test executed (Lead: bcb424e6-0283-4f8c-a470-efc59b5fa0ca)
- [⏳] Email received in ghdi0506@gmail.com (waiting for confirmation)
- [ ] Webhook setup (optional - for email tracking)

---

## 🔗 References

- Resend Dashboard: https://resend.com/dashboard
- Vercel Dashboard: https://vercel.com/glecdev/glec-website
- Resend Docs: https://resend.com/docs
- Vercel Env Vars: https://vercel.com/docs/environment-variables

---

**Next Step**:
1. ✅ Check ghdi0506@gmail.com for email
2. Update Vercel Dashboard (if needed)
3. Re-test after Vercel env update

**Status**: ⏳ Waiting for email confirmation
