/**
 * Migration 004: Create Audit Logs and Content Rankings tables
 * Run: node scripts/run-migration-004.js
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

  console.log('🔄 Starting migration 004...');

  const sql = neon(DATABASE_URL);

  // Read migration file
  const migrationPath = path.join(__dirname, '../migrations/004_create_audit_logs_and_content_rankings.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute migration using raw SQL (Neon's unsafe method)
    console.log('📝 Executing SQL statements...');

    // Use Neon's unsafe method for DDL statements
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration 004 completed successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - audit_logs');
    console.log('  - content_rankings');
    console.log('');
    console.log('Created enums:');
    console.log('  - audit_action (LOGIN, CREATE, UPDATE, DELETE)');
    console.log('  - period_type (DAILY, WEEKLY, MONTHLY, ALL_TIME)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

runMigration();
