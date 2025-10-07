/**
 * Run Migration 003: Create Popups Table
 *
 * This script creates the popups table in Neon PostgreSQL
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    // Read DATABASE_URL from .env.local
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in .env.local');
    }

    // Connect to database
    const sql = neon(databaseUrl);

    console.log('🔄 Running migration: 003_create_popups_table.sql\n');

    // Read migration SQL
    const migrationPath = path.join(__dirname, '..', 'migrations', '003_create_popups_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Remove comments and split by semicolons, handling DO $$ blocks
    let cleanSQL = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split by semicolons but keep DO $$ blocks together
    const statements = [];
    let currentStatement = '';
    let inDollarBlock = false;

    for (const line of cleanSQL.split('\n')) {
      currentStatement += line + '\n';

      if (line.includes('DO $$')) {
        inDollarBlock = true;
      }

      if (line.includes('END $$;')) {
        inDollarBlock = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
      } else if (!inDollarBlock && line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    // Add remaining statement if any
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    // Execute each statement
    for (const statement of statements.filter(s => s.length > 0)) {
      if (statement.toUpperCase().includes('COMMENT ON')) {
        console.log('⏭️  Skipping COMMENT statement');
        continue;
      }

      console.log(`📝 Executing: ${statement.substring(0, 60)}...`);
      try {
        await sql.query(statement);
        console.log('✅ Success\n');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⏭️  Already exists, skipping\n');
        } else {
          console.error('❌ Error:', error.message);
          throw error;
        }
      }
    }

    console.log('🎉 Migration completed successfully!');

    // Verify table creation
    const result = await sql`
      SELECT tablename FROM pg_tables WHERE tablename = 'popups'
    `;

    if (result.length > 0) {
      console.log('\n✅ Popups table verified');

      // Check if sample data exists
      const countResult = await sql`SELECT COUNT(*) as count FROM popups`;
      console.log(`📊 Popups count: ${countResult[0].count}`);
    } else {
      console.error('\n❌ Popups table not found!');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();
