/**
 * Partnership API Test
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const timestamp = Date.now();

async function testPartnership() {
  console.log('🤝 Testing Partnership API...\n');

  const data = {
    companyName: `파트너십 검증 회사 ${timestamp}`,
    contactName: `파트너십 담당자 ${timestamp}`,
    email: `partnership-test-${timestamp}@example.com`,
    partnershipType: 'tech',
    proposal: '통합 리드 검증 테스트 - 기술 파트너십 제안입니다. IoT 디바이스 통합을 통한 실시간 탄소배출 데이터 수집 시스템을 제안합니다.'
  };

  console.log('Request Data:');
  console.log(JSON.stringify(data, null, 2));
  console.log('');

  try {
    const res = await fetch(`${BASE_URL}/api/partnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    console.log(`Status: ${res.status}`);
    console.log('Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (result.success) {
      console.log('✅ SUCCESS: Partnership submitted!');
      console.log(`   ID: ${result.data.id}`);
      console.log(`   Email Sent: ${result.data.emailSent}`);
      console.log(`   Email Attempts: ${result.data.emailAttempts}`);
      return result.data.id;
    } else {
      console.log('❌ FAILED:', result.error?.message);
      if (result.error?.details) {
        console.log('   Details:', result.error.details);
      }
      return null;
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return null;
  }
}

testPartnership();
