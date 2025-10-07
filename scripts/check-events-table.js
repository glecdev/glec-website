require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const result = await sql`SELECT * FROM events LIMIT 1`;
    console.log('✅ Events table exists');
    if (result.length > 0) {
      console.log('Columns:', Object.keys(result[0]).join(', '));
    } else {
      console.log('Table is empty');
      const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'events' ORDER BY ordinal_position`;
      console.log('Columns:', cols.map(c => c.column_name).join(', '));
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
    console.log('Error details:', e);
  }
})();
