require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND (table_name LIKE '%admin%' OR table_name LIKE '%user%')
  `;
  console.log('Admin/User tables:');
  console.log(JSON.stringify(tables, null, 2));

  const columns = await sql`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name='users' ORDER BY ordinal_position
  `;
  console.log('\nUsers table columns:');
  console.log(JSON.stringify(columns, null, 2));
}

checkTables();
