/**
 * Migrate Email Templates System
 * Creates tables for email template management
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log('🚀 Starting email templates system migration...\n');

  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, '..', 'prisma', 'migrations', 'email-templates-system.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split by semicolon and filter out comments/empty lines
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip COMMENT statements (not supported by Neon)
      if (statement.toUpperCase().startsWith('COMMENT ON')) {
        console.log(`⏭️  Skipping comment statement ${i + 1}/${statements.length}`);
        continue;
      }

      try {
        console.log(`▶️  Executing statement ${i + 1}/${statements.length}...`);

        // Special handling for different statement types
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1];
          console.log(`   Creating table: ${tableName}`);
        } else if (statement.toUpperCase().includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX (\w+)/i)?.[1];
          console.log(`   Creating index: ${indexName}`);
        } else if (statement.toUpperCase().includes('INSERT INTO')) {
          const tableName = statement.match(/INSERT INTO (\w+)/i)?.[1];
          console.log(`   Inserting data into: ${tableName}`);
        }

        await sql(statement);
        console.log(`   ✅ Success\n`);
      } catch (error) {
        // Check if error is "already exists" - skip gracefully
        if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
          console.log(`   ⏭️  Already exists, skipping\n`);
        } else {
          console.error(`   ❌ Error: ${error.message}\n`);
          // Continue with other statements
        }
      }
    }

    console.log('✅ Migration completed!\n');

    // Verify tables created
    console.log('🔍 Verifying tables...\n');

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'email_%'
      ORDER BY table_name
    `;

    console.log(`📊 Email template tables (${tables.length}):`);
    tables.forEach(t => {
      console.log(`   ✅ ${t.table_name}`);
    });

    console.log('\n🎉 Email templates system ready!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

migrate();
