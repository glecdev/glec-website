const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

(async () => {
  try {
    // Get schema
    const schema = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'email_webhook_events'
      ORDER BY ordinal_position
    `;

    console.log('📋 email_webhook_events schema:');
    schema.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log();

    // Get recent events
    const events = await sql`
      SELECT * FROM email_webhook_events
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log(`📧 Recent webhook events (last 5 of ${events.length} total):`);
    console.log();
    events.forEach((e, i) => {
      console.log(`${i+1}. [${e.event_type}] ${e.resend_email_id || 'N/A'}`);
      console.log(`   Time: ${e.created_at}`);
      console.log(`   Fields: ${Object.keys(e).join(', ')}`);
      console.log();
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
