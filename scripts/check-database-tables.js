/**
 * Check all tables in database
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function checkTables() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  console.log('📊 Checking database tables...\n');
  console.log('DATABASE_URL:', DATABASE_URL.substring(0, 50) + '...\n');

  const sql = neon(DATABASE_URL);

  try {
    // List all tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} tables:\n`);
    tables.forEach((table, i) => {
      console.log(`  ${i + 1}. ${table.table_name}`);
    });

    console.log('\n✅ Database check complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
