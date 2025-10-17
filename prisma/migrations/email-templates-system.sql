-- ============================================================
-- Email Template Management System
-- ============================================================

-- 1. Email Template Categories (Lead Action Types)
CREATE TABLE email_template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_key VARCHAR(100) UNIQUE NOT NULL, -- CONTACT_FORM, DEMO_REQUEST, LIBRARY_DOWNLOAD, etc.
  category_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_content_specific BOOLEAN DEFAULT FALSE, -- TRUE for library/events, FALSE for generic
  icon VARCHAR(50), -- Lucide icon name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Email Templates (4 templates per category/content)
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES email_template_categories(id) ON DELETE CASCADE,

  -- Content-specific templates
  content_type VARCHAR(50), -- 'library_item', 'event', NULL for generic
  content_id UUID, -- library_item.id or event.id, NULL for generic

  -- Template metadata
  template_key VARCHAR(255) UNIQUE NOT NULL, -- contact_form_day3, library_iso14083_day7
  template_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Nurture sequence day
  nurture_day INTEGER NOT NULL CHECK (nurture_day IN (3, 7, 14, 30)),

  -- Email content
  subject_line TEXT NOT NULL,
  preview_text TEXT, -- Email preview text (first line visible in inbox)
  html_body TEXT NOT NULL,
  plain_text_body TEXT NOT NULL,

  -- Template variables (JSON array of strings)
  available_variables JSONB DEFAULT '[]'::jsonb,
  -- Example: ["contact_name", "company_name", "library_title", "download_link"]

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE, -- Default template for this category/day

  -- Version control
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,

  -- A/B testing
  ab_test_group VARCHAR(10), -- 'A', 'B', or NULL
  ab_test_weight INTEGER DEFAULT 100 CHECK (ab_test_weight BETWEEN 0 AND 100),

  -- Scheduling
  send_delay_hours INTEGER DEFAULT 0, -- Additional delay beyond nurture day

  -- Audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one default per category/content/day
  UNIQUE NULLS NOT DISTINCT (category_id, content_type, content_id, nurture_day, is_default)
    WHERE is_default = TRUE
);

-- 3. Email Template Stats (Aggregate statistics)
CREATE TABLE email_template_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,

  -- Counts
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,

  -- Rates (calculated periodically)
  delivery_rate DECIMAL(5,2) DEFAULT 0.00, -- (delivered / sent) * 100
  open_rate DECIMAL(5,2) DEFAULT 0.00,     -- (opened / delivered) * 100
  click_rate DECIMAL(5,2) DEFAULT 0.00,    -- (clicked / delivered) * 100
  bounce_rate DECIMAL(5,2) DEFAULT 0.00,   -- (bounced / sent) * 100
  complaint_rate DECIMAL(5,2) DEFAULT 0.00, -- (complained / sent) * 100

  -- Time periods
  last_sent_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Aggregate by period (for charts)
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Email Send History (Individual email tracking)
CREATE TABLE email_send_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,

  -- Recipient
  lead_type VARCHAR(50) NOT NULL, -- 'library_lead', 'demo_request', 'contact', etc.
  lead_id UUID NOT NULL, -- ID from respective table
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),

  -- Email details
  resend_email_id VARCHAR(255), -- Resend API email ID
  subject_line TEXT,

  -- Template variables used (JSON object)
  rendered_variables JSONB DEFAULT '{}'::jsonb,
  -- Example: {"contact_name": "John Doe", "company_name": "Acme Corp"}

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, complained
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  first_clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  complained_at TIMESTAMP WITH TIME ZONE,

  -- Engagement metrics
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX idx_email_templates_category ON email_templates(category_id);
CREATE INDEX idx_email_templates_content ON email_templates(content_type, content_id);
CREATE INDEX idx_email_templates_day ON email_templates(nurture_day);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_template_stats_template ON email_template_stats(template_id);
CREATE INDEX idx_email_send_history_template ON email_send_history(template_id);
CREATE INDEX idx_email_send_history_lead ON email_send_history(lead_type, lead_id);
CREATE INDEX idx_email_send_history_recipient ON email_send_history(recipient_email);
CREATE INDEX idx_email_send_history_status ON email_send_history(status);
CREATE INDEX idx_email_send_history_sent_at ON email_send_history(sent_at);

-- 6. Insert default template categories (Generic lead actions)
INSERT INTO email_template_categories (category_key, category_name, description, is_content_specific, icon) VALUES
('CONTACT_FORM', '일반 문의', '웹사이트 Contact 폼을 통한 일반 문의 리드', FALSE, 'MessageSquare'),
('DEMO_REQUEST', '데모 요청', 'GLEC Cloud 데모 요청 리드', FALSE, 'Play'),
('NEWSLETTER_SIGNUP', '뉴스레터 구독', '뉴스레터 구독 신청 리드', FALSE, 'Mail'),
('PRICING_INQUIRY', '가격 문의', '제품 가격 및 구매 문의 리드', FALSE, 'DollarSign'),
('PARTNERSHIP_INQUIRY', '파트너십 문의', 'DHL GoGreen 등 파트너십 문의', FALSE, 'Handshake'),
('CAREER_APPLICATION', '채용 지원', '채용 공고 지원 리드', FALSE, 'Briefcase'),
('LIBRARY_DOWNLOAD', '자료실 다운로드', '지식자료실 컨텐츠 다운로드 리드 (컨텐츠별)', TRUE, 'Download'),
('EVENT_REGISTRATION', '이벤트 참가', '웨비나/세미나 등 이벤트 참가 신청 (이벤트별)', TRUE, 'Calendar');

-- 7. Helper function to calculate template stats
CREATE OR REPLACE FUNCTION update_email_template_stats(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO email_template_stats (
    template_id,
    total_sent,
    total_delivered,
    total_opened,
    total_clicked,
    total_bounced,
    total_complained,
    delivery_rate,
    open_rate,
    click_rate,
    bounce_rate,
    complaint_rate,
    last_sent_at
  )
  SELECT
    p_template_id,
    COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'opened', 'clicked')),
    COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked')),
    COUNT(*) FILTER (WHERE status IN ('opened', 'clicked')),
    COUNT(*) FILTER (WHERE status = 'clicked'),
    COUNT(*) FILTER (WHERE status = 'bounced'),
    COUNT(*) FILTER (WHERE status = 'complained'),
    CASE WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked'))::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END,
    CASE WHEN COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked')) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status IN ('opened', 'clicked'))::DECIMAL / COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked'))) * 100, 2)
      ELSE 0
    END,
    CASE WHEN COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked')) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'clicked')::DECIMAL / COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked'))) * 100, 2)
      ELSE 0
    END,
    CASE WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'bounced')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END,
    CASE WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'complained')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END,
    MAX(sent_at)
  FROM email_send_history
  WHERE template_id = p_template_id
  ON CONFLICT (template_id) DO UPDATE SET
    total_sent = EXCLUDED.total_sent,
    total_delivered = EXCLUDED.total_delivered,
    total_opened = EXCLUDED.total_opened,
    total_clicked = EXCLUDED.total_clicked,
    total_bounced = EXCLUDED.total_bounced,
    total_complained = EXCLUDED.total_complained,
    delivery_rate = EXCLUDED.delivery_rate,
    open_rate = EXCLUDED.open_rate,
    click_rate = EXCLUDED.click_rate,
    bounce_rate = EXCLUDED.bounce_rate,
    complaint_rate = EXCLUDED.complaint_rate,
    last_sent_at = EXCLUDED.last_sent_at,
    last_updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger to update stats on send history insert/update
CREATE OR REPLACE FUNCTION trigger_update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_email_template_stats(NEW.template_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_send_history_stats_trigger
AFTER INSERT OR UPDATE ON email_send_history
FOR EACH ROW
WHEN (NEW.template_id IS NOT NULL)
EXECUTE FUNCTION trigger_update_template_stats();

-- 9. Comments for documentation
COMMENT ON TABLE email_template_categories IS '이메일 템플릿 카테고리 (리드 액션 타입)';
COMMENT ON TABLE email_templates IS '이메일 템플릿 (Day 3, 7, 14, 30 nurture sequence)';
COMMENT ON TABLE email_template_stats IS '이메일 템플릿 통계 (발송/오픈/클릭율)';
COMMENT ON TABLE email_send_history IS '이메일 발송 이력 (개별 이메일 추적)';

COMMENT ON COLUMN email_templates.template_key IS '고유 템플릿 키 (예: contact_form_day3, library_iso14083_day7)';
COMMENT ON COLUMN email_templates.available_variables IS '템플릿에서 사용 가능한 변수 목록 (JSON 배열)';
COMMENT ON COLUMN email_templates.is_content_specific IS 'TRUE: 특정 컨텐츠용 (자료실/이벤트), FALSE: 범용';
COMMENT ON COLUMN email_send_history.rendered_variables IS '실제 렌더링에 사용된 변수 값 (JSON 객체)';
