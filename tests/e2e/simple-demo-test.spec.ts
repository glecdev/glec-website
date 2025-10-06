/**
 * Simple test to measure page load times
 */

import { test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

test('measure demo-requests page load time', async ({ page }) => {
  console.log('[TEST] Logging in...');

  // Login
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // First load (with compilation)
  console.log('[TEST] First load (with compilation)...');
  const start1 = Date.now();
  await page.goto(`${BASE_URL}/admin/demo-requests`, { timeout: 90000 });
  const time1 = Date.now() - start1;
  console.log(`[TEST] First load time: ${time1}ms`);

  // Second load (cached)
  console.log('[TEST] Second load (cached)...');
  const start2 = Date.now();
  await page.reload();
  const time2 = Date.now() - start2;
  console.log(`[TEST] Second load time: ${time2}ms`);

  console.log(`[TEST] Speed improvement: ${((1 - time2/time1) * 100).toFixed(1)}%`);
});
