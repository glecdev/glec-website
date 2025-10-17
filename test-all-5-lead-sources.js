const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function adminLogin() {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@glec.io', password: 'admin123' })
  });
  const data = await res.json();
  return data.data.token;
}

async function test5LeadSources() {
  console.log('═══════════════════════════════════════════════════');
  console.log('5개 리드 소스 통합 검증 테스트');
  console.log('═══════════════════════════════════════════════════\n');

  const timestamp = Date.now();
  const token = await adminLogin();
  console.log('✅ Admin logged in\n');

  const createdLeads = [];

  // 1. Library Lead
  console.log('1️⃣ Library Lead...');
  // Note: Requires RESEND_API_KEY, skipping for now
  console.log('   ⏭️  Skipped (requires RESEND_API_KEY)\n');

  // 2. Contact Form
  console.log('2️⃣ Contact Form...');
  const contactRes = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_name: `5-Source Test Company ${timestamp}`,
      contact_name: `Contact ${timestamp}`,
      email: `contact-5test-${timestamp}@example.com`,
      phone: '010-2222-2222',
      inquiry_type: 'PRODUCT',
      message: '5개 리드 소스 통합 테스트 - 문의 폼'
    })
  });
  const contact = await contactRes.json();
  createdLeads.push({ type: 'CONTACT_FORM', id: contact.data.id, email: contact.data.email });
  console.log(`   ✅ Contact ID: ${contact.data.id}\n`);

  // 3. Demo Request
  console.log('3️⃣ Demo Request...');
  const demoRes = await fetch(`${BASE_URL}/api/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: `5-Source Demo Company ${timestamp}`,
      contactName: `Demo ${timestamp}`,
      email: `demo-5test-${timestamp}@example.com`,
      phone: '010-3333-3333',
      companySize: '11-50',
      productInterests: ['DTG Series 5'],
      useCase: '5개 리드 소스 통합 테스트 - 데모 신청',
      monthlyShipments: '100-1000'
    })
  });
  const demo = await demoRes.json();
  createdLeads.push({ type: 'DEMO_REQUEST', id: demo.data.id, email: demo.data.email });
  console.log(`   ✅ Demo ID: ${demo.data.id}\n`);

  // 4. Event Registration
  console.log('4️⃣ Event Registration...');
  const eventCreateRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: `5-Source Test Event ${timestamp}`,
      slug: `5-source-test-${timestamp}`,
      description: '5개 리드 소스 통합 테스트',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      location: '서울시 강남구',
      max_participants: 100,
      meeting_type: 'OFFLINE',
      status: 'PUBLISHED'
    })
  });
  const event = await eventCreateRes.json();
  
  const regRes = await fetch(`${BASE_URL}/api/event-registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: event.data.id,
      name: `Event ${timestamp}`,
      email: `event-5test-${timestamp}@example.com`,
      phone: '010-4444-4444',
      company: `5-Source Event Company ${timestamp}`,
      job_title: 'Manager'
    })
  });
  const registration = await regRes.json();
  createdLeads.push({ type: 'EVENT_REGISTRATION', id: registration.data.id, email: registration.data.email, eventId: event.data.id });
  console.log(`   ✅ Registration ID: ${registration.data.id}\n`);

  // 5. Partnership
  console.log('5️⃣ Partnership...');
  const partnerRes = await fetch(`${BASE_URL}/api/partnerships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: `5-Source Partner Company ${timestamp}`,
      contactName: `Partner ${timestamp}`,
      email: `partner-5test-${timestamp}@example.com`,
      partnershipType: 'tech',
      proposal: '5개 리드 소스 통합 테스트 - 기술 파트너십 제안'
    })
  });
  const partnership = await partnerRes.json();
  createdLeads.push({ type: 'PARTNERSHIP', id: partnership.data.id, email: partnership.data.email });
  console.log(`   ✅ Partnership ID: ${partnership.data.id}\n`);

  // Wait for DB
  console.log('⏳ Waiting 3 seconds for database...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Verify in unified_leads
  console.log('🔍 Verifying in unified_leads...\n');
  const leadsRes = await fetch(`${BASE_URL}/api/admin/leads?per_page=100`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const leadsData = await leadsRes.json();

  const ourLeads = leadsData.data.filter(lead =>
    createdLeads.some(created =>
      created.type === lead.lead_source_type && created.email === lead.email
    )
  );

  console.log(`   Total leads in system: ${leadsData.data.length}`);
  console.log(`   Our test leads found: ${ourLeads.length}/4\n`);

  ourLeads.forEach(lead => {
    console.log(`   ✅ ${lead.lead_source_type}`);
    console.log(`      Company: ${lead.company_name}`);
    console.log(`      Email: ${lead.email}`);
    console.log(`      Score: ${lead.lead_score}, Status: ${lead.lead_status}\n`);
  });

  // Cleanup
  console.log('🧹 Cleanup...');
  const eventLead = createdLeads.find(l => l.type === 'EVENT_REGISTRATION');
  if (eventLead) {
    await fetch(`${BASE_URL}/api/admin/events/${eventLead.eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   ✅ Deleted event: ${eventLead.eventId}\n`);
  }

  console.log('═══════════════════════════════════════════════════');
  if (ourLeads.length === 4) {
    console.log('✅ SUCCESS: All 4 lead sources integrated!');
    console.log('   (Library Lead skipped - requires RESEND_API_KEY)');
  } else {
    console.log(`⚠️  WARNING: Only ${ourLeads.length}/4 leads found`);
  }
  console.log('═══════════════════════════════════════════════════');
}

test5LeadSources().catch(console.error);
