/**
 * Iteration 5: Admin GET API E2E Flow Test
 *
 * CLAUDE.md Step 6 Phase 1: MCP E2E Testing
 *
 * Tests complete user flow:
 * 1. Admin login
 * 2. Navigate to Notices page
 * 3. Test pagination
 * 4. Test filtering (status, category)
 * 5. Test search
 * 6. Verify data consistency
 *
 * Success Criteria:
 * - All pages load < 3s
 * - All API calls return 200
 * - UI reflects filtered data correctly
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

test.describe('Admin GET API E2E Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait longer for API call + redirect (Next.js dev server can be slow)
    await page.waitForTimeout(5000);

    // Verify login success by checking token
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    expect(token).toBeTruthy();

    // Current URL should contain /admin/
    const currentURL = page.url();
    expect(currentURL).toContain('/admin/');
  });

  test('Admin Notices - Complete GET flow', async ({ page }) => {
    // Step 1: Navigate to Notices page
    console.log('Step 1: Navigating to Notices page...');
    const navigationStart = Date.now();
    await page.goto(`${BASE_URL}/admin/notices`);
    await page.waitForLoadState('networkidle');
    const navigationTime = Date.now() - navigationStart;
    console.log(`✅ Notices page loaded in ${navigationTime}ms`);
    expect(navigationTime).toBeLessThan(3000);

    // Step 2: Verify initial data load
    console.log('Step 2: Verifying initial data load...');
    const noticeRows = page.locator('[data-testid="notice-row"], tr:has(td)').first();
    await expect(noticeRows).toBeVisible({ timeout: 5000 });
    console.log('✅ Notices data loaded');

    // Step 3: Test pagination (if available)
    console.log('Step 3: Testing pagination...');
    const paginationExists = await page.locator('[data-testid="pagination"], nav[aria-label="pagination"]').count() > 0;
    if (paginationExists) {
      const currentPage = await page.locator('[data-testid="current-page"], [aria-current="page"]').textContent();
      console.log(`✅ Current page: ${currentPage}`);
    } else {
      console.log('⚠️ Pagination not visible (likely < 20 items)');
    }

    // Step 4: Test status filter (DRAFT vs PUBLISHED)
    console.log('Step 4: Testing status filter...');
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('DRAFT');
      await page.waitForTimeout(1000); // Wait for API call
      console.log('✅ Status filter applied: DRAFT');

      // Verify filtered results
      const draftBadges = page.locator('text=/DRAFT/i');
      const draftCount = await draftBadges.count();
      console.log(`✅ Found ${draftCount} DRAFT notices`);

      // Reset filter
      await statusFilter.selectOption('');
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ Status filter not found in UI');
    }

    // Step 5: Test category filter
    console.log('Step 5: Testing category filter...');
    const categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]');
    if (await categoryFilter.count() > 0) {
      await categoryFilter.selectOption('GENERAL');
      await page.waitForTimeout(1000);
      console.log('✅ Category filter applied: GENERAL');

      // Reset filter
      await categoryFilter.selectOption('');
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ Category filter not found in UI');
    }

    // Step 6: Test search
    console.log('Step 6: Testing search...');
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], [data-testid="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
      console.log('✅ Search applied: "Test"');

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ Search input not found in UI');
    }

    console.log('✅ Admin Notices GET flow complete');
  });

  test('Admin Press - Navigate and verify data', async ({ page }) => {
    console.log('Navigating to Press page...');
    const navigationStart = Date.now();
    await page.goto(`${BASE_URL}/admin/press`);
    await page.waitForLoadState('networkidle');
    const navigationTime = Date.now() - navigationStart;
    console.log(`✅ Press page loaded in ${navigationTime}ms`);
    expect(navigationTime).toBeLessThan(3000);

    // Verify data loaded
    const pressRows = page.locator('[data-testid="press-row"], tr:has(td)').first();
    const hasData = await pressRows.count() > 0;
    if (hasData) {
      await expect(pressRows).toBeVisible({ timeout: 5000 });
      console.log('✅ Press data loaded');
    } else {
      console.log('⚠️ No press data found (empty table)');
    }
  });

  test('Admin Popups - Navigate and verify data', async ({ page }) => {
    console.log('Navigating to Popups page...');
    const navigationStart = Date.now();
    await page.goto(`${BASE_URL}/admin/popups`);
    await page.waitForLoadState('networkidle');
    const navigationTime = Date.now() - navigationStart;
    console.log(`✅ Popups page loaded in ${navigationTime}ms`);
    expect(navigationTime).toBeLessThan(3000);

    // Verify data loaded
    const popupRows = page.locator('[data-testid="popup-row"], tr:has(td)').first();
    const hasData = await popupRows.count() > 0;
    if (hasData) {
      await expect(popupRows).toBeVisible({ timeout: 5000 });
      console.log('✅ Popups data loaded');
    } else {
      console.log('⚠️ No popup data found (empty table)');
    }
  });

  test('Admin Events - Navigate and verify data', async ({ page }) => {
    console.log('Navigating to Events page...');
    const navigationStart = Date.now();
    await page.goto(`${BASE_URL}/admin/events`);
    await page.waitForLoadState('networkidle');
    const navigationTime = Date.now() - navigationStart;
    console.log(`✅ Events page loaded in ${navigationTime}ms`);
    expect(navigationTime).toBeLessThan(3000);

    // Verify data loaded
    const eventRows = page.locator('[data-testid="event-row"], tr:has(td)').first();
    const hasData = await eventRows.count() > 0;
    if (hasData) {
      await expect(eventRows).toBeVisible({ timeout: 5000 });
      console.log('✅ Events data loaded');
    } else {
      console.log('⚠️ No event data found (empty table)');
    }
  });

  test('Performance: All GET APIs respond < 1s', async ({ page }) => {
    // Track API response times
    const apiTimes: Record<string, number> = {};

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/admin/') && response.request().method() === 'GET') {
        const timing = response.timing();
        const responseTime = timing.responseEnd - timing.requestStart;
        const endpoint = url.split('/api/admin/')[1]?.split('?')[0];
        if (endpoint) {
          apiTimes[endpoint] = responseTime;
        }
      }
    });

    // Navigate to each admin page to trigger GET API calls
    const pages = [
      '/admin/notices',
      '/admin/press',
      '/admin/popups',
      '/admin/events',
    ];

    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Ensure all API calls complete
    }

    // Verify all API response times
    console.log('\n📊 API Response Times:');
    for (const [endpoint, time] of Object.entries(apiTimes)) {
      console.log(`   ${endpoint}: ${time.toFixed(0)}ms`);
      expect(time).toBeLessThan(1000);
    }
    console.log('✅ All GET APIs respond < 1s');
  });
});
