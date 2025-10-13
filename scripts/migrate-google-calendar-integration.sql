-- Google Calendar Integration - Database Migration
-- Purpose: Add Google Calendar/Meet fields to meeting tables

-- ====================================================================
-- meeting_slots: Google Calendar 연동 필드 추가
-- ====================================================================

-- Google Calendar event ID
ALTER TABLE meeting_slots
ADD COLUMN IF NOT EXISTS google_event_id TEXT UNIQUE;

-- Google Calendar ID (여러 캘린더 사용 시)
ALTER TABLE meeting_slots
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';

-- Sync 상태
ALTER TABLE meeting_slots
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'PENDING'
CHECK (sync_status IN ('PENDING', 'SYNCED', 'BUSY', 'ERROR', 'CANCELLED'));

-- 마지막 동기화 시간
ALTER TABLE meeting_slots
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- Index 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_meeting_slots_google_event_id ON meeting_slots(google_event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_slots_sync_status ON meeting_slots(sync_status);
CREATE INDEX IF NOT EXISTS idx_meeting_slots_start_time ON meeting_slots(start_time);

-- ====================================================================
-- meeting_bookings: Google Meet 정보 추가
-- ====================================================================

-- Google Calendar event ID
ALTER TABLE meeting_bookings
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Google Meet 링크
ALTER TABLE meeting_bookings
ADD COLUMN IF NOT EXISTS google_meet_link TEXT;

-- Google Calendar 링크 (웹에서 보기)
ALTER TABLE meeting_bookings
ADD COLUMN IF NOT EXISTS google_calendar_link TEXT;

-- Calendar 동기화 상태
ALTER TABLE meeting_bookings
ADD COLUMN IF NOT EXISTS calendar_sync_status TEXT DEFAULT 'PENDING'
CHECK (calendar_sync_status IN ('PENDING', 'SYNCED', 'ERROR'));

-- Index 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_google_event_id ON meeting_bookings(google_event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_bookings_calendar_sync_status ON meeting_bookings(calendar_sync_status);

-- ====================================================================
-- 기존 데이터 마이그레이션 (sync_status 업데이트)
-- ====================================================================

-- 기존 available 슬롯은 PENDING으로 설정
UPDATE meeting_slots
SET sync_status = 'PENDING'
WHERE sync_status IS NULL AND is_available = true;

-- 기존 unavailable 슬롯은 BUSY로 설정
UPDATE meeting_slots
SET sync_status = 'BUSY'
WHERE sync_status IS NULL AND is_available = false;

-- 기존 예약은 PENDING으로 설정
UPDATE meeting_bookings
SET calendar_sync_status = 'PENDING'
WHERE calendar_sync_status IS NULL;

-- ====================================================================
-- Comments (문서화)
-- ====================================================================

COMMENT ON COLUMN meeting_slots.google_event_id IS 'Google Calendar event ID (unique identifier)';
COMMENT ON COLUMN meeting_slots.google_calendar_id IS 'Google Calendar ID (default: primary)';
COMMENT ON COLUMN meeting_slots.sync_status IS 'Sync status with Google Calendar: PENDING, SYNCED, BUSY, ERROR, CANCELLED';
COMMENT ON COLUMN meeting_slots.last_sync_at IS 'Last synchronization timestamp with Google Calendar';

COMMENT ON COLUMN meeting_bookings.google_event_id IS 'Google Calendar event ID for this booking';
COMMENT ON COLUMN meeting_bookings.google_meet_link IS 'Google Meet video conference link';
COMMENT ON COLUMN meeting_bookings.google_calendar_link IS 'Google Calendar event link (web view)';
COMMENT ON COLUMN meeting_bookings.calendar_sync_status IS 'Calendar sync status: PENDING, SYNCED, ERROR';
