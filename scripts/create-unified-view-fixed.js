/**
 * Create Unified Leads View (Fixed with correct schema)
 * Purpose: 4가지 리드 소스 통합 (Library, Contact, Demo, Event)
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createUnifiedView() {
  console.log('🔄 Creating Unified Leads View (Fixed Schema)...\n');

  try {
    // Drop existing view
    await sql`DROP VIEW IF EXISTS unified_leads CASCADE`;
    console.log('✅ Dropped existing view\n');

    // Create unified view with correct columns
    await sql`
      CREATE VIEW unified_leads AS

      -- 1. Library Leads
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
        ll.updated_at,
        NULL AS inquiry_type,
        NULL::TEXT AS demo_product,
        NULL::TEXT AS event_name,
        ll.library_item_id::TEXT AS source_detail,
        ll.email_sent,
        ll.email_opened,
        ll.download_link_clicked AS email_clicked,
        EXTRACT(DAY FROM NOW() - ll.created_at)::INTEGER AS days_old
      FROM library_leads ll

      UNION ALL

      -- 2. Contact Form
      SELECT
        'CONTACT_FORM' AS lead_source_type,
        c.id::TEXT AS lead_id,
        c.company_name,
        c.contact_name,
        c.email,
        c.phone,
        c.status::TEXT AS lead_status,
        COALESCE(c.lead_score, CASE
          WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 7 THEN 40
          WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 30 THEN 20
          ELSE 10
        END) AS lead_score,
        c.created_at,
        c.updated_at,
        c.inquiry_type::TEXT,
        NULL::TEXT AS demo_product,
        NULL::TEXT AS event_name,
        c.message AS source_detail,
        FALSE AS email_sent,
        FALSE AS email_opened,
        FALSE AS email_clicked,
        EXTRACT(DAY FROM NOW() - c.created_at)::INTEGER AS days_old
      FROM contacts c

      UNION ALL

      -- 3. Demo Requests
      SELECT
        'DEMO_REQUEST' AS lead_source_type,
        dr.id::TEXT AS lead_id,
        dr.company_name,
        dr.contact_name,
        dr.email,
        dr.phone,
        dr.status::TEXT AS lead_status,
        CASE
          WHEN dr.status::TEXT = 'COMPLETED' THEN 90
          WHEN dr.status::TEXT = 'SCHEDULED' THEN 80
          WHEN dr.status::TEXT = 'CONTACTED' THEN 60
          WHEN dr.status::TEXT = 'NEW' THEN 50
          ELSE 20
        END AS lead_score,
        dr.created_at,
        dr.updated_at,
        NULL AS inquiry_type,
        array_to_string(dr.product_interests, ', ') AS demo_product,
        NULL::TEXT AS event_name,
        dr.use_case AS source_detail,
        FALSE AS email_sent,
        FALSE AS email_opened,
        FALSE AS email_clicked,
        EXTRACT(DAY FROM NOW() - dr.created_at)::INTEGER AS days_old
      FROM demo_requests dr

      UNION ALL

      -- 4. Event Registrations
      SELECT
        'EVENT_REGISTRATION' AS lead_source_type,
        er.id::TEXT AS lead_id,
        er.company AS company_name,
        er.name AS contact_name,
        er.email,
        er.phone,
        er.status::TEXT AS lead_status,
        CASE
          WHEN er.status::TEXT = 'ATTENDED' THEN 70
          WHEN er.status::TEXT = 'CONFIRMED' THEN 50
          WHEN er.status::TEXT = 'PENDING' THEN 30
          ELSE 10
        END AS lead_score,
        er.created_at,
        er.updated_at,
        NULL AS inquiry_type,
        NULL::TEXT AS demo_product,
        e.title AS event_name,
        er.message AS source_detail,
        FALSE AS email_sent,
        FALSE AS email_opened,
        FALSE AS email_clicked,
        EXTRACT(DAY FROM NOW() - er.created_at)::INTEGER AS days_old
      FROM event_registrations er
      INNER JOIN events e ON er.event_id = e.id
    `;

    console.log('✅ Unified Leads View Created!\n');

    // Verify and show distribution
    const distribution = await sql`
      SELECT
        lead_source_type,
        COUNT(*) as count,
        COALESCE(AVG(lead_score)::INTEGER, 0) as avg_score,
        COALESCE(MAX(lead_score), 0) as max_score
      FROM unified_leads
      GROUP BY lead_source_type
      ORDER BY count DESC
    `;

    console.log('📊 Lead Distribution by Source:\n');

    let total = 0;
    distribution.forEach((row) => {
      const count = parseInt(row.count);
      console.log(`  ${row.lead_source_type.padEnd(20)} ${count.toString().padStart(5)} leads | Avg: ${row.avg_score} | Max: ${row.max_score}`);
      total += count;
    });

    console.log(`  ${'─'.repeat(60)}`);
    console.log(`  ${'TOTAL'.padEnd(20)} ${total.toString().padStart(5)} leads\n`);

    if (total === 0) {
      console.log('⚠️  No leads found in database. This is expected for fresh installations.\n');
      console.log('💡 To populate with test data:');
      console.log('   1. Create library lead: Visit /library/[slug] and download');
      console.log('   2. Submit contact form: Visit /contact');
      console.log('   3. Request demo: Visit /demo-request');
      console.log('   4. Register for event: Visit /events/[slug]/register\n');
    } else {
      // Sample leads
      const samples = await sql`
        SELECT
          lead_source_type,
          company_name,
          contact_name,
          lead_score,
          lead_status,
          days_old
        FROM unified_leads
        ORDER BY lead_score DESC, created_at DESC
        LIMIT 5
      `;

      console.log('🏆 Top 5 Leads by Score:\n');
      samples.forEach((lead, idx) => {
        console.log(`  ${idx + 1}. [${lead.lead_source_type}] ${lead.company_name} - ${lead.contact_name}`);
        console.log(`     Score: ${lead.lead_score} | Status: ${lead.lead_status} | ${lead.days_old} days old\n`);
      });
    }

    console.log('✅ View is ready for API integration!\n');
    console.log('📌 Next Steps:');
    console.log('   1. Create /api/admin/leads endpoint');
    console.log('   2. Build /admin/leads dashboard UI');
    console.log('   3. Add statistics and funnel analytics\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

createUnifiedView()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal:', err);
    process.exit(1);
  });
