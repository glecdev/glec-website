/**
 * Database Migration Runner - Google Calendar Integration
 *
 * Usage: node scripts/run-migration-google-calendar.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('\n' + '='.repeat(70));
  console.log('🔄 DATABASE MIGRATION - Google Calendar Integration');
  console.log('='.repeat(70));

  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. SQL 파일 읽기
    const sqlFile = path.join(__dirname, 'migrate-google-calendar-integration.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n📄 Reading migration file...');
    console.log(`   File: ${sqlFile}`);
    console.log(`   Size: ${(sqlContent.length / 1024).toFixed(2)} KB`);

    // 2. Execute migrations in logical groups
    console.log(`\n🔧 Executing migration steps...`);

    // Step 1: Add columns to meeting_slots
    console.log('\n   📊 Step 1: Adding columns to meeting_slots...');

    await sql.query(`ALTER TABLE meeting_slots ADD COLUMN IF NOT EXISTS google_event_id TEXT UNIQUE`);
    console.log('   ✅ google_event_id column added');

    await sql.query(`ALTER TABLE meeting_slots ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary'`);
    console.log('   ✅ google_calendar_id column added');

    await sql.query(`ALTER TABLE meeting_slots ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'PENDING'`);
    console.log('   ✅ sync_status column added');

    await sql.query(`ALTER TABLE meeting_slots ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ`);
    console.log('   ✅ last_sync_at column added');

    // Step 2: Add CHECK constraint for sync_status (must be separate from column creation)
    console.log('\n   📊 Step 2: Adding constraints...');
    try {
      await sql.query(`ALTER TABLE meeting_slots DROP CONSTRAINT IF EXISTS meeting_slots_sync_status_check`);
      await sql.query(`ALTER TABLE meeting_slots ADD CONSTRAINT meeting_slots_sync_status_check CHECK (sync_status IN ('PENDING', 'SYNCED', 'BUSY', 'ERROR', 'CANCELLED'))`);
      console.log('   ✅ sync_status CHECK constraint added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⏭️  sync_status CHECK constraint already exists');
      } else {
        throw error;
      }
    }

    // Step 3: Create indexes for meeting_slots
    console.log('\n   📊 Step 3: Creating indexes for meeting_slots...');

    await sql.query(`CREATE INDEX IF NOT EXISTS idx_meeting_slots_google_event_id ON meeting_slots(google_event_id)`);
    console.log('   ✅ idx_meeting_slots_google_event_id created');

    await sql.query(`CREATE INDEX IF NOT EXISTS idx_meeting_slots_sync_status ON meeting_slots(sync_status)`);
    console.log('   ✅ idx_meeting_slots_sync_status created');

    await sql.query(`CREATE INDEX IF NOT EXISTS idx_meeting_slots_start_time ON meeting_slots(start_time)`);
    console.log('   ✅ idx_meeting_slots_start_time created');

    // Step 4: Add columns to meeting_bookings
    console.log('\n   📊 Step 4: Adding columns to meeting_bookings...');

    await sql.query(`ALTER TABLE meeting_bookings ADD COLUMN IF NOT EXISTS google_event_id TEXT`);
    console.log('   ✅ google_event_id column added');

    await sql.query(`ALTER TABLE meeting_bookings ADD COLUMN IF NOT EXISTS google_meet_link TEXT`);
    console.log('   ✅ google_meet_link column added');

    await sql.query(`ALTER TABLE meeting_bookings ADD COLUMN IF NOT EXISTS google_calendar_link TEXT`);
    console.log('   ✅ google_calendar_link column added');

    await sql.query(`ALTER TABLE meeting_bookings ADD COLUMN IF NOT EXISTS calendar_sync_status TEXT DEFAULT 'PENDING'`);
    console.log('   ✅ calendar_sync_status column added');

    // Step 5: Add CHECK constraint for calendar_sync_status
    console.log('\n   📊 Step 5: Adding booking constraints...');
    try {
      await sql.query(`ALTER TABLE meeting_bookings DROP CONSTRAINT IF EXISTS meeting_bookings_calendar_sync_status_check`);
      await sql.query(`ALTER TABLE meeting_bookings ADD CONSTRAINT meeting_bookings_calendar_sync_status_check CHECK (calendar_sync_status IN ('PENDING', 'SYNCED', 'ERROR'))`);
      console.log('   ✅ calendar_sync_status CHECK constraint added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⏭️  calendar_sync_status CHECK constraint already exists');
      } else {
        throw error;
      }
    }

    // Step 6: Create indexes for meeting_bookings
    console.log('\n   📊 Step 6: Creating indexes for meeting_bookings...');

    await sql.query(`CREATE INDEX IF NOT EXISTS idx_meeting_bookings_google_event_id ON meeting_bookings(google_event_id)`);
    console.log('   ✅ idx_meeting_bookings_google_event_id created');

    await sql.query(`CREATE INDEX IF NOT EXISTS idx_meeting_bookings_calendar_sync_status ON meeting_bookings(calendar_sync_status)`);
    console.log('   ✅ idx_meeting_bookings_calendar_sync_status created');

    // Step 7: Migrate existing data
    console.log('\n   📊 Step 7: Migrating existing data...');

    const updateAvailable = await sql.query(`UPDATE meeting_slots SET sync_status = 'PENDING' WHERE sync_status IS NULL AND is_available = true RETURNING id`);
    const availableCount = updateAvailable?.rows?.length || 0;
    console.log(`   ✅ Updated ${availableCount} available slots to PENDING`);

    const updateBusy = await sql.query(`UPDATE meeting_slots SET sync_status = 'BUSY' WHERE sync_status IS NULL AND is_available = false RETURNING id`);
    const busyCount = updateBusy?.rows?.length || 0;
    console.log(`   ✅ Updated ${busyCount} unavailable slots to BUSY`);

    const updateBookings = await sql.query(`UPDATE meeting_bookings SET calendar_sync_status = 'PENDING' WHERE calendar_sync_status IS NULL RETURNING id`);
    const bookingsCount = updateBookings?.rows?.length || 0;
    console.log(`   ✅ Updated ${bookingsCount} bookings to PENDING`);

    // Step 8: Add column comments
    console.log('\n   📊 Step 8: Adding column documentation...');

    await sql.query(`COMMENT ON COLUMN meeting_slots.google_event_id IS 'Google Calendar event ID (unique identifier)'`);
    await sql.query(`COMMENT ON COLUMN meeting_slots.google_calendar_id IS 'Google Calendar ID (default: primary)'`);
    await sql.query(`COMMENT ON COLUMN meeting_slots.sync_status IS 'Sync status with Google Calendar: PENDING, SYNCED, BUSY, ERROR, CANCELLED'`);
    await sql.query(`COMMENT ON COLUMN meeting_slots.last_sync_at IS 'Last synchronization timestamp with Google Calendar'`);
    await sql.query(`COMMENT ON COLUMN meeting_bookings.google_event_id IS 'Google Calendar event ID for this booking'`);
    await sql.query(`COMMENT ON COLUMN meeting_bookings.google_meet_link IS 'Google Meet video conference link'`);
    await sql.query(`COMMENT ON COLUMN meeting_bookings.google_calendar_link IS 'Google Calendar event link (web view)'`);
    await sql.query(`COMMENT ON COLUMN meeting_bookings.calendar_sync_status IS 'Calendar sync status: PENDING, SYNCED, ERROR'`);
    console.log('   ✅ Column comments added');

    console.log('\n' + '='.repeat(70));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(70));

    // 4. 검증 - 컬럼 존재 확인
    console.log('\n🔍 Verifying migration...');

    const verifySlots = await sql.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'meeting_slots'
      AND column_name IN ('google_event_id', 'google_calendar_id', 'sync_status', 'last_sync_at')
    `);

    const verifyBookings = await sql.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'meeting_bookings'
      AND column_name IN ('google_event_id', 'google_meet_link', 'google_calendar_link', 'calendar_sync_status')
    `);

    // Neon serverless driver returns results directly as an array, not in .rows
    const slotsColumnsCount = Array.isArray(verifySlots) ? verifySlots.length : (verifySlots?.rows?.length || 0);
    const bookingsColumnsCount = Array.isArray(verifyBookings) ? verifyBookings.length : (verifyBookings?.rows?.length || 0);

    console.log(`   meeting_slots: ${slotsColumnsCount}/4 columns added`);
    console.log(`   meeting_bookings: ${bookingsColumnsCount}/4 columns added`);

    if (slotsColumnsCount === 4 && bookingsColumnsCount === 4) {
      console.log('\n✅ Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Add GOOGLE_SERVICE_ACCOUNT_KEY to .env.local');
      console.log('   2. Test Google Calendar connection');
      console.log('   3. Run auto-create-slots to generate meeting slots');
      console.log('');
      process.exit(0);
    } else {
      throw new Error('Migration verification failed - some columns are missing');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nPlease check:');
    console.error('   1. DATABASE_URL is set in .env.local');
    console.error('   2. Database connection is working');
    console.error('   3. SQL syntax is correct');
    console.error('');
    process.exit(1);
  }
}

// Run migration
runMigration();
