const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    console.log('Checking library_leads table columns...\n');

    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'library_leads'
      AND column_name IN (
        'resend_email_id',
        'email_status',
        'email_delivered',
        'email_delivered_at',
        'email_complained',
        'email_complained_at',
        'email_bounced',
        'email_bounced_at',
        'bounce_reason',
        'lead_status'
      )
      ORDER BY column_name
    `;

    console.log('Existing columns:');
    columns.forEach(col => {
      console.log(`  ✅ ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check missing columns
    const existingColumnNames = columns.map(c => c.column_name);
    const requiredColumns = [
      'resend_email_id',
      'email_status',
      'email_delivered',
      'email_delivered_at',
      'email_complained',
      'email_complained_at',
      'email_bounced',
      'email_bounced_at',
      'bounce_reason'
    ];

    const missingColumns = requiredColumns.filter(col => !existingColumnNames.includes(col));

    if (missingColumns.length > 0) {
      console.log('\n❌ Missing columns:');
      missingColumns.forEach(col => console.log(`  - ${col}`));

      console.log('\nAdding missing columns...\n');

      // Add resend_email_id
      if (missingColumns.includes('resend_email_id')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS resend_email_id TEXT`;
        console.log('  ✅ Added: resend_email_id TEXT');
      }

      // Add email_status (ENUM)
      if (missingColumns.includes('email_status')) {
        // Create ENUM type if not exists
        await sql`
          DO $$ BEGIN
            CREATE TYPE email_delivery_status AS ENUM (
              'pending', 'sent', 'delivered', 'bounced',
              'failed', 'complained', 'opened', 'clicked'
            );
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `;
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS email_status email_delivery_status`;
        console.log('  ✅ Added: email_status email_delivery_status');
      }

      // Add email_delivered
      if (missingColumns.includes('email_delivered')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS email_delivered BOOLEAN DEFAULT FALSE`;
        console.log('  ✅ Added: email_delivered BOOLEAN');
      }

      // Add email_delivered_at
      if (missingColumns.includes('email_delivered_at')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMP WITH TIME ZONE`;
        console.log('  ✅ Added: email_delivered_at TIMESTAMP');
      }

      // Add email_complained
      if (missingColumns.includes('email_complained')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS email_complained BOOLEAN DEFAULT FALSE`;
        console.log('  ✅ Added: email_complained BOOLEAN');
      }

      // Add email_complained_at
      if (missingColumns.includes('email_complained_at')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS email_complained_at TIMESTAMP WITH TIME ZONE`;
        console.log('  ✅ Added: email_complained_at TIMESTAMP');
      }

      // Add email_bounced
      if (missingColumns.includes('email_bounced')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS email_bounced BOOLEAN DEFAULT FALSE`;
        console.log('  ✅ Added: email_bounced BOOLEAN');
      }

      // Add email_bounced_at
      if (missingColumns.includes('email_bounced_at')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS email_bounced_at TIMESTAMP WITH TIME ZONE`;
        console.log('  ✅ Added: email_bounced_at TIMESTAMP');
      }

      // Add bounce_reason
      if (missingColumns.includes('bounce_reason')) {
        await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS bounce_reason TEXT`;
        console.log('  ✅ Added: bounce_reason TEXT');
      }

      console.log('\n✅ All missing columns added!');
    } else {
      console.log('\n✅ All required columns exist!');
    }

    // Check lead_status ENUM values
    console.log('\nChecking lead_status ENUM values...');
    const enumValues = await sql`
      SELECT unnest(enum_range(NULL::lead_status))::text AS enum_value
    `;
    console.log('Current lead_status values:', enumValues.map(v => v.enum_value).join(', '));

    // Check if we need to add BOUNCED, SPAM_COMPLAINT
    const currentValues = enumValues.map(v => v.enum_value);
    const requiredValues = ['NEW', 'OPENED', 'DOWNLOADED', 'BOUNCED', 'SPAM_COMPLAINT'];
    const missingValues = requiredValues.filter(v => !currentValues.includes(v));

    if (missingValues.length > 0) {
      console.log('\n❌ Missing lead_status ENUM values:', missingValues.join(', '));
      console.log('Adding missing ENUM values...\n');

      for (const value of missingValues) {
        try {
          await sql.unsafe(`ALTER TYPE lead_status ADD VALUE IF NOT EXISTS '${value}'`);
          console.log(`  ✅ Added ENUM value: ${value}`);
        } catch (err) {
          // Ignore if already exists
          console.log(`  ⏭️  ENUM value already exists: ${value}`);
        }
      }
    } else {
      console.log('✅ All required ENUM values exist!');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
})();
