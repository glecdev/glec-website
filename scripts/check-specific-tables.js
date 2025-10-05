const { neon } = require('@neondatabase/serverless');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function checkTables() {
  console.log('Checking for analytics and demo_requests tables...\n');

  const tablesToCheck = [
    'analytics_sessions',
    'analytics_page_views',
    'analytics_events',
    'analytics_conversions',
    'demo_requests'
  ];

  for (const tableName of tablesToCheck) {
    try {
      // Try to query each table
      const result = await sql.unsafe(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = result && result[0] ? result[0].count : 0;
      console.log(`✅ ${tableName}: EXISTS (${count} rows)`);
    } catch (error) {
      console.log(`❌ ${tableName}: NOT FOUND (${error.message})`);
    }
  }

  // Check for DemoRequestStatus enum
  try {
    const enumResult = await sql`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'DemoRequestStatus'
    `;
    console.log(`\n✅ DemoRequestStatus enum: EXISTS (${enumResult.length} values)`);
    enumResult.forEach(e => console.log(`   - ${e.enumlabel}`));
  } catch (error) {
    console.log(`\n❌ DemoRequestStatus enum: NOT FOUND`);
  }
}

checkTables();
