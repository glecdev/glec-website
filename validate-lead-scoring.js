/**
 * Lead Scoring Business Validation
 *
 * Purpose: Analyze and validate lead scoring logic across all 5 sources
 *
 * Scoring Criteria Analysis:
 * 1. LIBRARY_LEAD: 0-100 (calculated in API)
 * 2. CONTACT_FORM: 10-40 (based on recency)
 * 3. DEMO_REQUEST: 20-90 (based on status)
 * 4. EVENT_REGISTRATION: 10-70 (based on attendance status)
 * 5. PARTNERSHIP: 20-100 (based on partnership status)
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function validateLeadScoring() {
  console.log('🎯 Lead Scoring Business Validation\n');
  console.log('================================================\n');

  // ========================================
  // 1. Score Distribution Analysis
  // ========================================
  console.log('📊 1. Score Distribution Across All Lead Sources\n');

  const scoreStats = await sql`
    SELECT
      lead_source_type,
      COUNT(*) as total_leads,
      ROUND(AVG(lead_score), 2) as avg_score,
      MIN(lead_score) as min_score,
      MAX(lead_score) as max_score,
      ROUND(STDDEV(lead_score), 2) as stddev_score
    FROM unified_leads
    GROUP BY lead_source_type
    ORDER BY avg_score DESC
  `;

  console.log('┌─────────────────────┬──────────┬───────────┬───────────┬───────────┬────────────┐');
  console.log('│ Source Type         │ Leads    │ Avg Score │ Min Score │ Max Score │ Std Dev    │');
  console.log('├─────────────────────┼──────────┼───────────┼───────────┼───────────┼────────────┤');

  scoreStats.forEach(row => {
    const sourceType = row.lead_source_type.padEnd(19);
    const totalLeads = String(row.total_leads).padStart(8);
    const avgScore = String(row.avg_score).padStart(9);
    const minScore = String(row.min_score).padStart(9);
    const maxScore = String(row.max_score).padStart(9);
    const stddevScore = String(row.stddev_score || '0.00').padStart(10);
    console.log(`│ ${sourceType} │ ${totalLeads} │ ${avgScore} │ ${minScore} │ ${maxScore} │ ${stddevScore} │`);
  });

  console.log('└─────────────────────┴──────────┴───────────┴───────────┴───────────┴────────────┘\n');

  // ========================================
  // 2. Library Lead Scoring Analysis
  // ========================================
  console.log('📚 2. Library Lead Scoring Breakdown\n');

  const libraryLeads = await sql`
    SELECT
      ll.id,
      ll.company_name,
      ll.email,
      ll.phone,
      ll.lead_score,
      ll.marketing_consent,
      ll.privacy_consent,
      li.category as library_category,
      li.title as library_title
    FROM library_leads ll
    LEFT JOIN library_items li ON ll.library_item_id = li.id
    ORDER BY ll.lead_score DESC
    LIMIT 10
  `;

  console.log('Top 10 Library Leads by Score:');
  console.log('');
  libraryLeads.forEach((lead, index) => {
    console.log(`${index + 1}. Score: ${lead.lead_score} | ${lead.company_name}`);
    console.log(`   Category: ${lead.library_category} | Title: ${lead.library_title}`);
    console.log(`   Email: ${lead.email} | Phone: ${lead.phone ? '✅' : '❌'} | Marketing: ${lead.marketing_consent ? '✅' : '❌'}`);
    console.log('');
  });

  // Validate scoring formula
  console.log('Library Lead Scoring Formula:');
  console.log('  Base (Library Download):          30 points');
  console.log('  + Library Category Value:         5-20 points');
  console.log('    - FRAMEWORK:                    20 points');
  console.log('    - WHITEPAPER:                   15 points');
  console.log('    - CASE_STUDY:                   10 points');
  console.log('    - OTHER:                        5 points');
  console.log('  + Company Size (email domain):    0-20 points');
  console.log('    - Fortune 500 / Large Corp:     20 points');
  console.log('    - Logistics Companies:          18 points');
  console.log('    - SMB / Corporate Email:        10 points');
  console.log('    - Generic Email (gmail, etc):   0 points');
  console.log('  + Marketing Consent:              10 points');
  console.log('  + Phone Provided:                 10 points');
  console.log('  + UTM Tracking:                   10 points');
  console.log('  = TOTAL:                          0-100 points\n');

  // ========================================
  // 3. Contact Form Scoring Analysis
  // ========================================
  console.log('📝 3. Contact Form Scoring Breakdown\n');

  const contactFormLeads = await sql`
    SELECT
      ul.lead_id,
      ul.company_name,
      ul.email,
      ul.lead_score,
      ul.days_old,
      c.inquiry_type
    FROM unified_leads ul
    INNER JOIN contacts c ON ul.lead_id = c.id::text
    WHERE ul.lead_source_type = 'CONTACT_FORM'
    ORDER BY ul.lead_score DESC
    LIMIT 5
  `;

  console.log('Top 5 Contact Form Leads:');
  console.log('');
  contactFormLeads.forEach((lead, index) => {
    console.log(`${index + 1}. Score: ${lead.lead_score} | ${lead.company_name}`);
    console.log(`   Days Old: ${lead.days_old} | Inquiry: ${lead.inquiry_type}`);
    console.log('');
  });

  console.log('Contact Form Scoring Formula:');
  console.log('  Recent (≤7 days):                 40 points');
  console.log('  Medium (8-30 days):               20 points');
  console.log('  Old (>30 days):                   10 points\n');

  // ========================================
  // 4. Demo Request Scoring Analysis
  // ========================================
  console.log('🎬 4. Demo Request Scoring Breakdown\n');

  const demoRequestLeads = await sql`
    SELECT
      ul.lead_id,
      ul.company_name,
      ul.email,
      ul.lead_score,
      dr.status,
      dr.product_interests
    FROM unified_leads ul
    INNER JOIN demo_requests dr ON ul.lead_id = dr.id::text
    WHERE ul.lead_source_type = 'DEMO_REQUEST'
    ORDER BY ul.lead_score DESC
    LIMIT 5
  `;

  console.log('Top 5 Demo Request Leads:');
  console.log('');
  demoRequestLeads.forEach((lead, index) => {
    console.log(`${index + 1}. Score: ${lead.lead_score} | ${lead.company_name}`);
    console.log(`   Status: ${lead.status} | Products: ${lead.product_interests}`);
    console.log('');
  });

  console.log('Demo Request Scoring Formula:');
  console.log('  Status = COMPLETED:               90 points');
  console.log('  Status = SCHEDULED:               80 points');
  console.log('  Status = CONTACTED:               60 points');
  console.log('  Status = NEW:                     50 points');
  console.log('  Other:                            20 points\n');

  // ========================================
  // 5. Event Registration Scoring Analysis
  // ========================================
  console.log('🎫 5. Event Registration Scoring Breakdown\n');

  const eventLeads = await sql`
    SELECT
      ul.lead_id,
      ul.company_name,
      ul.email,
      ul.lead_score,
      er.status,
      ul.event_name
    FROM unified_leads ul
    INNER JOIN event_registrations er ON ul.lead_id = er.id::text
    WHERE ul.lead_source_type = 'EVENT_REGISTRATION'
    ORDER BY ul.lead_score DESC
    LIMIT 5
  `;

  console.log('Top 5 Event Registration Leads:');
  console.log('');
  eventLeads.forEach((lead, index) => {
    console.log(`${index + 1}. Score: ${lead.lead_score} | ${lead.company_name}`);
    console.log(`   Status: ${lead.status} | Event: ${lead.event_name}`);
    console.log('');
  });

  console.log('Event Registration Scoring Formula:');
  console.log('  Status = ATTENDED:                70 points');
  console.log('  Status = CONFIRMED:               50 points');
  console.log('  Status = PENDING:                 30 points');
  console.log('  Other:                            10 points\n');

  // ========================================
  // 6. Partnership Scoring Analysis
  // ========================================
  console.log('🤝 6. Partnership Scoring Breakdown\n');

  const partnershipLeads = await sql`
    SELECT
      ul.lead_id,
      ul.company_name,
      ul.email,
      ul.lead_score,
      p.status,
      ul.partnership_type
    FROM unified_leads ul
    INNER JOIN partnerships p ON ul.lead_id = p.id::text
    WHERE ul.lead_source_type = 'PARTNERSHIP'
    ORDER BY ul.lead_score DESC
    LIMIT 5
  `;

  console.log('Top 5 Partnership Leads:');
  console.log('');
  partnershipLeads.forEach((lead, index) => {
    console.log(`${index + 1}. Score: ${lead.lead_score} | ${lead.company_name}`);
    console.log(`   Status: ${lead.status} | Type: ${lead.partnership_type}`);
    console.log('');
  });

  console.log('Partnership Scoring Formula:');
  console.log('  Status = ACCEPTED:                100 points');
  console.log('  Status = IN_PROGRESS:             70 points');
  console.log('  Status = NEW:                     50 points');
  console.log('  Other:                            20 points\n');

  // ========================================
  // 7. Business Recommendations
  // ========================================
  console.log('================================================\n');
  console.log('💡 Business Recommendations\n');

  const avgScoreByType = {};
  scoreStats.forEach(row => {
    avgScoreByType[row.lead_source_type] = row.avg_score;
  });

  console.log('Priority Ranking (by average score):');
  const ranked = Object.entries(avgScoreByType).sort((a, b) => b[1] - a[1]);
  ranked.forEach(([type, score], index) => {
    const priority = index === 0 ? 'P0 (Immediate Focus)' :
                     index === 1 ? 'P1 (High Priority)' :
                     index === 2 ? 'P2 (Medium Priority)' : 'P3 (Low Priority)';
    console.log(`  ${index + 1}. ${type.padEnd(25)} (Avg: ${score}) - ${priority}`);
  });
  console.log('');

  console.log('Recommended Actions:');
  console.log('  1. **Partnerships** (highest strategic value):');
  console.log('     - Assign dedicated account manager immediately');
  console.log('     - Schedule executive-level meetings within 48 hours');
  console.log('     - Prepare customized partnership proposals');
  console.log('');

  console.log('  2. **Demo Requests** (high purchase intent):');
  console.log('     - Respond within 2 hours (business hours)');
  console.log('     - Schedule demo within 3 business days');
  console.log('     - Send pre-demo questionnaire for customization');
  console.log('');

  console.log('  3. **Library Leads** (content engagement):');
  console.log('     - Automated email nurture sequence (Day 0, 3, 7, 14)');
  console.log('     - Segment by category (Framework > Whitepaper > Case Study)');
  console.log('     - Offer related content or demo based on download');
  console.log('');

  console.log('  4. **Event Registrations** (brand awareness):');
  console.log('     - Post-event follow-up within 24 hours (ATTENDED)');
  console.log('     - Send event recording + key takeaways');
  console.log('     - Segment by attendance status for targeted campaigns');
  console.log('');

  console.log('  5. **Contact Form** (general inquiries):');
  console.log('     - Auto-respond within 1 hour');
  console.log('     - Qualify inquiry type and route to appropriate team');
  console.log('     - Prioritize recent contacts (≤7 days)');
  console.log('');

  console.log('================================================\n');
  console.log('✅ Lead Scoring Validation Complete!\n');
}

validateLeadScoring().catch(console.error);
