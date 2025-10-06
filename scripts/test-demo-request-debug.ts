/**
 * Demo Request API Debug Test
 * Tests the /api/demo-requests endpoint with detailed error logging
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3010';

async function testDemoRequestAPI() {
  console.log('🔍 Demo Request API Debug Test');
  console.log('='.repeat(60));
  console.log(`Testing against: ${BASE_URL}`);
  console.log('');

  const testData = {
    companyName: `Debug Test ${Date.now()}`,
    contactName: 'Debug Tester',
    email: `debug${Date.now()}@example.com`,
    phone: '010-1234-5678',
    companySize: '51-200',
    productInterests: ['DTG_SERIES5', 'CARBON_API'],
    useCase: 'Debug test - Testing demo request API endpoint',
    currentSolution: 'Manual Excel tracking',
    monthlyShipments: '1000-10000',
    preferredDate: '2025-02-15',
    preferredTime: '14:00',
    additionalMessage: 'This is a debug test',
  };

  console.log('📝 Request Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  try {
    console.log('🚀 POST /api/demo-requests');
    const response = await fetch(`${BASE_URL}/api/demo-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');

    const responseText = await response.text();
    console.log('📄 Raw Response:');
    console.log(responseText);
    console.log('');

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Parsed JSON Response:');
      console.log(JSON.stringify(data, null, 2));

      if (data.success) {
        console.log('');
        console.log('✅ SUCCESS: Demo request created');
        console.log(`   ID: ${data.data?.id}`);
        console.log(`   Email: ${data.data?.email}`);
        console.log(`   Status: ${data.data?.status}`);
      } else {
        console.log('');
        console.log('❌ FAILED: API returned error');
        console.log(`   Code: ${data.error?.code}`);
        console.log(`   Message: ${data.error?.message}`);
        if (data.error?.details) {
          console.log('   Details:');
          data.error.details.forEach((detail: any) => {
            console.log(`     - ${detail.field}: ${detail.message}`);
          });
        }
      }
    } catch (parseError: any) {
      console.log('❌ JSON Parse Error:');
      console.log(parseError.message);
    }
  } catch (error: any) {
    console.log('');
    console.log('❌ NETWORK ERROR:');
    console.log(error.message);
    console.log(error.stack);
  }
}

testDemoRequestAPI();
