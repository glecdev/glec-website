-- Create Events and Event Registrations Tables
-- Direct SQL migration for Neon PostgreSQL

-- Step 1: Create EventStatus enum
DO $$ BEGIN
  CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Create RegistrationStatus enum
DO $$ BEGIN
  CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 3: Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

-- Step 4: Create indexes for events table
CREATE INDEX IF NOT EXISTS events_slug_idx ON events(slug);
CREATE INDEX IF NOT EXISTS events_status_start_date_idx ON events(status, start_date);

-- Step 5: Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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

-- Step 6: Create indexes for event_registrations table
CREATE INDEX IF NOT EXISTS event_registrations_event_id_status_idx ON event_registrations(event_id, status);
CREATE INDEX IF NOT EXISTS event_registrations_email_idx ON event_registrations(email);
CREATE INDEX IF NOT EXISTS event_registrations_created_at_idx ON event_registrations(created_at DESC);

-- Step 7: Verify tables created
SELECT
  'events' as table_name,
  COUNT(*) as row_count
FROM events
UNION ALL
SELECT
  'event_registrations' as table_name,
  COUNT(*) as row_count
FROM event_registrations;
