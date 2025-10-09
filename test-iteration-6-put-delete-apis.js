/**
 * Iteration 6: Admin PUT/DELETE Endpoints
 *
 * Tests PUT/DELETE endpoints for all implemented admin APIs:
 * 1. Notices PUT/DELETE
 * 2. Press PUT/DELETE
 * 3. Popups PUT/DELETE
 * 4. Events PUT/DELETE
 *
 * Success Criteria:
 * - PUT: Update existing items successfully
 * - DELETE: Soft delete (deleted_at set)
 * - GET after DELETE: Item not visible
 * - Auth required (401 without token)
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

let adminToken = '';
const createdIds = {}; // Store IDs for cleanup

async function login() {
  console.log('\n🔐 Logging in as admin...');
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await response.json();
  adminToken = data.data.token;
  console.log('✅ Login successful');
}

// ============================================================
// NOTICES PUT/DELETE TESTS
// ============================================================

async function testNoticesPut() {
  console.log('\n📋 Test: PUT /api/admin/notices?id=xxx');

  // Step 1: Create a notice to update
  const createRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Notice for PUT test',
      content: '<p>Original content</p>',
      category: 'GENERAL',
      status: 'DRAFT',
    }),
  });
  const createData = await createRes.json();
  if (!createData.success) {
    console.error('❌ Failed to create notice for PUT test');
    return false;
  }
  const noticeId = createData.data.id;
  createdIds.notice = noticeId;
  console.log(`   Created notice: ${noticeId}`);

  // Step 2: Update the notice
  const updateRes = await fetch(`${BASE_URL}/api/admin/notices?id=${noticeId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Notice for PUT test - UPDATED',
      content: '<p>Updated content</p>',
      status: 'PUBLISHED',
    }),
  });
  const updateData = await updateRes.json();

  if (!updateRes.ok || !updateData.success) {
    console.error('❌ Notices PUT Failed');
    console.error('   Response:', updateData);
    return false;
  }

  // Step 3: Verify updates
  if (updateData.data.title !== 'Notice for PUT test - UPDATED') {
    console.error('❌ Title not updated');
    return false;
  }
  if (updateData.data.status !== 'PUBLISHED') {
    console.error('❌ Status not updated');
    return false;
  }
  if (!updateData.data.publishedAt) {
    console.error('❌ publishedAt not set after status change to PUBLISHED');
    return false;
  }

  console.log('✅ Notices PUT Passed');
  console.log(`   Updated: ${updateData.data.title}`);
  console.log(`   Status: ${updateData.data.status}, publishedAt: ${updateData.data.publishedAt}`);
  return true;
}

async function testNoticesDelete() {
  console.log('\n📋 Test: DELETE /api/admin/notices?id=xxx');

  const noticeId = createdIds.notice;
  if (!noticeId) {
    console.error('❌ No notice ID to delete');
    return false;
  }

  // Step 1: Delete the notice
  const deleteRes = await fetch(`${BASE_URL}/api/admin/notices?id=${noticeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const deleteData = await deleteRes.json();

  if (!deleteRes.ok || !deleteData.success) {
    console.error('❌ Notices DELETE Failed');
    console.error('   Response:', deleteData);
    return false;
  }

  // Step 2: Verify it's gone (GET should not return it)
  const getRes = await fetch(`${BASE_URL}/api/admin/notices?id=${noticeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const getData = await getRes.json();

  if (getRes.status !== 404) {
    console.error('❌ Deleted notice still accessible');
    console.error(`   Expected 404, got ${getRes.status}`);
    return false;
  }

  console.log('✅ Notices DELETE Passed');
  console.log(`   Deleted: ${noticeId}, GET returns 404`);
  return true;
}

// ============================================================
// PRESS PUT/DELETE TESTS
// ============================================================

async function testPressPut() {
  console.log('\n📰 Test: PUT /api/admin/press?id=xxx');

  // Create
  const createRes = await fetch(`${BASE_URL}/api/admin/press`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Press for PUT test',
      content: '<p>Original press content</p>',
      status: 'DRAFT',
    }),
  });
  const createData = await createRes.json();
  if (!createData.success) {
    console.error('❌ Failed to create press');
    return false;
  }
  const pressId = createData.data.id;
  createdIds.press = pressId;

  // Update
  const updateRes = await fetch(`${BASE_URL}/api/admin/press?id=${pressId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Press for PUT test - UPDATED',
      mediaOutlet: 'TechCrunch',
    }),
  });
  const updateData = await updateRes.json();

  if (!updateRes.ok || !updateData.success) {
    console.error('❌ Press PUT Failed');
    console.error('   Response:', updateData);
    return false;
  }

  if (updateData.data.title !== 'Press for PUT test - UPDATED') {
    console.error('❌ Title not updated');
    return false;
  }

  console.log('✅ Press PUT Passed');
  return true;
}

async function testPressDelete() {
  console.log('\n📰 Test: DELETE /api/admin/press?id=xxx');

  const pressId = createdIds.press;
  if (!pressId) {
    console.error('❌ No press ID');
    return false;
  }

  const deleteRes = await fetch(`${BASE_URL}/api/admin/press?id=${pressId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const deleteData = await deleteRes.json();

  if (!deleteRes.ok || !deleteData.success) {
    console.error('❌ Press DELETE Failed');
    return false;
  }

  console.log('✅ Press DELETE Passed');
  return true;
}

// ============================================================
// POPUPS PUT/DELETE TESTS
// ============================================================

async function testPopupsPut() {
  console.log('\n🪟 Test: PUT /api/admin/popups?id=xxx');

  // Create
  const createRes = await fetch(`${BASE_URL}/api/admin/popups`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Popup for PUT test',
      content: 'Original popup',
      displayType: 'modal',
      isActive: false,
    }),
  });
  const createData = await createRes.json();
  if (!createData.success) {
    console.error('❌ Failed to create popup');
    return false;
  }
  const popupId = createData.data.id;
  createdIds.popup = popupId;

  // Update
  const updateRes = await fetch(`${BASE_URL}/api/admin/popups?id=${popupId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Popup for PUT test - UPDATED',
      isActive: true,
    }),
  });
  const updateData = await updateRes.json();

  if (!updateRes.ok || !updateData.success) {
    console.error('❌ Popups PUT Failed');
    console.error('   Response:', updateData);
    return false;
  }

  if (updateData.data.title !== 'Popup for PUT test - UPDATED') {
    console.error('❌ Title not updated');
    return false;
  }
  if (updateData.data.isActive !== true) {
    console.error('❌ isActive not updated');
    return false;
  }

  console.log('✅ Popups PUT Passed');
  return true;
}

async function testPopupsDelete() {
  console.log('\n🪟 Test: DELETE /api/admin/popups?id=xxx');

  const popupId = createdIds.popup;
  if (!popupId) {
    console.error('❌ No popup ID');
    return false;
  }

  const deleteRes = await fetch(`${BASE_URL}/api/admin/popups?id=${popupId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const deleteData = await deleteRes.json();

  if (!deleteRes.ok || !deleteData.success) {
    console.error('❌ Popups DELETE Failed');
    return false;
  }

  console.log('✅ Popups DELETE Passed');
  return true;
}

// ============================================================
// EVENTS PUT/DELETE TESTS
// ============================================================

async function testEventsPut() {
  console.log('\n📅 Test: PUT /api/admin/events?id=xxx');

  // Create
  const createRes = await fetch(`${BASE_URL}/api/admin/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Event for PUT test',
      slug: `event-put-test-${Date.now()}`,
      description: 'Original event',
      status: 'DRAFT',
      start_date: '2025-12-01T10:00:00Z',
      end_date: '2025-12-01T12:00:00Z',
      location: 'Online',
    }),
  });
  const createData = await createRes.json();
  if (!createData.success) {
    console.error('❌ Failed to create event');
    console.error('   Response:', createData);
    return false;
  }
  const eventId = createData.data.id;
  createdIds.event = eventId;

  // Update
  const updateRes = await fetch(`${BASE_URL}/api/admin/events?id=${eventId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Event for PUT test - UPDATED',
      max_participants: 200,
    }),
  });
  const updateData = await updateRes.json();

  if (!updateRes.ok || !updateData.success) {
    console.error('❌ Events PUT Failed');
    console.error('   Response:', updateData);
    return false;
  }

  if (updateData.data.title !== 'Event for PUT test - UPDATED') {
    console.error('❌ Title not updated');
    return false;
  }

  console.log('✅ Events PUT Passed');
  return true;
}

async function testEventsDelete() {
  console.log('\n📅 Test: DELETE /api/admin/events?id=xxx');

  const eventId = createdIds.event;
  if (!eventId) {
    console.error('❌ No event ID');
    return false;
  }

  const deleteRes = await fetch(`${BASE_URL}/api/admin/events?id=${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  const deleteData = await deleteRes.json();

  if (!deleteRes.ok || !deleteData.success) {
    console.error('❌ Events DELETE Failed');
    return false;
  }

  console.log('✅ Events DELETE Passed');
  return true;
}

// ============================================================
// AUTH TESTS
// ============================================================

async function testPutWithoutAuth() {
  console.log('\n🔒 Test: PUT without auth - Should fail 401');

  const response = await fetch(`${BASE_URL}/api/admin/notices?id=dummy`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test' }),
  });

  if (response.status !== 401) {
    console.error(`❌ Expected 401, got ${response.status}`);
    return false;
  }

  console.log('✅ PUT Auth test passed');
  return true;
}

async function testDeleteWithoutAuth() {
  console.log('\n🔒 Test: DELETE without auth - Should fail 401');

  const response = await fetch(`${BASE_URL}/api/admin/notices?id=dummy`, {
    method: 'DELETE',
  });

  if (response.status !== 401) {
    console.error(`❌ Expected 401, got ${response.status}`);
    return false;
  }

  console.log('✅ DELETE Auth test passed');
  return true;
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================

async function runTests() {
  console.log('='.repeat(60));
  console.log('Iteration 6: Admin PUT/DELETE Endpoints');
  console.log('='.repeat(60));

  try {
    await login();

    const tests = [
      { name: 'Notices PUT', fn: testNoticesPut },
      { name: 'Notices DELETE', fn: testNoticesDelete },
      { name: 'Press PUT', fn: testPressPut },
      { name: 'Press DELETE', fn: testPressDelete },
      { name: 'Popups PUT', fn: testPopupsPut },
      { name: 'Popups DELETE', fn: testPopupsDelete },
      { name: 'Events PUT', fn: testEventsPut },
      { name: 'Events DELETE', fn: testEventsDelete },
      { name: 'PUT Without Auth', fn: testPutWithoutAuth },
      { name: 'DELETE Without Auth', fn: testDeleteWithoutAuth },
    ];

    const results = [];
    for (const test of tests) {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    results.forEach(({ name, passed }) => {
      console.log(`${passed ? '✅' : '❌'} ${name}`);
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`TOTAL: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log('='.repeat(60));

    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! PUT/DELETE APIs working correctly.');
      process.exit(0);
    } else {
      console.log(`\n⚠️ ${total - passed} test(s) failed.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
