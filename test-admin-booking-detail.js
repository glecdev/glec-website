/**
 * Test: Admin Booking Detail Page
 * Verifies the newly implemented booking detail API and page
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

async function testAdminBookingDetail() {
  console.log('🧪 Testing Admin Booking Detail...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Fetch all bookings to get an ID
  console.log('📋 Test 1: Fetch booking list to get test ID');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/meetings/bookings?page=1&per_page=1`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to fetch bookings');
    }

    if (result.data.length === 0) {
      console.log('⚠️  No bookings available to test detail page');
      console.log('   Skipping detail page tests\n');
      return { passed, failed };
    }

    const testBookingId = result.data[0].id;
    console.log(`✅ Got test booking ID: ${testBookingId.slice(0, 8)}...\n`);
    passed++;

    // Test 2: Fetch booking detail API
    console.log(`📋 Test 2: GET /api/admin/meetings/bookings/${testBookingId.slice(0, 8)}...`);
    const detailResponse = await fetch(`${BASE_URL}/api/admin/meetings/bookings/${testBookingId}`);
    const detailResult = await detailResponse.json();

    if (!detailResponse.ok || !detailResult.success) {
      throw new Error(detailResult.error?.message || 'Failed to fetch booking detail');
    }

    console.log('✅ API Response Structure:');
    console.log(`   - Booking ID: ${detailResult.data.id.slice(0, 8)}...`);
    console.log(`   - Status: ${detailResult.data.booking_status}`);
    console.log(`   - Customer: ${detailResult.data.customer.company_name} (${detailResult.data.customer.contact_name})`);
    console.log(`   - Meeting: ${detailResult.data.meeting.title}`);
    console.log(`   - Meeting Time: ${new Date(detailResult.data.meeting.start_time).toLocaleString('ko-KR')}`);
    console.log(`   - Meeting Type: ${detailResult.data.meeting.meeting_type}`);
    console.log(`   - Meeting Location: ${detailResult.data.meeting.meeting_location}`);
    if (detailResult.data.requested_agenda) {
      console.log(`   - Agenda: ${detailResult.data.requested_agenda.slice(0, 50)}...`);
    }
    if (detailResult.data.library_item) {
      console.log(`   - Library Item: ${detailResult.data.library_item.title}`);
    }
    passed++;

    // Test 3: Verify required fields
    console.log('\n📋 Test 3: Verify all required fields present');
    const requiredFields = [
      'id',
      'booking_status',
      'created_at',
      'meeting',
      'customer'
    ];

    const missingFields = requiredFields.filter(field => !detailResult.data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('✅ All required fields present');
    passed++;

    // Test 4: Verify nested objects
    console.log('\n📋 Test 4: Verify nested objects structure');
    const meetingFields = ['id', 'title', 'start_time', 'end_time', 'duration_minutes', 'meeting_type', 'meeting_location'];
    const customerFields = ['lead_type', 'company_name', 'contact_name', 'email', 'phone'];

    const missingMeetingFields = meetingFields.filter(field => !detailResult.data.meeting[field]);
    const missingCustomerFields = customerFields.filter(field => !detailResult.data.customer[field]);

    if (missingMeetingFields.length > 0) {
      throw new Error(`Missing meeting fields: ${missingMeetingFields.join(', ')}`);
    }
    if (missingCustomerFields.length > 0) {
      throw new Error(`Missing customer fields: ${missingCustomerFields.join(', ')}`);
    }

    console.log('✅ Meeting object: All fields present');
    console.log('✅ Customer object: All fields present');
    passed++;

    // Test 5: Test 404 for non-existent booking
    console.log('\n📋 Test 5: Test 404 for non-existent booking');
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const notFoundResponse = await fetch(`${BASE_URL}/api/admin/meetings/bookings/${nonExistentId}`);

    if (notFoundResponse.status !== 404) {
      throw new Error(`Expected 404 status, got ${notFoundResponse.status}`);
    }

    const notFoundResult = await notFoundResponse.json();
    if (notFoundResult.success !== false || notFoundResult.error?.code !== 'NOT_FOUND') {
      throw new Error('Expected NOT_FOUND error code');
    }

    console.log('✅ 404 response correct');
    passed++;

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}\n`);
    failed++;
  }

  return { passed, failed };
}

// Run tests
(async () => {
  console.log('='.repeat(60));
  console.log('🔍 Admin Booking Detail Page Test Suite');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));
  console.log();

  const { passed, failed } = await testAdminBookingDetail();

  console.log('='.repeat(60));
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${failed === 0 ? '100%' : ((passed / (passed + failed)) * 100).toFixed(1) + '%'}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
})();
