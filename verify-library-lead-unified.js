/**
 * Verify Library Lead in unified_leads VIEW
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);
const TEST_EMAIL = 'ghdi0506@gmail.com';

(async () => {
  console.log('🔍 Verifying Library Lead in unified_leads VIEW...\n');

  // Query unified_leads for the test lead
  const leads = await sql`
    SELECT
      lead_source_type,
      lead_id,
      company_name,
      contact_name,
      email,
      phone,
      lead_status,
      lead_score,
      source_detail,
      email_sent,
      email_opened,
      email_clicked,
      days_old,
      created_at
    FROM unified_leads
    WHERE email = ${TEST_EMAIL}
    AND lead_source_type = 'LIBRARY_LEAD'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (leads.length === 0) {
    console.log('❌ No library lead found for:', TEST_EMAIL);
    process.exit(1);
  }

  const lead = leads[0];

  console.log('✅ Library Lead found in unified_leads VIEW!\n');
  console.log('Lead Details:');
  console.log('─────────────────────────────────────');
  console.log(`Source Type:     ${lead.lead_source_type}`);
  console.log(`Lead ID:         ${lead.lead_id}`);
  console.log(`Company:         ${lead.company_name}`);
  console.log(`Contact:         ${lead.contact_name}`);
  console.log(`Email:           ${lead.email}`);
  console.log(`Phone:           ${lead.phone}`);
  console.log(`Status:          ${lead.lead_status}`);
  console.log(`Score:           ${lead.lead_score}`);
  console.log(`Library Item:    ${lead.source_detail}`);
  console.log(`Email Sent:      ${lead.email_sent ? '✅ Yes' : '❌ No'}`);
  console.log(`Email Opened:    ${lead.email_opened ? '✅ Yes' : '❌ No'}`);
  console.log(`Link Clicked:    ${lead.email_clicked ? '✅ Yes' : '❌ No'}`);
  console.log(`Days Old:        ${lead.days_old}`);
  console.log(`Created At:      ${lead.created_at}`);
  console.log('─────────────────────────────────────\n');

  // Verification checklist
  console.log('Verification Checklist:');
  console.log(`  ✅ Lead source type: ${lead.lead_source_type === 'LIBRARY_LEAD' ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Company name:     ${lead.company_name === 'GLEC E2E Test Company' ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Contact name:     ${lead.contact_name === 'Test User' ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Email sent:       ${lead.email_sent ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Lead status:      ${lead.lead_status === 'NEW' ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Lead score:       ${lead.lead_score > 0 ? 'PASS (score: ' + lead.lead_score + ')' : 'FAIL'}`);
  console.log('');

  console.log('🎉 Library Lead E2E verification complete!');
})();
