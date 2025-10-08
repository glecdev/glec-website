/**
 * Simple Admin Login Test for Debugging
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

test('Simple Admin Login Test', async ({ page }) => {
  // Enable console logging
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = `Browser console: ${msg.text()}`;
    console.log(text);
    consoleLogs.push(text);
  });

  // Listen for API responses
  page.on('response', response => {
    if (response.url().includes('/api/admin/login')) {
      console.log('API Response:', response.status(), response.url());
    }
  });

  console.log('1. Navigating to login page...');
  await page.goto(`${BASE_URL}/admin/login`);
  await page.waitForLoadState('networkidle');

  console.log('2. Filling email...');
  await page.fill('input[type="email"]', 'admin@glec.io');

  console.log('3. Filling password...');
  await page.fill('input[type="password"]', 'admin123!');

  console.log('4. Clicking login button...');
  await page.click('button[type="submit"]');

  console.log('5. Waiting for API response...');
  await page.waitForTimeout(5000);

  // Check current URL
  const currentURL = page.url();
  console.log('6. Current URL:', currentURL);

  // Check localStorage
  const token = await page.evaluate(() => localStorage.getItem('admin_token'));
  console.log('7. Token in localStorage:', token ? 'EXISTS' : 'NULL');

  // Check for error messages
  const errorVisible = await page.locator('text=/로그인에 실패|인증 토큰/i').isVisible().catch(() => false);
  console.log('8. Error visible:', errorVisible);

  // Take screenshot
  await page.screenshot({ path: 'test-results/admin-login-debug.png', fullPage: true });
  console.log('9. Screenshot saved');

  // Assert
  expect(token).toBeTruthy();
  expect(currentURL).toContain('/admin/dashboard');
});
