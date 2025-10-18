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

async function checkContentDatabase() {
  console.log('📊 데이터베이스 콘텐츠 확인\n');

  const tables = [
    { name: 'blogs', displayName: 'Knowledge Blog' },
    { name: 'videos', displayName: 'Knowledge Videos' },
    { name: 'library_items', displayName: 'Library Items' },
    { name: 'notices', displayName: 'Notices' },
    { name: 'events', displayName: 'Events' },
    { name: 'press', displayName: 'Press' },
    { name: 'popups', displayName: 'Popups' },
  ];

  console.log('='.repeat(80));
  console.log('테이블별 레코드 수');
  console.log('='.repeat(80) + '\n');

  let totalRecords = 0;
  const results = [];

  for (const table of tables) {
    try {
      // 직접 쿼리 실행 (unsafe하지만 내부 스크립트이므로 허용)
      const countResult = await sql([`SELECT COUNT(*) as count FROM ${table.name}`]);
      const count = Number(countResult[0].count);
      totalRecords += count;

      console.log(`✅ ${table.displayName.padEnd(25)} ${count}개`);

      // 샘플 데이터 3개 가져오기
      if (count > 0) {
        const sampleData = await sql([`SELECT * FROM ${table.name} ORDER BY created_at DESC LIMIT 3`]);

        results.push({
          table: table.name,
          displayName: table.displayName,
          count,
          samples: sampleData.map(row => ({
            id: row.id,
            title: row.title || row.name || row.event_name || '(제목 없음)',
            status: row.status,
            created_at: row.created_at,
          })),
        });
      } else {
        results.push({
          table: table.name,
          displayName: table.displayName,
          count: 0,
          samples: [],
        });
      }
    } catch (error) {
      console.log(`❌ ${table.displayName.padEnd(25)} 오류: ${error.message}`);
      results.push({
        table: table.name,
        displayName: table.displayName,
        count: null,
        error: error.message,
      });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`총 레코드: ${totalRecords}개`);
  console.log('='.repeat(80) + '\n');

  // 샘플 데이터 출력
  console.log('📄 샘플 데이터 (최신 3개):\n');
  console.log('='.repeat(80));

  for (const result of results) {
    if (result.count > 0) {
      console.log(`\n${result.displayName} (${result.count}개):`);
      console.log('-'.repeat(80));
      result.samples.forEach((sample, index) => {
        console.log(`  ${index + 1}. ${sample.title}`);
        console.log(`     ID: ${sample.id}`);
        console.log(`     상태: ${sample.status}`);
        console.log(`     생성일: ${new Date(sample.created_at).toLocaleString('ko-KR')}`);
      });
    } else if (result.count === 0) {
      console.log(`\n⚠️ ${result.displayName}: 데이터 없음`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('확인 완료:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(80) + '\n');

  // 빈 테이블이 있으면 경고
  const emptyTables = results.filter(r => r.count === 0);
  if (emptyTables.length > 0) {
    console.log('⚠️ 경고: 다음 테이블이 비어있습니다:');
    emptyTables.forEach(t => console.log(`   - ${t.displayName} (${t.table})`));
    console.log('\n   권장 사항:');
    console.log('   1. 어드민 포털에서 콘텐츠를 직접 생성하거나');
    console.log('   2. seed 스크립트를 실행하여 샘플 데이터 생성\n');
  }
}

checkContentDatabase().catch(error => {
  console.error('❌ 오류:', error);
  process.exit(1);
});
