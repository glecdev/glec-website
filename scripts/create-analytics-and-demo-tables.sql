-- Analytics and Demo Requests Migration
-- Date: 2025-10-05

-- Create Demo Request Status enum
DO $$ BEGIN
  CREATE TYPE "DemoRequestStatus" AS ENUM ('NEW', 'SCHEDULED', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Analytics Sessions Table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  country TEXT,
  city TEXT,
  device TEXT NOT NULL,
  browser TEXT NOT NULL,
  os TEXT NOT NULL,
  referrer TEXT,
  landing_page TEXT NOT NULL,
  cookie_consent JSONB NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS analytics_sessions_session_id_idx ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS analytics_sessions_created_at_idx ON analytics_sessions(created_at);

-- Analytics Page Views Table
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT NOT NULL,
  referrer TEXT,
  duration INTEGER,
  scroll_depth INTEGER,
  exit_page BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT analytics_page_views_session_id_fkey FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS analytics_page_views_session_id_idx ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS analytics_page_views_path_idx ON analytics_page_views(path);
CREATE INDEX IF NOT EXISTS analytics_page_views_created_at_idx ON analytics_page_views(created_at);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  page TEXT NOT NULL,
  element_id TEXT,
  element_text TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT analytics_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at);

-- Analytics Conversions Table
CREATE TABLE IF NOT EXISTS analytics_conversions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL,
  form_data JSONB,
  value DOUBLE PRECISION,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT analytics_conversions_session_id_fkey FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS analytics_conversions_session_id_idx ON analytics_conversions(session_id);
CREATE INDEX IF NOT EXISTS analytics_conversions_conversion_type_idx ON analytics_conversions(conversion_type);
CREATE INDEX IF NOT EXISTS analytics_conversions_created_at_idx ON analytics_conversions(created_at);

-- Demo Requests Table
CREATE TABLE IF NOT EXISTS demo_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_size TEXT NOT NULL,
  product_interests TEXT[] NOT NULL,
  use_case TEXT NOT NULL,
  current_solution TEXT,
  monthly_shipments TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  additional_message TEXT,
  status "DemoRequestStatus" NOT NULL DEFAULT 'NEW',
  privacy_consent BOOLEAN NOT NULL,
  ip_address TEXT,
  assigned_to_id TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT demo_requests_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS demo_requests_status_idx ON demo_requests(status);
CREATE INDEX IF NOT EXISTS demo_requests_email_idx ON demo_requests(email);
CREATE INDEX IF NOT EXISTS demo_requests_created_at_idx ON demo_requests(created_at);
