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

async function checkDatabaseTables() {
  console.log('📊 데이터베이스 테이블 및 데이터 확인\n');
  console.log('='.repeat(80));

  const tables = [
    'blogs',
    'videos',
    'library_items',
    'notices',
    'events',
    'press',
    'popups',
  ];

  for (const tableName of tables) {
    try {
      // Direct query using template string (Neon allows this for internal scripts)
      const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
      const result = await sql.unsafe(countQuery);
      const count = Number(result[0].count);

      console.log(`✅ ${tableName.padEnd(20)} ${count}개`);

      // Get sample if exists
      if (count > 0) {
        const sampleQuery = `SELECT * FROM "${tableName}" LIMIT 3`;
        const samples = await sql.unsafe(sampleQuery);
        console.log(`   샘플 데이터:`);
        samples.forEach((row, idx) => {
          const title = row.title || row.name || row.event_name || row.message || '(제목 없음)';
          console.log(`     ${idx + 1}. ${title}`);
        });
      }
      console.log('');
    } catch (error) {
      console.log(`❌ ${tableName.padEnd(20)} 오류: ${error.message}`);
      console.log('');
    }
  }

  console.log('='.repeat(80));
}

checkDatabaseTables().catch(error => {
  console.error('❌ 오류:', error);
  process.exit(1);
});
