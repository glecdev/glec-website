/**
 * Resend Webhook Simulation Test
 *
 * Tests the webhook endpoint by simulating Resend webhook events:
 * 1. email.opened
 * 2. email.clicked
 * 3. email.bounced
 * 4. email.complained
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('🧪 Resend Webhook Simulation Test');
console.log('==================================\n');
console.log(`📍 Base URL: ${BASE_URL}\n`);

// Sample Resend webhook events
const webhookEvents = {
  emailOpened: {
    type: 'email.opened',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'test-email-id-123',
      to: 'ghdi0506@gmail.com', // Use test email from library E2E test
      from: 'GLEC <noreply@no-reply.glec.io>',
      subject: '[GLEC] GLEC Framework v3.0 한글 버전 다운로드',
      created_at: new Date().toISOString(),
    },
  },

  emailClicked: {
    type: 'email.clicked',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'test-email-id-123',
      to: 'ghdi0506@gmail.com',
      from: 'GLEC <noreply@no-reply.glec.io>',
      subject: '[GLEC] GLEC Framework v3.0 한글 버전 다운로드',
      created_at: new Date().toISOString(),
      click: {
        link: 'https://drive.google.com/file/d/1mS9i6Mj5z68Vefmyu3OM_YZYobVEu1UZ/view?usp=drive_link',
        timestamp: new Date().toISOString(),
      },
    },
  },

  emailBounced: {
    type: 'email.bounced',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'test-email-id-bounce',
      to: 'invalid@example.com',
      from: 'GLEC <noreply@no-reply.glec.io>',
      subject: '[GLEC] Test Email',
      created_at: new Date().toISOString(),
      bounce: {
        type: 'hard',
        reason: 'Mailbox does not exist',
      },
    },
  },

  emailComplained: {
    type: 'email.complained',
    created_at: new Date().toISOString(),
    data: {
      email_id: 'test-email-id-spam',
      to: 'spam@example.com',
      from: 'GLEC <noreply@no-reply.glec.io>',
      subject: '[GLEC] Test Email',
      created_at: new Date().toISOString(),
    },
  },
};

async function testWebhook(eventName, event) {
  console.log(`\n📩 Testing: ${eventName}`);
  console.log('─'.repeat(50));

  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, Resend sends a signature header
        // 'resend-signature': 'sha256=...'
      },
      body: JSON.stringify(event),
    });

    const data = await response.json();

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log(`✅ ${eventName} webhook processed successfully`);
    } else {
      console.log(`⚠️  ${eventName} webhook returned non-200 status`);
    }
  } catch (error) {
    console.error(`❌ ${eventName} webhook failed:`, error.message);
  }
}

async function runTests() {
  // Test 1: Email Opened
  await testWebhook('email.opened', webhookEvents.emailOpened);
  await sleep(1000);

  // Test 2: Email Clicked
  await testWebhook('email.clicked', webhookEvents.emailClicked);
  await sleep(1000);

  // Test 3: Email Bounced (with invalid email)
  await testWebhook('email.bounced', webhookEvents.emailBounced);
  await sleep(1000);

  // Test 4: Email Complained (spam)
  await testWebhook('email.complained', webhookEvents.emailComplained);
  await sleep(1000);

  console.log('\n' + '='.repeat(50));
  console.log('✅ All webhook tests completed!');
  console.log('='.repeat(50));
  console.log('\n📋 Next Steps:');
  console.log('  1. Check library_leads table for updated fields:');
  console.log('     - email_opened (should be TRUE)');
  console.log('     - download_link_clicked (should be TRUE)');
  console.log('     - lead_score (should be increased)');
  console.log('  2. Check email_webhook_events table for audit trail');
  console.log('  3. Verify lead status progression: NEW → OPENED → DOWNLOADED');
  console.log('');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runTests().catch(console.error);
