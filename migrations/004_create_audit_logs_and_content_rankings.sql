-- Migration 004: Create Audit Logs and Content Rankings tables
-- Created: 2025-10-07
-- Purpose: Advanced Analytics & Logging System

-- ============================================================
-- 1. CREATE ENUMS
-- ============================================================

CREATE TYPE audit_action AS ENUM ('LOGIN', 'CREATE', 'UPDATE', 'DELETE');
CREATE TYPE period_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME');

-- ============================================================
-- 2. CREATE AUDIT_LOGS TABLE
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  action audit_action NOT NULL,
  resource VARCHAR(255) NOT NULL,
  resource_id UUID,
  
  changes JSONB,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- 3. CREATE CONTENT_RANKINGS TABLE
-- ============================================================

CREATE TABLE content_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  content_title VARCHAR(500) NOT NULL,
  
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  
  period_type period_type NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  
  rank INTEGER NOT NULL,
  previous_rank INTEGER,
  rank_change INTEGER,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Unique constraint
CREATE UNIQUE INDEX idx_content_rankings_unique ON content_rankings(content_type, content_id, period_type, period_start);

-- Other indexes
CREATE INDEX idx_content_rankings_period ON content_rankings(period_type, period_start DESC);
CREATE INDEX idx_content_rankings_rank ON content_rankings(rank);

-- ============================================================
-- 4. GRANT PERMISSIONS (if using specific user)
-- ============================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO glec_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON content_rankings TO glec_app_user;

