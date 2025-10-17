/**
 * Create Email Templates System Tables
 * Simplified migration script using Neon serverless driver
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function createTables() {
  console.log('🚀 Creating email templates system tables...\n');

  try {
    // 1. Email Template Categories
    console.log('📋 Creating email_template_categories...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_template_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_key VARCHAR(100) UNIQUE NOT NULL,
        category_name VARCHAR(255) NOT NULL,
        description TEXT,
        is_content_specific BOOLEAN DEFAULT FALSE,
        icon VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ email_template_categories created\n');

    // 2. Email Templates
    console.log('📧 Creating email_templates...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID,
        content_type VARCHAR(50),
        content_id UUID,
        template_key VARCHAR(255) UNIQUE NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        description TEXT,
        nurture_day INTEGER NOT NULL,
        subject_line TEXT NOT NULL,
        preview_text TEXT,
        html_body TEXT NOT NULL,
        plain_text_body TEXT NOT NULL,
        available_variables JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        is_default BOOLEAN DEFAULT FALSE,
        version INTEGER DEFAULT 1,
        parent_template_id UUID,
        ab_test_group VARCHAR(10),
        ab_test_weight INTEGER DEFAULT 100,
        send_delay_hours INTEGER DEFAULT 0,
        created_by UUID,
        updated_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT nurture_day_check CHECK (nurture_day IN (3, 7, 14, 30)),
        CONSTRAINT ab_test_weight_check CHECK (ab_test_weight BETWEEN 0 AND 100)
      )
    `;
    console.log('✅ email_templates created\n');

    // 3. Email Template Stats
    console.log('📊 Creating email_template_stats...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_template_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID UNIQUE NOT NULL,
        total_sent INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0,
        total_opened INTEGER DEFAULT 0,
        total_clicked INTEGER DEFAULT 0,
        total_bounced INTEGER DEFAULT 0,
        total_complained INTEGER DEFAULT 0,
        total_unsubscribed INTEGER DEFAULT 0,
        delivery_rate DECIMAL(5,2) DEFAULT 0.00,
        open_rate DECIMAL(5,2) DEFAULT 0.00,
        click_rate DECIMAL(5,2) DEFAULT 0.00,
        bounce_rate DECIMAL(5,2) DEFAULT 0.00,
        complaint_rate DECIMAL(5,2) DEFAULT 0.00,
        last_sent_at TIMESTAMP WITH TIME ZONE,
        last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        period_start TIMESTAMP WITH TIME ZONE,
        period_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ email_template_stats created\n');

    // 4. Email Send History
    console.log('📤 Creating email_send_history...');
    await sql`
      CREATE TABLE IF NOT EXISTS email_send_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID,
        lead_type VARCHAR(50) NOT NULL,
        lead_id UUID NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(255),
        resend_email_id VARCHAR(255),
        subject_line TEXT,
        rendered_variables JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'pending',
        sent_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        opened_at TIMESTAMP WITH TIME ZONE,
        first_clicked_at TIMESTAMP WITH TIME ZONE,
        bounced_at TIMESTAMP WITH TIME ZONE,
        bounce_reason TEXT,
        complained_at TIMESTAMP WITH TIME ZONE,
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ email_send_history created\n');

    // 5. Create indexes
    console.log('🔍 Creating indexes...');

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_templates_content ON email_templates(content_type, content_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_templates_day ON email_templates(nurture_day)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_template_stats_template ON email_template_stats(template_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_send_history_template ON email_send_history(template_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_send_history_lead ON email_send_history(lead_type, lead_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_send_history_recipient ON email_send_history(recipient_email)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_send_history_status ON email_send_history(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_email_send_history_sent_at ON email_send_history(sent_at)`;
      console.log('✅ Indexes created\n');
    } catch (error) {
      console.log('⏭️  Indexes may already exist, skipping\n');
    }

    // 6. Insert default categories
    console.log('📝 Inserting default categories...');

    const categories = [
      ['CONTACT_FORM', '일반 문의', '웹사이트 Contact 폼을 통한 일반 문의 리드', false, 'MessageSquare'],
      ['DEMO_REQUEST', '데모 요청', 'GLEC Cloud 데모 요청 리드', false, 'Play'],
      ['NEWSLETTER_SIGNUP', '뉴스레터 구독', '뉴스레터 구독 신청 리드', false, 'Mail'],
      ['PRICING_INQUIRY', '가격 문의', '제품 가격 및 구매 문의 리드', false, 'DollarSign'],
      ['PARTNERSHIP_INQUIRY', '파트너십 문의', 'DHL GoGreen 등 파트너십 문의', false, 'Handshake'],
      ['CAREER_APPLICATION', '채용 지원', '채용 공고 지원 리드', false, 'Briefcase'],
      ['LIBRARY_DOWNLOAD', '자료실 다운로드', '지식자료실 컨텐츠 다운로드 리드 (컨텐츠별)', true, 'Download'],
      ['EVENT_REGISTRATION', '이벤트 참가', '웨비나/세미나 등 이벤트 참가 신청 (이벤트별)', true, 'Calendar'],
    ];

    for (const [key, name, desc, isContentSpecific, icon] of categories) {
      try {
        await sql`
          INSERT INTO email_template_categories (category_key, category_name, description, is_content_specific, icon)
          VALUES (${key}, ${name}, ${desc}, ${isContentSpecific}, ${icon})
          ON CONFLICT (category_key) DO NOTHING
        `;
        console.log(`   ✅ ${name} (${key})`);
      } catch (error) {
        console.log(`   ⏭️  ${name} already exists`);
      }
    }

    console.log('\n🎉 Email templates system created successfully!\n');

    // Verify
    console.log('🔍 Verifying installation...\n');

    const categoryCount = await sql`SELECT COUNT(*) as count FROM email_template_categories`;
    console.log(`   Categories: ${categoryCount[0].count}`);

    const templateCount = await sql`SELECT COUNT(*) as count FROM email_templates`;
    console.log(`   Templates: ${templateCount[0].count}`);

    console.log('\n✅ All done!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

createTables();
