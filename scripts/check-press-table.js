/**
 * Check Press Table Structure
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      value = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;

async function checkTable() {
  console.log('🔍 Checking press table structure...\n');

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found');
  }

  const sql = neon(DATABASE_URL);

  try {
    // Check if presses table exists
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'presses'
    `;

    if (tables.length === 0) {
      console.log('❌ Presses table does not exist');
      console.log('ℹ️  Need to create presses table first\n');
      return;
    }

    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'presses'
      ORDER BY ordinal_position
    `;

    console.log('✅ Presses table exists\n');
    console.log('📋 Columns:');
    columns.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`   - ${col.column_name}: ${col.data_type}${length} ${nullable}`);
    });

    // Count existing records
    const countResult = await sql`SELECT COUNT(*) as total FROM presses`;
    const total = parseInt(countResult[0].total, 10);
    console.log(`\n📊 Total records: ${total}`);

    if (total > 0) {
      // Show sample data
      const samples = await sql`SELECT * FROM presses ORDER BY published_at DESC LIMIT 3`;
      console.log('\n🔖 Sample data:');
      samples.forEach((row, idx) => {
        console.log(`\n   ${idx + 1}. ${row.title}`);
        console.log(`      Media Outlet: ${row.media_outlet || 'N/A'}`);
        console.log(`      Published: ${row.published_at}`);
        console.log(`      URL: ${row.external_url || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

checkTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
