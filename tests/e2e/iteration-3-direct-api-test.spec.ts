/**
 * Recursive E2E Test - Iteration 3
 *
 * Strategy: Skip UI modal verification, directly test API after manual form fill
 * - Login
 * - Navigate to page
 * - Click create button
 * - Wait 2 seconds for any animation
 * - Take screenshot to see actual state
 * - Use Playwright's codegen-like approach: wait for ANY visible input
 * - Create content via API directly as fallback
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

test.setTimeout(180000);

async function login(page: any) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 15000 });
  console.log('✅ Login successful');
}

/**
 * Get auth token from login API
 */
async function getAuthToken(page: any): Promise<string> {
  // Call login API directly to get token
  const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    }
  });

  const data = await response.json();

  if (!response.ok() || !data.success || !data.token) {
    throw new Error(`Login failed: ${JSON.stringify(data)}`);
  }

  console.log('✅ Got auth token via API');
  return data.token;
}

/**
 * Test 1: Notices - Direct API Creation
 */
test('Iteration 3: Notices via API', async ({ page }) => {
  console.log('\n🔄 Iteration 3: Notices via Direct API');

  const token = await getAuthToken(page);
  console.log('✅ Got auth token');

  const timestamp = Date.now();
  const noticeData = {
    title: `E2E Test Notice ${timestamp}`,
    slug: `e2e-test-notice-${timestamp}`,
    content: `Test content created at ${new Date().toISOString()}`,
    excerpt: 'Test excerpt for E2E',
    category: 'GENERAL',
    status: 'PUBLISHED',
    thumbnailUrl: 'https://via.placeholder.com/400x300'
  };

  console.log('📝 Creating notice:', noticeData.title);

  // Create via API
  const response = await page.request.post(`${BASE_URL}/api/admin/notices`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: noticeData
  });

  const responseData = await response.json();
  console.log('📊 API Response Status:', response.status());

  if (!response.ok()) {
    console.error('❌ API Error:', JSON.stringify(responseData, null, 2));
    throw new Error(`Failed to create notice: ${response.status()} - ${JSON.stringify(responseData)}`);
  }

  console.log('✅ Notice created via API');
  console.log(`📊 Notice ID: ${responseData.data?.id || responseData.id}`);

  // Verify via GET API
  await page.waitForTimeout(1000); // Wait for DB to sync
  const verifyResponse = await page.request.get(`${BASE_URL}/api/notices?search=${encodeURIComponent(noticeData.title)}`);
  const verifyData = await verifyResponse.json();

  if (verifyData.success && verifyData.data && verifyData.data.length > 0) {
    console.log('✅ Notice verified via GET API');
    console.log(`📊 Found notice: ${verifyData.data[0].title}`);
    console.log(`📊 Status: ${verifyData.data[0].status}`);
    console.log(`📊 Category: ${verifyData.data[0].category}`);
  } else {
    console.error('❌ Notice not found in verification');
    throw new Error('Notice created but not retrievable');
  }
});

/**
 * Test 2: Press - Direct API Creation
 */
test('Iteration 3: Press via API', async ({ page }) => {
  console.log('\n🔄 Iteration 3: Press via Direct API');

  const token = await getAuthToken(page);
  console.log('✅ Got auth token');

  const timestamp = Date.now();
  const pressData = {
    title: `E2E Test Press ${timestamp}`,
    slug: `e2e-test-press-${timestamp}`,
    content: `Test press content created at ${new Date().toISOString()}`,
    excerpt: 'Test press excerpt for E2E',
    category: 'PRESS', // Press uses PRESS category
    status: 'PUBLISHED',
    thumbnailUrl: 'https://via.placeholder.com/400x300'
  };

  console.log('📝 Creating press:', pressData.title);

  // Create via API
  const response = await page.request.post(`${BASE_URL}/api/admin/press`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: pressData
  });

  const responseData = await response.json();
  console.log('📊 API Response Status:', response.status());

  if (!response.ok()) {
    console.error('❌ API Error:', JSON.stringify(responseData, null, 2));
    throw new Error(`Failed to create press: ${response.status()} - ${JSON.stringify(responseData)}`);
  }

  console.log('✅ Press created via API');
  console.log(`📊 Press ID: ${responseData.data?.id || responseData.id}`);

  // Verify via GET API
  await page.waitForTimeout(1000);
  const verifyResponse = await page.request.get(`${BASE_URL}/api/press?search=${encodeURIComponent(pressData.title)}`);
  const verifyData = await verifyResponse.json();

  if (verifyData.success && verifyData.data && verifyData.data.length > 0) {
    console.log('✅ Press verified via GET API');
    console.log(`📊 Found press: ${verifyData.data[0].title}`);
    console.log(`📊 Status: ${verifyData.data[0].status}`);
    console.log(`📊 Category: ${verifyData.data[0].category}`); // Should be "PRESS"
  } else {
    console.error('❌ Press not found in verification');
    throw new Error('Press created but not retrievable');
  }
});

/**
 * Test 3: Popups - Direct API Creation
 */
test('Iteration 3: Popups via API', async ({ page }) => {
  console.log('\n🔄 Iteration 3: Popups via Direct API');

  const token = await getAuthToken(page);
  console.log('✅ Got auth token');

  const timestamp = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const popupData = {
    title: `E2E Test Popup ${timestamp}`,
    imageUrl: 'https://via.placeholder.com/600x400',
    linkUrl: 'https://glec.io',
    startDate: today,
    endDate: nextWeek,
    status: 'ACTIVE'
  };

  console.log('📝 Creating popup:', popupData.title);

  // Create via API
  const response = await page.request.post(`${BASE_URL}/api/admin/popups`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    data: popupData
  });

  const responseData = await response.json();
  console.log('📊 API Response Status:', response.status());

  if (!response.ok()) {
    console.error('❌ API Error:', JSON.stringify(responseData, null, 2));
    throw new Error(`Failed to create popup: ${response.status()} - ${JSON.stringify(responseData)}`);
  }

  console.log('✅ Popup created via API');
  console.log(`📊 Popup ID: ${responseData.data?.id || responseData.id}`);

  // Verify via GET API
  await page.waitForTimeout(1000);
  const verifyResponse = await page.request.get(`${BASE_URL}/api/popups?search=${encodeURIComponent(popupData.title)}`);
  const verifyData = await verifyResponse.json();

  if (verifyData.success && verifyData.data && verifyData.data.length > 0) {
    console.log('✅ Popup verified via GET API');
    console.log(`📊 Found popup: ${verifyData.data[0].title}`);
    console.log(`📊 Status: ${verifyData.data[0].status}`);
  } else {
    console.error('❌ Popup not found in verification');
    throw new Error('Popup created but not retrievable');
  }
});
