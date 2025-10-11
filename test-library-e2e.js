/**
 * Library Download E2E Test
 *
 * Tests the complete flow:
 * 1. Fetch published library items
 * 2. Submit download request with test email
 * 3. Verify response
 *
 * Test Email: ghdi0506@gmail.com
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3004';
const TEST_EMAIL = 'ghdi0506@gmail.com';

console.log('🧪 Library Download E2E Test');
console.log('================================\n');
console.log(`📍 Base URL: ${BASE_URL}`);
console.log(`📧 Test Email: ${TEST_EMAIL}\n`);

async function testLibraryE2E() {
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
      throw new Error('❌ No library items found. Please add at least one PUBLISHED item.');
    }

    // Select first item for testing
    const testItem = itemsResult.data[0];
    console.log(`📄 Selected test item:`);
    console.log(`   ID: ${testItem.id}`);
    console.log(`   Title: ${testItem.title}`);
    console.log(`   Slug: ${testItem.slug}`);
    console.log(`   Category: ${testItem.category}`);
    console.log(`   Download Type: ${testItem.download_type}`);
    console.log(`   Requires Form: ${testItem.requires_form}\n`);

    // ========================================
    // Step 2: Submit download request
    // ========================================
    console.log('📝 Step 2: Submitting download request...');

    const requestData = {
      library_item_id: testItem.id,
      company_name: 'GLEC E2E Test Company',
      contact_name: 'Test User',
      email: TEST_EMAIL,
      phone: '010-1234-5678',
      industry: 'Technology',
      job_title: 'Engineer',
      message: 'This is an automated E2E test from Claude Code',
    };

    console.log(`📤 Request payload:`);
    console.log(JSON.stringify(requestData, null, 2));
    console.log('');

    const requestResponse = await fetch(`${BASE_URL}/api/library/request`, {
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
        console.log('⚠️  Duplicate request detected (429 Too Many Requests)');
        console.log('   This is expected if you recently submitted a request with this email.');
        console.log('   Wait 5 minutes and try again, or use a different email.\n');
        return { status: 'WARNING', code: 429, message: 'Duplicate request' };
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
    console.log('📊 Created Lead Details:');
    console.log(`   Lead ID: ${lead.id}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Library Item ID: ${lead.library_item_id}`);
    console.log(`   Download Token: ${lead.download_token}`);
    console.log(`   Email Sent: ${lead.email_sent ? '✅ Yes' : '❌ No'}`);
    console.log(`   Lead Status: ${lead.lead_status}`);
    console.log(`   Lead Score: ${lead.lead_score}`);
    console.log(`   Created At: ${lead.created_at}\n`);

    // ========================================
    // Step 4: Check email status
    // ========================================
    console.log('📧 Step 4: Email delivery status...\n');

    if (lead.email_sent) {
      console.log('✅ Email was sent successfully!');
      console.log(`   Recipient: ${TEST_EMAIL}`);
      console.log(`   Email ID: ${lead.email_id || 'N/A'}`);
      console.log('');
      console.log('📬 Next Steps:');
      console.log(`   1. Check your inbox at ${TEST_EMAIL}`);
      console.log('   2. Look for email from: noreply@glec.io');
      console.log(`   3. Subject: "${testItem.title} 다운로드 링크"`);
      console.log('   4. Click the download link in the email');
      console.log('   5. Verify that Admin UI shows email tracking (👁️ ⬇️)');
      console.log('');
    } else {
      console.log('⚠️  Email was NOT sent');
      console.log('   Possible reasons:');
      console.log('   - Resend API key not configured');
      console.log('   - Email sending failed (check logs)');
      console.log('   - Lead created but email pending');
      console.log('');
    }

    // ========================================
    // Step 5: Admin verification instructions
    // ========================================
    console.log('🔍 Step 5: Admin verification...\n');
    console.log('To verify the lead was created:');
    console.log(`   1. Open: ${BASE_URL.replace('3004', '3004')}/admin/customer-leads`);
    console.log(`   2. Search for: ${TEST_EMAIL}`);
    console.log('   3. Check lead details:');
    console.log('      - Company: GLEC E2E Test Company');
    console.log('      - Contact: Test User');
    console.log('      - Status: NEW → OPENED (after email open) → DOWNLOADED (after click)');
    console.log('      - Email tracking: ✉️ (sent) 👁️ (opened) ⬇️ (clicked)');
    console.log('');

    // ========================================
    // Summary
    // ========================================
    console.log('====================================');
    console.log('✅ E2E TEST PASSED');
    console.log('====================================\n');
    console.log('Summary:');
    console.log(`   ✅ Library items fetched: ${itemsResult.meta.total} items`);
    console.log(`   ✅ Download request submitted`);
    console.log(`   ✅ Lead created: ${lead.id}`);
    console.log(`   ${lead.email_sent ? '✅' : '⚠️ '} Email sent: ${lead.email_sent}`);
    console.log('');
    console.log('🎉 Test completed successfully!');
    console.log('');

    return { status: 'SUCCESS', lead };

  } catch (error) {
    console.error('');
    console.error('====================================');
    console.error('❌ E2E TEST FAILED');
    console.error('====================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');

    return { status: 'FAILED', error: error.message };
  }
}

// Run the test
testLibraryE2E()
  .then((result) => {
    if (result.status === 'SUCCESS') {
      process.exit(0);
    } else if (result.status === 'WARNING') {
      process.exit(0); // Don't fail on duplicate requests
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
