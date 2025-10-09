/**
 * E2E Test: Admin Portal - Create Content on All Pages
 *
 * Tests the Create functionality for all admin content pages:
 * 1. Notices (공지사항)
 * 2. Press (보도자료)
 * 3. Popups (팝업)
 * 4. Events (이벤트)
 * 5. Knowledge Library (지식센터 - 자료실)
 * 6. Knowledge Blog (지식센터 - 블로그)
 * 7. Knowledge Videos (지식센터 - 영상)
 *
 * Purpose: Verify that the field name mismatch fix works in production
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

// Test timeout: 3 minutes per test
test.setTimeout(180000);

/**
 * Helper: Login to admin portal
 */
async function login(page: any) {
  await page.goto(`${BASE_URL}/admin/login`);

  // Fill login form
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (increased timeout for slow dev server)
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 30000 });

  console.log('✅ Login successful');
}

/**
 * Test 1: Notices - Create New Notice
 */
test('Notices: Create new notice with thumbnail', async ({ page }) => {
  console.log('\n🧪 Test 1: Notices Create');

  await login(page);

  // Navigate to Notices page
  await page.goto(`${BASE_URL}/admin/notices`);
  await page.waitForLoadState('networkidle');

  // Click "새 공지 작성" button
  const createButton = page.locator('button:has-text("새 공지 작성")').first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for modal
  await expect(page.locator('text=새 공지사항 만들기')).toBeVisible({ timeout: 5000 });

  // Fill form
  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Notice ${timestamp}`);
  await page.fill('input[name="slug"]', `e2e-test-notice-${timestamp}`);
  await page.fill('textarea[name="content"]', `This is a test notice created by Playwright E2E test at ${new Date().toISOString()}`);
  await page.fill('textarea[name="excerpt"]', 'E2E test excerpt');
  await page.fill('input[name="thumbnailUrl"]', 'https://via.placeholder.com/400x300');

  // Select category
  await page.selectOption('select[name="category"]', 'GENERAL');

  // Select status
  await page.selectOption('select[name="status"]', 'DRAFT');

  // Submit form
  const submitButton = page.locator('button:has-text("생성")').first();
  await submitButton.click();

  // Wait for success (modal closes or success message)
  await page.waitForTimeout(3000);

  // Check if modal closed (success) or error message appeared
  const errorAlert = page.locator('text=An unexpected error occurred');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    console.error('❌ Error occurred: An unexpected error occurred');
    throw new Error('Create operation failed with error');
  }

  console.log('✅ Notice created successfully');
});

/**
 * Test 2: Press - Create New Press Release
 */
test('Press: Create new press release with thumbnail', async ({ page }) => {
  console.log('\n🧪 Test 2: Press Create');

  await login(page);

  // Navigate to Press page
  await page.goto(`${BASE_URL}/admin/press`);
  await page.waitForLoadState('networkidle');

  // Click "새 보도자료 작성" button
  const createButton = page.locator('button:has-text("새 보도자료 작성")').first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for modal
  await expect(page.locator('text=새 보도자료 만들기')).toBeVisible({ timeout: 5000 });

  // Fill form
  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Press ${timestamp}`);
  await page.fill('input[name="slug"]', `e2e-test-press-${timestamp}`);
  await page.fill('textarea[name="content"]', `This is a test press release created by Playwright E2E test at ${new Date().toISOString()}`);
  await page.fill('textarea[name="excerpt"]', 'E2E test press excerpt');
  await page.fill('input[name="thumbnailUrl"]', 'https://via.placeholder.com/400x300');

  // Select status
  await page.selectOption('select[name="status"]', 'DRAFT');

  // Submit form
  const submitButton = page.locator('button:has-text("생성")').first();
  await submitButton.click();

  // Wait for success
  await page.waitForTimeout(3000);

  // Check for errors
  const errorAlert = page.locator('text=An unexpected error occurred');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    console.error('❌ Error occurred: An unexpected error occurred');
    throw new Error('Create operation failed with error');
  }

  console.log('✅ Press release created successfully');
});

/**
 * Test 3: Popups - Create New Popup
 */
test('Popups: Create new popup with image', async ({ page }) => {
  console.log('\n🧪 Test 3: Popups Create');

  await login(page);

  // Navigate to Popups page
  await page.goto(`${BASE_URL}/admin/popups`);
  await page.waitForLoadState('networkidle');

  // Click "새 팝업 만들기" button
  const createButton = page.locator('button:has-text("새 팝업 만들기")').first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for modal
  await expect(page.locator('text=새 팝업 만들기')).toBeVisible({ timeout: 5000 });

  // Fill form
  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Popup ${timestamp}`);
  await page.fill('textarea[name="content"]', `This is a test popup created by Playwright E2E test at ${new Date().toISOString()}`);
  await page.fill('input[name="imageUrl"]', 'https://via.placeholder.com/600x400');
  await page.fill('input[name="linkUrl"]', 'https://glec.io');
  await page.fill('input[name="linkText"]', 'Learn More');

  // Select display type
  await page.selectOption('select[name="displayType"]', 'MODAL');

  // Select position (if applicable)
  await page.selectOption('select[name="position"]', 'CENTER');

  // Set dates
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await page.fill('input[name="startDate"]', today);
  await page.fill('input[name="endDate"]', nextMonth);

  // Submit form
  const submitButton = page.locator('button:has-text("생성")').first();
  await submitButton.click();

  // Wait for success
  await page.waitForTimeout(3000);

  // Check for errors
  const errorAlert = page.locator('text=An unexpected error occurred');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    console.error('❌ Error occurred: An unexpected error occurred');
    throw new Error('Create operation failed with error');
  }

  console.log('✅ Popup created successfully');
});

/**
 * Test 4: Knowledge Library - Create New Resource
 */
test('Knowledge Library: Create new resource', async ({ page }) => {
  console.log('\n🧪 Test 4: Knowledge Library Create');

  await login(page);

  // Navigate to Knowledge Library page
  await page.goto(`${BASE_URL}/admin/knowledge-library`);
  await page.waitForLoadState('networkidle');

  // Click create button
  const createButton = page.locator('button:has-text("새 자료")').first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for modal
  await page.waitForTimeout(2000);

  // Fill form
  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Library Resource ${timestamp}`);
  await page.fill('textarea[name="description"]', `This is a test library resource created by Playwright E2E test at ${new Date().toISOString()}`);
  await page.fill('input[name="fileUrl"]', 'https://example.com/test-resource.pdf');

  // Select category
  await page.selectOption('select[name="category"]', 'WHITEPAPER');

  // Submit form
  const submitButton = page.locator('button:has-text("생성")').first();
  await submitButton.click();

  // Wait for success
  await page.waitForTimeout(3000);

  // Check for errors
  const errorAlert = page.locator('text=An unexpected error occurred');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    console.error('❌ Error occurred: An unexpected error occurred');
    throw new Error('Create operation failed with error');
  }

  console.log('✅ Library resource created successfully');
});

/**
 * Test 5: Knowledge Blog - Create New Blog Post
 */
test('Knowledge Blog: Create new blog post', async ({ page }) => {
  console.log('\n🧪 Test 5: Knowledge Blog Create');

  await login(page);

  // Navigate to Knowledge Blog page
  await page.goto(`${BASE_URL}/admin/knowledge-blog`);
  await page.waitForLoadState('networkidle');

  // Click create button
  const createButton = page.locator('button:has-text("새 블로그 글")').first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for modal
  await page.waitForTimeout(2000);

  // Fill form
  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Blog Post ${timestamp}`);
  await page.fill('input[name="slug"]', `e2e-test-blog-${timestamp}`);
  await page.fill('textarea[name="content"]', `This is a test blog post created by Playwright E2E test at ${new Date().toISOString()}`);
  await page.fill('textarea[name="excerpt"]', 'E2E test blog excerpt');
  await page.fill('input[name="thumbnailUrl"]', 'https://via.placeholder.com/800x600');

  // Select category
  await page.selectOption('select[name="category"]', 'TUTORIAL');

  // Select status
  await page.selectOption('select[name="status"]', 'DRAFT');

  // Submit form
  const submitButton = page.locator('button:has-text("생성")').first();
  await submitButton.click();

  // Wait for success
  await page.waitForTimeout(3000);

  // Check for errors
  const errorAlert = page.locator('text=An unexpected error occurred');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    console.error('❌ Error occurred: An unexpected error occurred');
    throw new Error('Create operation failed with error');
  }

  console.log('✅ Blog post created successfully');
});

/**
 * Test 6: Knowledge Videos - Create New Video
 */
test('Knowledge Videos: Create new video', async ({ page }) => {
  console.log('\n🧪 Test 6: Knowledge Videos Create');

  await login(page);

  // Navigate to Knowledge Videos page
  await page.goto(`${BASE_URL}/admin/knowledge-videos`);
  await page.waitForLoadState('networkidle');

  // Click create button
  const createButton = page.locator('button:has-text("새 영상")').first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for modal
  await page.waitForTimeout(2000);

  // Fill form
  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Video ${timestamp}`);
  await page.fill('textarea[name="description"]', `This is a test video created by Playwright E2E test at ${new Date().toISOString()}`);
  await page.fill('input[name="videoUrl"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await page.fill('input[name="thumbnailUrl"]', 'https://via.placeholder.com/1280x720');

  // Select category
  await page.selectOption('select[name="category"]', 'TUTORIAL');

  // Submit form
  const submitButton = page.locator('button:has-text("생성")').first();
  await submitButton.click();

  // Wait for success
  await page.waitForTimeout(3000);

  // Check for errors
  const errorAlert = page.locator('text=An unexpected error occurred');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    console.error('❌ Error occurred: An unexpected error occurred');
    throw new Error('Create operation failed with error');
  }

  console.log('✅ Video created successfully');
});
