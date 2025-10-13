/**
 * Test Partnership API
 *
 * Tests POST /api/partnership endpoint
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testPartnershipAPI() {
  console.log('🧪 Testing Partnership API...\n');

  // Test 1: Valid submission
  console.log('Test 1: Valid partnership submission');
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
      console.log('✅ Valid submission: PASS');
    } else {
      console.log('❌ Valid submission: FAIL');
      console.log(`   Status: ${response.status}, Message: ${data.error?.message}`);
    }
  } catch (error) {
    console.log('❌ Valid submission: ERROR');
    console.log(`   ${error.message}`);
  }

  // Test 2: Invalid email
  console.log('\nTest 2: Invalid email format');
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
      console.log('✅ Invalid email: PASS (correctly rejected)');
    } else {
      console.log('❌ Invalid email: FAIL (should have been rejected)');
    }
  } catch (error) {
    console.log('❌ Invalid email: ERROR');
    console.log(`   ${error.message}`);
  }

  // Test 3: Short proposal (< 10 chars)
  console.log('\nTest 3: Short proposal (< 10 characters)');
  try {
    const response = await fetch(`${BASE_URL}/api/partnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Test Company',
        contactName: 'Bob Smith',
        email: 'bob@test.com',
        partnershipType: 'consulting',
        proposal: 'Short'
      })
    });

    const data = await response.json();

    if (response.status === 400 && !data.success) {
      console.log('✅ Short proposal: PASS (correctly rejected)');
    } else {
      console.log('❌ Short proposal: FAIL (should have been rejected)');
    }
  } catch (error) {
    console.log('❌ Short proposal: ERROR');
    console.log(`   ${error.message}`);
  }

  // Test 4: Invalid partnership type
  console.log('\nTest 4: Invalid partnership type');
  try {
    const response = await fetch(`${BASE_URL}/api/partnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Test Company',
        contactName: 'Alice Wonder',
        email: 'alice@test.com',
        partnershipType: 'invalid-type',
        proposal: 'This is a test proposal.'
      })
    });

    const data = await response.json();

    if (response.status === 400 && !data.success) {
      console.log('✅ Invalid type: PASS (correctly rejected)');
    } else {
      console.log('❌ Invalid type: FAIL (should have been rejected)');
    }
  } catch (error) {
    console.log('❌ Invalid type: ERROR');
    console.log(`   ${error.message}`);
  }

  console.log('\n✅ Partnership API tests completed');
}

testPartnershipAPI();
