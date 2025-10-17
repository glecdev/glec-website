const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const cols = await sql`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE (table_name = 'contacts' AND column_name = 'inquiry_type')
       OR (table_name = 'demo_requests' AND column_name = 'product')
       OR (table_name = 'partnerships' AND column_name = 'partnership_type')
    ORDER BY table_name, column_name
  `;

  console.log('UNION Column Data Types:');
  cols.forEach(c => console.log(`  ${c.table_name}.${c.column_name}: ${c.data_type}`));
  console.log('\nNote: USER-DEFINED = ENUM, needs ::text cast for UNION');
})();
