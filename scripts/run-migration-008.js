/**
 * Run Migration 008: Add Zoom Webinar Support
 *
 * Usage:
 *   node scripts/run-migration-008.js
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🚀 Starting Migration 008: Add Zoom Webinar Support\n');

    // Read migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', '008_add_webinar_support.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Remove comments and split by semicolon
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('/*') && !line.trim().startsWith('*'))
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.includes('COMMENT ON') || stmt.includes('CREATE INDEX') || stmt.includes('ALTER TABLE') || stmt.includes('UPDATE')) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        try {
          await sql.unsafe(stmt);
          console.log(`✅ Statement ${i + 1} executed successfully\n`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)\n`);
          } else {
            throw error;
          }
        }
      }
    }

    // Verify migration
    console.log('📊 Verifying migration...\n');

    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'events'
      AND column_name IN ('meeting_type', 'zoom_webinar_id', 'zoom_webinar_join_url', 'zoom_webinar_host_url')
      ORDER BY column_name
    `;

    console.log('✅ New columns added:');
    result.forEach((col) => {
      console.log(`   - ${col.column_name} (${col.data_type}) - Default: ${col.column_default || 'NULL'}`);
    });

    // Count events by meeting_type
    const countResult = await sql`
      SELECT meeting_type, COUNT(*) as count
      FROM events
      WHERE deleted_at IS NULL
      GROUP BY meeting_type
    `;

    console.log('\n📊 Events by meeting_type:');
    if (countResult.length === 0) {
      console.log('   (No events found)');
    } else {
      countResult.forEach((row) => {
        console.log(`   - ${row.meeting_type}: ${row.count}`);
      });
    }

    console.log('\n🎉 Migration 008 completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
