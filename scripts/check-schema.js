/**
 * Check Database Schema
 * Purpose: library_leads 및 기타 리드 테이블 구조 확인
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  console.log('🔍 Checking Database Schema...\n');

  const tables = ['library_leads', 'contacts', 'demo_requests', 'event_registrations', 'partnerships'];

  for (const table of tables) {
    try {
      console.log(`📋 ${table}:`);

      const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = ${table}
        ORDER BY ordinal_position
      `;

      if (columns.length === 0) {
        console.log(`  ❌ Table not found\n`);
        continue;
      }

      columns.forEach((col) => {
        console.log(`  - ${col.column_name.padEnd(30)} ${col.data_type}`);
      });

      // Get sample data
      const sample = await sql.unsafe(`SELECT * FROM ${table} LIMIT 1`);
      console.log(`  Rows: ${sample.length > 0 ? 'Has data ✅' : 'Empty ❌'}\n`);
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}\n`);
    }
  }
}

checkSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal:', err);
    process.exit(1);
  });
