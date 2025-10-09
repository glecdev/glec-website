/**
 * Iteration 5: Admin GET Endpoints - Notices
 *
 * Tests GET /api/admin/notices with pagination, filtering, and search
 *
 * Requirements:
 * - GLEC-API-Specification.yaml (lines 1256-1315)
 * - FR-ADMIN-003: 공지사항 목록 조회
 * - Pagination support (page, per_page)
 * - Filtering by status, category
 * - Full-text search
 *
 * Success Criteria:
 * - All test scenarios pass (pagination, filtering, search)
 * - Response matches API spec schema
 * - Performance < 500ms
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

let adminToken = '';

/**
 * Helper: Login to get admin token
 */
async function login() {
  console.log('\n🔐 Logging in as admin...');
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Login failed: ${data.error?.message}`);
  }

  adminToken = data.data.token;
  console.log('✅ Login successful');
  console.log(`   Token: ${adminToken.substring(0, 20)}...`);
}

/**
 * Test 1: GET /api/admin/notices - Default pagination
 */
async function test1DefaultPagination() {
  console.log('\n📋 Test 1: GET /api/admin/notices - Default pagination');

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (!response.ok) {
    console.error('❌ Test 1 Failed');
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  // Verify response structure
  if (!data.success) {
    console.error('❌ Test 1 Failed: success = false');
    console.error('   Error:', data.error);
    return false;
  }

  if (!Array.isArray(data.data)) {
    console.error('❌ Test 1 Failed: data is not an array');
    return false;
  }

  if (!data.meta) {
    console.error('❌ Test 1 Failed: meta is missing');
    return false;
  }

  // Verify meta structure
  const { page, per_page, total, total_pages } = data.meta;
  if (page !== 1 || per_page !== 20) {
    console.error('❌ Test 1 Failed: incorrect default pagination');
    console.error(`   Expected page=1, per_page=20, got page=${page}, per_page=${per_page}`);
    return false;
  }

  console.log('✅ Test 1 Passed');
  console.log(`   Retrieved ${data.data.length} notices (total: ${total}, pages: ${total_pages})`);
  console.log(`   Meta:`, data.meta);

  return true;
}

/**
 * Test 2: GET /api/admin/notices?page=1&per_page=5 - Custom pagination
 */
async function test2CustomPagination() {
  console.log('\n📋 Test 2: GET /api/admin/notices - Custom pagination (page=1, per_page=5)');

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices?page=1&per_page=5`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (!response.ok) {
    console.error('❌ Test 2 Failed');
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  if (!data.success || !Array.isArray(data.data)) {
    console.error('❌ Test 2 Failed: Invalid response structure');
    return false;
  }

  const { page, per_page } = data.meta;
  if (page !== 1 || per_page !== 5) {
    console.error('❌ Test 2 Failed: incorrect pagination');
    console.error(`   Expected page=1, per_page=5, got page=${page}, per_page=${per_page}`);
    return false;
  }

  if (data.data.length > 5) {
    console.error('❌ Test 2 Failed: returned more than 5 items');
    return false;
  }

  console.log('✅ Test 2 Passed');
  console.log(`   Retrieved ${data.data.length} notices (max 5)`);
  console.log(`   Meta:`, data.meta);

  return true;
}

/**
 * Test 3: GET /api/admin/notices?status=DRAFT - Filter by status
 */
async function test3FilterByStatus() {
  console.log('\n📋 Test 3: GET /api/admin/notices?status=DRAFT');

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices?status=DRAFT`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (!response.ok) {
    console.error('❌ Test 3 Failed');
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  if (!data.success || !Array.isArray(data.data)) {
    console.error('❌ Test 3 Failed: Invalid response structure');
    return false;
  }

  // Verify all items have status=DRAFT
  const allDraft = data.data.every(item => item.status === 'DRAFT');
  if (!allDraft) {
    console.error('❌ Test 3 Failed: some items are not DRAFT');
    const nonDraft = data.data.filter(item => item.status !== 'DRAFT');
    console.error(`   Non-DRAFT items:`, nonDraft);
    return false;
  }

  console.log('✅ Test 3 Passed');
  console.log(`   Retrieved ${data.data.length} DRAFT notices`);

  return true;
}

/**
 * Test 4: GET /api/admin/notices?category=GENERAL - Filter by category
 */
async function test4FilterByCategory() {
  console.log('\n📋 Test 4: GET /api/admin/notices?category=GENERAL');

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices?category=GENERAL`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (!response.ok) {
    console.error('❌ Test 4 Failed');
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  if (!data.success || !Array.isArray(data.data)) {
    console.error('❌ Test 4 Failed: Invalid response structure');
    return false;
  }

  // Verify all items have category=GENERAL
  const allGeneral = data.data.every(item => item.category === 'GENERAL');
  if (!allGeneral) {
    console.error('❌ Test 4 Failed: some items are not GENERAL');
    const nonGeneral = data.data.filter(item => item.category !== 'GENERAL');
    console.error(`   Non-GENERAL items:`, nonGeneral);
    return false;
  }

  console.log('✅ Test 4 Passed');
  console.log(`   Retrieved ${data.data.length} GENERAL notices`);

  return true;
}

/**
 * Test 5: GET /api/admin/notices?search=Test - Full-text search
 */
async function test5Search() {
  console.log('\n📋 Test 5: GET /api/admin/notices?search=Test');

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices?search=Test`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (!response.ok) {
    console.error('❌ Test 5 Failed');
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  if (!data.success || !Array.isArray(data.data)) {
    console.error('❌ Test 5 Failed: Invalid response structure');
    return false;
  }

  // Verify all items contain "Test" in title or content (case-insensitive)
  const allMatch = data.data.every(item =>
    item.title.toLowerCase().includes('test') ||
    item.content.toLowerCase().includes('test')
  );
  if (!allMatch) {
    console.error('❌ Test 5 Failed: some items do not contain "Test"');
    const nonMatch = data.data.filter(item =>
      !item.title.toLowerCase().includes('test') &&
      !item.content.toLowerCase().includes('test')
    );
    console.error(`   Non-matching items:`, nonMatch.map(i => ({ id: i.id, title: i.title })));
    return false;
  }

  console.log('✅ Test 5 Passed');
  console.log(`   Retrieved ${data.data.length} notices matching "Test"`);
  if (data.data.length > 0) {
    console.log(`   Sample match:`, data.data[0].title);
  }

  return true;
}

/**
 * Test 6: GET /api/admin/notices?status=DRAFT&category=GENERAL - Combined filters
 */
async function test6CombinedFilters() {
  console.log('\n📋 Test 6: GET /api/admin/notices?status=DRAFT&category=GENERAL');

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices?status=DRAFT&category=GENERAL`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (!response.ok) {
    console.error('❌ Test 6 Failed');
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  if (!data.success || !Array.isArray(data.data)) {
    console.error('❌ Test 6 Failed: Invalid response structure');
    return false;
  }

  // Verify all items match both filters
  const allMatch = data.data.every(item =>
    item.status === 'DRAFT' && item.category === 'GENERAL'
  );
  if (!allMatch) {
    console.error('❌ Test 6 Failed: some items do not match both filters');
    const nonMatch = data.data.filter(item =>
      item.status !== 'DRAFT' || item.category !== 'GENERAL'
    );
    console.error(`   Non-matching items:`, nonMatch);
    return false;
  }

  console.log('✅ Test 6 Passed');
  console.log(`   Retrieved ${data.data.length} DRAFT GENERAL notices`);

  return true;
}

/**
 * Test 7: GET /api/admin/notices?id=xxx - Single notice by ID
 */
async function test7GetSingleNotice() {
  console.log('\n📋 Test 7: GET /api/admin/notices?id=xxx - Single notice');

  // First, get the ID of an existing notice
  const listResponse = await fetch(`${BASE_URL}/api/admin/notices?per_page=1`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });

  const listData = await listResponse.json();
  if (!listData.success || listData.data.length === 0) {
    console.log('⚠️ Test 7 Skipped: No notices found');
    return true;
  }

  const noticeId = listData.data[0].id;
  console.log(`   Testing with notice ID: ${noticeId}`);

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices?id=${noticeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (!response.ok) {
    console.error('❌ Test 7 Failed');
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  if (!data.success || !data.data) {
    console.error('❌ Test 7 Failed: Invalid response structure');
    return false;
  }

  // Verify it's a single object, not an array
  if (Array.isArray(data.data)) {
    console.error('❌ Test 7 Failed: data should be object, not array');
    return false;
  }

  // Verify ID matches
  if (data.data.id !== noticeId) {
    console.error('❌ Test 7 Failed: ID mismatch');
    console.error(`   Expected: ${noticeId}, got: ${data.data.id}`);
    return false;
  }

  console.log('✅ Test 7 Passed');
  console.log(`   Retrieved notice: ${data.data.title}`);

  return true;
}

/**
 * Test 8: GET /api/admin/notices without auth - Should fail 401
 */
async function test8NoAuth() {
  console.log('\n📋 Test 8: GET /api/admin/notices without auth - Should fail 401');

  const start = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const elapsed = Date.now() - start;

  const data = await response.json();

  console.log(`   Status: ${response.status}`);
  console.log(`   Response time: ${elapsed}ms`);

  if (response.status !== 401) {
    console.error('❌ Test 8 Failed: Expected 401, got', response.status);
    console.error('   Response:', data);
    return false;
  }

  if (data.success !== false) {
    console.error('❌ Test 8 Failed: success should be false');
    return false;
  }

  console.log('✅ Test 8 Passed');
  console.log(`   Correctly rejected unauthorized request`);

  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('Iteration 5: Admin GET Endpoints - Notices');
  console.log('='.repeat(60));

  const timestamp = new Date().toISOString();
  console.log(`Test started: ${timestamp}`);

  try {
    await login();

    const tests = [
      { name: 'Test 1: Default Pagination', fn: test1DefaultPagination },
      { name: 'Test 2: Custom Pagination', fn: test2CustomPagination },
      { name: 'Test 3: Filter by Status', fn: test3FilterByStatus },
      { name: 'Test 4: Filter by Category', fn: test4FilterByCategory },
      { name: 'Test 5: Search', fn: test5Search },
      { name: 'Test 6: Combined Filters', fn: test6CombinedFilters },
      { name: 'Test 7: Get Single Notice', fn: test7GetSingleNotice },
      { name: 'Test 8: No Auth', fn: test8NoAuth },
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
      console.log('\n🎉 ALL TESTS PASSED! Notices GET API is working correctly.');
      process.exit(0);
    } else {
      console.log(`\n⚠️ ${total - passed} test(s) failed. Please review the output above.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
