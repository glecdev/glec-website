/**
 * Migration 004: Create Audit Logs and Content Rankings tables (MANUAL)
 * Run: node scripts/run-migration-004-manual.js
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('🔄 Starting migration 004 (MANUAL)...\n');

  const sql = neon(DATABASE_URL);

  const statements = [
    // 1. Create ENUM audit_action
    {
      name: 'Create ENUM audit_action',
      sql: `CREATE TYPE audit_action AS ENUM ('LOGIN', 'CREATE', 'UPDATE', 'DELETE')`
    },

    // 2. Create ENUM period_type
    {
      name: 'Create ENUM period_type',
      sql: `CREATE TYPE period_type AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME')`
    },

    // 3. Create audit_logs table
    {
      name: 'Create audit_logs table',
      sql: `
        CREATE TABLE audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          action audit_action NOT NULL,
          resource VARCHAR(255) NOT NULL,
          resource_id UUID,
          changes JSONB,
          ip_address VARCHAR(45) NOT NULL,
          user_agent TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `
    },

    // 4. Create indexes for audit_logs
    {
      name: 'Create index idx_audit_logs_user_created',
      sql: `CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC)`
    },
    {
      name: 'Create index idx_audit_logs_action',
      sql: `CREATE INDEX idx_audit_logs_action ON audit_logs(action)`
    },
    {
      name: 'Create index idx_audit_logs_resource',
      sql: `CREATE INDEX idx_audit_logs_resource ON audit_logs(resource)`
    },
    {
      name: 'Create index idx_audit_logs_created',
      sql: `CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC)`
    },

    // 5. Create content_rankings table
    {
      name: 'Create content_rankings table',
      sql: `
        CREATE TABLE content_rankings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content_type VARCHAR(50) NOT NULL,
          content_id UUID NOT NULL,
          content_title VARCHAR(500) NOT NULL,
          view_count INTEGER NOT NULL DEFAULT 0,
          click_count INTEGER NOT NULL DEFAULT 0,
          download_count INTEGER NOT NULL DEFAULT 0,
          period_type period_type NOT NULL,
          period_start TIMESTAMP NOT NULL,
          period_end TIMESTAMP NOT NULL,
          rank INTEGER NOT NULL,
          previous_rank INTEGER,
          rank_change INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `
    },

    // 6. Create unique index for content_rankings
    {
      name: 'Create unique index idx_content_rankings_unique',
      sql: `CREATE UNIQUE INDEX idx_content_rankings_unique ON content_rankings(content_type, content_id, period_type, period_start)`
    },
    {
      name: 'Create index idx_content_rankings_period',
      sql: `CREATE INDEX idx_content_rankings_period ON content_rankings(period_type, period_start DESC)`
    },
    {
      name: 'Create index idx_content_rankings_rank',
      sql: `CREATE INDEX idx_content_rankings_rank ON content_rankings(rank)`
    }
  ];

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`[${i + 1}/${statements.length}] ${stmt.name}...`);

    try {
      await sql.unsafe(stmt.sql);
      console.log(`  ✅ Success\n`);
      successCount++;
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log(`  ⚠️  Skipped (already exists)\n`);
        skipCount++;
      } else {
        console.error(`  ❌ Failed: ${error.message}\n`);
        errorCount++;
        // Continue with next statement instead of exiting
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Migration 004 completed!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Created:');
  console.log('  Tables:');
  console.log('    - audit_logs');
  console.log('    - content_rankings');
  console.log('  Enums:');
  console.log('    - audit_action (LOGIN, CREATE, UPDATE, DELETE)');
  console.log('    - period_type (DAILY, WEEKLY, MONTHLY, ALL_TIME)');
  console.log('  Indexes:');
  console.log('    - 7 indexes for audit_logs and content_rankings\n');
}

runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
