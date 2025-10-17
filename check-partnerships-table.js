/**
 * Check partnerships table schema
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkTable() {
  console.log('🔍 Checking partnerships table schema...\n');

  try {
    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'partnerships'
      ORDER BY ordinal_position
    `;

    console.log('Columns in partnerships table:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');

    // Get recent partnership
    const recent = await sql`
      SELECT * FROM partnerships
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (recent.length > 0) {
      console.log('Most recent partnership:');
      console.log(JSON.stringify(recent[0], null, 2));
      console.log('');
    }

    // Check unified_leads for partnerships
    const unifiedCount = await sql`
      SELECT COUNT(*) as count
      FROM unified_leads
      WHERE lead_source_type = 'PARTNERSHIP'
    `;

    console.log(`Partnerships in unified_leads VIEW: ${unifiedCount[0].count}`);

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  }
}

checkTable();
