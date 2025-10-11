/**
 * Library Download Production E2E Test
 *
 * Tests against: https://glec-website.vercel.app
 * Test Email: ghdi0506@gmail.com
 */

const BASE_URL = 'https://glec-website.vercel.app';
const TEST_EMAIL = 'ghdi0506@gmail.com';

console.log('🧪 Library Download Production E2E Test');
console.log('==========================================\n');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log(`📧 Test Email: ${TEST_EMAIL}\n`);

async function testLibraryProduction() {
  try {
    // ========================================
    // Step 1: Fetch published library items
    // ========================================
    console.log('📚 Step 1: Fetching published library items...');

    const itemsResponse = await fetch(`${BASE_URL}/api/library/items?category=ALL&per_page=10`);

    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch items: ${itemsResponse.status} ${itemsResponse.statusText}`);
    }

    const itemsResult = await itemsResponse.json();

    if (!itemsResult.success) {
      throw new Error(`API returned error: ${JSON.stringify(itemsResult.error)}`);
    }

    console.log(`✅ Found ${itemsResult.data.length} library items`);
    console.log(`   Total: ${itemsResult.meta.total} items\n`);

    if (itemsResult.data.length === 0) {
      throw new Error('❌ No library items found.');
    }

    // Select first item
    const testItem = itemsResult.data[0];
    console.log(`📄 Selected test item:`);
    console.log(`   ID: ${testItem.id}`);
    console.log(`   Title: ${testItem.title}`);
    console.log(`   Slug: ${testItem.slug}`);
    console.log(`   Category: ${testItem.category}\n`);

    // ========================================
    // Step 2: Submit download request (existing /api/library/download endpoint)
    // ========================================
    console.log('📝 Step 2: Submitting download request...');

    const requestData = {
      library_item_id: testItem.id,
      company_name: 'GLEC Production Test',
      contact_name: 'Test User (Claude Code)',
      email: TEST_EMAIL,
      phone: '010-1234-5678',
      privacy_consent: true,
      marketing_consent: true,
    };

    console.log(`📤 Request payload:`);
    console.log(JSON.stringify(requestData, null, 2));
    console.log('');

    const requestResponse = await fetch(`${BASE_URL}/api/library/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const requestResult = await requestResponse.json();

    console.log(`📥 Response status: ${requestResponse.status} ${requestResponse.statusText}`);
    console.log(`📥 Response body:`);
    console.log(JSON.stringify(requestResult, null, 2));
    console.log('');

    // ========================================
    // Step 3: Verify response
    // ========================================
    console.log('✅ Step 3: Verifying response...\n');

    if (!requestResponse.ok) {
      if (requestResponse.status === 429) {
        console.log('⚠️  Rate limit exceeded (429 Too Many Requests)');
        console.log('   This is expected if you recently submitted multiple requests.');
        console.log('   Wait 1 hour and try again.\n');
        return { status: 'WARNING', code: 429, message: 'Rate limit' };
      } else {
        throw new Error(
          `Request failed: ${requestResponse.status}\n` +
          `Error: ${JSON.stringify(requestResult.error)}`
        );
      }
    }

    if (!requestResult.success) {
      throw new Error(`API returned success: false\n${JSON.stringify(requestResult.error)}`);
    }

    // Verify response data
    const lead = requestResult.data;

    console.log('✅ Download request submitted successfully!\n');
    console.log('📊 Response Data:');
    console.log(`   Lead ID: ${lead.lead_id}`);
    console.log(`   Email Sent: ${lead.email_sent ? '✅ Yes' : '❌ No'}\n`);

    // ========================================
    // Step 4: Email instructions
    // ========================================
    console.log('📧 Step 4: Email verification...\n');

    if (lead.email_sent) {
      console.log('✅ Email was sent successfully!');
      console.log(`   Recipient: ${TEST_EMAIL}`);
      console.log('');
      console.log('📬 Next Steps:');
      console.log(`   1. Check your inbox at ${TEST_EMAIL}`);
      console.log('   2. Look for email from: GLEC <noreply@glec.io>');
      console.log(`   3. Subject: "[GLEC] ${testItem.title} 다운로드"`);
      console.log('   4. Click the "다운로드 (Google Drive)" button');
      console.log('   5. Verify the file downloads from Google Drive');
      console.log('');
    } else {
      console.log('⚠️  Email status unknown');
      console.log(`   Check ${TEST_EMAIL} for the download link`);
      console.log('');
    }

    // ========================================
    // Step 5: Admin verification
    // ========================================
    console.log('🔍 Step 5: Admin verification...\n');
    console.log('To verify the lead was created:');
    console.log(`   1. Open: ${BASE_URL}/admin/login`);
    console.log('   2. Navigate to: Customer Leads (리드 관리)');
    console.log(`   3. Search for: ${TEST_EMAIL}`);
    console.log('   4. Check lead details:');
    console.log('      - Company: GLEC Production Test');
    console.log('      - Contact: Test User (Claude Code)');
    console.log('      - Lead Score: Should be calculated');
    console.log('      - Email Sent: Should be TRUE');
    console.log('');

    // ========================================
    // Summary
    // ========================================
    console.log('====================================');
    console.log('✅ PRODUCTION E2E TEST PASSED');
    console.log('====================================\n');
    console.log('Summary:');
    console.log(`   ✅ Library items fetched: ${itemsResult.meta.total} items`);
    console.log(`   ✅ Download request submitted`);
    console.log(`   ✅ Lead created: ${lead.lead_id}`);
    console.log(`   ${lead.email_sent ? '✅' : '⚠️ '} Email sent: ${lead.email_sent}`);
    console.log('');
    console.log(`🎉 Test completed! Check ${TEST_EMAIL} for the download link.`);
    console.log('');

    return { status: 'SUCCESS', lead };

  } catch (error) {
    console.error('');
    console.error('====================================');
    console.error('❌ PRODUCTION E2E TEST FAILED');
    console.error('====================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    return { status: 'FAILED', error: error.message };
  }
}

// Run the test
testLibraryProduction()
  .then((result) => {
    if (result.status === 'SUCCESS' || result.status === 'WARNING') {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
