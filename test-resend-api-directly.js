/**
 * Test Resend API directly with the API key
 * This will help diagnose if the API key works or not
 */

const RESEND_API_KEY = 're_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi';
const TEST_EMAIL = 'contact@glec.io'; // Changed from ghdi0506@gmail.com - must use registered email

async function testResendAPI() {
  console.log('🧪 Direct Resend API Test');
  console.log('=========================\n');

  console.log(`📧 Test Email: ${TEST_EMAIL}`);
  console.log(`🔑 API Key: ${RESEND_API_KEY.substring(0, 10)}...\n`);

  try {
    console.log('📤 Sending test email via Resend API...');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [TEST_EMAIL],
        subject: '[TEST] Resend API Direct Test',
        html: `
          <h1>Resend API Direct Test</h1>
          <p>This email was sent directly from the Resend API to test if the API key is working.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Test ID:</strong> ${Math.random().toString(36).substring(7)}</p>
        `,
      }),
    });

    const status = response.status;
    const data = await response.json();

    console.log(`\n📥 Response Status: ${status}`);
    console.log('📥 Response Body:', JSON.stringify(data, null, 2));

    if (status === 200 || status === 201) {
      console.log('\n✅ SUCCESS: Email sent via Resend API');
      console.log(`📧 Email ID: ${data.id}`);
      console.log('\n📬 Next Steps:');
      console.log(`   1. Check ${TEST_EMAIL} inbox`);
      console.log('   2. Look for "[TEST] Resend API Direct Test"');
      console.log('   3. Check Resend Dashboard: https://resend.com/emails');
      console.log(`   4. Search for email ID: ${data.id}`);
      return true;
    } else {
      console.log('\n❌ FAILURE: Resend API returned error');
      console.log('Error details:', data);
      return false;
    }
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run test
testResendAPI()
  .then((success) => {
    console.log('\n====================================');
    if (success) {
      console.log('✅ RESEND API TEST PASSED');
      console.log('====================================');
      console.log('\nConclusion:');
      console.log('- API key is VALID and WORKING');
      console.log('- Email sending functionality is OK');
      console.log('- If ghdi0506@gmail.com still NOT receiving:');
      console.log('  → Check spam/junk folder');
      console.log('  → Check Gmail filters/blocks');
      console.log('  → Check Resend Dashboard for delivery status');
    } else {
      console.log('❌ RESEND API TEST FAILED');
      console.log('====================================');
      console.log('\nConclusion:');
      console.log('- API key may be INVALID or EXPIRED');
      console.log('- Domain (onboarding@resend.dev) may not be verified');
      console.log('- Network/firewall may be blocking Resend API');
      console.log('\nNext Steps:');
      console.log('1. Verify API key at: https://resend.com/api-keys');
      console.log('2. Check domain verification: https://resend.com/domains');
      console.log('3. Review Resend account limits/quotas');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
