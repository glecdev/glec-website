-- ============================================================
-- Email Automation System Tables
-- Created: 2025-10-18
-- Purpose: Add email templates, automation rules, sends, and metrics
-- ============================================================

-- Create ENUMs
CREATE TYPE "EmailTemplateType" AS ENUM ('WELCOME', 'CONFIRMATION', 'FOLLOW_UP', 'NURTURE', 'RE_ENGAGEMENT');
CREATE TYPE "LeadSourceType" AS ENUM ('LIBRARY_LEAD', 'CONTACT_FORM', 'DEMO_REQUEST', 'EVENT_REGISTRATION');
CREATE TYPE "TriggerType" AS ENUM ('LEAD_CREATED', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'TIME_ELAPSED', 'STATUS_CHANGED');
CREATE TYPE "EmailSendStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'SPAM', 'FAILED');

-- ============================================================
-- 1. email_templates TABLE
-- ============================================================
CREATE TABLE "email_templates" (
    "template_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "template_name" VARCHAR(100) NOT NULL UNIQUE,
    "template_type" "EmailTemplateType" NOT NULL,
    "lead_source_type" "LeadSourceType" NOT NULL,

    -- Email Content
    "subject" VARCHAR(200) NOT NULL,
    "html_body" TEXT NOT NULL,
    "text_body" TEXT NOT NULL,

    -- Variables
    "variables" JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Trigger Configuration
    "trigger_type" "TriggerType" NOT NULL,
    "trigger_delay_minutes" INTEGER NOT NULL DEFAULT 0,

    -- A/B Testing
    "is_ab_test" BOOLEAN NOT NULL DEFAULT FALSE,
    "ab_variant_id" UUID REFERENCES "email_templates"("template_id") ON DELETE SET NULL,
    "ab_traffic_split" INTEGER NOT NULL DEFAULT 50,

    -- Metadata
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for email_templates
CREATE INDEX "idx_email_templates_lead_source" ON "email_templates"("lead_source_type");
CREATE INDEX "idx_email_templates_active" ON "email_templates"("is_active") WHERE "is_active" = TRUE;
CREATE INDEX "idx_email_templates_type" ON "email_templates"("template_type");

-- ============================================================
-- 2. automation_rules TABLE
-- ============================================================
CREATE TABLE "automation_rules" (
    "rule_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "rule_name" VARCHAR(100) NOT NULL UNIQUE,
    "lead_source_type" "LeadSourceType" NOT NULL,

    -- Trigger Configuration
    "trigger_type" "TriggerType" NOT NULL,
    "trigger_delay_minutes" INTEGER NOT NULL DEFAULT 0,
    "trigger_condition" JSONB,

    -- Template
    "template_id" UUID NOT NULL REFERENCES "email_templates"("template_id") ON DELETE CASCADE,

    -- Sending Limits
    "max_sends_per_lead" INTEGER NOT NULL DEFAULT 1,
    "max_sends_per_day" INTEGER NOT NULL DEFAULT 2,
    "cooldown_minutes" INTEGER NOT NULL DEFAULT 1440, -- 24 hours

    -- Priority
    "priority" INTEGER NOT NULL DEFAULT 3, -- 1 (highest) to 5 (lowest)

    -- Metadata
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for automation_rules
CREATE INDEX "idx_automation_rules_active" ON "automation_rules"("is_active") WHERE "is_active" = TRUE;
CREATE INDEX "idx_automation_rules_lead_source" ON "automation_rules"("lead_source_type");
CREATE INDEX "idx_automation_rules_trigger" ON "automation_rules"("trigger_type");

-- ============================================================
-- 3. email_sends TABLE
-- ============================================================
CREATE TABLE "email_sends" (
    "email_send_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "lead_id" UUID NOT NULL, -- References unified_leads view (no FK constraint)
    "rule_id" UUID NOT NULL REFERENCES "automation_rules"("rule_id") ON DELETE CASCADE,
    "template_id" UUID NOT NULL REFERENCES "email_templates"("template_id") ON DELETE CASCADE,

    -- Resend API
    "resend_email_id" VARCHAR(100),

    -- Email Details
    "recipient_email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,

    -- Status
    "status" "EmailSendStatus" NOT NULL DEFAULT 'PENDING',

    -- Timestamps
    "sent_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "opened_at" TIMESTAMPTZ,
    "clicked_at" TIMESTAMPTZ,

    -- A/B Testing
    "ab_variant" VARCHAR(1), -- 'A' or 'B'

    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for email_sends
CREATE INDEX "idx_email_sends_lead" ON "email_sends"("lead_id");
CREATE INDEX "idx_email_sends_rule" ON "email_sends"("rule_id");
CREATE INDEX "idx_email_sends_template" ON "email_sends"("template_id");
CREATE INDEX "idx_email_sends_status" ON "email_sends"("status");
CREATE INDEX "idx_email_sends_sent_at" ON "email_sends"("sent_at");

-- ============================================================
-- 4. email_metrics TABLE
-- ============================================================
CREATE TABLE "email_metrics" (
    "metric_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL REFERENCES "email_templates"("template_id") ON DELETE CASCADE,

    -- Time Period
    "date" DATE NOT NULL,
    "hour" INTEGER, -- 0-23 for hourly stats

    -- Sending Metrics
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "bounced_count" INTEGER NOT NULL DEFAULT 0,

    -- Engagement Metrics
    "opened_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_count" INTEGER NOT NULL DEFAULT 0,
    "converted_count" INTEGER NOT NULL DEFAULT 0,

    -- Negative Metrics
    "unsubscribed_count" INTEGER NOT NULL DEFAULT 0,
    "spam_count" INTEGER NOT NULL DEFAULT 0,

    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE("template_id", "date", "hour")
);

-- Indexes for email_metrics
CREATE INDEX "idx_email_metrics_template" ON "email_metrics"("template_id");
CREATE INDEX "idx_email_metrics_date" ON "email_metrics"("date" DESC);

-- ============================================================
-- Update Trigger for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON "email_templates"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
BEFORE UPDATE ON "automation_rules"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_sends_updated_at
BEFORE UPDATE ON "email_sends"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_metrics_updated_at
BEFORE UPDATE ON "email_metrics"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMPLETED
-- ============================================================
COMMENT ON TABLE "email_templates" IS 'Email templates for automated lead nurturing';
COMMENT ON TABLE "automation_rules" IS 'Automation rules for triggering email sends';
COMMENT ON TABLE "email_sends" IS 'Email send history and status';
COMMENT ON TABLE "email_metrics" IS 'Aggregated email performance metrics';
