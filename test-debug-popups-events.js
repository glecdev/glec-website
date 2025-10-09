/**
 * Debug Test for Popups and Events APIs
 *
 * Purpose: Get detailed error messages from failing Popups/Events POST APIs
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 3003;

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, rawBody: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function debugTest() {
  console.log('🔍 Debug Test: Popups and Events APIs');
  console.log('🌐 Target:', `http://${HOST}:${PORT}`);
  console.log('======================================================================\n');

  // Step 1: Login
  console.log('🔐 Step 1: Login...');
  const loginResponse = await makeRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin@glec.io',
    password: 'admin123!'
  });

  if (!loginResponse.data || !loginResponse.data.success) {
    console.error('❌ Login failed:', loginResponse.data || loginResponse.rawBody);
    return;
  }

  const token = loginResponse.data.data.token;
  console.log('✅ Login successful\n');

  // Step 2: Test Popups with detailed logging
  console.log('🪟 Step 2: Testing Popups POST API...');
  const timestamp = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const popupData = {
    title: `Debug Test Popup ${timestamp}`,
    content: 'Test popup content',
    imageUrl: 'https://via.placeholder.com/600x400',
    linkUrl: 'https://glec.io',
    displayType: 'MODAL',
    isActive: true,
    startDate: `${today}T00:00:00Z`,
    endDate: `${nextWeek}T23:59:59Z`,
    zIndex: 1000,
    showOncePerDay: true,
    position: JSON.stringify({ top: '50%', left: '50%' }),
    size: JSON.stringify({ width: '600px', height: '400px' }),
    backgroundColor: '#ffffff'
  };

  console.log('📝 Request payload:');
  console.log(JSON.stringify(popupData, null, 2));

  const popupResponse = await makeRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/admin/popups',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, popupData);

  console.log('\n📊 Response Status:', popupResponse.status);
  console.log('📊 Response Data:');
  console.log(JSON.stringify(popupResponse.data, null, 2));
  if (!popupResponse.data && popupResponse.rawBody) {
    console.log('📊 Raw Response Body:');
    console.log(popupResponse.rawBody);
  }

  // Step 3: Test Events with detailed logging
  console.log('\n\n📅 Step 3: Testing Events POST API...');
  const eventData = {
    title: `Debug Test Event ${timestamp}`,
    slug: `debug-test-event-${timestamp}`,
    description: 'Test event description for debugging',
    start_date: `${today}T10:00:00Z`,
    end_date: `${today}T12:00:00Z`,
    location: 'Seoul, Korea',
    registration_url: 'https://glec.io/events/register',
    max_participants: 100,
    registration_start_date: `${today}T00:00:00Z`,
    registration_end_date: `${today}T09:00:00Z`,
    status: 'UPCOMING',
    is_online: true,
    tags: ['test', 'debugging'],
    thumbnail_url: 'https://via.placeholder.com/400x300'
  };

  console.log('📝 Request payload:');
  console.log(JSON.stringify(eventData, null, 2));

  const eventResponse = await makeRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/admin/events',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, eventData);

  console.log('\n📊 Response Status:', eventResponse.status);
  console.log('📊 Response Data:');
  console.log(JSON.stringify(eventResponse.data, null, 2));
  if (!eventResponse.data && eventResponse.rawBody) {
    console.log('📊 Raw Response Body:');
    console.log(eventResponse.rawBody);
  }

  console.log('\n======================================================================');
  console.log('🔍 Debug test completed');
  console.log('======================================================================');
}

debugTest().catch(console.error);
