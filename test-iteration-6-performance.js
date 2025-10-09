/**
 * Iteration 6 Performance Test: PUT/DELETE API Response Time
 *
 * Purpose: Measure API performance (CLAUDE.md Step 6 Phase 2)
 * Target: All PUT/DELETE APIs < 1000ms (ideally < 500ms)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

let adminToken = '';

async function login() {
  const startTime = Date.now();
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const data = await response.json();
  const duration = Date.now() - startTime;

  if (data.success) {
    adminToken = data.data.token;
    console.log(`✅ Login successful (${duration}ms)`);
    return true;
  }

  console.error('❌ Login failed:', data.error);
  return false;
}

async function measurePutPerformance(resource, createData, updateData) {
  console.log(`\n📊 Testing PUT /api/admin/${resource}`);

  // 1. Create item
  const createRes = await fetch(`${BASE_URL}/api/admin/${resource}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createData),
  });

  const createResult = await createRes.json();
  if (!createResult.success) {
    console.error(`❌ Create failed:`, createResult.error);
    return null;
  }

  const itemId = createResult.data.id;
  console.log(`   Created ${resource}: ${itemId}`);

  // 2. Measure PUT
  const putStartTime = Date.now();
  const putRes = await fetch(`${BASE_URL}/api/admin/${resource}?id=${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  const putDuration = Date.now() - putStartTime;

  const putResult = await putRes.json();
  if (!putResult.success) {
    console.error(`❌ PUT failed:`, putResult.error);
    return null;
  }

  console.log(`   ✅ PUT: ${putDuration}ms ${putDuration < 500 ? '🚀 FAST' : putDuration < 1000 ? '✓ OK' : '⚠️ SLOW'}`);

  // 3. Measure DELETE
  const deleteStartTime = Date.now();
  const deleteRes = await fetch(`${BASE_URL}/api/admin/${resource}?id=${itemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const deleteDuration = Date.now() - deleteStartTime;

  const deleteResult = await deleteRes.json();
  if (!deleteResult.success) {
    console.error(`❌ DELETE failed:`, deleteResult.error);
    return null;
  }

  console.log(`   ✅ DELETE: ${deleteDuration}ms ${deleteDuration < 500 ? '🚀 FAST' : deleteDuration < 1000 ? '✓ OK' : '⚠️ SLOW'}`);

  return { putDuration, deleteDuration };
}

async function runPerformanceTests() {
  console.log('============================================================');
  console.log('Iteration 6 Performance Test: PUT/DELETE API Response Time');
  console.log('============================================================\n');

  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    process.exit(1);
  }

  const results = [];

  // Test 1: Notices
  const noticesResult = await measurePutPerformance(
    'notices',
    {
      title: 'Performance Test Notice',
      content: '<p>Content for performance testing</p>',
      category: 'GENERAL',
      status: 'DRAFT',
    },
    {
      title: 'Performance Test Notice - UPDATED',
      status: 'PUBLISHED',
    }
  );
  if (noticesResult) results.push({ api: 'Notices', ...noticesResult });

  // Test 2: Press
  const pressResult = await measurePutPerformance(
    'press',
    {
      title: 'Performance Test Press',
      content: '<p>Press release content</p>',
      status: 'DRAFT',
    },
    {
      title: 'Performance Test Press - UPDATED',
      mediaOutlet: 'TechCrunch',
    }
  );
  if (pressResult) results.push({ api: 'Press', ...pressResult });

  // Test 3: Popups
  const popupsResult = await measurePutPerformance(
    'popups',
    {
      title: 'Performance Test Popup',
      content: '<p>Popup content</p>',
      displayType: 'modal',
      isActive: false,
    },
    {
      title: 'Performance Test Popup - UPDATED',
      isActive: true,
    }
  );
  if (popupsResult) results.push({ api: 'Popups', ...popupsResult });

  // Test 4: Events
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 8);

  const eventsResult = await measurePutPerformance(
    'events',
    {
      title: 'Performance Test Event',
      slug: `perf-test-event-${Date.now()}`,
      description: 'Event description',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      location: 'Seoul, Korea',
      status: 'DRAFT',
    },
    {
      title: 'Performance Test Event - UPDATED',
      max_participants: 100,
      status: 'PUBLISHED',
    }
  );
  if (eventsResult) results.push({ api: 'Events', ...eventsResult });

  // Summary
  console.log('\n============================================================');
  console.log('PERFORMANCE SUMMARY');
  console.log('============================================================\n');

  console.log('API          | PUT (ms) | DELETE (ms) | Status');
  console.log('-------------|----------|-------------|--------');

  let allPassed = true;
  for (const result of results) {
    const putStatus = result.putDuration < 500 ? '🚀' : result.putDuration < 1000 ? '✓' : '⚠️';
    const deleteStatus = result.deleteDuration < 500 ? '🚀' : result.deleteDuration < 1000 ? '✓' : '⚠️';

    console.log(
      `${result.api.padEnd(12)} | ${String(result.putDuration).padStart(8)} | ${String(result.deleteDuration).padStart(11)} | ${putStatus} ${deleteStatus}`
    );

    if (result.putDuration >= 1000 || result.deleteDuration >= 1000) {
      allPassed = false;
    }
  }

  // Average
  const avgPut = Math.round(
    results.reduce((sum, r) => sum + r.putDuration, 0) / results.length
  );
  const avgDelete = Math.round(
    results.reduce((sum, r) => sum + r.deleteDuration, 0) / results.length
  );

  console.log('-------------|----------|-------------|--------');
  console.log(
    `${'Average'.padEnd(12)} | ${String(avgPut).padStart(8)} | ${String(avgDelete).padStart(11)} | ${avgPut < 500 ? '🚀' : avgPut < 1000 ? '✓' : '⚠️'} ${avgDelete < 500 ? '🚀' : avgDelete < 1000 ? '✓' : '⚠️'}`
  );

  console.log('\n------------------------------------------------------------');
  console.log(`Target: < 500ms (FAST), < 1000ms (OK), >= 1000ms (SLOW)`);
  console.log('------------------------------------------------------------\n');

  if (allPassed) {
    console.log('🎉 ALL APIs meet performance target (< 1000ms)');
    console.log(`   Average PUT: ${avgPut}ms, Average DELETE: ${avgDelete}ms\n`);
  } else {
    console.log('⚠️  Some APIs exceed 1000ms - optimization needed\n');
  }

  console.log('============================================================\n');
}

runPerformanceTests().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
