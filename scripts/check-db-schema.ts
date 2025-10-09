import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL!);

async function checkSchema() {
  console.log('📋 Checking database schema...\n');
  
  // List all tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  
  console.log('✅ Existing tables:');
  tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
  
  console.log('\n📊 Row counts:');
  for (const table of tables) {
    const count = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`;
    console.log(`  ${table.table_name}: ${count[0].count} rows`);
  }
}

checkSchema().then(() => process.exit(0)).catch(console.error);
