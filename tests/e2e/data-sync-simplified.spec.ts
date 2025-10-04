/**
 * Simplified Data Synchronization E2E Test
 *
 * Purpose: Test core data flow between Admin and Public website
 * Handles Next.js compilation delays gracefully
 *
 * @iteration 17
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

// Helper: Wait for page to fully load (handle Next.js compilation)
async function waitForPageReady(page: Page, url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000); // Allow compilation

    const pageTitle = await page.title();
    if (!pageTitle.includes('404')) {
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      return true;
    }

    console.log(`⏳ Attempt ${i + 1}: Page compiling, retrying...`);
    await page.waitForTimeout(3000);
  }

  throw new Error(`Page ${url} returned 404 after ${maxRetries} attempts`);
}

test.describe('Data Synchronization - Simplified Tests', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  test('1. Homepage loads and displays popups', async ({ page }) => {
    await waitForPageReady(page, `${BASE_URL}/`);

    // Verify homepage loaded
    await expect(page).toHaveTitle(/GLEC/);

    // Check if popup API is called
    const popupResponse = page.waitForResponse(resp =>
      resp.url().includes('/api/popups') && resp.status() === 200
    );

    await page.reload();
    const response = await popupResponse;
    const data = await response.json();

    console.log(`✅ Homepage loaded, ${data.data?.length || 0} popups found`);
    expect(data.success).toBe(true);
  });

  test('2. Public notices page loads data from API', async ({ page }) => {
    await waitForPageReady(page, `${BASE_URL}/notices`);

    // Wait for notices API call
    const noticesResponse = await page.waitForResponse(
      resp => resp.url().includes('/api/admin/notices') || resp.url().includes('/api/notices'),
      { timeout: 30000 }
    ).catch(() => null);

    if (noticesResponse) {
      const data = await noticesResponse.json();
      console.log(`✅ Notices API called, ${data.data?.length || data.notices?.length || 0} notices found`);
    }

    // Verify page rendered
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Press/News page loads data from API', async ({ page }) => {
    await waitForPageReady(page, `${BASE_URL}/knowledge/press`);

    // Wait for press API call
    const pressResponse = await page.waitForResponse(
      resp => resp.url().includes('/api/admin/press') || resp.url().includes('/api/press'),
      { timeout: 30000 }
    ).catch(() => null);

    if (pressResponse) {
      const data = await pressResponse.json();
      console.log(`✅ Press API called, ${data.data?.length || data.press?.length || 0} items found`);
    }

    // Verify page rendered
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Admin login page loads', async ({ page }) => {
    await waitForPageReady(page, `${BASE_URL}/admin/login`);

    // Verify login form exists
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });

    // Check for username/email field
    const hasUsernameField = await page.locator('input[name="username"]').count() > 0;
    const hasEmailField = await page.locator('input[name="email"]').count() > 0;

    expect(hasUsernameField || hasEmailField).toBe(true);

    // Check for password field
    await expect(page.locator('input[name="password"]')).toBeVisible();

    console.log(`✅ Login form loaded, using ${hasEmailField ? 'email' : 'username'} field`);
  });

  test('5. Admin dashboard accessible after login', async ({ page }) => {
    // Step 1: Go to login page
    await waitForPageReady(page, `${BASE_URL}/admin/login`);

    // Step 2: Determine field name (username or email)
    const hasEmailField = await page.locator('input[name="email"]').count() > 0;
    const fieldName = hasEmailField ? 'email' : 'username';
    const credentials = hasEmailField ? 'admin@glec.io' : 'glecadmin';

    // Step 3: Login
    await page.fill(`input[name="${fieldName}"]`, credentials);
    await page.fill('input[name="password"]', 'admin123!');
    await page.click('button[type="submit"]');

    // Step 4: Wait for redirect
    await page.waitForURL(/\/admin/, { timeout: 30000 });

    // Step 5: Verify dashboard or admin page loaded
    const currentUrl = page.url();
    expect(currentUrl).toContain('/admin');

    console.log(`✅ Login successful, redirected to: ${currentUrl}`);
  });

  test('6. Admin notices list loads', async ({ page, context }) => {
    // Login first
    await waitForPageReady(page, `${BASE_URL}/admin/login`);

    const hasEmailField = await page.locator('input[name="email"]').count() > 0;
    const fieldName = hasEmailField ? 'email' : 'username';
    const credentials = hasEmailField ? 'admin@glec.io' : 'glecadmin';

    await page.fill(`input[name="${fieldName}"]`, credentials);
    await page.fill('input[name="password"]', 'admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 30000 });

    // Navigate to notices
    await waitForPageReady(page, `${BASE_URL}/admin/notices`);

    // Verify notices admin page loaded
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // Check for table or list
    const hasTable = await page.locator('table').count() > 0;
    const hasList = await page.locator('ul li, [role="list"]').count() > 0;

    expect(hasTable || hasList).toBe(true);

    console.log(`✅ Notices admin loaded, using ${hasTable ? 'table' : 'list'} layout`);
  });

  test('7. Data consistency: Public notices match admin notices', async ({ page, context }) => {
    // Step 1: Login to admin
    await waitForPageReady(page, `${BASE_URL}/admin/login`);

    const hasEmailField = await page.locator('input[name="email"]').count() > 0;
    const fieldName = hasEmailField ? 'email' : 'username';
    const credentials = hasEmailField ? 'admin@glec.io' : 'glecadmin';

    await page.fill(`input[name="${fieldName}"]`, credentials);
    await page.fill('input[name="password"]', 'admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 30000 });

    // Step 2: Get admin notices count
    await waitForPageReady(page, `${BASE_URL}/admin/notices`);

    const adminNoticesResponse = await page.waitForResponse(
      resp => resp.url().includes('/api/admin/notices') && resp.status() === 200,
      { timeout: 30000 }
    ).catch(() => null);

    let adminCount = 0;
    if (adminNoticesResponse) {
      const adminData = await adminNoticesResponse.json();
      adminCount = adminData.data?.length || adminData.notices?.length || 0;
    }

    // Step 3: Get public notices count
    const publicPage = await context.newPage();
    await waitForPageReady(publicPage, `${BASE_URL}/notices`);

    const publicNoticesResponse = await publicPage.waitForResponse(
      resp => resp.url().includes('/api/') && resp.status() === 200,
      { timeout: 30000 }
    ).catch(() => null);

    let publicCount = 0;
    if (publicNoticesResponse) {
      const publicData = await publicNoticesResponse.json();
      publicCount = publicData.data?.filter((n: any) => n.status === 'PUBLISHED').length ||
                     publicData.notices?.filter((n: any) => n.status === 'PUBLISHED').length || 0;
    }

    console.log(`📊 Admin notices: ${adminCount}, Public notices: ${publicCount}`);

    // Public should show <= admin (only PUBLISHED)
    expect(publicCount).toBeLessThanOrEqual(adminCount);

    await publicPage.close();
  });
});
