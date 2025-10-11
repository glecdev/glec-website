/**
 * Check Resend domains status using Resend API
 * This helps identify if glec.io domain is verified or not
 */

const RESEND_API_KEY = 're_CWuvh2PM_ES4Et3Dv1DFAK5SZrmZJ2ovi';

async function listDomains() {
  console.log('🔍 Resend Domain Status Check');
  console.log('==============================\n');

  try {
    console.log('📡 Fetching domains from Resend API...');

    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const status = response.status;
    const data = await response.json();

    console.log(`\n📥 Response Status: ${status}`);

    if (status === 200) {
      console.log('✅ Successfully fetched domains\n');

      if (data.data && data.data.length > 0) {
        console.log(`📋 Found ${data.data.length} domain(s):\n`);

        data.data.forEach((domain, index) => {
          console.log(`Domain ${index + 1}:`);
          console.log(`  Name: ${domain.name}`);
          console.log(`  Status: ${domain.status}`);
          console.log(`  Region: ${domain.region || 'N/A'}`);
          console.log(`  Created: ${domain.created_at}`);

          if (domain.records) {
            console.log(`  DNS Records:`);
            domain.records.forEach(record => {
              console.log(`    - Type: ${record.type}, Status: ${record.status}`);
            });
          }
          console.log('');
        });

        // Check if glec.io is in the list
        const glecDomain = data.data.find(d => d.name === 'glec.io');

        if (glecDomain) {
          console.log('✅ glec.io domain FOUND');
          console.log(`   Status: ${glecDomain.status}`);

          if (glecDomain.status === 'verified') {
            console.log('   ✅ VERIFIED - Can send emails to any recipient');
          } else {
            console.log('   ⚠️  NOT VERIFIED - Can only send to account owner email');
            console.log('   📝 Action: Verify domain in Resend Dashboard');
          }
        } else {
          console.log('❌ glec.io domain NOT FOUND');
          console.log('   📝 Action: Add glec.io domain in Resend Dashboard');
          console.log('   📍 URL: https://resend.com/domains');
        }
      } else {
        console.log('⚠️  No domains found in Resend account');
        console.log('📝 Action: Add glec.io domain in Resend Dashboard');
      }
    } else {
      console.log('❌ Failed to fetch domains');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

    console.log('\n====================================');
    console.log('📚 Next Steps:');
    console.log('====================================\n');
    console.log('If glec.io NOT found or NOT verified:');
    console.log('1. Visit: https://resend.com/domains');
    console.log('2. Click "Add Domain"');
    console.log('3. Enter: glec.io');
    console.log('4. Add DNS records (SPF, DKIM) to Cloudflare');
    console.log('5. Click "Verify Domain" in Resend Dashboard');
    console.log('6. Wait 5-30 minutes for DNS propagation');
    console.log('7. Re-run: node check-resend-domains.js');
    console.log('\n📖 Full guide: docs/RESEND_DOMAIN_VERIFICATION_GUIDE.md\n');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error('Stack trace:', error.stack);

    console.log('\n====================================');
    console.log('⚠️  Troubleshooting:');
    console.log('====================================\n');
    console.log('1. Check API key is valid');
    console.log('2. Check network connectivity');
    console.log('3. Check Resend API status: https://status.resend.com');
  }
}

// Run check
listDomains()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
