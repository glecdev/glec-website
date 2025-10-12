-- Migration: Add resend_email_id columns to track email delivery status
-- Purpose: Link database records with Resend API emails for webhook processing
-- Date: 2025-10-12

-- Add resend_email_id to contacts table
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS resend_admin_email_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS resend_user_email_id VARCHAR(255);

-- Add indexes for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_contacts_resend_admin_email_id
ON contacts(resend_admin_email_id)
WHERE resend_admin_email_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_resend_user_email_id
ON contacts(resend_user_email_id)
WHERE resend_user_email_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN contacts.resend_admin_email_id IS 'Resend API email ID for admin notification email';
COMMENT ON COLUMN contacts.resend_user_email_id IS 'Resend API email ID for user auto-response email';

-- Add resend_email_id to library_leads table
ALTER TABLE library_leads
ADD COLUMN IF NOT EXISTS resend_email_id VARCHAR(255);

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_library_leads_resend_email_id
ON library_leads(resend_email_id)
WHERE resend_email_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN library_leads.resend_email_id IS 'Resend API email ID for library download confirmation email';

-- Add email_delivery_status enum type
DO $$ BEGIN
  CREATE TYPE email_delivery_status AS ENUM (
    'pending',    -- Email queued but not yet sent
    'sent',       -- Email sent to Resend API
    'delivered',  -- Email delivered to recipient
    'opened',     -- Email opened by recipient
    'clicked',    -- Email link clicked
    'bounced',    -- Email bounced
    'complained', -- Email marked as spam
    'failed'      -- Email sending failed
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add email_delivery_status columns
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS admin_email_status email_delivery_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS user_email_status email_delivery_status DEFAULT 'pending';

ALTER TABLE library_leads
ADD COLUMN IF NOT EXISTS email_status email_delivery_status DEFAULT 'pending';

-- Add timestamp columns for tracking
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS admin_email_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS admin_email_delivered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS user_email_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS user_email_delivered_at TIMESTAMP;

ALTER TABLE library_leads
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_delivered_at TIMESTAMP;

-- Add comments
COMMENT ON COLUMN contacts.admin_email_status IS 'Delivery status of admin notification email';
COMMENT ON COLUMN contacts.user_email_status IS 'Delivery status of user auto-response email';
COMMENT ON COLUMN library_leads.email_status IS 'Delivery status of library download confirmation email';

-- Create webhook events log table
CREATE TABLE IF NOT EXISTS email_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_email_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Add indexes for webhook events
CREATE INDEX IF NOT EXISTS idx_email_webhook_events_resend_email_id
ON email_webhook_events(resend_email_id);

CREATE INDEX IF NOT EXISTS idx_email_webhook_events_created_at
ON email_webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_webhook_events_processed
ON email_webhook_events(processed)
WHERE processed = FALSE;

-- Add comments
COMMENT ON TABLE email_webhook_events IS 'Stores Resend webhook events for audit and reprocessing';
COMMENT ON COLUMN email_webhook_events.resend_email_id IS 'Resend API email ID from webhook payload';
COMMENT ON COLUMN email_webhook_events.event_type IS 'Webhook event type (email.sent, email.delivered, etc.)';
COMMENT ON COLUMN email_webhook_events.payload IS 'Full webhook payload as JSON';
COMMENT ON COLUMN email_webhook_events.processed IS 'Whether the webhook event has been processed';

-- Migration complete
SELECT 'Migration 003: resend_email_id columns and webhook tables created successfully' AS status;
