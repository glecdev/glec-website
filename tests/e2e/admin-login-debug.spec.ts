import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

test.describe('Admin Login Debug', () => {
  test('should debug admin login flow', async ({ page }) => {
    // Listen to console messages
    page.on('console', msg => {
      const msgType = msg.type();
      const msgText = msg.text();
      console.log('[Browser Console]', msgType, msgText);
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.error('[Page Error]', error.message);
    });

    // Listen to network requests
    page.on('request', request => {
      if (request.url().includes('/api/admin/login')) {
        console.log('[Request]', request.method(), request.url());
        console.log('[Request Body]', request.postData());
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/admin/login')) {
        console.log('[Response]', response.status(), response.url());
        const body = await response.text();
        console.log('[Response Body]', body);
      }
    });

    // Navigate to admin login
    await page.goto(BASE_URL + '/admin/login', { waitUntil: 'networkidle', timeout: 60000 });
    console.log('✓ Admin login page loaded');

    // Take screenshot of initial state
    await page.screenshot({ path: 'test-results/admin-login-initial.png' });

    // Fill in credentials
    await page.fill('input[name="email"]', 'admin@glec.io');
    await page.fill('input[name="password"]', 'admin123!');
    console.log('✓ Credentials filled');

    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/admin-login-before-submit.png' });

    // Click submit button
    await page.click('button[type="submit"]');
    console.log('✓ Submit button clicked');

    // Wait for navigation or error
    await page.waitForTimeout(3000);

    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/admin-login-after-submit.png' });

    // Check current URL
    const currentUrl = page.url();
    console.log('[Current URL]', currentUrl);

    // Check for error messages
    const errorMessage = await page.locator('[role="alert"]').textContent().catch(() => null);
    if (errorMessage) {
      console.error('[Error Message]', errorMessage);
    }

    // Check localStorage
    const adminToken = await page.evaluate(() => localStorage.getItem('admin_token'));
    const adminUser = await page.evaluate(() => localStorage.getItem('admin_user'));
    console.log('[localStorage] admin_token:', adminToken ? 'EXISTS' : 'NULL');
    console.log('[localStorage] admin_user:', adminUser ? 'EXISTS' : 'NULL');

    // If redirected to dashboard, that's success
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('✅ LOGIN SUCCESSFUL - Redirected to dashboard');
    } else {
      console.log('❌ LOGIN FAILED - Still on login page or error page');
    }
  });
});
