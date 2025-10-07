#!/usr/bin/env node

/**
 * Verify Audit Logs Table
 *
 * Checks if audit_logs table exists and shows sample data
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function verifyAuditLogsTable() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  try {
    console.log('🔍 Verifying audit_logs table...\n');

    // Check if table exists
    const tableCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audit_logs'
    `;

    if (tableCheck.length === 0) {
      console.error('❌ audit_logs table does not exist!');
      process.exit(1);
    }

    console.log('✅ audit_logs table exists');

    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'audit_logs'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Table Structure:');
    console.log('-------------------');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Get indexes
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'audit_logs'
    `;

    console.log('\n🔑 Indexes:');
    console.log('----------');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });

    // Get row count
    const countResult = await sql`SELECT COUNT(*) as count FROM audit_logs`;
    const count = parseInt(countResult[0].count, 10);

    console.log(`\n📊 Total Rows: ${count}`);

    // Show sample data if exists
    if (count > 0) {
      const sampleData = await sql`
        SELECT
          al.id,
          al.action,
          al.resource,
          al.ip_address,
          al.created_at,
          u.email as user_email
        FROM audit_logs al
        JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 5
      `;

      console.log('\n📝 Sample Data (last 5 logs):');
      console.log('-----------------------------');
      sampleData.forEach(log => {
        console.log(`  [${new Date(log.created_at).toISOString()}] ${log.action} - ${log.resource} by ${log.user_email} from ${log.ip_address}`);
      });
    }

    console.log('\n✅ Audit logs table verification completed!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyAuditLogsTable();
