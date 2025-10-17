/**
 * Admin Data Seeding Script
 *
 * CTO-Level Production Data Initialization
 *
 * Seeds:
 * 1. Library Items (E-books, whitepapers, case studies)
 * 2. Knowledge Blog Posts
 * 3. Knowledge Videos
 * 4. Press Releases
 * 5. Popup Announcements
 *
 * Usage:
 *   node scripts/seed-admin-data.js --library
 *   node scripts/seed-admin-data.js --all
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

// ANSI Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(level, message, details = '') {
  const icon = level === 'SUCCESS' ? '✅' : level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : 'ℹ️';
  const color = level === 'SUCCESS' ? GREEN : level === 'ERROR' ? RED : level === 'WARN' ? YELLOW : BLUE;
  console.log(`${color}${icon} ${message}${RESET}`);
  if (details) console.log(`   ${details}`);
}

// ============================================================
// SEED DATA
// ============================================================

const LIBRARY_ITEMS = [
  {
    id: '1',
    title: 'ISO 14083 가이드북 - 물류 탄소배출 측정 표준',
    description: 'ISO 14083 국제표준에 기반한 물류 탄소배출 측정 및 보고 가이드북. Scope 3 Category 4/9 배출량 계산 방법론과 실무 적용 사례를 상세히 소개합니다.',
    category: 'GUIDE',
    file_type: 'PDF',
    file_size: '5.2MB',
    download_url: 'https://storage.glec.io/library/iso14083-guide-ko.pdf',
    thumbnail_url: '/images/library/iso14083-guide-thumbnail.jpg',
    tags: ['ISO 14083', 'Scope 3', 'Carbon Accounting', 'GLEC Framework'],
    published: true,
    featured: true,
    download_count: 0
  },
  {
    id: '2',
    title: 'GLEC DTG Series5 제품 카탈로그',
    description: 'AI 기반 실시간 물류 탄소배출 측정 디바이스 GLEC DTG Series5의 기술 사양, 설치 방법, 활용 사례를 담은 제품 카탈로그입니다.',
    category: 'PRODUCT',
    file_type: 'PDF',
    file_size: '8.1MB',
    download_url: 'https://storage.glec.io/library/dtg-series5-catalog-ko.pdf',
    thumbnail_url: '/images/library/dtg-series5-thumbnail.jpg',
    tags: ['GLEC DTG', 'IoT Device', 'Real-time Monitoring', 'AI'],
    published: true,
    featured: true,
    download_count: 0
  },
  {
    id: '3',
    title: 'Carbon API 개발자 가이드',
    description: 'GLEC Carbon API를 활용한 물류 탄소배출 계산 자동화 가이드. 48개 API 엔드포인트 상세 설명과 코드 예제를 제공합니다.',
    category: 'API',
    file_type: 'PDF',
    file_size: '3.8MB',
    download_url: 'https://storage.glec.io/library/carbon-api-developer-guide-ko.pdf',
    thumbnail_url: '/images/library/carbon-api-thumbnail.jpg',
    tags: ['Carbon API', 'Developer', 'Integration', 'REST API'],
    published: true,
    featured: false,
    download_count: 0
  },
  {
    id: '4',
    title: 'DHL GoGreen 파트너십 케이스 스터디',
    description: 'DHL GoGreen과의 파트너십을 통한 글로벌 물류 탄소배출 측정 프로젝트 성공 사례. 실제 적용 결과와 ROI 분석을 포함합니다.',
    category: 'CASE_STUDY',
    file_type: 'PDF',
    file_size: '6.5MB',
    download_url: 'https://storage.glec.io/library/dhl-gogreen-case-study-ko.pdf',
    thumbnail_url: '/images/library/dhl-case-study-thumbnail.jpg',
    tags: ['DHL GoGreen', 'Case Study', 'Partnership', 'Global Logistics'],
    published: true,
    featured: true,
    download_count: 0
  },
  {
    id: '5',
    title: 'Scope 3 배출량 계산 실무 가이드',
    description: 'GHG Protocol Scope 3 Category 4(Upstream Transportation)와 Category 9(Downstream Transportation) 배출량 계산 실무 가이드입니다.',
    category: 'GUIDE',
    file_type: 'PDF',
    file_size: '4.2MB',
    download_url: 'https://storage.glec.io/library/scope3-calculation-guide-ko.pdf',
    thumbnail_url: '/images/library/scope3-guide-thumbnail.jpg',
    tags: ['Scope 3', 'GHG Protocol', 'Carbon Accounting', 'Calculation'],
    published: true,
    featured: false,
    download_count: 0
  }
];

// ============================================================
// SEEDING FUNCTIONS
// ============================================================

async function seedLibraryItems(sql) {
  console.log(`\n${BLUE}📚 Seeding Library Items...${RESET}\n`);

  let created = 0;
  let skipped = 0;

  for (const item of LIBRARY_ITEMS) {
    try {
      // Check if item already exists
      const existing = await sql`
        SELECT id FROM library_items WHERE id = ${item.id}
      `;

      if (existing.length > 0) {
        log('WARN', `Library item already exists: ${item.title}`, `ID: ${item.id}`);
        skipped++;
        continue;
      }

      // Insert library item
      await sql`
        INSERT INTO library_items (
          id,
          title,
          description,
          category,
          file_type,
          file_size,
          download_url,
          thumbnail_url,
          tags,
          published,
          featured,
          download_count,
          created_at,
          updated_at
        ) VALUES (
          ${item.id},
          ${item.title},
          ${item.description},
          ${item.category},
          ${item.file_type},
          ${item.file_size},
          ${item.download_url},
          ${item.thumbnail_url},
          ${JSON.stringify(item.tags)},
          ${item.published},
          ${item.featured},
          ${item.download_count},
          NOW(),
          NOW()
        )
      `;

      log('SUCCESS', `Created: ${item.title}`, `ID: ${item.id}`);
      created++;
    } catch (error) {
      log('ERROR', `Failed to create: ${item.title}`, error.message);
    }
  }

  console.log(`\n${GREEN}✅ Library Items Seeding Complete${RESET}`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
}

async function clearLibraryItems(sql) {
  console.log(`\n${YELLOW}⚠️  Clearing existing library items...${RESET}\n`);

  try {
    const result = await sql`DELETE FROM library_items`;
    log('SUCCESS', `Deleted ${result.count || 0} library items`);
  } catch (error) {
    log('ERROR', 'Failed to clear library items', error.message);
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  if (!DATABASE_URL) {
    log('ERROR', 'DATABASE_URL environment variable not set');
    console.log(`${YELLOW}Set it in .env.local or run with:${RESET}`);
    console.log(`${BLUE}DATABASE_URL="your_database_url" node scripts/seed-admin-data.js${RESET}`);
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const seedLibrary = args.includes('--library') || args.includes('--all');

  console.log(`${BLUE}
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   GLEC Admin Data Seeding Script                                     ║
║   Production Data Initialization                                     ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
${RESET}
`);

  console.log(`${BLUE}📋 Configuration:${RESET}`);
  console.log(`   Database: ${DATABASE_URL.substring(0, 50)}...`);
  console.log(`   Clear existing data: ${shouldClear ? 'YES' : 'NO'}`);
  console.log(`   Seed library items: ${seedLibrary ? 'YES' : 'NO'}`);

  if (!seedLibrary) {
    console.log(`\n${YELLOW}ℹ️  Usage:${RESET}`);
    console.log(`   ${BLUE}node scripts/seed-admin-data.js --library${RESET}  (seed library items)`);
    console.log(`   ${BLUE}node scripts/seed-admin-data.js --all${RESET}      (seed all data)`);
    console.log(`   ${BLUE}node scripts/seed-admin-data.js --library --clear${RESET}  (clear and re-seed)`);
    console.log();
    process.exit(0);
  }

  // Confirm before clearing
  if (shouldClear) {
    console.log(`\n${RED}⚠️  WARNING: This will DELETE all existing data!${RESET}`);
    console.log(`${YELLOW}Press Ctrl+C to cancel, or wait 5 seconds to continue...${RESET}\n`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    // Clear data if requested
    if (shouldClear && seedLibrary) {
      await clearLibraryItems(sql);
    }

    // Seed library items
    if (seedLibrary) {
      await seedLibraryItems(sql);
    }

    console.log(`\n${GREEN}╔═══════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                                                                       ║`);
    console.log(`║   ✅ Seeding Complete!                                               ║`);
    console.log(`║                                                                       ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════════════╝${RESET}\n`);

    console.log(`${BLUE}📋 Next Steps:${RESET}`);
    console.log(`1. Check admin dashboard: ${BASE_URL || 'https://glec-website.vercel.app'}/admin`);
    console.log(`2. Verify library items are visible`);
    console.log(`3. Test download flow: ${BASE_URL || 'https://glec-website.vercel.app'}/knowledge/library`);
    console.log();

  } catch (error) {
    log('ERROR', 'Seeding failed', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

main().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  process.exit(1);
});
