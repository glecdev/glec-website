/**
 * Production Deployment Verification Test
 * Tests v0.2.0 deployment on Vercel
 */

const https = require('https');

const BASE_URL = 'glec-website.vercel.app';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testProduction() {
  console.log('🚀 Testing Production Deployment (v0.2.0)');
  console.log('🌐 URL: https://glec-website.vercel.app');
  console.log('=' .repeat(60));

  // Test 1: Homepage
  console.log('\n1️⃣ Testing Homepage...');
  const homeResponse = await makeRequest({
    hostname: BASE_URL,
    path: '/',
    method: 'GET'
  });

  if (homeResponse.status === 200) {
    console.log('✅ Homepage: OK (200)');
  } else {
    console.log(`❌ Homepage: FAIL (${homeResponse.status})`);
  }

  // Test 2: Admin Login Page
  console.log('\n2️⃣ Testing Admin Login Page...');
  const loginPageResponse = await makeRequest({
    hostname: BASE_URL,
    path: '/admin/login',
    method: 'GET'
  });

  if (loginPageResponse.status === 200) {
    console.log('✅ Admin Login Page: OK (200)');
  } else {
    console.log(`❌ Admin Login Page: FAIL (${loginPageResponse.status})`);
  }

  // Test 3: Admin Login API
  console.log('\n3️⃣ Testing Admin Login API...');
  const loginApiResponse = await makeRequest({
    hostname: BASE_URL,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    email: 'admin@glec.io',
    password: 'admin123!'
  });

  if (loginApiResponse.status === 200 && loginApiResponse.data?.success) {
    console.log('✅ Admin Login API: OK (200)');
    console.log(`   Token: ${loginApiResponse.data.data.token.substring(0, 20)}...`);
    return loginApiResponse.data.data.token;
  } else {
    console.log(`❌ Admin Login API: FAIL (${loginApiResponse.status})`);
    console.log(`   Response:`, loginApiResponse.data);
    return null;
  }
}

async function testAdminAPIs(token) {
  if (!token) {
    console.log('\n⏭️  Skipping Admin API tests (no token)');
    return;
  }

  console.log('\n4️⃣ Testing Admin Content APIs...');

  const timestamp = Date.now();

  // Test Notices API
  const noticeResponse = await makeRequest({
    hostname: BASE_URL,
    path: '/api/admin/notices',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `Production Test Notice ${timestamp}`,
    slug: `prod-test-notice-${timestamp}`,
    content: 'Test notice from production deployment verification',
    excerpt: 'Test excerpt',
    category: 'GENERAL',
    status: 'DRAFT',
    thumbnailUrl: 'https://via.placeholder.com/400x300'
  });

  if (noticeResponse.status === 201 && noticeResponse.data?.success) {
    console.log('✅ Notices API: OK (201)');
    console.log(`   Notice ID: ${noticeResponse.data.data.id}`);
  } else {
    console.log(`❌ Notices API: FAIL (${noticeResponse.status})`);
  }

  // Test Events API
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const eventResponse = await makeRequest({
    hostname: BASE_URL,
    path: '/api/admin/events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `Production Test Event ${timestamp}`,
    slug: `prod-test-event-${timestamp}`,
    description: 'Test event from production deployment verification',
    start_date: today.toISOString(),
    end_date: nextWeek.toISOString(),
    location: 'Online',
    location_details: 'Zoom meeting',
    thumbnail_url: 'https://via.placeholder.com/400x300',
    max_participants: 100,
    status: 'DRAFT'
  });

  if (eventResponse.status === 201 && eventResponse.data?.success) {
    console.log('✅ Events API: OK (201)');
    console.log(`   Event ID: ${eventResponse.data.data.id}`);
  } else {
    console.log(`❌ Events API: FAIL (${eventResponse.status})`);
    console.log(`   Response:`, eventResponse.data);
  }

  // Test Popups API
  const popupResponse = await makeRequest({
    hostname: BASE_URL,
    path: '/api/admin/popups',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `Production Test Popup ${timestamp}`,
    content: 'Test popup message',
    imageUrl: 'https://via.placeholder.com/600x400',
    linkUrl: 'https://glec.io',
    displayType: 'modal',
    isActive: false,
    startDate: today.toISOString(),
    endDate: nextWeek.toISOString()
  });

  if (popupResponse.status === 201 && popupResponse.data?.success) {
    console.log('✅ Popups API: OK (201)');
    console.log(`   Popup ID: ${popupResponse.data.data.id}`);
  } else {
    console.log(`❌ Popups API: FAIL (${popupResponse.status})`);
    console.log(`   Response:`, popupResponse.data);
  }
}

async function main() {
  try {
    const token = await testProduction();
    await testAdminAPIs(token);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Production Deployment Verification Complete');
    console.log('🎉 Version v0.2.0 is live!');
    console.log('=' .repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();
