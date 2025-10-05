/**
 * Simple Admin Login Test
 *
 * Purpose: Verify admin login works before running full CRUD tests
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test('Admin login should work with correct credentials', async ({ page }) => {
  // Navigate to login page
  await page.goto(`${BASE_URL}/admin/login`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  await page.fill('input[type="email"]', 'admin@glec.io');
  await page.fill('input[type="password"]', 'GLEC2025Admin!');

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (with longer timeout)
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

  // Verify we're on the dashboard
  expect(page.url()).toContain('/admin/dashboard');

  // Verify dashboard content is visible
  const dashboardHeading = page.locator('h1, h2').first();
  await expect(dashboardHeading).toBeVisible({ timeout: 5000 });

  console.log('✅ Admin login successful!');
  console.log(`   Current URL: ${page.url()}`);
});
