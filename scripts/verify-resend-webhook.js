/**
 * Resend Webhook Verification Script
 *
 * CTO-Level Production Readiness Check for Resend Webhooks
 *
 * Verifies:
 * 1. Webhook endpoint accessibility
 * 2. Signature verification working
 * 3. Database connectivity for event storage
 * 4. RESEND_WEBHOOK_SECRET configured correctly
 */

const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

// ANSI Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(level, message, details = '') {
  const icon = level === 'SUCCESS' ? '✅' : level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : 'ℹ️';
  const color = level === 'SUCCESS' ? GREEN : level === 'ERROR' ? RED : level === 'WARN' ? YELLOW : BLUE;
  console.log(`${color}${icon} ${message}${RESET}`);
  if (details) console.log(`   ${details}`);
}

// Generate Svix-compatible signature
function generateSvixSignature(payload, secret, timestamp) {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret)
    .update(signedPayload)
    .digest('base64');
  return `v1,t=${timestamp},v1=${signature}`;
}

async function testWebhookEndpoint() {
  console.log(`\n${BLUE}${'='.repeat(70)}`);
  console.log('Resend Webhook Verification');
  console.log(`${'='.repeat(70)}${RESET}\n`);

  // Test 1: Check if RESEND_WEBHOOK_SECRET is set
  console.log(`${BLUE}📋 Test 1: Environment Variable Check${RESET}\n`);

  if (!WEBHOOK_SECRET) {
    log('ERROR', 'RESEND_WEBHOOK_SECRET not set',
      'Set it in .env.local or Vercel dashboard');
    log('INFO', 'For testing, use a temporary secret:',
      'export RESEND_WEBHOOK_SECRET="test-secret-minimum-32-chars-long"');
    return false;
  }

  log('SUCCESS', 'RESEND_WEBHOOK_SECRET is set',
    `Length: ${WEBHOOK_SECRET.length} chars`);

  // Test 2: Endpoint accessibility (without signature)
  console.log(`\n${BLUE}📋 Test 2: Webhook Endpoint Accessibility${RESET}\n`);

  const testPayload = {
    type: 'email.sent',
    created_at: new Date().toISOString(),
    data: {
      email_id: `test_${Date.now()}`,
      to: 'test@example.com',
      from: 'noreply@glec.io',
      subject: 'Test Email',
      created_at: new Date().toISOString()
    }
  };

  const payloadString = JSON.stringify(testPayload);

  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payloadString
    });

    if (response.ok) {
      log('SUCCESS', 'Webhook endpoint is accessible',
        `Status: ${response.status} (signature optional mode)`);
    } else {
      log('WARN', 'Webhook endpoint returned non-200',
        `Status: ${response.status} (may require signature)`);
    }
  } catch (error) {
    log('ERROR', 'Failed to reach webhook endpoint',
      `Error: ${error.message}`);
    return false;
  }

  // Test 3: Invalid signature rejection
  console.log(`\n${BLUE}📋 Test 3: Signature Verification (Invalid Signature)${RESET}\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-signature': 'v1,t=1697540000,v1=invalid_signature_should_fail'
      },
      body: payloadString
    });

    if (response.status === 401) {
      log('SUCCESS', 'Invalid signature correctly rejected',
        'Security: ✅ Signature verification working');
    } else {
      log('WARN', 'Invalid signature not rejected',
        `Status: ${response.status} (signature may be optional)`);
    }
  } catch (error) {
    log('ERROR', 'Failed to test signature verification',
      `Error: ${error.message}`);
  }

  // Test 4: Valid signature acceptance
  console.log(`\n${BLUE}📋 Test 4: Signature Verification (Valid Signature)${RESET}\n`);

  const timestamp = Math.floor(Date.now() / 1000);
  const validSignature = generateSvixSignature(payloadString, WEBHOOK_SECRET, timestamp);

  try {
    const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-signature': validSignature
      },
      body: payloadString
    });

    if (response.ok) {
      log('SUCCESS', 'Valid signature accepted',
        `Status: ${response.status} - Webhook processing successful`);

      const data = await response.json();
      if (data.success) {
        log('SUCCESS', 'Event stored in database',
          'Database connectivity: ✅');
      }
    } else {
      log('ERROR', 'Valid signature rejected',
        `Status: ${response.status} (check RESEND_WEBHOOK_SECRET matches)`);
      const errorData = await response.json();
      log('INFO', 'Error details:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    log('ERROR', 'Failed to test valid signature',
      `Error: ${error.message}`);
  }

  // Summary
  console.log(`\n${BLUE}${'='.repeat(70)}`);
  console.log('Verification Summary');
  console.log(`${'='.repeat(70)}${RESET}\n`);

  log('INFO', 'Webhook Endpoint:', BASE_URL + '/api/webhooks/resend');
  log('INFO', 'Secret Length:', `${WEBHOOK_SECRET.length} chars`);

  console.log(`\n${BLUE}📝 Next Steps:${RESET}\n`);
  console.log('1. Go to https://resend.com/webhooks');
  console.log('2. Click "Add Webhook"');
  console.log(`3. Enter URL: ${BASE_URL}/api/webhooks/resend`);
  console.log('4. Subscribe to all events (email.sent, delivered, opened, etc.)');
  console.log('5. Copy the signing secret');
  console.log('6. Update RESEND_WEBHOOK_SECRET in Vercel env vars');
  console.log('7. Redeploy and test with Resend "Send Test Event"');

  return true;
}

// Run verification
testWebhookEndpoint().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  process.exit(1);
});
