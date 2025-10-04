-- Migration: Create demo_requests table
-- Purpose: Store demo request form submissions
-- Date: 2025-10-03

-- Create demo_requests table
CREATE TABLE IF NOT EXISTS demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(100) NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  preferred_date TIMESTAMP NOT NULL,
  preferred_product VARCHAR(20) NOT NULL CHECK (preferred_product IN ('DTG', 'API', 'CLOUD', 'ALL')),
  message TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_preferred_date ON demo_requests(preferred_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_demo_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_demo_requests_updated_at
BEFORE UPDATE ON demo_requests
FOR EACH ROW
EXECUTE FUNCTION update_demo_requests_updated_at();

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON demo_requests TO content_manager;
-- GRANT SELECT ON demo_requests TO analyst;

-- Sample query to verify
-- SELECT * FROM demo_requests ORDER BY created_at DESC LIMIT 10;
