/**
 * Check library_leads table schema
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  console.log('🔍 Checking library_leads table schema...\n');

  try {
    const result = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'library_leads'
      ORDER BY ordinal_position
    `;

    console.log('📋 library_leads columns:\n');
    result.forEach((col) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
      console.log(`    Default: ${col.column_default || 'NONE'}`);
      console.log(`    Nullable: ${col.is_nullable}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
