const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = envContent.split('\n').filter(line => line && !line.startsWith('#'));
  envVars.forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      const value = values.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

const sql = neon(process.env.DATABASE_URL);

async function checkCapacity() {
  console.log('🔍 Neon DB 용량 및 콘텐츠 상태 분석\n');
  console.log('='.repeat(80));

  // 1. 데이터베이스 총 용량
  const dbSize = await sql`
    SELECT pg_size_pretty(pg_database_size(current_database())) as size,
           pg_database_size(current_database()) as bytes
  `;

  console.log('\n📊 데이터베이스 전체 용량:');
  console.log(`   현재 크기: ${dbSize[0].size} (${dbSize[0].bytes} bytes)`);
  console.log('   Neon Free 한도: 512 MB (536,870,912 bytes)');

  const usagePercent = (dbSize[0].bytes / 536870912 * 100).toFixed(2);
  console.log(`   사용률: ${usagePercent}%`);

  if (dbSize[0].bytes > 536870912) {
    console.log('   ⚠️  경고: 무료 플랜 한도 초과!');
  } else {
    console.log(`   ✅ 여유 공간: ${(512 - dbSize[0].bytes / 1024 / 1024).toFixed(2)} MB`);
  }

  // 2. 테이블별 용량
  const tableSizes = await sql`
    SELECT
      tablename,
      pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size,
      pg_total_relation_size('public.'||tablename) AS bytes
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY bytes DESC
    LIMIT 15
  `;

  console.log('\n📋 테이블별 용량 (상위 15개):');
  tableSizes.forEach(t => {
    const percent = (t.bytes / dbSize[0].bytes * 100).toFixed(1);
    console.log(`   ${t.tablename.padEnd(35)} ${t.size.padEnd(10)} (${percent}%)`);
  });

  // 3. 콘텐츠 테이블 레코드 수
  console.log('\n📊 콘텐츠 데이터 현황:');

  const blogs = await sql`SELECT COUNT(*)::int as count FROM blogs`;
  console.log(`   Blogs:           ${blogs[0].count}개`);

  const videos = await sql`SELECT COUNT(*)::int as count FROM videos`;
  console.log(`   Videos:          ${videos[0].count}개`);

  const libraries = await sql`SELECT COUNT(*)::int as count FROM libraries`;
  console.log(`   Libraries:       ${libraries[0].count}개`);

  const notices = await sql`SELECT COUNT(*)::int as count FROM notices`;
  console.log(`   Notices:         ${notices[0].count}개`);

  const events = await sql`SELECT COUNT(*)::int as count FROM events`;
  console.log(`   Events:          ${events[0].count}개`);

  const presses = await sql`SELECT COUNT(*)::int as count FROM presses`;
  console.log(`   Presses:         ${presses[0].count}개`);

  const popups = await sql`SELECT COUNT(*)::int as count FROM popups`;
  console.log(`   Popups:          ${popups[0].count}개`);

  const total = blogs[0].count + videos[0].count + libraries[0].count +
                notices[0].count + events[0].count + presses[0].count + popups[0].count;
  console.log('   ' + '─'.repeat(40));
  console.log(`   총 콘텐츠:       ${total}개`);

  // 4. 다른 주요 테이블 레코드 수
  console.log('\n📊 기타 데이터 현황:');

  const users = await sql`SELECT COUNT(*)::int as count FROM users`;
  console.log(`   Users:           ${users[0].count}개`);

  const contacts = await sql`SELECT COUNT(*)::int as count FROM contacts`;
  console.log(`   Contacts:        ${contacts[0].count}개`);

  const leads = await sql`SELECT COUNT(*)::int as count FROM unified_leads_view`;
  console.log(`   Leads (unified): ${leads[0].count}개`);

  // 5. Neon 프로젝트 정보
  console.log('\n🔍 Neon 프로젝트 정보:');
  const endpoint = process.env.DATABASE_URL.match(/ep-[a-z0-9-]+/)?.[0];
  console.log(`   Endpoint: ${endpoint}`);
  console.log('   Region: us-east-1 (AWS)');
  console.log('   Plan: Free (512 MB storage)');
  console.log('   Database: neondb');

  // 6. 결론
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 결론:\n');

  if (total === 0) {
    console.log('❌ 콘텐츠 데이터가 모두 사라졌습니다!');
    console.log('   원인: 용량 한도와 무관, 데이터 삭제 또는 migration reset');
  } else if (total === 43) {
    console.log('✅ 콘텐츠 데이터가 정상적으로 복원되어 있습니다!');
    console.log(`   복원 완료: ${total}개 (2025-10-18 복구 작업 완료)`);
  } else {
    console.log(`⚠️  콘텐츠 데이터가 일부만 있습니다: ${total}개`);
  }

  if (dbSize[0].bytes > 536870912) {
    console.log('\n⚠️  데이터베이스 용량이 무료 플랜 한도를 초과했습니다!');
    console.log('   조치 필요: 불필요한 데이터 삭제 또는 Neon Pro 플랜 업그레이드');
  } else {
    console.log(`\n✅ 데이터베이스 용량은 정상 범위입니다 (${usagePercent}% 사용 중)`);
    console.log('   용량 문제로 데이터가 삭제되지 않았습니다.');
  }
}

checkCapacity().catch(err => {
  console.error('❌ 오류:', err.message);
  console.error(err);
});
