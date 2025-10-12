-- ============================================================
-- Unified Leads View
-- Purpose: 5가지 리드 소스를 하나의 뷰로 통합
-- ============================================================

-- Drop existing view if exists
DROP VIEW IF EXISTS unified_leads CASCADE;

-- Create unified leads view
CREATE OR REPLACE VIEW unified_leads AS

-- 1. Library Leads (라이브러리 다운로드)
SELECT
  'LIBRARY_LEAD' AS lead_source_type,
  ll.id AS lead_id,
  ll.company_name,
  ll.contact_name,
  ll.email,
  ll.phone,
  ll.lead_status,
  ll.lead_score,
  ll.created_at,
  ll.created_at AS updated_at,

  -- Source-specific fields
  NULL AS inquiry_type,
  NULL AS demo_product,
  NULL AS event_name,
  NULL AS partnership_type,
  ll.library_item_title AS source_detail,

  -- Activity tracking
  ll.email_sent,
  ll.email_opened,
  ll.download_link_clicked AS email_clicked,

  -- Calculated fields
  EXTRACT(DAY FROM NOW() - ll.created_at)::INTEGER AS days_old,
  ll.created_at AS last_activity
FROM library_leads ll

UNION ALL

-- 2. Contact Form (문의 폼)
SELECT
  'CONTACT_FORM' AS lead_source_type,
  c.id AS lead_id,
  c.company_name,
  c.contact_name,
  c.email,
  c.phone,
  'NEW' AS lead_status,  -- Map to standard status

  -- Calculate score (simple: recent = higher score)
  CASE
    WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 7 THEN 40
    WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 30 THEN 20
    ELSE 10
  END AS lead_score,

  c.created_at,
  c.created_at AS updated_at,

  -- Source-specific fields
  c.inquiry_type,
  NULL AS demo_product,
  NULL AS event_name,
  NULL AS partnership_type,
  c.message AS source_detail,

  -- Activity tracking
  FALSE AS email_sent,
  FALSE AS email_opened,
  FALSE AS email_clicked,

  -- Calculated fields
  EXTRACT(DAY FROM NOW() - c.created_at)::INTEGER AS days_old,
  c.created_at AS last_activity
FROM contacts c

UNION ALL

-- 3. Demo Requests (데모 신청)
SELECT
  'DEMO_REQUEST' AS lead_source_type,
  dr.id AS lead_id,
  dr.company_name,
  dr.contact_name,
  dr.email,
  dr.phone,
  dr.status AS lead_status,

  -- Calculate score (demo request = high intent)
  CASE
    WHEN dr.status = 'COMPLETED' THEN 90
    WHEN dr.status = 'SCHEDULED' THEN 80
    WHEN dr.status = 'CONTACTED' THEN 60
    WHEN dr.status = 'NEW' THEN 50
    ELSE 20
  END AS lead_score,

  dr.created_at,
  dr.updated_at,

  -- Source-specific fields
  NULL AS inquiry_type,
  dr.product AS demo_product,
  NULL AS event_name,
  NULL AS partnership_type,
  dr.message AS source_detail,

  -- Activity tracking
  FALSE AS email_sent,
  FALSE AS email_opened,
  FALSE AS email_clicked,

  -- Calculated fields
  EXTRACT(DAY FROM NOW() - dr.created_at)::INTEGER AS days_old,
  dr.updated_at AS last_activity
FROM demo_requests dr

UNION ALL

-- 4. Event Registrations (이벤트 등록)
SELECT
  'EVENT_REGISTRATION' AS lead_source_type,
  er.id AS lead_id,
  er.company_name,
  er.contact_name,
  er.email,
  er.phone,
  er.status AS lead_status,

  -- Calculate score (attendance = high engagement)
  CASE
    WHEN er.status = 'ATTENDED' THEN 70
    WHEN er.status = 'CONFIRMED' THEN 50
    WHEN er.status = 'PENDING' THEN 30
    ELSE 10
  END AS lead_score,

  er.created_at,
  er.updated_at,

  -- Source-specific fields
  NULL AS inquiry_type,
  NULL AS demo_product,
  e.title AS event_name,
  NULL AS partnership_type,
  e.description AS source_detail,

  -- Activity tracking
  FALSE AS email_sent,
  FALSE AS email_opened,
  FALSE AS email_clicked,

  -- Calculated fields
  EXTRACT(DAY FROM NOW() - er.created_at)::INTEGER AS days_old,
  er.updated_at AS last_activity
FROM event_registrations er
INNER JOIN events e ON er.event_id = e.id

UNION ALL

-- 5. Partnerships (파트너십 문의)
SELECT
  'PARTNERSHIP' AS lead_source_type,
  p.id AS lead_id,
  p.company_name,
  p.contact_name,
  p.email,
  p.phone,
  COALESCE(p.status, 'NEW') AS lead_status,

  -- Calculate score (partnership = strategic value)
  CASE
    WHEN p.status = 'ACCEPTED' THEN 100
    WHEN p.status = 'REVIEWING' THEN 70
    WHEN p.status = 'NEW' THEN 50
    ELSE 20
  END AS lead_score,

  p.created_at,
  p.updated_at,

  -- Source-specific fields
  NULL AS inquiry_type,
  NULL AS demo_product,
  NULL AS event_name,
  p.partnership_type,
  p.message AS source_detail,

  -- Activity tracking
  FALSE AS email_sent,
  FALSE AS email_opened,
  FALSE AS email_clicked,

  -- Calculated fields
  EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER AS days_old,
  p.updated_at AS last_activity
FROM partnerships p;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_unified_leads_source_type ON library_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_unified_leads_score ON library_leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_partnerships_created ON partnerships(created_at);

-- Grant permissions
GRANT SELECT ON unified_leads TO PUBLIC;

-- Success message
SELECT 'Unified Leads View created successfully!' AS message;
