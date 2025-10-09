/**
 * Run Migration 005: Fix notices table ID default
 *
 * This script connects to Neon PostgreSQL and executes the migration
 * to add DEFAULT gen_random_uuid() to the 'id' column
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set it in .env.local file');
    process.exit(1);
  }

  console.log('🔌 Connecting to Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'migrations', '005_fix_notices_id_default.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📝 Executing migration 005_fix_notices_id_default.sql...');
  console.log('');

  try {
    // Execute migration
    const result = await sql(migrationSQL);

    console.log('✅ Migration executed successfully!');
    console.log('');
    console.log('📊 Result:');
    console.log(result);
    console.log('');

    // Verify the change
    console.log('🔍 Verifying notices table schema...');
    const schemaCheck = await sql`
      SELECT column_name, column_default, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'notices'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    console.log('');
    console.log('📋 Notices Table Schema:');
    console.table(schemaCheck);

    // Check if id column has default
    const idColumn = schemaCheck.find((col: any) => col.column_name === 'id');

    if (idColumn && idColumn.column_default) {
      console.log('');
      console.log('✅ SUCCESS: id column now has DEFAULT:', idColumn.column_default);
    } else {
      console.log('');
      console.log('⚠️  WARNING: id column DEFAULT might not be set correctly');
    }

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('');
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Fatal error:');
    console.error(error);
    process.exit(1);
  });
