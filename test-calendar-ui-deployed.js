/**
 * Test Calendar UI Deployment
 * Check if monthly calendar is deployed to production
 */

const https = require('https');

const PRODUCTION_URL = 'https://glec-website.vercel.app';
const TEST_TOKEN = '1768a24822880c903ea85a43747b39b0c9869b82d6334bd771e3c51dddbdd8af';

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

async function testCalendarUIDeployed() {
  console.log('🧪 Calendar UI Deployment Test');
  console.log(`📍 Testing URL: ${PRODUCTION_URL}/meetings/schedule/${TEST_TOKEN}\n`);

  try {
    const result = await fetchPage(`${PRODUCTION_URL}/meetings/schedule/${TEST_TOKEN}`);

    console.log(`📊 Status Code: ${result.status}`);
    console.log(`📄 HTML Length: ${result.html.length} characters\n`);

    // Check for calendar-specific elements
    const checks = {
      'Monthly Calendar': result.html.includes('grid grid-cols-7') || result.html.includes('grid-cols-7'),
      'Day Headers (일월화...)': result.html.includes('일') && result.html.includes('월') && result.html.includes('화'),
      'Calendar Grid': result.html.includes('aspect-square'),
      'Date Selection State': result.html.includes('selectedDate'),
      'Old Date List UI': result.html.includes('sortedDates.map'),
    };

    console.log('🔍 UI Element Detection:');
    console.log('━'.repeat(70));
    Object.entries(checks).forEach(([name, found]) => {
      const icon = found ? '✅' : '❌';
      console.log(`${icon} ${name}: ${found ? 'FOUND' : 'NOT FOUND'}`);
    });
    console.log('━'.repeat(70));

    // Determine deployment status
    const hasNewCalendarUI = checks['Monthly Calendar'] && checks['Calendar Grid'];
    const hasOldUI = checks['Old Date List UI'];

    console.log('\n📦 Deployment Status:');
    if (hasNewCalendarUI && !hasOldUI) {
      console.log('✅ ✅ ✅ NEW CALENDAR UI DEPLOYED ✅ ✅ ✅');
      console.log('\nMonthly calendar is live on production!');
    } else if (hasOldUI && !hasNewCalendarUI) {
      console.log('❌ ❌ ❌ OLD UI STILL DEPLOYED ❌ ❌ ❌');
      console.log('\nPossible causes:');
      console.log('1. Vercel deployment not completed yet');
      console.log('2. Build cache issue (needs rebuild)');
      console.log('3. Wrong deployment branch');
    } else if (hasNewCalendarUI && hasOldUI) {
      console.log('⚠️  MIXED - Both old and new UI code detected');
      console.log('This might be normal during transition.');
    } else {
      console.log('❌ UNKNOWN - Cannot detect UI type');
      console.log('Page might be showing error or loading state.');
    }

    // Check for specific calendar month display
    if (result.html.includes('2025년 10월')) {
      console.log('\n✅ Calendar shows: 2025년 10월');
    }

    // Save HTML for manual inspection
    const fs = require('fs');
    fs.writeFileSync('production-page-snapshot.html', result.html);
    console.log('\n💾 Saved page HTML to: production-page-snapshot.html');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCalendarUIDeployed();
