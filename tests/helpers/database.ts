/**
 * Database Test Helpers
 *
 * Utilities for creating, fetching, and cleaning up test data
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// TYPES
// ============================================================

export interface ContactLead {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  inquiry_details?: string;
  marketing_consent: boolean;
  privacy_consent: boolean;
  email_bounced?: boolean;
  email_complained?: boolean;
  nurture_day3_sent: boolean;
  nurture_day3_sent_at?: Date;
  nurture_day7_sent: boolean;
  nurture_day7_sent_at?: Date;
  nurture_day14_sent: boolean;
  nurture_day14_sent_at?: Date;
  nurture_day30_sent: boolean;
  nurture_day30_sent_at?: Date;
  lead_score: number;
  lead_status: string;
  created_at: Date;
}

export interface LibraryLead {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  library_item_id: string;
  marketing_consent: boolean;
  email_bounced?: boolean;
  email_complained?: boolean;
  nurture_day3_sent: boolean;
  nurture_day3_sent_at?: Date;
  nurture_day7_sent: boolean;
  nurture_day7_sent_at?: Date;
  nurture_day14_sent: boolean;
  nurture_day14_sent_at?: Date;
  nurture_day30_sent: boolean;
  nurture_day30_sent_at?: Date;
  created_at: Date;
}

export interface EmailHistory {
  id: string;
  template_id: string;
  lead_id: string;
  recipient_email: string;
  resend_email_id?: string;
  send_status: 'sent' | 'failed';
  opened: boolean;
  clicked: boolean;
  bounced: boolean;
  complained: boolean;
  sent_at: Date;
}

// ============================================================
// CONTACT LEADS
// ============================================================

export async function createTestContactLead(data: Partial<ContactLead>): Promise<string> {
  const result = await sql`
    INSERT INTO contact_leads (
      company_name,
      contact_name,
      email,
      phone,
      inquiry_details,
      marketing_consent,
      privacy_consent,
      email_bounced,
      email_complained,
      lead_score,
      lead_status,
      source,
      created_at
    ) VALUES (
      ${data.company_name || 'E2E Test Corp'},
      ${data.contact_name || 'E2E Tester'},
      ${data.email || `test-${Date.now()}@example.com`},
      ${data.phone || null},
      ${data.inquiry_details || null},
      ${data.marketing_consent ?? true},
      ${data.privacy_consent ?? true},
      ${data.email_bounced ?? false},
      ${data.email_complained ?? false},
      ${data.lead_score || 0},
      ${data.lead_status || 'new'},
      'e2e_test',
      ${data.created_at || new Date()}
    )
    RETURNING id
  `;

  return result[0].id;
}

export async function getContactLeadById(id: string): Promise<ContactLead | null> {
  const leads = await sql`
    SELECT * FROM contact_leads WHERE id = ${id} LIMIT 1
  `;
  return leads[0] as ContactLead || null;
}

export async function getContactLeadByEmail(email: string): Promise<ContactLead | null> {
  const leads = await sql`
    SELECT * FROM contact_leads WHERE email = ${email} LIMIT 1
  `;
  return leads[0] as ContactLead || null;
}

export async function getAllContactLeadsByEmail(email: string): Promise<ContactLead[]> {
  const leads = await sql`
    SELECT * FROM contact_leads WHERE email = ${email} ORDER BY created_at DESC
  `;
  return leads as ContactLead[];
}

// ============================================================
// LIBRARY LEADS
// ============================================================

export async function createTestLibraryLead(data: Partial<LibraryLead>): Promise<string> {
  // Get a random library item if not specified
  let libraryItemId = data.library_item_id;

  if (!libraryItemId) {
    const items = await sql`SELECT id FROM library_items LIMIT 1`;
    if (items.length === 0) {
      throw new Error('No library items found. Please seed library items first.');
    }
    libraryItemId = items[0].id;
  }

  const result = await sql`
    INSERT INTO library_leads (
      company_name,
      contact_name,
      email,
      library_item_id,
      marketing_consent,
      email_bounced,
      email_complained,
      source,
      created_at,
      nurture_day3_sent,
      nurture_day7_sent,
      nurture_day14_sent,
      nurture_day30_sent
    ) VALUES (
      ${data.company_name || 'E2E Library Test Corp'},
      ${data.contact_name || 'E2E Library Tester'},
      ${data.email || `library-test-${Date.now()}@example.com`},
      ${libraryItemId},
      ${data.marketing_consent ?? true},
      ${data.email_bounced ?? false},
      ${data.email_complained ?? false},
      'e2e_test',
      ${data.created_at || new Date()},
      ${data.nurture_day3_sent ?? false},
      ${data.nurture_day7_sent ?? false},
      ${data.nurture_day14_sent ?? false},
      ${data.nurture_day30_sent ?? false}
    )
    RETURNING id
  `;

  return result[0].id;
}

export async function getLibraryLeadById(id: string): Promise<LibraryLead | null> {
  const leads = await sql`
    SELECT * FROM library_leads WHERE id = ${id} LIMIT 1
  `;
  return leads[0] as LibraryLead || null;
}

export async function getLibraryLeadByEmail(email: string): Promise<LibraryLead | null> {
  const leads = await sql`
    SELECT * FROM library_leads WHERE email = ${email} LIMIT 1
  `;
  return leads[0] as LibraryLead || null;
}

// ============================================================
// EMAIL HISTORY
// ============================================================

export async function getEmailHistory(leadId: string): Promise<EmailHistory[]> {
  const history = await sql`
    SELECT * FROM email_send_history
    WHERE lead_id = ${leadId}
    ORDER BY sent_at DESC
  `;
  return history as EmailHistory[];
}

export async function getEmailHistoryByResendId(resendEmailId: string): Promise<EmailHistory | null> {
  const history = await sql`
    SELECT * FROM email_send_history
    WHERE resend_email_id = ${resendEmailId}
    LIMIT 1
  `;
  return history[0] as EmailHistory || null;
}

export async function getEmailHistoryByEmail(email: string): Promise<EmailHistory[]> {
  const history = await sql`
    SELECT * FROM email_send_history
    WHERE recipient_email = ${email}
    ORDER BY sent_at DESC
  `;
  return history as EmailHistory[];
}

// ============================================================
// CLEANUP
// ============================================================

export async function cleanupTestContactLeads(): Promise<void> {
  await sql`
    DELETE FROM contact_leads
    WHERE source = 'e2e_test'
    OR email LIKE '%test%@example.com'
    OR email LIKE '%e2e%@example.com'
  `;
}

export async function cleanupTestLibraryLeads(): Promise<void> {
  await sql`
    DELETE FROM library_leads
    WHERE source = 'e2e_test'
    OR email LIKE '%test%@example.com'
    OR email LIKE '%e2e%@example.com'
  `;
}

export async function cleanupTestEmailHistory(): Promise<void> {
  await sql`
    DELETE FROM email_send_history
    WHERE recipient_email LIKE '%test%@example.com'
    OR recipient_email LIKE '%e2e%@example.com'
  `;
}

export async function cleanupAllTestData(): Promise<void> {
  await cleanupTestEmailHistory();
  await cleanupTestContactLeads();
  await cleanupTestLibraryLeads();
}

// ============================================================
// UTILITIES
// ============================================================

export async function waitForNurtureEmail(
  leadId: string,
  maxWaitMs: number = 5000
): Promise<EmailHistory | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const history = await getEmailHistory(leadId);
    if (history.length > 0) {
      return history[0];
    }

    // Wait 500ms before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return null;
}

export async function verifyNurtureSequence(
  leadId: string,
  expectedDay: 3 | 7 | 14 | 30
): Promise<boolean> {
  const lead = await getContactLeadById(leadId) || await getLibraryLeadById(leadId);

  if (!lead) {
    return false;
  }

  const dayKey = `nurture_day${expectedDay}_sent` as keyof typeof lead;
  return !!lead[dayKey];
}
