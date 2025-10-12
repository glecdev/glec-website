/**
 * Create Unified Leads View (Simple Approach)
 * Purpose: JavaScript로 직접 CREATE VIEW 실행
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createUnifiedView() {
  console.log('🔄 Creating Unified Leads View...\n');

  try {
    // Drop existing view
    try {
      await sql`DROP VIEW IF EXISTS unified_leads CASCADE`;
      console.log('✅ Dropped existing view\n');
    } catch (err) {
      console.log('⏭️  No existing view to drop\n');
    }

    // Create unified view
    await sql`
      CREATE VIEW unified_leads AS

      -- Library Leads
      SELECT
        'LIBRARY_LEAD' AS lead_source_type,
        ll.id::TEXT AS lead_id,
        ll.company_name,
        ll.contact_name,
        ll.email,
        ll.phone,
        ll.lead_status,
        ll.lead_score,
        ll.created_at,
        ll.created_at AS updated_at,
        NULL AS inquiry_type,
        NULL AS demo_product,
        NULL AS event_name,
        NULL AS partnership_type,
        ll.library_item_title AS source_detail,
        ll.email_sent,
        ll.email_opened,
        ll.download_link_clicked AS email_clicked,
        EXTRACT(DAY FROM NOW() - ll.created_at)::INTEGER AS days_old
      FROM library_leads ll

      UNION ALL

      -- Contact Form
      SELECT
        'CONTACT_FORM' AS lead_source_type,
        c.id::TEXT AS lead_id,
        c.company_name,
        c.contact_name,
        c.email,
        c.phone,
        'NEW' AS lead_status,
        CASE
          WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 7 THEN 40
          WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 30 THEN 20
          ELSE 10
        END AS lead_score,
        c.created_at,
        c.created_at AS updated_at,
        c.inquiry_type,
        NULL AS demo_product,
        NULL AS event_name,
        NULL AS partnership_type,
        c.message AS source_detail,
        FALSE AS email_sent,
        FALSE AS email_opened,
        FALSE AS email_clicked,
        EXTRACT(DAY FROM NOW() - c.created_at)::INTEGER AS days_old
      FROM contacts c

      UNION ALL

      -- Demo Requests
      SELECT
        'DEMO_REQUEST' AS lead_source_type,
        dr.id::TEXT AS lead_id,
        dr.company_name,
        dr.contact_name,
        dr.email,
        dr.phone,
        dr.status AS lead_status,
        CASE
          WHEN dr.status = 'COMPLETED' THEN 90
          WHEN dr.status = 'SCHEDULED' THEN 80
          WHEN dr.status = 'CONTACTED' THEN 60
          WHEN dr.status = 'NEW' THEN 50
          ELSE 20
        END AS lead_score,
        dr.created_at,
        dr.updated_at,
        NULL AS inquiry_type,
        dr.product AS demo_product,
        NULL AS event_name,
        NULL AS partnership_type,
        dr.message AS source_detail,
        FALSE AS email_sent,
        FALSE AS email_opened,
        FALSE AS email_clicked,
        EXTRACT(DAY FROM NOW() - dr.created_at)::INTEGER AS days_old
      FROM demo_requests dr
    `;

    console.log('✅ Unified Leads View Created!\n');

    // Verify
    const distribution = await sql`
      SELECT
        lead_source_type,
        COUNT(*) as count,
        AVG(lead_score)::INTEGER as avg_score
      FROM unified_leads
      GROUP BY lead_source_type
      ORDER BY count DESC
    `;

    console.log('📊 Lead Distribution:\n');
    let total = 0;
    distribution.forEach((row) => {
      console.log(`  ${row.lead_source_type.padEnd(20)} ${row.count.toString().padStart(5)} leads | Avg Score: ${row.avg_score}`);
      total += parseInt(row.count);
    });
    console.log(`  ${'─'.repeat(50)}`);
    console.log(`  ${'TOTAL'.padEnd(20)} ${total.toString().padStart(5)} leads\n`);

    // Sample leads
    const samples = await sql`
      SELECT
        lead_source_type,
        company_name,
        contact_name,
        lead_score,
        days_old
      FROM unified_leads
      ORDER BY lead_score DESC
      LIMIT 5
    `;

    console.log('🏆 Top 5 Leads:\n');
    samples.forEach((lead, idx) => {
      console.log(`  ${idx + 1}. [${lead.lead_source_type}] ${lead.company_name}`);
      console.log(`     Contact: ${lead.contact_name} | Score: ${lead.lead_score} | ${lead.days_old} days old\n`);
    });

    console.log('✅ View is ready!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createUnifiedView()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal:', err);
    process.exit(1);
  });
