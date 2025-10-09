// Comprehensive Admin Content Creation API Test
// Tests all 6 content types: Notices, Press, Popups, Events, Blog, Library, Videos

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3002;
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

// Test results tracker
const results = {
  login: null,
  notices: null,
  press: null,
  popups: null,
  events: null,
  blog: null,
  library: null,
  videos: null
};

// Helper: Make HTTP request
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Step 1: Login and get token
async function login() {
  console.log('\n🔐 Step 1: Login to Admin API...');

  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  if (response.status === 200 && response.data.success && response.data.data && response.data.data.token) {
    const token = response.data.data.token;
    const userId = response.data.data.user.id;
    console.log(`✅ Login successful! User ID: ${userId}`);
    results.login = { success: true, token, userId };
    return token;
  } else {
    console.error('❌ Login failed:', response.data);
    results.login = { success: false, error: response.data };
    throw new Error('Login failed');
  }
}

// Step 2: Test Notices POST
async function testNotices(token) {
  console.log('\n📰 Step 2: Testing Notices POST API...');

  const timestamp = Date.now();
  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/notices',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `E2E Test Notice ${timestamp}`,
    content: `Test content created at ${new Date().toISOString()}`,
    excerpt: 'Test excerpt for E2E testing',
    category: 'GENERAL',
    status: 'PUBLISHED',
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Notice created! ID: ${response.data.data.id}`);
    results.notices = { success: true, id: response.data.data.id, title: response.data.data.title };
  } else {
    console.error('❌ Notice creation failed:', response.status, response.data);
    results.notices = { success: false, error: response.data };
  }
}

// Step 3: Test Press POST
async function testPress(token) {
  console.log('\n📰 Step 3: Testing Press POST API...');

  const timestamp = Date.now();
  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/press',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `E2E Test Press ${timestamp}`,
    content: `Press release content created at ${new Date().toISOString()}`,
    excerpt: 'Press excerpt for E2E testing',
    category: 'PRESS',
    status: 'PUBLISHED',
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Press created! ID: ${response.data.data.id}`);
    results.press = { success: true, id: response.data.data.id, title: response.data.data.title };
  } else {
    console.error('❌ Press creation failed:', response.status, response.data);
    results.press = { success: false, error: response.data };
  }
}

// Step 4: Test Popups POST
async function testPopups(token) {
  console.log('\n🪟 Step 4: Testing Popups POST API...');

  const timestamp = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/popups',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `E2E Test Popup ${timestamp}`,
    content: 'This is a test popup message',
    image_url: 'https://via.placeholder.com/600x400',
    link_url: 'https://glec.io',
    display_type: 'modal',
    start_date: today,
    end_date: nextWeek,
    status: 'ACTIVE'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Popup created! ID: ${response.data.data.id}`);
    results.popups = { success: true, id: response.data.data.id, title: response.data.data.title };
  } else {
    console.error('❌ Popup creation failed:', response.status, response.data);
    results.popups = { success: false, error: response.data };
  }
}

// Step 5: Test Events POST
async function testEvents(token) {
  console.log('\n📅 Step 5: Testing Events POST API...');

  const timestamp = Date.now();
  const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString();

  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `E2E Test Event ${timestamp}`,
    description: `Event description created at ${new Date().toISOString()}`,
    status: 'PUBLISHED',
    event_type: 'WEBINAR',
    start_date: startDate,
    end_date: endDate,
    location: 'Online',
    max_participants: 100,
    registration_deadline: startDate,
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Event created! ID: ${response.data.data.id}`);
    results.events = { success: true, id: response.data.data.id, title: response.data.data.title };
  } else {
    console.error('❌ Event creation failed:', response.status, response.data);
    results.events = { success: false, error: response.data };
  }
}

// Step 6: Test Blog POST
async function testBlog(token) {
  console.log('\n📝 Step 6: Testing Blog POST API...');

  const timestamp = Date.now();
  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/knowledge/blog',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `E2E Test Blog ${timestamp}`,
    content: `Blog content created at ${new Date().toISOString()}`,
    excerpt: 'Blog excerpt for E2E testing',
    category: 'TECHNICAL',
    status: 'PUBLISHED',
    tags: ['test', 'e2e', 'automation'],
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Blog created! ID: ${response.data.data.id}`);
    results.blog = { success: true, id: response.data.data.id, title: response.data.data.title };
  } else {
    console.error('❌ Blog creation failed:', response.status, response.data);
    results.blog = { success: false, error: response.data };
  }
}

// Step 7: Test Library POST
async function testLibrary(token) {
  console.log('\n📚 Step 7: Testing Library POST API...');

  const timestamp = Date.now();
  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/knowledge/library',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `E2E Test Library Document ${timestamp}`,
    description: `Library document created at ${new Date().toISOString()}`,
    category: 'TECHNICAL',
    file_type: 'PDF',
    file_url: 'https://via.placeholder.com/sample.pdf',
    file_size: 1024000,
    status: 'PUBLISHED',
    tags: ['test', 'e2e'],
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Library document created! ID: ${response.data.data.id}`);
    results.library = { success: true, id: response.data.data.id, title: response.data.data.title };
  } else {
    console.error('❌ Library creation failed:', response.status, response.data);
    results.library = { success: false, error: response.data };
  }
}

// Step 8: Test Videos POST
async function testVideos(token) {
  console.log('\n🎥 Step 8: Testing Videos POST API...');

  const timestamp = Date.now();
  const response = await makeRequest({
    hostname: BASE_URL,
    port: PORT,
    path: '/api/admin/knowledge/videos',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, {
    title: `E2E Test Video ${timestamp}`,
    description: `Video description created at ${new Date().toISOString()}`,
    youtube_video_id: 'dQw4w9WgXcQ',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tab: 'TUTORIALS',
    duration_seconds: 180,
    status: 'PUBLISHED',
    tags: ['test', 'e2e'],
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Video created! ID: ${response.data.data.id}`);
    results.videos = { success: true, id: response.data.data.id, title: response.data.data.title };
  } else {
    console.error('❌ Video creation failed:', response.status, response.data);
    results.videos = { success: false, error: response.data };
  }
}

// Print summary
function printSummary() {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE API TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  const tests = [
    { name: 'Login', result: results.login },
    { name: 'Notices', result: results.notices },
    { name: 'Press', result: results.press },
    { name: 'Popups', result: results.popups },
    { name: 'Events', result: results.events },
    { name: 'Blog', result: results.blog },
    { name: 'Library', result: results.library },
    { name: 'Videos', result: results.videos }
  ];

  let passedCount = 0;
  let failedCount = 0;

  tests.forEach(({ name, result }) => {
    if (result && result.success) {
      console.log(`✅ ${name.padEnd(20)} PASSED ${result.id ? `(ID: ${result.id})` : ''}`);
      passedCount++;
    } else {
      console.log(`❌ ${name.padEnd(20)} FAILED`);
      failedCount++;
    }
  });

  console.log('='.repeat(60));
  console.log(`📈 Total: ${passedCount} passed, ${failedCount} failed out of ${tests.length} tests`);
  console.log(`📊 Success Rate: ${((passedCount / tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

// Main execution
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Admin Content API Tests...');
  console.log(`🌐 Target: http://${BASE_URL}:${PORT}`);
  console.log('='.repeat(60));

  try {
    const token = await login();

    await testNotices(token);
    await testPress(token);
    await testPopups(token);
    await testEvents(token);
    await testBlog(token);
    await testLibrary(token);
    await testVideos(token);

    printSummary();

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    printSummary();
    process.exit(1);
  }
}

runAllTests();
