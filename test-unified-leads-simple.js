/**
 * Simplified Unified Leads Test - Step by Step
 * Tests each API individually before full integration test
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

const timestamp = Date.now();
let adminToken = null;

async function adminLogin() {
  console.log('🔑 Admin Login...');
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const result = await response.json();
  adminToken = result.data.token;
  console.log('✅ Logged in\n');
}

async function testEventRegistration() {
  console.log('📅 Testing Event Registration...');

  // Create event
  const eventData = {
    title: `E2E 테스트 이벤트 ${timestamp}`,
    slug: `e2e-test-event-${timestamp}`,
    description: 'E2E 테스트용 이벤트입니다',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    location: '서울시 강남구',
    max_participants: 100,
    meeting_type: 'OFFLINE',
    status: 'PUBLISHED'
  };

  const eventRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(eventData)
  });
  const eventResult = await eventRes.json();
  console.log(`   Event created: ${eventResult.data.id}`);

  // Register
  const regData = {
    name: `테스트 참가자 ${timestamp}`,
    email: `event-${timestamp}@example.com`,
    phone: '010-1111-1111',
    company: '이벤트 테스트 회사',
    job_title: '담당자',
    message: 'E2E 테스트 - 이벤트 참가 신청',
    privacy_consent: true,
    marketing_consent: true
  };

  const regRes = await fetch(`${BASE_URL}/api/events/${eventResult.data.slug}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regData)
  });
  const regResult = await regRes.json();

  if (regResult.success) {
    console.log(`   ✅ Registration: ${regResult.data.id}\n`);
    return { type: 'EVENT_REGISTRATION', id: regResult.data.id, eventId: eventResult.data.id };
  } else {
    console.log(`   ❌ Failed: ${regResult.error?.message}\n`);
    return null;
  }
}

async function testContactForm() {
  console.log('📧 Testing Contact Form...');

  const data = {
    contact_name: `테스트 문의자 ${timestamp}`,
    email: `contact-${timestamp}@example.com`,
    phone: '010-2222-2222',
    company_name: '문의 테스트 회사',
    inquiry_type: 'PRODUCT',
    message: 'E2E 테스트 - 제품 문의 내용입니다. 탄소배출 측정 솔루션에 관심이 있습니다.',
    privacy_consent: true
  };

  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();

  if (result.success) {
    console.log(`   ✅ Contact: ${result.data.id}\n`);
    return { type: 'CONTACT_FORM', id: result.data.id };
  } else {
    console.log(`   ❌ Failed: ${JSON.stringify(result.error)}\n`);
    return null;
  }
}

async function testDemoRequest() {
  console.log('💼 Testing Demo Request...');

  const data = {
    companyName: `데모 테스트 회사 ${timestamp}`,
    contactName: `테스트 데모 신청자 ${timestamp}`,
    email: `demo-${timestamp}@example.com`,
    phone: '010-3333-3333',
    companySize: '11-50',
    productInterests: ['DTG Series 5'],
    useCase: 'E2E 테스트 - 물류 탄소배출 측정 솔루션을 도입하고자 합니다. 현재 월 500건의 국제 배송을 하고 있습니다.',
    currentSolution: '없음',
    monthlyShipments: '100-1000',
    preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preferredTime: '14:00',
    additionalMessage: 'E2E 테스트 메시지입니다'
  };

  const res = await fetch(`${BASE_URL}/api/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();

  if (result.success) {
    console.log(`   ✅ Demo Request: ${result.data.id}\n`);
    return { type: 'DEMO_REQUEST', id: result.data.id };
  } else {
    console.log(`   ❌ Failed: ${JSON.stringify(result.error)}\n`);
    return null;
  }
}

async function testPartnership() {
  console.log('🤝 Testing Partnership...');

  const data = {
    contact_name: `테스트 파트너십 ${timestamp}`,
    email: `partnership-${timestamp}@example.com`,
    phone: '010-4444-4444',
    company_name: '파트너십 테스트 회사',
    partnership_type: 'TECHNOLOGY',
    message: 'E2E 테스트 - 기술 파트너십 문의입니다. IoT 디바이스 통합을 논의하고 싶습니다.',
    privacy_consent: true
  };

  const res = await fetch(`${BASE_URL}/api/partnership`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();

  if (result.success) {
    console.log(`   ✅ Partnership: ${result.data.id}\n`);
    return { type: 'PARTNERSHIP', id: result.data.id };
  } else {
    console.log(`   ❌ Failed: ${JSON.stringify(result.error)}\n`);
    return null;
  }
}

async function testLibraryDownload() {
  console.log('📚 Testing Library Download...');

  // Create library item first
  const libraryData = {
    title: `E2E 테스트 자료 ${timestamp}`,
    category: 'WHITEPAPER',
    file_url: 'https://example.com/test.pdf',
    status: 'PUBLISHED'
  };

  const libRes = await fetch(`${BASE_URL}/api/admin/knowledge-library`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(libraryData)
  });
  const libResult = await libRes.json();
  console.log(`   Library item created: ${libResult.data.id}`);

  // Request download
  const data = {
    library_item_id: libResult.data.id,
    contact_name: `테스트 자료 다운로드 ${timestamp}`,
    email: `library-${timestamp}@example.com`,
    phone: '010-5555-5555',
    company_name: '라이브러리 테스트 회사',
    privacy_consent: true
  };

  const res = await fetch(`${BASE_URL}/api/library/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();

  if (result.success) {
    console.log(`   ✅ Library Lead: ${result.data.id}\n`);
    return { type: 'LIBRARY_LEAD', id: result.data.id, libraryId: libResult.data.id };
  } else {
    console.log(`   ❌ Failed: ${JSON.stringify(result.error)}\n`);
    return null;
  }
}

async function verifyUnifiedLeads(createdLeads) {
  console.log('🔍 Verifying Unified Leads Dashboard...');

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for DB

  const res = await fetch(`${BASE_URL}/api/admin/leads?per_page=100`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const result = await res.json();

  if (!result.success) {
    console.log(`   ❌ API failed: ${result.error?.message}\n`);
    return;
  }

  console.log(`   Total leads in system: ${result.meta.total}`);
  console.log(`   Stats:`, JSON.stringify(result.stats, null, 2));

  // Find our leads
  const ourLeads = result.data.filter(lead =>
    createdLeads.some(created =>
      created && created.type === lead.lead_source_type && created.id === lead.lead_id
    )
  );

  console.log(`\n   📋 Our test leads found: ${ourLeads.length}/${createdLeads.filter(l => l).length}`);

  ourLeads.forEach(lead => {
    console.log(`   ✅ ${lead.lead_source_type}: ${lead.company_name} (Score: ${lead.lead_score})`);
  });

  const missing = createdLeads.filter(created =>
    created && !ourLeads.some(lead => lead.lead_source_type === created.type && lead.lead_id === created.id)
  );

  if (missing.length > 0) {
    console.log(`\n   ⚠️  Missing leads:`);
    missing.forEach(m => console.log(`      - ${m.type}: ${m.id}`));
  }

  console.log('');
}

async function cleanup(createdLeads) {
  console.log('🧹 Cleanup...');

  for (const lead of createdLeads) {
    if (!lead) continue;

    if (lead.type === 'EVENT_REGISTRATION' && lead.eventId) {
      try {
        await fetch(`${BASE_URL}/api/admin/events/${lead.eventId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log(`   ✅ Deleted event: ${lead.eventId}`);
      } catch (err) {
        console.log(`   ⚠️ Failed to delete event: ${lead.eventId}`);
      }
    }

    if (lead.type === 'LIBRARY_LEAD' && lead.libraryId) {
      try {
        await fetch(`${BASE_URL}/api/admin/knowledge-library/${lead.libraryId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log(`   ✅ Deleted library item: ${lead.libraryId}`);
      } catch (err) {
        console.log(`   ⚠️ Failed to delete library item: ${lead.libraryId}`);
      }
    }
  }

  console.log('');
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('UNIFIED LEADS - SIMPLIFIED E2E TEST');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    await adminLogin();

    const createdLeads = [];

    createdLeads.push(await testEventRegistration());
    createdLeads.push(await testContactForm());
    createdLeads.push(await testDemoRequest());
    createdLeads.push(await testPartnership());
    createdLeads.push(await testLibraryDownload());

    await verifyUnifiedLeads(createdLeads);
    await cleanup(createdLeads);

    const successful = createdLeads.filter(l => l).length;
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ TEST COMPLETE: ${successful}/5 APIs successful`);
    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.log('\n❌ TEST FAILED:', error.message);
    console.log(error.stack);
  }
}

main();
