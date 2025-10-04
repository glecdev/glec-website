/**
 * CMS Real-time Synchronization E2E Test
 *
 * Purpose: Test admin-website content management system real-time data sync
 * Scenarios:
 * 1. Create popup in admin → Verify popup appears on website
 * 2. Edit popup in admin → Verify changes reflect on website
 * 3. Delete popup in admin → Verify popup disappears from website
 * 4. Toggle popup active/inactive → Verify visibility on website
 */

import { test, expect, Page } from '@playwright/test';
import { adminLogin, closeAllPopups } from '../helpers/test-utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_URL = `${BASE_URL}/admin`;

test.describe('CMS Real-time Synchronization', () => {
  let adminPage: Page;
  let websitePage: Page;

  test.beforeAll(async ({ browser }) => {
    // Create two separate browser contexts
    const adminContext = await browser.newContext();
    const websiteContext = await browser.newContext();

    adminPage = await adminContext.newPage();
    websitePage = await websiteContext.newPage();
  });

  test.afterAll(async () => {
    await adminPage.close();
    await websitePage.close();
  });

  test.beforeEach(async () => {
    // Admin login using helper
    await adminLogin(adminPage, BASE_URL);
    await closeAllPopups(adminPage);

    // Navigate to homepage on website
    await websitePage.goto(BASE_URL);
    await websitePage.waitForLoadState('networkidle');
  });

  test('should create popup in admin and verify it appears on website', async () => {
    // Step 1: Navigate to popup management in admin
    await adminPage.click('a[href="/admin/popups"]');
    await adminPage.waitForURL(`${ADMIN_URL}/popups`);

    // Step 2: Click "Create Popup" button
    await adminPage.click('a[href="/admin/popups/new"]');
    await adminPage.waitForURL(`${ADMIN_URL}/popups/new`);

    // Step 3: Fill popup form
    const testPopupTitle = `E2E Test Popup ${Date.now()}`;
    const testPopupContent = '<p>This is an E2E test popup content</p>';

    await adminPage.fill('input#title', testPopupTitle);
    await adminPage.fill('textarea#content', testPopupContent);
    await adminPage.selectOption('select#displayType', 'modal');
    await adminPage.selectOption('select#position', 'center');
    await adminPage.fill('input#width', '500');
    await adminPage.fill('input#height', '400');

    // Set dates (start: now, end: +7 days)
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await adminPage.fill('input#startDate', now.toISOString().slice(0, 16));
    await adminPage.fill('input#endDate', future.toISOString().slice(0, 16));

    // Ensure active checkbox is checked
    const isActiveCheckbox = adminPage.locator('input[type="checkbox"]').first();
    const isChecked = await isActiveCheckbox.isChecked();
    if (!isChecked) {
      await isActiveCheckbox.check();
    }

    // Step 4: Submit form
    await adminPage.click('button[type="submit"]');

    // Wait for redirect to popup list
    await adminPage.waitForURL(`${ADMIN_URL}/popups`, { timeout: 10000 });

    // Verify popup appears in admin list
    await expect(adminPage.locator(`text=${testPopupTitle}`)).toBeVisible({ timeout: 5000 });

    // Step 5: Reload website and verify popup appears
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // Wait for popup to appear
    const popupModal = websitePage.locator('.fixed.inset-0.bg-black\\/50');
    await expect(popupModal).toBeVisible({ timeout: 10000 });

    // Verify popup title
    const popupTitleElement = websitePage.locator(`text=${testPopupTitle}`);
    await expect(popupTitleElement).toBeVisible();

    // Verify popup content
    const popupContentElement = websitePage.locator('text=This is an E2E test popup content');
    await expect(popupContentElement).toBeVisible();

    // Close popup
    const closeButton = websitePage.locator('button').filter({ hasText: '×' }).first();
    await closeButton.click();

    // Verify popup is closed
    await expect(popupModal).not.toBeVisible();
  });

  test('should edit popup in admin and verify changes on website', async () => {
    // Step 1: Navigate to popup list
    await adminPage.click('a[href="/admin/popups"]');
    await adminPage.waitForURL(`${ADMIN_URL}/popups`);

    // Step 2: Click first "Edit" button
    const editButton = adminPage.locator('a').filter({ hasText: '수정' }).first();
    await editButton.click();

    // Wait for edit page
    await adminPage.waitForURL(/\/admin\/popups\/edit\?id=/, { timeout: 10000 });

    // Step 3: Modify popup title
    const currentTitle = await adminPage.inputValue('input#title');
    const updatedTitle = `${currentTitle} (Updated)`;
    await adminPage.fill('input#title', updatedTitle);

    // Step 4: Submit form
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(`${ADMIN_URL}/popups`, { timeout: 10000 });

    // Step 5: Reload website
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // Verify updated title appears
    const updatedTitleElement = websitePage.locator(`text=${updatedTitle}`);
    await expect(updatedTitleElement).toBeVisible({ timeout: 10000 });
  });

  test('should toggle popup active/inactive and verify visibility', async () => {
    // Step 1: Navigate to popup list
    await adminPage.click('a[href="/admin/popups"]');
    await adminPage.waitForURL(`${ADMIN_URL}/popups`);

    // Step 2: Get first popup title
    const firstPopupTitle = await adminPage.locator('h3').first().textContent();
    expect(firstPopupTitle).toBeTruthy();

    // Step 3: Click toggle button (활성화/비활성화)
    const toggleButton = adminPage.locator('button').filter({ hasText: /활성화|비활성화/ }).first();
    const initialStatus = await toggleButton.textContent();
    await toggleButton.click();

    // Wait for status change
    await adminPage.waitForTimeout(1000);

    // Step 4: Reload website
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // If initial was "활성화" → now "비활성화" → popup should not appear
    if (initialStatus?.includes('활성화')) {
      const popupModal = websitePage.locator('.fixed.inset-0.bg-black\\/50');
      await expect(popupModal).not.toBeVisible({ timeout: 5000 });
    }
    // If initial was "비활성화" → now "활성화" → popup should appear
    else {
      const popupModal = websitePage.locator('.fixed.inset-0.bg-black\\/50');
      await expect(popupModal).toBeVisible({ timeout: 10000 });
    }

    // Toggle back to original state
    await toggleButton.click();
    await adminPage.waitForTimeout(1000);
  });

  test('should delete popup in admin and verify it disappears from website', async () => {
    // Step 1: Navigate to popup list
    await adminPage.click('a[href="/admin/popups"]');
    await adminPage.waitForURL(`${ADMIN_URL}/popups`);

    // Step 2: Count initial popups
    const initialPopupCount = await adminPage.locator('h3.text-xl.font-bold').count();
    expect(initialPopupCount).toBeGreaterThan(0);

    // Step 3: Get first popup title
    const firstPopupTitle = await adminPage.locator('h3.text-xl.font-bold').first().textContent();
    expect(firstPopupTitle).toBeTruthy();

    // Step 4: Click delete button
    const deleteButton = adminPage.locator('button').filter({ hasText: '삭제' }).first();

    // Handle confirmation dialog
    adminPage.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('삭제하시겠습니까');
      await dialog.accept();
    });

    await deleteButton.click();

    // Wait for deletion
    await adminPage.waitForTimeout(2000);

    // Verify popup count decreased
    const afterPopupCount = await adminPage.locator('h3.text-xl.font-bold').count();
    expect(afterPopupCount).toBe(initialPopupCount - 1);

    // Step 5: Reload website
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // Verify deleted popup does not appear
    if (firstPopupTitle) {
      const deletedPopupElement = websitePage.locator(`text=${firstPopupTitle}`);
      await expect(deletedPopupElement).not.toBeVisible();
    }
  });

  test('should handle z-index ordering correctly', async () => {
    // Step 1: Navigate to popup list
    await adminPage.click('a[href="/admin/popups"]');
    await adminPage.waitForURL(`${ADMIN_URL}/popups`);

    // Step 2: Verify popup order (highest z-index first)
    const zIndexElements = await adminPage.locator('span:has-text("z-index:")').allTextContents();
    expect(zIndexElements.length).toBeGreaterThan(0);

    // Extract z-index values
    const zIndexValues = zIndexElements.map((text) => {
      const match = text.match(/z-index:\s*(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    // Verify descending order
    for (let i = 0; i < zIndexValues.length - 1; i++) {
      expect(zIndexValues[i]).toBeGreaterThanOrEqual(zIndexValues[i + 1]);
    }

    // Step 3: Reload website
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // Step 4: Verify popup z-index on website
    const popupModals = websitePage.locator('.fixed.inset-0.bg-black\\/50');
    const popupCount = await popupModals.count();

    if (popupCount > 0) {
      // Get z-index from first popup
      const firstPopupZIndex = await popupModals.first().evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      });

      // Verify z-index is less than header (50)
      expect(parseInt(firstPopupZIndex)).toBeLessThanOrEqual(40);
    }
  });

  test('should verify "Show Once" feature works correctly', async () => {
    // Step 1: Clear localStorage to reset "closed popups"
    await websitePage.evaluate(() => {
      localStorage.removeItem('closed_popups');
    });

    // Step 2: Reload website
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // Step 3: Verify popup appears
    const popupModal = websitePage.locator('.fixed.inset-0.bg-black\\/50').first();

    if (await popupModal.isVisible()) {
      // Step 4: Click "Show Once" button
      const showOnceButton = websitePage.locator('button:has-text("오늘 하루 보지 않기")').first();

      if (await showOnceButton.isVisible()) {
        await showOnceButton.click();

        // Verify popup is closed
        await expect(popupModal).not.toBeVisible();

        // Step 5: Reload website
        await websitePage.reload();
        await websitePage.waitForLoadState('networkidle');

        // Verify popup does NOT reappear
        await expect(popupModal).not.toBeVisible({ timeout: 5000 });

        // Step 6: Clear localStorage
        await websitePage.evaluate(() => {
          localStorage.removeItem('closed_popups');
        });

        // Step 7: Reload website again
        await websitePage.reload();
        await websitePage.waitForLoadState('networkidle');

        // Verify popup appears again
        await expect(popupModal).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should verify popup header z-index hierarchy', async () => {
    // Step 1: Navigate to website homepage
    await websitePage.goto(BASE_URL);
    await websitePage.waitForLoadState('networkidle');

    // Step 2: Get header z-index
    const headerElement = websitePage.locator('header').first();
    const headerZIndex = await headerElement.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    expect(parseInt(headerZIndex)).toBe(50);

    // Step 3: Get popup z-index (if exists)
    const popupModal = websitePage.locator('.fixed.inset-0.bg-black\\/50').first();

    if (await popupModal.isVisible()) {
      const popupZIndex = await popupModal.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      });

      // Verify popup z-index is less than header
      expect(parseInt(popupZIndex)).toBeLessThan(parseInt(headerZIndex));
      expect(parseInt(popupZIndex)).toBeLessThanOrEqual(40);
    }
  });
});

test.describe('Popup Display Types', () => {
  let websitePage: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    websitePage = await context.newPage();
  });

  test.afterAll(async () => {
    await websitePage.close();
  });

  test('should display modal popup correctly', async () => {
    await websitePage.goto(BASE_URL);
    await websitePage.waitForLoadState('networkidle');

    // Look for modal popup
    const modalPopup = websitePage.locator('.fixed.inset-0.bg-black\\/50');

    if (await modalPopup.count() > 0) {
      const firstModal = modalPopup.first();
      await expect(firstModal).toBeVisible();

      // Verify backdrop
      const backdrop = await firstModal.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backdrop).toBeTruthy();

      // Verify close button exists
      const closeButton = websitePage.locator('button').filter({ hasText: '×' }).first();
      await expect(closeButton).toBeVisible();
    }
  });

  test('should display banner popup correctly', async () => {
    await websitePage.goto(BASE_URL);
    await websitePage.waitForLoadState('networkidle');

    // Look for banner popup (top or bottom)
    const bannerPopup = websitePage.locator('.fixed.left-0.right-0');

    if (await bannerPopup.count() > 0) {
      const firstBanner = bannerPopup.first();
      await expect(firstBanner).toBeVisible();

      // Verify position (top-0 or bottom-0)
      const classList = await firstBanner.evaluate((el) => el.className);
      expect(classList).toMatch(/top-0|bottom-0/);
    }
  });

  test('should display corner popup correctly', async () => {
    await websitePage.goto(BASE_URL);
    await websitePage.waitForLoadState('networkidle');

    // Look for corner popup
    const cornerPopup = websitePage.locator('.fixed').filter({ has: websitePage.locator('.bg-white.rounded-lg.shadow-2xl') });

    if (await cornerPopup.count() > 0) {
      const firstCorner = cornerPopup.first();

      if (await firstCorner.isVisible()) {
        // Verify position class (top-4, bottom-4, left-4, right-4)
        const classList = await firstCorner.evaluate((el) => el.className);
        expect(classList).toMatch(/top-4|bottom-4|left-4|right-4/);
      }
    }
  });
});
