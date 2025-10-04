import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

test.describe('Admin Login Test', () => {
  test('should successfully login to admin dashboard', async ({ page }) => {
    console.log(`\n🔑 Testing Admin Login at ${BASE_URL}/admin/login`);

    // Navigate to admin login
    await page.goto(`${BASE_URL}/admin/login`);
    console.log('✅ Navigated to login page');

    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/admin-login-page.png', fullPage: true });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if email and password fields exist
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    console.log('🔍 Checking form fields...');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    console.log('✅ All form fields visible');

    // Fill in credentials
    console.log('📝 Filling in credentials...');
    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);

    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/admin-login-filled.png', fullPage: true });

    // Click submit
    console.log('🖱️  Clicking submit button...');
    await submitButton.click();

    // Wait for navigation or error message
    await page.waitForTimeout(3000);

    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/admin-after-submit.png', fullPage: true });

    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    // Check for dashboard or error
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('✅ Login successful - redirected to dashboard');
      expect(currentUrl).toContain('/admin/dashboard');
    } else if (currentUrl.includes('/admin/login')) {
      console.log('⚠️  Still on login page - checking for errors');

      // Check for error messages
      const errorMessage = page.locator('text=/error|실패|invalid|incorrect/i');
      const errorVisible = await errorMessage.isVisible().catch(() => false);

      if (errorVisible) {
        const errorText = await errorMessage.textContent();
        console.log(`❌ Error message: ${errorText}`);
      }

      // Log page HTML for debugging
      const html = await page.content();
      console.log('📄 Page HTML:', html.substring(0, 500));

      throw new Error('Login failed - still on login page');
    } else {
      console.log(`⚠️  Unexpected URL: ${currentUrl}`);
    }
  });
});
