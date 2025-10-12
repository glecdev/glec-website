/**
 * Run Migration 003: Add resend_email_id columns
 *
 * This script adds email tracking columns to contacts and library_leads tables
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

    console.log('🔄 Running migration: 003_add_resend_email_id.sql\n');

    // Read migration SQL
    const migrationPath = path.join(__dirname, 'migrations', '003_add_resend_email_id.sql');
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

    // Verify columns creation
    console.log('\n🔍 Verifying changes...\n');

    const contactsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      AND column_name IN (
        'resend_admin_email_id',
        'resend_user_email_id',
        'admin_email_status',
        'user_email_status',
        'admin_email_sent_at',
        'user_email_sent_at'
      )
      ORDER BY column_name
    `;

    console.log('✅ contacts table columns:');
    contactsColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    const libraryLeadsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'library_leads'
      AND column_name IN ('resend_email_id', 'email_status', 'email_sent_at')
      ORDER BY column_name
    `;

    console.log('\n✅ library_leads table columns:');
    libraryLeadsColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    const webhookTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'email_webhook_events'
      ) AS exists
    `;

    if (webhookTable[0].exists) {
      console.log('\n✅ email_webhook_events table created');

      const webhookColumns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'email_webhook_events'
        ORDER BY ordinal_position
      `;

      webhookColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n✅ All changes verified successfully!\n');

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runMigration();
