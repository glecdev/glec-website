const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

(async () => {
  // Check partnerships table
  const partnerships = await sql`SELECT COUNT(*) as count FROM partnerships`;
  console.log('Partnerships in table:', partnerships[0].count);

  // Check VIEW
  const unified = await sql`
    SELECT *
    FROM unified_leads
    WHERE lead_source_type = 'PARTNERSHIP'
    LIMIT 1
  `;
  console.log('Partnerships in VIEW:', unified.length);
  if (unified.length > 0) {
    console.log(JSON.stringify(unified[0], null, 2));
  }

  // Try raw SQL
  const raw = await sql`
    SELECT 'PARTNERSHIP' AS lead_source_type,
      p.id AS lead_id,
      p.company_name,
      p.contact_name,
      p.email,
      NULL AS phone
    FROM partnerships p
    LIMIT 1
  `;
  console.log('Raw query result:', raw.length);
  if (raw.length > 0) {
    console.log(JSON.stringify(raw[0], null, 2));
  }
})();
