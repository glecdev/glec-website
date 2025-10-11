# Next Iteration Proposal

> **Current Date**: 2025-10-12
> **Previous Iteration**: Email System Setup (✅ Complete)
> **Proposed Start**: 2025-10-12
> **Estimated Duration**: 3-5 days

---

## 📊 Current Project Status

### Completed Systems (100%)

1. ✅ **Database Setup** (Neon PostgreSQL)
2. ✅ **Authentication** (Admin login with JWT)
3. ✅ **Library Download System** (Phase 1-6)
   - Public-facing download form
   - Lead management
   - Email delivery
   - Webhook tracking
4. ✅ **Email Infrastructure**
   - Resend integration
   - Domain verification (no-reply.glec.io)
   - Webhook tracking (5 events)
   - Official email accounts documented
5. ✅ **Admin UI** (Basic)
   - Login page
   - Customer Leads list
   - Tracking indicators

### Incomplete Systems

1. ⏳ **Contact Form** (Partially implemented)
   - Frontend exists
   - Backend endpoint exists
   - Recipient hardcoded (contact@glec.io - no mailbox)
   - **Issue**: Emails sent to inactive account

2. ⏳ **Email Forwarding** (Not implemented)
   - admin@glec.io → needs mailbox or forwarding
   - contact@glec.io → needs mailbox or forwarding

3. ⏳ **Library Item Management** (Not implemented)
   - Cannot upload new documents via Admin UI
   - Manual database insertion required
   - No file storage integration (R2)

4. ⏳ **Newsletter System** (Not implemented)
   - API exists (`/api/newsletter/subscribe`)
   - No admin UI for sending newsletters
   - No subscriber management

5. ⏳ **Homepage Content** (Not implemented)
   - Placeholder content
   - No CMS integration
   - Static text only

---

## 🎯 Proposed Iteration Options

### Option 1: Email System Completion ⭐ RECOMMENDED

**Goal**: Complete email infrastructure and fix Contact Form

**Why This?**
- High cohesion with current work
- Fixes immediate user issue (Contact Form broken)
- Addresses P1 technical debt
- Short timeline (3 days)

**Tasks**:

#### Day 1 (4 hours)

**Task 1.1**: Setup Cloudflare Email Routing
- Configure DNS for email forwarding
- Route: admin@glec.io → oillex.co.kr@gmail.com
- Route: contact@glec.io → oillex.co.kr@gmail.com
- Test email delivery
- **Deliverable**: Working email forwarding

**Task 1.2**: Update Contact Form Backend
- Change recipient from hardcoded to `process.env.ADMIN_EMAIL`
- Add email validation
- Improve error handling
- **Deliverable**: Contact Form sends to official account

#### Day 2 (6 hours)

**Task 2.1**: Email Templates Refactoring
- Extract HTML templates to separate files
- Create template system:
  - `templates/library-download.html`
  - `templates/contact-form-notification.html`
  - `templates/contact-form-autoresponse.html`
- Add variable substitution
- **Deliverable**: Maintainable email templates

**Task 2.2**: Contact Form Testing
- E2E test for contact form submission
- Email delivery verification
- Form validation tests
- **Deliverable**: 100% test coverage for Contact Form

#### Day 3 (4 hours)

**Task 3.1**: Database Schema Update
- Add `resend_email_id` column to `library_leads`
- Migration script
- Update email sending code to store email ID
- **Deliverable**: Webhook can match emails to leads

**Task 3.2**: Newsletter Unsubscribe
- Create unsubscribe endpoint
- Add unsubscribe link to emails
- Update database schema (newsletter_subscribers.status)
- **Deliverable**: GDPR-compliant unsubscribe

**Total**: 14 hours over 3 days

---

### Option 2: Admin Portal Enhancements

**Goal**: Improve Admin UI for better lead management

**Tasks**:
- Lead filtering (by date, status, email opened, etc.)
- Lead sorting (by score, date, company)
- Bulk actions (export CSV, mark as contacted)
- Lead detail page (view full information)
- Lead status workflow (new → contacted → qualified → closed)
- Lead notes/comments system

**Estimated**: 5 days, 20 hours

**Why Not First?**
- Contact Form still broken
- Lower urgency than fixing email system
- Can be done after email completion

---

### Option 3: Library System Expansion

**Goal**: Add file upload and management to Admin UI

**Tasks**:
- Cloudflare R2 integration
- File upload UI (drag & drop)
- Library item CRUD in Admin UI
- Multiple files per item
- File version control
- Public file serving from R2

**Estimated**: 5 days, 24 hours

**Why Not First?**
- Complex infrastructure change
- Lower urgency than email fixes
- Requires R2 configuration

---

### Option 4: Homepage Content Management

**Goal**: Complete homepage with real content

**Tasks**:
- Hero section with real copy
- Problem/Solution sections
- Product showcase
- Customer testimonials
- Pricing section
- FAQ section

**Estimated**: 4 days, 16 hours

**Why Not First?**
- Lower priority than functional fixes
- Requires content from marketing team
- No technical blockers to address

---

## 🎯 Recommended Iteration: Option 1

### Rationale

1. **Fixes Immediate Issue**:
   - Contact Form currently sends to inactive email
   - User cannot receive contact inquiries
   - **High business impact**

2. **Completes Current Work**:
   - Email system 80% done
   - Finishing remaining 20% prevents technical debt
   - High cohesion with previous iteration

3. **Short Timeline**:
   - Only 3 days
   - Can start Option 2 on Day 4
   - Fast wins for user

4. **Addresses P1 Technical Debt**:
   - Email forwarding (P1)
   - Contact Form fix (P1)
   - Database schema update (P1)

5. **Unblocks Future Work**:
   - Newsletter system depends on email templates
   - Admin enhancements need proper email notifications
   - All future features need working Contact Form

---

## 📋 Detailed Implementation Plan

### Phase 1: Cloudflare Email Routing (4h)

#### Step 1: DNS Configuration

**Cloudflare Dashboard**: https://dash.cloudflare.com

**Add MX Records**:
```
Domain: glec.io
Type: MX
Priority: 10
Value: route1.mx.cloudflare.net
```

```
Domain: glec.io
Type: MX
Priority: 20
Value: route2.mx.cloudflare.net
```

**Add TXT Record**:
```
Domain: glec.io
Type: TXT
Value: v=spf1 include:_spf.mx.cloudflare.net ~all
```

#### Step 2: Email Routing Rules

**Route 1**:
```yaml
Source: admin@glec.io
Destination: oillex.co.kr@gmail.com
Action: Forward
```

**Route 2**:
```yaml
Source: contact@glec.io
Destination: oillex.co.kr@gmail.com
Action: Forward
```

**Catch-all** (Optional):
```yaml
Source: *@glec.io
Destination: oillex.co.kr@gmail.com
Action: Drop (or Forward)
```

#### Step 3: Testing

```bash
# Send test email
echo "Test email body" | mail -s "Test from admin@glec.io" admin@glec.io

# Verify receipt at oillex.co.kr@gmail.com
```

**Deliverable**: ✅ Email forwarding working

---

### Phase 2: Contact Form Fix (2h)

#### Step 1: Backend Update

**File**: `app/api/contact/route.ts`

**Current Code** (Assumed):
```typescript
// BEFORE: Hardcoded recipient
await resend.emails.send({
  from: 'noreply@no-reply.glec.io',
  to: 'contact@glec.io', // ← Hardcoded!
  subject: `[GLEC Contact] ${data.subject}`,
  html: emailBody,
});
```

**New Code**:
```typescript
// AFTER: Use environment variable
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
  throw new Error('ADMIN_EMAIL not configured');
}

await resend.emails.send({
  from: 'noreply@no-reply.glec.io',
  to: ADMIN_EMAIL, // ← Dynamic!
  replyTo: data.email, // User can reply directly
  subject: `[GLEC Contact] ${data.subject}`,
  html: emailBody,
});
```

#### Step 2: Send Auto-Response to User

```typescript
// Send confirmation to user
await resend.emails.send({
  from: 'noreply@no-reply.glec.io',
  to: data.email,
  subject: '[GLEC] 문의 접수 확인',
  html: autoResponseTemplate({
    name: data.name,
    message: '영업일 기준 1-2일 내에 답변드리겠습니다.',
  }),
});
```

#### Step 3: Testing

**Test Script**: `test-contact-form.js`

```javascript
const response = await fetch('https://glec-website.vercel.app/api/contact', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company',
    phone: '010-1234-5678',
    subject: 'Test Contact Form',
    message: 'This is a test message',
    privacy_consent: true,
  }),
});

// Expected:
// 1. Email sent to oillex.co.kr@gmail.com
// 2. Auto-response sent to test@example.com
```

**Deliverable**: ✅ Contact Form sends to official account

---

### Phase 3: Email Templates (4h)

#### Step 1: Create Template System

**File Structure**:
```
lib/email-templates/
  ├── base.html (layout)
  ├── library-download.html
  ├── contact-form-notification.html
  ├── contact-form-autoresponse.html
  └── template-engine.ts
```

**Template Engine**:
```typescript
// lib/email-templates/template-engine.ts
export function renderTemplate(
  templateName: string,
  variables: Record<string, any>
): string {
  const template = readFileSync(
    `./lib/email-templates/${templateName}.html`,
    'utf-8'
  );

  return Object.entries(variables).reduce(
    (html, [key, value]) =>
      html.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    template
  );
}
```

**Usage**:
```typescript
const html = renderTemplate('library-download', {
  user_name: lead.contact_name,
  library_title: libraryItem.title,
  download_link: googleDriveUrl,
  company_name: lead.company_name,
});
```

**Deliverable**: ✅ Reusable email template system

---

### Phase 4: Database Schema Update (2h)

#### Step 1: Migration Script

**File**: `migrations/add-resend-email-id.sql`

```sql
-- Add resend_email_id column to library_leads
ALTER TABLE library_leads
ADD COLUMN IF NOT EXISTS resend_email_id VARCHAR(255);

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_library_leads_resend_email_id
ON library_leads(resend_email_id);

-- Add column comments
COMMENT ON COLUMN library_leads.resend_email_id IS 'Resend email ID for webhook matching';
```

#### Step 2: Update Email Sending Code

**File**: `app/api/library/download/route.ts`

```typescript
// Send email and capture ID
const { data: emailData } = await resend.emails.send({
  from: 'noreply@no-reply.glec.io',
  to: lead.email,
  subject: `[GLEC] ${libraryItem.title} 다운로드`,
  html: emailBody,
});

// Store Resend email ID in database
await sql`
  UPDATE library_leads
  SET resend_email_id = ${emailData.id}
  WHERE id = ${lead.id}
`;
```

#### Step 3: Update Webhook Handler

**File**: `app/api/webhooks/resend/route.ts`

```typescript
// BEFORE: Match by email address (unreliable)
const lead = await sql`
  SELECT id FROM library_leads
  WHERE email = ${event.data.email}
`;

// AFTER: Match by Resend email ID (reliable)
const lead = await sql`
  SELECT id FROM library_leads
  WHERE resend_email_id = ${event.data.email_id}
  LIMIT 1
`;
```

**Deliverable**: ✅ Webhooks can reliably match emails to leads

---

### Phase 5: Unsubscribe Functionality (2h)

#### Step 1: Database Schema

```sql
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';

-- Possible values: ACTIVE, UNSUBSCRIBED, BOUNCED

CREATE INDEX IF NOT EXISTS idx_newsletter_status
ON newsletter_subscribers(status);
```

#### Step 2: Unsubscribe Endpoint

**File**: `app/api/newsletter/unsubscribe/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const { email, token } = await req.json();

  // Verify token (prevent abuse)
  const expectedToken = generateUnsubscribeToken(email);
  if (token !== expectedToken) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 400 }
    );
  }

  // Update status
  await sql`
    UPDATE newsletter_subscribers
    SET status = 'UNSUBSCRIBED',
        updated_at = NOW()
    WHERE email = ${email}
  `;

  return NextResponse.json({
    success: true,
    message: '구독이 취소되었습니다.',
  });
}
```

#### Step 3: Add Unsubscribe Link to Emails

```html
<!-- In email footer -->
<p style="font-size: 12px; color: #666;">
  더 이상 이메일을 받고 싶지 않으시면
  <a href="https://glec-website.vercel.app/unsubscribe?email={{user_email}}&token={{unsubscribe_token}}">
    여기를 클릭하세요
  </a>
</p>
```

**Deliverable**: ✅ GDPR-compliant unsubscribe system

---

## 🎯 Success Criteria

### Must Have (P0)

- [ ] Cloudflare Email Routing configured and tested
- [ ] Contact Form sends to oillex.co.kr@gmail.com
- [ ] Email templates extracted to separate files
- [ ] `resend_email_id` column added and populated
- [ ] Webhook matches emails by Resend ID

### Should Have (P1)

- [ ] Auto-response email for Contact Form
- [ ] Unsubscribe functionality implemented
- [ ] Contact Form E2E tests (100% coverage)
- [ ] Email template system documented

### Nice to Have (P2)

- [ ] Email bounce handling
- [ ] Spam complaint handling
- [ ] Email analytics dashboard (open rate, click rate)

---

## 📊 Estimated Timeline

### Day 1 (Friday, 2025-10-12)
- Morning (2h): Cloudflare Email Routing setup
- Afternoon (2h): Contact Form backend fix
- **Deliverable**: Contact Form working

### Day 2 (Saturday, 2025-10-13)
- Morning (2h): Email templates extraction
- Afternoon (2h): Template system implementation
- Evening (2h): Contact Form testing
- **Deliverable**: Email templates system + tests

### Day 3 (Sunday, 2025-10-14)
- Morning (2h): Database migration
- Afternoon (2h): Unsubscribe functionality
- **Deliverable**: Production-ready email system

**Total**: 14 hours over 3 days

---

## 🚀 Post-Iteration Goals

After completing Option 1, proceed to:

### Iteration +1: Admin Portal Enhancements (5 days)
- Lead filtering and sorting
- Bulk actions
- Lead detail page
- Status workflow

### Iteration +2: Library System Expansion (5 days)
- Cloudflare R2 integration
- File upload UI
- Library item CRUD

### Iteration +3: Homepage Content (4 days)
- Real content from marketing
- CMS integration
- SEO optimization

---

## 📚 Documentation to Update

1. **GLEC_OFFICIAL_EMAIL_ACCOUNTS.md**:
   - Add Cloudflare Email Routing section
   - Update email flow diagrams
   - Mark admin@glec.io, contact@glec.io as "Forwarded"

2. **GLEC-API-Specification.yaml**:
   - Document `/api/contact` endpoint changes
   - Add `/api/newsletter/unsubscribe` endpoint
   - Update error responses

3. **GLEC-Environment-Setup-Guide.md**:
   - Add Cloudflare Email Routing setup
   - Update environment variables list
   - Add email template system

4. **GLEC-Test-Plan.md**:
   - Add Contact Form E2E tests
   - Add email template tests
   - Update coverage targets

---

## 💰 Cost Impact

### Cloudflare Email Routing
- **Price**: FREE (included in free plan)
- **Limits**: 200 messages/day (sufficient)

### Resend
- **Current**: FREE tier (3,000 emails/month)
- **Usage**: ~50 emails/month (Contact Form + Library)
- **Status**: Well within limits

### No additional costs for this iteration.

---

## ✅ Approval Checklist

Before starting this iteration:

- [ ] User approves Option 1 (Email System Completion)
- [ ] Cloudflare account access confirmed
- [ ] Estimated timeline acceptable (3 days)
- [ ] Success criteria agreed upon
- [ ] Priority confirmed (P0 tasks)

---

**Prepared by**: Claude Code Agent
**Date**: 2025-10-12
**Iteration**: Next Iteration Proposal
**Recommended**: Option 1 - Email System Completion
