# Resend Webhook - Production Setup Guide

**Date**: 2025-10-17
**Status**: ⏳ Pending Configuration
**Priority**: P1 (High - Required for Email Tracking)

---

## 🎯 Overview

Resend webhook은 이메일 이벤트(sent, delivered, opened, clicked, bounced, complained)를 실시간으로 추적하여 다음 기능을 제공합니다:

1. **Email Delivery Tracking**: 이메일 전송/전달 상태 자동 업데이트
2. **User Engagement Tracking**: 이메일 오픈/클릭 이벤트로 리드 스코어 자동 조정
3. **Bounce & Complaint Handling**: 자동 블랙리스트 추가 및 향후 전송 차단
4. **Audit Trail**: 모든 웹훅 이벤트를 `email_webhook_events` 테이블에 저장

---

## 📋 Step-by-Step Setup (5 minutes)

### Step 1: Access Resend Dashboard

1. Go to https://resend.com/webhooks
2. Login with your Resend account credentials
3. Click **"+ Add Webhook"** button

### Step 2: Configure Webhook

**Webhook URL**:
```
https://glec-website.vercel.app/api/webhooks/resend
```

**Events to Subscribe** (Select ALL 7):
- ✅ `email.sent` - Email successfully sent from Resend
- ✅ `email.delivered` - Email delivered to recipient's inbox
- ✅ `email.delivery_delayed` - Email delivery delayed (retry pending)
- ✅ `email.opened` - Recipient opened the email (tracking pixel)
- ✅ `email.clicked` - Recipient clicked a link in the email
- ✅ `email.bounced` - Email bounced (hard/soft bounce)
- ✅ `email.complained` - Recipient marked email as spam

**Description** (Optional):
```
GLEC Website Email Tracking - Production
```

### Step 3: Copy Signing Secret

After creating the webhook, Resend will display a **Signing Secret**. This is a base64-encoded string used for HMAC signature verification.

**Example format**:
```
whsec_Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=
```

**⚠️ IMPORTANT**: Copy this secret immediately - Resend shows it only once!

### Step 4: Add Secret to Vercel Environment Variables

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables
2. Find existing `RESEND_WEBHOOK_SECRET` variable
3. Click **"Edit"** (pencil icon)
4. Paste the signing secret from Step 3
5. Ensure **Environment** is set to: `Production`, `Preview`, `Development`
6. Click **"Save"**
7. Vercel will automatically redeploy

#### Option B: Via Vercel CLI (Alternative)

```bash
# Interactive mode
npx vercel env add RESEND_WEBHOOK_SECRET production

# Paste the signing secret when prompted
# Example: whsec_Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=
```

**⚠️ URL Encoding Note**: Unlike `CRON_SECRET`, the webhook secret is passed via HTTP headers (`svix-signature`), NOT URL parameters, so URL encoding is NOT required.

### Step 5: Verify Webhook in Vercel Dashboard

1. Go to https://vercel.com/glecdevs-projects/glec-website/deployments
2. Wait for automatic redeployment to complete (~2 minutes)
3. Check deployment status: **● Ready**

---

## 🧪 Testing

### Test 1: Send Test Webhook from Resend

1. Go to https://resend.com/webhooks
2. Click on your webhook (https://glec-website.vercel.app/api/webhooks/resend)
3. Click **"Send Test Event"** button
4. Select event type: `email.sent`
5. Click **"Send"**

**Expected Result**:
- Status: `200 OK`
- Response: `{"success": true, "message": "Webhook processed"}`

### Test 2: Check Vercel Logs

```bash
# View real-time logs
npx vercel logs glec-website.vercel.app --token=4WjWFbv1BRjxABWdkzCI6jF0
```

**Expected Log Output**:
```
[Resend Webhook] Received event: email.sent
[Resend Webhook] Email ID: re_abc123xyz
[Resend Webhook] Event stored in email_webhook_events
[Resend Webhook] Contact email status updated to: sent
```

### Test 3: Verify Database Record

```bash
# Connect to Neon database
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const events = await sql\`
    SELECT * FROM email_webhook_events
    ORDER BY created_at DESC
    LIMIT 5
  \`;
  console.log(JSON.stringify(events, null, 2));
})();
"
```

**Expected Output**:
```json
[
  {
    "id": 1,
    "resend_email_id": "re_abc123xyz",
    "event_type": "email.sent",
    "payload": {...},
    "processed": true,
    "created_at": "2025-10-17T12:00:00.000Z"
  }
]
```

### Test 4: End-to-End Email Flow (Production)

```bash
# Trigger a real email by downloading a library item
curl -X POST https://glec-website.vercel.app/api/library/download \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "contact_name": "Test User",
    "company_name": "Test Company",
    "phone": "010-1234-5678",
    "library_item_id": 1,
    "privacy_consent": true,
    "marketing_consent": true
  }'
```

**Expected Flow**:
1. ✅ API returns `200 OK` with `library_lead` record
2. ✅ Email sent via Resend API (`email.sent` event)
3. ✅ Resend delivers email (`email.delivered` event)
4. ✅ Webhook updates `library_leads.email_status` to `delivered`
5. ✅ When user opens email → `email.opened` event → `email_opened = true`
6. ✅ When user clicks download link → `email.clicked` event → `download_link_clicked = true`
7. ✅ Lead score auto-updates based on engagement

---

## 🔐 Security Verification

The webhook endpoint (`/api/webhooks/resend`) implements **Svix signature verification** to prevent unauthorized requests.

### How Signature Verification Works

1. **Request Header**: Resend sends `svix-signature` header
   ```
   svix-signature: v1,t=1697540000,v1=base64_signature
   ```

2. **Signature Computation**:
   ```javascript
   const signedPayload = `${timestamp}.${rawBody}`;
   const expectedSig = crypto.createHmac('sha256', webhookSecret)
     .update(signedPayload)
     .digest('base64');
   ```

3. **Timing Attack Prevention**: Uses `crypto.timingSafeEqual()` for constant-time comparison

4. **Replay Attack Prevention**: Rejects signatures older than 5 minutes

### Manual Security Test

```bash
# Test with INVALID signature (should fail)
curl -X POST https://glec-website.vercel.app/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -H "svix-signature: v1,t=1697540000,v1=invalid_signature" \
  -d '{"type":"email.sent","data":{"email_id":"test"}}'
```

**Expected Response**: `401 Unauthorized - Invalid signature`

---

## 📊 Monitoring & Alerts

### Key Metrics to Monitor (Week 1)

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Webhook Success Rate | >99% | <95% |
| Signature Verification Failures | <1% | >5% |
| Email Bounce Rate | <5% | >10% |
| Email Complaint Rate | <0.1% | >1% |
| Database Insert Failures | 0% | >0.1% |

### Monitoring Queries

```sql
-- Webhook event distribution (last 24 hours)
SELECT
  event_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM email_webhook_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;

-- Email delivery funnel (last 7 days)
SELECT
  COUNT(DISTINCT CASE WHEN event_type = 'email.sent' THEN resend_email_id END) as sent,
  COUNT(DISTINCT CASE WHEN event_type = 'email.delivered' THEN resend_email_id END) as delivered,
  COUNT(DISTINCT CASE WHEN event_type = 'email.opened' THEN resend_email_id END) as opened,
  COUNT(DISTINCT CASE WHEN event_type = 'email.clicked' THEN resend_email_id END) as clicked,
  COUNT(DISTINCT CASE WHEN event_type = 'email.bounced' THEN resend_email_id END) as bounced,
  COUNT(DISTINCT CASE WHEN event_type = 'email.complained' THEN resend_email_id END) as complained
FROM email_webhook_events
WHERE created_at > NOW() - INTERVAL '7 days';

-- Failed webhook processing (errors)
SELECT
  resend_email_id,
  event_type,
  payload,
  created_at
FROM email_webhook_events
WHERE processed = FALSE
ORDER BY created_at DESC
LIMIT 20;

-- Blacklist additions from complaints
SELECT
  email,
  reason,
  blacklisted_at
FROM email_blacklist
ORDER BY blacklisted_at DESC
LIMIT 10;
```

### Automated Alerts (Future Enhancement)

**Option 1: Vercel Monitoring**
- Enable Vercel monitoring for `/api/webhooks/resend`
- Set alert for error rate >1%

**Option 2: Database Triggers**
```sql
-- Alert on high bounce rate (>10% in 1 hour)
CREATE OR REPLACE FUNCTION alert_high_bounce_rate()
RETURNS TRIGGER AS $$
DECLARE
  bounce_rate NUMERIC;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'email.bounced') * 100.0 /
    COUNT(*) FILTER (WHERE event_type = 'email.sent')
  INTO bounce_rate
  FROM email_webhook_events
  WHERE created_at > NOW() - INTERVAL '1 hour';

  IF bounce_rate > 10 THEN
    -- Send alert (implement with pg_notify or external service)
    RAISE WARNING 'High bounce rate detected: %', bounce_rate;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🐛 Troubleshooting

### Issue 1: Webhook Returns 401 Unauthorized

**Symptoms**: Resend webhook dashboard shows `401` errors

**Diagnosis**:
```bash
# Check if RESEND_WEBHOOK_SECRET is set correctly
npx vercel env pull .env.production.verify --environment=production
cat .env.production.verify | grep RESEND_WEBHOOK_SECRET
```

**Possible Causes**:
1. Signing secret not added to Vercel env vars
2. Signing secret contains typos
3. Environment variable not loaded (requires redeployment)

**Solution**:
1. Verify secret in Vercel dashboard
2. Redeploy: `npx vercel --prod --force`
3. Test again from Resend dashboard

### Issue 2: Signature Verification Fails

**Symptoms**: Logs show `[Resend Webhook] Invalid webhook signature`

**Diagnosis**:
```bash
# Check Vercel logs for detailed error
npx vercel logs glec-website.vercel.app | grep "Signature verification error"
```

**Possible Causes**:
1. Clock skew between Resend and Vercel (>5 minutes)
2. Signing secret mismatch
3. Webhook secret contains quotes/newlines (unlikely, but check)

**Solution**:
1. Check server time: `date -u` (should match UTC)
2. Regenerate webhook in Resend dashboard (get new signing secret)
3. Update Vercel env var with new secret

### Issue 3: Events Not Stored in Database

**Symptoms**: Webhook returns `200 OK` but no records in `email_webhook_events`

**Diagnosis**:
```bash
# Check for database connection errors
npx vercel logs glec-website.vercel.app | grep "database\|sql\|INSERT"
```

**Possible Causes**:
1. Database connection timeout (Neon serverless cold start)
2. Schema mismatch (column types)
3. Database credentials expired

**Solution**:
1. Check `DATABASE_URL` env var is set
2. Test database connection: `node check-db-connection.js`
3. Verify table schema: `\d email_webhook_events` in Neon console

### Issue 4: High Failure Rate (>5%)

**Symptoms**: Many webhook events fail to process

**Diagnosis**:
```sql
SELECT
  event_type,
  COUNT(*) FILTER (WHERE processed = TRUE) as success,
  COUNT(*) FILTER (WHERE processed = FALSE) as failed,
  ROUND(COUNT(*) FILTER (WHERE processed = FALSE) * 100.0 / COUNT(*), 2) as failure_rate
FROM email_webhook_events
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type;
```

**Possible Causes**:
1. Database at connection limit (100 connections for Neon free tier)
2. Function timeout (10s for Vercel free tier)
3. Rate limiting from Neon or Vercel

**Solution**:
1. Implement connection pooling (already using Neon pooled connection)
2. Add retry logic for failed webhook processing
3. Consider upgrading Neon/Vercel plan if needed

---

## 📈 Expected Performance

### Webhook Response Times

| Metric | Target | Acceptable |
|--------|--------|------------|
| Signature Verification | <10ms | <50ms |
| Database Insert | <50ms | <200ms |
| Total Response Time | <100ms | <500ms |

### Throughput (Free Tier Limits)

- **Resend Free Tier**: 3,000 emails/month
- **Vercel Free Tier**: 100K function invocations/month
- **Neon Free Tier**: 100 compute hours/month

**Estimated Capacity**:
- 3,000 emails/month × 7 events/email = **21,000 webhook events/month**
- Well within Vercel's 100K invocation limit ✅

---

## 🔗 Related Documentation

- [VERCEL-ENV-URL-ENCODING-ISSUE.md](./VERCEL-ENV-URL-ENCODING-ISSUE.md) - URL encoding issue (NOT applicable to webhooks)
- [PRODUCTION-DEPLOYMENT-CHECKLIST.md](./PRODUCTION-DEPLOYMENT-CHECKLIST.md) - Full deployment checklist
- [ENV-VARIABLES-BACKUP.md](./ENV-VARIABLES-BACKUP.md) - All production environment variables
- [Resend Webhook Docs](https://resend.com/docs/webhooks) - Official Resend documentation
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how) - Signature verification spec

---

## ✅ Completion Checklist

### Pre-Setup
- [✅] Webhook endpoint implemented: `/api/webhooks/resend`
- [✅] Signature verification logic: HMAC-SHA256 with Svix format
- [✅] Database table created: `email_webhook_events`
- [✅] Defensive code: Quote/newline handling for env var

### Setup Steps
- [ ] ⏳ Step 1: Create webhook in Resend dashboard
- [ ] ⏳ Step 2: Subscribe to all 7 event types
- [ ] ⏳ Step 3: Copy signing secret
- [ ] ⏳ Step 4: Add secret to Vercel env vars
- [ ] ⏳ Step 5: Wait for automatic redeployment

### Testing Steps
- [ ] ⏳ Test 1: Send test event from Resend dashboard (expect 200 OK)
- [ ] ⏳ Test 2: Check Vercel logs for successful processing
- [ ] ⏳ Test 3: Verify database record in `email_webhook_events`
- [ ] ⏳ Test 4: End-to-end test with real email (library download)

### Monitoring Setup
- [ ] ⏳ Set up Vercel monitoring for webhook endpoint
- [ ] ⏳ Create dashboard for email metrics (bounce rate, open rate, etc.)
- [ ] ⏳ Schedule weekly review of webhook performance

---

**Status**: ⏳ Awaiting Resend webhook configuration
**Estimated Setup Time**: 5 minutes
**Next Action**: Go to https://resend.com/webhooks and follow Step 1-5

**Last Updated**: 2025-10-17 20:50 KST
