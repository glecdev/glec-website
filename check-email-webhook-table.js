const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'email_webhook_events'
    `;

    if (tables.length > 0) {
      console.log('✅ email_webhook_events table EXISTS');

      // Check columns
      const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'email_webhook_events'
        ORDER BY ordinal_position
      `;

      console.log('\nColumns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ email_webhook_events table does NOT exist');
      console.log('\nCreating table...\n');

      await sql`
        CREATE TABLE IF NOT EXISTS email_webhook_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resend_email_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          payload JSONB NOT NULL,
          processed BOOLEAN DEFAULT FALSE,
          processed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      console.log('✅ email_webhook_events table created');

      // Create index
      await sql`
        CREATE INDEX IF NOT EXISTS idx_email_webhook_events_resend_email_id
        ON email_webhook_events(resend_email_id)
      `;

      console.log('✅ Index created on resend_email_id');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
