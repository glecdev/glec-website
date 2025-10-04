/**
 * Manual Migration Script: Add Events and Event Registrations Tables
 *
 * This script bypasses Prisma and directly creates the tables in Neon PostgreSQL
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function migrate() {
  const sql = neon(DATABASE_URL);

  console.log('🔄 Starting migration: Add Events and Event Registrations tables...\n');

  try {
    // Step 1: Create EventStatus enum
    console.log('1️⃣ Creating EventStatus enum...');
    await sql`
      DO $$ BEGIN
        CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✅ EventStatus enum created\n');

    // Step 2: Create RegistrationStatus enum
    console.log('2️⃣ Creating RegistrationStatus enum...');
    await sql`
      DO $$ BEGIN
        CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✅ RegistrationStatus enum created\n');

    // Step 3: Create events table
    console.log('3️⃣ Creating events table...');
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        status "EventStatus" NOT NULL DEFAULT 'DRAFT',
        start_date TIMESTAMP(3) NOT NULL,
        end_date TIMESTAMP(3) NOT NULL,
        location TEXT NOT NULL,
        location_details TEXT,
        thumbnail_url TEXT,
        max_participants INTEGER,
        view_count INTEGER NOT NULL DEFAULT 0,
        published_at TIMESTAMP(3),
        author_id TEXT NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT events_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ events table created\n');

    // Step 4: Create indexes for events table
    console.log('4️⃣ Creating indexes for events table...');
    await sql`CREATE INDEX IF NOT EXISTS events_slug_idx ON events(slug);`;
    await sql`CREATE INDEX IF NOT EXISTS events_status_start_date_idx ON events(status, start_date);`;
    console.log('✅ Indexes created\n');

    // Step 5: Create event_registrations table
    console.log('5️⃣ Creating event_registrations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        company TEXT,
        job_title TEXT,
        message TEXT,
        status "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
        privacy_consent BOOLEAN NOT NULL,
        marketing_consent BOOLEAN NOT NULL DEFAULT false,
        admin_notes TEXT,
        event_id TEXT NOT NULL,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ event_registrations table created\n');

    // Step 6: Create indexes for event_registrations table
    console.log('6️⃣ Creating indexes for event_registrations table...');
    await sql`CREATE INDEX IF NOT EXISTS event_registrations_event_id_status_idx ON event_registrations(event_id, status);`;
    await sql`CREATE INDEX IF NOT EXISTS event_registrations_email_idx ON event_registrations(email);`;
    await sql`CREATE INDEX IF NOT EXISTS event_registrations_created_at_idx ON event_registrations(created_at DESC);`;
    console.log('✅ Indexes created\n');

    console.log('🎉 Migration completed successfully!\n');
    console.log('Summary:');
    console.log('  - EventStatus enum: ✅');
    console.log('  - RegistrationStatus enum: ✅');
    console.log('  - events table: ✅');
    console.log('  - event_registrations table: ✅');
    console.log('  - All indexes: ✅');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

migrate();
