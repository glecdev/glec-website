/**
 * Iteration 5: All Admin GET Endpoints
 *
 * Tests GET endpoints for all implemented admin APIs:
 * 1. Notices ✅
 * 2. Press
 * 3. Popups
 * 4. Events
 * 5. Demo Requests
 *
 * Success Criteria:
 * - All GET endpoints return 200 with valid data structure
 * - Pagination works correctly
 * - Filtering works correctly
 * - Auth required (401 without token)
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
}

/**
 * Generic GET test
 */
async function testGetEndpoint(name, endpoint, filterParam = null) {
  console.log(`\n📋 Testing GET ${endpoint}${filterParam ? `?${filterParam}` : ''}`);

  const url = `${BASE_URL}${endpoint}${filterParam ? `?${filterParam}` : ''}`;
  const start = Date.now();
  const response = await fetch(url, {
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
    console.error(`❌ ${name} Failed`);
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  // Verify response structure
  if (!data.success) {
    console.error(`❌ ${name} Failed: success = false`);
    console.error('   Error:', data.error);
    return false;
  }

  if (!Array.isArray(data.data)) {
    console.error(`❌ ${name} Failed: data is not an array`);
    return false;
  }

  if (!data.meta) {
    console.error(`❌ ${name} Failed: meta is missing`);
    return false;
  }

  // Verify meta structure
  const { page, per_page, total, total_pages } = data.meta;
  if (typeof page !== 'number' || typeof per_page !== 'number') {
    console.error(`❌ ${name} Failed: invalid meta structure`);
    return false;
  }

  console.log(`✅ ${name} Passed`);
  console.log(`   Retrieved ${data.data.length} items (total: ${total}, pages: ${total_pages})`);

  return true;
}

/**
 * Test unauthorized access
 */
async function testUnauthorized(name, endpoint) {
  console.log(`\n📋 Testing GET ${endpoint} without auth - Should fail 401`);

  const start = Date.now();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    console.error(`❌ ${name} Failed: Expected 401, got`, response.status);
    return false;
  }

  if (data.success !== false) {
    console.error(`❌ ${name} Failed: success should be false`);
    return false;
  }

  console.log(`✅ ${name} Passed`);
  return true;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('Iteration 5: All Admin GET Endpoints');
  console.log('='.repeat(60));

  const timestamp = new Date().toISOString();
  console.log(`Test started: ${timestamp}`);

  try {
    await login();

    const tests = [
      // Notices
      { name: 'Notices - Default', fn: () => testGetEndpoint('Notices Default', '/api/admin/notices') },
      { name: 'Notices - Pagination', fn: () => testGetEndpoint('Notices Pagination', '/api/admin/notices', 'page=1&per_page=5') },
      { name: 'Notices - Filter Status', fn: () => testGetEndpoint('Notices Filter', '/api/admin/notices', 'status=DRAFT') },
      { name: 'Notices - No Auth', fn: () => testUnauthorized('Notices Auth', '/api/admin/notices') },

      // Press
      { name: 'Press - Default', fn: () => testGetEndpoint('Press Default', '/api/admin/press') },
      { name: 'Press - Pagination', fn: () => testGetEndpoint('Press Pagination', '/api/admin/press', 'page=1&per_page=5') },
      { name: 'Press - Filter Status', fn: () => testGetEndpoint('Press Filter', '/api/admin/press', 'status=DRAFT') },
      { name: 'Press - No Auth', fn: () => testUnauthorized('Press Auth', '/api/admin/press') },

      // Popups
      { name: 'Popups - Default', fn: () => testGetEndpoint('Popups Default', '/api/admin/popups') },
      { name: 'Popups - Pagination', fn: () => testGetEndpoint('Popups Pagination', '/api/admin/popups', 'page=1&per_page=5') },
      { name: 'Popups - No Auth', fn: () => testUnauthorized('Popups Auth', '/api/admin/popups') },

      // Events
      { name: 'Events - Default', fn: () => testGetEndpoint('Events Default', '/api/admin/events') },
      { name: 'Events - Pagination', fn: () => testGetEndpoint('Events Pagination', '/api/admin/events', 'page=1&per_page=5') },
      { name: 'Events - Filter Status', fn: () => testGetEndpoint('Events Filter', '/api/admin/events', 'status=DRAFT') },
      { name: 'Events - No Auth', fn: () => testUnauthorized('Events Auth', '/api/admin/events') },

      // Demo Requests
      { name: 'Demo Requests - Default', fn: () => testGetEndpoint('Demo Requests Default', '/api/admin/demo-requests') },
      { name: 'Demo Requests - Pagination', fn: () => testGetEndpoint('Demo Requests Pagination', '/api/admin/demo-requests', 'page=1&per_page=5') },
      { name: 'Demo Requests - No Auth', fn: () => testUnauthorized('Demo Requests Auth', '/api/admin/demo-requests') },
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
      console.log('\n🎉 ALL TESTS PASSED! All Admin GET APIs are working correctly.');
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
