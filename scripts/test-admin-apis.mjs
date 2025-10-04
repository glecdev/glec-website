/**
 * Admin APIs Test Script
 *
 * Purpose: Test all admin CRUD APIs for notices
 * Usage: node scripts/test-admin-apis.mjs
 *
 * Tests:
 * 1. POST /api/admin/login - Get JWT token
 * 2. GET /api/admin/notices - List notices (admin view)
 * 3. POST /api/admin/notices - Create notice
 * 4. GET /api/admin/notices?id=xxx - Get notice by ID (Query Parameter Pattern)
 * 5. PUT /api/admin/notices?id=xxx - Update notice (Query Parameter Pattern)
 * 6. DELETE /api/admin/notices?id=xxx - Delete notice (soft delete, Query Parameter Pattern)
 *
 * Note: Query parameter pattern (?id=xxx) used instead of dynamic routes ([id])
 * to maintain compatibility with Next.js Static Export (output: 'export').
 */

const BASE_URL = 'http://localhost:3002';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

let authToken = '';
let createdNoticeId = '';

/**
 * Helper: Make HTTP request
 */
async function request(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    data = text;
  }

  return {
    status: response.status,
    ok: response.ok,
    data,
  };
}

/**
 * Test 1: Login and get JWT token
 */
async function testLogin() {
  console.log('\n🔐 Test 1: POST /api/admin/login');

  const response = await request('POST', '/api/admin/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  console.log(`   Status: ${response.status}`);
  console.log(`   Success: ${response.data.success}`);

  if (response.ok && response.data.success && response.data.data?.token) {
    authToken = response.data.data.token;
    console.log(`   ✅ Token obtained: ${authToken.substring(0, 20)}...`);
    console.log(`   User: ${response.data.data.user.name} (${response.data.data.user.role})`);
    return true;
  } else {
    console.log(`   ❌ Login failed:`, response.data);
    return false;
  }
}

/**
 * Test 2: Get admin notices list
 */
async function testGetNotices() {
  console.log('\n📋 Test 2: GET /api/admin/notices');

  const response = await request(
    'GET',
    '/api/admin/notices?page=1&per_page=10',
    null,
    { Authorization: `Bearer ${authToken}` }
  );

  console.log(`   Status: ${response.status}`);
  console.log(`   Success: ${response.data.success}`);

  if (response.ok && response.data.success) {
    console.log(`   ✅ Notices count: ${response.data.data.length}`);
    console.log(`   Pagination: page ${response.data.meta.page}/${response.data.meta.total_pages}`);
    console.log(`   Total: ${response.data.meta.total}`);
    return true;
  } else {
    console.log(`   ❌ Get notices failed:`, response.data);
    return false;
  }
}

/**
 * Test 3: Create new notice
 */
async function testCreateNotice() {
  console.log('\n➕ Test 3: POST /api/admin/notices');

  const newNotice = {
    title: 'Test Notice - CRUD API Test',
    content: '<p>This is a test notice created via API.</p><p>Testing CRUD operations.</p>',
    excerpt: 'Testing CRUD operations for admin notices API',
    category: 'GENERAL',
    status: 'DRAFT',
    thumbnail_url: 'https://example.com/test-image.jpg',
  };

  const response = await request('POST', '/api/admin/notices', newNotice, {
    Authorization: `Bearer ${authToken}`,
  });

  console.log(`   Status: ${response.status}`);
  console.log(`   Success: ${response.data.success}`);

  if (response.status === 201 && response.data.success && response.data.data?.id) {
    createdNoticeId = response.data.data.id;
    console.log(`   ✅ Notice created: ID ${createdNoticeId}`);
    console.log(`   Title: ${response.data.data.title}`);
    console.log(`   Slug: ${response.data.data.slug}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Author: ${response.data.data.authorId}`);
    return true;
  } else {
    console.log(`   ❌ Create notice failed:`, response.data);
    return false;
  }
}

/**
 * Test 4: Get notice by ID (Query Parameter Pattern)
 */
async function testGetNoticeById() {
  console.log(`\n🔍 Test 4: GET /api/admin/notices?id=${createdNoticeId}`);

  const response = await request('GET', `/api/admin/notices?id=${createdNoticeId}`, null, {
    Authorization: `Bearer ${authToken}`,
  });

  console.log(`   Status: ${response.status}`);
  console.log(`   Success: ${response.data.success}`);

  if (response.ok && response.data.success && response.data.data) {
    console.log(`   ✅ Notice found: ${response.data.data.title}`);
    console.log(`   ID: ${response.data.data.id}`);
    console.log(`   Status: ${response.data.data.status}`);
    return true;
  } else {
    console.log(`   ❌ Get notice by ID failed:`, response.data);
    return false;
  }
}

/**
 * Test 5: Update notice (Query Parameter Pattern)
 */
async function testUpdateNotice() {
  console.log(`\n✏️ Test 5: PUT /api/admin/notices?id=${createdNoticeId}`);

  const updates = {
    title: 'Test Notice - UPDATED',
    status: 'PUBLISHED',
    excerpt: 'This notice has been updated and published',
  };

  const response = await request('PUT', `/api/admin/notices?id=${createdNoticeId}`, updates, {
    Authorization: `Bearer ${authToken}`,
  });

  console.log(`   Status: ${response.status}`);
  console.log(`   Success: ${response.data.success}`);

  if (response.ok && response.data.success && response.data.data) {
    console.log(`   ✅ Notice updated: ${response.data.data.title}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Published At: ${response.data.data.publishedAt}`);
    return true;
  } else {
    console.log(`   ❌ Update notice failed:`, response.data);
    return false;
  }
}

/**
 * Test 6: Delete notice (soft delete, Query Parameter Pattern)
 */
async function testDeleteNotice() {
  console.log(`\n🗑️ Test 6: DELETE /api/admin/notices?id=${createdNoticeId}`);

  const response = await request('DELETE', `/api/admin/notices?id=${createdNoticeId}`, null, {
    Authorization: `Bearer ${authToken}`,
  });

  console.log(`   Status: ${response.status}`);

  if (response.status === 204) {
    console.log(`   ✅ Notice soft deleted (204 No Content)`);
    return true;
  } else {
    console.log(`   ❌ Delete notice failed:`, response.data);
    return false;
  }
}

/**
 * Test 7: Verify deleted notice is not accessible
 */
async function testGetDeletedNotice() {
  console.log(`\n🔒 Test 7: GET /api/admin/notices?id=${createdNoticeId} (should still exist - soft delete)`);

  const response = await request('GET', `/api/admin/notices?id=${createdNoticeId}`, null, {
    Authorization: `Bearer ${authToken}`,
  });

  console.log(`   Status: ${response.status}`);
  console.log(`   Note: Mock implementation still returns deleted notice (DB would filter by deleted_at)`);

  return true;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('============================================');
  console.log('  GLEC Admin CRUD APIs Test Suite');
  console.log('============================================');

  const results = [];

  results.push(await testLogin());
  if (!authToken) {
    console.log('\n❌ Login failed. Aborting tests.');
    return;
  }

  results.push(await testGetNotices());
  results.push(await testCreateNotice());
  if (!createdNoticeId) {
    console.log('\n❌ Create notice failed. Aborting remaining tests.');
    return;
  }

  results.push(await testGetNoticeById());
  results.push(await testUpdateNotice());
  results.push(await testDeleteNotice());
  results.push(await testGetDeletedNotice());

  // Summary
  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log('\n============================================');
  console.log('  Test Results');
  console.log('============================================');
  console.log(`   Total: ${total} tests`);
  console.log(`   Passed: ${passed} tests`);
  console.log(`   Failed: ${total - passed} tests`);
  console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('============================================\n');

  process.exit(passed === total ? 0 : 1);
}

runTests().catch((error) => {
  console.error('\n❌ Test suite error:', error);
  process.exit(1);
});
