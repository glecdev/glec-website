// Comprehensive Admin Content Creation API Test - FIXED VERSION
// ✅ Iteration 2: Corrected field names based on actual API schemas

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3002;
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

  if (response.status === 200 && response.data.success && response.data.data && response.data.data.token) {
    const token = response.data.data.token;
    console.log(`✅ Login successful!`);
    results.login = { success: true, token };
    return token;
  } else {
    console.error('❌ Login failed:', response.data);
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
    content: `Test content created at ${new Date().toISOString()}`,
    excerpt: 'Test excerpt',
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
    // ✅ FIXED: camelCase based on PopupCreateSchema
    title: `E2E Test Popup ${timestamp}`,
    content: 'Test popup message',
    imageUrl: 'https://via.placeholder.com/600x400',
    linkUrl: 'https://glec.io',
    displayType: 'MODAL',           // ✅ UPPERCASE enum
    isActive: true,                 // ✅ isActive not status
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
    // ✅ FIXED: snake_case based on EventCreateSchema
    title: `E2E Test Event ${timestamp}`,
    slug: `e2e-test-event-${timestamp}`,
    description: `Event at ${new Date().toISOString()}`,
    start_date: startDate,
    end_date: endDate,
    location: 'Online',
    location_details: 'Zoom meeting',
    thumbnail_url: 'https://via.placeholder.com/400x300',
    max_participants: 100,
    status: 'PUBLISHED'
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
    // ✅ FIXED: camelCase + author field based on BlogPostCreateSchema
    title: `E2E Test Blog ${timestamp}`,
    content: `Blog content created at ${new Date().toISOString()}. This is a long content to meet the 50 character minimum requirement.`,
    excerpt: 'Blog excerpt for E2E testing',
    author: 'GLEC Administrator',     // ✅ Required field
    category: 'TECHNICAL',
    tags: ['test', 'e2e', 'automation'],
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
    // ✅ FIXED: camelCase + fileSize as string based on LibraryItemCreateSchema
    title: `E2E Test Library ${timestamp}`,
    description: `Library document at ${new Date().toISOString()}`,
    category: 'TECHNICAL',
    fileType: 'PDF',
    fileSize: '1024000',              // ✅ String not number
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
    // ✅ FIXED: camelCase + duration format MM:SS based on VideoCreateSchema
    title: `E2E Test Video ${timestamp}`,
    description: `Video at ${new Date().toISOString()}`,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://via.placeholder.com/400x300',
    duration: '3:45',                 // ✅ MM:SS format
    category: 'TUTORIAL',
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

function printSummary() {
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 ITERATION 2: COMPREHENSIVE API TEST RESULTS (FIXED)');
  console.log('='.repeat(70));

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
      console.log(`✅ ${name.padEnd(25)} PASSED ${result.id ? `(ID: ${result.id.substring(0, 8)}...)` : ''}`);
      passedCount++;
    } else {
      console.log(`❌ ${name.padEnd(25)} FAILED`);
      if (result && result.error && result.error.error) {
        console.log(`   └─ ${result.error.error.message || result.error.error.code}`);
      }
      failedCount++;
    }
  });

  console.log('='.repeat(70));
  console.log(`📈 Total: ${passedCount} passed, ${failedCount} failed out of ${tests.length} tests`);
  console.log(`📊 Success Rate: ${((passedCount / tests.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(70));

  if (passedCount === tests.length) {
    console.log('🎉 ALL TESTS PASSED! 100% SUCCESS RATE!');
  } else {
    console.log(`⚠️  ${failedCount} tests need attention`);
  }

  console.log('='.repeat(70));
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Admin Content API Tests (Iteration 2)...');
  console.log(`🌐 Target: http://${BASE_URL}:${PORT}`);
  console.log(`📝 Changes: Fixed field names based on actual API schemas`);
  console.log('='.repeat(70));

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
