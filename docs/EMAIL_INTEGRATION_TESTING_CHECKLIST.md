# Email Integration Testing Checklist

> **Version**: 1.0.0
> **Date**: 2025-10-11
> **Purpose**: Manual testing guide for Library Download System email integration

---

## 📋 Prerequisites

### Environment Setup
- [ ] Production URL: https://glec-website.vercel.app
- [ ] Resend Account: https://resend.com/dashboard
- [ ] Resend API Key: Configured in Vercel env
- [ ] Resend Webhook: Configured (see RESEND_WEBHOOK_SETUP.md)
- [ ] Test Email: Accessible email address for testing

### Database Verification
- [ ] Migration 007 executed successfully
- [ ] Tables: `library_items`, `library_leads` exist
- [ ] Seed data: At least 1 PUBLISHED library item

---

## 🧪 Test Scenarios

### Scenario 1: Normal Download Request Flow

**Test ID**: EMAIL-001
**Priority**: P0 (Critical)

#### Steps:
1. Navigate to https://glec-website.vercel.app/library
2. Find a published library item (e.g., "GLEC Framework v3.0")
3. Click "다운로드 요청" button
4. Fill out the form:
   - Company Name: `Test Company`
   - Contact Name: `John Doe`
   - Email: `your-test-email@example.com`
   - Phone: `010-1234-5678`
   - Industry: `Manufacturing`
   - Job Title: `Engineer`
5. Click "제출" button

#### Expected Results:
- [ ] ✅ Form submission succeeds (200 OK)
- [ ] ✅ Success message displayed: "다운로드 링크가 이메일로 전송되었습니다"
- [ ] ✅ Email received within 30 seconds
- [ ] ✅ Email subject: "GLEC Framework v3.0 다운로드 링크"
- [ ] ✅ Email contains:
  - Company name: "Test Company"
  - Contact name: "John Doe"
  - Download button/link
  - GLEC branding
  - Unsubscribe link
- [ ] ✅ Email from: `noreply@glec.io`

#### Admin Verification:
1. Login to Admin: https://glec-website.vercel.app/admin/login
2. Navigate to: 리드 관리 (Customer Leads)
3. Find the test lead by email: `your-test-email@example.com`

- [ ] ✅ Lead created with status: `NEW`
- [ ] ✅ `email_sent`: `true`
- [ ] ✅ `email_id`: Present (Resend email ID)
- [ ] ✅ `download_token`: Present (32-char hex)
- [ ] ✅ `lead_score`: 5 (form submitted)

---

### Scenario 2: Email Open Tracking

**Test ID**: EMAIL-002
**Priority**: P0 (Critical)

#### Steps:
1. Open the email from Scenario 1
2. Wait 10 seconds for tracking pixel to load
3. Check Admin Dashboard → 리드 관리

#### Expected Results:
- [ ] ✅ `email_opened`: `true`
- [ ] ✅ `lead_status`: `OPENED`
- [ ] ✅ `lead_score`: Increased by 10 (now 15)
- [ ] ✅ Email indicator: 👁️ displayed in Admin UI

#### Resend Dashboard Verification:
1. Login to Resend Dashboard
2. Navigate to: Emails → Recent Deliveries
3. Find the test email

- [ ] ✅ Status: `Delivered`
- [ ] ✅ Opened: `Yes`
- [ ] ✅ Opened At: Timestamp present

---

### Scenario 3: Download Link Click Tracking

**Test ID**: EMAIL-003
**Priority**: P0 (Critical)

#### Steps:
1. In the email from Scenario 1, click the download button/link
2. Wait for redirect
3. Check Admin Dashboard → 리드 관리

#### Expected Results:
- [ ] ✅ Download initiated (file download or redirect to file_url)
- [ ] ✅ `download_link_clicked`: `true`
- [ ] ✅ `lead_status`: `DOWNLOADED`
- [ ] ✅ `lead_score`: Increased by 20 (now 35)
- [ ] ✅ Download indicator: ⬇️ displayed in Admin UI

#### Resend Dashboard Verification:
- [ ] ✅ Clicked: `Yes`
- [ ] ✅ Clicked At: Timestamp present
- [ ] ✅ Link: Matches download URL pattern

---

### Scenario 4: Duplicate Request Prevention

**Test ID**: EMAIL-004
**Priority**: P1 (High)

#### Steps:
1. Submit the same form twice within 5 minutes
   - Use the same email and library_item_id

#### Expected Results:
- [ ] ✅ First request: Succeeds (200 OK)
- [ ] ✅ Second request: Blocked (429 Too Many Requests)
- [ ] ✅ Error message: "이미 다운로드 요청이 처리되었습니다. 잠시 후 다시 시도해주세요."
- [ ] ✅ Only 1 lead created in database

---

### Scenario 5: Invalid Email Validation

**Test ID**: EMAIL-005
**Priority**: P1 (High)

#### Steps:
1. Submit form with invalid email addresses:
   - `invalid-email`
   - `test@`
   - `@example.com`
   - `test..test@example.com`

#### Expected Results:
- [ ] ✅ Form submission fails (400 Bad Request)
- [ ] ✅ Error message: "유효한 이메일 주소를 입력해주세요"
- [ ] ✅ No lead created
- [ ] ✅ No email sent

---

### Scenario 6: Missing Required Fields

**Test ID**: EMAIL-006
**Priority**: P1 (High)

#### Steps:
1. Submit form with missing fields:
   - Empty company_name
   - Empty contact_name
   - Empty email

#### Expected Results:
- [ ] ✅ Form submission fails (400 Bad Request)
- [ ] ✅ Error messages displayed for each missing field
- [ ] ✅ No lead created
- [ ] ✅ No email sent

---

### Scenario 7: SQL Injection Prevention

**Test ID**: EMAIL-007
**Priority**: P0 (Critical - Security)

#### Steps:
1. Submit form with SQL injection attempts:
   - Email: `test@example.com'; DROP TABLE library_leads;--`
   - Company Name: `Test' OR '1'='1`
   - Contact Name: `'; DELETE FROM library_items;--`

#### Expected Results:
- [ ] ✅ Request rejected (400 Bad Request)
- [ ] ✅ Zod validation fails on email format
- [ ] ✅ No SQL executed
- [ ] ✅ Database tables intact

---

### Scenario 8: XSS Prevention

**Test ID**: EMAIL-008
**Priority**: P0 (Critical - Security)

#### Steps:
1. Submit form with XSS attempts:
   - Company Name: `<script>alert("XSS")</script>`
   - Contact Name: `<img src=x onerror=alert(1)>`

#### Expected Results:
- [ ] ✅ Form submits successfully
- [ ] ✅ Email received
- [ ] ✅ Email HTML does NOT contain `<script>` tags
- [ ] ✅ Data is HTML-escaped in email template
- [ ] ✅ Admin UI displays sanitized data

---

### Scenario 9: Expired Token (24h)

**Test ID**: EMAIL-009
**Priority**: P2 (Medium)

#### Steps:
1. Create a lead with old created_at timestamp (manual DB update):
   ```sql
   UPDATE library_leads
   SET created_at = NOW() - INTERVAL '25 hours'
   WHERE email = 'test@example.com';
   ```
2. Click the download link in the email

#### Expected Results:
- [ ] ✅ Error page: "다운로드 링크가 만료되었습니다"
- [ ] ✅ HTTP 404 or 410 status
- [ ] ✅ Re-request option available

---

### Scenario 10: Email Bounced

**Test ID**: EMAIL-010
**Priority**: P2 (Medium)

#### Steps:
1. Submit form with bounced email address:
   - Use Resend test bounced address: `bounce@simulator.amazonses.com`
2. Wait for webhook: `email.bounced`

#### Expected Results:
- [ ] ✅ Email sent (200 OK)
- [ ] ✅ Webhook received: `email.bounced`
- [ ] ✅ Admin UI indicator: ⚠️ Bounced
- [ ] ✅ `lead_status`: `BOUNCED` or similar

---

### Scenario 11: Webhook Signature Verification

**Test ID**: EMAIL-011
**Priority**: P0 (Critical - Security)

#### Steps:
1. Send a webhook request with invalid signature:
   ```bash
   curl -X POST https://glec-website.vercel.app/api/webhooks/resend \
     -H "Content-Type: application/json" \
     -H "svix-id: msg_test" \
     -H "svix-timestamp: $(date +%s)" \
     -H "svix-signature: invalid-signature" \
     -d '{"type":"email.sent","created_at":"2025-10-11T12:00:00Z","data":{"email_id":"re_test"}}'
   ```

#### Expected Results:
- [ ] ✅ Request rejected (401 Unauthorized)
- [ ] ✅ Error: "Invalid webhook signature"
- [ ] ✅ No database update

---

### Scenario 12: Concurrent Requests (Load Test)

**Test ID**: EMAIL-012
**Priority**: P2 (Medium)

#### Steps:
1. Use a load testing tool (k6, Artillery, or manual scripts)
2. Send 100 concurrent download requests
3. Monitor Vercel logs and Neon metrics

#### Expected Results:
- [ ] ✅ 95%+ success rate
- [ ] ✅ Response time < 2 seconds (p95)
- [ ] ✅ No database connection errors
- [ ] ✅ All emails sent successfully

---

### Scenario 13: Email Template Rendering

**Test ID**: EMAIL-013
**Priority**: P1 (High)

#### Steps:
1. Inspect the email HTML source
2. Check all variables are rendered correctly
3. Test on multiple email clients:
   - Gmail (web)
   - Outlook (web)
   - Apple Mail
   - Mobile Gmail (iOS/Android)

#### Expected Results:
- [ ] ✅ Company name rendered: "Test Company"
- [ ] ✅ Contact name rendered: "John Doe"
- [ ] ✅ Download button is clickable
- [ ] ✅ GLEC logo displayed
- [ ] ✅ Responsive design works on mobile
- [ ] ✅ All links are absolute URLs
- [ ] ✅ Unsubscribe link present and functional

---

### Scenario 14: Admin Filters & Search

**Test ID**: EMAIL-014
**Priority**: P1 (High)

#### Steps:
1. Create 10+ test leads with various statuses
2. Navigate to Admin → 리드 관리
3. Test all filters:
   - Lead Status: NEW, OPENED, DOWNLOADED, BOUNCED
   - Library Item: Filter by specific item
   - Search: Company name, contact name, email

#### Expected Results:
- [ ] ✅ Status filter works correctly
- [ ] ✅ Library item filter works correctly
- [ ] ✅ Search works for all 3 fields
- [ ] ✅ Pagination works (20 items/page)
- [ ] ✅ Results update without page reload

---

### Scenario 15: Admin Lead Details

**Test ID**: EMAIL-015
**Priority**: P2 (Medium)

#### Steps:
1. Click on a lead in Admin → 리드 관리
2. View full lead details

#### Expected Results:
- [ ] ✅ All fields displayed correctly
- [ ] ✅ Email tracking indicators visible
- [ ] ✅ Lead score displayed
- [ ] ✅ Created/Updated timestamps
- [ ] ✅ Associated library item title + link

---

## 🔍 Monitoring & Logs

### Vercel Logs
```bash
# View production logs
npx vercel logs glec-website --token=YOUR_TOKEN

# Filter by webhook endpoint
npx vercel logs glec-website --token=YOUR_TOKEN | grep '/api/webhooks/resend'
```

#### Check for:
- [ ] ✅ No 500 errors
- [ ] ✅ All webhook requests return 200
- [ ] ✅ Email sending logs present

### Neon Database
```sql
-- Check lead creation
SELECT COUNT(*) as total_leads FROM library_leads;

-- Check email tracking stats
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN email_sent THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN email_opened THEN 1 ELSE 0 END) as opened,
  SUM(CASE WHEN download_link_clicked THEN 1 ELSE 0 END) as clicked
FROM library_leads;

-- Check email open rate
SELECT
  ROUND(100.0 * SUM(CASE WHEN email_opened THEN 1 ELSE 0 END) /
        NULLIF(SUM(CASE WHEN email_sent THEN 1 ELSE 0 END), 0), 2) as open_rate
FROM library_leads;

-- Check click-through rate
SELECT
  ROUND(100.0 * SUM(CASE WHEN download_link_clicked THEN 1 ELSE 0 END) /
        NULLIF(SUM(CASE WHEN email_opened THEN 1 ELSE 0 END), 0), 2) as click_rate
FROM library_leads;
```

### Resend Dashboard
- [ ] ✅ All emails delivered (no bounces)
- [ ] ✅ Open rate > 20% (industry average)
- [ ] ✅ Click rate > 5% (industry average)
- [ ] ✅ No spam complaints

---

## 📊 Success Metrics

### Functional Requirements
- [ ] ✅ Email delivery rate: 99%+
- [ ] ✅ Email send time: < 5 seconds
- [ ] ✅ Webhook processing: < 100ms
- [ ] ✅ Download link expiration: 24 hours
- [ ] ✅ Duplicate prevention: 5 minutes

### Non-Functional Requirements
- [ ] ✅ Security: No SQL injection, XSS, or CSRF vulnerabilities
- [ ] ✅ Performance: 95%+ success rate under load
- [ ] ✅ Reliability: No data loss, all webhooks processed
- [ ] ✅ Compliance: Unsubscribe link present, GDPR ready

---

## 🐛 Known Issues

### P2 Issues
1. **Email delay during high traffic**: Resend may queue emails during peak times
   - Workaround: Monitor Resend dashboard for delivery status

2. **Mobile email rendering**: Some email clients strip CSS
   - Workaround: Use inline styles and table-based layouts

### P3 Issues
1. **Test email spam filtering**: Some providers mark test emails as spam
   - Workaround: Whitelist `noreply@glec.io` in test email account

---

## ✅ Final Checklist

Before marking Email Integration as complete:

- [ ] All P0 tests passed
- [ ] All P1 tests passed
- [ ] Security tests passed (SQL injection, XSS, webhook signature)
- [ ] Load test completed (100+ concurrent requests)
- [ ] Email templates tested on 3+ email clients
- [ ] Webhook configured in Resend Dashboard
- [ ] Production logs show no errors
- [ ] Database metrics look healthy
- [ ] Documentation updated (RESEND_WEBHOOK_SETUP.md)

---

**Testing Completed By**: _____________
**Date**: _____________
**Sign-Off**: _____________

---

**Version History**:
- v1.0.0 (2025-10-11): Initial checklist created
