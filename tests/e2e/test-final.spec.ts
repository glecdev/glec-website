/**
 * Simple E2E Test: Verify Notices and Press Create functions work
 *
 * Purpose: Test that the thumbnailUrl → thumbnail_url fix works
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

test.setTimeout(120000);

test('Notices: Create with thumbnail (verify field name fix)', async ({ page }) => {
  console.log('\n🧪 Testing Notices Create');

  // Login
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 15000 });
  console.log('✅ Login successful');

  // Navigate to Notices
  await page.goto(`${BASE_URL}/admin/notices`);
  await page.waitForLoadState('networkidle');
  console.log('✅ Notices page loaded');

  // Click create button
  const createButton = page.locator('button', { hasText: '새 공지 작성' }).first();
  await createButton.click();
  console.log('✅ Create button clicked');

  // Wait for modal (check for any modal title)
  await page.waitForTimeout(2000);

  // Fill form
  const timestamp = Date.now();
  await page.fill('#title', `E2E Test ${timestamp}`);
  await page.fill('#slug', `e2e-test-${timestamp}`);
  await page.fill('#content', `Test content at ${new Date().toISOString()}`);
  await page.fill('#excerpt', 'Test excerpt');
  await page.fill('#thumbnailUrl', 'https://via.placeholder.com/400x300');

  // Select category and status
  await page.selectOption('#modal-category', '일반');
  await page.selectOption('#modal-status', '발행');

  console.log('✅ Form filled');

  // Submit
  const submitButton = page.locator('button', { hasText: '추가' }).first();
  await submitButton.click();
  console.log('✅ Submit clicked');

  // Wait and check for errors
  await page.waitForTimeout(5000);

  // Check for error message
  const errorLocator = page.locator('text=An unexpected error occurred');
  const hasError = await errorLocator.isVisible().catch(() => false);

  if (hasError) {
    console.error('❌ ERROR: An unexpected error occurred');
    throw new Error('Create failed with error');
  }

  console.log('✅ No error detected - Create operation likely succeeded!');
});

test('Press: Create with thumbnail (verify field name fix)', async ({ page }) => {
  console.log('\n🧪 Testing Press Create');

  // Login
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 15000 });
  console.log('✅ Login successful');

  // Navigate to Press
  await page.goto(`${BASE_URL}/admin/press`);
  await page.waitForLoadState('networkidle');
  console.log('✅ Press page loaded');

  // Click create button
  const createButton = page.locator('button', { hasText: '새 보도자료 작성' }).or(page.locator('button', { hasText: '새 공지 작성' })).first();
  await createButton.click();
  console.log('✅ Create button clicked');

  // Wait for modal
  await page.waitForTimeout(2000);

  // Fill form
  const timestamp = Date.now();
  await page.fill('#title', `E2E Test Press ${timestamp}`);
  await page.fill('#slug', `e2e-test-press-${timestamp}`);
  await page.fill('#content', `Test press content at ${new Date().toISOString()}`);
  await page.fill('#excerpt', 'Test press excerpt');
  await page.fill('#thumbnailUrl', 'https://via.placeholder.com/400x300');

  // Select status
  await page.selectOption('#modal-status', '발행');

  console.log('✅ Form filled');

  // Submit
  const submitButton = page.locator('button', { hasText: '추가' }).first();
  await submitButton.click();
  console.log('✅ Submit clicked');

  // Wait and check for errors
  await page.waitForTimeout(5000);

  // Check for error message
  const errorLocator = page.locator('text=An unexpected error occurred');
  const hasError = await errorLocator.isVisible().catch(() => false);

  if (hasError) {
    console.error('❌ ERROR: An unexpected error occurred');
    throw new Error('Create failed with error');
  }

  console.log('✅ No error detected - Create operation likely succeeded!');
});

test('Popups: Create with imageUrl (verify no regression)', async ({ page }) => {
  console.log('\n🧪 Testing Popups Create');

  // Login
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 15000 });
  console.log('✅ Login successful');

  // Navigate to Popups
  await page.goto(`${BASE_URL}/admin/popups`);
  await page.waitForLoadState('networkidle');
  console.log('✅ Popups page loaded');

  // Click create button
  const createButton = page.locator('button', { hasText: '새 팝업 만들기' }).or(page.locator('button', { hasText: '새 공지 작성' })).first();
  await createButton.click();
  console.log('✅ Create button clicked');

  // Wait for modal
  await page.waitForTimeout(2000);

  // Fill form
  const timestamp = Date.now();
  await page.fill('#title', `E2E Test Popup ${timestamp}`);
  await page.fill('#content', `Test popup content at ${new Date().toISOString()}`);
  await page.fill('input[name="imageUrl"]', 'https://via.placeholder.com/600x400');
  await page.fill('input[name="linkUrl"]', 'https://glec.io');
  await page.fill('input[name="linkText"]', 'Learn More');

  // Select display type and position
  await page.selectOption('select[name="displayType"]', 'MODAL');
  await page.selectOption('select[name="position"]', 'CENTER');

  // Set dates
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await page.fill('input[name="startDate"]', today);
  await page.fill('input[name="endDate"]', nextMonth);

  console.log('✅ Form filled');

  // Submit
  const submitButton = page.locator('button', { hasText: '추가' }).first();
  await submitButton.click();
  console.log('✅ Submit clicked');

  // Wait and check for errors
  await page.waitForTimeout(5000);

  // Check for error message
  const errorLocator = page.locator('text=An unexpected error occurred');
  const hasError = await errorLocator.isVisible().catch(() => false);

  if (hasError) {
    console.error('❌ ERROR: An unexpected error occurred');
    throw new Error('Create failed with error');
  }

  console.log('✅ No error detected - Create operation likely succeeded!');
});
