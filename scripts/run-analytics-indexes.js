/**
 * Run Analytics Indexes Script
 *
 * Executes the add-analytics-indexes.sql file to create performance indexes
 * on analytics tables in the Neon PostgreSQL database
 *
 * Usage:
 *   node scripts/run-analytics-indexes.js
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - @neondatabase/serverless package must be installed
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runAnalyticsIndexes() {
  // Check environment variable
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is not set');
    console.error('\nPlease set it with:');
    console.error('  Windows (PowerShell): $env:DATABASE_URL="postgresql://..."');
    console.error('  Windows (CMD): set DATABASE_URL=postgresql://...');
    console.error('  Linux/Mac: export DATABASE_URL="postgresql://..."');
    process.exit(1);
  }

  console.log('🔧 Analytics Performance Optimization');
  console.log('=====================================\n');

  // Initialize Neon client
  const sql = neon(databaseUrl);

  console.log('📂 Reading SQL file...');
  const sqlFilePath = path.join(__dirname, 'add-analytics-indexes.sql');

  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ Error: SQL file not found at ${sqlFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Remove comments and split by semicolon
  const statements = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--') && !line.trim().startsWith('/**') && !line.trim().startsWith('*'))
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Extract index/table name for better logging
    const match = statement.match(/(?:INDEX|TABLE|ANALYZE)\s+(?:IF NOT EXISTS\s+)?([a-z_]+)/i);
    const objectName = match ? match[1] : `statement ${i + 1}`;

    try {
      console.log(`[${i + 1}/${statements.length}] Creating/Analyzing: ${objectName}...`);
      await sql(statement);
      successCount++;
      console.log(`  ✅ Success`);
    } catch (error) {
      failCount++;

      // Check if error is "already exists"
      if (error.message && error.message.includes('already exists')) {
        console.log(`  ⚠️  Already exists (skipping)`);
        successCount++;
        failCount--;
      } else {
        console.error(`  ❌ Error: ${error.message}`);
      }
    }

    console.log('');
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n=====================================');
  console.log('📈 Results:');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  ⏱️  Duration: ${duration}s`);
  console.log('=====================================\n');

  if (failCount > 0) {
    console.log('⚠️  Some operations failed. Review the errors above.');
    process.exit(1);
  } else {
    console.log('✅ All indexes created successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Run "VACUUM ANALYZE analytics_sessions" to optimize');
    console.log('   2. Test analytics dashboard performance');
    console.log('   3. Monitor query execution plans with EXPLAIN');
  }
}

// Run the script
runAnalyticsIndexes().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
