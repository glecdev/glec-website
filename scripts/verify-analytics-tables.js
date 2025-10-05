const { neon } = require('@neondatabase/serverless');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function verifyTables() {
  console.log('Verifying analytics and demo requests tables...\n');

  try {
    // Check for tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('analytics_sessions', 'analytics_page_views', 'analytics_events', 'analytics_conversions', 'demo_requests')
      ORDER BY table_name
    `;

    console.log('✅ Found tables:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Check DemoRequestStatus enum
    const enums = await sql`
      SELECT typname
      FROM pg_type
      WHERE typname = 'DemoRequestStatus'
    `;

    console.log('\n✅ Found enums:');
    enums.forEach(e => console.log(`  - ${e.typname}`));

    // Check indexes for analytics_sessions
    const indexes = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('analytics_sessions', 'analytics_page_views', 'analytics_events', 'analytics_conversions', 'demo_requests')
      ORDER BY tablename, indexname
    `;

    console.log('\n✅ Created indexes:');
    indexes.forEach(i => console.log(`  - ${i.indexname}`));

    // Count rows in each table
    console.log('\n📊 Row counts:');
    for (const tableName of ['analytics_sessions', 'analytics_page_views', 'analytics_events', 'analytics_conversions', 'demo_requests']) {
      const count = await sql.unsafe(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  - ${tableName}: ${count[0].count} rows`);
    }

    console.log('\n🎉 Verification completed successfully!');

  } catch (error) {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  }
}

verifyTables();
