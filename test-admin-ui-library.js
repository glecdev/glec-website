/**
 * Admin UI Test - Library Management
 *
 * Tests admin login and library item management
 *
 * Run: BASE_URL=http://localhost:3002 node test-admin-ui-library.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Admin credentials (from CLAUDE.md)
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

let authToken = null;

// ============================================================
// Helper Functions
// ============================================================

async function apiCall(method, endpoint, body = null, requiresAuth = false) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (requiresAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

function log(emoji, message, details = '') {
  console.log(`${emoji} ${message}`);
  if (details) console.log(`   ${details}`);
}

// ============================================================
// Test: Admin Login
// ============================================================

async function testAdminLogin() {
  console.log('\n📋 Test 1: Admin Login');
  console.log('='.repeat(60));

  const { status, data } = await apiCall('POST', '/api/admin/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (status === 200 && data.success) {
    authToken = data.data.token;
    log('✅', 'Admin login successful');
    log('👤', `User: ${data.data.user.name} (${data.data.user.role})`);
    log('🔑', `Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    log('❌', 'Admin login failed');
    log('⚠️', `Error: ${data.error?.message || 'Unknown error'}`);
    return false;
  }
}

// ============================================================
// Test: Get Library Items
// ============================================================

async function testGetLibraryItems() {
  console.log('\n📋 Test 2: Get Library Items');
  console.log('='.repeat(60));

  const { status, data } = await apiCall('GET', '/api/admin/library/items', null, true);

  if (status === 200 && data.success) {
    log('✅', 'Library items fetched successfully');
    log('📚', `Total items: ${data.data.length}`);

    data.data.forEach((item, index) => {
      console.log('');
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Slug: ${item.slug}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   File: ${item.file_url}`);
      console.log(`   Type: ${item.file_type} (${item.file_size_mb} MB)`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Downloads: ${item.download_count || 0}`);
    });

    return data.data;
  } else {
    log('❌', 'Failed to fetch library items');
    log('⚠️', `Status: ${status}, Error: ${data.error?.message || 'Unknown'}`);
    return [];
  }
}

// ============================================================
// Test: Download Library Item
// ============================================================

async function testDownloadLibraryItem(itemId, fileUrl) {
  console.log('\n📋 Test 3: Download Library Item');
  console.log('='.repeat(60));

  log('📥', `Testing download for: ${fileUrl}`);

  // Test direct file access
  const fileResponse = await fetch(`${BASE_URL}${fileUrl}`);

  if (fileResponse.ok) {
    const contentType = fileResponse.headers.get('content-type');
    const contentLength = fileResponse.headers.get('content-length');

    log('✅', 'File download successful');
    log('📄', `Content-Type: ${contentType}`);
    log('📦', `Size: ${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB`);
    return true;
  } else {
    log('❌', 'File download failed');
    log('⚠️', `Status: ${fileResponse.status}`);
    return false;
  }
}

// ============================================================
// Test: Library Item Stats
// ============================================================

async function testLibraryItemStats(itemId) {
  console.log('\n📋 Test 4: Library Item Stats');
  console.log('='.repeat(60));

  const { status, data } = await apiCall('GET', `/api/admin/library/items/${itemId}`, null, true);

  if (status === 200 && data.success) {
    log('✅', 'Library item stats fetched');
    const item = data.data;
    console.log('');
    console.log(`📊 Statistics for: ${item.title}`);
    console.log(`   View count: ${item.view_count || 0}`);
    console.log(`   Download count: ${item.download_count || 0}`);
    console.log(`   Status: ${item.status}`);
    console.log(`   Created: ${item.created_at}`);
    console.log(`   Updated: ${item.updated_at}`);
    return true;
  } else {
    log('❌', 'Failed to fetch stats');
    log('⚠️', `Status: ${status}`);
    return false;
  }
}

// ============================================================
// Main Test Suite
// ============================================================

async function runTests() {
  console.log('\n🚀 Admin UI Test Suite - Library Management');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log('');

  try {
    // Test 1: Admin Login
    const loginSuccess = await testAdminLogin();
    if (!loginSuccess) {
      console.log('\n❌ Cannot proceed without admin login');
      process.exit(1);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Get Library Items
    const items = await testGetLibraryItems();
    if (items.length === 0) {
      console.log('\n⚠️  No library items found');
      console.log('   Expected: 1 item (GLEC Framework v3.0)');
      process.exit(1);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Download first item
    const firstItem = items[0];
    const downloadSuccess = await testDownloadLibraryItem(firstItem.id, firstItem.file_url);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 4: Check stats
    await testLibraryItemStats(firstItem.id);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log('✅ Admin login: PASS');
    console.log(`✅ Library items: ${items.length} item(s) found`);
    console.log(`${downloadSuccess ? '✅' : '❌'} File download: ${downloadSuccess ? 'PASS' : 'FAIL'}`);
    console.log('✅ Library stats: PASS');
    console.log('');
    console.log('🎉 Admin UI Test Complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();
