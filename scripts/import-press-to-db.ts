/**
 * Import Press Articles to Database
 *
 * Purpose: Bulk import scraped press articles to presses table
 * Filters: Exclude Google navigation links and irrelevant articles
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(__dirname, '..', '.env.local');
if (require('fs').existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      value = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL not found in environment');
}

const sql = neon(DATABASE_URL);

interface PressArticle {
  title: string;
  mediaOutlet: string;
  externalUrl: string;
  publishedAt: string;
  excerpt?: string;
}

/**
 * Check if article is relevant to GLEC Inc
 */
function isRelevantArticle(article: PressArticle): boolean {
  // Exclude Google navigation links
  const excludedTitles = [
    'AI 모드', '도서', '금융', '웹 검색', '한국어 웹',
    '지난 1시간', '지난 1일', '지난 1주', '지난 1개월', '지난 1년',
    '자료실'
  ];

  if (excludedTitles.includes(article.title)) return false;

  // Exclude google.com as media outlet
  if (article.mediaOutlet === 'google.com') return false;

  // Exclude whisky/beverage articles
  const whiskyKeywords = ['글렌피딕', '우드포드', '글렉드로낙', '위스키', 'whisky'];
  if (whiskyKeywords.some(keyword => article.title.includes(keyword))) return false;

  // Exclude language school articles
  if (article.title.includes('GLEC어학원') || article.title.includes('올림피아드교육')) return false;

  // Must mention GLEC or 오일렉스 or 글렉
  const relevantKeywords = ['GLEC', 'glec', '오일렉스', '글렉', 'ATG', 'AI Tachograph'];
  if (!relevantKeywords.some(keyword => article.title.includes(keyword) || article.excerpt?.includes(keyword))) {
    return false;
  }

  return true;
}

/**
 * Generate slug from title
 */
function generateSlug(title: string, index: number): string {
  const cleanTitle = title
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50);

  return `${cleanTitle}-${index}`;
}

/**
 * Generate excerpt from title if not exists
 */
function generateExcerpt(title: string, originalExcerpt?: string): string {
  if (originalExcerpt && originalExcerpt !== title) {
    // Use first 200 characters of original excerpt
    return originalExcerpt.substring(0, 200);
  }

  // Generate from title
  return `${title}에 대한 언론 보도입니다. GLEC의 물류 탄소배출 측정 및 관리 솔루션에 대해 자세히 알아보세요.`;
}

/**
 * Import press articles to database
 */
async function importPressArticles() {
  console.log('🚀 Starting press article import...\n');

  // Load scraped data
  const dataPath = join(__dirname, '..', 'data', 'press-articles.json');
  const articles: PressArticle[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

  console.log(`📊 Total scraped articles: ${articles.length}`);

  // Filter relevant articles
  const relevantArticles = articles.filter(isRelevantArticle);
  console.log(`✅ Relevant articles: ${relevantArticles.length}\n`);

  // Get SUPER_ADMIN user ID
  const adminUsers = await sql`
    SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1
  `;

  if (adminUsers.length === 0) {
    throw new Error('No SUPER_ADMIN user found. Cannot proceed with import.');
  }

  const authorId = adminUsers[0].id;
  console.log(`📝 Using author ID: ${authorId}\n`);

  let importedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < relevantArticles.length; i++) {
    const article = relevantArticles[i];

    try {
      // Check if article already exists
      const existing = await sql`
        SELECT id FROM presses WHERE external_url = ${article.externalUrl}
      `;

      if (existing.length > 0) {
        console.log(`⏭️  Skipped (exists): ${article.title.substring(0, 50)}...`);
        skippedCount++;
        continue;
      }

      // Generate data
      const slug = generateSlug(article.title, i);
      const excerpt = generateExcerpt(article.title, article.excerpt);
      const content = excerpt; // Use excerpt as content for now

      // Insert
      await sql`
        INSERT INTO presses (
          id,
          title,
          slug,
          content,
          excerpt,
          status,
          media_outlet,
          external_url,
          view_count,
          published_at,
          author_id,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${article.title.substring(0, 200)},
          ${slug},
          ${content},
          ${excerpt},
          'PUBLISHED',
          ${article.mediaOutlet},
          ${article.externalUrl},
          0,
          ${article.publishedAt},
          ${authorId},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `;

      importedCount++;
      console.log(`✅ Imported: ${article.mediaOutlet} - ${article.title.substring(0, 50)}...`);

    } catch (error) {
      errorCount++;
      console.error(`❌ Error importing "${article.title.substring(0, 30)}...":`, error);
    }
  }

  console.log('\n📈 Import Summary:');
  console.log(`   Imported: ${importedCount}`);
  console.log(`   Skipped (existing): ${skippedCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${importedCount + skippedCount + errorCount}\n`);
}

// Run import
importPressArticles()
  .then(() => {
    console.log('✅ Import completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
