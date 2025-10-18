#!/usr/bin/env node

/**
 * Add Nurture Columns to library_leads Table
 *
 * Adds nurture sequence tracking columns to existing library_leads table
 */

const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addNurtureColumns() {
  console.log('🔧 Adding nurture columns to library_leads table...\n');

  try {
    // Check if library_leads table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'library_leads'
      ) as exists
    `;

    if (!tableExists[0].exists) {
      console.log('❌ library_leads table does not exist!');
      console.log('   Please create the table first.');
      process.exit(1);
    }

    console.log('✅ library_leads table found');

    // Check if columns already exist
    const existingColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'library_leads'
      AND column_name LIKE 'nurture_%'
    `;

    if (existingColumns.length >= 8) {
      console.log('✅ Nurture columns already exist!');
      console.log(`   Found ${existingColumns.length} nurture columns.`);
      process.exit(0);
    }

    console.log('\n📝 Adding nurture columns...\n');

    // Add nurture columns
    await sql`
      ALTER TABLE library_leads
      ADD COLUMN IF NOT EXISTS nurture_day3_sent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS nurture_day3_sent_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS nurture_day7_sent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS nurture_day7_sent_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS nurture_day14_sent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS nurture_day14_sent_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS nurture_day30_sent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS nurture_day30_sent_at TIMESTAMP
    `;

    console.log('✅ Added nurture_day3_sent (BOOLEAN)');
    console.log('✅ Added nurture_day3_sent_at (TIMESTAMP)');
    console.log('✅ Added nurture_day7_sent (BOOLEAN)');
    console.log('✅ Added nurture_day7_sent_at (TIMESTAMP)');
    console.log('✅ Added nurture_day14_sent (BOOLEAN)');
    console.log('✅ Added nurture_day14_sent_at (TIMESTAMP)');
    console.log('✅ Added nurture_day30_sent (BOOLEAN)');
    console.log('✅ Added nurture_day30_sent_at (TIMESTAMP)');

    // Create indexes for better query performance
    console.log('\n📊 Creating indexes...\n');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_library_leads_nurture_day3
      ON library_leads(created_at, nurture_day3_sent)
      WHERE nurture_day3_sent = FALSE AND marketing_consent = TRUE
    `;
    console.log('✅ Created index: idx_library_leads_nurture_day3');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_library_leads_nurture_day7
      ON library_leads(created_at, nurture_day7_sent, nurture_day3_sent)
      WHERE nurture_day7_sent = FALSE AND nurture_day3_sent = TRUE AND marketing_consent = TRUE
    `;
    console.log('✅ Created index: idx_library_leads_nurture_day7');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_library_leads_nurture_day14
      ON library_leads(created_at, nurture_day14_sent, nurture_day7_sent)
      WHERE nurture_day14_sent = FALSE AND nurture_day7_sent = TRUE AND marketing_consent = TRUE
    `;
    console.log('✅ Created index: idx_library_leads_nurture_day14');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_library_leads_nurture_day30
      ON library_leads(created_at, nurture_day30_sent, nurture_day14_sent)
      WHERE nurture_day30_sent = FALSE AND nurture_day14_sent = TRUE AND marketing_consent = TRUE
    `;
    console.log('✅ Created index: idx_library_leads_nurture_day30');

    // Verify columns were added
    const newColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'library_leads'
      AND column_name LIKE 'nurture_%'
      ORDER BY column_name
    `;

    console.log('\n✅ Migration completed successfully!');
    console.log(`\n📊 Total nurture columns: ${newColumns.length}`);
    console.log('\nColumns added:');
    newColumns.forEach((col) => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n🎯 library_leads table is now ready for nurture sequences!');
  } catch (error) {
    console.error('❌ Error adding nurture columns:', error);
    process.exit(1);
  }
}

addNurtureColumns();
