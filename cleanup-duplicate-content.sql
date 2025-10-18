-- GLEC 중복 콘텐츠 정리 SQL
-- 실행 전 백업 권장: pg_dump 또는 Neon Console에서 Snapshot 생성

-- ========================================
-- 1단계: 현재 중복 상태 확인
-- ========================================

-- 블로그 중복 확인
SELECT title, COUNT(*) as duplicates
FROM blogs
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- 영상 중복 확인
SELECT title, COUNT(*) as duplicates
FROM videos
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- 자료실 중복 확인
SELECT title, COUNT(*) as duplicates
FROM libraries
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- 보도자료 중복 확인
SELECT title, COUNT(*) as duplicates
FROM presses
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- 공지사항 중복 확인
SELECT title, COUNT(*) as duplicates
FROM notices
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicates DESC;

-- ========================================
-- 2단계: 중복 제거 (가장 최신 1개만 유지)
-- ========================================

-- 주의: 이 작업은 되돌릴 수 없습니다!
-- 실행 전 반드시 백업하세요.

BEGIN;

-- 블로그 중복 제거 (created_at이 가장 최신인 것만 유지)
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM blogs
)
DELETE FROM blogs
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 영상 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM videos
)
DELETE FROM videos
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 자료실 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM libraries
)
DELETE FROM libraries
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 보도자료 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM presses
)
DELETE FROM presses
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 공지사항 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM notices
)
DELETE FROM notices
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 이벤트 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM events
)
DELETE FROM events
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 팝업 중복 제거
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM popups
)
DELETE FROM popups
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

COMMIT;

-- ========================================
-- 3단계: 정리 후 검증
-- ========================================

-- 전체 콘텐츠 개수 확인
SELECT
  (SELECT COUNT(*) FROM blogs) as blogs_count,
  (SELECT COUNT(*) FROM videos) as videos_count,
  (SELECT COUNT(*) FROM libraries) as libraries_count,
  (SELECT COUNT(*) FROM presses) as presses_count,
  (SELECT COUNT(*) FROM notices) as notices_count,
  (SELECT COUNT(*) FROM events) as events_count,
  (SELECT COUNT(*) FROM popups) as popups_count;

-- 중복 여부 재확인 (모두 0이어야 함)
SELECT
  'blogs' as table_name,
  COUNT(*) - COUNT(DISTINCT title) as duplicates
FROM blogs
UNION ALL
SELECT 'videos', COUNT(*) - COUNT(DISTINCT title) FROM videos
UNION ALL
SELECT 'libraries', COUNT(*) - COUNT(DISTINCT title) FROM libraries
UNION ALL
SELECT 'presses', COUNT(*) - COUNT(DISTINCT title) FROM presses
UNION ALL
SELECT 'notices', COUNT(*) - COUNT(DISTINCT title) FROM notices
UNION ALL
SELECT 'events', COUNT(*) - COUNT(DISTINCT title) FROM events
UNION ALL
SELECT 'popups', COUNT(*) - COUNT(DISTINCT title) FROM popups;

-- ========================================
-- 4단계: 샘플 데이터 제거 (선택 사항)
-- ========================================

-- Rick Astley 영상 삭제
DELETE FROM videos WHERE youtube_video_id = 'dQw4w9WgXcQ';

-- storage.glec.io 가짜 URL 자료실 삭제
DELETE FROM libraries WHERE file_url LIKE '%storage.glec.io%';

-- 외부 링크가 없는 보도자료 삭제 (샘플 데이터일 가능성)
DELETE FROM presses WHERE external_url IS NULL OR external_url = '';

-- 5000자 미만 짧은 블로그 삭제 (선택 사항 - 실제 콘텐츠일 수 있음)
-- DELETE FROM blogs WHERE LENGTH(content) < 5000;

-- ========================================
-- 최종 확인
-- ========================================

SELECT
  'blogs' as type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE LENGTH(content) > 5000) as long_content,
  COUNT(*) FILTER (WHERE LENGTH(content) <= 5000) as short_content
FROM blogs
UNION ALL
SELECT
  'videos',
  COUNT(*),
  COUNT(*) FILTER (WHERE youtube_video_id != 'dQw4w9WgXcQ'),
  COUNT(*) FILTER (WHERE youtube_video_id = 'dQw4w9WgXcQ')
FROM videos
UNION ALL
SELECT
  'libraries',
  COUNT(*),
  COUNT(*) FILTER (WHERE file_url NOT LIKE '%storage.glec.io%'),
  COUNT(*) FILTER (WHERE file_url LIKE '%storage.glec.io%')
FROM libraries
UNION ALL
SELECT
  'presses',
  COUNT(*),
  COUNT(*) FILTER (WHERE external_url IS NOT NULL AND external_url != ''),
  COUNT(*) FILTER (WHERE external_url IS NULL OR external_url = '')
FROM presses;
