-- Migration: 006_create_knowledge_videos_table.sql
-- Purpose: Create knowledge_videos table for Knowledge Center video content
-- Author: Claude
-- Date: 2025-10-11

-- ====================================
-- Table: knowledge_videos
-- ====================================

CREATE TABLE IF NOT EXISTS knowledge_videos (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content Fields
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  video_url VARCHAR(500) NOT NULL UNIQUE,
  thumbnail_url VARCHAR(500),

  -- Video Metadata
  duration VARCHAR(10) NOT NULL, -- Format: MM:SS (e.g., "15:30")
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'TECHNICAL',
    'GUIDE',
    'TUTORIAL',
    'WEBINAR',
    'CASE_STUDY',
    'PRODUCT_DEMO'
  )),
  tags TEXT[] NOT NULL DEFAULT '{}', -- Array of tags

  -- Analytics
  view_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- Indexes
-- ====================================

-- Full-text search on title and description
CREATE INDEX idx_knowledge_videos_title_search ON knowledge_videos USING GIN (to_tsvector('english', title));
CREATE INDEX idx_knowledge_videos_description_search ON knowledge_videos USING GIN (to_tsvector('english', description));

-- Filter by category
CREATE INDEX idx_knowledge_videos_category ON knowledge_videos (category);

-- Order by published_at (recent videos)
CREATE INDEX idx_knowledge_videos_published_at ON knowledge_videos (published_at DESC);

-- Order by view_count (popular videos)
CREATE INDEX idx_knowledge_videos_view_count ON knowledge_videos (view_count DESC);

-- GIN index for tags array search
CREATE INDEX idx_knowledge_videos_tags ON knowledge_videos USING GIN (tags);

-- ====================================
-- Trigger: Update updated_at timestamp
-- ====================================

CREATE OR REPLACE FUNCTION update_knowledge_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_videos_updated_at
BEFORE UPDATE ON knowledge_videos
FOR EACH ROW
EXECUTE FUNCTION update_knowledge_videos_updated_at();

-- ====================================
-- Comments
-- ====================================

COMMENT ON TABLE knowledge_videos IS 'Knowledge Center video content (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN knowledge_videos.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN knowledge_videos.title IS 'Video title (max 200 characters)';
COMMENT ON COLUMN knowledge_videos.description IS 'Video description/summary';
COMMENT ON COLUMN knowledge_videos.video_url IS 'Video URL (YouTube, Vimeo, etc.) - unique';
COMMENT ON COLUMN knowledge_videos.thumbnail_url IS 'Video thumbnail image URL';
COMMENT ON COLUMN knowledge_videos.duration IS 'Video duration in MM:SS format';
COMMENT ON COLUMN knowledge_videos.category IS 'Video category (TECHNICAL, GUIDE, TUTORIAL, WEBINAR, CASE_STUDY, PRODUCT_DEMO)';
COMMENT ON COLUMN knowledge_videos.tags IS 'Video tags (array of strings)';
COMMENT ON COLUMN knowledge_videos.view_count IS 'Number of views';
COMMENT ON COLUMN knowledge_videos.published_at IS 'Original publish date';
COMMENT ON COLUMN knowledge_videos.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN knowledge_videos.updated_at IS 'Record last update timestamp';

-- ====================================
-- Sample Data (for testing)
-- ====================================

-- Insert sample GLEC video
INSERT INTO knowledge_videos (
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  category,
  tags,
  view_count,
  published_at
) VALUES (
  'GLEC 통합 솔루션 소개',
  'GLEC의 물류 탄소배출 측정 및 관리 통합 솔루션을 소개합니다. ISO-14083 국제표준 기반의 정확한 탄소배출 측정부터 리포팅까지 한번에 해결하세요.',
  'https://www.youtube.com/watch?v=SAMPLE123',
  'https://i.ytimg.com/vi/SAMPLE123/maxresdefault.jpg',
  '05:30',
  'PRODUCT_DEMO',
  ARRAY['GLEC', 'ISO-14083', '탄소배출', '물류'],
  1000,
  CURRENT_TIMESTAMP - INTERVAL '7 days'
) ON CONFLICT (video_url) DO NOTHING;

-- ====================================
-- Verification Query
-- ====================================

-- Check table structure
-- SELECT column_name, data_type, character_maximum_length, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'knowledge_videos'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'knowledge_videos';

-- Check sample data
-- SELECT id, title, category, duration, view_count, published_at
-- FROM knowledge_videos
-- ORDER BY published_at DESC;
