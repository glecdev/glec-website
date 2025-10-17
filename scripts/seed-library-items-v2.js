/**
 * Library Items Seeding Script v2
 *
 * CTO-Level Production Data Initialization
 * Updated to match actual database schema
 *
 * Usage:
 *   DATABASE_URL="..." node scripts/seed-library-items-v2.js
 *   DATABASE_URL="..." node scripts/seed-library-items-v2.js --clear
 */

const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

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
// SEED DATA (matches actual schema)
// ============================================================

// Valid enum values:
// - category: FRAMEWORK, WHITEPAPER, CASE_STUDY, DATASHEET, OTHER
// - download_type: EMAIL, DIRECT, GOOGLE_DRIVE
// - status: DRAFT, PUBLISHED, ARCHIVED

const LIBRARY_ITEMS = [
  {
    title: 'ISO 14083 가이드북 - 물류 탄소배출 측정 표준',
    slug: 'iso-14083-guide-ko',
    description: 'ISO 14083 국제표준에 기반한 물류 탄소배출 측정 및 보고 가이드북. Scope 3 Category 4/9 배출량 계산 방법론과 실무 적용 사례를 상세히 소개합니다.',
    category: 'FRAMEWORK',
    file_type: 'PDF',
    file_size_mb: 5.2,
    file_url: 'https://storage.glec.io/library/iso14083-guide-ko.pdf',
    download_type: 'EMAIL',
    tags: ['ISO 14083', 'Scope 3', 'Carbon Accounting', 'GLEC Framework'],
    language: 'ko',
    version: '1.0',
    requires_form: true,
    status: 'PUBLISHED'
  },
  {
    title: 'GLEC DTG Series5 제품 카탈로그',
    slug: 'dtg-series5-catalog-ko',
    description: 'AI 기반 실시간 물류 탄소배출 측정 디바이스 GLEC DTG Series5의 기술 사양, 설치 방법, 활용 사례를 담은 제품 카탈로그입니다.',
    category: 'DATASHEET',
    file_type: 'PDF',
    file_size_mb: 8.1,
    file_url: 'https://storage.glec.io/library/dtg-series5-catalog-ko.pdf',
    download_type: 'DIRECT',
    tags: ['GLEC DTG', 'IoT Device', 'Real-time Monitoring', 'AI'],
    language: 'ko',
    version: '5.0',
    requires_form: false,
    status: 'PUBLISHED'
  },
  {
    title: 'Carbon API 개발자 가이드',
    slug: 'carbon-api-developer-guide-ko',
    description: 'GLEC Carbon API를 활용한 물류 탄소배출 계산 자동화 가이드. 48개 API 엔드포인트 상세 설명과 코드 예제를 제공합니다.',
    category: 'WHITEPAPER',
    file_type: 'PDF',
    file_size_mb: 3.8,
    file_url: 'https://storage.glec.io/library/carbon-api-developer-guide-ko.pdf',
    download_type: 'EMAIL',
    tags: ['Carbon API', 'Developer', 'Integration', 'REST API'],
    language: 'ko',
    version: '2.0',
    requires_form: true,
    status: 'PUBLISHED'
  },
  {
    title: 'DHL GoGreen 파트너십 케이스 스터디',
    slug: 'dhl-gogreen-case-study-ko',
    description: 'DHL GoGreen과의 파트너십을 통한 글로벌 물류 탄소배출 측정 프로젝트 성공 사례. 실제 적용 결과와 ROI 분석을 포함합니다.',
    category: 'CASE_STUDY',
    file_type: 'PDF',
    file_size_mb: 6.5,
    file_url: 'https://storage.glec.io/library/dhl-gogreen-case-study-ko.pdf',
    download_type: 'EMAIL',
    tags: ['DHL GoGreen', 'Case Study', 'Partnership', 'Global Logistics'],
    language: 'ko',
    version: '1.0',
    requires_form: true,
    status: 'PUBLISHED'
  },
  {
    title: 'Scope 3 배출량 계산 실무 가이드',
    slug: 'scope3-calculation-guide-ko',
    description: 'GHG Protocol Scope 3 Category 4(Upstream Transportation)와 Category 9(Downstream Transportation) 배출량 계산 실무 가이드입니다.',
    category: 'WHITEPAPER',
    file_type: 'PDF',
    file_size_mb: 4.2,
    file_url: 'https://storage.glec.io/library/scope3-calculation-guide-ko.pdf',
    download_type: 'DIRECT',
    tags: ['Scope 3', 'GHG Protocol', 'Carbon Accounting', 'Calculation'],
    language: 'ko',
    version: '1.0',
    requires_form: false,
    status: 'PUBLISHED'
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
      // Check if item already exists by slug
      const existing = await sql`
        SELECT id FROM library_items WHERE slug = ${item.slug}
      `;

      if (existing.length > 0) {
        log('WARN', `Library item already exists: ${item.title}`, `Slug: ${item.slug}`);
        skipped++;
        continue;
      }

      // Insert library item with UUID
      const id = crypto.randomUUID();

      await sql`
        INSERT INTO library_items (
          id,
          title,
          slug,
          description,
          category,
          file_type,
          file_size_mb,
          file_url,
          download_type,
          tags,
          language,
          version,
          requires_form,
          download_count,
          view_count,
          status,
          published_at,
          created_at,
          updated_at
        ) VALUES (
          ${id},
          ${item.title},
          ${item.slug},
          ${item.description},
          ${item.category},
          ${item.file_type},
          ${item.file_size_mb},
          ${item.file_url},
          ${item.download_type},
          ${item.tags},
          ${item.language},
          ${item.version},
          ${item.requires_form},
          0,
          0,
          ${item.status},
          NOW(),
          NOW(),
          NOW()
        )
      `;

      log('SUCCESS', `Created: ${item.title}`, `ID: ${id.substring(0, 8)}`);
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
    // Don't delete the existing GLEC Framework item (91c325cf)
    const result = await sql`
      DELETE FROM library_items
      WHERE id != '91c325cf-8e3e-4c26-b50a-d2bfe4e5d41f'
    `;
    log('SUCCESS', `Deleted ${result.length || 0} library items (kept existing GLEC Framework)`);
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
    console.log(`${BLUE}DATABASE_URL="your_database_url" node scripts/seed-library-items-v2.js${RESET}`);
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');

  console.log(`${BLUE}
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   GLEC Library Items Seeding Script v2                               ║
║   Production Data Initialization                                     ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
${RESET}
`);

  console.log(`${BLUE}📋 Configuration:${RESET}`);
  console.log(`   Database: ${DATABASE_URL.substring(0, 50)}...`);
  console.log(`   Clear existing data: ${shouldClear ? 'YES' : 'NO'}`);

  // Confirm before clearing
  if (shouldClear) {
    console.log(`\n${RED}⚠️  WARNING: This will DELETE library items (except GLEC Framework)!${RESET}`);
    console.log(`${YELLOW}Press Ctrl+C to cancel, or wait 5 seconds to continue...${RESET}\n`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    // Clear data if requested
    if (shouldClear) {
      await clearLibraryItems(sql);
    }

    // Seed library items
    await seedLibraryItems(sql);

    console.log(`\n${GREEN}╔═══════════════════════════════════════════════════════════════════════╗`);
    console.log(`║                                                                       ║`);
    console.log(`║   ✅ Seeding Complete!                                               ║`);
    console.log(`║                                                                       ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════════════╝${RESET}\n`);

    console.log(`${BLUE}📋 Next Steps:${RESET}`);
    console.log(`1. Check admin dashboard: https://glec-website.vercel.app/admin/knowledge-library`);
    console.log(`2. Verify library items are visible`);
    console.log(`3. Test download flow: https://glec-website.vercel.app/knowledge/library`);
    console.log();

  } catch (error) {
    log('ERROR', 'Seeding failed', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  process.exit(1);
});
