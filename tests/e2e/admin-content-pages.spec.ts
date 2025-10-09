/**
 * Admin Content Pages E2E Tests
 *
 * Purpose: Verify error handling improvements are working across all admin pages
 * - Auto-logout on token expiry
 * - Expired session message display
 * - Pages load without "An unexpected error occurred"
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

test.describe('Admin Content Pages - Error Handling', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);

    // Fill login form
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);

    // Submit and wait for redirect to dashboard
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 60000 });

    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
  });

  test('공지사항 페이지 - 에러 없이 로드되는지 확인', async ({ page }) => {
    // Navigate to notices page
    await page.goto(`${BASE_URL}/admin/notices`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for generic error message (should NOT exist)
    const errorMessage = page.getByText(/An unexpected error occurred/i);
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasError).toBe(false);

    // Verify page title is visible
    const pageTitle = page.getByRole('heading', { name: /공지사항/i });
    await expect(pageTitle).toBeVisible();

    console.log('✅ 공지사항 페이지: 에러 없음');
  });

  test('이벤트 페이지 - 에러 없이 로드되는지 확인', async ({ page }) => {
    // Navigate to events page
    await page.goto(`${BASE_URL}/admin/events`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for generic error message (should NOT exist)
    const errorMessage = page.getByText(/An unexpected error occurred/i);
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasError).toBe(false);

    // Verify page title is visible
    const pageTitle = page.getByRole('heading', { name: /이벤트/i });
    await expect(pageTitle).toBeVisible();

    console.log('✅ 이벤트 페이지: 에러 없음');
  });

  test('보도자료 페이지 - 에러 없이 로드되는지 확인', async ({ page }) => {
    // Navigate to press page
    await page.goto(`${BASE_URL}/admin/press`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for generic error message (should NOT exist)
    const errorMessage = page.getByText(/An unexpected error occurred/i);
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasError).toBe(false);

    // Verify page title is visible
    const pageTitle = page.getByRole('heading', { name: /보도자료/i });
    await expect(pageTitle).toBeVisible();

    console.log('✅ 보도자료 페이지: 에러 없음');
  });

  test('토큰 만료 시 자동 로그아웃 확인', async ({ page, context }) => {
    // Navigate to notices page (any content page works)
    await page.goto(`${BASE_URL}/admin/notices`);
    await page.waitForLoadState('networkidle');

    // Simulate token expiry by clearing localStorage
    await page.evaluate(() => {
      localStorage.removeItem('admin_token');
    });

    // Trigger API call by reloading page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be redirected to login page with expired query param
    const currentURL = page.url();
    expect(currentURL).toContain('/admin/login');
    expect(currentURL).toContain('expired=true');

    // Verify expired session message is displayed
    const expiredMessage = page.getByText(/세션이 만료되었습니다/i);
    await expect(expiredMessage).toBeVisible();

    console.log('✅ 토큰 만료 자동 로그아웃: 정상 작동');
  });

  test('만료 세션 메시지 표시 확인', async ({ page }) => {
    // Directly navigate to login page with expired=true
    await page.goto(`${BASE_URL}/admin/login?expired=true`);

    // Verify expired session message is displayed
    const expiredMessage = page.getByText(/세션이 만료되었습니다/i);
    await expect(expiredMessage).toBeVisible();

    // Verify amber warning banner exists
    const warningBanner = page.locator('.bg-amber-50.border-amber-200');
    await expect(warningBanner).toBeVisible();

    console.log('✅ 만료 세션 메시지: 정상 표시');
  });

  test('모든 어드민 콘텐츠 페이지 네비게이션 확인', async ({ page }) => {
    // Test navigation flow: Dashboard → Notices → Events → Press

    // 1. Dashboard (already there from beforeEach)
    await expect(page).toHaveURL(`${BASE_URL}/admin/dashboard`);

    // 2. Navigate to Notices
    await page.click('a[href="/admin/notices"]');
    await page.waitForURL(`${BASE_URL}/admin/notices`);
    await page.waitForLoadState('networkidle');

    const noticesError = page.getByText(/An unexpected error occurred/i);
    const hasNoticesError = await noticesError.isVisible().catch(() => false);
    expect(hasNoticesError).toBe(false);

    // 3. Navigate to Events
    await page.click('a[href="/admin/events"]');
    await page.waitForURL(`${BASE_URL}/admin/events`);
    await page.waitForLoadState('networkidle');

    const eventsError = page.getByText(/An unexpected error occurred/i);
    const hasEventsError = await eventsError.isVisible().catch(() => false);
    expect(hasEventsError).toBe(false);

    // 4. Navigate to Press
    await page.click('a[href="/admin/press"]');
    await page.waitForURL(`${BASE_URL}/admin/press`);
    await page.waitForLoadState('networkidle');

    const pressError = page.getByText(/An unexpected error occurred/i);
    const hasPressError = await pressError.isVisible().catch(() => false);
    expect(hasPressError).toBe(false);

    console.log('✅ 모든 페이지 네비게이션: 에러 없음');
  });
});
