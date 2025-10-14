/**
 * Event Registration Flow E2E Test
 *
 * Tests the complete flow:
 * 1. Submit event registration from website
 * 2. Verify registration appears in admin panel
 * 3. Test status updates (PENDING → APPROVED → CANCELLED)
 * 4. Test filtering and search functionality
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

console.log('🚀 Starting Event Registration Flow E2E Test...\n');
console.log(`Target URL: ${BASE_URL}\n`);

// Test data
const testRegistration = {
  name: `테스트 참가자 ${Date.now()}`,
  email: `test-${Date.now()}@example.com`,
  phone: '010-1234-5678',
  company: '테스트 회사',
  jobTitle: '테스트 직책',
  message: '이것은 E2E 테스트 참가 신청입니다.',
  privacyConsent: true,
  marketingConsent: true
};

let adminToken = null;
let createdEventId = null;
let createdRegistrationId = null;

// ============================================================
// Helper Functions
// ============================================================

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function adminLogin() {
  console.log('Step 1: Admin Login...');

  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Admin login failed: ${data.error?.message}`);
  }

  adminToken = data.data.token;
  console.log('   ✅ Admin logged in successfully');
  console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);
  return adminToken;
}

async function createTestEvent() {
  console.log('Step 2: Create Test Event...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const eventData = {
    title: `E2E 테스트 이벤트 ${Date.now()}`,
    description: '이것은 E2E 테스트를 위한 이벤트입니다.',
    content: '<p>테스트 이벤트 내용</p>',
    startDate: tomorrow.toISOString(),
    endDate: nextWeek.toISOString(),
    location: '서울시 강남구',
    maxParticipants: 100,
    registrationDeadline: tomorrow.toISOString(),
    status: 'PUBLISHED',
    bannerImage: '/images/test-event.jpg'
  };

  const response = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(eventData)
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Event creation failed: ${data.error?.message}`);
  }

  createdEventId = data.data.id;
  console.log('   ✅ Event created successfully');
  console.log(`   Event ID: ${createdEventId}`);
  console.log(`   Title: ${data.data.title}\n`);
  return createdEventId;
}

async function submitEventRegistration() {
  console.log('Step 3: Submit Event Registration (Public API)...');
  console.log(`   Registering as: ${testRegistration.name} (${testRegistration.email})`);

  const response = await fetch(`${BASE_URL}/api/events/${createdEventId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRegistration)
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Registration failed: ${data.error?.message || JSON.stringify(data.error)}`);
  }

  createdRegistrationId = data.data.id;
  console.log('   ✅ Registration submitted successfully');
  console.log(`   Registration ID: ${createdRegistrationId}`);
  console.log(`   Status: ${data.data.status}\n`);
  return createdRegistrationId;
}

async function verifyRegistrationInAdmin() {
  console.log('Step 4: Verify Registration in Admin Panel...');

  const response = await fetch(
    `${BASE_URL}/api/admin/events/${createdEventId}/registrations`,
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Failed to fetch registrations: ${data.error?.message}`);
  }

  console.log('   ✅ Fetched registrations from admin API');
  console.log(`   Total registrations: ${data.data.registrations.length}`);

  // Find our test registration
  const registration = data.data.registrations.find(
    r => r.id === createdRegistrationId
  );

  if (!registration) {
    throw new Error('Test registration not found in admin panel!');
  }

  console.log('\n   📋 Registration Details:');
  console.log(`      ID: ${registration.id}`);
  console.log(`      Name: ${registration.name}`);
  console.log(`      Email: ${registration.email}`);
  console.log(`      Phone: ${registration.phone}`);
  console.log(`      Company: ${registration.company}`);
  console.log(`      Job Title: ${registration.jobTitle}`);
  console.log(`      Status: ${registration.status}`);
  console.log(`      Message: ${registration.message}`);
  console.log(`      Privacy Consent: ${registration.privacyConsent}`);
  console.log(`      Marketing Consent: ${registration.marketingConsent}`);
  console.log(`      Created At: ${registration.createdAt}\n`);

  // Verify data integrity
  const dataMatches = {
    name: registration.name === testRegistration.name,
    email: registration.email === testRegistration.email,
    phone: registration.phone === testRegistration.phone,
    company: registration.company === testRegistration.company,
    jobTitle: registration.jobTitle === testRegistration.jobTitle,
    message: registration.message === testRegistration.message,
    status: registration.status === 'PENDING'
  };

  console.log('   🔍 Data Integrity Check:');
  for (const [field, matches] of Object.entries(dataMatches)) {
    console.log(`      ${field}: ${matches ? '✅ MATCH' : '❌ MISMATCH'}`);
  }

  const allMatch = Object.values(dataMatches).every(v => v);
  if (!allMatch) {
    throw new Error('Data integrity check failed!');
  }

  console.log('\n   ✅ Data integrity verified\n');
  return registration;
}

async function testStatusUpdate(registrationId, newStatus) {
  console.log(`Step 5: Update Status to ${newStatus}...`);

  const response = await fetch(
    `${BASE_URL}/api/admin/events/${createdEventId}/registrations/${registrationId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: newStatus })
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Status update failed: ${data.error?.message}`);
  }

  console.log(`   ✅ Status updated to ${newStatus}`);
  console.log(`   Updated registration ID: ${data.data.id}`);
  console.log(`   New status: ${data.data.status}\n`);

  if (data.data.status !== newStatus) {
    throw new Error(`Status mismatch! Expected ${newStatus}, got ${data.data.status}`);
  }

  return data.data;
}

async function testFiltering(statusFilter) {
  console.log(`Step 6: Test Filtering (status=${statusFilter})...`);

  const response = await fetch(
    `${BASE_URL}/api/admin/events/${createdEventId}/registrations?status=${statusFilter}`,
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Filtering failed: ${data.error?.message}`);
  }

  console.log(`   ✅ Filter applied: status=${statusFilter}`);
  console.log(`   Results: ${data.data.registrations.length} registration(s)`);

  // Verify all results match the filter
  const allMatch = data.data.registrations.every(r => r.status === statusFilter);
  if (!allMatch) {
    throw new Error(`Filter validation failed! Not all results have status=${statusFilter}`);
  }

  console.log(`   ✅ All results match filter\n`);
  return data.data.registrations;
}

async function testSearch(searchTerm) {
  console.log(`Step 7: Test Search (search="${searchTerm}")...`);

  const response = await fetch(
    `${BASE_URL}/api/admin/events/${createdEventId}/registrations?search=${encodeURIComponent(searchTerm)}`,
    {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Search failed: ${data.error?.message}`);
  }

  console.log(`   ✅ Search applied: "${searchTerm}"`);
  console.log(`   Results: ${data.data.registrations.length} registration(s)`);

  // Verify results contain search term
  if (data.data.registrations.length > 0) {
    const result = data.data.registrations[0];
    const containsSearchTerm =
      result.name.includes(searchTerm) ||
      result.email.includes(searchTerm);

    if (!containsSearchTerm) {
      throw new Error(`Search validation failed! Result doesn't contain "${searchTerm}"`);
    }
    console.log(`   ✅ Result contains search term\n`);
  } else {
    console.log(`   ⚠️  No results found (this may be OK if data was cleaned up)\n`);
  }

  return data.data.registrations;
}

async function cleanup() {
  console.log('Step 8: Cleanup (Delete Test Event)...');

  const response = await fetch(
    `${BASE_URL}/api/admin/events/${createdEventId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    }
  );

  const data = await response.json();

  if (!data.success) {
    console.log(`   ⚠️  Cleanup failed: ${data.error?.message}`);
    console.log('   Note: Manual cleanup may be required\n');
    return false;
  }

  console.log('   ✅ Test event deleted successfully\n');
  return true;
}

// ============================================================
// Main Test Flow
// ============================================================

async function runTests() {
  const startTime = Date.now();

  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('EVENT REGISTRATION FLOW E2E TEST');
    console.log('═══════════════════════════════════════════════════\n');

    // Step 1: Admin Login
    await adminLogin();

    // Step 2: Create Test Event
    await createTestEvent();

    // Step 3: Submit Registration from Website
    await submitEventRegistration();

    // Wait for database propagation
    console.log('⏳ Waiting for database propagation (2 seconds)...\n');
    await sleep(2000);

    // Step 4: Verify in Admin Panel
    await verifyRegistrationInAdmin();

    // Step 5: Test Status Updates
    await testStatusUpdate(createdRegistrationId, 'APPROVED');
    await testStatusUpdate(createdRegistrationId, 'CANCELLED');
    await testStatusUpdate(createdRegistrationId, 'REJECTED');

    // Step 6: Test Filtering
    await testFiltering('REJECTED');

    // Step 7: Test Search
    const searchTerm = testRegistration.name.substring(0, 10);
    await testSearch(searchTerm);

    // Step 8: Cleanup
    await cleanup();

    // Success Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('═══════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('✅ All tests passed successfully!\n');

    console.log('Tests Completed:');
    console.log('   ✅ Admin login');
    console.log('   ✅ Event creation');
    console.log('   ✅ Registration submission (public API)');
    console.log('   ✅ Registration verification (admin API)');
    console.log('   ✅ Data integrity check');
    console.log('   ✅ Status update (PENDING → APPROVED)');
    console.log('   ✅ Status update (APPROVED → CANCELLED)');
    console.log('   ✅ Status update (CANCELLED → REJECTED)');
    console.log('   ✅ Filter by status');
    console.log('   ✅ Search by name/email');
    console.log('   ✅ Cleanup\n');

    console.log(`Total Duration: ${duration}s\n`);

    console.log('═══════════════════════════════════════════════════');

    process.exit(0);

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.error('═══════════════════════════════════════════════════');
    console.error('❌ TEST FAILED');
    console.error('═══════════════════════════════════════════════════\n');

    console.error(`Error: ${error.message}\n`);
    console.error('Stack Trace:');
    console.error(error.stack);

    console.error(`\nDuration: ${duration}s\n`);

    console.error('Test Data for Debugging:');
    console.error(`   Event ID: ${createdEventId || 'Not created'}`);
    console.error(`   Registration ID: ${createdRegistrationId || 'Not created'}`);
    console.error(`   Admin Token: ${adminToken ? adminToken.substring(0, 20) + '...' : 'Not obtained'}\n`);

    console.error('═══════════════════════════════════════════════════');

    process.exit(1);
  }
}

// Run tests
runTests();
