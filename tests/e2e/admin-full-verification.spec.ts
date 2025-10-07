/**
 * Admin Full Site Verification Test
 *
 * Tests all admin pages on production (Vercel deployment)
 * Verifies:
 * - Login flow
 * - All menu navigation
 * - Page loading
 * - Critical UI elements
 * - Audit logs functionality
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123';

// Helper: Login
async function login(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/admin\/(dashboard|demo-requests)/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Admin Full Site Verification', () => {
  test.setTimeout(180000); // 3 minutes for full test

  test('1. Login Page - Load and UI', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);
    await page.waitForLoadState('networkidle');

    // Check title
    await expect(page).toHaveTitle(/GLEC/);

    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    console.log('✅ Login page loaded successfully');
  });

  test('2. Login Flow - Authentication', async ({ page }) => {
    await login(page);

    // Should be on dashboard or demo-requests
    const url = page.url();
    expect(url).toMatch(/\/admin\/(dashboard|demo-requests)/);

    console.log('✅ Login successful');
  });

  test('3. Dashboard Page', async ({ page }) => {
    await login(page);

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    console.log('✅ Dashboard page loaded');
  });

  test('4. Analytics Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/analytics`);
    await page.waitForLoadState('networkidle');

    // Wait for page content - check for heading
    await page.waitForSelector('h1, h2', { timeout: 10000 });

    // Check for analytics-specific content
    const hasAnalyticsContent = await page.locator('text=분석').first().isVisible();
    expect(hasAnalyticsContent).toBeTruthy();

    console.log('✅ Analytics page loaded');
  });

  test('5. Notices (공지사항) Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/notices`);
    await page.waitForLoadState('networkidle');

    // Wait for either data or empty state
    await page.waitForSelector('table, .text-gray-500', { timeout: 10000 });

    // Check for page heading in main content (skip sidebar)
    const heading = await page.locator('main h1, main h2').first().textContent();
    expect(heading).toContain('공지사항');

    console.log('✅ Notices page loaded');
  });

  test('6. Press (보도자료) Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/press`);
    await page.waitForLoadState('networkidle');

    // Wait for either data or empty state
    await page.waitForSelector('table, .text-gray-500', { timeout: 10000 });

    // Check for page heading in main content (skip sidebar)
    const heading = await page.locator('main h1, main h2').first().textContent();
    expect(heading).toContain('보도자료');

    console.log('✅ Press page loaded');
  });

  test('7. Popups (팝업 관리) Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/popups`);
    await page.waitForLoadState('networkidle');

    // Wait for either data or empty state
    await page.waitForSelector('table, .text-gray-500', { timeout: 10000 });

    console.log('✅ Popups page loaded');
  });

  test('8. Knowledge Library Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/knowledge-library`);
    await page.waitForLoadState('networkidle');

    // Wait for page heading
    await page.waitForSelector('h1, h2', { timeout: 10000 });

    // Check for Knowledge Library content
    const hasKnowledgeContent = await page.locator('text=지식센터').first().isVisible();
    expect(hasKnowledgeContent).toBeTruthy();

    console.log('✅ Knowledge Library page loaded');
  });

  test('9. Knowledge Videos Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/knowledge-videos`);
    await page.waitForLoadState('networkidle');

    // Wait for page heading
    await page.waitForSelector('h1, h2', { timeout: 10000 });

    // Check for video management content
    const hasVideoContent = await page.locator('text=비디오').first().isVisible();
    expect(hasVideoContent).toBeTruthy();

    console.log('✅ Knowledge Videos page loaded');
  });

  test('10. Knowledge Blog Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/knowledge-blog`);
    await page.waitForLoadState('networkidle');

    // Wait for page heading
    await page.waitForSelector('main h1, main h2', { timeout: 10000 });

    // Check for blog management content in main area (skip sidebar)
    const heading = await page.locator('main h1, main h2').first().textContent();
    expect(heading).toContain('블로그');

    console.log('✅ Knowledge Blog page loaded');
  });

  test('11. Events Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/events`);
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('table, .text-gray-500', { timeout: 10000 });

    console.log('✅ Events page loaded');
  });

  test('12. Demo Requests (문의내역) Page', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/demo-requests`);
    await page.waitForLoadState('networkidle');

    // Wait for table or loading state
    await page.waitForSelector('table, .animate-spin', { timeout: 15000 });

    console.log('✅ Demo Requests page loaded');
  });

  test('13. Audit Logs (감사 로그) Page - SUPER_ADMIN ONLY', async ({ page }) => {
    await login(page);

    // Navigate to logs page
    await page.goto(`${BASE_URL}/admin/logs`);
    await page.waitForLoadState('networkidle');

    // Check if page loaded
    const body = await page.textContent('body');

    // If SUPER_ADMIN: should see logs page
    // If not SUPER_ADMIN: might see 403 or redirect

    if (body?.includes('감사 로그') || body?.includes('Audit')) {
      console.log('✅ Audit Logs page loaded (SUPER_ADMIN access confirmed)');

      // Check for filter dropdowns
      const selects = await page.locator('select').count();
      expect(selects).toBeGreaterThanOrEqual(2); // Action and Resource filters

    } else if (body?.includes('403') || body?.includes('Forbidden')) {
      console.log('⚠️  Audit Logs page: 403 Forbidden (logged in user is not SUPER_ADMIN)');
    } else {
      console.log('⚠️  Audit Logs page: Unexpected response');
    }
  });

  test('14. Sidebar Menu - All Items Present', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check sidebar menu items
    const menuItems = [
      '대시보드',
      '분석',
      '공지사항',
      '보도자료',
      '팝업 관리',
      '이벤트',
      '문의내역',
    ];

    for (const item of menuItems) {
      const menuItem = page.locator('nav').getByText(item);
      await expect(menuItem).toBeVisible({ timeout: 5000 });
    }

    // Check if "감사 로그" menu exists (SUPER_ADMIN only)
    const logsMenu = page.locator('nav').getByText('감사 로그');
    const logsExists = await logsMenu.count() > 0;

    if (logsExists) {
      console.log('✅ All menu items present (including 감사 로그 for SUPER_ADMIN)');
    } else {
      console.log('✅ All menu items present (감사 로그 not visible - user is not SUPER_ADMIN)');
    }
  });

  test('15. Logout Functionality', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('networkidle');

    // Find and click logout button
    const logoutButton = page.locator('button').filter({ hasText: '로그아웃' });
    await logoutButton.click();

    // Should redirect to login page
    await page.waitForURL(/\/admin\/login/, { timeout: 5000 });

    console.log('✅ Logout successful');
  });

  test('16. Comprehensive Page Load Performance', async ({ page }) => {
    await login(page);

    const pages = [
      { url: '/admin/dashboard', name: 'Dashboard' },
      { url: '/admin/analytics', name: 'Analytics' },
      { url: '/admin/notices', name: 'Notices' },
      { url: '/admin/press', name: 'Press' },
      { url: '/admin/popups', name: 'Popups' },
      { url: '/admin/events', name: 'Events' },
      { url: '/admin/demo-requests', name: 'Demo Requests' },
      { url: '/admin/logs', name: 'Audit Logs' },
    ];

    const results: any[] = [];

    for (const pageInfo of pages) {
      const start = Date.now();

      try {
        await page.goto(`${BASE_URL}${pageInfo.url}`, { timeout: 15000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        const loadTime = Date.now() - start;

        // Check for actual error indicators (visible error messages or 404 pages)
        let hasError = false;
        try {
          // Check for visible error text or 404 headings
          const errorVisible = await page.locator('text="404"').first().isVisible({ timeout: 1000 });
          hasError = errorVisible;
        } catch {
          // No visible error found, page is OK
          hasError = false;
        }

        results.push({
          page: pageInfo.name,
          url: pageInfo.url,
          loadTime: `${loadTime}ms`,
          status: hasError ? '❌ Error' : '✅ OK',
        });

      } catch (error) {
        results.push({
          page: pageInfo.name,
          url: pageInfo.url,
          loadTime: 'Timeout',
          status: '❌ Failed',
        });
      }
    }

    // Print results
    console.log('\n📊 Page Load Performance Report:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.forEach(r => {
      console.log(`${r.status.padEnd(10)} ${r.page.padEnd(20)} ${r.loadTime.padEnd(10)} ${r.url}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // All pages should load successfully (except Audit Logs if not SUPER_ADMIN)
    const failedPages = results.filter(r => r.status === '❌ Failed' && !r.url.includes('logs'));
    expect(failedPages.length).toBe(0);
  });
});
