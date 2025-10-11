/**
 * Verify Imported Press Articles
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

async function verifyImport() {
  console.log('🔍 Verifying imported press articles...\n');

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found');
  }

  const sql = neon(DATABASE_URL);

  try {
    // Get all press articles with real media outlets (not test data)
    const articles = await sql`
      SELECT title, media_outlet, external_url, published_at, status
      FROM presses
      WHERE media_outlet != 'TechCrunch'
      ORDER BY published_at DESC
    `;

    console.log(`✅ Found ${articles.length} real press articles\n`);

    // Display by media outlet
    const byOutlet = articles.reduce((acc, article) => {
      if (!acc[article.media_outlet]) {
        acc[article.media_outlet] = [];
      }
      acc[article.media_outlet].push(article);
      return acc;
    }, {});

    Object.entries(byOutlet).forEach(([outlet, articles]) => {
      console.log(`\n📰 ${outlet} (${articles.length} articles):`);
      articles.forEach((article, idx) => {
        const title = article.title.substring(0, 80);
        const date = article.published_at ? new Date(article.published_at).toISOString().split('T')[0] : 'N/A';
        console.log(`   ${idx + 1}. [${date}] ${title}${article.title.length > 80 ? '...' : ''}`);
      });
    });

    console.log('\n📊 Summary by Media Outlet:');
    Object.entries(byOutlet)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([outlet, articles]) => {
        console.log(`   ${outlet}: ${articles.length}`);
      });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

verifyImport()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
