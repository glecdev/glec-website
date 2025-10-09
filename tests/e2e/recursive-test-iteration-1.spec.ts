/**
 * Recursive E2E Test - Iteration 1
 *
 * Strategy: More robust selectors based on actual UI
 * - Use role-based selectors (getByRole)
 * - Wait for form fields instead of modal titles
 * - Handle dynamic content better
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

test.setTimeout(180000);

/**
 * Helper: Login to admin portal
 */
async function login(page: any) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 15000 });
  console.log('✅ Login successful');
}

/**
 * Test 1: Notices - Create New Notice (Iteration 1)
 */
test('Iteration 1: Notices Create', async ({ page }) => {
  console.log('\n🔄 Iteration 1: Notices Create');

  await login(page);

  // Navigate to Notices page
  await page.goto(`${BASE_URL}/admin/notices`);
  await page.waitForLoadState('networkidle');
  console.log('📍 Navigated to /admin/notices');

  // Click create button - use more flexible selector
  const createButton = page.getByRole('button', { name: /새.*공지/i }).first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  console.log('✅ Create button found');

  await createButton.click();
  console.log('🖱️ Clicked create button');

  // Wait for form to appear (more robust than waiting for modal title)
  await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 10000 });
  console.log('✅ Form appeared');

  // Fill form
  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Notice ${timestamp}`);
  await page.fill('input[name="slug"]', `e2e-test-notice-${timestamp}`);
  await page.fill('textarea[name="content"]', `Test content at ${new Date().toISOString()}`);
  await page.fill('textarea[name="excerpt"]', 'Test excerpt');
  await page.fill('input[name="thumbnailUrl"]', 'https://via.placeholder.com/400x300');
  console.log('✅ Form filled');

  // Select category
  await page.selectOption('select[name="category"]', 'GENERAL');

  // Select status
  await page.selectOption('select[name="status"]', 'PUBLISHED');
  console.log('✅ Status set to PUBLISHED');

  // Take screenshot before submit
  await page.screenshot({ path: `test-results/iteration-1-notices-before-submit-${timestamp}.png`, fullPage: true });

  // Submit form - look for button with "생성" or "작성" or "저장"
  const submitButton = page.getByRole('button', { name: /생성|작성|저장/i }).first();
  await expect(submitButton).toBeVisible({ timeout: 5000 });
  await submitButton.click();
  console.log('🖱️ Clicked submit button');

  // Wait for response
  await page.waitForTimeout(3000);

  // Check for errors
  const errorAlert = page.locator('text=/error|오류|실패/i');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    const errorText = await errorAlert.textContent();
    console.error('❌ Error occurred:', errorText);
    await page.screenshot({ path: `test-results/iteration-1-notices-error-${timestamp}.png`, fullPage: true });
    throw new Error(`Create operation failed: ${errorText}`);
  }

  // Verify via API
  const response = await page.request.get(`${BASE_URL}/api/notices?search=E2E Test Notice ${timestamp}`);
  const data = await response.json();

  if (data.success && data.data && data.data.length > 0) {
    console.log('✅ Notice created successfully - verified via API');
    console.log(`📊 Notice ID: ${data.data[0].id}`);
  } else {
    console.error('❌ Notice not found in API response');
    await page.screenshot({ path: `test-results/iteration-1-notices-not-found-${timestamp}.png`, fullPage: true });
    throw new Error('Notice created but not found in API');
  }
});

/**
 * Test 2: Press - Create New Press Release (Iteration 1)
 */
test('Iteration 1: Press Create', async ({ page }) => {
  console.log('\n🔄 Iteration 1: Press Create');

  await login(page);

  await page.goto(`${BASE_URL}/admin/press`);
  await page.waitForLoadState('networkidle');
  console.log('📍 Navigated to /admin/press');

  const createButton = page.getByRole('button', { name: /새.*보도/i }).first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();
  console.log('🖱️ Clicked create button');

  await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 10000 });
  console.log('✅ Form appeared');

  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Press ${timestamp}`);
  await page.fill('input[name="slug"]', `e2e-test-press-${timestamp}`);
  await page.fill('textarea[name="content"]', `Test press content at ${new Date().toISOString()}`);
  await page.fill('textarea[name="excerpt"]', 'Test press excerpt');
  await page.fill('input[name="thumbnailUrl"]', 'https://via.placeholder.com/400x300');
  await page.selectOption('select[name="status"]', 'PUBLISHED');
  console.log('✅ Form filled with PUBLISHED status');

  await page.screenshot({ path: `test-results/iteration-1-press-before-submit-${timestamp}.png`, fullPage: true });

  const submitButton = page.getByRole('button', { name: /생성|작성|저장/i }).first();
  await submitButton.click();
  console.log('🖱️ Clicked submit button');

  await page.waitForTimeout(3000);

  const errorAlert = page.locator('text=/error|오류|실패/i');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    const errorText = await errorAlert.textContent();
    console.error('❌ Error occurred:', errorText);
    await page.screenshot({ path: `test-results/iteration-1-press-error-${timestamp}.png`, fullPage: true });
    throw new Error(`Create operation failed: ${errorText}`);
  }

  // Verify via API - Press data is in notices table with category=PRESS
  const response = await page.request.get(`${BASE_URL}/api/press?search=E2E Test Press ${timestamp}`);
  const data = await response.json();

  if (data.success && data.data && data.data.length > 0) {
    console.log('✅ Press created successfully - verified via API');
    console.log(`📊 Press ID: ${data.data[0].id}`);
    console.log(`📊 Category: ${data.data[0].category}`); // Should be "PRESS"
  } else {
    console.error('❌ Press not found in API response');
    await page.screenshot({ path: `test-results/iteration-1-press-not-found-${timestamp}.png`, fullPage: true });
    throw new Error('Press created but not found in API');
  }
});

/**
 * Test 3: Popups - Create New Popup (Iteration 1)
 */
test('Iteration 1: Popups Create', async ({ page }) => {
  console.log('\n🔄 Iteration 1: Popups Create');

  await login(page);

  await page.goto(`${BASE_URL}/admin/popups`);
  await page.waitForLoadState('networkidle');
  console.log('📍 Navigated to /admin/popups');

  // Use more specific selector - getByRole to avoid strict mode violation
  const createButton = page.getByRole('button', { name: /\+.*새.*팝업/i });
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();
  console.log('🖱️ Clicked create button');

  await expect(page.locator('input[name="title"]')).toBeVisible({ timeout: 10000 });
  console.log('✅ Form appeared');

  const timestamp = Date.now();
  await page.fill('input[name="title"]', `E2E Test Popup ${timestamp}`);
  await page.fill('input[name="imageUrl"]', 'https://via.placeholder.com/600x400');
  await page.fill('input[name="linkUrl"]', 'https://glec.io');

  // Set dates
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await page.fill('input[name="startDate"]', today);
  await page.fill('input[name="endDate"]', nextWeek);

  await page.selectOption('select[name="status"]', 'ACTIVE');
  console.log('✅ Form filled with ACTIVE status');

  await page.screenshot({ path: `test-results/iteration-1-popups-before-submit-${timestamp}.png`, fullPage: true });

  const submitButton = page.getByRole('button', { name: /생성|작성|저장/i }).first();
  await submitButton.click();
  console.log('🖱️ Clicked submit button');

  await page.waitForTimeout(3000);

  const errorAlert = page.locator('text=/error|오류|실패/i');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    const errorText = await errorAlert.textContent();
    console.error('❌ Error occurred:', errorText);
    await page.screenshot({ path: `test-results/iteration-1-popups-error-${timestamp}.png`, fullPage: true });
    throw new Error(`Create operation failed: ${errorText}`);
  }

  const response = await page.request.get(`${BASE_URL}/api/popups?search=E2E Test Popup ${timestamp}`);
  const data = await response.json();

  if (data.success && data.data && data.data.length > 0) {
    console.log('✅ Popup created successfully - verified via API');
    console.log(`📊 Popup ID: ${data.data[0].id}`);
  } else {
    console.error('❌ Popup not found in API response');
    await page.screenshot({ path: `test-results/iteration-1-popups-not-found-${timestamp}.png`, fullPage: true });
    throw new Error('Popup created but not found in API');
  }
});
