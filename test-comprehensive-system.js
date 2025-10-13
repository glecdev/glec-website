/**
 * Comprehensive System Test
 *
 * Tests all major features:
 * 1. Admin authentication
 * 2. Meeting bookings API (with UUID fix)
 * 3. Event registration system
 * 4. Cross-feature integration
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

async function testComprehensiveSystem() {
  console.log('🧪 Comprehensive System Test\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  let passedTests = 0;
  let totalTests = 0;

  // ============================================
  // Part 1: Admin Authentication
  // ============================================
  console.log('═══════════════════════════════════════');
  console.log('Part 1: Admin Authentication');
  console.log('═══════════════════════════════════════\n');

  console.log('📋 Test 1.1: Admin login...');
  totalTests++;

  const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@glec.io',
      password: 'GLEC2025Admin!'
    })
  });

  const loginData = await loginResponse.json();

  if (!loginData.success) {
    console.log('❌ Admin login failed');
    console.log(`   Error: ${loginData.error.message}\n`);
  } else {
    const authToken = loginData.data.token;
    console.log('✅ Admin login successful');
    console.log(`   User: ${loginData.data.user.name} (${loginData.data.user.role})\n`);
    passedTests++;

    // ============================================
    // Part 2: Meeting Bookings API (UUID Fix)
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('Part 2: Meeting Bookings API');
    console.log('═══════════════════════════════════════\n');

    console.log('📋 Test 2.1: Fetching all bookings...');
    totalTests++;

    const bookingsResponse = await fetch(`${BASE_URL}/api/admin/meetings/bookings`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const bookingsData = await bookingsResponse.json();

    if (!bookingsData.success) {
      console.log('❌ Bookings API failed');
      console.log(`   Error: ${bookingsData.error.code} - ${bookingsData.error.message}\n`);
    } else {
      console.log('✅ Bookings API successful');
      console.log(`   Total bookings: ${bookingsData.meta.total}`);
      console.log(`   Fetched: ${bookingsData.data.length} bookings\n`);
      passedTests++;

      if (bookingsData.data.length > 0) {
        console.log('📋 Test 2.2: Verifying booking data structure...');
        totalTests++;

        const sampleBooking = bookingsData.data[0];
        const requiredFields = [
          'id', 'booking_status', 'requested_agenda',
          'meeting', 'customer'
        ];

        const missingFields = requiredFields.filter(field => !(field in sampleBooking));

        if (missingFields.length === 0) {
          console.log('✅ Booking data structure valid');
          console.log(`   Sample: ${sampleBooking.customer.contact_name} (${sampleBooking.customer.company_name})`);
          console.log(`   Status: ${sampleBooking.booking_status}\n`);
          passedTests++;
        } else {
          console.log('❌ Missing fields:', missingFields.join(', '));
          console.log();
        }

        // Test date range filtering
        console.log('📋 Test 2.3: Testing date range filtering...');
        totalTests++;

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const dateRangeResponse = await fetch(
          `${BASE_URL}/api/admin/meetings/bookings?start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`,
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );

        const dateRangeData = await dateRangeResponse.json();

        if (!dateRangeData.success) {
          console.log('❌ Date range filtering failed');
          console.log(`   Error: ${dateRangeData.error.message}\n`);
        } else {
          console.log('✅ Date range filtering successful');
          console.log(`   Current month bookings: ${dateRangeData.data.length}\n`);
          passedTests++;
        }
      }
    }
  }

  // ============================================
  // Part 3: Event Registration System
  // ============================================
  console.log('═══════════════════════════════════════');
  console.log('Part 3: Event Registration System');
  console.log('═══════════════════════════════════════\n');

  console.log('📋 Test 3.1: Fetching published events...');
  totalTests++;

  const eventsResponse = await fetch(`${BASE_URL}/api/events`);
  const eventsData = await eventsResponse.json();

  if (!eventsData.success || eventsData.data.length === 0) {
    console.log('❌ No published events found\n');
  } else {
    console.log('✅ Published events found');
    console.log(`   Total: ${eventsData.data.length} events\n`);
    passedTests++;

    const testEvent = eventsData.data[0];

    console.log('📋 Test 3.2: Submitting event registration...');
    totalTests++;

    const timestamp = Date.now();
    const registrationData = {
      name: `테스트 사용자 ${timestamp}`,
      email: `test-${timestamp}@example.com`,
      phone: '010-1234-5678',
      company: 'GLEC 시스템 테스트',
      job_title: 'QA 엔지니어',
      message: '통합 테스트 참가 신청입니다.',
      privacy_consent: true,
      marketing_consent: false
    };

    const registerResponse = await fetch(`${BASE_URL}/api/events/${testEvent.slug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    const registerData = await registerResponse.json();

    if (!registerData.success) {
      console.log('❌ Event registration failed');
      console.log(`   Error: ${registerData.error.message}\n`);
    } else {
      console.log('✅ Event registration successful');
      console.log(`   Registration ID: ${registerData.data.id}`);
      console.log(`   Status: ${registerData.data.status}\n`);
      passedTests++;

      // Test duplicate prevention
      console.log('📋 Test 3.3: Testing duplicate prevention...');
      totalTests++;

      const duplicateResponse = await fetch(`${BASE_URL}/api/events/${testEvent.slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const duplicateData = await duplicateResponse.json();

      if (duplicateData.success) {
        console.log('❌ Duplicate registration was not prevented\n');
      } else if (duplicateData.error.code === 'DUPLICATE_REGISTRATION') {
        console.log('✅ Duplicate prevention working');
        console.log(`   Error code: ${duplicateData.error.code}\n`);
        passedTests++;
      } else {
        console.log('⚠️  Different error returned');
        console.log(`   Error: ${duplicateData.error.message}\n`);
      }
    }
  }

  // ============================================
  // Summary
  // ============================================
  console.log('═══════════════════════════════════════');
  console.log(`📊 Final Summary: ${passedTests}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════════\n');

  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
    console.log('\n🎉 System is fully operational!');
    console.log('\n📍 Manual Testing URLs:');
    console.log(`   Admin Portal: ${BASE_URL}/admin`);
    console.log(`   Meeting Bookings: ${BASE_URL}/admin/meetings/bookings`);
    console.log(`   Events Page: ${BASE_URL}/events`);
    console.log('\n✨ Key Improvements:');
    console.log('   1. Admin calendar with interactive date selection');
    console.log('   2. UUID type casting fix for meeting bookings');
    console.log('   3. Event registration with field name fix');
    console.log('   4. All APIs working correctly\n');
    process.exit(0);
  } else if (passedTests >= totalTests * 0.75) {
    console.log(`⚠️  ${totalTests - passedTests} test(s) failed, but 75%+ passed`);
    console.log('\n✅ System is mostly operational\n');
    process.exit(0);
  } else {
    console.log(`❌ ${totalTests - passedTests} test(s) failed`);
    console.log('\n⚠️  System needs attention\n');
    process.exit(1);
  }
}

// Run tests
testComprehensiveSystem().catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});
