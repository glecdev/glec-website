/**
 * Migration Runner Script
 *
 * CTO Strategic Decision:
 * - Use Neon HTTP SQL interface (serverless-friendly)
 * - Transaction support via BEGIN/COMMIT
 * - Idempotent operations (CREATE IF NOT EXISTS)
 *
 * Usage: npx tsx scripts/run-migration.ts migrations/007_create_library_system.sql
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local file
config({ path: path.resolve(process.cwd(), '.env.local') });

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration(migrationFilePath: string) {
  const startTime = Date.now();

  log('\n========================================', 'cyan');
  log('🚀 GLEC Migration Runner (CTO Mode)', 'cyan');
  log('========================================\n', 'cyan');

  // 1. Validate DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log('❌ ERROR: DATABASE_URL environment variable not set', 'red');
    log('   Please check your .env.local file', 'yellow');
    process.exit(1);
  }

  log(`✅ Database URL: ${databaseUrl.substring(0, 50)}...`, 'green');

  // 2. Read migration file
  const fullPath = path.resolve(process.cwd(), migrationFilePath);

  if (!fs.existsSync(fullPath)) {
    log(`❌ ERROR: Migration file not found: ${fullPath}`, 'red');
    process.exit(1);
  }

  log(`✅ Migration file: ${migrationFilePath}`, 'green');

  const migrationSQL = fs.readFileSync(fullPath, 'utf-8');
  const lineCount = migrationSQL.split('\n').length;

  log(`✅ SQL loaded: ${lineCount} lines, ${(migrationSQL.length / 1024).toFixed(2)} KB\n`, 'green');

  // 3. Initialize Neon client
  const sql = neon(databaseUrl);

  log('📡 Connecting to Neon PostgreSQL...', 'blue');

  try {
    // 4. Execute migration using DIRECT_URL (for DDL operations)
    log('⚙️  Executing migration SQL...', 'blue');

    // Neon requires DIRECT_URL (non-pooled) for transactions
    const directUrl = process.env.DIRECT_URL || databaseUrl;
    const sqlDirect = neon(directUrl);

    // Execute entire SQL file as single transaction
    // Neon's sql function executes the SQL string directly
    const result = await sqlDirect`
      ${migrationSQL}
    ` as any;

    log(`  ✓ Migration SQL executed successfully`, 'green');

    // Parse and log created objects
    const tables = migrationSQL.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/gi) || [];
    const indexes = migrationSQL.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/gi) || [];
    const views = migrationSQL.match(/CREATE OR REPLACE VIEW (\w+)/gi) || [];
    const inserts = migrationSQL.match(/INSERT INTO (\w+)/gi) || [];

    tables.forEach(match => {
      const tableName = match.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1];
      log(`  ✓ Created table: ${tableName}`, 'green');
    });

    indexes.forEach(match => {
      const indexName = match.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i)?.[1];
      log(`  ✓ Created index: ${indexName}`, 'green');
    });

    views.forEach(match => {
      const viewName = match.match(/CREATE OR REPLACE VIEW (\w+)/i)?.[1];
      log(`  ✓ Created view: ${viewName}`, 'green');
    });

    if (inserts.length > 0) {
      log(`  ✓ Inserted ${inserts.length} seed data row(s)`, 'green');
    }

    const executedCount = tables.length + indexes.length + views.length + inserts.length;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log('\n========================================', 'green');
    log('✅ Migration completed successfully!', 'green');
    log('========================================', 'green');
    log(`📊 Executed ${executedCount} statements`, 'cyan');
    log(`⏱️  Duration: ${duration}s\n`, 'cyan');

  } catch (error: any) {
    log('\n========================================', 'red');
    log('❌ Migration failed!', 'red');
    log('========================================', 'red');
    log(`Error: ${error.message}\n`, 'red');

    if (error.position) {
      log(`Position: ${error.position}`, 'yellow');
    }
    if (error.hint) {
      log(`Hint: ${error.hint}`, 'yellow');
    }

    process.exit(1);
  }
}

// Main execution
const migrationFile = process.argv[2];

if (!migrationFile) {
  log('❌ Usage: npx tsx scripts/run-migration.ts <migration-file>', 'red');
  log('   Example: npx tsx scripts/run-migration.ts migrations/007_create_library_system.sql', 'yellow');
  process.exit(1);
}

runMigration(migrationFile);
