/**
 * Wait for Zoom Scopes
 *
 * Purpose: Poll Zoom API until webinar scopes are available
 */

require('dotenv').config({ path: '.env.local' });

const MAX_ATTEMPTS = 12; // 12 attempts * 10 seconds = 2 minutes
const RETRY_INTERVAL = 10000; // 10 seconds

async function testZoomScopes() {
  const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
  const CLIENT_ID = process.env.ZOOM_CLIENT_ID;
  const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

  // Get fresh access token
  const tokenResponse = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Test webinar API
  const webinarTest = await fetch('https://api.zoom.us/v2/users/me/webinars', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return webinarTest.ok;
}

async function waitForScopes() {
  console.log('⏳ Waiting for Zoom webinar scopes to be available...\n');
  console.log('📋 Instructions:');
  console.log('   1. Go to https://marketplace.zoom.us/develop/apps');
  console.log('   2. Select your Server-to-Server OAuth app');
  console.log('   3. Go to "Scopes" tab');
  console.log('   4. Add ALL these scopes:');
  console.log('      ✓ webinar:write:webinar');
  console.log('      ✓ webinar:write:webinar:admin');
  console.log('      ✓ webinar:read:webinar');
  console.log('      ✓ webinar:read:list_webinars');
  console.log('      ✓ webinar:read:list_webinars:admin');
  console.log('   5. Click "Save"');
  console.log('\n⏰ This script will poll every 10 seconds for up to 2 minutes...\n');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    process.stdout.write(`[Attempt ${attempt}/${MAX_ATTEMPTS}] Testing... `);

    try {
      const scopesAvailable = await testZoomScopes();

      if (scopesAvailable) {
        console.log('✅ SUCCESS!\n');
        console.log('🎉 Zoom webinar scopes are now available!');
        console.log('   You can now run: node scripts/test-webinar-e2e.js');
        process.exit(0);
      } else {
        console.log('❌ Not yet');
      }
    } catch (error) {
      console.log(`⚠️  Error: ${error.message}`);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  console.log('\n⏰ Timeout reached.');
  console.log('   Please verify scopes were added correctly and try again.');
  process.exit(1);
}

waitForScopes();
