/**
 * Migration 008: Add Zoom Webinar Support to Events
 *
 * Purpose:
 * - Enable OFFLINE/WEBINAR event types
 * - Store Zoom Webinar information
 * - Support automatic webinar registration via Zoom API
 *
 * Changes:
 * - Add meeting_type column (OFFLINE, WEBINAR)
 * - Add zoom_webinar_id (Zoom Webinar ID)
 * - Add zoom_webinar_join_url (Participant join link)
 * - Add zoom_webinar_host_url (Host start link)
 *
 * Rollback:
 * - ALTER TABLE events DROP COLUMN IF EXISTS meeting_type;
 * - ALTER TABLE events DROP COLUMN IF EXISTS zoom_webinar_id;
 * - ALTER TABLE events DROP COLUMN IF EXISTS zoom_webinar_join_url;
 * - ALTER TABLE events DROP COLUMN IF EXISTS zoom_webinar_host_url;
 */

-- ============================================================================
-- Step 1: Add meeting_type column (OFFLINE or WEBINAR)
-- ============================================================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS meeting_type VARCHAR(20) DEFAULT 'OFFLINE'
CHECK (meeting_type IN ('OFFLINE', 'WEBINAR'));

COMMENT ON COLUMN events.meeting_type IS 'Event meeting type: OFFLINE (in-person) or WEBINAR (online via Zoom)';

-- ============================================================================
-- Step 2: Add Zoom Webinar columns
-- ============================================================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS zoom_webinar_id VARCHAR(50) NULL;

COMMENT ON COLUMN events.zoom_webinar_id IS 'Zoom Webinar ID (only for WEBINAR type events)';

ALTER TABLE events
ADD COLUMN IF NOT EXISTS zoom_webinar_join_url TEXT NULL;

COMMENT ON COLUMN events.zoom_webinar_join_url IS 'Zoom Webinar join URL for participants';

ALTER TABLE events
ADD COLUMN IF NOT EXISTS zoom_webinar_host_url TEXT NULL;

COMMENT ON COLUMN events.zoom_webinar_host_url IS 'Zoom Webinar start URL for host/panelists';

-- ============================================================================
-- Step 3: Create index for meeting_type (for filtering)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_events_meeting_type ON events(meeting_type)
WHERE deleted_at IS NULL;

-- ============================================================================
-- Step 4: Update existing events to OFFLINE (backward compatibility)
-- ============================================================================

UPDATE events
SET meeting_type = 'OFFLINE'
WHERE meeting_type IS NULL;

-- ============================================================================
-- Verification Query
-- ============================================================================

/*
SELECT
  id, title, meeting_type,
  zoom_webinar_id,
  CASE
    WHEN zoom_webinar_join_url IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_join_url
FROM events
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;
*/
