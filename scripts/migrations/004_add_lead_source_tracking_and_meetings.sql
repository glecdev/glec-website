-- ====================================================================
-- Migration: 004 - Lead Source Tracking & Meeting Management System
-- Description: 리드 소스 추적 + 미팅 일정 관리 + 통합 퍼널 시스템
-- Author: Technical Planning Team
-- Date: 2025-10-12
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. Add lead_source to contacts table (문의 양식 리드 소스 추적)
-- ====================================================================

ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50) DEFAULT 'CONTACT_FORM',
ADD COLUMN IF NOT EXISTS lead_source_detail TEXT,
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_contacts_lead_source ON contacts(lead_source);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);

-- ====================================================================
-- 2. Meeting Slots Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS meeting_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  meeting_type VARCHAR(50) NOT NULL DEFAULT 'DEMO',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meeting_location VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
  meeting_url TEXT,
  office_address TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  max_bookings INTEGER NOT NULL DEFAULT 1,
  current_bookings INTEGER NOT NULL DEFAULT 0,
  assigned_to UUID,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_meeting_type CHECK (meeting_type IN ('DEMO', 'CONSULTATION', 'ONBOARDING', 'FOLLOWUP', 'OTHER')),
  CONSTRAINT valid_meeting_location CHECK (meeting_location IN ('ONLINE', 'OFFICE', 'CLIENT_OFFICE')),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_bookings CHECK (current_bookings <= max_bookings)
);

CREATE INDEX idx_meeting_slots_start_time ON meeting_slots(start_time);
CREATE INDEX idx_meeting_slots_is_available ON meeting_slots(is_available);
CREATE INDEX idx_meeting_slots_assigned_to ON meeting_slots(assigned_to);

-- ====================================================================
-- 3. Meeting Bookings Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS meeting_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_slot_id UUID NOT NULL REFERENCES meeting_slots(id) ON DELETE CASCADE,
  lead_type VARCHAR(50) NOT NULL,
  lead_id UUID NOT NULL,
  company_name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  requested_agenda TEXT,
  internal_notes TEXT,
  booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  confirmation_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_email_sent_at TIMESTAMP WITH TIME ZONE,
  outcome_notes TEXT,
  next_action VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_lead_type CHECK (lead_type IN ('CONTACT', 'LIBRARY_LEAD', 'EVENT_REGISTRATION', 'OTHER')),
  CONSTRAINT valid_booking_status CHECK (booking_status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'))
);

CREATE INDEX idx_meeting_bookings_meeting_slot_id ON meeting_bookings(meeting_slot_id);
CREATE INDEX idx_meeting_bookings_lead ON meeting_bookings(lead_type, lead_id);
CREATE INDEX idx_meeting_bookings_email ON meeting_bookings(email);
CREATE INDEX idx_meeting_bookings_booking_status ON meeting_bookings(booking_status);

-- ====================================================================
-- 4. Meeting Proposal Tokens
-- ====================================================================

CREATE TABLE IF NOT EXISTS meeting_proposal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type VARCHAR(50) NOT NULL,
  lead_id UUID NOT NULL,
  token VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_token_lead_type CHECK (lead_type IN ('CONTACT', 'LIBRARY_LEAD', 'EVENT_REGISTRATION', 'OTHER'))
);

CREATE INDEX idx_meeting_proposal_tokens_token ON meeting_proposal_tokens(token);
CREATE INDEX idx_meeting_proposal_tokens_lead ON meeting_proposal_tokens(lead_type, lead_id);

-- ====================================================================
-- 5. Lead Activities Log
-- ====================================================================

CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type VARCHAR(50) NOT NULL,
  lead_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT NOT NULL,
  performed_by UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_activity_lead_type CHECK (lead_type IN ('CONTACT', 'LIBRARY_LEAD', 'EVENT_REGISTRATION', 'OTHER'))
);

CREATE INDEX idx_lead_activities_lead ON lead_activities(lead_type, lead_id);
CREATE INDEX idx_lead_activities_type ON lead_activities(activity_type);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- ====================================================================
-- 6. Updated Unified Leads View
-- ====================================================================

DROP VIEW IF EXISTS unified_leads CASCADE;

CREATE OR REPLACE VIEW unified_leads AS
SELECT
  'LIBRARY_DOWNLOAD' AS source_type,
  ll.id,
  ll.company_name,
  ll.contact_name,
  ll.email,
  ll.phone,
  ll.lead_status,
  ll.lead_score,
  ll.assigned_to,
  ll.notes,
  ll.created_at,
  ll.last_contacted_at,
  li.title AS source_detail
FROM library_leads ll
LEFT JOIN library_items li ON ll.library_item_id = li.id
UNION ALL
SELECT
  'CONTACT_FORM' AS source_type,
  c.id::UUID,
  c.company_name,
  c.contact_name,
  c.email,
  c.phone,
  c.status::VARCHAR AS lead_status,
  COALESCE(c.lead_score, 50) AS lead_score,
  c.assigned_to,
  c.notes,
  c.created_at,
  c.last_contacted_at,
  c.inquiry_type::VARCHAR AS source_detail
FROM contacts c;

-- ====================================================================
-- 7. Triggers
-- ====================================================================

DROP TRIGGER IF EXISTS update_meeting_slots_updated_at ON meeting_slots;
CREATE TRIGGER update_meeting_slots_updated_at
  BEFORE UPDATE ON meeting_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meeting_bookings_updated_at ON meeting_bookings;
CREATE TRIGGER update_meeting_bookings_updated_at
  BEFORE UPDATE ON meeting_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
