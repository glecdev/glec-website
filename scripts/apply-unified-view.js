/**
 * Apply Unified Leads View
 * Purpose: SQL View 생성 스크립트 실행
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function applyUnifiedView() {
  console.log('🔄 Applying Unified Leads View...\n');

  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, 'create-unified-leads-view.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 SQL File loaded\n');

    // Execute SQL (split by semicolon for multiple statements)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.toLowerCase().includes('select \'unified')) {
        // Skip success message statement
        continue;
      }

      try {
        await sql.unsafe(statement);
        console.log('✅ Executed:', statement.split('\n')[0].substring(0, 60) + '...');
      } catch (err) {
        // Ignore errors for DROP IF EXISTS
        if (!statement.toLowerCase().includes('drop')) {
          console.error('❌ Failed:', err.message);
        }
      }
    }

    console.log('\n📊 Verifying unified_leads view...\n');

    // Verify view exists and get sample data
    const result = await sql`
      SELECT
        lead_source_type,
        COUNT(*) as count
      FROM unified_leads
      GROUP BY lead_source_type
      ORDER BY count DESC
    `;

    console.log('✅ Unified Leads View Created!\n');
    console.log('📊 Lead Distribution by Source:\n');

    let totalLeads = 0;
    result.forEach((row) => {
      console.log(`  ${row.lead_source_type.padEnd(20)} ${row.count.toString().padStart(5)} leads`);
      totalLeads += parseInt(row.count);
    });

    console.log(`  ${'─'.repeat(27)}`);
    console.log(`  ${'TOTAL'.padEnd(20)} ${totalLeads.toString().padStart(5)} leads\n`);

    // Get sample leads
    const sampleLeads = await sql`
      SELECT
        lead_source_type,
        company_name,
        contact_name,
        lead_score,
        lead_status,
        days_old
      FROM unified_leads
      ORDER BY lead_score DESC, created_at DESC
      LIMIT 5
    `;

    console.log('🔍 Top 5 Leads by Score:\n');
    sampleLeads.forEach((lead, idx) => {
      console.log(`  ${idx + 1}. [${lead.lead_source_type}] ${lead.company_name} - ${lead.contact_name}`);
      console.log(`     Score: ${lead.lead_score} | Status: ${lead.lead_status} | ${lead.days_old} days old\n`);
    });

    console.log('✅ View is ready for API integration!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyUnifiedView()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
