/**
 * Test Production Login - Debug Version
 *
 * Tests login on production and captures screenshots
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://glec-website.vercel.app';

test('Test Production Login with Screenshots', async ({ page }) => {
  test.setTimeout(60000);

  console.log('1. Navigating to login page...');
  await page.goto(`${BASE_URL}/admin/login`);
  await page.waitForLoadState('networkidle');

  console.log('2. Taking screenshot of login page...');
  await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });

  console.log('3. Filling email...');
  const emailInput = page.locator('input[type="email"]');
  await emailInput.fill('admin@glec.io');
  await page.screenshot({ path: 'test-results/02-email-filled.png', fullPage: true });

  console.log('4. Filling password...');
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill('admin123');
  await page.screenshot({ path: 'test-results/03-password-filled.png', fullPage: true });

  console.log('5. Clicking login button...');
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();

  console.log('6. Waiting for response...');
  await page.waitForTimeout(3000);

  console.log('7. Taking screenshot after login...');
  await page.screenshot({ path: 'test-results/04-after-login.png', fullPage: true });

  console.log('8. Current URL:', page.url());

  const bodyText = await page.textContent('body');
  console.log('9. Page contains "Invalid"?', bodyText?.includes('Invalid'));
  console.log('10. Page contains "Error"?', bodyText?.includes('Error'));
  console.log('11. Page contains "에러"?', bodyText?.includes('에러'));

  // Check if we're still on login page or redirected
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('❌ Still on login page - login failed');

    // Check for error messages
    const errorElement = page.locator('[role="alert"], .text-red-500, .text-error-500');
    const errorCount = await errorElement.count();

    if (errorCount > 0) {
      const errorText = await errorElement.first().textContent();
      console.log('Error message:', errorText);
    }

  } else {
    console.log('✅ Redirected to:', currentUrl);
  }
});
