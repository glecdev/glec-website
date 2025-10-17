# GLEC Website - Production Deployment Checklist

**Deployment Date**: 2025-10-17
**Deployment URL**: https://glec-website.vercel.app
**Vercel Project**: glecdevs-projects/glec-website

---

## ✅ Deployment Status

### Vercel Production Deployment
- [x] Build successful
- [x] Deployment ID: `dpl_4Yjta1bLKsYKAwfi5WyuJtLtqFEC`
- [x] Production URL: https://glec-website.vercel.app
- [x] Status: ● Ready

### Production URLs
- Primary: https://glec-website.vercel.app
- Alternative: https://glec-website-glecdevs-projects.vercel.app
- Preview: https://glec-website-b5xq6ql14-glecdevs-projects.vercel.app

---

## ⚠️ CRITICAL: Production Environment Variables

### 🔐 Security Secrets (MUST CHANGE)

These secrets are currently set to development values. **Change them immediately in Vercel Dashboard** → Settings → Environment Variables → Production.

#### 1. Webhook Security
```bash
RESEND_WEBHOOK_SECRET=<GENERATE_32+_CHAR_RANDOM_STRING>
```
**Current**: `dev-webhook-secret-minimum-32-chars-replace-in-production`
**Required**: Minimum 32 characters, cryptographically random
**Generate**: `openssl rand -base64 32` or use password manager

#### 2. Cron Job Security
```bash
CRON_SECRET=<GENERATE_32+_CHAR_RANDOM_STRING>
```
**Current**: `dev-cron-secret-minimum-32-chars-replace-in-production`
**Required**: Minimum 32 characters, cryptographically random
**Generate**: `openssl rand -base64 32` or use password manager

#### 3. Admin Notification Email
```bash
ADMIN_NOTIFICATION_EMAIL=<ACTUAL_ADMIN_EMAIL>
```
**Current**: `oillex.co.kr@gmail.com`
**Confirm**: Is this the correct production email?

---

## 📧 Resend Webhook Configuration

### Step 1: Create Webhook in Resend Dashboard

1. Go to https://resend.com/webhooks
2. Click "Add Webhook"
3. Enter webhook URL:
   ```
   https://glec-website.vercel.app/api/webhooks/resend
   ```
4. Subscribe to events:
   - [x] email.sent
   - [x] email.delivered
   - [x] email.opened
   - [x] email.clicked
   - [x] email.bounced
   - [x] email.complained
   - [x] email.failed

### Step 2: Copy Signing Secret

1. After creating webhook, copy the "Signing Secret"
2. Go to Vercel Dashboard → glec-website → Settings → Environment Variables
3. Add/Update environment variable:
   - **Name**: `RESEND_WEBHOOK_SECRET`
   - **Value**: `<PASTE_SIGNING_SECRET_HERE>`
   - **Environment**: Production
4. Click "Save"
5. Redeploy (Vercel will automatically redeploy)

### Step 3: Test Webhook

```bash
# Send test webhook from Resend Dashboard
# Check Vercel logs for:
# [Resend Webhook] Valid signature
# [Resend Webhook] Event stored in email_webhook_events
```

---

## ⏰ Vercel Cron Jobs Configuration

### Step 1: Verify Cron Schedule

Already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/library-nurture",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Schedule**: Daily at 12:00 AM UTC (9:00 AM KST)

### Step 2: Verify Cron Secret

1. Go to Vercel Dashboard → glec-website → Settings → Environment Variables
2. Verify `CRON_SECRET` is set to a strong random string (NOT dev secret)
3. If not set, generate and add:
   ```bash
   CRON_SECRET=<GENERATE_32+_CHAR_RANDOM_STRING>
   ```

### Step 3: Check Cron Jobs in Vercel Dashboard

1. Go to Vercel Dashboard → glec-website → Deployments
2. Click on latest production deployment
3. Scroll down to "Cron Jobs"
4. Verify status: **Active**

### Step 4: Test Cron Job (Manual Trigger)

```bash
# Using test endpoint (development only)
curl "https://glec-website.vercel.app/api/cron/test/library-nurture?cron_secret=<CRON_SECRET>&day=3"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Test completed for Day 3",
  "results": {
    "day": 3,
    "sent": 5,
    "failed": 0,
    "leads": [...]
  }
}
```

---

## 🗄️ Database Migration

### Email Blacklist Table

Already created in development. Verify in production:

```sql
SELECT * FROM email_blacklist LIMIT 1;
```

If table doesn't exist, run migration:
```bash
node create-email-blacklist-table.js
```

---

## 📊 Monitoring & Verification

### 1. Check Deployment Logs

```bash
# View real-time logs
npx vercel@latest logs glec-website-b5xq6ql14-glecdevs-projects.vercel.app --token=4WjWFbv1BRjxABWdkzCI6jF0 --follow
```

### 2. Test Critical Endpoints

#### Library Download (Email Automation)
```bash
curl -X POST https://glec-website.vercel.app/api/library/download \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "contact_name": "Test User",
    "company_name": "Test Company",
    "phone": "010-1234-5678",
    "library_item_id": "<LIBRARY_ITEM_ID>",
    "privacy_consent": true,
    "marketing_consent": true
  }'
```

**Expected**:
- 200 OK
- Email sent to user (check Resend dashboard)
- Lead created in database

#### Demo Request (Automation)
```bash
curl -X POST https://glec-website.vercel.app/api/demo-requests \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "contactName": "John Doe",
    "email": "john@testcorp.com",
    "phone": "010-9876-5432",
    "companySize": "51-200",
    "productInterests": ["GLEC DTG Series5", "Carbon API"],
    "useCase": "We need to track carbon emissions for our logistics fleet",
    "monthlyShipments": "1000-10000",
    "preferredDate": "2025-10-25",
    "preferredTime": "14:00",
    "currentSolution": "Manual Excel tracking"
  }'
```

**Expected**:
- 201 Created
- Confirmation email sent to user
- Admin notification email sent to `ADMIN_NOTIFICATION_EMAIL`

#### Webhook Test (from Resend Dashboard)
- Send test webhook
- Check Vercel logs for signature verification
- Verify event stored in `email_webhook_events` table

---

## 🔍 Post-Deployment Checks

### Day 1: Immediate Verification

- [x] ✅ Production deployment successful
- [ ] ⏳ Environment variables updated (RESEND_WEBHOOK_SECRET, CRON_SECRET)
- [ ] ⏳ Resend webhook configured and tested
- [ ] ⏳ Cron jobs verified in Vercel Dashboard
- [ ] ⏳ Email blacklist table verified
- [ ] ⏳ Test library download flow (end-to-end)
- [ ] ⏳ Test demo request flow (end-to-end)
- [ ] ⏳ Monitor error logs for 24 hours

### Day 2-7: Continuous Monitoring

- [ ] ⏳ Check daily cron job execution (should run at 9 AM KST)
- [ ] ⏳ Verify library nurture emails sent (Day 3, 7, 14, 30)
- [ ] ⏳ Monitor email bounce/complaint rates (should be near 0%)
- [ ] ⏳ Check lead score calculations (verify breakdown in logs)
- [ ] ⏳ Verify email blacklist working (spam complainers blocked)

### Week 1: Performance Review

- [ ] ⏳ Review Resend email delivery metrics
- [ ] ⏳ Analyze lead conversion rates (library → demo)
- [ ] ⏳ Check database growth (email_webhook_events, library_leads)
- [ ] ⏳ Lighthouse performance scores (should be 90+)
- [ ] ⏳ Error rate analysis (should be <1%)

---

## 🚨 Rollback Plan

If critical issues occur:

### Option 1: Revert to Previous Deployment

```bash
# Find previous stable deployment
npx vercel@latest ls --token=4WjWFbv1BRjxABWdkzCI6jF0

# Promote previous deployment to production
npx vercel@latest promote <PREVIOUS_DEPLOYMENT_URL> --token=4WjWFbv1BRjxABWdkzCI6jF0
```

### Option 2: Disable Cron Jobs

If cron jobs are causing issues:

1. Go to Vercel Dashboard → glec-website → Settings → Cron Jobs
2. Click "Pause" on `library-nurture` cron job
3. Fix issue locally
4. Redeploy with fix
5. Re-enable cron job

### Option 3: Disable Webhooks

If webhook processing is causing issues:

1. Go to Resend Dashboard → Webhooks
2. Click "Disable" on webhook
3. Fix issue locally
4. Redeploy with fix
5. Re-enable webhook

---

## 📈 Success Metrics

### Technical Metrics (Week 1)

- **Uptime**: 99.9%+
- **Error Rate**: <1%
- **Email Delivery Rate**: >95%
- **Email Bounce Rate**: <5%
- **Email Complaint Rate**: <0.1%
- **Cron Job Success Rate**: 100%
- **Webhook Success Rate**: >99%

### Business Metrics (Week 1)

- **Library Downloads**: Track in admin dashboard
- **Demo Requests**: Track in admin dashboard
- **Email Open Rate**: >20% (industry avg)
- **Email Click Rate**: >3% (industry avg)
- **Lead Score Distribution**: Majority should be 60-80 (warm leads)

---

## 📞 Support Contacts

### Development Team
- **Email**: oillex.co.kr@gmail.com
- **Vercel Project**: https://vercel.com/glecdevs-projects/glec-website

### External Services
- **Resend Support**: support@resend.com
- **Vercel Support**: https://vercel.com/support
- **Neon Support**: https://neon.tech/docs/introduction

---

## 📝 Change Log

### 2025-10-17: Initial Production Deployment

**New Features**:
1. ✅ Resend Webhook Signature Verification
2. ✅ Email Blacklist System
3. ✅ Unified Lead Scoring (centralized module)
4. ✅ Vercel Cron Jobs (library nurture sequence)
5. ✅ Enhanced Email Templates (Day 14, 30)
6. ✅ Demo Request Automation (confirmation + admin notification)

**Files Added** (7):
- `create-email-blacklist-table.js`
- `lib/lead-scoring/calculate-score.ts`
- `lib/email-templates/library-nurture-day14.ts`
- `lib/email-templates/library-nurture-day30.ts`
- `app/api/cron/test/library-nurture/route.ts`
- `lib/email-templates/demo-confirmation.ts`
- `lib/email-templates/demo-admin-notification.ts`

**Files Modified** (6):
- `app/api/webhooks/resend/route.ts`
- `app/api/library/download/route.ts`
- `vercel.json`
- `app/api/cron/library-nurture/route.ts`
- `app/api/demo-requests/route.ts`
- `.env.local`

**Database Changes**:
- New table: `email_blacklist` (email, reason, blacklisted_at, created_at)

**Total Code**: ~2,114 lines added/modified

---

**Last Updated**: 2025-10-17 11:45 KST
**Status**: 🟢 Production Ready, ⏳ Awaiting Environment Variable Updates
