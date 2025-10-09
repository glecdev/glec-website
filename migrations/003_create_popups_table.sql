-- Migration: 003_create_popups_table.sql
-- Purpose: Create popups table for website popup management
-- Date: 2025-10-07

-- Create enum for popup display types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PopupDisplayType') THEN
    CREATE TYPE "PopupDisplayType" AS ENUM ('modal', 'banner', 'corner');
  END IF;
END $$;

-- Create popups table
CREATE TABLE IF NOT EXISTS "popups" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT,
  "image_url" TEXT,
  "link_url" TEXT,
  "display_type" "PopupDisplayType" NOT NULL DEFAULT 'modal',
  "is_active" BOOLEAN NOT NULL DEFAULT false,
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP,
  "z_index" INTEGER NOT NULL DEFAULT 1000,
  "show_once_per_day" BOOLEAN NOT NULL DEFAULT true,
  "position" VARCHAR(255), -- JSON string: {"top": "50%", "left": "50%"}
  "size" VARCHAR(255),     -- JSON string: {"width": "600px", "height": "400px"}
  "background_color" VARCHAR(50) NOT NULL DEFAULT '#ffffff',
  "deleted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "popups_is_active_deleted_at_idx" ON "popups" ("is_active", "deleted_at");
CREATE INDEX IF NOT EXISTS "popups_start_date_end_date_idx" ON "popups" ("start_date", "end_date");

-- Insert sample popup data
INSERT INTO "popups" (
  "title",
  "content",
  "image_url",
  "link_url",
  "display_type",
  "is_active",
  "start_date",
  "end_date",
  "z_index",
  "show_once_per_day",
  "background_color"
) VALUES (
  'GLEC 웹사이트 오픈 기념',
  '<h2>ISO-14083 기반 탄소배출 측정 솔루션</h2><p>GLEC의 새로운 웹사이트를 만나보세요!</p>',
  '/images/popup/welcome.svg',
  '/products',
  'modal',
  false, -- Initially inactive
  NOW(),
  NOW() + INTERVAL '30 days',
  1000,
  true,
  '#ffffff'
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE "popups" IS '웹사이트 팝업 관리 테이블';
COMMENT ON COLUMN "popups"."display_type" IS 'modal: 중앙 모달, banner: 상단 배너, corner: 하단 우측 코너';
COMMENT ON COLUMN "popups"."z_index" IS 'CSS z-index for stacking order';
COMMENT ON COLUMN "popups"."show_once_per_day" IS 'Show popup only once per day per user';
COMMENT ON COLUMN "popups"."deleted_at" IS 'Soft delete timestamp';
