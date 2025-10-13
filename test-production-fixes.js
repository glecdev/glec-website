/**
 * Test Production Fixes
 *
 * Verify Partnership API and Blog page fixes on production
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

async function testProductionFixes() {
  console.log(`🧪 Testing Production Fixes on ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Partnership API - Valid submission
  console.log('Test 1: Partnership API - Valid submission');
  try {
    const response = await fetch(`${BASE_URL}/api/partnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Test Company',
        contactName: 'John Doe',
        email: 'john@test.com',
        partnershipType: 'tech',
        proposal: 'This is a test proposal with more than 10 characters.'
      })
    });

    const data = await response.json();

    if (response.status === 200 && data.success) {
      console.log('✅ Partnership API: PASS (200 OK)');
      passed++;
    } else {
      console.log(`❌ Partnership API: FAIL (${response.status})`);
      console.log(`   Error: ${JSON.stringify(data.error)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Partnership API: ERROR - ${error.message}`);
    failed++;
  }

  // Test 2: Partnership API - Invalid data (should return 400)
  console.log('\nTest 2: Partnership API - Invalid email (should reject)');
  try {
    const response = await fetch(`${BASE_URL}/api/partnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Test Company',
        contactName: 'Jane Doe',
        email: 'invalid-email',
        partnershipType: 'reseller',
        proposal: 'Test proposal content.'
      })
    });

    const data = await response.json();

    if (response.status === 400 && !data.success) {
      console.log('✅ Validation: PASS (correctly rejected)');
      passed++;
    } else {
      console.log(`❌ Validation: FAIL (should be 400, got ${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Validation: ERROR - ${error.message}`);
    failed++;
  }

  // Test 3: Blog page loads without errors
  console.log('\nTest 3: Blog page loads without errors');
  try {
    const response = await fetch(`${BASE_URL}/knowledge/blog`);
    const html = await response.text();

    if (response.status === 200 && html.includes('블로그') && !html.includes('Application error')) {
      console.log('✅ Blog page: PASS (200 OK, no errors)');
      passed++;
    } else {
      console.log(`❌ Blog page: FAIL (${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Blog page: ERROR - ${error.message}`);
    failed++;
  }

  // Test 4: Blog API returns data
  console.log('\nTest 4: Blog API returns data');
  try {
    const response = await fetch(`${BASE_URL}/api/knowledge/blog?per_page=5`);
    const data = await response.json();

    if (response.status === 200 && data.success && Array.isArray(data.data)) {
      console.log(`✅ Blog API: PASS (${data.data.length} posts returned)`);
      passed++;
    } else {
      console.log(`❌ Blog API: FAIL (${response.status})`);
      console.log(`   Error: ${JSON.stringify(data.error)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Blog API: ERROR - ${error.message}`);
    failed++;
  }

  // Test 5: Homepage loads without errors
  console.log('\nTest 5: Homepage loads without errors');
  try {
    const response = await fetch(`${BASE_URL}/`);
    const html = await response.text();

    if (response.status === 200 && html.includes('GLEC') && !html.includes('Application error')) {
      console.log('✅ Homepage: PASS (200 OK, no errors)');
      passed++;
    } else {
      console.log(`❌ Homepage: FAIL (${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Homepage: ERROR - ${error.message}`);
    failed++;
  }

  // Test 6: Partnership page loads
  console.log('\nTest 6: Partnership page loads');
  try {
    const response = await fetch(`${BASE_URL}/partnership`);
    const html = await response.text();

    if (response.status === 200 && html.includes('파트너십') && !html.includes('Application error')) {
      console.log('✅ Partnership page: PASS (200 OK)');
      passed++;
    } else {
      console.log(`❌ Partnership page: FAIL (${response.status})`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Partnership page: ERROR - ${error.message}`);
    failed++;
  }

  // Summary
  console.log('\n═══════════════════════════════════════');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════');

  if (failed === 0) {
    console.log('✅ All tests passed! Production fixes verified.');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Review logs above.`);
  }
}

testProductionFixes();
