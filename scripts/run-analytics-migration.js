const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Use DATABASE_URL (pooled connection works for DDL)
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable not set');
  console.error('Make sure .env.local exists in the project root');
  process.exit(1);
}

console.log('Using connection:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'));

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('Starting analytics and demo requests migration...');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-analytics-and-demo-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Smart SQL statement splitting (handles DO $$ blocks)
    const statements = [];
    let currentStatement = '';
    let inDollarBlock = false;

    for (const line of sqlContent.split('\n')) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (trimmed.startsWith('--') || trimmed === '') {
        continue;
      }

      currentStatement += line + '\n';

      // Track DO $$ ... END $$ blocks
      if (trimmed.includes('DO $$') || trimmed.includes('DO$')) {
        inDollarBlock = true;
      }
      if (trimmed.includes('END $$') || trimmed.includes('END$')) {
        inDollarBlock = false;
      }

      // Statement ends with semicolon (but not inside DO block)
      if (trimmed.endsWith(';') && !inDollarBlock) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, ' ').replace(/\s+/g, ' ');

      console.log(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        const result = await sql.unsafe(statement);
        console.log(`  ✅ Success`);
        successCount++;
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`  ⚠️  Already exists (skipping)`);
          skipCount++;
        } else {
          console.error(`  ❌ Error: ${error.message}`);
          errorCount++;
          // Don't throw - continue with other statements
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ⚠️  Skipped: ${skipCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nCreated tables:');
    console.log('  - analytics_sessions');
    console.log('  - analytics_page_views');
    console.log('  - analytics_events');
    console.log('  - analytics_conversions');
    console.log('  - demo_requests');

  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
