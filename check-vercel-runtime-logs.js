/**
 * Check Vercel Runtime Logs
 * Purpose: Fetch runtime logs to debug email sending issue
 */

const VERCEL_TOKEN = '4WjWFbv1BRjxABWdkzCI6jF0';
const DEPLOYMENT_URL = 'glec-website-fyj9jqyja-glecdevs-projects.vercel.app';

async function checkLogs() {
  console.log('🔍 Checking Vercel Runtime Logs');
  console.log('==========================================\n');

  try {
    // Get deployment info
    console.log(`📍 Deployment: ${DEPLOYMENT_URL}\n`);

    const response = await fetch(`https://api.vercel.com/v2/deployments/url/${DEPLOYMENT_URL}`, {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });

    const deployment = await response.json();

    if (!deployment.id) {
      console.error('❌ Failed to get deployment info');
      console.log(JSON.stringify(deployment, null, 2));
      return;
    }

    console.log(`✅ Deployment ID: ${deployment.id}`);
    console.log(`   Status: ${deployment.readyState}`);
    console.log(`   Created: ${new Date(deployment.createdAt).toLocaleString()}\n`);

    // Note: Vercel API doesn't provide direct log access via REST API
    // Logs are only available via CLI or Dashboard
    console.log('📋 To view detailed runtime logs:');
    console.log(`   1. Run: npx vercel logs ${DEPLOYMENT_URL} --token=${VERCEL_TOKEN}`);
    console.log(`   2. Or visit: https://vercel.com/glecdevs-projects/glec-website/${deployment.id}\n`);

    console.log('🔍 Alternative: Test locally to see errors');
    console.log('   Run: npm run dev');
    console.log('   Then: curl http://localhost:3000/api/contact -X POST -H "Content-Type: application/json" -d \'{"company_name":"Test","contact_name":"Test","email":"test@test.com","phone":"010-1234-5678","inquiry_type":"PRODUCT","message":"Test message for debugging","privacy_consent":true}\'');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

checkLogs();
