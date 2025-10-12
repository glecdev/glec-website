const https = require('https');

const BASE_URL = 'https://glec-website-ozdpzkssh-glecdevs-projects.vercel.app';

async function sendRequest(method, path, body = null) {
  const url = new URL(path, BASE_URL);
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = https.request(url, options, (res) => {
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

async function createRealSlot() {
  console.log('🧪 실제 미팅 슬롯 생성');
  console.log('📍 Base URL: ' + BASE_URL + '\n');

  // 내일 오전 10시부터 3개 슬롯 생성
  const slots = [
    {
      title: 'GLEC 제품 데모 미팅',
      description: '30분간 GLEC DTG Series5와 Cloud 솔루션을 소개해드립니다.',
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(), // 내일 10:00
      end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 10.5 * 60 * 60 * 1000).toISOString(), // 내일 10:30
      duration_minutes: 30,
      meeting_location: 'ONLINE',
      meeting_type: 'DEMO',
      is_available: true,
    },
    {
      title: 'GLEC 제품 데모 미팅',
      description: '30분간 GLEC DTG Series5와 Cloud 솔루션을 소개해드립니다.',
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // 내일 14:00
      end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 14.5 * 60 * 60 * 1000).toISOString(), // 내일 14:30
      duration_minutes: 30,
      meeting_location: 'ONLINE',
      meeting_type: 'DEMO',
      is_available: true,
    },
    {
      title: 'GLEC 제품 데모 미팅',
      description: '30분간 GLEC DTG Series5와 Cloud 솔루션을 소개해드립니다.',
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000).toISOString(), // 내일 16:00
      end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 16.5 * 60 * 60 * 1000).toISOString(), // 내일 16:30
      duration_minutes: 30,
      meeting_location: 'ONLINE',
      meeting_type: 'DEMO',
      is_available: true,
    },
  ];

  console.log('📅 3개의 미팅 슬롯 생성 중...\n');

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const response = await sendRequest('POST', '/api/admin/meetings/slots', slot);
    
    if (response.status === 201 && response.data.success) {
      const startTime = new Date(slot.start_time);
      console.log('✅ 슬롯 ' + (i + 1) + ' 생성 완료');
      console.log('   ID: ' + response.data.data.id);
      console.log('   시간: ' + startTime.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
      console.log('   위치: ' + slot.meeting_location + '\n');
    } else {
      console.log('❌ 슬롯 ' + (i + 1) + ' 생성 실패:', response.data);
    }
  }

  console.log('🎉 모든 슬롯 생성 완료!');
  console.log('📧 이메일의 링크를 다시 클릭하여 확인하세요.');
}

createRealSlot().catch(err => console.error('오류:', err));
