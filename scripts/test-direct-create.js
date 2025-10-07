/**
 * Test direct table creation
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function testDirectCreate() {
  const DATABASE_URL = process.env.DATABASE_URL;
  const sql = neon(DATABASE_URL);

  console.log('🧪 Testing direct table creation...\n');

  try {
    // Step 1: Create test table
    console.log('[1] Creating test table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS test_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_field VARCHAR(255)
      )
    `);
    console.log('  ✅ Test table created\n');

    // Step 2: Check if it exists
    console.log('[2] Checking if test table exists...');
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'test_audit_logs'
    `;

    if (result.length > 0) {
      console.log('  ✅ Test table EXISTS!\n');
    } else {
      console.log('  ❌ Test table does NOT exist!\n');
    }

    // Step 3: Create actual audit_logs table
    console.log('[3] Creating actual audit_logs table...');

    // First check if enum exists
    const enumCheck = await sql`
      SELECT 1 FROM pg_type WHERE typname = 'audit_action'
    `;

    if (enumCheck.length === 0) {
      console.log('  [3a] Creating audit_action ENUM...');
      await sql.unsafe(`
        CREATE TYPE audit_action AS ENUM ('LOGIN', 'CREATE', 'UPDATE', 'DELETE')
      `);
      console.log('  ✅ ENUM created\n');
    } else {
      console.log('  ⚠️  ENUM already exists\n');
    }

    // Then create table
    console.log('  [3b] Creating audit_logs table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS audit_logs (
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
    `);
    console.log('  ✅ Table created\n');

    // Step 4: Verify audit_logs exists
    console.log('[4] Verifying audit_logs table...');
    const auditCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'audit_logs'
    `;

    if (auditCheck.length > 0) {
      console.log('  ✅ audit_logs table EXISTS!\n');
    } else {
      console.log('  ❌ audit_logs table does NOT exist!\n');
    }

    // Step 5: List all tables
    console.log('[5] Listing all tables...');
    const allTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`  Found ${allTables.length} tables:\n`);
    allTables.forEach((table, i) => {
      const marker = table.table_name === 'audit_logs' ? ' ← FOUND!' : '';
      console.log(`    ${i + 1}. ${table.table_name}${marker}`);
    });

    console.log('\n✅ Test complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDirectCreate();
