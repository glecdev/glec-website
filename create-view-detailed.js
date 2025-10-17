/**
 * Detailed VIEW creation with error logging
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createWithDetails() {
  console.log('🔍 Detailed VIEW Creation\n');

  try {
    // Drop
    console.log('1. Dropping VIEW...');
    await sql`DROP VIEW IF EXISTS unified_leads CASCADE`;
    console.log('   ✅ Dropped\n');

    // Read
    const sqlScript = fs.readFileSync('scripts/create-unified-leads-view.sql', 'utf8');
    const createStart = sqlScript.indexOf('CREATE OR REPLACE VIEW');
    const createEnd = sqlScript.indexOf('FROM partnerships p;') + 'FROM partnerships p;'.length;
    const createStatement = sqlScript.substring(createStart, createEnd);

    console.log('2. CREATE statement info:');
    console.log(`   Length: ${createStatement.length} chars`);
    console.log(`   Starts with: ${createStatement.substring(0, 50)}...`);
    console.log(`   Ends with: ...${createStatement.substring(createStatement.length - 50)}`);
    console.log('');

    // Try CREATE
    console.log('3. Executing CREATE...');
    try {
      await sql.unsafe(createStatement);
      console.log('   ✅ CREATE executed without error\n');
    } catch (createError) {
      console.log('   ❌ CREATE failed:');
      console.log('   Error:', createError.message);
      console.log('   Details:', JSON.stringify(createError, null, 2));
      throw createError;
    }

    // Check if it actually exists
    console.log('4. Checking if VIEW exists...');
    const viewCheck = await sql`
      SELECT COUNT(*) as count
      FROM pg_views
      WHERE viewname = 'unified_leads'
    `;
    console.log(`   VIEW exists: ${viewCheck[0].count > 0}\n`);

    if (viewCheck[0].count > 0) {
      // Try to select
      console.log('5. Testing SELECT from VIEW...');
      const testSelect = await sql`
        SELECT lead_source_type, COUNT(*) as count
        FROM unified_leads
        GROUP BY lead_source_type
      `;
      console.log('   Results:');
      testSelect.forEach(row => {
        console.log(`      ${row.lead_source_type}: ${row.count}`);
      });
    }

  } catch (error) {
    console.log('\n❌ Fatal Error:', error.message);
    if (error.position) {
      console.log('   Error position in SQL:', error.position);
    }
  }
}

createWithDetails();
