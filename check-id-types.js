const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const cols = await sql`
    SELECT table_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('library_leads', 'contacts', 'demo_requests', 'event_registrations', 'partnerships')
      AND column_name = 'id'
    ORDER BY table_name
  `;

  console.log('ID column types across all lead tables:');
  cols.forEach(c => console.log(`  ${c.table_name}.id: ${c.data_type}`));
})();
