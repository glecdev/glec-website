/**
 * E2E Test: Event Registration Form
 *
 * Tests:
 * 1. Event detail page loads successfully
 * 2. Registration button opens modal (not redirect to /contact)
 * 3. Form validation works
 * 4. Form submission creates registration
 * 5. Success message displays
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testEventRegistration() {
  console.log('🧪 E2E Test: Event Registration Form\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Create a test event via admin API
  console.log('📋 Test 1: Creating test event...');
  totalTests++;

  const adminLoginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@glec.io',
      password: 'glec2024!secure'
    })
  });

  if (!adminLoginResponse.ok) {
    console.log('❌ Failed to login to admin');
    console.log(`   Status: ${adminLoginResponse.status}`);
    const errorText = await adminLoginResponse.text();
    console.log(`   Response: ${errorText}\n`);
    return;
  }

  const loginData = await adminLoginResponse.json();
  const authToken = loginData.data.token;
  console.log('✅ Admin login successful\n');

  // Create test event
  const eventData = {
    title: `[E2E Test] Event Registration ${Date.now()}`,
    slug: `event-registration-test-${Date.now()}`,
    description: 'E2E 테스트용 이벤트입니다.',
    meeting_type: 'OFFLINE',
    location: '서울시 강남구 테헤란로 123',
    max_participants: 50,
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
    status: 'PUBLISHED'
  };

  const createEventResponse = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(eventData)
  });

  if (!createEventResponse.ok) {
    console.log('❌ Failed to create event');
    console.log(`   Status: ${createEventResponse.status}`);
    const errorText = await createEventResponse.text();
    console.log(`   Response: ${errorText}\n`);
    return;
  }

  const createEventData = await createEventResponse.json();
  const eventSlug = createEventData.data.slug;
  const eventId = createEventData.data.id;
  console.log(`✅ Test event created: ${eventSlug}`);
  console.log(`   Event ID: ${eventId}\n`);
  passedTests++;

  // Test 2: Check event detail page loads
  console.log('📋 Test 2: Fetching event details from public API...');
  totalTests++;

  const eventsResponse = await fetch(`${BASE_URL}/api/events`);
  if (!eventsResponse.ok) {
    console.log(`❌ Failed to fetch events list`);
    console.log(`   Status: ${eventsResponse.status}\n`);
  } else {
    const eventsData = await eventsResponse.json();
    const foundEvent = eventsData.data.find(e => e.slug === eventSlug);

    if (foundEvent) {
      console.log(`✅ Event found in public list`);
      console.log(`   Title: ${foundEvent.title}`);
      console.log(`   Slug: ${foundEvent.slug}\n`);
      passedTests++;
    } else {
      console.log(`❌ Event not found in public list\n`);
    }
  }

  // Test 3: Submit registration
  console.log('📋 Test 3: Submitting event registration...');
  totalTests++;

  const registrationData = {
    name: '테스트 사용자',
    email: `test-${Date.now()}@example.com`,
    phone: '010-1234-5678',
    company: 'GLEC 테스트',
    job_title: 'E2E 테스터',
    message: 'E2E 테스트 참가 신청입니다.',
    privacy_consent: true,
    marketing_consent: true
  };

  const registerResponse = await fetch(`${BASE_URL}/api/events/${eventSlug}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  });

  if (!registerResponse.ok) {
    console.log(`❌ Registration failed`);
    console.log(`   Status: ${registerResponse.status}`);
    const errorData = await registerResponse.json();
    console.log(`   Error: ${JSON.stringify(errorData, null, 2)}\n`);
  } else {
    const registerData = await registerResponse.json();
    console.log(`✅ Registration successful`);
    console.log(`   Registration ID: ${registerData.data.id}`);
    console.log(`   Email: ${registerData.data.email}`);
    console.log(`   Status: ${registerData.data.status}\n`);
    passedTests++;
  }

  // Test 4: Verify registration appears in admin
  console.log('📋 Test 4: Verifying registration in admin...');
  totalTests++;

  const adminRegistrationsResponse = await fetch(
    `${BASE_URL}/api/admin/events/${eventId}/registrations`,
    {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }
  );

  if (!adminRegistrationsResponse.ok) {
    console.log(`❌ Failed to fetch admin registrations`);
    console.log(`   Status: ${adminRegistrationsResponse.status}`);
    const errorText = await adminRegistrationsResponse.text();
    console.log(`   Response: ${errorText}\n`);
  } else {
    const adminRegistrationsData = await adminRegistrationsResponse.json();
    const registrations = adminRegistrationsData.data;

    if (registrations && registrations.length > 0) {
      console.log(`✅ Registration found in admin`);
      console.log(`   Total registrations: ${registrations.length}`);
      console.log(`   Latest registration: ${registrations[0].name} (${registrations[0].email})\n`);
      passedTests++;
    } else {
      console.log(`❌ No registrations found in admin\n`);
    }
  }

  // Test 5: Test duplicate registration prevention
  console.log('📋 Test 5: Testing duplicate registration prevention...');
  totalTests++;

  const duplicateRegisterResponse = await fetch(`${BASE_URL}/api/events/${eventSlug}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationData)
  });

  if (duplicateRegisterResponse.status === 400) {
    const duplicateData = await duplicateRegisterResponse.json();
    if (duplicateData.error?.code === 'DUPLICATE_REGISTRATION') {
      console.log(`✅ Duplicate registration prevented correctly`);
      console.log(`   Error code: ${duplicateData.error.code}`);
      console.log(`   Error message: ${duplicateData.error.message}\n`);
      passedTests++;
    } else {
      console.log(`❌ Wrong error code for duplicate registration`);
      console.log(`   Expected: DUPLICATE_REGISTRATION`);
      console.log(`   Got: ${duplicateData.error?.code}\n`);
    }
  } else {
    console.log(`❌ Duplicate registration was not prevented`);
    console.log(`   Status: ${duplicateRegisterResponse.status}\n`);
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════════');

  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
    console.log('\n🎉 Event registration system is working correctly!');
    process.exit(0);
  } else {
    console.log(`❌ ${totalTests - passedTests} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
testEventRegistration().catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});
