/**
 * Check Recent Emails from Resend
 * Purpose: Verify if Contact Form emails were actually sent
 */

const RESEND_API_KEY = 're_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi';

async function checkRecentEmails() {
  console.log('🔍 Checking Recent Resend Emails');
  console.log('==========================================\n');

  console.log(`🔑 API Key: ${RESEND_API_KEY.substring(0, 10)}...\n`);

  try {
    // Fetch recent emails from Resend
    console.log('📧 Fetching recent emails from Resend...\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📥 Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:');
      console.error(errorText);
      throw new Error(`Resend API error: ${response.status}`);
    }

    const result = await response.json();

    console.log('📥 Response Body:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Check if we have emails
    if (!result.data || result.data.length === 0) {
      console.log('⚠️ No emails found in recent history\n');
      console.log('Possible reasons:');
      console.log('  1. API key has "Sending access" only (cannot query emails)');
      console.log('  2. No emails sent yet');
      console.log('  3. Emails were sent but not showing in API\n');
      return;
    }

    console.log(`✅ Found ${result.data.length} recent emails:\n`);

    // Display each email
    result.data.forEach((email, index) => {
      console.log(`Email #${index + 1}:`);
      console.log(`  ID: ${email.id}`);
      console.log(`  To: ${email.to}`);
      console.log(`  From: ${email.from}`);
      console.log(`  Subject: ${email.subject}`);
      console.log(`  Status: ${email.last_event || 'sent'}`);
      console.log(`  Created: ${email.created_at}`);
      console.log('');
    });

    // Look for Contact Form emails
    const contactEmails = result.data.filter(email =>
      email.subject && email.subject.includes('[GLEC')
    );

    if (contactEmails.length > 0) {
      console.log(`\n🎯 Found ${contactEmails.length} GLEC Contact Form emails:`);
      contactEmails.forEach((email, index) => {
        console.log(`\nContact Email #${index + 1}:`);
        console.log(`  ID: ${email.id}`);
        console.log(`  To: ${email.to}`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  Status: ${email.last_event || 'sent'}`);
        console.log(`  Created: ${email.created_at}`);
      });
    } else {
      console.log('\n⚠️ No Contact Form emails found in recent history');
    }

    console.log('\n====================================');
    console.log('✅ EMAIL CHECK COMPLETE');
    console.log('====================================\n');

  } catch (error) {
    console.error('\n❌ Error checking emails:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    throw error;
  }
}

// Run the check
checkRecentEmails()
  .then(() => {
    console.log('✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error.message);
    process.exit(1);
  });
