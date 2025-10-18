# Email Template System - E2E Test Plan

> **목적**: 프로덕션 환경에서 Email Template System의 End-to-End 테스트
> **도구**: Playwright (이미 설치됨)
> **범위**: Contact Form Nurture, Library Download Nurture, Template Rendering

---

## 📋 Test Scenarios

### 1️⃣ Contact Form Nurture Sequence

#### Scenario 1.1: Contact Form Submission
```typescript
test('Contact form submission creates lead and sends confirmation email', async ({ page }) => {
  // Given: User visits contact page
  await page.goto('https://glec-website.vercel.app/contact');

  // When: User fills and submits form
  await page.fill('[name="company_name"]', 'E2E Test Corp');
  await page.fill('[name="contact_name"]', 'E2E Tester');
  await page.fill('[name="email"]', 'e2e-test@example.com');
  await page.fill('[name="phone"]', '010-1234-5678');
  await page.check('[name="privacy_consent"]');
  await page.check('[name="marketing_consent"]');
  await page.click('button[type="submit"]');

  // Then: Success message appears
  await expect(page.locator('text=문의가 접수되었습니다')).toBeVisible();

  // And: Lead created in database
  const lead = await checkDatabaseForLead('e2e-test@example.com');
  expect(lead).toBeTruthy();
  expect(lead.company_name).toBe('E2E Test Corp');
  expect(lead.marketing_consent).toBe(true);
});
```

#### Scenario 1.2: Day 3 Nurture Email (Mocked Time)
```typescript
test('Day 3 nurture email sent after 3 days', async () => {
  // Given: Lead created 3 days ago (using database manipulation)
  const leadId = await createTestLead({
    email: 'day3-test@example.com',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  });

  // When: Cron job runs
  const response = await fetch(
    `https://glec-website.vercel.app/api/cron/contact-nurture?cron_secret=${CRON_SECRET}`
  );
  const result = await response.json();

  // Then: Email sent successfully
  expect(result.success).toBe(true);
  expect(result.day3.sent).toBe(1);

  // And: Database updated
  const lead = await getLeadById(leadId);
  expect(lead.nurture_day3_sent).toBe(true);
  expect(lead.nurture_day3_sent_at).toBeTruthy();

  // And: Email history logged
  const history = await getEmailHistory(leadId);
  expect(history).toHaveLength(1);
  expect(history[0].status).toBe('sent');
});
```

#### Scenario 1.3: Email Open Tracking (Webhook)
```typescript
test('Email open tracking via Resend webhook', async ({ page }) => {
  // Given: Email sent to test user
  const leadId = 'test-lead-id';
  const emailId = 're_123456';

  // When: Resend webhook triggered (email.opened)
  const response = await fetch('https://glec-website.vercel.app/api/webhooks/resend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'svix-id': 'test-webhook-id',
      'svix-timestamp': Date.now().toString(),
      'svix-signature': generateWebhookSignature()
    },
    body: JSON.stringify({
      type: 'email.opened',
      data: {
        email_id: emailId,
        to: 'test@example.com',
        subject: '[GLEC] Day 3 Email',
        opened_at: new Date().toISOString()
      }
    })
  });

  // Then: Database updated
  const history = await getEmailHistoryByResendId(emailId);
  expect(history.opened).toBe(true);
  expect(history.opened_at).toBeTruthy();

  // And: Lead score increased
  const lead = await getLeadByEmail('test@example.com');
  expect(lead.lead_score).toBeGreaterThan(0);
});
```

---

### 2️⃣ Library Download Nurture Sequence

#### Scenario 2.1: Library Item Download
```typescript
test('Library download creates lead and triggers nurture sequence', async ({ page }) => {
  // Given: User visits library page
  await page.goto('https://glec-website.vercel.app/knowledge/library');

  // When: User downloads a library item
  await page.click('text=ISO-14083 가이드북');
  await page.fill('[name="company_name"]', 'Library Test Corp');
  await page.fill('[name="contact_name"]', 'Library Tester');
  await page.fill('[name="email"]', 'library-test@example.com');
  await page.check('[name="marketing_consent"]');
  await page.click('button:has-text("다운로드")');

  // Then: Download started
  await expect(page.locator('text=다운로드가 시작되었습니다')).toBeVisible();

  // And: Lead created in database
  const lead = await checkDatabaseForLibraryLead('library-test@example.com');
  expect(lead).toBeTruthy();
  expect(lead.library_item_id).toBeTruthy();
});
```

#### Scenario 2.2: Day 7 Nurture with Template Variables
```typescript
test('Day 7 nurture email renders with correct variables', async () => {
  // Given: Lead created 7 days ago
  const leadId = await createTestLibraryLead({
    email: 'day7-test@example.com',
    contact_name: 'John Doe',
    company_name: 'Acme Corp',
    library_item_id: 'item-123',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nurture_day3_sent: true // Dependency satisfied
  });

  // When: Cron job runs
  const response = await fetch(
    `https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=${CRON_SECRET}`
  );
  const result = await response.json();

  // Then: Email sent successfully
  expect(result.success).toBe(true);
  expect(result.day7.sent).toBe(1);

  // And: Template variables correctly substituted
  const emailHistory = await getEmailHistory(leadId);
  const lastEmail = emailHistory[emailHistory.length - 1];

  // Check email content contains replaced variables
  expect(lastEmail.html_content).toContain('John Doe');
  expect(lastEmail.html_content).toContain('Acme Corp');
  expect(lastEmail.html_content).not.toContain('{contact_name}');
  expect(lastEmail.html_content).not.toContain('{company_name}');
});
```

#### Scenario 2.3: Dependency Check (Day 7 requires Day 3)
```typescript
test('Day 7 email NOT sent if Day 3 not sent', async () => {
  // Given: Lead created 7 days ago but Day 3 NOT sent
  await createTestLibraryLead({
    email: 'dependency-test@example.com',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    nurture_day3_sent: false // Dependency NOT satisfied
  });

  // When: Cron job runs
  const response = await fetch(
    `https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=${CRON_SECRET}`
  );
  const result = await response.json();

  // Then: NO Day 7 email sent
  expect(result.day7.sent).toBe(0);

  // And: Lead NOT updated
  const lead = await getLeadByEmail('dependency-test@example.com');
  expect(lead.nurture_day7_sent).toBe(false);
});
```

---

### 3️⃣ Template System Integration

#### Scenario 3.1: Template Fetching by Category + Day
```typescript
test('Template renderer fetches correct template for category and day', async () => {
  // Given: LIBRARY_DOWNLOAD Day 14 template exists
  const template = await getTemplateByCategory('LIBRARY_DOWNLOAD', 14);

  // Then: Template exists
  expect(template).toBeTruthy();
  expect(template.category_key).toBe('LIBRARY_DOWNLOAD');
  expect(template.nurture_day).toBe(14);
  expect(template.is_active).toBe(true);

  // And: Has required fields
  expect(template.subject_line).toContain('{contact_name}');
  expect(template.html_body).toBeTruthy();
  expect(template.plain_text_body).toBeTruthy();
  expect(template.available_variables).toContain('contact_name');
});
```

#### Scenario 3.2: Variable Substitution
```typescript
test('Template renderer correctly substitutes all variables', () => {
  // Given: Template with multiple variables
  const template = {
    subject_line: '[GLEC] {contact_name}님, {library_item_title} 자료가 도움이 되셨나요?',
    html_body: '<h1>안녕하세요 {contact_name}님</h1><p>{company_name}에서 다운로드하신 {library_item_title}...</p>',
    plain_text_body: '안녕하세요 {contact_name}님, {company_name}...'
  };

  const variables = {
    contact_name: 'John Doe',
    company_name: 'Acme Corp',
    library_item_title: 'ISO-14083 가이드북'
  };

  // When: Variables substituted
  const rendered = renderTemplate(template, variables);

  // Then: All variables replaced
  expect(rendered.subject_line).toBe('[GLEC] John Doe님, ISO-14083 가이드북 자료가 도움이 되셨나요?');
  expect(rendered.html_body).toContain('John Doe');
  expect(rendered.html_body).toContain('Acme Corp');
  expect(rendered.html_body).not.toContain('{contact_name}');
  expect(rendered.html_body).not.toContain('{company_name}');
});
```

#### Scenario 3.3: Email Send Logging
```typescript
test('Email send logged to history table', async () => {
  // Given: Email about to be sent
  const templateId = 'template-123';
  const leadId = 'lead-456';
  const email = 'logging-test@example.com';

  // When: Email sent and logged
  await logEmailSend(templateId, leadId, email, 're_789', 'sent');

  // Then: History record created
  const history = await getEmailHistory(leadId);
  expect(history).toHaveLength(1);
  expect(history[0].template_id).toBe(templateId);
  expect(history[0].lead_id).toBe(leadId);
  expect(history[0].status).toBe('sent');
  expect(history[0].resend_email_id).toBe('re_789');

  // And: Template stats updated
  const stats = await getTemplateStats(templateId);
  expect(stats.total_sent).toBe(1);
  expect(stats.last_sent_at).toBeTruthy();
});
```

---

### 4️⃣ Error Handling & Edge Cases

#### Scenario 4.1: Duplicate Prevention (24h window)
```typescript
test('Duplicate contact form submission rejected within 24h', async ({ page }) => {
  // Given: Same email submitted less than 24h ago
  await createTestLead({
    email: 'duplicate@example.com',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
  });

  // When: User tries to submit again
  await page.goto('https://glec-website.vercel.app/contact');
  await page.fill('[name="email"]', 'duplicate@example.com');
  // ... fill other fields
  await page.click('button[type="submit"]');

  // Then: Error message shown
  await expect(page.locator('text=이미 등록된 이메일입니다')).toBeVisible();

  // And: NO new lead created
  const leads = await getLeadsByEmail('duplicate@example.com');
  expect(leads).toHaveLength(1); // Still only 1
});
```

#### Scenario 4.2: Email Bounce Handling
```typescript
test('Bounced email prevents future nurture sends', async () => {
  // Given: Lead with bounced email
  const leadId = await createTestLead({
    email: 'bounced@example.com',
    email_bounced: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  // When: Cron job runs
  const response = await fetch(
    `https://glec-website.vercel.app/api/cron/contact-nurture?cron_secret=${CRON_SECRET}`
  );
  const result = await response.json();

  // Then: NO email sent to bounced address
  const lead = await getLeadById(leadId);
  expect(lead.nurture_day3_sent).toBe(false);

  // And: Stats reflect skipped email
  expect(result.day3.sent).toBe(0);
});
```

#### Scenario 4.3: Marketing Consent Opt-Out
```typescript
test('Opt-out from marketing prevents nurture emails', async () => {
  // Given: Lead without marketing consent
  const leadId = await createTestLead({
    email: 'optout@example.com',
    marketing_consent: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  // When: Cron job runs
  const response = await fetch(
    `https://glec-website.vercel.app/api/cron/contact-nurture?cron_secret=${CRON_SECRET}`
  );

  // Then: NO email sent
  const lead = await getLeadById(leadId);
  expect(lead.nurture_day3_sent).toBe(false);
});
```

---

## 🛠️ Test Utilities

### Database Helpers
```typescript
// test/helpers/database.ts

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function createTestLead(data: Partial<ContactLead>) {
  const result = await sql`
    INSERT INTO contact_leads (
      company_name,
      contact_name,
      email,
      marketing_consent,
      privacy_consent,
      created_at
    ) VALUES (
      ${data.company_name || 'Test Corp'},
      ${data.contact_name || 'Test User'},
      ${data.email},
      ${data.marketing_consent ?? true},
      TRUE,
      ${data.created_at || new Date()}
    )
    RETURNING id
  `;
  return result[0].id;
}

export async function getLeadByEmail(email: string) {
  const leads = await sql`
    SELECT * FROM contact_leads WHERE email = ${email} LIMIT 1
  `;
  return leads[0];
}

export async function cleanupTestLeads() {
  await sql`
    DELETE FROM contact_leads WHERE email LIKE '%test%' OR email LIKE '%@example.com'
  `;
}
```

### Template Helpers
```typescript
// test/helpers/templates.ts

export async function getTemplateByCategory(categoryKey: string, nurtureDay: number) {
  const templates = await sql`
    SELECT t.* FROM email_templates t
    JOIN email_template_categories c ON t.category_id = c.id
    WHERE c.category_key = ${categoryKey}
    AND t.nurture_day = ${nurtureDay}
    AND t.is_active = TRUE
    LIMIT 1
  `;
  return templates[0];
}

export function renderTemplate(template: any, variables: Record<string, any>) {
  let { subject_line, html_body, plain_text_body } = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    subject_line = subject_line.replace(regex, value);
    html_body = html_body.replace(regex, value);
    plain_text_body = plain_text_body.replace(regex, value);
  });

  return { subject_line, html_body, plain_text_body };
}
```

---

## 📊 Test Execution Plan

### Local Testing
```bash
# 1. Run all E2E tests
npm run test:e2e

# 2. Run specific test file
npx playwright test tests/e2e/contact-nurture.spec.ts

# 3. Run with headed browser (debugging)
npx playwright test --headed --debug

# 4. Generate test report
npx playwright show-report
```

### CI/CD Integration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          CRON_SECRET: ${{ secrets.CRON_SECRET }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## ✅ Success Criteria

### Contact Form Nurture
- [ ] Contact form submission creates lead
- [ ] Day 3 email sent after 3 days
- [ ] Day 7 email sent after 7 days (with Day 3 dependency)
- [ ] Day 14 email sent after 14 days
- [ ] Day 30 email sent after 30 days
- [ ] Email open tracking works via webhook
- [ ] Duplicate prevention (24h window)
- [ ] Marketing consent respected

### Library Download Nurture
- [ ] Library download creates lead
- [ ] Day 3 email sent after 3 days
- [ ] Day 7 email sent after 7 days
- [ ] Day 14 email sent after 14 days
- [ ] Day 30 email sent after 30 days with discount code
- [ ] Template variables correctly substituted
- [ ] Dependency chain enforced (3 → 7 → 14 → 30)

### Template System
- [ ] Template fetching by category + day works
- [ ] Variable substitution accurate (no leftover {placeholders})
- [ ] Email send logging to history table
- [ ] Template stats updated (total_sent, last_sent_at)
- [ ] Fallback to generic templates when specific not found

### Error Handling
- [ ] Bounced emails excluded from nurture
- [ ] Complained emails excluded from nurture
- [ ] Marketing opt-out respected
- [ ] Failed email sends logged with error message
- [ ] Cron jobs handle database connection errors gracefully

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
**Status**: Ready for Implementation ✅
