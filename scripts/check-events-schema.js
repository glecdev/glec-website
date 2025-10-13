/**
 * Check events table schema
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    console.log('📊 Checking events table schema...\n');

    const result = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `;

    console.log('Current columns in events table:');
    result.forEach((col, idx) => {
      console.log(`${idx + 1}. ${col.column_name} (${col.data_type}) - Default: ${col.column_default || 'NULL'}, Nullable: ${col.is_nullable}`);
    });

    console.log('\n✅ Schema check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
