/**
 * Comprehensive Admin Content Creation API Test - ITERATION 3 (FINAL)
 *
 * ✅ Fixed in Iteration 3:
 * - Popups: displayType 'MODAL' → 'modal' (lowercase enum)
 * - Events: Remove extra fields not in schema
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3005;
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

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

  if (response.status === 200 && response.data.success && response.data.data.token) {
    console.log('✅ Login successful!');
    results.login = { success: true };
    return response.data.data.token;
  } else {
    console.error('❌ Login failed:', response.status, response.data);
    results.login = { success: false, error: response.data };
    throw new Error('Login failed');
  }
}

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
    content: `Notice content at ${new Date().toISOString()}`,
    excerpt: 'Notice excerpt',
    category: 'GENERAL',
    status: 'PUBLISHED',
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Notice created! ID: ${response.data.data.id}`);
    results.notices = { success: true, id: response.data.data.id };
  } else {
    console.error('❌ Notice failed:', response.status, response.data);
    results.notices = { success: false, error: response.data };
  }
}

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
    content: `Press content at ${new Date().toISOString()}`,
    excerpt: 'Press excerpt',
    category: 'PRESS',
    status: 'PUBLISHED',
    thumbnail_url: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Press created! ID: ${response.data.data.id}`);
    results.press = { success: true, id: response.data.data.id };
  } else {
    console.error('❌ Press failed:', response.status, response.data);
    results.press = { success: false, error: response.data };
  }
}

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
    content: 'Test popup message',
    imageUrl: 'https://via.placeholder.com/600x400',
    linkUrl: 'https://glec.io',
    displayType: 'modal',            // ✅ FIXED: lowercase enum (was 'MODAL')
    isActive: true,
    startDate: `${today}T00:00:00Z`,
    endDate: `${nextWeek}T23:59:59Z`
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Popup created! ID: ${response.data.data.id}`);
    results.popups = { success: true, id: response.data.data.id };
  } else {
    console.error('❌ Popup failed:', response.status, response.data);
    results.popups = { success: false, error: response.data };
  }
}

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
    // ✅ FIXED: Only fields in EventCreateSchema
    title: `E2E Test Event ${timestamp}`,
    slug: `e2e-test-event-${timestamp}`,
    description: `Event at ${new Date().toISOString()}`,
    start_date: startDate,
    end_date: endDate,
    location: 'Online',
    location_details: 'Zoom meeting',
    thumbnail_url: 'https://via.placeholder.com/400x300',
    max_participants: 100,
    status: 'PUBLISHED'  // ✅ DRAFT or PUBLISHED only
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Event created! ID: ${response.data.data.id}`);
    results.events = { success: true, id: response.data.data.id };
  } else {
    console.error('❌ Event failed:', response.status, response.data);
    results.events = { success: false, error: response.data };
  }
}

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
    content: `This is a comprehensive blog post content for testing the admin blog API. The content must be at least 50 characters long to pass schema validation. Created at ${new Date().toISOString()}`,
    excerpt: 'Blog excerpt for testing',
    author: 'GLEC Administrator',     // Required field
    category: 'TECHNICAL',
    tags: ['test', 'e2e'],
    thumbnailUrl: 'https://via.placeholder.com/400x300'
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Blog created! ID: ${response.data.data.id}`);
    results.blog = { success: true, id: response.data.data.id };
  } else {
    console.error('❌ Blog failed:', response.status, response.data);
    results.blog = { success: false, error: response.data };
  }
}

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
    title: `E2E Test Library ${timestamp}`,
    description: `Library item at ${new Date().toISOString()}`,
    category: 'TECHNICAL',
    fileType: 'PDF',
    fileSize: '1024000',              // String type
    fileUrl: 'https://via.placeholder.com/sample.pdf',
    thumbnailUrl: 'https://via.placeholder.com/400x300',
    tags: ['test', 'e2e']
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Library created! ID: ${response.data.data.id}`);
    results.library = { success: true, id: response.data.data.id };
  } else {
    console.error('❌ Library failed:', response.status, response.data);
    results.library = { success: false, error: response.data };
  }
}

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
    description: `Video at ${new Date().toISOString()}`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://via.placeholder.com/400x300',
    duration: '3:45',                 // MM:SS format
    category: 'TECHNICAL',
    tags: ['test', 'e2e']
  });

  if (response.status === 201 && response.data.success) {
    console.log(`✅ Video created! ID: ${response.data.data.id}`);
    results.videos = { success: true, id: response.data.data.id };
  } else {
    console.error('❌ Video failed:', response.status, response.data);
    results.videos = { success: false, error: response.data };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Admin Content API Tests (Iteration 3 - FINAL)...');
  console.log('🌐 Target:', `http://${BASE_URL}:${PORT}`);
  console.log('📝 Changes: Popups displayType=modal (lowercase), Events schema-only fields');
  console.log('======================================================================\n');

  try {
    const token = await login();
    await testNotices(token);
    await testPress(token);
    await testPopups(token);
    await testEvents(token);
    await testBlog(token);
    await testLibrary(token);
    await testVideos(token);

    console.log('\n\n======================================================================');
    console.log('📊 ITERATION 3: FINAL TEST RESULTS');
    console.log('======================================================================');

    const passed = Object.entries(results).filter(([key, val]) => val && val.success).length;
    const total = Object.keys(results).length;

    for (const [key, result] of Object.entries(results)) {
      const icon = result && result.success ? '✅' : '❌';
      const status = result && result.success ? 'PASSED' : 'FAILED';
      const id = result && result.id ? `(ID: ${result.id.substring(0, 8)}...)` : '';
      console.log(`${icon} ${key.padEnd(20)} ${status} ${id}`);
      if (result && !result.success && result.error) {
        console.log(`   └─ ${result.error.error ? result.error.error.message : JSON.stringify(result.error)}`);
      }
    }

    console.log('======================================================================');
    console.log(`📈 Total: ${passed} passed, ${total - passed} failed out of ${total} tests`);
    console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log('======================================================================');

    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! 100% Success Rate! 🎉');
      console.log('======================================================================');
    } else if (passed < total) {
      console.log(`⚠️  ${total - passed} test(s) need attention`);
      console.log('======================================================================');

      Object.entries(results).forEach(([key, result]) => {
        if (result && !result.success) {
          console.log(`❌ ${key} failed:`, result.error.status || '', result.error);
        }
      });
    }
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

runAllTests().catch(console.error);
