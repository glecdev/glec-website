const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('Checking library_leads table schema...\n');

  const columns = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'library_leads'
    ORDER BY ordinal_position
  `;

  console.log('Columns in library_leads table:');
  columns.forEach(col => {
    console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
  });

  console.log('\nSample data:');
  const sample = await sql`SELECT * FROM library_leads LIMIT 1`;
  if (sample.length > 0) {
    console.log(JSON.stringify(sample[0], null, 2));
  } else {
    console.log('   No data in library_leads table');
  }
})();
