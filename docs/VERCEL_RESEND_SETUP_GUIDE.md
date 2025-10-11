# Vercel & Resend 완벽 설정 가이드

> **목적**: Vercel 환경 변수 업데이트 및 Resend Webhook 설정
> **소요 시간**: 10-15분
> **필수 조건**: Vercel 계정, Resend 계정

---

## 📋 Task 1: Vercel 환경 변수 업데이트

### 업데이트 필요 변수
```bash
RESEND_FROM_EMAIL="noreply@no-reply.glec.io"
```

### Step 1: Vercel Dashboard 접속
1. **로그인**: https://vercel.com/login
2. **프로젝트 선택**: glec-website
3. **Settings 이동**: 상단 메뉴 → Settings

### Step 2: 환경 변수 페이지 이동
1. **왼쪽 메뉴**: Environment Variables 클릭
2. **URL**: https://vercel.com/glecdev/glec-website/settings/environment-variables

### Step 3: RESEND_FROM_EMAIL 업데이트
1. **기존 변수 찾기**: `RESEND_FROM_EMAIL` 검색
2. **Edit 버튼 클릭** (연필 아이콘)
3. **Value 수정**:
   ```
   기존: onboarding@resend.dev
   수정: noreply@no-reply.glec.io
   ```
4. **Save 버튼 클릭**

### Step 4: 재배포
Vercel은 환경 변수 변경 시 자동으로 재배포합니다.

- **재배포 확인**: Deployments 탭 → 최신 배포 확인
- **예상 시간**: 1-2분

---

## 📋 Task 2: Resend Webhook 설정

### Webhook URL
```
https://glec-website.vercel.app/api/webhooks/resend
```

### Step 1: Resend Dashboard 접속
1. **로그인**: https://resend.com/login
2. **Webhooks 페이지**: https://resend.com/webhooks

### Step 2: Add Webhook
1. **"Add Webhook" 버튼 클릭**

2. **Endpoint URL 입력**:
   ```
   https://glec-website.vercel.app/api/webhooks/resend
   ```

3. **Events 선택** (스크린샷 참조):

   **Email Events (필수)**:
   - [x] `email.delivered` - 이메일 전송 완료
   - [x] `email.opened` - 이메일 열람 (**중요!**)
   - [x] `email.clicked` - 링크 클릭 (**중요!**)
   - [x] `email.bounced` - 이메일 반송
   - [x] `email.complained` - 스팸 신고

   **Optional Events**:
   - [ ] `email.delivery_delayed` - 전송 지연 (선택사항)
   - [ ] `email.sent` - 전송 시작 (선택사항)

4. **"Create Webhook" 버튼 클릭**

### Step 3: Webhook Secret 복사 (선택사항)
Webhook 생성 후 Resend가 Secret을 제공합니다:

```
whsec_...
```

**이 Secret을 Vercel 환경 변수에 추가 (권장)**:
1. Vercel → Settings → Environment Variables
2. Add New
3. Name: `RESEND_WEBHOOK_SECRET`
4. Value: `whsec_...` (Resend에서 복사)
5. Save

---

## 📋 Task 3: Webhook 테스트

### Method 1: Resend Dashboard에서 테스트
1. **Webhooks 페이지**: https://resend.com/webhooks
2. **생성한 Webhook 클릭**
3. **"Test" 탭 클릭**
4. **Event 선택**: `email.delivered`
5. **"Send test" 버튼 클릭**

**예상 결과**:
```json
{
  "received": true
}
```

### Method 2: 실제 이메일 전송으로 테스트
```bash
# Production 테스트 실행
node test-library-production.js
```

**확인 사항**:
1. ✅ 이메일 수신
2. ✅ 이메일 열람
3. ✅ 다운로드 링크 클릭
4. ✅ Admin UI에서 tracking indicators 확인

---

## 📋 Task 4: Admin UI에서 확인

### Step 1: Admin 로그인
- **URL**: https://glec-website.vercel.app/admin/login
- **Credentials**: (admin 계정)

### Step 2: Customer Leads 페이지
- **Navigate**: 리드 관리 → Library Download Leads
- **Search**: ghdi0506@gmail.com

### Step 3: Tracking Indicators 확인
Lead 상세 정보에서 다음 항목 확인:

```
✉️  Email Sent: ✅ Yes
👁️  Email Opened: ✅ Yes (webhook 작동 시)
⬇️  Download Clicked: ✅ Yes (webhook 작동 시)
```

**Webhook이 작동하면**:
- `email_opened`: FALSE → TRUE
- `email_opened_at`: NULL → 타임스탬프
- `download_link_clicked`: FALSE → TRUE
- `download_link_clicked_at`: NULL → 타임스탬프
- `lead_score`: 70 → 90-100 (engagement 점수 추가)

---

## 📊 Webhook Event Flow

### Event: email.opened
```
1. 사용자가 이메일 열람
2. Resend가 webhook 전송: POST /api/webhooks/resend
3. 서버가 library_leads 업데이트:
   - email_opened = TRUE
   - email_opened_at = NOW()
   - lead_score += 10
4. Admin UI에 👁️ 아이콘 표시
```

### Event: email.clicked
```
1. 사용자가 "다운로드 (Google Drive)" 버튼 클릭
2. Resend가 webhook 전송: POST /api/webhooks/resend
3. 서버가 library_leads 업데이트:
   - download_link_clicked = TRUE
   - download_link_clicked_at = NOW()
   - lead_score += 20
4. Admin UI에 ⬇️ 아이콘 표시
```

### Event: email.bounced
```
1. 이메일 주소가 유효하지 않음
2. Resend가 webhook 전송
3. 서버가 library_leads 업데이트:
   - lead_score = 0
   - notes += "[날짜] Email bounced"
4. Admin UI에 경고 표시
```

---

## 🔍 Troubleshooting

### Problem 1: Webhook이 작동하지 않음

**확인 사항**:
1. **Webhook URL 정확한지**:
   ```
   https://glec-website.vercel.app/api/webhooks/resend
   ```
   (http**s** 필수, 끝에 슬래시 없음)

2. **Vercel 배포 완료되었는지**:
   - Deployments 탭에서 최신 배포 확인
   - Status: Ready (녹색)

3. **Resend Dashboard에서 Webhook Status 확인**:
   - Webhooks 페이지 → 생성한 Webhook 클릭
   - Recent deliveries 확인
   - Status: 200 OK (성공) or 4xx/5xx (실패)

### Problem 2: Admin UI에 tracking indicators 표시 안 됨

**원인**:
- Webhook이 전송되었지만 database 업데이트 실패

**해결 방법**:
1. **Vercel Logs 확인**:
   ```
   Vercel Dashboard → Logs → Function Logs
   ```

2. **검색**:
   ```
   [Resend Webhook]
   ```

3. **에러 메시지 확인**:
   - Database connection error?
   - SQL syntax error?
   - Lead not found?

### Problem 3: Webhook Secret 검증 실패

**Error**:
```
401 Unauthorized - Invalid signature
```

**해결 방법**:
1. **Vercel 환경 변수 확인**:
   - `RESEND_WEBHOOK_SECRET` 값이 Resend Dashboard의 Secret과 일치하는지

2. **Secret 재생성**:
   - Resend Dashboard → Webhooks → Edit → Regenerate Secret
   - Vercel 환경 변수 업데이트
   - Vercel 재배포

---

## 📚 Webhook Event Reference

### Supported Events
| Event | Description | Database Update |
|-------|-------------|-----------------|
| `email.delivered` | 이메일 전송 완료 | email_sent = TRUE |
| `email.opened` | 이메일 열람 | email_opened = TRUE, lead_score += 10 |
| `email.clicked` | 링크 클릭 | download_link_clicked = TRUE, lead_score += 20 |
| `email.bounced` | 이메일 반송 | lead_score = 0, notes 추가 |
| `email.complained` | 스팸 신고 | lead_status = LOST, lead_score = 0 |
| `email.delivery_delayed` | 전송 지연 | 로그만 기록 |
| `email.sent` | 전송 시작 | 로그만 기록 |

### Webhook Payload Example
```json
{
  "type": "email.opened",
  "created_at": "2025-10-12T00:30:00.000Z",
  "data": {
    "email_id": "80839470-3171-4474-aeb4-5194d1e3ad2f",
    "from": "noreply@no-reply.glec.io",
    "to": ["ghdi0506@gmail.com"],
    "subject": "[GLEC] GLEC Framework v3.0 한글 버전 다운로드",
    "created_at": "2025-10-12T00:25:00.000Z"
  }
}
```

---

## ✅ Setup Checklist

### Vercel 환경 변수
- [ ] `RESEND_FROM_EMAIL` = `noreply@no-reply.glec.io` 업데이트
- [ ] `RESEND_WEBHOOK_SECRET` = `whsec_...` 추가 (선택사항)
- [ ] Vercel 재배포 완료
- [ ] Deployment Status: Ready

### Resend Webhook
- [ ] Webhook URL 등록: `https://glec-website.vercel.app/api/webhooks/resend`
- [ ] Events 선택:
  - [ ] email.delivered
  - [ ] email.opened (**필수**)
  - [ ] email.clicked (**필수**)
  - [ ] email.bounced
  - [ ] email.complained
- [ ] Webhook Status: Active
- [ ] Test webhook: 200 OK

### Verification
- [ ] Test email 전송: `node test-library-production.js`
- [ ] Email 수신 확인
- [ ] Email 열람
- [ ] Download 링크 클릭
- [ ] Admin UI에서 tracking indicators 확인:
  - [ ] 👁️ Email Opened
  - [ ] ⬇️ Download Clicked
- [ ] Lead score 업데이트 확인 (70 → 90-100)

---

## 🎯 Expected Results

### Before Webhook Setup
```
Lead ID: 38bdcdd9-a0bb-44da-a202-c8f3ae694216
email_sent: TRUE
email_opened: FALSE
email_opened_at: NULL
download_link_clicked: FALSE
download_link_clicked_at: NULL
lead_score: 70
```

### After Webhook Setup (User opened email and clicked link)
```
Lead ID: 38bdcdd9-a0bb-44da-a202-c8f3ae694216
email_sent: TRUE
email_opened: TRUE ← Updated by webhook
email_opened_at: 2025-10-12 00:30:15 ← Updated by webhook
download_link_clicked: TRUE ← Updated by webhook
download_link_clicked_at: 2025-10-12 00:31:42 ← Updated by webhook
lead_score: 100 ← Recalculated (70 + 10 + 20)
```

---

## 📞 Support Resources

### Resend
- Dashboard: https://resend.com/dashboard
- Webhooks: https://resend.com/webhooks
- Webhook Docs: https://resend.com/docs/dashboard/webhooks/introduction
- Support: support@resend.com

### Vercel
- Dashboard: https://vercel.com/dashboard
- Environment Variables: https://vercel.com/glecdev/glec-website/settings/environment-variables
- Logs: https://vercel.com/glecdev/glec-website/logs
- Support: https://vercel.com/support

### GLEC Project
- Webhook Endpoint: https://glec-website.vercel.app/api/webhooks/resend
- Admin UI: https://glec-website.vercel.app/admin
- Repository: https://github.com/glecdev/glec-website

---

**최종 업데이트**: 2025-10-12
**Webhook Endpoint**: https://glec-website.vercel.app/api/webhooks/resend
**Status**: ✅ Implemented, ⏳ Awaiting configuration
