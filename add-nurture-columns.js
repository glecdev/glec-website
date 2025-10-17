const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('Adding nurture sequence columns to library_leads table...\n');

  try {
    // Add Day 3 columns
    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day3_sent BOOLEAN DEFAULT FALSE`;
    console.log('✅ Added: nurture_day3_sent');

    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day3_sent_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ Added: nurture_day3_sent_at');

    // Add Day 7 columns
    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day7_sent BOOLEAN DEFAULT FALSE`;
    console.log('✅ Added: nurture_day7_sent');

    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day7_sent_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ Added: nurture_day7_sent_at');

    // Add Day 14 columns
    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day14_sent BOOLEAN DEFAULT FALSE`;
    console.log('✅ Added: nurture_day14_sent');

    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day14_sent_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ Added: nurture_day14_sent_at');

    // Add Day 30 columns
    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day30_sent BOOLEAN DEFAULT FALSE`;
    console.log('✅ Added: nurture_day30_sent');

    await sql`ALTER TABLE library_leads ADD COLUMN IF NOT EXISTS nurture_day30_sent_at TIMESTAMP WITH TIME ZONE`;
    console.log('✅ Added: nurture_day30_sent_at');

    console.log('\n✅ All nurture columns added successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
