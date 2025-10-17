/**
 * Force recreate unified_leads VIEW
 * Split into DROP and CREATE steps
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function forceRecreate() {
  console.log('🔨 Force recreating unified_leads VIEW...\n');

  try {
    // Step 1: DROP VIEW
    console.log('Step 1: Dropping existing VIEW...');
    await sql`DROP VIEW IF EXISTS unified_leads CASCADE`;
    console.log('   ✅ VIEW dropped\n');

    // Step 2: Read and prepare CREATE statement
    console.log('Step 2: Preparing CREATE statement...');
    const sqlScript = fs.readFileSync('scripts/create-unified-leads-view.sql', 'utf8');

    // Extract only the CREATE VIEW statement
    const createStart = sqlScript.indexOf('CREATE OR REPLACE VIEW');
    const createEnd = sqlScript.indexOf('FROM partnerships p;') + 'FROM partnerships p;'.length;

    if (createStart === -1 || createEnd === -1) {
      throw new Error('Could not find CREATE VIEW statement in SQL file');
    }

    const createStatement = sqlScript.substring(createStart, createEnd);
    console.log(`   Statement length: ${createStatement.length} chars`);
    console.log(`   Includes partnerships: ${createStatement.includes('partnerships')}`);
    console.log('');

    // Step 3: Execute CREATE
    console.log('Step 3: Creating VIEW...');
    await sql.unsafe(createStatement);
    console.log('   ✅ VIEW created\n');

    // Step 4: Verify
    console.log('Step 4: Verifying VIEW...');
    const counts = await sql`
      SELECT lead_source_type, COUNT(*) as count
      FROM unified_leads
      GROUP BY lead_source_type
      ORDER BY count DESC
    `;

    console.log('   Lead counts by source:');
    counts.forEach(row => {
      console.log(`      ${row.lead_source_type}: ${row.count}`);
    });

    const hasPartnership = counts.some(row => row.lead_source_type === 'PARTNERSHIP');
    console.log('');
    if (hasPartnership) {
      console.log('   🎉 SUCCESS: Partnerships now included in VIEW!');
    } else {
      console.log('   ⚠️  WARNING: Partnerships still missing from VIEW');
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error.stack);
  }
}

forceRecreate();
