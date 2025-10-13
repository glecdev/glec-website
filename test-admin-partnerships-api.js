/**
 * Admin Partnerships API Test
 *
 * Tests all Admin Partnership API endpoints
 * Usage: BASE_URL=https://glec-website.vercel.app node test-admin-partnerships-api.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Admin login credentials (from prisma/seed.ts)
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

let authToken = '';

async function loginAsAdmin() {
  console.log('\n🔐 Logging in as admin...');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const data = await response.json();

    if (data.success && data.data?.token) {
      authToken = data.data.token;
      console.log('✅ Admin login successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Admin login failed:', data.error?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
    return false;
  }
}

async function testGetPartnerships() {
  console.log('\n📋 Test 1: GET /api/admin/partnerships (list all)');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/partnerships?per_page=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      console.log(`✅ GET partnerships: PASS (${data.data.length} items)`);
      console.log(`   Total: ${data.meta.total}`);
      console.log(`   Page: ${data.meta.page}/${data.meta.totalPages}`);

      if (data.data.length > 0) {
        const first = data.data[0];
        console.log(`   First: ${first.companyName} (${first.status})`);
        return first.id; // Return ID for detail test
      }
      return null;
    } else {
      console.log(`❌ GET partnerships: FAIL (${response.status})`);
      console.log(`   Error: ${JSON.stringify(data.error)}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ GET partnerships: ERROR - ${error.message}`);
    return null;
  }
}

async function testGetPartnershipDetail(id) {
  if (!id) {
    console.log('\n⏭️  Test 2: Skipped (no partnership ID available)');
    return false;
  }

  console.log(`\n📄 Test 2: GET /api/admin/partnerships/${id} (detail)`);

  try {
    const response = await fetch(`${BASE_URL}/api/admin/partnerships/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      console.log('✅ GET partnership detail: PASS');
      console.log(`   Company: ${data.data.companyName}`);
      console.log(`   Contact: ${data.data.contactName}`);
      console.log(`   Status: ${data.data.status}`);
      console.log(`   Type: ${data.data.partnershipType}`);
      return true;
    } else {
      console.log(`❌ GET partnership detail: FAIL (${response.status})`);
      console.log(`   Error: ${JSON.stringify(data.error)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ GET partnership detail: ERROR - ${error.message}`);
    return false;
  }
}

async function testUpdatePartnership(id) {
  if (!id) {
    console.log('\n⏭️  Test 3: Skipped (no partnership ID available)');
    return false;
  }

  console.log(`\n✏️  Test 3: PUT /api/admin/partnerships/${id} (update)`);

  try {
    const response = await fetch(`${BASE_URL}/api/admin/partnerships/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        adminNotes: 'Test note added via API test - ' + new Date().toISOString(),
      }),
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      console.log('✅ PUT partnership: PASS');
      console.log(`   Updated status: ${data.data.status}`);
      console.log(`   Admin notes: ${data.data.adminNotes?.substring(0, 50)}...`);
      return true;
    } else {
      console.log(`❌ PUT partnership: FAIL (${response.status})`);
      console.log(`   Error: ${JSON.stringify(data.error)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ PUT partnership: ERROR - ${error.message}`);
    return false;
  }
}

async function testFilterByStatus() {
  console.log('\n🔍 Test 4: GET /api/admin/partnerships?status=NEW (filter)');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/partnerships?status=NEW`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      console.log(`✅ Filter by status: PASS (${data.data.length} NEW items)`);
      return true;
    } else {
      console.log(`❌ Filter by status: FAIL (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Filter by status: ERROR - ${error.message}`);
    return false;
  }
}

async function testSearch() {
  console.log('\n🔎 Test 5: GET /api/admin/partnerships?search=test (search)');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/partnerships?search=test`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      console.log(`✅ Search: PASS (${data.data.length} results)`);
      return true;
    } else {
      console.log(`❌ Search: FAIL (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Search: ERROR - ${error.message}`);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🔒 Test 6: GET /api/admin/partnerships (no auth - should fail)');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/partnerships`);
    const data = await response.json();

    if (response.status === 401 && !data.success) {
      console.log('✅ Unauthorized access: PASS (correctly rejected)');
      return true;
    } else {
      console.log(`❌ Unauthorized access: FAIL (should be 401, got ${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Unauthorized access: ERROR - ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('═══════════════════════════════════════');
  console.log('🧪 Admin Partnerships API Test Suite');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('═══════════════════════════════════════');

  let passed = 0;
  let failed = 0;

  // Login first
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin authentication');
    process.exit(1);
  }

  // Test 1: List partnerships
  const partnershipId = await testGetPartnerships();
  if (partnershipId) passed++; else failed++;

  // Test 2: Get detail
  const detailSuccess = await testGetPartnershipDetail(partnershipId);
  if (detailSuccess) passed++; else failed++;

  // Test 3: Update partnership
  const updateSuccess = await testUpdatePartnership(partnershipId);
  if (updateSuccess) passed++; else failed++;

  // Test 4: Filter by status
  const filterSuccess = await testFilterByStatus();
  if (filterSuccess) passed++; else failed++;

  // Test 5: Search
  const searchSuccess = await testSearch();
  if (searchSuccess) passed++; else failed++;

  // Test 6: Unauthorized access
  const authTestSuccess = await testUnauthorizedAccess();
  if (authTestSuccess) passed++; else failed++;

  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════');

  if (failed === 0) {
    console.log('\n✅ All tests passed! Admin Partnerships API is working correctly.');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please review the errors above.`);
    process.exit(1);
  }
}

runAllTests();
