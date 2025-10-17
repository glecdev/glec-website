/**
 * Comprehensive VIEW diagnosis
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function diagnose() {
  console.log('🔍 Comprehensive VIEW Diagnosis\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // 1. Check if VIEW exists
    console.log('1. Checking if VIEW exists...');
    const viewExists = await sql`
      SELECT COUNT(*) as count
      FROM pg_views
      WHERE viewname = 'unified_leads'
    `;
    console.log(`   VIEW exists: ${viewExists[0].count > 0 ? 'YES' : 'NO'}\n`);

    // 2. Check each source table
    console.log('2. Checking source tables...');

    const sources = [
      { name: 'library_leads', type: 'LIBRARY_LEAD' },
      { name: 'contacts', type: 'CONTACT_FORM' },
      { name: 'demo_requests', type: 'DEMO_REQUEST' },
      { name: 'event_registrations', type: 'EVENT_REGISTRATION' },
      { name: 'partnerships', type: 'PARTNERSHIP' }
    ];

    for (const source of sources) {
      const count = await sql.unsafe(`SELECT COUNT(*) as count FROM ${source.name}`);
      console.log(`   ${source.name}: ${count[0].count} records`);
    }
    console.log('');

    // 3. Try each UNION ALL section separately
    console.log('3. Testing each VIEW section individually...\n');

    // Test partnerships directly
    console.log('   Testing PARTNERSHIP section:');
    try {
      const partnershipTest = await sql`
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
        FROM partnerships p
        LIMIT 1
      `;
      console.log(`   ✅ Partnership SELECT works: ${partnershipTest.length} rows`);
      if (partnershipTest.length > 0) {
        console.log(`      Sample: ${partnershipTest[0].company_name}`);
      }
    } catch (err) {
      console.log(`   ❌ Partnership SELECT failed: ${err.message}`);
    }
    console.log('');

    // 4. Check actual VIEW content
    console.log('4. Checking unified_leads VIEW content...');

    const allSources = await sql`
      SELECT lead_source_type, COUNT(*) as count
      FROM unified_leads
      GROUP BY lead_source_type
      ORDER BY count DESC
    `;

    console.log('   Current VIEW contents:');
    allSources.forEach(row => {
      console.log(`      ${row.lead_source_type}: ${row.count}`);
    });
    console.log('');

    // 5. Try to manually UNION
    console.log('5. Testing manual UNION ALL...');
    try {
      const manualUnion = await sql`
        SELECT 'CONTACT_FORM' AS lead_source_type, COUNT(*) as count FROM contacts
        UNION ALL
        SELECT 'PARTNERSHIP' AS lead_source_type, COUNT(*) as count FROM partnerships
      `;
      console.log('   Manual UNION works:');
      manualUnion.forEach(row => {
        console.log(`      ${row.lead_source_type}: ${row.count}`);
      });
    } catch (err) {
      console.log(`   ❌ Manual UNION failed: ${err.message}`);
    }
    console.log('');

    // 6. Check VIEW definition
    console.log('6. Checking VIEW definition...');
    const viewDef = await sql`
      SELECT pg_get_viewdef('unified_leads', true) as definition
    `;

    const def = viewDef[0].definition;
    const hasPartnership = def.includes('partnerships');
    const hasProposal = def.includes('proposal');
    const hasPhoneNull = def.includes('NULL AS phone');

    console.log(`   VIEW mentions 'partnerships': ${hasPartnership}`);
    console.log(`   VIEW mentions 'proposal': ${hasProposal}`);
    console.log(`   VIEW has 'NULL AS phone': ${hasPhoneNull}`);

    if (def.includes('partnerships')) {
      const partnershipSection = def.substring(def.lastIndexOf('partnerships') - 200, def.lastIndexOf('partnerships') + 200);
      console.log('\n   Partnership section snippet:');
      console.log('   ' + partnershipSection.replace(/\n/g, '\n   '));
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  }
}

diagnose();
