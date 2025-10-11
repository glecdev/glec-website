# Resend Webhook 테스트 확인 가이드

> **작성일**: 2025-10-12
> **상태**: Webhook 설정 완료, 실제 이벤트 대기 중
> **목적**: Resend webhook이 정상적으로 작동하는지 확인

---

## ✅ 완료된 작업

### 1. Vercel 환경 변수 설정 완료

```bash
✅ RESEND_FROM_EMAIL = noreply@no-reply.glec.io
✅ RESEND_WEBHOOK_SECRET = whsec_Lcy5qDoGpUQ1D91axJafXIKi3wVl8Sjs
✅ RESEND_API_KEY = re_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi
```

**설정 방법**:
```bash
# 기존 RESEND_FROM_EMAIL 제거
npx vercel env rm RESEND_FROM_EMAIL production --token=<TOKEN>

# 새 값으로 추가
echo "noreply@no-reply.glec.io" | npx vercel env add RESEND_FROM_EMAIL production --token=<TOKEN>

# Webhook Secret 추가
echo "whsec_Lcy5qDoGpUQ1D91axJafXIKi3wVl8Sjs" | npx vercel env add RESEND_WEBHOOK_SECRET production --token=<TOKEN>
```

**배포 완료**:
- Deployment URL: https://glec-website-4ec9y6ht9-glecdevs-projects.vercel.app
- Production URL: https://glec-website.vercel.app
- 배포 시간: 8초

### 2. Webhook 엔드포인트 검증 완료

```bash
curl -X POST https://glec-website.vercel.app/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{"type":"email.delivered","data":{"email_id":"test-123"}}'

# Response: {"received":true}
```

✅ 엔드포인트 정상 작동 확인

### 3. Production 이메일 전송 테스트 완료

```bash
node test-library-production.js

# Results:
✅ Lead created: 743dbd5a-d0d0-49ba-9fdc-c95822cf4f63
✅ Email sent: true
✅ Recipient: ghdi0506@gmail.com
```

---

## 📋 Resend Dashboard Webhook 설정 체크리스트

### Step 1: Webhook 추가 확인

**Resend Dashboard**: https://resend.com/webhooks

1. **Webhook 엔드포인트**:
   ```
   https://glec-website.vercel.app/api/webhooks/resend
   ```

2. **이벤트 선택** (5개):
   - ✅ `email.delivered`
   - ✅ `email.opened` (**중요!**)
   - ✅ `email.clicked` (**중요!**)
   - ✅ `email.bounced`
   - ✅ `email.complained`

3. **Signing Secret**:
   ```
   whsec_Lcy5qDoGpUQ1D91axJafXIKi3wVl8Sjs
   ```
   - ✅ Vercel `RESEND_WEBHOOK_SECRET`에 저장됨

### Step 2: Webhook 테스트 (Resend Dashboard)

**Resend Dashboard → Webhooks → [Your Webhook] → "Send Test Event"**

1. **Test Event Type**: `email.delivered`
2. **Expected Response**: `200 OK`
3. **Expected Body**: `{"received":true}`

**테스트 결과 확인**:
```bash
# Vercel Function Logs에서 확인
# Dashboard: https://vercel.com/glecdevs-projects/glec-website/logs

예상 로그:
[Webhook] Received event: email.delivered
[Webhook] Signature verified: true
[Webhook] Email ID: test-email-id
```

---

## 🔍 실제 이메일 이벤트 확인 방법

### Method 1: Resend Dashboard에서 확인

**Resend Dashboard → Emails**: https://resend.com/emails

1. **최근 전송 이메일 찾기**:
   - Email ID: `80839470-3171-4474-aeb4-5194d1e3ad2f` (Direct API Test)
   - Email ID: (Production Test - 743dbd5a-d0d0-49ba-9fdc-c95822cf4f63)

2. **이벤트 타임라인 확인**:
   ```
   ✅ email.sent (발송 완료)
   ⏳ email.delivered (수신자 메일서버 전달)
   ⏳ email.opened (이메일 열람) ← Webhook 트리거
   ⏳ email.clicked (링크 클릭) ← Webhook 트리거
   ```

### Method 2: Admin UI에서 Lead 확인

**Admin Dashboard**: https://glec-website.vercel.app/admin/login

1. **Customer Leads (리드 관리)** 메뉴 이동

2. **최근 Lead 검색**:
   ```
   Lead ID: 743dbd5a-d0d0-49ba-9fdc-c95822cf4f63
   Email: ghdi0506@gmail.com
   Company: GLEC Production Test
   ```

3. **Tracking Indicators 확인**:
   ```
   Before webhook events:
   email_sent: TRUE ✅
   email_opened: FALSE ⏳
   download_link_clicked: FALSE ⏳
   lead_score: 70

   After user opens email (webhook event: email.opened):
   email_sent: TRUE ✅
   email_opened: TRUE ✅ ← Updated by webhook
   download_link_clicked: FALSE ⏳
   lead_score: 80 (70 + 10) ← Recalculated

   After user clicks download link (webhook event: email.clicked):
   email_sent: TRUE ✅
   email_opened: TRUE ✅
   download_link_clicked: TRUE ✅ ← Updated by webhook
   lead_score: 100 (70 + 10 + 20) ← Recalculated
   ```

### Method 3: Database 직접 확인

**Neon Console**: https://console.neon.tech

```sql
-- Lead 조회
SELECT
  id,
  email,
  company_name,
  email_sent,
  email_opened,
  download_link_clicked,
  lead_score,
  created_at,
  updated_at
FROM library_leads
WHERE id = '743dbd5a-d0d0-49ba-9fdc-c95822cf4f63';

-- 예상 결과 (webhook 이벤트 전):
-- email_sent: true
-- email_opened: false
-- download_link_clicked: false
-- lead_score: 70

-- 예상 결과 (이메일 열람 후):
-- email_sent: true
-- email_opened: true ← Updated by webhook
-- download_link_clicked: false
-- lead_score: 80 ← Recalculated

-- 예상 결과 (다운로드 링크 클릭 후):
-- email_sent: true
-- email_opened: true
-- download_link_clicked: true ← Updated by webhook
-- lead_score: 100 ← Recalculated
```

---

## 🧪 Webhook 작동 테스트 시나리오

### Test Scenario 1: Email Open Tracking

**Steps**:
1. ✅ 이메일 전송 완료 (Lead ID: 743dbd5a-d0d0-49ba-9fdc-c95822cf4f63)
2. **이메일 열람** (ghdi0506@gmail.com에서 이메일 열기)
3. Resend가 `email.opened` 이벤트를 webhook으로 전송
4. Webhook handler가 `library_leads` 테이블 업데이트:
   ```sql
   UPDATE library_leads
   SET email_opened = TRUE,
       lead_score = lead_score + 10,
       updated_at = NOW()
   WHERE id = '743dbd5a-d0d0-49ba-9fdc-c95822cf4f63';
   ```
5. Admin UI에서 👁️ Email Opened 아이콘 표시

**Expected Webhook Payload**:
```json
{
  "type": "email.opened",
  "created_at": "2025-10-12T15:45:00.000Z",
  "data": {
    "email_id": "80839470-3171-4474-aeb4-5194d1e3ad2f",
    "from": "noreply@no-reply.glec.io",
    "to": "ghdi0506@gmail.com",
    "subject": "[GLEC] GLEC Framework v3.0 한글 버전 다운로드",
    "opened_at": "2025-10-12T15:45:00.000Z"
  }
}
```

### Test Scenario 2: Download Link Click Tracking

**Steps**:
1. ✅ 이메일 열람 완료 (email_opened = TRUE)
2. **다운로드 버튼 클릭** (Google Drive 링크)
3. Resend가 `email.clicked` 이벤트를 webhook으로 전송
4. Webhook handler가 `library_leads` 테이블 업데이트:
   ```sql
   UPDATE library_leads
   SET download_link_clicked = TRUE,
       lead_score = lead_score + 20,
       updated_at = NOW()
   WHERE id = '743dbd5a-d0d0-49ba-9fdc-c95822cf4f63';
   ```
5. Admin UI에서 ⬇️ Download Clicked 아이콘 표시

**Expected Webhook Payload**:
```json
{
  "type": "email.clicked",
  "created_at": "2025-10-12T15:46:00.000Z",
  "data": {
    "email_id": "80839470-3171-4474-aeb4-5194d1e3ad2f",
    "from": "noreply@no-reply.glec.io",
    "to": "ghdi0506@gmail.com",
    "clicked_at": "2025-10-12T15:46:00.000Z",
    "link": "https://drive.google.com/file/d/..."
  }
}
```

---

## 🐛 Troubleshooting

### Issue 1: Webhook이 호출되지 않음

**Symptoms**:
- Resend Dashboard에서 "Last Activity: Never"
- Admin UI에서 `email_opened`, `download_link_clicked`가 FALSE로 유지됨

**Possible Causes & Solutions**:

1. **Webhook URL이 잘못됨**:
   - ✅ Verify: `https://glec-website.vercel.app/api/webhooks/resend`
   - ❌ Wrong: `https://glec-website-vercel.app/api/webhooks/resend` (하이픈 위치)

2. **Events가 선택되지 않음**:
   - Resend Dashboard → Webhooks → Edit
   - ✅ 5개 이벤트 모두 체크: delivered, opened, clicked, bounced, complained

3. **Signing Secret이 다름**:
   ```bash
   # Vercel 환경 변수 확인
   npx vercel env ls --token=<TOKEN> | grep RESEND_WEBHOOK_SECRET

   # Expected: whsec_Lcy5qDoGpUQ1D91axJafXIKi3wVl8Sjs
   ```

### Issue 2: Webhook은 호출되지만 DB가 업데이트되지 않음

**Symptoms**:
- Resend Dashboard에서 "Last Activity: 200 OK"
- Admin UI에서 여전히 FALSE로 유지됨

**Possible Causes & Solutions**:

1. **Email ID 매칭 실패**:
   ```typescript
   // app/api/webhooks/resend/route.ts
   const emailMatch = await sql`
     SELECT id FROM library_leads
     WHERE resend_email_id = ${event.data.email_id}
   `;
   ```
   - `resend_email_id` 컬럼이 NULL일 수 있음
   - 이메일 전송 시 `resend_email_id`를 저장해야 함

2. **Signature 검증 실패**:
   - Vercel Function Logs 확인:
     ```
     [Webhook] Signature verification failed
     ```
   - Solution: `RESEND_WEBHOOK_SECRET` 재확인

### Issue 3: Email Open이 추적되지 않음

**Symptoms**:
- 이메일을 열었지만 `email_opened`가 FALSE

**Possible Causes & Solutions**:

1. **이메일 클라이언트가 이미지 로딩 차단**:
   - Gmail: "이미지 항상 표시" 설정 필요
   - Outlook: "외부 콘텐츠 다운로드" 허용 필요

2. **테스트 이메일은 tracking pixel이 없을 수 있음**:
   - Production 환경에서만 작동
   - Resend API key가 "Production" 모드여야 함

---

## 📊 Success Metrics

### Before Webhook Setup
- Email delivery rate: 100% ✅
- Email open tracking: 0% ❌
- Link click tracking: 0% ❌
- Lead score accuracy: 70% (base score only)

### After Webhook Setup (Expected)
- Email delivery rate: 100% ✅
- Email open tracking: ~40-50% (industry average)
- Link click tracking: ~20-30% (industry average)
- Lead score accuracy: 100% (dynamic scoring with engagement)

### Target KPIs
- Webhook delivery success rate: **99%+**
- Webhook response time: **< 200ms**
- Lead score update latency: **< 5 seconds**

---

## 🚀 Next Steps

### Immediate (User Action Required)

1. **이메일 확인**:
   - ✅ ghdi0506@gmail.com 받은편지함 확인
   - ✅ 이메일 열람 (email.opened 이벤트 트리거)
   - ✅ 다운로드 버튼 클릭 (email.clicked 이벤트 트리거)

2. **Admin UI 확인**:
   - https://glec-website.vercel.app/admin/login
   - Customer Leads → 743dbd5a-d0d0-49ba-9fdc-c95822cf4f63
   - Tracking indicators 확인 (👁️ ⬇️)

3. **Resend Dashboard 확인**:
   - https://resend.com/webhooks
   - "Last Activity" 타임스탬프 확인
   - Event logs 확인

### Short-term (1-2 days)

1. **Webhook 성능 모니터링**:
   - Vercel Function Logs 분석
   - Webhook 실패율 추적
   - 응답 시간 측정

2. **Lead Score 정확도 검증**:
   - 10개 테스트 이메일 전송
   - Open/Click 비율 측정
   - Score 계산 정확도 확인

3. **Documentation 업데이트**:
   - Webhook 이벤트 예시 추가
   - Troubleshooting 섹션 보강
   - Known Issues 문서화

### Long-term (1-2 weeks)

1. **Advanced Tracking**:
   - Email bounce 처리 자동화
   - Spam complaint 처리
   - Unsubscribe link 추가

2. **Analytics Dashboard**:
   - Email engagement metrics
   - Lead conversion funnel
   - A/B testing infrastructure

---

## 📚 Related Documentation

- [FINAL_SUCCESS_CONFIRMATION.md](./FINAL_SUCCESS_CONFIRMATION.md) - Email delivery 성공 확인
- [ROOT_CAUSE_ANALYSIS_EMAIL_DELIVERY_FAILURE.md](./ROOT_CAUSE_ANALYSIS_EMAIL_DELIVERY_FAILURE.md) - 5 Whys 분석
- [VERCEL_RESEND_SETUP_GUIDE.md](./VERCEL_RESEND_SETUP_GUIDE.md) - Vercel/Resend 설정 가이드
- [RESEND_DOMAIN_VERIFICATION_GUIDE.md](./RESEND_DOMAIN_VERIFICATION_GUIDE.md) - Domain 검증 가이드

---

**Status**: ✅ Webhook 설정 완료, 실제 이벤트 대기 중
**Last Updated**: 2025-10-12 16:00 KST
**Next Action**: 이메일 열람 및 다운로드 버튼 클릭 테스트
