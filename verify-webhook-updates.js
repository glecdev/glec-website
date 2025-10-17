/**
 * Verify Webhook Updates
 *
 * Check if webhook events successfully updated library_leads table
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);
const TEST_EMAIL = 'ghdi0506@gmail.com';

(async () => {
  console.log('🔍 Verifying Webhook Updates...\n');

  // ========================================
  // 1. Check library_leads updates
  // ========================================
  const leads = await sql`
    SELECT
      id,
      company_name,
      email,
      lead_status,
      lead_score,
      email_opened,
      email_opened_at,
      download_link_clicked,
      download_link_clicked_at,
      email_sent,
      email_sent_at,
      created_at
    FROM library_leads
    WHERE email = ${TEST_EMAIL}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (leads.length === 0) {
    console.log('❌ No lead found for:', TEST_EMAIL);
    console.log('   Please run test-library-e2e.js first to create a lead.\n');
    process.exit(1);
  }

  const lead = leads[0];

  console.log('📊 Library Lead Details:');
  console.log('─'.repeat(50));
  console.log(`Lead ID:          ${lead.id}`);
  console.log(`Company:          ${lead.company_name}`);
  console.log(`Email:            ${lead.email}`);
  console.log(`Lead Status:      ${lead.lead_status}`);
  console.log(`Lead Score:       ${lead.lead_score}`);
  console.log('');
  console.log('Email Tracking:');
  console.log(`  Email Sent:     ${lead.email_sent ? '✅ Yes' : '❌ No'} (${lead.email_sent_at || 'N/A'})`);
  console.log(`  Email Opened:   ${lead.email_opened ? '✅ Yes' : '❌ No'} (${lead.email_opened_at || 'N/A'})`);
  console.log(`  Link Clicked:   ${lead.download_link_clicked ? '✅ Yes' : '❌ No'} (${lead.download_link_clicked_at || 'N/A'})`);
  console.log('');

  // ========================================
  // 2. Check email_webhook_events audit log
  // ========================================
  const webhookEvents = await sql`
    SELECT
      id,
      event_type,
      processed,
      processed_at,
      created_at
    FROM email_webhook_events
    ORDER BY created_at DESC
    LIMIT 10
  `;

  console.log('📧 Recent Webhook Events (Last 10):');
  console.log('─'.repeat(50));

  if (webhookEvents.length === 0) {
    console.log('  (No webhook events recorded yet)');
  } else {
    webhookEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.event_type.padEnd(20)} | Processed: ${event.processed ? '✅' : '⏳'} | ${event.created_at}`);
    });
  }
  console.log('');

  // ========================================
  // 3. Verification Checklist
  // ========================================
  console.log('✅ Verification Checklist:');
  console.log('─'.repeat(50));

  const checks = [
    {
      name: 'Email sent',
      pass: lead.email_sent === true,
    },
    {
      name: 'Email opened tracked',
      pass: lead.email_opened === true,
    },
    {
      name: 'Download link clicked tracked',
      pass: lead.download_link_clicked === true,
    },
    {
      name: 'Lead score increased (>60)',
      pass: lead.lead_score > 60,
    },
    {
      name: 'Webhook events recorded',
      pass: webhookEvents.length > 0,
    },
  ];

  checks.forEach((check) => {
    console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
  });

  const allPassed = checks.every((c) => c.pass);

  console.log('');
  console.log('─'.repeat(50));

  if (allPassed) {
    console.log('🎉 All checks PASSED! Email tracking is working correctly.\n');
  } else {
    console.log('⚠️  Some checks FAILED. Review the details above.\n');

    console.log('💡 Troubleshooting:');
    console.log('  - If "Email opened" is FALSE: Run test-webhook-simulation.js');
    console.log('  - If "Link clicked" is FALSE: Run test-webhook-simulation.js');
    console.log('  - If "Webhook events" is 0: Check webhook endpoint /api/webhooks/resend');
    console.log('');
  }
})();
