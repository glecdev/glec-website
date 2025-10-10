-- ============================================================
-- YouTube Video ID Migration Script
-- ============================================================
--
-- Purpose: Fix incorrect youtube_video_id extraction
-- Root Cause: Old regex pattern failed to handle ?si= share parameters
--
-- Example:
-- BEFORE: youtube_video_id = '4qnXyIdzYC8?si=Y-GfvbdRBQCh812A' (WRONG)
-- AFTER:  youtube_video_id = '4qnXyIdzYC8' (CORRECT)
--
-- ============================================================

-- Step 1: Identify affected rows
SELECT
  id,
  title,
  youtube_url,
  youtube_video_id AS current_id,
  CASE
    -- youtu.be/VIDEO_ID
    WHEN youtube_url ~ 'youtu\.be/([a-zA-Z0-9_-]{11})'
      THEN substring(youtube_url from 'youtu\.be/([a-zA-Z0-9_-]{11})')
    -- youtube.com/watch?v=VIDEO_ID
    WHEN youtube_url ~ 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})'
      THEN substring(youtube_url from 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})')
    -- youtube.com/embed/VIDEO_ID
    WHEN youtube_url ~ 'youtube\.com/embed/([a-zA-Z0-9_-]{11})'
      THEN substring(youtube_url from 'youtube\.com/embed/([a-zA-Z0-9_-]{11})')
    ELSE youtube_video_id
  END AS correct_id
FROM videos
WHERE
  -- Only select rows with incorrect IDs (longer than 11 chars or contains special chars)
  (LENGTH(youtube_video_id) > 11 OR youtube_video_id ~ '[?&=]')
  OR youtube_video_id = 'unknown';

-- Step 2: Update incorrect youtube_video_id
UPDATE videos
SET
  youtube_video_id = CASE
    -- youtu.be/VIDEO_ID
    WHEN youtube_url ~ 'youtu\.be/([a-zA-Z0-9_-]{11})'
      THEN substring(youtube_url from 'youtu\.be/([a-zA-Z0-9_-]{11})')
    -- youtube.com/watch?v=VIDEO_ID
    WHEN youtube_url ~ 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})'
      THEN substring(youtube_url from 'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})')
    -- youtube.com/embed/VIDEO_ID
    WHEN youtube_url ~ 'youtube\.com/embed/([a-zA-Z0-9_-]{11})'
      THEN substring(youtube_url from 'youtube\.com/embed/([a-zA-Z0-9_-]{11})')
    ELSE youtube_video_id
  END,
  updated_at = NOW()
WHERE
  (LENGTH(youtube_video_id) > 11 OR youtube_video_id ~ '[?&=]')
  OR youtube_video_id = 'unknown';

-- Step 3: Update thumbnail URLs to use correct video IDs
UPDATE videos
SET
  thumbnail_url = 'https://img.youtube.com/vi/' || youtube_video_id || '/hqdefault.jpg',
  updated_at = NOW()
WHERE
  -- Only update if thumbnail uses YouTube's default format
  thumbnail_url LIKE 'https://img.youtube.com/vi/%';

-- Step 4: Verify results
SELECT
  id,
  title,
  youtube_url,
  youtube_video_id,
  thumbnail_url,
  updated_at
FROM videos
ORDER BY updated_at DESC
LIMIT 10;

-- ============================================================
-- Expected Results:
-- - youtube_video_id should be exactly 11 characters
-- - youtube_video_id should only contain [a-zA-Z0-9_-]
-- - thumbnail_url should use correct video ID
-- ============================================================
