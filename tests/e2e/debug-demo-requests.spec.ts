/**
 * Debug test to capture console logs and diagnose infinite loop
 */

import { test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

test('debug demo requests page', async ({ page }) => {
  const consoleLogs: string[] = [];

  // Capture all console logs
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${text}`);
  });

  // Login
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Navigate to demo requests and wait 10 seconds
  console.log('[TEST] Navigating to demo-requests page...');
  await page.goto(`${BASE_URL}/admin/demo-requests`, { timeout: 60000 });

  console.log('[TEST] Waiting 10 seconds to observe behavior...');
  await page.waitForTimeout(10000);

  console.log(`[TEST] Total console logs captured: ${consoleLogs.length}`);
  console.log('[TEST] fetchDemoRequests call count:', consoleLogs.filter(l => l.includes('fetchDemoRequests called')).length);
});
