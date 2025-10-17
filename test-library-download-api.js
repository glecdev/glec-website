/**
 * Test Library Download API
 * Find correct request format
 */

const BASE_URL = 'https://glec-website.vercel.app';

async function testLibraryDownload() {
  console.log('Testing Library Download API...\n');

  const testCases = [
    {
      name: 'Test 1: Full payload with UUID',
      payload: {
        library_item_id: 'cc76abde-5b3e-4c26-b50a-d2bfe4e5d41f',
        email: 'oillex.co.kr@gmail.com',
        name: 'Test User',
        company: 'GLEC Test',
        phone: '010-1234-5678'
      }
    },
    {
      name: 'Test 2: Short UUID',
      payload: {
        library_item_id: 'cc76abde',
        email: 'oillex.co.kr@gmail.com',
        name: 'Test User',
        company: 'GLEC Test',
        phone: '010-1234-5678'
      }
    },
    {
      name: 'Test 3: Minimal payload',
      payload: {
        library_item_id: 'cc76abde-5b3e-4c26-b50a-d2bfe4e5d41f',
        email: 'oillex.co.kr@gmail.com'
      }
    },
    {
      name: 'Test 4: String ID',
      payload: {
        library_item_id: '1',
        email: 'oillex.co.kr@gmail.com',
        name: 'Test User'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.name}:`);
    console.log(`Payload: ${JSON.stringify(testCase.payload, null, 2)}`);

    try {
      const response = await fetch(`${BASE_URL}/api/library/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload)
      });

      const data = await response.json();

      console.log(`Status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.success) {
        console.log('✅ SUCCESS!');
        return { success: true, payload: testCase.payload };
      } else {
        console.log('❌ Failed');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  return { success: false };
}

testLibraryDownload().then(result => {
  if (result.success) {
    console.log('\n✅ Found working payload format!');
  } else {
    console.log('\n❌ All test cases failed');
  }
});
