const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

(async () => {
  try {
    // Get library leads
    const leads = await sql`
      SELECT
        id,
        email,
        contact_name,
        company_name,
        library_item_id,
        nurture_day3_sent,
        nurture_day3_sent_at,
        nurture_day7_sent,
        nurture_day14_sent,
        nurture_day30_sent,
        created_at,
        EXTRACT(DAY FROM NOW() - created_at) as days_since_created
      FROM library_leads
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log(`📚 Library Leads (total: ${leads.length}):\n`);

    leads.forEach((lead, i) => {
      console.log(`${i+1}. [${lead.email}]`);
      console.log(`   Name: ${lead.contact_name} (${lead.company_name})`);
      console.log(`   Created: ${Math.floor(lead.days_since_created)} days ago`);
      console.log(`   Day 3 sent: ${lead.nurture_day3_sent ? 'YES' : 'NO'} ${lead.nurture_day3_sent_at || ''}`);
      console.log(`   Day 7 sent: ${lead.nurture_day7_sent ? 'YES' : 'NO'}`);
      console.log(`   Day 14 sent: ${lead.nurture_day14_sent ? 'YES' : 'NO'}`);
      console.log(`   Day 30 sent: ${lead.nurture_day30_sent ? 'YES' : 'NO'}`);
      console.log(`   Library item: ${lead.library_item_id.substring(0, 8)}`);
      console.log();
    });

    // Check eligibility for Day 3 nurture
    const eligibleDay3 = await sql`
      SELECT COUNT(*) as count
      FROM library_leads
      WHERE created_at <= NOW() - INTERVAL '3 days'
        AND nurture_day3_sent = false
    `;

    const eligibleDay7 = await sql`
      SELECT COUNT(*) as count
      FROM library_leads
      WHERE created_at <= NOW() - INTERVAL '7 days'
        AND nurture_day7_sent = false
    `;

    console.log(`\n📧 Nurture Email Eligibility:`);
    console.log(`   Day 3 eligible: ${eligibleDay3[0].count} leads`);
    console.log(`   Day 7 eligible: ${eligibleDay7[0].count} leads`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
