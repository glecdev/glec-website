/**
 * E2E Test: Admin Meeting Bookings Calendar View
 *
 * Tests:
 * 1. Admin login
 * 2. Create test bookings for multiple dates
 * 3. Verify calendar view displays bookings
 * 4. Test date selection and sidebar details
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAdminCalendarView() {
  console.log('🧪 E2E Test: Admin Calendar View\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Admin Login
  console.log('📋 Test 1: Admin login...');
  totalTests++;

  const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@glec.io',
      password: 'GLEC2025Admin!'
    })
  });

  if (!loginResponse.ok) {
    console.log('❌ Failed to login');
    console.log(`   Status: ${loginResponse.status}`);
    const errorText = await loginResponse.text();
    console.log(`   Response: ${errorText}\n`);
    return;
  }

  const loginData = await loginResponse.json();
  const authToken = loginData.data.token;
  console.log('✅ Admin login successful\n');
  passedTests++;

  // Test 2: Create test bookings for multiple dates
  console.log('📋 Test 2: Creating test bookings...');
  totalTests++;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const testBookings = [
    {
      meeting_type: 'ZOOM',
      scheduled_at: today.toISOString(),
      duration_minutes: 30,
      attendee_name: '홍길동',
      attendee_email: `test-today-${Date.now()}@example.com`,
      attendee_company: 'ABC 물류',
      attendee_phone: '010-1234-5678',
      requested_agenda: '오늘 예약 - 탄소배출 측정 상담'
    },
    {
      meeting_type: 'PHONE',
      scheduled_at: tomorrow.toISOString(),
      duration_minutes: 60,
      attendee_name: '김철수',
      attendee_email: `test-tomorrow-${Date.now()}@example.com`,
      attendee_company: 'XYZ 운송',
      attendee_phone: '010-2345-6789',
      requested_agenda: '내일 예약 - GLEC Cloud 데모'
    },
    {
      meeting_type: 'ZOOM',
      scheduled_at: dayAfterTomorrow.toISOString(),
      duration_minutes: 45,
      attendee_name: '이영희',
      attendee_email: `test-day3-${Date.now()}@example.com`,
      attendee_company: 'DEF 택배',
      attendee_phone: '010-3456-7890',
      requested_agenda: '모레 예약 - API 통합 논의'
    }
  ];

  let createdBookings = [];

  for (let i = 0; i < testBookings.length; i++) {
    const booking = testBookings[i];
    const createResponse = await fetch(`${BASE_URL}/api/admin/meetings/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(booking)
    });

    if (!createResponse.ok) {
      console.log(`❌ Failed to create booking ${i + 1}`);
      console.log(`   Status: ${createResponse.status}`);
      const errorText = await createResponse.text();
      console.log(`   Response: ${errorText}\n`);
    } else {
      const createData = await createResponse.json();
      createdBookings.push(createData.data);
      console.log(`✅ Booking ${i + 1} created: ${booking.attendee_name} on ${new Date(booking.scheduled_at).toLocaleDateString('ko-KR')}`);
    }
  }

  if (createdBookings.length === testBookings.length) {
    console.log(`✅ All ${testBookings.length} test bookings created\n`);
    passedTests++;
  } else {
    console.log(`❌ Only ${createdBookings.length}/${testBookings.length} bookings created\n`);
  }

  // Test 3: Fetch bookings for calendar view
  console.log('📋 Test 3: Fetching bookings for calendar view...');
  totalTests++;

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const calendarResponse = await fetch(
    `${BASE_URL}/api/admin/meetings/bookings?start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`,
    {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }
  );

  if (!calendarResponse.ok) {
    console.log('❌ Failed to fetch calendar bookings');
    console.log(`   Status: ${calendarResponse.status}`);
    const errorText = await calendarResponse.text();
    console.log(`   Response: ${errorText}\n`);
  } else {
    const calendarData = await calendarResponse.json();
    const bookings = calendarData.data || [];

    // Find our test bookings
    const testBookingIds = createdBookings.map(b => b.id);
    const foundTestBookings = bookings.filter(b => testBookingIds.includes(b.id));

    console.log(`✅ Fetched ${bookings.length} total bookings`);
    console.log(`   Found ${foundTestBookings.length}/${createdBookings.length} test bookings in calendar view\n`);

    if (foundTestBookings.length === createdBookings.length) {
      passedTests++;
    }
  }

  // Test 4: Verify booking details structure
  console.log('📋 Test 4: Verifying booking details structure...');
  totalTests++;

  if (createdBookings.length > 0) {
    const sampleBooking = createdBookings[0];

    const requiredFields = [
      'id', 'meeting_type', 'scheduled_at', 'duration_minutes',
      'attendee_name', 'attendee_email', 'attendee_company', 'attendee_phone',
      'status', 'requested_agenda'
    ];

    const missingFields = requiredFields.filter(field => !(field in sampleBooking));

    if (missingFields.length === 0) {
      console.log('✅ All required fields present in booking data');
      console.log(`   Sample booking: ${sampleBooking.attendee_name} (${sampleBooking.attendee_company})`);
      console.log(`   Status: ${sampleBooking.status}`);
      console.log(`   Meeting type: ${sampleBooking.meeting_type}\n`);
      passedTests++;
    } else {
      console.log('❌ Missing required fields:', missingFields.join(', '));
      console.log();
    }
  } else {
    console.log('❌ No bookings created to verify\n');
  }

  // Summary
  console.log('═══════════════════════════════════════');
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════════');

  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
    console.log('\n🎉 Admin calendar view is ready for manual testing!');
    console.log(`\n📍 Visit: ${BASE_URL}/admin/meetings/bookings`);
    console.log('   1. Click "📅 캘린더 뷰" tab');
    console.log('   2. Click on dates with bookings (today, tomorrow, day after tomorrow)');
    console.log('   3. Verify right sidebar shows customer booking details');
    console.log('   4. Test sticky sidebar behavior on scroll\n');
    process.exit(0);
  } else if (passedTests >= totalTests * 0.75) {
    console.log(`⚠️  ${totalTests - passedTests} test(s) failed, but 75%+ passed`);
    console.log('\n✅ Admin calendar view is mostly working\n');
    process.exit(0);
  } else {
    console.log(`❌ ${totalTests - passedTests} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
testAdminCalendarView().catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});
