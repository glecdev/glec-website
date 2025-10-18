# Email Template System - Production Deployment Checklist

> **배포 일시**: 2025-10-18
> **담당자**: CTO
> **시스템**: Email Template Management System

---

## 📋 Phase 1: Pre-Deployment Checklist

### 1.1 Database Schema ✅/❌

- [ ] `email_template_categories` 테이블 존재 확인
- [ ] `email_templates` 테이블 존재 확인
- [ ] `email_send_history` 테이블 존재 확인
- [ ] `email_template_stats` 테이블 존재 확인
- [ ] `contact_leads` 테이블 존재 확인
- [ ] `library_leads` 테이블 nurture columns 확인

**실행 스크립트**:
```bash
DATABASE_URL="$DATABASE_URL" node scripts/verify-database-schema.js
```

### 1.2 Email Templates Seeding ✅/❌

- [ ] 24개 Generic Templates 생성 완료
- [ ] 4개 LIBRARY_DOWNLOAD Templates 생성 완료
- [ ] Total: 28 templates in database

**실행 스크립트**:
```bash
# 24 generic templates
DATABASE_URL="$DATABASE_URL" node scripts/create-24-generic-templates.js

# 4 LIBRARY_DOWNLOAD templates
DATABASE_URL="$DATABASE_URL" node scripts/create-library-download-templates.js
```

### 1.3 Environment Variables ✅/❌

**로컬 환경 (.env.local)**:
- [ ] `DATABASE_URL` (Neon PostgreSQL)
- [ ] `JWT_SECRET` (32+ chars)
- [ ] `RESEND_API_KEY` (re_...)
- [ ] `RESEND_FROM_EMAIL` (noreply@no-reply.glec.io)
- [ ] `CRON_SECRET` (base64 encoded)
- [ ] `RESEND_WEBHOOK_SECRET` (whsec_...)

**Vercel 환경 (Production)**:
- [ ] 위의 모든 환경 변수 Vercel에 설정
- [ ] `NEXT_PUBLIC_*` 변수 설정 (필요 시)

**검증 스크립트**:
```bash
node scripts/verify-env-variables.js
```

### 1.4 API Endpoints 테스트 ✅/❌

- [ ] `/api/contact` POST 테스트
- [ ] `/api/cron/contact-nurture` GET 테스트 (with cron_secret)
- [ ] `/api/cron/library-nurture` GET 테스트 (with cron_secret)

**실행 스크립트**:
```bash
# Contact API test
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test Corp","contact_name":"Test User","email":"test@example.com","privacy_consent":true}'

# Cron jobs test (local)
curl "http://localhost:3000/api/cron/contact-nurture?cron_secret=$CRON_SECRET"
curl "http://localhost:3000/api/cron/library-nurture?cron_secret=$CRON_SECRET"
```

### 1.5 Code Quality ✅/❌

- [ ] TypeScript 타입 체크 통과 (`npm run type-check`)
- [ ] ESLint 통과 (`npm run lint`)
- [ ] Build 성공 (`npm run build`)
- [ ] No hardcoded secrets in code

**실행 스크립트**:
```bash
npm run type-check
npm run lint
npm run build
```

---

## 🚀 Phase 2: Deployment Steps

### 2.1 Git Commit & Push

```bash
git add .
git commit -m "feat(email-templates): Complete email template management system

- Implement database-driven template system
- Add template renderer with variable substitution
- Create contact_leads table with nurture tracking
- Add contact-nurture and library-nurture cron jobs
- Seed 24 generic + 4 LIBRARY_DOWNLOAD templates
- Implement email send logging and statistics

Deployment checklist completed.
"

git push origin main
```

### 2.2 Vercel Environment Variables

**Option A: Vercel CLI**
```bash
# Set all environment variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production
vercel env add CRON_SECRET production
vercel env add RESEND_WEBHOOK_SECRET production
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables
2. Add all required variables
3. Select "Production" environment

### 2.3 Database Migration (Production)

```bash
# Execute on production database
DATABASE_URL="<production_db_url>" node scripts/create-email-templates-tables.js
DATABASE_URL="<production_db_url>" node scripts/create-contact-leads-table.js
```

### 2.4 Email Templates Seeding (Production)

```bash
# Seed 24 generic templates
DATABASE_URL="<production_db_url>" node scripts/create-24-generic-templates.js

# Seed 4 LIBRARY_DOWNLOAD templates
DATABASE_URL="<production_db_url>" node scripts/create-library-download-templates.js
```

### 2.5 Vercel Cron Jobs Configuration

**Update vercel.json**:
```json
{
  "crons": [
    {
      "path": "/api/cron/library-nurture?cron_secret=<URL_ENCODED_SECRET>",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/contact-nurture?cron_secret=<URL_ENCODED_SECRET>",
      "schedule": "0 1 * * *"
    }
  ]
}
```

**Deploy cron jobs**:
```bash
vercel --prod
```

### 2.6 Verify Deployment

```bash
# Check deployment URL
vercel ls

# Test production endpoints
curl -X POST https://glec-website.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test","contact_name":"User","email":"test@example.com","privacy_consent":true}'

# Check cron jobs (will fail without secret - expected)
curl https://glec-website.vercel.app/api/cron/library-nurture
```

---

## 📊 Phase 3: Post-Deployment Verification

### 3.1 Database Verification

```sql
-- Check templates count
SELECT category_key, COUNT(*) as count
FROM email_templates t
JOIN email_template_categories c ON t.category_id = c.id
GROUP BY category_key;

-- Expected:
-- CONTACT_FORM: 7 (3 generic + 4 category-specific)
-- DEMO_REQUEST: 6
-- NEWSLETTER_SIGNUP: 6
-- PRICING_INQUIRY: 6
-- PARTNERSHIP_INQUIRY: 6
-- CAREER_APPLICATION: 6
-- LIBRARY_DOWNLOAD: 10 (6 generic + 4 category-specific)
-- EVENT_REGISTRATION: 6
-- Total: 53 templates
```

### 3.2 Email Sending Test

**Create test library lead**:
```sql
INSERT INTO library_leads (
  company_name,
  contact_name,
  email,
  library_item_id,
  marketing_consent,
  created_at
) VALUES (
  'Test Company',
  'Test User',
  'your-email@example.com',
  (SELECT id FROM library_items LIMIT 1),
  TRUE,
  NOW() - INTERVAL '3 days'
);
```

**Trigger nurture cron manually**:
```bash
curl "https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=$CRON_SECRET"
```

**Check email received**:
- Check your email inbox
- Verify template rendering
- Check Resend dashboard

### 3.3 Monitoring Setup

**Vercel Logs**:
```bash
vercel logs --follow
```

**Database Queries**:
```sql
-- Email send history (last 24h)
SELECT
  DATE_TRUNC('hour', sent_at) as hour,
  status,
  COUNT(*) as count
FROM email_send_history
WHERE sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour, status
ORDER BY hour DESC;

-- Template performance
SELECT
  t.template_name,
  s.total_sent,
  s.total_delivered,
  ROUND(s.delivery_rate * 100, 2) as delivery_pct,
  ROUND(s.open_rate * 100, 2) as open_pct,
  ROUND(s.click_rate * 100, 2) as click_pct
FROM email_template_stats s
JOIN email_templates t ON s.template_id = t.id
WHERE s.total_sent > 0
ORDER BY s.total_sent DESC;
```

---

## 🔧 Phase 4: Rollback Plan

### If deployment fails:

**4.1 Revert Code**:
```bash
git revert HEAD
git push origin main
```

**4.2 Disable Cron Jobs**:
Remove cron jobs from vercel.json and redeploy:
```bash
vercel --prod
```

**4.3 Database Rollback** (if needed):
```sql
-- Drop email template tables
DROP TABLE IF EXISTS email_send_history CASCADE;
DROP TABLE IF EXISTS email_template_stats CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_template_categories CASCADE;

-- Drop contact_leads (if needed)
DROP TABLE IF EXISTS contact_leads CASCADE;
```

---

## 📈 Phase 5: Success Metrics

### Day 1 (24 hours after deployment):
- [ ] At least 1 library-nurture email sent
- [ ] At least 1 contact-nurture email sent (if contact form submitted)
- [ ] 0 cron job errors in Vercel logs
- [ ] 0 database connection errors
- [ ] Email delivery rate > 95%

### Week 1 (7 days after deployment):
- [ ] 50+ nurture emails sent
- [ ] Email open rate > 30%
- [ ] Email click rate > 5%
- [ ] 0 critical errors
- [ ] All 4 nurture days (3, 7, 14, 30) working

### Month 1 (30 days after deployment):
- [ ] 500+ nurture emails sent
- [ ] Lead scoring system working
- [ ] Template A/B testing ready
- [ ] Admin UI for template management ready

---

## 🔒 Security Checklist

- [ ] CRON_SECRET is strong (base64, 32+ chars)
- [ ] No secrets hardcoded in code
- [ ] All sensitive data in environment variables
- [ ] Database connection uses SSL (Neon default)
- [ ] Resend API key has minimal permissions
- [ ] Cron endpoints reject requests without valid secret
- [ ] Email templates sanitized (prevent XSS)

---

## 📞 Contact & Support

**Deployment Issues**:
- Check Vercel logs: `vercel logs --follow`
- Check database: Neon dashboard
- Check emails: Resend dashboard

**Emergency Rollback**:
- Contact: CTO
- Action: Follow Phase 4 Rollback Plan

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
**Status**: Ready for Deployment ✅
