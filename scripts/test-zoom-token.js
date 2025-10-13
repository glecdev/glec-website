/**
 * Test Zoom Token Scopes
 *
 * Purpose: Verify Zoom access token has webinar scopes
 */

require('dotenv').config({ path: '.env.local' });

async function testZoomToken() {
  console.log('🔍 Testing Zoom access token scopes...\n');

  const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
  const CLIENT_ID = process.env.ZOOM_CLIENT_ID;
  const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

  if (!ACCOUNT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing Zoom credentials in .env.local');
    console.error('   Required: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET');
    process.exit(1);
  }

  console.log('📋 Zoom Credentials:');
  console.log(`   Account ID: ${ACCOUNT_ID}`);
  console.log(`   Client ID: ${CLIENT_ID}`);
  console.log(`   Client Secret: ${CLIENT_SECRET.substring(0, 10)}...`);

  // Step 1: Get Access Token
  console.log('\n📋 Step 1: Getting new access token...');

  try {
    const tokenResponse = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error(`❌ Failed to get access token: ${tokenResponse.status}`);
      console.error(`   Response: ${error}`);
      process.exit(1);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('✅ Access token obtained');
    console.log(`   Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   Expires in: ${tokenData.expires_in} seconds`);

    // Step 2: Test Meeting API (existing scope)
    console.log('\n📋 Step 2: Testing Meeting API (meeting:write scope)...');

    const meetingTest = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (meetingTest.ok) {
      console.log('✅ Meeting API works (meeting:write scope present)');
    } else {
      const error = await meetingTest.json();
      console.log(`❌ Meeting API failed: ${error.message}`);
    }

    // Step 3: Test Webinar API (new scope)
    console.log('\n📋 Step 3: Testing Webinar API (webinar:write scope)...');

    const webinarTest = await fetch('https://api.zoom.us/v2/users/me/webinars', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (webinarTest.ok) {
      console.log('✅ Webinar API works (webinar:write scope present)');
      console.log('\n🎉 All scopes verified! Webinar automation is ready!');
      process.exit(0);
    } else {
      const error = await webinarTest.json();
      console.log(`❌ Webinar API failed: ${error.code} - ${error.message}`);

      if (error.code === 4711) {
        console.log('\n⚠️  Action Required:');
        console.log('   1. Go to https://marketplace.zoom.us/develop/apps');
        console.log('   2. Select your Server-to-Server OAuth app');
        console.log('   3. Go to "Scopes" tab');
        console.log('   4. Add these scopes:');
        console.log('      - webinar:write:webinar');
        console.log('      - webinar:write:webinar:admin');
        console.log('      - webinar:read:webinar');
        console.log('   5. Click "Save"');
        console.log('   6. Wait 1-2 minutes for Zoom to propagate changes');
        console.log('   7. Run this script again');
      }

      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Exception:', error.message);
    process.exit(1);
  }
}

testZoomToken();
