/**
 * Schema Verification Script
 *
 * Verifies that database schema matches expected structure
 */

import { config } from 'dotenv';
import { Client } from 'pg';
import * as path from 'path';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verifySchema() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  log('\n📊 GLEC Database Schema Verification\n', 'cyan');

  try {
    await client.connect();

    // 1. Check tables
    log('1️⃣ Tables:', 'cyan');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name IN ('library_items', 'library_leads')
      ORDER BY table_name
    `);

    tablesResult.rows.forEach(row => {
      log(`  ✓ ${row.table_name}`, 'green');
    });

    // 2. Check views
    log('\n2️⃣ Views:', 'cyan');
    const viewsResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'VIEW'
      AND table_name = 'unified_leads'
    `);

    viewsResult.rows.forEach(row => {
      log(`  ✓ ${row.table_name}`, 'green');
    });

    // 3. Check library_items columns
    log('\n3️⃣ library_items columns:', 'cyan');
    const itemsColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'library_items'
      ORDER BY ordinal_position
    `);

    itemsColumnsResult.rows.forEach(row => {
      log(`  ✓ ${row.column_name} (${row.data_type}, ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'})`, 'green');
    });

    // 4. Check library_leads columns
    log('\n4️⃣ library_leads columns:', 'cyan');
    const leadsColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'library_leads'
      ORDER BY ordinal_position
    `);

    leadsColumnsResult.rows.forEach(row => {
      log(`  ✓ ${row.column_name} (${row.data_type}, ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'})`, 'green');
    });

    // 5. Check seed data
    log('\n5️⃣ Seed data:', 'cyan');
    const seedDataResult = await client.query(`
      SELECT id, title, slug, status, category, language, version
      FROM library_items
      LIMIT 10
    `);

    if (seedDataResult.rows.length > 0) {
      seedDataResult.rows.forEach(row => {
        log(`  ✓ ${row.title} (${row.slug}, status: ${row.status}, category: ${row.category})`, 'green');
      });
    } else {
      log('  ⚠️  No seed data found', 'yellow');
    }

    // 6. Check indexes
    log('\n6️⃣ Indexes:', 'cyan');
    const indexesResult = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND (tablename = 'library_items' OR tablename = 'library_leads')
      ORDER BY tablename, indexname
    `);

    indexesResult.rows.forEach(row => {
      log(`  ✓ ${row.indexname} on ${row.tablename}`, 'green');
    });

    log('\n✅ Schema verification complete!\n', 'green');

  } catch (error: any) {
    log(`\n❌ Verification failed: ${error.message}\n`, 'yellow');
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema();
