/**
 * Contact Form Production Diagnostic Tool
 * Purpose: Identify why emails are not being sent in production
 */

const PRODUCTION_URL = 'https://glec-website.vercel.app';
const RESEND_API_KEY = 're_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi';

async function diagnoseProdiction() {
  console.log('🔍 Contact Form Production Diagnostic');
  console.log('==========================================\n');

  try {
    // Step 1: Submit Contact Form
    console.log('📝 Step 1: Submitting Contact Form to production...\n');

    const testData = {
      company_name: '[DIAGNOSTIC TEST] GLEC',
      contact_name: 'Claude Diagnostic Tool',
      email: 'oillex.co.kr@gmail.com',
      phone: '010-9999-9999',
      inquiry_type: 'PRODUCT',
      message: `[DIAGNOSTIC] Testing Contact Form email sending at ${new Date().toISOString()}`,
      privacy_consent: true,
    };

    const response = await fetch(`${PRODUCTION_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const responseData = await response.json();

    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📥 Response Body:`, JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.log('\n❌ Contact Form submission failed');
      return;
    }

    const contactId = responseData.data.id;
    console.log(`\n✅ Contact ID: ${contactId}\n`);

    // Step 2: Wait 5 seconds for emails to be sent
    console.log('⏳ Step 2: Waiting 5 seconds for emails to be sent...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 3: Check Resend API for emails
    console.log('📧 Step 3: Checking Resend API for emails...\n');

    const emailsResponse = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const emailsData = await emailsResponse.json();

    console.log(`📥 Resend API Status: ${emailsResponse.status}\n`);

    if (!emailsResponse.ok) {
      console.log('❌ Failed to query Resend API');
      console.log(JSON.stringify(emailsData, null, 2));
      return;
    }

    // Step 4: Check if Contact Form emails were sent
    console.log('🔍 Step 4: Searching for Contact Form emails...\n');

    const recentEmails = emailsData.data || [];
    const contactFormEmails = recentEmails.filter(email => {
      const subject = email.subject || '';
      return subject.includes('[GLEC 문의]') || subject.includes('[GLEC] 문의 접수');
    });

    if (contactFormEmails.length > 0) {
      console.log(`✅ Found ${contactFormEmails.length} Contact Form emails:\n`);
      contactFormEmails.forEach((email, index) => {
        console.log(`Email #${index + 1}:`);
        console.log(`  ID: ${email.id}`);
        console.log(`  To: ${email.to}`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  Status: ${email.last_event}`);
        console.log(`  Created: ${email.created_at}`);
        console.log('');
      });
    } else {
      console.log('❌ NO Contact Form emails found in Resend API\n');
      console.log('Recent emails (last 4):');
      recentEmails.slice(0, 4).forEach((email, index) => {
        console.log(`\n${index + 1}. ${email.subject} → ${email.to}`);
        console.log(`   Created: ${email.created_at}`);
      });
    }

    // Step 5: Diagnosis Summary
    console.log('\n====================================');
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('====================================\n');

    if (contactFormEmails.length > 0) {
      console.log('✅ VERDICT: Emails ARE being sent\n');
      console.log('Possible reasons why user didn\'t receive:');
      console.log('  1. Email in spam folder');
      console.log('  2. Gmail filtering rules');
      console.log('  3. Email delivery delay (check Resend dashboard)');
    } else {
      console.log('❌ VERDICT: Emails are NOT being sent\n');
      console.log('Root Causes to investigate:');
      console.log('  1. Production code may have a bug');
      console.log('  2. try-catch is silently swallowing errors');
      console.log('  3. RESEND_API_KEY may be invalid in production');
      console.log('  4. Resend client initialization may be failing');
      console.log('\nRecommended Action:');
      console.log('  - Add detailed console.error() logging in catch block');
      console.log('  - Check Vercel runtime logs for errors');
      console.log('  - Verify RESEND_API_KEY value in Vercel dashboard');
    }

  } catch (error) {
    console.error('\n❌ DIAGNOSTIC ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run diagnostic
diagnoseProdiction()
  .then(() => {
    console.log('\n✅ Diagnostic completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Diagnostic failed:', error.message);
    process.exit(1);
  });
