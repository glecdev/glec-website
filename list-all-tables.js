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

async function listAllTables() {
  console.log('📊 데이터베이스의 모든 테이블 목록\n');
  console.log('='.repeat(80));

  try {
    // PostgreSQL의 모든 테이블 나열
    const tables = await sql`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`\n총 ${tables.length}개 테이블:\n`);

    for (const table of tables) {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    }

    console.log('\n' + '='.repeat(80));

    // 각 테이블의 레코드 수 확인
    console.log('\n📈 각 테이블의 레코드 수:\n');
    console.log('='.repeat(80));

    for (const table of tables) {
      if (table.table_type === 'BASE TABLE') {
        try {
          const count = await sql`
            SELECT COUNT(*) as count
            FROM ${sql(table.table_name)}
          `;
          const rowCount = Number(count[0].count);
          const status = rowCount > 0 ? '✅' : '⚠️';
          console.log(`${status} ${table.table_name.padEnd(40)} ${rowCount}개`);
        } catch (err) {
          console.log(`❌ ${table.table_name.padEnd(40)} 오류: ${err.message.substring(0, 50)}`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

listAllTables();
