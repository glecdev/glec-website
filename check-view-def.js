const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('Checking VIEW definition...\n');

  // Get VIEW definition
  const viewDef = await sql`SELECT pg_get_viewdef('unified_leads') as def`;
  const def = viewDef[0].def;

  console.log('VIEW includes partnerships:', def.includes('partnerships'));
  console.log('VIEW includes proposal:', def.includes('proposal'));
  console.log('VIEW includes p.phone:', def.includes('p.phone'));
  console.log('VIEW includes NULL AS phone:', def.includes('NULL AS phone'));

  // Find partnership section
  const partnershipIndex = def.indexOf('partnerships p');
  if (partnershipIndex > -1) {
    console.log('\n--- Partnership section (200 chars before and after) ---');
    console.log(def.substring(Math.max(0, partnershipIndex - 200), partnershipIndex + 200));
    console.log('--- End ---\n');
  }

  // Count by checking actual VIEW
  const counts = await sql`
    SELECT lead_source_type, COUNT(*) as count
    FROM unified_leads
    GROUP BY lead_source_type
  `;

  console.log('Current VIEW contents:');
  counts.forEach(row => console.log(`  ${row.lead_source_type}: ${row.count}`));
})();
