/**
 * Simple Admin Login Test
 * Purpose: Diagnose login issues
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

test.describe('Simple Admin Login Test', () => {
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    console.log(`🔍 Navigating to ${BASE_URL}/admin/login`);
    await page.goto(`${BASE_URL}/admin/login`);

    console.log('📝 Filling email and password');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);

    console.log('🔘 Clicking login button');
    const loginBtn = page.locator('button[type="submit"]');
    await loginBtn.click();

    console.log('⏳ Waiting 5 seconds to see what happens...');
    await page.waitForTimeout(5000);

    console.log(`📍 Current URL: ${page.url()}`);

    // Check if redirected to dashboard
    if (page.url().includes('/admin/dashboard')) {
      console.log('✅ Successfully redirected to dashboard');
    } else {
      console.log('❌ NOT redirected to dashboard');

      // Take screenshot for diagnosis
      await page.screenshot({ path: 'test-results/login-failed.png', fullPage: true });

      // Check for error messages
      const errorMsg = await page.locator('text=/error|failed|invalid/i').first();
      if (await errorMsg.isVisible()) {
        const errorText = await errorMsg.textContent();
        console.log(`⚠️ Error message found: ${errorText}`);
      }
    }

    // Final assertion
    await expect(page).toHaveURL(`${BASE_URL}/admin/dashboard`, { timeout: 10000 });
  });
});
