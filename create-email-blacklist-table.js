const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('Creating email_blacklist table...\n');

  try {
    // Create email_blacklist table
    await sql`
      CREATE TABLE IF NOT EXISTS email_blacklist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        reason TEXT NOT NULL,
        blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ email_blacklist table created');

    // Create index on email
    await sql`
      CREATE INDEX IF NOT EXISTS idx_email_blacklist_email
      ON email_blacklist(email)
    `;
    console.log('✅ Index created on email column');

    // Check if table exists and show structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'email_blacklist'
      ORDER BY ordinal_position
    `;

    console.log('\nTable structure:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log('\n✅ Email blacklist table setup complete!');
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
