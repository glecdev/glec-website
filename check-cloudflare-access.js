/**
 * Check Cloudflare API Token Access
 * Purpose: Verify what zones and permissions the API token has
 */

const CLOUDFLARE_API_TOKEN = 'JPknWNL_t5tNS7ffoeKQZS41nrfSgUcuUpw8hLE3';

async function checkAccess() {
  console.log('🔍 Cloudflare API Token Access Check');
  console.log('==========================================\n');

  try {
    // Step 1: Verify token
    console.log('🔑 Step 1: Verifying API token...\n');

    const verifyResponse = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      console.log('✅ Token is valid\n');
      console.log('Token Info:');
      console.log(JSON.stringify(verifyData.result, null, 2));
      console.log('');
    } else {
      console.log('❌ Token verification failed');
      console.log(JSON.stringify(verifyData, null, 2));
      return;
    }

    // Step 2: List all zones
    console.log('📋 Step 2: Listing all zones...\n');

    const zonesResponse = await fetch('https://api.cloudflare.com/client/v4/zones', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const zonesData = await zonesResponse.json();

    if (zonesData.success && zonesData.result.length > 0) {
      console.log(`✅ Found ${zonesData.result.length} zones:\n`);
      zonesData.result.forEach((zone, index) => {
        console.log(`${index + 1}. ${zone.name}`);
        console.log(`   ID: ${zone.id}`);
        console.log(`   Status: ${zone.status}`);
        console.log(`   Plan: ${zone.plan.name}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No zones found or access denied');
      console.log(JSON.stringify(zonesData, null, 2));
      console.log('');
    }

    // Step 3: Get user info
    console.log('👤 Step 3: Getting user info...\n');

    const userResponse = await fetch('https://api.cloudflare.com/client/v4/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const userData = await userResponse.json();

    if (userData.success) {
      console.log('User Info:');
      console.log(`   Email: ${userData.result.email}`);
      console.log(`   ID: ${userData.result.id}`);
      console.log('');
    }

    console.log('====================================');
    console.log('📊 DIAGNOSIS');
    console.log('====================================\n');

    if (zonesData.result.length === 0) {
      console.log('❌ ISSUE: No zones accessible with this API token\n');
      console.log('Possible Reasons:');
      console.log('  1. API token doesn\'t have "Zone:Read" permission');
      console.log('  2. glec.io is managed by a different Cloudflare account');
      console.log('  3. Token is scoped to specific zones (not glec.io)');
      console.log('\nRecommended Actions:');
      console.log('  1. Go to Cloudflare Dashboard → My Profile → API Tokens');
      console.log('  2. Check token permissions (must include Zone:Read, Email Routing:Edit)');
      console.log('  3. Verify glec.io domain is in this Cloudflare account');
      console.log('  4. Create new API token with correct permissions if needed');
    } else {
      const hasGlecIo = zonesData.result.some(z => z.name === 'glec.io');
      if (!hasGlecIo) {
        console.log('⚠️ ISSUE: glec.io not found in accessible zones\n');
        console.log('Recommendation:');
        console.log('  - Use one of the available zones above, OR');
        console.log('  - Add glec.io to this Cloudflare account, OR');
        console.log('  - Get API token for the account that manages glec.io');
      } else {
        console.log('✅ glec.io zone is accessible!');
      }
    }

  } catch (error) {
    console.error('\n❌ CHECK ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run check
checkAccess()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error.message);
    process.exit(1);
  });
