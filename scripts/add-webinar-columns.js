/**
 * Manually add webinar columns to events table
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addColumns() {
  try {
    console.log('🚀 Adding webinar columns to events table...\n');

    // Step 1: Add meeting_type
    console.log('⏳ Step 1: Adding meeting_type column...');
    try {
      await sql`
        ALTER TABLE events
        ADD COLUMN meeting_type VARCHAR(20) DEFAULT 'OFFLINE'
        CHECK (meeting_type IN ('OFFLINE', 'WEBINAR'))
      `;
      console.log('✅ meeting_type column added\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  meeting_type column already exists\n');
      } else {
        throw error;
      }
    }

    // Step 2: Add zoom_webinar_id
    console.log('⏳ Step 2: Adding zoom_webinar_id column...');
    try {
      await sql`
        ALTER TABLE events
        ADD COLUMN zoom_webinar_id VARCHAR(50) NULL
      `;
      console.log('✅ zoom_webinar_id column added\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  zoom_webinar_id column already exists\n');
      } else {
        throw error;
      }
    }

    // Step 3: Add zoom_webinar_join_url
    console.log('⏳ Step 3: Adding zoom_webinar_join_url column...');
    try {
      await sql`
        ALTER TABLE events
        ADD COLUMN zoom_webinar_join_url TEXT NULL
      `;
      console.log('✅ zoom_webinar_join_url column added\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  zoom_webinar_join_url column already exists\n');
      } else {
        throw error;
      }
    }

    // Step 4: Add zoom_webinar_host_url
    console.log('⏳ Step 4: Adding zoom_webinar_host_url column...');
    try {
      await sql`
        ALTER TABLE events
        ADD COLUMN zoom_webinar_host_url TEXT NULL
      `;
      console.log('✅ zoom_webinar_host_url column added\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  zoom_webinar_host_url column already exists\n');
      } else {
        throw error;
      }
    }

    // Step 5: Create index
    console.log('⏳ Step 5: Creating index on meeting_type...');
    try {
      await sql`
        CREATE INDEX idx_events_meeting_type ON events(meeting_type)
        WHERE deleted_at IS NULL
      `;
      console.log('✅ Index created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️  Index already exists\n');
      } else {
        throw error;
      }
    }

    // Step 6: Update existing events
    console.log('⏳ Step 6: Updating existing events to OFFLINE...');
    const updateResult = await sql`
      UPDATE events
      SET meeting_type = 'OFFLINE'
      WHERE meeting_type IS NULL
    `;
    console.log(`✅ Updated ${updateResult.length || 0} events\n`);

    // Verify
    console.log('📊 Verifying migration...\n');
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'events'
      AND column_name IN ('meeting_type', 'zoom_webinar_id', 'zoom_webinar_join_url', 'zoom_webinar_host_url')
      ORDER BY column_name
    `;

    console.log('✅ New columns:');
    result.forEach((col) => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n🎉 Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addColumns();
