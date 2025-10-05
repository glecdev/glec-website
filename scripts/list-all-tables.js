const { neon } = require('@neondatabase/serverless');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Use DATABASE_URL (pooled connection)
const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function listTables() {
  console.log('Listing all tables in database...\n');

  try {
    // List all tables
    const tables = await sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} tables:\n`);
    tables.forEach(t => console.log(`  - ${t.table_name} (${t.table_type})`));

    // List all enums
    const enums = await sql`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      ORDER BY typname
    `;

    console.log(`\nFound ${enums.length} enums:\n`);
    enums.forEach(e => console.log(`  - ${e.typname}`));

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listTables();
