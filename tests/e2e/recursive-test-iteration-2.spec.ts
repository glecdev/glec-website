/**
 * Recursive E2E Test - Iteration 2
 *
 * Strategy: Use label-based selectors and getByPlaceholder
 * - Wait for modal visibility using getByRole('dialog')
 * - Use getByLabel() for form fields
 * - Use getByPlaceholder() as fallback
 * - More resilient to UI text changes
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
 * Test 1: Notices - Iteration 2
 */
test('Iteration 2: Notices Create', async ({ page }) => {
  console.log('\n🔄 Iteration 2: Notices Create');

  await login(page);

  await page.goto(`${BASE_URL}/admin/notices`);
  await page.waitForLoadState('networkidle');
  console.log('📍 Navigated to /admin/notices');

  // Click create button
  const createButton = page.getByRole('button', { name: /새.*공지/i }).first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();
  console.log('🖱️ Clicked create button');

  // Wait for modal dialog
  const modal = page.locator('div[role="dialog"], [class*="modal"]').first();
  await expect(modal).toBeVisible({ timeout: 10000 });
  console.log('✅ Modal appeared');

  // Take screenshot to analyze form structure
  const timestamp = Date.now();
  await page.screenshot({ path: `test-results/iteration-2-notices-modal-${timestamp}.png`, fullPage: true });

  // Try multiple selectors for title field
  const titleField = page.locator('input').filter({ hasText: /^$/ }).first(); // First empty input
  await expect(titleField).toBeVisible({ timeout: 5000 });
  await titleField.fill(`E2E Test Notice ${timestamp}`);
  console.log('✅ Filled title field');

  // Fill other fields by order (assume sequential tab order)
  await page.keyboard.press('Tab'); // Move to slug
  await page.keyboard.type(`e2e-test-notice-${timestamp}`);
  console.log('✅ Filled slug field');

  await page.keyboard.press('Tab'); // Move to content
  await page.keyboard.type(`Test content at ${new Date().toISOString()}`);
  console.log('✅ Filled content field');

  await page.keyboard.press('Tab'); // Move to excerpt
  await page.keyboard.type('Test excerpt');
  console.log('✅ Filled excerpt field');

  // Screenshot before submit
  await page.screenshot({ path: `test-results/iteration-2-notices-filled-${timestamp}.png`, fullPage: true });

  // Find and click submit button
  const submitButton = page.getByRole('button', { name: /생성|작성|저장|제출/i }).first();
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
    await page.screenshot({ path: `test-results/iteration-2-notices-error-${timestamp}.png`, fullPage: true });
    throw new Error(`Create operation failed: ${errorText}`);
  }

  // Verify via API
  const response = await page.request.get(`${BASE_URL}/api/notices?search=E2E Test Notice ${timestamp}`);
  const data = await response.json();

  if (data.success && data.data && data.data.length > 0) {
    console.log('✅ Notice created successfully - verified via API');
    console.log(`📊 Notice ID: ${data.data[0].id}`);
    console.log(`📊 Title: ${data.data[0].title}`);
  } else {
    console.error('❌ Notice not found in API response');
    console.error('API Response:', JSON.stringify(data, null, 2));
    await page.screenshot({ path: `test-results/iteration-2-notices-not-found-${timestamp}.png`, fullPage: true });
    throw new Error('Notice created but not found in API');
  }
});

/**
 * Test 2: Press - Iteration 2
 */
test('Iteration 2: Press Create', async ({ page }) => {
  console.log('\n🔄 Iteration 2: Press Create');

  await login(page);

  await page.goto(`${BASE_URL}/admin/press`);
  await page.waitForLoadState('networkidle');
  console.log('📍 Navigated to /admin/press');

  const createButton = page.getByRole('button', { name: /새.*보도/i }).first();
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();
  console.log('🖱️ Clicked create button');

  const modal = page.locator('div[role="dialog"], [class*="modal"]').first();
  await expect(modal).toBeVisible({ timeout: 10000 });
  console.log('✅ Modal appeared');

  const timestamp = Date.now();
  await page.screenshot({ path: `test-results/iteration-2-press-modal-${timestamp}.png`, fullPage: true });

  // Fill form using keyboard navigation
  const titleField = page.locator('input').filter({ hasText: /^$/ }).first();
  await expect(titleField).toBeVisible({ timeout: 5000 });
  await titleField.fill(`E2E Test Press ${timestamp}`);

  await page.keyboard.press('Tab');
  await page.keyboard.type(`e2e-test-press-${timestamp}`);

  await page.keyboard.press('Tab');
  await page.keyboard.type(`Test press content at ${new Date().toISOString()}`);

  await page.keyboard.press('Tab');
  await page.keyboard.type('Test press excerpt');

  console.log('✅ Form filled');

  await page.screenshot({ path: `test-results/iteration-2-press-filled-${timestamp}.png`, fullPage: true });

  const submitButton = page.getByRole('button', { name: /생성|작성|저장|제출/i }).first();
  await submitButton.click();
  console.log('🖱️ Clicked submit button');

  await page.waitForTimeout(3000);

  const errorAlert = page.locator('text=/error|오류|실패/i');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    const errorText = await errorAlert.textContent();
    console.error('❌ Error occurred:', errorText);
    await page.screenshot({ path: `test-results/iteration-2-press-error-${timestamp}.png`, fullPage: true });
    throw new Error(`Create operation failed: ${errorText}`);
  }

  const response = await page.request.get(`${BASE_URL}/api/press?search=E2E Test Press ${timestamp}`);
  const data = await response.json();

  if (data.success && data.data && data.data.length > 0) {
    console.log('✅ Press created successfully - verified via API');
    console.log(`📊 Press ID: ${data.data[0].id}`);
    console.log(`📊 Title: ${data.data[0].title}`);
    console.log(`📊 Category: ${data.data[0].category}`);
  } else {
    console.error('❌ Press not found in API response');
    console.error('API Response:', JSON.stringify(data, null, 2));
    await page.screenshot({ path: `test-results/iteration-2-press-not-found-${timestamp}.png`, fullPage: true });
    throw new Error('Press created but not found in API');
  }
});

/**
 * Test 3: Popups - Iteration 2
 */
test('Iteration 2: Popups Create', async ({ page }) => {
  console.log('\n🔄 Iteration 2: Popups Create');

  await login(page);

  await page.goto(`${BASE_URL}/admin/popups`);
  await page.waitForLoadState('networkidle');
  console.log('📍 Navigated to /admin/popups');

  const createButton = page.getByRole('button', { name: /\+.*새.*팝업/i });
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();
  console.log('🖱️ Clicked create button');

  const modal = page.locator('div[role="dialog"], [class*="modal"]').first();
  await expect(modal).toBeVisible({ timeout: 10000 });
  console.log('✅ Modal appeared');

  const timestamp = Date.now();
  await page.screenshot({ path: `test-results/iteration-2-popups-modal-${timestamp}.png`, fullPage: true });

  // Fill form using keyboard navigation
  const titleField = page.locator('input').filter({ hasText: /^$/ }).first();
  await expect(titleField).toBeVisible({ timeout: 5000 });
  await titleField.fill(`E2E Test Popup ${timestamp}`);

  await page.keyboard.press('Tab');
  await page.keyboard.type('https://via.placeholder.com/600x400');

  await page.keyboard.press('Tab');
  await page.keyboard.type('https://glec.io');

  console.log('✅ Form filled');

  await page.screenshot({ path: `test-results/iteration-2-popups-filled-${timestamp}.png`, fullPage: true });

  const submitButton = page.getByRole('button', { name: /생성|작성|저장|제출/i }).first();
  await submitButton.click();
  console.log('🖱️ Clicked submit button');

  await page.waitForTimeout(3000);

  const errorAlert = page.locator('text=/error|오류|실패/i');
  const isErrorVisible = await errorAlert.isVisible().catch(() => false);

  if (isErrorVisible) {
    const errorText = await errorAlert.textContent();
    console.error('❌ Error occurred:', errorText);
    await page.screenshot({ path: `test-results/iteration-2-popups-error-${timestamp}.png`, fullPage: true });
    throw new Error(`Create operation failed: ${errorText}`);
  }

  const response = await page.request.get(`${BASE_URL}/api/popups?search=E2E Test Popup ${timestamp}`);
  const data = await response.json();

  if (data.success && data.data && data.data.length > 0) {
    console.log('✅ Popup created successfully - verified via API');
    console.log(`📊 Popup ID: ${data.data[0].id}`);
    console.log(`📊 Title: ${data.data[0].title}`);
  } else {
    console.error('❌ Popup not found in API response');
    console.error('API Response:', JSON.stringify(data, null, 2));
    await page.screenshot({ path: `test-results/iteration-2-popups-not-found-${timestamp}.png`, fullPage: true });
    throw new Error('Popup created but not found in API');
  }
});
