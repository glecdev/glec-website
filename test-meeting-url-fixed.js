const https = require('https');

const BASE_URL = 'http://localhost:3009';

async function sendRequest(method, path, body = null) {
  const url = new URL(path, BASE_URL);
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('🧪 미팅 제안 이메일 URL 테스트');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  // 1. 미팅 슬롯 생성
  console.log('1️⃣  미팅 슬롯 생성 중...');
  const slotData = {
    title: 'URL 테스트 미팅',
    description: 'URL 포트 확인용',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    meeting_location: 'ONLINE',
    meeting_type: 'DEMO',
    is_available: true,
  };

  const slotResponse = await sendRequest('POST', '/api/admin/meetings/slots', slotData);
  if (slotResponse.status !== 201) {
    console.log(`❌ 슬롯 생성 실패: ${JSON.stringify(slotResponse.data)}`);
    return;
  }
  const slotId = slotResponse.data.data.id;
  console.log(`✅ 슬롯 생성 완료: ${slotId}\n`);

  // 2. 리드 조회
  console.log('2️⃣  리드 조회 중...');
  const leadsResponse = await sendRequest('GET', '/api/admin/library/leads?per_page=20');
  const leadWithEmail = leadsResponse.data.data.find(lead => lead.email);
  if (!leadWithEmail) {
    console.log('❌ 이메일 있는 리드 없음');
    await sendRequest('DELETE', `/api/admin/meetings/slots/${slotId}`);
    return;
  }
  console.log(`✅ 리드: ${leadWithEmail.email}\n`);

  // 3. 미팅 제안 발송
  console.log('3️⃣  미팅 제안 발송 중...');
  const proposalData = {
    lead_type: 'LIBRARY_LEAD',
    lead_id: leadWithEmail.id,
    meeting_purpose: 'URL 포트 테스트',
    admin_name: '강덕호',
    admin_email: 'admin@glec.io',
    admin_phone: '02-1234-5678',
  };
  const proposalResponse = await sendRequest('POST', '/api/admin/leads/send-meeting-proposal', proposalData);

  // 슬롯 삭제
  await sendRequest('DELETE', `/api/admin/meetings/slots/${slotId}`);

  if (proposalResponse.status === 200 && proposalResponse.data.success) {
    console.log(`✅ 미팅 제안 발송 성공!\n`);
    console.log(`📧 생성된 URL: ${proposalResponse.data.booking_url}`);
    console.log(`🔍 URL 포트: ${new URL(proposalResponse.data.booking_url).port || '80'}`);
  } else {
    console.log(`❌ 미팅 제안 실패: ${JSON.stringify(proposalResponse.data)}`);
  }
}

test().catch(err => console.error('오류:', err));
