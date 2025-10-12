/**
 * Test Contact Form with Email Sending
 * Purpose: Verify Contact Form sends emails to official account
 */

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const BASE_URL = 'https://glec-website.vercel.app';
const TEST_EMAIL = 'oillex.co.kr@gmail.com';

async function testContactForm() {
  console.log('🧪 Contact Form E2E Test');
  console.log('==========================================\n');

  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📧 Test User Email: ${TEST_EMAIL}\n`);

  try {
    // Step 1: Submit contact form
    console.log('📝 Step 1: Submitting contact form...\n');

    const contactData = {
      company_name: 'GLEC 테스트 회사',
      contact_name: '강덕호 (Contact Form Test)',
      email: TEST_EMAIL,
      phone: '010-1234-5678',
      inquiry_type: 'PRODUCT',
      message: 'Contact Form 이메일 전송 테스트입니다. Admin 계정으로 이메일이 정상적으로 전송되는지 확인하기 위한 테스트입니다. Cloudflare Email Routing이 정상적으로 작동하는지도 함께 확인합니다.',
      privacy_consent: true,
    };

    console.log('📤 Request payload:');
    console.log(JSON.stringify(contactData, null, 2));
    console.log('');

    const response = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    console.log(`📥 Response status: ${response.status} ${response.statusText}\n`);

    const result = await response.json();

    console.log('📥 Response body:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Step 2: Verify response
    console.log('✅ Step 2: Verifying response...\n');

    if (!result.success) {
      throw new Error(`Contact form submission failed: ${result.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Contact form submitted successfully!\n');

    console.log('📊 Response Data:');
    console.log(`   Contact ID: ${result.data.id}`);
    console.log(`   Message: ${result.data.message}\n`);

    // Step 3: Email verification
    console.log('📧 Step 3: Email verification...\n');

    console.log('Expected Emails:');
    console.log('');
    console.log('1️⃣ Admin Notification Email:');
    console.log(`   To: ${process.env.ADMIN_EMAIL || 'oillex.co.kr@gmail.com'}`);
    console.log(`   From: GLEC <noreply@no-reply.glec.io>`);
    console.log(`   Subject: [GLEC 문의] 제품 문의 - GLEC 테스트 회사`);
    console.log(`   Reply-To: ${TEST_EMAIL} (direct reply enabled)`);
    console.log('');
    console.log('2️⃣ Auto-Response Email:');
    console.log(`   To: ${TEST_EMAIL}`);
    console.log(`   From: GLEC <noreply@no-reply.glec.io>`);
    console.log(`   Subject: [GLEC] 문의 접수 확인 - 영업일 기준 1-2일 내 답변드리겠습니다`);
    console.log('');

    console.log('📬 Next Steps:');
    console.log(`   1. Check oillex.co.kr@gmail.com inbox for Admin notification`);
    console.log(`   2. Check ${TEST_EMAIL} inbox for Auto-response`);
    console.log(`   3. Verify "Reply-To" header allows direct reply`);
    console.log(`   4. Check admin dashboard: https://glec-website.vercel.app/admin/contacts`);
    console.log('');

    console.log('====================================');
    console.log('✅ CONTACT FORM TEST PASSED');
    console.log('====================================\n');

    console.log('Summary:');
    console.log(`   ✅ Contact form submitted`);
    console.log(`   ✅ Contact ID: ${result.data.id}`);
    console.log(`   ✅ Emails should be sent to:`);
    console.log(`      - Admin: oillex.co.kr@gmail.com`);
    console.log(`      - User: ${TEST_EMAIL}`);
    console.log('');

    console.log(`🎉 Test completed! Check oillex.co.kr@gmail.com for emails.`);

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
testContactForm()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
