/**
 * Recreate unified_leads VIEW
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function recreateView() {
  console.log('🔄 Recreating unified_leads VIEW...\n');

  try {
    // Read SQL file
    const sqlScript = fs.readFileSync('scripts/create-unified-leads-view.sql', 'utf8');

    // Execute as unsafe (allows full SQL)
    await sql.unsafe(sqlScript);

    console.log('✅ VIEW recreated successfully!\n');

    // Test it
    const count = await sql`
      SELECT lead_source_type, COUNT(*) as count
      FROM unified_leads
      GROUP BY lead_source_type
      ORDER BY count DESC
    `;

    console.log('Lead counts by source:');
    count.forEach(row => {
      console.log(`   ${row.lead_source_type}: ${row.count}`);
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  }
}

recreateView();
