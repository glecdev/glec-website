/**
 * Test Audit Logs API Fix
 * Issue: "Invalid query parameters" error
 * Fix: Changed null to undefined for missing query params
 */

const BASE_URL = 'http://localhost:3001';

async function testAuditLogsAPI() {
  console.log('============================================================');
  console.log('Testing Audit Logs API Fix');
  console.log('============================================================\n');

  // 1. Login
  console.log('🔐 Logging in...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@glec.io', password: 'admin123!' }),
  });

  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('❌ Login failed:', loginData.error);
    process.exit(1);
  }

  const token = loginData.data.token;
  const userRole = loginData.data.user.role;
  console.log(`✅ Login successful (Role: ${userRole})\n`);

  // 2. Test without filters (default ALL)
  console.log('📋 Test 1: GET /api/admin/logs (no filters)');
  const test1Res = await fetch(`${BASE_URL}/api/admin/logs?page=1&per_page=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const test1Data = await test1Res.json();
  console.log(`   Status: ${test1Res.status}`);
  console.log(`   Success: ${test1Data.success}`);

  if (!test1Data.success) {
    console.error(`   ❌ Error: ${test1Data.error.message}`);
    if (test1Data.error.details) {
      console.error(`   Details:`, test1Data.error.details);
    }
  } else {
    console.log(`   ✅ Logs count: ${test1Data.data.length}`);
    console.log(`   Total: ${test1Data.meta.total_count}`);
  }
  console.log();

  // 3. Test with action filter
  console.log('📋 Test 2: GET /api/admin/logs?action=LOGIN');
  const test2Res = await fetch(`${BASE_URL}/api/admin/logs?action=LOGIN&page=1&per_page=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const test2Data = await test2Res.json();
  console.log(`   Status: ${test2Res.status}`);
  console.log(`   Success: ${test2Data.success}`);

  if (!test2Data.success) {
    console.error(`   ❌ Error: ${test2Data.error.message}`);
  } else {
    console.log(`   ✅ LOGIN logs: ${test2Data.data.length}`);
  }
  console.log();

  // 4. Test with resource filter
  console.log('📋 Test 3: GET /api/admin/logs?resource=auth');
  const test3Res = await fetch(`${BASE_URL}/api/admin/logs?resource=auth&page=1&per_page=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const test3Data = await test3Res.json();
  console.log(`   Status: ${test3Res.status}`);
  console.log(`   Success: ${test3Data.success}`);

  if (!test3Data.success) {
    console.error(`   ❌ Error: ${test3Data.error.message}`);
  } else {
    console.log(`   ✅ Auth logs: ${test3Data.data.length}`);
  }
  console.log();

  // 5. Test with ALL filters
  console.log('📋 Test 4: GET /api/admin/logs?action=ALL&resource=ALL');
  const test4Res = await fetch(`${BASE_URL}/api/admin/logs?action=ALL&resource=ALL&page=1&per_page=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const test4Data = await test4Res.json();
  console.log(`   Status: ${test4Res.status}`);
  console.log(`   Success: ${test4Data.success}`);

  if (!test4Data.success) {
    console.error(`   ❌ Error: ${test4Data.error.message}`);
  } else {
    console.log(`   ✅ All logs: ${test4Data.data.length}`);
  }
  console.log();

  // Summary
  console.log('============================================================');
  console.log('SUMMARY');
  console.log('============================================================');
  const allPassed = test1Data.success && test2Data.success && test3Data.success && test4Data.success;

  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - API fix successful!\n');
  } else {
    console.log('❌ SOME TESTS FAILED - Check error details above\n');
    process.exit(1);
  }
}

testAuditLogsAPI().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
