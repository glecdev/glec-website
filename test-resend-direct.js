/**
 * Test Resend API Directly
 * Purpose: Verify Contact Form email failure cause
 */

const RESEND_API_KEY = 're_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi';

async function testResendDirect() {
  console.log('🧪 Testing Resend API Directly');
  console.log('==========================================\n');

  try {
    // Test 1: Send email to admin
    console.log('📧 Test 1: Sending email to admin...\n');

    const response1 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GLEC <noreply@no-reply.glec.io>',
        to: 'oillex.co.kr@gmail.com',
        replyTo: 'test@example.com',
        subject: '[GLEC 문의] 제품 문의 - TEST 회사',
        html: '<h1>Test Admin Email</h1><p>This is a test email to verify Contact Form email sending.</p>',
      }),
    });

    const data1 = await response1.json();

    console.log(`📥 Response Status: ${response1.status}`);
    console.log('📥 Response Body:', JSON.stringify(data1, null, 2));

    if (response1.status === 200 || response1.status === 201) {
      console.log('\n✅ Test 1 PASSED: Admin email sent');
      console.log(`📧 Email ID: ${data1.id}\n`);
    } else {
      console.log('\n❌ Test 1 FAILED: Admin email NOT sent');
      console.log('Error:', data1);
      return;
    }

    // Test 2: Send auto-response to user
    console.log('📧 Test 2: Sending auto-response to user...\n');

    const response2 = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GLEC <noreply@no-reply.glec.io>',
        to: 'oillex.co.kr@gmail.com',
        subject: '[GLEC] 문의 접수 확인 - 영업일 기준 1-2일 내 답변드리겠습니다',
        html: '<h1>Test User Email</h1><p>This is a test auto-response email.</p>',
      }),
    });

    const data2 = await response2.json();

    console.log(`📥 Response Status: ${response2.status}`);
    console.log('📥 Response Body:', JSON.stringify(data2, null, 2));

    if (response2.status === 200 || response2.status === 201) {
      console.log('\n✅ Test 2 PASSED: User email sent');
      console.log(`📧 Email ID: ${data2.id}\n`);
    } else {
      console.log('\n❌ Test 2 FAILED: User email NOT sent');
      console.log('Error:', data2);
      return;
    }

    console.log('\n====================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('====================================\n');

    console.log('📬 Next Steps:');
    console.log('   1. Check oillex.co.kr@gmail.com inbox');
    console.log('   2. Verify 2 emails received');
    console.log('   3. Check Reply-To header on admin email');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run test
testResendDirect()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
