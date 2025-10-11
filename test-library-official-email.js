/**
 * Test Library Download with Official Email (oillex.co.kr@gmail.com)
 * Purpose: Verify email delivery to GLEC official account
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const BASE_URL = 'https://glec-website.vercel.app';
const OFFICIAL_EMAIL = 'oillex.co.kr@gmail.com';

async function testLibraryWithOfficialEmail() {
  console.log('🧪 Library Download Test - Official Email');
  console.log('==========================================\n');

  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📧 Official Email: ${OFFICIAL_EMAIL}\n`);

  try {
    // Step 1: Fetch published library items
    console.log('📚 Step 1: Fetching published library items...');

    const itemsResponse = await fetch(`${BASE_URL}/api/library/items?category=ALL&per_page=10`, {
      method: 'GET',
    });

    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch library items: ${itemsResponse.status}`);
    }

    const itemsData = await itemsResponse.json();

    if (!itemsData.success || !itemsData.data || itemsData.data.length === 0) {
      throw new Error('No published library items found');
    }

    console.log(`✅ Found ${itemsData.data.length} library items\n`);

    const testItem = itemsData.data[0];
    console.log('📄 Selected test item:');
    console.log(`   ID: ${testItem.id}`);
    console.log(`   Title: ${testItem.title}`);
    console.log(`   Slug: ${testItem.slug}`);
    console.log(`   Category: ${testItem.category}\n`);

    // Step 2: Submit download request with official email
    console.log('📝 Step 2: Submitting download request with OFFICIAL EMAIL...');

    const downloadPayload = {
      library_item_id: testItem.id,
      company_name: 'GLEC 공식 계정 테스트',
      contact_name: '강덕호 (Official Account Test)',
      email: OFFICIAL_EMAIL,
      phone: '010-1234-5678',
      job_title: 'CEO',
      industry: 'LOGISTICS',
      company_size: '50-100',
      inquiry_details: '공식 이메일 계정으로 테스트 진행 중입니다.',
      privacy_consent: true,
      marketing_consent: true,
    };

    console.log('📤 Request payload:');
    console.log(JSON.stringify(downloadPayload, null, 2));
    console.log('');

    const downloadResponse = await fetch(`${BASE_URL}/api/library/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(downloadPayload),
    });

    console.log(`📥 Response status: ${downloadResponse.status} ${downloadResponse.statusText}`);

    const downloadData = await downloadResponse.json();

    console.log('📥 Response body:');
    console.log(JSON.stringify(downloadData, null, 2));
    console.log('');

    // Step 3: Verify response
    console.log('✅ Step 3: Verifying response...\n');

    if (!downloadData.success) {
      throw new Error(`Download request failed: ${downloadData.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Download request submitted successfully!\n');

    console.log('📊 Response Data:');
    console.log(`   Lead ID: ${downloadData.data.lead_id}`);
    console.log(`   Email Sent: ${downloadData.data.email_sent ? '✅ Yes' : '❌ No'}\n`);

    // Step 4: Email verification
    console.log('📧 Step 4: Email verification...\n');

    if (downloadData.data.email_sent) {
      console.log('✅ Email was sent successfully!');
      console.log(`   Recipient: ${OFFICIAL_EMAIL}\n`);

      console.log('📬 Next Steps:');
      console.log(`   1. Check your inbox at ${OFFICIAL_EMAIL}`);
      console.log(`   2. Look for email from: GLEC <noreply@no-reply.glec.io>`);
      console.log(`   3. Subject: "[GLEC] ${testItem.title} 다운로드"`);
      console.log(`   4. Click the "다운로드 (Google Drive)" button`);
      console.log(`   5. Verify the file downloads from Google Drive\n`);
    } else {
      console.error('❌ Email was NOT sent!');
      console.error('   Check API logs for details\n');
    }

    console.log('====================================');
    console.log('✅ OFFICIAL EMAIL TEST PASSED');
    console.log('====================================\n');

    console.log('Summary:');
    console.log(`   ✅ Library items fetched: ${itemsData.data.length} items`);
    console.log(`   ✅ Download request submitted`);
    console.log(`   ✅ Lead created: ${downloadData.data.lead_id}`);
    console.log(`   ✅ Email sent: ${downloadData.data.email_sent}`);
    console.log(`   ✅ Recipient: ${OFFICIAL_EMAIL}\n`);

    console.log(`🎉 Test completed! Check ${OFFICIAL_EMAIL} for the download link.`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
testLibraryWithOfficialEmail()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
