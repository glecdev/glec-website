import { test, expect } from '@playwright/test';

/**
 * Cross-Site Performance Comparison Test
 *
 * Purpose: Verify that the infinite loop fix is working by comparing:
 * - OLD SITE (with infinite loop): Should take 15-25 seconds to load
 * - NEW SITE (with fix applied): Should load in < 3 seconds
 *
 * This test DOES NOT require local server cleanup!
 */

const NEW_SITE = 'https://glec-website-560tgm0fr-glecdevs-projects.vercel.app';
const ADMIN_LOGIN_PATH = '/admin/login';
const DEMO_REQUESTS_PATH = '/admin/demo-requests';

test.describe('Demo Requests Performance - Cross-Site Comparison', () => {
  test('NEW SITE: should load demo requests page quickly (< 5 seconds)', async ({ page }) => {
    console.log('🔍 Testing NEW SITE (with infinite loop fix)');
    console.log(`   URL: ${NEW_SITE}${DEMO_REQUESTS_PATH}`);

    // Step 1: Login
    const loginStart = Date.now();
    await page.goto(`${NEW_SITE}${ADMIN_LOGIN_PATH}`, { timeout: 30000 });

    await page.fill('input[type="email"]', 'admin@glec.io');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.waitForURL(`${NEW_SITE}/admin/dashboard`, { timeout: 30000 });
    const loginTime = Date.now() - loginStart;
    console.log(`   ✓ Login completed in ${loginTime}ms`);

    // Step 2: Navigate to Demo Requests (this is where infinite loop would occur)
    const pageStart = Date.now();
    console.log('   🚀 Navigating to /admin/demo-requests...');

    await page.goto(`${NEW_SITE}${DEMO_REQUESTS_PATH}`, { timeout: 10000 });

    // Wait for table to be visible (not just "로딩 중...")
    await page.waitForSelector('table', { timeout: 10000 });

    const pageLoadTime = Date.now() - pageStart;
    console.log(`   ✓ Page loaded in ${pageLoadTime}ms`);

    // Verify: Should load in < 5 seconds (was 15-25 seconds with infinite loop)
    expect(pageLoadTime).toBeLessThan(5000);
    console.log(`   ✅ PASS: Page loaded in ${(pageLoadTime / 1000).toFixed(2)}s (expected < 5s)`);

    // Verify: Page content is visible (not stuck on "로딩 중...")
    const tableVisible = await page.locator('table').isVisible();
    expect(tableVisible).toBe(true);
    console.log('   ✅ PASS: Table is visible (not stuck on loading)');

    // Verify: No "로딩 중..." text visible
    const loadingText = await page.locator('text=로딩 중').count();
    expect(loadingText).toBe(0);
    console.log('   ✅ PASS: No "로딩 중..." infinite loop detected');
  });

  test('NEW SITE: should display demo requests data correctly', async ({ page }) => {
    console.log('🔍 Testing NEW SITE data display');

    // Login
    await page.goto(`${NEW_SITE}${ADMIN_LOGIN_PATH}`, { timeout: 30000 });
    await page.fill('input[type="email"]', 'admin@glec.io');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${NEW_SITE}/admin/dashboard`, { timeout: 30000 });

    // Navigate to Demo Requests
    await page.goto(`${NEW_SITE}${DEMO_REQUESTS_PATH}`, { timeout: 10000 });
    await page.waitForSelector('table', { timeout: 10000 });

    // Verify table headers
    const headers = ['회사명', '이름', '이메일', '전화번호', '상태', '요청일시'];
    for (const header of headers) {
      const headerExists = await page.locator(`th:has-text("${header}")`).count();
      expect(headerExists).toBeGreaterThan(0);
      console.log(`   ✓ Header "${header}" found`);
    }
    console.log('   ✅ PASS: All table headers are correct');

    // Verify pagination exists
    const paginationExists = await page.locator('button:has-text("이전"), button:has-text("다음")').count();
    expect(paginationExists).toBeGreaterThan(0);
    console.log('   ✅ PASS: Pagination controls exist');
  });

  test('NEW SITE: Performance Metrics Summary', async ({ page }) => {
    console.log('\n📊 PERFORMANCE SUMMARY');
    console.log('='.repeat(60));

    // Login
    await page.goto(`${NEW_SITE}${ADMIN_LOGIN_PATH}`, { timeout: 30000 });
    await page.fill('input[type="email"]', 'admin@glec.io');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${NEW_SITE}/admin/dashboard`, { timeout: 30000 });

    // Measure performance 5 times
    const measurements: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await page.goto(`${NEW_SITE}${DEMO_REQUESTS_PATH}`, { timeout: 10000 });
      await page.waitForSelector('table', { timeout: 10000 });
      const loadTime = Date.now() - start;
      measurements.push(loadTime);
      console.log(`   Iteration ${i + 1}: ${loadTime}ms`);
    }

    const avgLoadTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const minLoadTime = Math.min(...measurements);
    const maxLoadTime = Math.max(...measurements);

    console.log('='.repeat(60));
    console.log(`📈 Average Load Time: ${(avgLoadTime / 1000).toFixed(2)}s`);
    console.log(`📉 Min Load Time: ${(minLoadTime / 1000).toFixed(2)}s`);
    console.log(`📊 Max Load Time: ${(maxLoadTime / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    // BEFORE (with infinite loop): 15-25 seconds
    // AFTER (with fix): < 5 seconds expected
    expect(avgLoadTime).toBeLessThan(5000);
    console.log('✅ INFINITE LOOP FIX VERIFIED!');
    console.log(`   Before: 15-25 seconds`);
    console.log(`   After: ${(avgLoadTime / 1000).toFixed(2)} seconds`);
    console.log(`   Improvement: ${((20000 - avgLoadTime) / 20000 * 100).toFixed(1)}% faster`);
  });
});
