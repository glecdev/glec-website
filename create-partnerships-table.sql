-- Create PartnershipStatus enum
DO $$ BEGIN
  CREATE TYPE "PartnershipStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create PartnershipType enum
DO $$ BEGIN
  CREATE TYPE "PartnershipType" AS ENUM ('tech', 'reseller', 'consulting', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  partnership_type "PartnershipType" NOT NULL,
  proposal TEXT NOT NULL,
  status "PartnershipStatus" NOT NULL DEFAULT 'NEW',
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS partnerships_status_created_at_idx ON partnerships(status, created_at DESC);
CREATE INDEX IF NOT EXISTS partnerships_email_idx ON partnerships(email);
