/**
 * Create contact_leads table with nurture sequence fields
 *
 * This table stores contact form submissions and tracks nurture email sequence
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function createContactLeadsTable() {
  console.log('🚀 Creating contact_leads table...\n');

  try {
    // Create contact_leads table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Contact Information
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        inquiry_details TEXT,

        -- Lead Source
        source VARCHAR(100) DEFAULT 'website_contact_form',
        utm_source VARCHAR(255),
        utm_medium VARCHAR(255),
        utm_campaign VARCHAR(255),

        -- Consent & Compliance
        marketing_consent BOOLEAN DEFAULT TRUE,
        privacy_consent BOOLEAN DEFAULT TRUE,

        -- Email Tracking
        resend_email_id VARCHAR(255),
        email_sent BOOLEAN DEFAULT FALSE,
        email_sent_at TIMESTAMP WITH TIME ZONE,
        email_delivered BOOLEAN DEFAULT FALSE,
        email_delivered_at TIMESTAMP WITH TIME ZONE,
        email_opened BOOLEAN DEFAULT FALSE,
        email_opened_at TIMESTAMP WITH TIME ZONE,
        email_clicked BOOLEAN DEFAULT FALSE,
        email_clicked_at TIMESTAMP WITH TIME ZONE,
        email_bounced BOOLEAN DEFAULT FALSE,
        email_bounced_at TIMESTAMP WITH TIME ZONE,
        email_complained BOOLEAN DEFAULT FALSE,
        email_complained_at TIMESTAMP WITH TIME ZONE,

        -- Nurture Sequence Tracking (Day 3, 7, 14, 30)
        nurture_day3_sent BOOLEAN DEFAULT FALSE,
        nurture_day3_sent_at TIMESTAMP WITH TIME ZONE,
        nurture_day7_sent BOOLEAN DEFAULT FALSE,
        nurture_day7_sent_at TIMESTAMP WITH TIME ZONE,
        nurture_day14_sent BOOLEAN DEFAULT FALSE,
        nurture_day14_sent_at TIMESTAMP WITH TIME ZONE,
        nurture_day30_sent BOOLEAN DEFAULT FALSE,
        nurture_day30_sent_at TIMESTAMP WITH TIME ZONE,

        -- Lead Scoring
        lead_score INTEGER DEFAULT 0,
        lead_status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, converted, lost

        -- Follow-up
        assigned_to VARCHAR(255),
        follow_up_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Constraints
        CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
      )
    `;

    console.log('✅ contact_leads table created');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_email ON contact_leads(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON contact_leads(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_lead_status ON contact_leads(lead_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_marketing_consent ON contact_leads(marketing_consent)`;

    // Nurture sequence indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_nurture_day3 ON contact_leads(nurture_day3_sent, created_at) WHERE marketing_consent = TRUE`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_nurture_day7 ON contact_leads(nurture_day7_sent, created_at) WHERE marketing_consent = TRUE`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_nurture_day14 ON contact_leads(nurture_day14_sent, created_at) WHERE marketing_consent = TRUE`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_leads_nurture_day30 ON contact_leads(nurture_day30_sent, created_at) WHERE marketing_consent = TRUE`;

    console.log('✅ Indexes created');

    // Verify table
    const result = await sql`
      SELECT COUNT(*) as count FROM contact_leads
    `;

    console.log(`\n✅ Table verification:`);
    console.log(`   Total contact leads: ${result[0].count}`);

    console.log('\n🎉 contact_leads table setup complete!\n');
  } catch (error) {
    console.error('❌ Error creating contact_leads table:', error);
    process.exit(1);
  }
}

createContactLeadsTable();
