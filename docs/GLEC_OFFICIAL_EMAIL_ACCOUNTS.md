# GLEC 공식 이메일 계정 정보

> **Last Updated**: 2025-10-12
> **Purpose**: GLEC 공식 이메일 계정 및 사용 목적 정리

---

## 📧 공식 이메일 계정

### 1. Primary Official Account (실제 사용 중)

```
Email: oillex.co.kr@gmail.com
Purpose: GLEC 공식 업무용 계정
Status: ✅ ACTIVE (실제 사용 중)
Usage:
  - 고객 문의 수신
  - 공식 커뮤니케이션
  - 관리자 계정
  - 테스트 이메일 수신
```

**중요**: `oillex.co.kr@gmail.com`이 실제로 사용되는 공식 계정입니다.

### 2. Admin Account (설계상 공식 계정)

```
Email: admin@glec.io
Purpose: 시스템 설계상 관리자 계정
Status: ⚠️ INACTIVE (실제 사용 안 함)
Usage:
  - 데이터베이스 관리자 계정으로 설정됨
  - 실제 이메일 수신 불가
  - 시스템 내부 참조용
```

### 3. No-Reply Account (발신 전용)

```
Email: noreply@no-reply.glec.io
Purpose: 시스템 자동 이메일 발신
Status: ✅ ACTIVE (Resend 도메인 인증 완료)
Usage:
  - Library 다운로드 이메일 발신
  - Contact Form 자동 응답
  - Newsletter 발송
  - 알림 이메일 발송
Note: 수신 불가 (발신 전용)
```

### 4. Contact Account (Contact Form 수신)

```
Email: contact@glec.io
Purpose: Contact Form 문의 수신
Status: ⚠️ 확인 필요
Current Implementation:
  - Contact Form에서 이 주소로 이메일 전송
  - 실제 수신 가능 여부 미확인
Recommended Action:
  - oillex.co.kr@gmail.com으로 포워딩 설정
  - 또는 Resend에서 수신 설정
```

---

## 🔄 Email Flow

### Library Download Email Flow

```
User submits form
  ↓
POST /api/library/download
  ↓
Send email via Resend
  FROM: noreply@no-reply.glec.io
  TO: user.email (e.g., ghdi0506@gmail.com)
  ↓
User receives download link
```

### Contact Form Email Flow

```
User submits contact form
  ↓
POST /api/contact
  ↓
Send email via Resend
  FROM: noreply@no-reply.glec.io
  TO: contact@glec.io ⚠️ (수신 가능 여부 미확인)
  ↓
??? Should forward to oillex.co.kr@gmail.com
```

---

## 🐛 Current Issue: 번역본 이메일 미수신

### Issue Details

**Date**: 2025-10-12
**Reporter**: User
**Symptom**: "번역본이 첨부된 메일이 오지 않았어"

**Expected Behavior**:
- Library download email with 번역본 (Korean translation) attachment
- Recipient: (확인 필요 - oillex.co.kr@gmail.com?)

**Actual Behavior**:
- Email not received

### Possible Root Causes

1. **Wrong Recipient Email**:
   - Email sent to: `admin@glec.io` (inactive)
   - Should send to: `oillex.co.kr@gmail.com` (active)

2. **Email Not Sent**:
   - API error not caught
   - Resend API failure

3. **Email Sent But Not Delivered**:
   - Spam filter
   - Resend delivery failure
   - Domain verification issue

4. **Attachment Issue**:
   - Attachment too large
   - File type blocked
   - Encoding issue

---

## 🔍 Investigation Steps

### Step 1: Check Recent Email Logs

```bash
# Check Resend Dashboard
# https://resend.com/emails

# Filter by:
- Date: 2025-10-12
- Recipient: oillex.co.kr@gmail.com OR admin@glec.io
- Subject: Contains "번역본" OR "다운로드"
```

### Step 2: Verify Database Records

```sql
-- Check recent library leads
SELECT
  id,
  email,
  company_name,
  email_sent,
  resend_email_id,
  created_at
FROM library_leads
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC
LIMIT 10;

-- Check for oillex.co.kr@gmail.com
SELECT *
FROM library_leads
WHERE email = 'oillex.co.kr@gmail.com'
ORDER BY created_at DESC
LIMIT 5;
```

### Step 3: Test Email Sending

```bash
# Test with official email
cd glec-website
node test-resend-api-directly.js

# Update TEST_EMAIL to:
# const TEST_EMAIL = 'oillex.co.kr@gmail.com';
```

---

## 🛠️ Recommended Fixes

### Fix 1: Update Admin Email to Official Account

**File**: `glec-website/.env.local`

```bash
# BEFORE:
ADMIN_EMAIL="admin@glec.io"

# AFTER:
ADMIN_EMAIL="oillex.co.kr@gmail.com"
```

**Files to Update**:
1. `.env.local` (development)
2. Vercel environment variables (production)
3. Any code that references `admin@glec.io`

### Fix 2: Setup Email Forwarding

**Option A: Cloudflare Email Routing** (Recommended)

```yaml
Setup:
  1. Cloudflare Dashboard → Email Routing
  2. Add routing rule:
     - Source: admin@glec.io
     - Destination: oillex.co.kr@gmail.com
  3. Add routing rule:
     - Source: contact@glec.io
     - Destination: oillex.co.kr@gmail.com
```

**Option B: Resend Inbound** (Paid feature)

```yaml
Setup:
  1. Resend Dashboard → Inbound
  2. Configure forwarding:
     - admin@glec.io → oillex.co.kr@gmail.com
     - contact@glec.io → oillex.co.kr@gmail.com
```

### Fix 3: Update Contact Form Recipient

**File**: `glec-website/app/api/contact/route.ts`

Find email sending code and update recipient:

```typescript
// BEFORE:
to: 'contact@glec.io'

// AFTER:
to: process.env.ADMIN_EMAIL || 'oillex.co.kr@gmail.com'
```

---

## 📋 Action Items

### Immediate (P0 - Critical)

- [ ] **Investigate 번역본 email issue**:
  - Check Resend email logs (last 2 hours)
  - Verify database records
  - Identify recipient email used

- [ ] **Test email to oillex.co.kr@gmail.com**:
  - Update test script
  - Send test email
  - Verify receipt

### Short-term (P1 - High)

- [ ] **Update ADMIN_EMAIL environment variable**:
  - `.env.local`: oillex.co.kr@gmail.com
  - Vercel production: oillex.co.kr@gmail.com
  - Redeploy application

- [ ] **Setup email forwarding**:
  - Cloudflare Email Routing:
    - admin@glec.io → oillex.co.kr@gmail.com
    - contact@glec.io → oillex.co.kr@gmail.com

- [ ] **Update Contact Form**:
  - Change recipient to use ADMIN_EMAIL env var
  - Test contact form submission
  - Verify email receipt at oillex.co.kr@gmail.com

### Long-term (P2 - Medium)

- [ ] **Consolidate email accounts**:
  - Document all email usage
  - Standardize on oillex.co.kr@gmail.com
  - Update all references

- [ ] **Setup professional email**:
  - Consider: admin@glec.io with real mailbox
  - Google Workspace or Microsoft 365
  - Professional branding

---

## 📚 Related Files

### Environment Variables

- `.env.local` (development)
- Vercel Dashboard (production)

### Email Sending Code

- `app/api/library/download/route.ts` (Library download emails)
- `app/api/contact/route.ts` (Contact form emails)
- `app/api/newsletter/subscribe/route.ts` (Newsletter emails)

### Configuration Files

- `VERCEL-ENV-VALUES.txt` (Environment variable reference)
- `RESEND_SETUP_REQUIRED_INFORMATION.md` (Resend setup)

---

## 🔗 External Resources

### Resend Dashboard
- **Emails**: https://resend.com/emails
- **Webhooks**: https://resend.com/webhooks
- **Domains**: https://resend.com/domains

### Cloudflare
- **Email Routing**: https://dash.cloudflare.com/email-routing
- **DNS Settings**: https://dash.cloudflare.com/dns

### Gmail
- **oillex.co.kr@gmail.com**: https://mail.google.com

---

## 📝 Notes

### Important Reminders

1. **oillex.co.kr@gmail.com is the PRIMARY official account**
   - All important emails should go here
   - User actively checks this account
   - Use this for all admin notifications

2. **admin@glec.io is currently INACTIVE**
   - No mailbox configured
   - Emails sent here are lost
   - Need to setup forwarding or real mailbox

3. **noreply@no-reply.glec.io is SEND-ONLY**
   - Resend verified domain
   - Cannot receive emails
   - Only for automated notifications

### Email Hygiene

- Always test new email features with oillex.co.kr@gmail.com
- Check spam folder if emails not received
- Monitor Resend Dashboard for delivery issues
- Keep ADMIN_EMAIL env var updated

---

**Status**: 📋 Documented official email accounts
**Next Action**: Investigate 번역본 email issue
**Priority**: P0 (Critical - user waiting for email)
