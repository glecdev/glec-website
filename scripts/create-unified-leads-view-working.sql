-- ============================================================
-- Unified Leads View (Working Version)
-- Purpose: Integrate 4 lead sources without library_leads
-- Tables: contacts, demo_requests, event_registrations, partnerships
-- ============================================================

-- Drop existing view if exists
DROP VIEW IF EXISTS unified_leads CASCADE;

-- Create unified leads view (without library_leads)
CREATE OR REPLACE VIEW unified_leads AS

-- 1. Contact Form (문의 폼)
SELECT
  'CONTACT_FORM' AS lead_source_type,
  c.id::text AS lead_id,
  c.company_name,
  c.contact_name,
  c.email,
  c.phone,
  c.status::text AS lead_status,

  -- Calculate score (simple: recent = higher score)
  CASE
    WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 7 THEN 40
    WHEN EXTRACT(DAY FROM NOW() - c.created_at) <= 30 THEN 20
    ELSE 10
  END AS lead_score,

  c.created_at,
  c.updated_at,

  -- Source-specific fields
  c.inquiry_type::text,
  NULL::text AS demo_product,
  NULL::text AS event_name,
  NULL::text AS partnership_type,
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

-- 2. Demo Requests (데모 신청)
SELECT
  'DEMO_REQUEST' AS lead_source_type,
  dr.id::text AS lead_id,
  dr.company_name,
  dr.contact_name,
  dr.email,
  dr.phone,
  dr.status::text AS lead_status,

  -- Calculate score (demo request = high intent)
  CASE
    WHEN dr.status::text = 'COMPLETED' THEN 90
    WHEN dr.status::text = 'SCHEDULED' THEN 80
    WHEN dr.status::text = 'NEW' THEN 50
    WHEN dr.status::text = 'CANCELLED' THEN 20
    ELSE 20
  END AS lead_score,

  dr.created_at,
  dr.updated_at,

  -- Source-specific fields
  NULL::text AS inquiry_type,
  array_to_string(dr.product_interests, ', ') AS demo_product,
  NULL::text AS event_name,
  NULL::text AS partnership_type,
  dr.additional_message AS source_detail,

  -- Activity tracking
  FALSE AS email_sent,
  FALSE AS email_opened,
  FALSE AS email_clicked,

  -- Calculated fields
  EXTRACT(DAY FROM NOW() - dr.created_at)::INTEGER AS days_old,
  dr.updated_at AS last_activity
FROM demo_requests dr

UNION ALL

-- 3. Event Registrations (이벤트 등록)
SELECT
  'EVENT_REGISTRATION' AS lead_source_type,
  er.id::text AS lead_id,
  er.company AS company_name,
  er.name AS contact_name,
  er.email,
  er.phone,
  er.status::text AS lead_status,

  -- Calculate score (attendance = high engagement)
  CASE
    WHEN er.status::text = 'APPROVED' THEN 70
    WHEN er.status::text = 'PENDING' THEN 30
    WHEN er.status::text = 'REJECTED' THEN 10
    WHEN er.status::text = 'CANCELLED' THEN 10
    ELSE 10
  END AS lead_score,

  er.created_at,
  er.updated_at,

  -- Source-specific fields
  NULL::text AS inquiry_type,
  NULL::text AS demo_product,
  e.title AS event_name,
  NULL::text AS partnership_type,
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

-- 4. Partnerships (파트너십 문의)
SELECT
  'PARTNERSHIP' AS lead_source_type,
  p.id::text AS lead_id,
  p.company_name,
  p.contact_name,
  p.email,
  NULL AS phone,
  COALESCE(p.status::text, 'NEW') AS lead_status,

  -- Calculate score (partnership = strategic value)
  CASE
    WHEN p.status = 'ACCEPTED' THEN 100
    WHEN p.status = 'IN_PROGRESS' THEN 70
    WHEN p.status = 'NEW' THEN 50
    ELSE 20
  END AS lead_score,

  p.created_at,
  p.updated_at,

  -- Source-specific fields
  NULL::text AS inquiry_type,
  NULL::text AS demo_product,
  NULL::text AS event_name,
  p.partnership_type::text,
  p.proposal AS source_detail,

  -- Activity tracking
  FALSE AS email_sent,
  FALSE AS email_opened,
  FALSE AS email_clicked,

  -- Calculated fields
  EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER AS days_old,
  p.updated_at AS last_activity
FROM partnerships p;

-- Grant permissions
GRANT SELECT ON unified_leads TO PUBLIC;

-- Success message
SELECT 'Unified Leads View created successfully (4 sources)!' AS message;
