/**
 * Migration 004: Create Audit Logs and Content Rankings tables (FIXED)
 * Run: node scripts/run-migration-004-fixed.js
 */

require('dotenv').config(); // Load .env file

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🔄 Starting migration 004 (FIXED)...');

  const sql = neon(DATABASE_URL);

  // Read migration file
  const migrationPath = path.join(__dirname, '../migrations/004_create_audit_logs_and_content_rankings.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log('📝 Executing SQL statements...');

    // Split SQL into individual statements and execute each one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.match(/^-{2,}/));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
      console.log(`  [${i + 1}/${statements.length}] ${preview}...`);

      try {
        await sql.unsafe(stmt);
        console.log(`  ✅ Success`);
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message && error.message.includes('already exists')) {
          console.log(`  ⚠️  Skipped (already exists)`);
          continue;
        }
        console.error(`  ❌ Failed: ${error.message}`);
        throw error;
      }
    }

    console.log('\n✅ Migration 004 completed successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - audit_logs');
    console.log('  - content_rankings');
    console.log('');
    console.log('Created enums:');
    console.log('  - audit_action (LOGIN, CREATE, UPDATE, DELETE)');
    console.log('  - period_type (DAILY, WEEKLY, MONTHLY, ALL_TIME)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

runMigration();
