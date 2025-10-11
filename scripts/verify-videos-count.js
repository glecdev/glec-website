/**
 * Verify knowledge_videos table data
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

async function verify() {
  console.log('🔍 Verifying knowledge_videos data...\n');

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found');
  }

  const sql = neon(DATABASE_URL);

  try {
    // Total count
    const totalResult = await sql`SELECT COUNT(*) as total FROM knowledge_videos`;
    const total = parseInt(totalResult[0].total, 10);
    console.log(`📊 Total videos: ${total}`);

    // Count by category
    const categoryResult = await sql`
      SELECT category, COUNT(*) as count
      FROM knowledge_videos
      GROUP BY category
      ORDER BY count DESC
    `;
    console.log('\n📂 By Category:');
    categoryResult.forEach(row => {
      console.log(`   ${row.category}: ${row.count}`);
    });

    // Recent 5 videos
    const recentResult = await sql`
      SELECT title, category, duration, view_count, published_at
      FROM knowledge_videos
      ORDER BY created_at DESC
      LIMIT 5
    `;
    console.log('\n🆕 Recent 5 videos:');
    recentResult.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.title.substring(0, 60)}...`);
      console.log(`      Category: ${row.category} | Duration: ${row.duration} | Views: ${row.view_count}`);
    });

    // Top 5 by views
    const topResult = await sql`
      SELECT title, view_count
      FROM knowledge_videos
      ORDER BY view_count DESC
      LIMIT 5
    `;
    console.log('\n🔥 Top 5 by views:');
    topResult.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.title.substring(0, 60)}... (${row.view_count} views)`);
    });

    console.log('\n✅ Verification completed!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
