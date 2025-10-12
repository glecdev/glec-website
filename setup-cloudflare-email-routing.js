/**
 * Cloudflare Email Routing Setup via API
 * Purpose: Setup email forwarding for admin@glec.io and contact@glec.io
 */

const CLOUDFLARE_API_TOKEN = 'JPknWNL_t5tNS7ffoeKQZS41nrfSgUcuUpw8hLE3';
const DOMAIN = 'glec.io';
const FORWARD_TO_EMAIL = 'oillex.co.kr@gmail.com';

async function setupEmailRouting() {
  console.log('🔧 Cloudflare Email Routing Setup');
  console.log('==========================================\n');

  try {
    // Step 1: Get Zone ID
    console.log(`📍 Step 1: Getting Zone ID for ${DOMAIN}...\n`);

    const zonesResponse = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const zonesData = await zonesResponse.json();

    if (!zonesData.success || zonesData.result.length === 0) {
      console.error('❌ Failed to get zone ID');
      console.error(JSON.stringify(zonesData, null, 2));
      return;
    }

    const zoneId = zonesData.result[0].id;
    console.log(`✅ Zone ID: ${zoneId}\n`);

    // Step 2: Enable Email Routing
    console.log(`📧 Step 2: Enabling Email Routing for ${DOMAIN}...\n`);

    const enableResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/enable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const enableData = await enableResponse.json();

    if (enableData.success) {
      console.log('✅ Email Routing enabled\n');
    } else {
      console.log('⚠️ Email Routing may already be enabled or failed');
      console.log(JSON.stringify(enableData, null, 2));
      console.log('');
    }

    // Step 3: Get DNS records status
    console.log(`📋 Step 3: Checking DNS records...\n`);

    const dnsStatusResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/dns`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const dnsStatusData = await dnsStatusResponse.json();

    if (dnsStatusData.success) {
      console.log('DNS Records Status:');
      console.log(JSON.stringify(dnsStatusData.result, null, 2));
      console.log('');
    }

    // Step 4: Add Destination Address (verify oillex.co.kr@gmail.com)
    console.log(`📮 Step 4: Adding destination address: ${FORWARD_TO_EMAIL}...\n`);

    const destResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: FORWARD_TO_EMAIL,
      }),
    });

    const destData = await destResponse.json();

    if (destData.success) {
      console.log(`✅ Destination address added: ${FORWARD_TO_EMAIL}`);
      console.log(`📧 Verification email sent to ${FORWARD_TO_EMAIL}`);
      console.log('⚠️ IMPORTANT: Check inbox and click verification link!\n');
    } else if (destData.errors && destData.errors.some(e => e.message.includes('already exists'))) {
      console.log(`⚠️ Destination address already exists: ${FORWARD_TO_EMAIL}\n`);
    } else {
      console.log('❌ Failed to add destination address');
      console.log(JSON.stringify(destData, null, 2));
      console.log('');
    }

    // Step 5: Create routing rules
    console.log('📬 Step 5: Creating email routing rules...\n');

    const routes = [
      { matcher: 'admin@glec.io', action: FORWARD_TO_EMAIL },
      { matcher: 'contact@glec.io', action: FORWARD_TO_EMAIL },
    ];

    for (const route of routes) {
      console.log(`Creating rule: ${route.matcher} → ${route.action}...`);

      const routeResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true,
          matchers: [
            {
              type: 'literal',
              field: 'to',
              value: route.matcher,
            },
          ],
          actions: [
            {
              type: 'forward',
              value: [route.action],
            },
          ],
          priority: 0,
        }),
      });

      const routeData = await routeResponse.json();

      if (routeData.success) {
        console.log(`✅ Rule created: ${route.matcher} → ${route.action}`);
        console.log(`   Rule ID: ${routeData.result.id}\n`);
      } else if (routeData.errors && routeData.errors.some(e => e.message.includes('already exists'))) {
        console.log(`⚠️ Rule already exists: ${route.matcher}\n`);
      } else {
        console.log(`❌ Failed to create rule: ${route.matcher}`);
        console.log(JSON.stringify(routeData, null, 2));
        console.log('');
      }
    }

    // Step 6: List all routing rules
    console.log('📋 Step 6: Listing all routing rules...\n');

    const listResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/email/routing/rules`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const listData = await listResponse.json();

    if (listData.success && listData.result.length > 0) {
      console.log('Current Routing Rules:');
      listData.result.forEach((rule, index) => {
        console.log(`\n${index + 1}. ${rule.enabled ? '✅' : '❌'} ${rule.matchers[0].value}`);
        console.log(`   → ${rule.actions[0].value.join(', ')}`);
        console.log(`   ID: ${rule.id}`);
      });
    } else {
      console.log('No routing rules found');
    }

    console.log('\n====================================');
    console.log('✅ SETUP COMPLETE');
    console.log('====================================\n');

    console.log('📬 Next Steps:');
    console.log(`   1. Check ${FORWARD_TO_EMAIL} inbox for Cloudflare verification email`);
    console.log('   2. Click verification link to activate forwarding');
    console.log(`   3. Send test email to admin@${DOMAIN}`);
    console.log(`   4. Send test email to contact@${DOMAIN}`);
    console.log(`   5. Verify forwarded emails arrive at ${FORWARD_TO_EMAIL}\n`);

  } catch (error) {
    console.error('\n❌ SETUP ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run setup
setupEmailRouting()
  .then(() => {
    console.log('✅ Setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
