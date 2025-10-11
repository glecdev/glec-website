/**
 * Migration Runner Script (using node-postgres)
 *
 * CTO Strategic Decision:
 * - Use node-postgres (pg) for DDL operations
 * - DIRECT_URL (non-pooled connection) for CREATE/ALTER/DROP
 * - Full transaction support (BEGIN/COMMIT/ROLLBACK)
 * - Idempotent operations (CREATE IF NOT EXISTS)
 *
 * Usage: npx tsx scripts/run-migration-pg.ts migrations/007_create_library_system.sql
 */

import { config } from 'dotenv';
import { Client } from 'pg';
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

  // 1. Validate DIRECT_URL (non-pooled connection required for DDL)
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    log('❌ ERROR: DIRECT_URL environment variable not set', 'red');
    log('   DDL operations require non-pooled connection', 'yellow');
    log('   Please check your .env.local file', 'yellow');
    process.exit(1);
  }

  log(`✅ Database URL: ${directUrl.substring(0, 50)}...`, 'green');

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

  // 3. Initialize PostgreSQL client
  const client = new Client({
    connectionString: directUrl,
  });

  log('📡 Connecting to Neon PostgreSQL (DIRECT URL)...', 'blue');

  try {
    await client.connect();
    log('✅ Connected successfully\n', 'green');

    // 4. Execute migration SQL
    log('⚙️  Executing migration SQL...', 'blue');

    await client.query(migrationSQL);

    // Parse and log created objects
    const tables = migrationSQL.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/gi) || [];
    const indexes = migrationSQL.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/gi) || [];
    const views = migrationSQL.match(/CREATE OR REPLACE VIEW (\w+)/gi) || [];
    const alters = migrationSQL.match(/ALTER TABLE (\w+)/gi) || [];
    const inserts = migrationSQL.match(/INSERT INTO (\w+)/gi) || [];

    tables.forEach(match => {
      const tableName = match.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1];
      log(`  ✓ Created table: ${tableName}`, 'green');
    });

    indexes.forEach(match => {
      const indexName = match.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i)?.[1];
      log(`  ✓ Created index: ${indexName}`, 'green');
    });

    alters.forEach(match => {
      const tableName = match.match(/ALTER TABLE (\w+)/i)?.[1];
      log(`  ✓ Altered table: ${tableName}`, 'green');
    });

    views.forEach(match => {
      const viewName = match.match(/CREATE OR REPLACE VIEW (\w+)/i)?.[1];
      log(`  ✓ Created view: ${viewName}`, 'green');
    });

    if (inserts.length > 0) {
      log(`  ✓ Inserted ${inserts.length} seed data row(s)`, 'green');
    }

    const executedCount = tables.length + indexes.length + views.length + alters.length + inserts.length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log('\n========================================', 'green');
    log('✅ Migration completed successfully!', 'green');
    log('========================================', 'green');
    log(`📊 Created/Modified: ${tables.length} tables, ${indexes.length} indexes, ${alters.length} alters, ${views.length} views`, 'cyan');
    log(`📊 Inserted: ${inserts.length} seed data row(s)`, 'cyan');
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
    if (error.detail) {
      log(`Detail: ${error.detail}`, 'yellow');
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

// Main execution
const migrationFile = process.argv[2];

if (!migrationFile) {
  log('❌ Usage: npx tsx scripts/run-migration-pg.ts <migration-file>', 'red');
  log('   Example: npx tsx scripts/run-migration-pg.ts migrations/007_create_library_system.sql', 'yellow');
  process.exit(1);
}

runMigration(migrationFile);
