/**
 * Neon 데이터베이스 정보 추출
 * DATABASE_URL에서 프로젝트 정보를 파싱합니다
 */

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

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL이 .env.local에 없습니다.');
  process.exit(1);
}

console.log('🔍 Neon PostgreSQL 연결 정보 분석\n');
console.log('='.repeat(80));

try {
  const url = new URL(DATABASE_URL);

  // Neon 엔드포인트 정보 추출
  const hostname = url.hostname; // ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech
  const parts = hostname.split('.');

  const endpointId = parts[0]; // ep-nameless-mountain-adc1j5f8-pooler 또는 ep-nameless-mountain-adc1j5f8
  const region = parts.slice(-4, -2).join('.'); // us-east-1.aws
  const database = url.pathname.slice(1); // neondb
  const username = url.username; // neondb_owner

  console.log('📊 데이터베이스 정보:');
  console.log(`   Hostname: ${hostname}`);
  console.log(`   Endpoint: ${endpointId}`);
  console.log(`   Region: ${region}`);
  console.log(`   Database: ${database}`);
  console.log(`   Username: ${username}`);
  console.log('');

  // Neon Console URL 생성
  console.log('🌐 Neon Console 접속:');
  console.log(`   https://console.neon.tech`);
  console.log('');

  console.log('📋 복원 단계:');
  console.log('   1. 위 URL로 Neon Console 접속');
  console.log('   2. 프로젝트 선택 (Endpoint ID: ${endpointId})');
  console.log('   3. 왼쪽 메뉴에서 "Backups" 또는 "Branches" 확인');
  console.log('   4. NEON_BACKUP_GUIDE.md 참조하여 복원 진행');
  console.log('');

  console.log('⚠️ 확인 필요 사항:');
  console.log('   - 현재 플랜: Free vs Pro vs Business');
  console.log('   - 백업 존재 여부: Backups 탭 확인');
  console.log('   - 브랜치 히스토리: Branches 탭 확인');
  console.log('   - 복원 가능 시점: 2025-10-18 03:52 이전');
  console.log('');

  console.log('='.repeat(80));

  // Neon API 체크 (API 키가 있는 경우만)
  if (process.env.NEON_API_KEY) {
    console.log('\n🔑 Neon API 키 감지됨 - API로 프로젝트 정보 확인 중...\n');
    checkNeonAPI();
  } else {
    console.log('\n💡 팁: Neon API 키를 설정하면 자동으로 백업 확인 가능합니다:');
    console.log('   1. https://console.neon.tech/app/settings/api-keys');
    console.log('   2. "Create New API Key" 클릭');
    console.log('   3. .env.local에 추가: NEON_API_KEY=neon_api_...');
    console.log('');
  }

} catch (error) {
  console.error('❌ DATABASE_URL 파싱 오류:', error.message);
  process.exit(1);
}

async function checkNeonAPI() {
  // Neon API를 사용하여 프로젝트 정보 확인 (구현 예정)
  console.log('   [구현 필요] Neon API로 백업 목록 조회');
}
