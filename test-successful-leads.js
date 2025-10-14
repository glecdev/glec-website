/**
 * Verify 3 successful APIs integrate into Unified Leads
 * - Event Registration
 * - Contact Form
 * - Demo Request
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

const timestamp = Date.now();
let adminToken = null;
const createdLeads = [];

async function adminLogin() {
  console.log('🔑 Admin Login...');
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  adminToken = (await res.json()).data.token;
  console.log('✅ Logged in\n');
}

async function createAndRegisterEvent() {
  console.log('📅 Step 1: Event Registration...');

  // Create event
  const eventData = {
    title: `Verification Test Event ${timestamp}`,
    slug: `verify-test-event-${timestamp}`,
    description: '통합 리드 검증용 이벤트',
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    location: '서울시 강남구',
    max_participants: 100,
    meeting_type: 'OFFLINE',
    status: 'PUBLISHED'
  };

  const eventRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify(eventData)
  });
  const eventResult = await eventRes.json();

  // Register
  const regRes = await fetch(`${BASE_URL}/api/events/${eventResult.data.slug}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `통합리드 검증 참가자 ${timestamp}`,
      email: `event-verify-${timestamp}@example.com`,
      phone: '010-1111-1111',
      company: '이벤트 검증 회사',
      job_title: '담당자',
      message: '통합 리드 검증 테스트',
      privacy_consent: true,
      marketing_consent: true
    })
  });
  const regResult = await regRes.json();

  console.log(`   ✅ Event: ${eventResult.data.id}`);
  console.log(`   ✅ Registration: ${regResult.data.id}\n`);

  createdLeads.push({
    type: 'EVENT_REGISTRATION',
    id: regResult.data.id,
    email: `event-verify-${timestamp}@example.com`,
    company: '이벤트 검증 회사',
    eventId: eventResult.data.id
  });
}

async function createContact() {
  console.log('📧 Step 2: Contact Form...');

  const res = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contact_name: `통합리드 검증 문의자 ${timestamp}`,
      email: `contact-verify-${timestamp}@example.com`,
      phone: '010-2222-2222',
      company_name: '문의 검증 회사',
      inquiry_type: 'PRODUCT',
      message: '통합 리드 검증 테스트 - 제품 문의 내용입니다.',
      privacy_consent: true
    })
  });
  const result = await res.json();

  console.log(`   ✅ Contact: ${result.data.id}\n`);

  createdLeads.push({
    type: 'CONTACT_FORM',
    id: result.data.id,
    email: `contact-verify-${timestamp}@example.com`,
    company: '문의 검증 회사'
  });
}

async function createDemoRequest() {
  console.log('💼 Step 3: Demo Request...');

  const res = await fetch(`${BASE_URL}/api/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: `데모 검증 회사 ${timestamp}`,
      contactName: `통합리드 검증 데모신청자 ${timestamp}`,
      email: `demo-verify-${timestamp}@example.com`,
      phone: '010-3333-3333',
      companySize: '11-50',
      productInterests: ['DTG Series 5'],
      useCase: '통합 리드 검증 테스트 - 물류 탄소배출 측정 솔루션을 도입하고자 합니다.',
      currentSolution: '없음',
      monthlyShipments: '100-1000',
      preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      preferredTime: '14:00',
      additionalMessage: '통합 리드 검증 메시지'
    })
  });
  const result = await res.json();

  console.log(`   ✅ Demo: ${result.data.id}\n`);

  createdLeads.push({
    type: 'DEMO_REQUEST',
    id: result.data.id,
    email: `demo-verify-${timestamp}@example.com`,
    company: `데모 검증 회사 ${timestamp}`
  });
}

async function verifyUnifiedLeads() {
  console.log('🔍 Step 4: Verify Unified Leads Dashboard...\n');

  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for DB

  const res = await fetch(`${BASE_URL}/api/admin/leads?per_page=100`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const result = await res.json();

  console.log(`   Total leads in system: ${result.meta.total}`);
  console.log(`\n   📊 Stats:`);
  console.log(`      Avg Score: ${result.stats.avg_score}`);
  console.log(`      By Source:`, result.stats.by_source);
  console.log(`      By Status:`, result.stats.by_status);

  // Find our leads
  const ourLeads = result.data.filter(lead =>
    createdLeads.some(created =>
      created.type === lead.lead_source_type && created.id === lead.lead_id
    )
  );

  console.log(`\n   ✅ Our test leads found: ${ourLeads.length}/${createdLeads.length}\n`);

  if (ourLeads.length === createdLeads.length) {
    console.log('   🎉 VERIFICATION SUCCESS: All leads integrated!');
    console.log('');

    ourLeads.forEach(lead => {
      console.log(`   ✓ ${lead.lead_source_type}`);
      console.log(`     Company: ${lead.company_name}`);
      console.log(`     Email: ${lead.email}`);
      console.log(`     Score: ${lead.lead_score}, Status: ${lead.lead_status}`);
      console.log(`     Created: ${new Date(lead.created_at).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log('   ⚠️  Missing leads:');
    const missing = createdLeads.filter(created =>
      !ourLeads.some(lead => lead.lead_source_type === created.type && lead.lead_id === created.id)
    );
    missing.forEach(m => {
      console.log(`      - ${m.type}: ${m.id} (${m.email})`);
    });
    console.log('');
  }

  return ourLeads.length === createdLeads.length;
}

async function cleanup() {
  console.log('🧹 Cleanup...');

  for (const lead of createdLeads) {
    if (lead.type === 'EVENT_REGISTRATION' && lead.eventId) {
      try {
        await fetch(`${BASE_URL}/api/admin/events/${lead.eventId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log(`   ✅ Deleted event: ${lead.eventId}`);
      } catch (err) {
        console.log(`   ⚠️  Failed to delete event`);
      }
    }
  }
  console.log('');
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('UNIFIED LEADS - INTEGRATION VERIFICATION TEST');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    await adminLogin();
    await createAndRegisterEvent();
    await createContact();
    await createDemoRequest();

    const success = await verifyUnifiedLeads();

    await cleanup();

    console.log('═══════════════════════════════════════════════════');
    if (success) {
      console.log('✅ VERIFICATION COMPLETE: All 3 APIs integrated!');
      console.log('');
      console.log('Verified:');
      console.log('  1. Event Registration → unified_leads ✅');
      console.log('  2. Contact Form → unified_leads ✅');
      console.log('  3. Demo Request → unified_leads ✅');
    } else {
      console.log('⚠️  VERIFICATION INCOMPLETE: Some leads not found');
    }
    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.log('\n❌ TEST FAILED:', error.message);
    console.log(error.stack);
  }
}

main();
