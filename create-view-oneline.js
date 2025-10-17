/**
 * Create VIEW as single line (no comments, no formatting)
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createOneLine() {
  console.log('Creating VIEW as single-line SQL...\n');

  try {
    // Drop first
    await sql`DROP VIEW IF EXISTS unified_leads CASCADE`;
    console.log('✅ VIEW dropped\n');

    // Create in one statement - inline all parts with proper type casts
    const result = await sql`
      CREATE VIEW unified_leads AS
      SELECT 'LIBRARY_LEAD' AS lead_source_type, ll.id::text AS lead_id, ll.company_name, ll.contact_name, ll.email, ll.phone, ll.lead_status, ll.lead_score, ll.created_at, ll.created_at AS updated_at, NULL::text AS inquiry_type, NULL::text AS demo_product, NULL::text AS event_name, NULL::text AS partnership_type, li.title AS source_detail, ll.email_sent, ll.email_opened, ll.download_link_clicked AS email_clicked, EXTRACT(DAY FROM NOW() - ll.created_at)::INTEGER AS days_old, ll.created_at AS last_activity FROM library_leads ll LEFT JOIN library_items li ON ll.library_item_id = li.id
      UNION ALL
      SELECT 'CONTACT_FORM' AS lead_source_type, c.id::text AS lead_id, c.company_name, c.contact_name, c.email, c.phone, 'NEW' AS lead_status, CASE WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 7 THEN 40 WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 30 THEN 20 ELSE 10 END AS lead_score, c.created_at, c.created_at AS updated_at, c.inquiry_type::text, NULL::text AS demo_product, NULL::text AS event_name, NULL::text AS partnership_type, c.message AS source_detail, FALSE AS email_sent, FALSE AS email_opened, FALSE AS email_clicked, EXTRACT(DAY FROM NOW() - c.created_at)::INTEGER AS days_old, c.created_at AS last_activity FROM contacts c
      UNION ALL
      SELECT 'DEMO_REQUEST' AS lead_source_type, dr.id::text AS lead_id, dr.company_name, dr.contact_name, dr.email, dr.phone, dr.status::text AS lead_status, CASE WHEN dr.status::text = 'COMPLETED' THEN 90 WHEN dr.status::text = 'SCHEDULED' THEN 80 WHEN dr.status::text = 'CONTACTED' THEN 60 WHEN dr.status::text = 'NEW' THEN 50 ELSE 20 END AS lead_score, dr.created_at, dr.updated_at, NULL::text AS inquiry_type, array_to_string(dr.product_interests, ', ') AS demo_product, NULL::text AS event_name, NULL::text AS partnership_type, dr.additional_message AS source_detail, FALSE AS email_sent, FALSE AS email_opened, FALSE AS email_clicked, EXTRACT(DAY FROM NOW() - dr.created_at)::INTEGER AS days_old, dr.updated_at AS last_activity FROM demo_requests dr
      UNION ALL
      SELECT 'EVENT_REGISTRATION' AS lead_source_type, er.id::text AS lead_id, er.company AS company_name, er.name AS contact_name, er.email, er.phone, er.status::text AS lead_status, CASE WHEN er.status::text = 'ATTENDED' THEN 70 WHEN er.status::text = 'CONFIRMED' THEN 50 WHEN er.status::text = 'PENDING' THEN 30 ELSE 10 END AS lead_score, er.created_at, er.updated_at, NULL::text AS inquiry_type, NULL::text AS demo_product, e.title AS event_name, NULL::text AS partnership_type, e.description AS source_detail, FALSE AS email_sent, FALSE AS email_opened, FALSE AS email_clicked, EXTRACT(DAY FROM NOW() - er.created_at)::INTEGER AS days_old, er.updated_at AS last_activity FROM event_registrations er INNER JOIN events e ON er.event_id = e.id
      UNION ALL
      SELECT 'PARTNERSHIP' AS lead_source_type, p.id::text AS lead_id, p.company_name, p.contact_name, p.email, NULL AS phone, COALESCE(p.status::text, 'NEW') AS lead_status, CASE WHEN p.status = 'ACCEPTED' THEN 100 WHEN p.status = 'IN_PROGRESS' THEN 70 WHEN p.status = 'NEW' THEN 50 ELSE 20 END AS lead_score, p.created_at, p.updated_at, NULL::text AS inquiry_type, NULL::text AS demo_product, NULL::text AS event_name, p.partnership_type::text, p.proposal AS source_detail, FALSE AS email_sent, FALSE AS email_opened, FALSE AS email_clicked, EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER AS days_old, p.updated_at AS last_activity FROM partnerships p
    `;

    console.log('✅ CREATE executed\n');

    // Verify
    const check = await sql`
      SELECT COUNT(*) as count FROM pg_views WHERE viewname = 'unified_leads'
    `;

    console.log(`VIEW exists: ${check[0].count > 0}\n`);

    if (check[0].count > 0) {
      const counts = await sql`
        SELECT lead_source_type, COUNT(*) as count
        FROM unified_leads
        GROUP BY lead_source_type
        ORDER BY count DESC
      `;

      console.log('Lead counts:');
      counts.forEach(row => {
        console.log(`  ${row.lead_source_type}: ${row.count}`);
      });

      const hasPartnership = counts.some(r => r.lead_source_type === 'PARTNERSHIP');
      console.log('');
      console.log(hasPartnership ? '🎉 SUCCESS! Partnerships included!' : '⚠️  Partnerships still missing');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  }
}

createOneLine();
