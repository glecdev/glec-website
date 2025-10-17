/**
 * Fix unified_leads VIEW - partnerships section
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixView() {
  console.log('🔧 Fixing unified_leads VIEW...\n');

  try {
    // Drop and recreate the view
    await sql`
      DROP VIEW IF EXISTS unified_leads CASCADE;

      CREATE OR REPLACE VIEW unified_leads AS

      -- 1. Library Leads
      SELECT
        'LIBRARY_LEAD' AS lead_source_type,
        ll.id AS lead_id,
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
        EXTRACT(DAY FROM NOW() - ll.created_at)::INTEGER AS days_old,
        ll.created_at AS last_activity
      FROM library_leads ll

      UNION ALL

      -- 2. Contact Form
      SELECT
        'CONTACT_FORM' AS lead_source_type,
        c.id AS lead_id,
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
        EXTRACT(DAY FROM NOW() - c.created_at)::INTEGER AS days_old,
        c.created_at AS last_activity
      FROM contacts c

      UNION ALL

      -- 3. Demo Requests
      SELECT
        'DEMO_REQUEST' AS lead_source_type,
        dr.id AS lead_id,
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
        EXTRACT(DAY FROM NOW() - dr.created_at)::INTEGER AS days_old,
        dr.updated_at AS last_activity
      FROM demo_requests dr

      UNION ALL

      -- 4. Event Registrations
      SELECT
        'EVENT_REGISTRATION' AS lead_source_type,
        er.id AS lead_id,
        er.company_name,
        er.contact_name,
        er.email,
        er.phone,
        er.status AS lead_status,
        CASE
          WHEN er.status = 'ATTENDED' THEN 70
          WHEN er.status = 'CONFIRMED' THEN 50
          WHEN er.status = 'PENDING' THEN 30
          ELSE 10
        END AS lead_score,
        er.created_at,
        er.updated_at,
        NULL AS inquiry_type,
        NULL AS demo_product,
        e.title AS event_name,
        NULL AS partnership_type,
        e.description AS source_detail,
        FALSE AS email_sent,
        FALSE AS email_opened,
        FALSE AS email_clicked,
        EXTRACT(DAY FROM NOW() - er.created_at)::INTEGER AS days_old,
        er.updated_at AS last_activity
      FROM event_registrations er
      INNER JOIN events e ON er.event_id = e.id

      UNION ALL

      -- 5. Partnerships (FIXED)
      SELECT
        'PARTNERSHIP' AS lead_source_type,
        p.id AS lead_id,
        p.company_name,
        p.contact_name,
        p.email,
        NULL AS phone,
        COALESCE(p.status, 'NEW') AS lead_status,
        CASE
          WHEN p.status = 'ACCEPTED' THEN 100
          WHEN p.status = 'REVIEWING' THEN 70
          WHEN p.status = 'NEW' THEN 50
          ELSE 20
        END AS lead_score,
        p.created_at,
        p.updated_at,
        NULL AS inquiry_type,
        NULL AS demo_product,
        NULL AS event_name,
        p.partnership_type,
        p.proposal AS source_detail,
        FALSE AS email_sent,
        FALSE AS email_opened,
        FALSE AS email_clicked,
        EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER AS days_old,
        p.updated_at AS last_activity
      FROM partnerships p;
    `;

    console.log('✅ unified_leads VIEW fixed!\n');

    // Test the view
    const count = await sql`
      SELECT COUNT(*) as total
      FROM unified_leads
      WHERE lead_source_type = 'PARTNERSHIP'
    `;

    console.log(`Partnerships in unified_leads: ${count[0].total}`);

    // Get sample
    if (count[0].total > 0) {
      const sample = await sql`
        SELECT *
        FROM unified_leads
        WHERE lead_source_type = 'PARTNERSHIP'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      console.log('\nSample partnership lead:');
      console.log(JSON.stringify(sample[0], null, 2));
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  }
}

fixView();
