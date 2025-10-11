-- ====================================================================
-- Migration: 007 - Create Library Download & Lead Management System
-- Description: GLEC Framework PDF 다운로드 + 퍼널 마케팅 리드 관리 시스템
-- Author: Technical Planning Team
-- Date: 2025-10-11
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. Library Items Table (라이브러리 자료 목록)
-- ====================================================================

CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,

  -- File Info
  file_type VARCHAR(20) NOT NULL DEFAULT 'PDF',
  file_size_mb DECIMAL(10, 2),
  file_url TEXT NOT NULL,  -- "/library/glec-framework-v3.pdf" OR Google Drive URL
  download_type VARCHAR(20) NOT NULL DEFAULT 'EMAIL',  -- EMAIL, DIRECT, GOOGLE_DRIVE

  -- Metadata
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  language VARCHAR(10) NOT NULL DEFAULT 'ko',
  version VARCHAR(20),

  -- Gating
  requires_form BOOLEAN NOT NULL DEFAULT TRUE,

  -- Analytics
  download_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,

  -- Publishing
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  published_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID,  -- Optional: User ID who created this item

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  CONSTRAINT valid_category CHECK (category IN ('FRAMEWORK', 'WHITEPAPER', 'CASE_STUDY', 'DATASHEET', 'OTHER')),
  CONSTRAINT valid_download_type CHECK (download_type IN ('EMAIL', 'DIRECT', 'GOOGLE_DRIVE'))
);

-- Indexes
CREATE INDEX idx_library_items_status ON library_items(status);
CREATE INDEX idx_library_items_category ON library_items(category);
CREATE INDEX idx_library_items_published_at ON library_items(published_at DESC);
CREATE INDEX idx_library_items_slug ON library_items(slug);

-- ====================================================================
-- 2. Library Leads Table (라이브러리 다운로드 신청자 - 리드 관리)
-- ====================================================================

CREATE TABLE IF NOT EXISTS library_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Library Item Reference
  library_item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,

  -- Lead Info
  company_name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Funnel Stage
  lead_status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  lead_score INTEGER NOT NULL DEFAULT 0,

  -- Email Delivery
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_opened BOOLEAN NOT NULL DEFAULT FALSE,
  email_opened_at TIMESTAMP WITH TIME ZONE,
  download_link_clicked BOOLEAN NOT NULL DEFAULT FALSE,
  download_link_clicked_at TIMESTAMP WITH TIME ZONE,

  -- Source Tracking
  source VARCHAR(50) NOT NULL DEFAULT 'LIBRARY_PAGE',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  referrer TEXT,

  -- Privacy
  privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,

  -- Admin Notes
  notes TEXT,
  assigned_to UUID,  -- Optional: Admin user ID assigned to this lead

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_lead_status CHECK (lead_status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST', 'NURTURING'))
);

-- Indexes
CREATE INDEX idx_library_leads_library_item_id ON library_leads(library_item_id);
CREATE INDEX idx_library_leads_email ON library_leads(email);
CREATE INDEX idx_library_leads_lead_status ON library_leads(lead_status);
CREATE INDEX idx_library_leads_created_at ON library_leads(created_at DESC);
CREATE INDEX idx_library_leads_assigned_to ON library_leads(assigned_to);
CREATE INDEX idx_library_leads_lead_score ON library_leads(lead_score DESC);

-- ====================================================================
-- 3. Extend Newsletter Subscribers (뉴스레터 구독자 리드 관리 확장)
-- ====================================================================

-- Add lead management columns to existing newsletter_subscribers table
-- SKIP: newsletter_subscribers table does not exist yet (will be added in future migration)
-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns
--                  WHERE table_name = 'newsletter_subscribers'
--                  AND column_name = 'lead_status') THEN
--     ALTER TABLE newsletter_subscribers
--       ADD COLUMN lead_status VARCHAR(20) NOT NULL DEFAULT 'NEW',
--       ADD COLUMN lead_score INTEGER NOT NULL DEFAULT 0,
--       ADD COLUMN assigned_to UUID,  -- Optional: Admin user ID
--       ADD COLUMN notes TEXT,
--       ADD COLUMN last_contacted_at TIMESTAMP WITH TIME ZONE;
--
--     CREATE INDEX idx_newsletter_subscribers_lead_status ON newsletter_subscribers(lead_status);
--     CREATE INDEX idx_newsletter_subscribers_lead_score ON newsletter_subscribers(lead_score DESC);
--   END IF;
-- END $$;

-- ====================================================================
-- 4. Unified Leads View (통합 리드 뷰)
-- ====================================================================

CREATE OR REPLACE VIEW unified_leads AS
-- Library Downloads
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
LEFT JOIN library_items li ON ll.library_item_id = li.id;

-- SKIP: Newsletter Subscribers (table does not exist yet)
-- UNION ALL
-- SELECT
--   'NEWSLETTER' AS source_type,
--   ns.id,
--   NULL AS company_name,
--   ns.name AS contact_name,
--   ns.email,
--   NULL AS phone,
--   ns.lead_status,
--   ns.lead_score,
--   ns.assigned_to,
--   ns.notes,
--   ns.created_at,
--   ns.last_contacted_at,
--   '뉴스레터 구독' AS source_detail
-- FROM newsletter_subscribers ns
-- UNION ALL
-- SELECT
--   'CONTACT_FORM' AS source_type,
--   c.id,
--   c.company_name,
--   c.contact_name,
--   c.email,
--   c.phone,
--   'NEW' AS lead_status,
--   50 AS lead_score,
--   NULL AS assigned_to,
--   c.message AS notes,
--   c.created_at,
--   c.created_at AS last_contacted_at,
--   c.inquiry_type AS source_detail
-- FROM contacts c;

-- ====================================================================
-- 5. Seed Initial Data (GLEC Framework v3.0)
-- ====================================================================

INSERT INTO library_items (
  id,
  title,
  slug,
  description,
  file_type,
  file_size_mb,
  file_url,
  download_type,
  category,
  tags,
  language,
  version,
  requires_form,
  status,
  published_at
) VALUES (
  gen_random_uuid(),
  'GLEC Framework v3.0 한글 버전',
  'glec-framework-v3-korean',
  'ISO-14083 국제표준 기반 물류 탄소배출 측정 프레임워크. Smart Freight Centre 인증 완료. 전범위·전과정 탄소배출 계산 방법론을 상세히 설명합니다.',
  'PDF',
  2.5,
  '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
  'EMAIL',
  'FRAMEWORK',
  ARRAY['ISO-14083', '탄소배출', '물류', 'Smart Freight Centre', 'GLEC Framework'],
  'ko',
  'v3.0',
  TRUE,
  'PUBLISHED',
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ====================================================================
-- 6. Updated At Trigger (자동 updated_at 업데이트)
-- ====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to library_items
DROP TRIGGER IF EXISTS update_library_items_updated_at ON library_items;
CREATE TRIGGER update_library_items_updated_at
  BEFORE UPDATE ON library_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to library_leads
DROP TRIGGER IF EXISTS update_library_leads_updated_at ON library_leads;
CREATE TRIGGER update_library_leads_updated_at
  BEFORE UPDATE ON library_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 7. Comments (테이블 설명)
-- ====================================================================

COMMENT ON TABLE library_items IS 'GLEC 지식 라이브러리 자료 목록 (PDF, 백서, 케이스 스터디 등)';
COMMENT ON TABLE library_leads IS '라이브러리 자료 다운로드 신청자 (퍼널 마케팅 리드 관리)';
COMMENT ON VIEW unified_leads IS '통합 리드 뷰 (Library + Newsletter + Contact)';

COMMENT ON COLUMN library_items.requires_form IS 'TRUE: 다운로드 전 양식 제출 필요, FALSE: 직접 다운로드';
COMMENT ON COLUMN library_items.download_type IS 'EMAIL: 이메일로 전송, DIRECT: 직접 다운로드, GOOGLE_DRIVE: Google Drive 링크';
COMMENT ON COLUMN library_leads.lead_status IS 'NEW: 신규, CONTACTED: 1차 연락, QUALIFIED: 영업 기회, PROPOSAL_SENT: 제안서 발송, WON: 계약, LOST: 기회 상실, NURTURING: 지속 관리';
COMMENT ON COLUMN library_leads.lead_score IS '0-100 점수 (자동 계산, 높을수록 우선순위 높음)';

-- ====================================================================
-- 8. Rollback SQL (Migration 롤백 시 사용)
-- ====================================================================

-- DROP VIEW IF EXISTS unified_leads CASCADE;
-- DROP TABLE IF EXISTS library_leads CASCADE;
-- DROP TABLE IF EXISTS library_items CASCADE;
-- ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS lead_status;
-- ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS lead_score;
-- ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS assigned_to;
-- ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS notes;
-- ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS last_contacted_at;

COMMIT;
