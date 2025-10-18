/**
 * Test File Upload API
 *
 * Creates a test library item, then uploads a file to it
 *
 * Run: BASE_URL=http://localhost:3002 node test-file-upload.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Admin credentials
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

let authToken = null;

async function login() {
  console.log('🔐 Logging in as admin...\n');

  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  const data = await response.json();

  if (data.success) {
    authToken = data.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...\n`);
    return true;
  } else {
    console.log('❌ Login failed:', data.error?.message);
    return false;
  }
}

async function createTestItem() {
  console.log('📝 Creating test library item...\n');

  const response = await fetch(`${BASE_URL}/api/admin/library/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: `테스트 파일 업로드 ${Date.now()}`,
      slug: `test-upload-${Date.now()}`,
      description: '파일 업로드 API 테스트용 항목',
      file_url: 'https://placeholder.com/temp', // Will be replaced by upload
      file_type: 'PDF',
      download_type: 'DIRECT',
      category: 'OTHER',
      tags: ['test', 'upload'],
      language: 'ko',
      requires_form: false,
      status: 'DRAFT',
    }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ Library item created');
    console.log(`   ID: ${data.data.id}`);
    console.log(`   Title: ${data.data.title}\n`);
    return data.data.id;
  } else {
    console.log('❌ Failed to create item:', data.error?.message);
    return null;
  }
}

async function uploadFile(itemId) {
  console.log('📤 Uploading file...\n');

  // Use existing GLEC Framework PDF
  const testFilePath = path.join(__dirname, 'public', 'library', 'GLEC_FRAMEWORK_v3_UPDATED_1117.pdf');

  if (!fs.existsSync(testFilePath)) {
    console.log('❌ Test file not found:', testFilePath);
    return false;
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(testFilePath));
  formData.append('item_id', itemId);

  const response = await fetch(`${BASE_URL}/api/admin/library/items/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ File uploaded successfully');
    console.log(`   File URL: ${data.data.file_url}`);
    console.log(`   File Type: ${data.data.file_type}`);
    console.log(`   File Size: ${data.data.file_size_mb} MB`);
    console.log(`   Filename: ${data.data.filename}\n`);
    return true;
  } else {
    console.log('❌ Upload failed:', data.error?.message);
    console.log(`   Details: ${data.error?.details || 'N/A'}\n`);
    return false;
  }
}

async function verifyUpload(itemId) {
  console.log('🔍 Verifying uploaded file...\n');

  const response = await fetch(`${BASE_URL}/api/admin/library/items/${itemId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    const item = data.data;
    console.log('✅ Library item updated');
    console.log(`   Title: ${item.title}`);
    console.log(`   File URL: ${item.file_url}`);
    console.log(`   File Type: ${item.file_type}`);
    console.log(`   File Size: ${item.file_size_mb} MB`);
    console.log(`   Download Type: ${item.download_type}\n`);
    return true;
  } else {
    console.log('❌ Verification failed:', data.error?.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 File Upload API Test\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Login
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.log('\n❌ Cannot proceed without login');
      process.exit(1);
    }

    // Step 2: Create test item
    const itemId = await createTestItem();
    if (!itemId) {
      console.log('\n❌ Cannot proceed without library item');
      process.exit(1);
    }

    // Step 3: Upload file
    const uploadSuccess = await uploadFile(itemId);
    if (!uploadSuccess) {
      console.log('\n❌ File upload failed');
      process.exit(1);
    }

    // Step 4: Verify
    const verifySuccess = await verifyUpload(itemId);

    // Summary
    console.log('='.repeat(60));
    console.log('📊 Test Summary\n');
    console.log('✅ Login: PASS');
    console.log('✅ Create item: PASS');
    console.log(`${uploadSuccess ? '✅' : '❌'} Upload file: ${uploadSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`${verifySuccess ? '✅' : '❌'} Verify: ${verifySuccess ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log('🎉 File Upload API Test Complete!');

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Test crashed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
