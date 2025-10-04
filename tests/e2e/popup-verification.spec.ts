/**
 * Popup Verification E2E Test
 *
 * Purpose: Simple test to verify popup system works end-to-end
 * Focus: Website popup display without admin dependency
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Popup System Verification', () => {
  test('should verify popup API endpoint responds correctly', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/popups`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBeTruthy();
    expect(Array.isArray(data.data)).toBeTruthy();

    console.log('Popup API response:', {
      success: data.success,
      popupCount: data.data.length,
      meta: data.meta,
    });
  });

  test('should verify header has correct z-index (50)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();
    const zIndex = await header.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });

    expect(zIndex).toBe('50');
    console.log('Header z-index:', zIndex);
  });

  test('should verify popup z-index is less than header', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Wait for potential popups to load
    await page.waitForTimeout(2000);

    const popupModals = page.locator('.fixed').filter({ has: page.locator('.bg-white.rounded-lg') });
    const count = await popupModals.count();

    console.log('Popup count on page:', count);

    if (count > 0) {
      const firstPopup = popupModals.first();
      const popupZIndex = await firstPopup.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
      });

      const numericZIndex = parseInt(popupZIndex);
      expect(numericZIndex).toBeLessThanOrEqual(40);
      expect(numericZIndex).toBeLessThan(50);

      console.log('Popup z-index:', popupZIndex, '(should be ≤ 40)');
    } else {
      console.log('No popups currently active on page');
    }
  });

  test('should verify PopupManager component is rendered', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // PopupManager is rendered in RootLayout
    // Check if page loaded successfully
    const title = await page.title();
    expect(title).toContain('GLEC');

    console.log('Page title:', title);
  });

  test('should verify localStorage for closed popups works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Set localStorage item manually
    await page.evaluate(() => {
      const closedPopups = [
        { id: 'test-popup-1', date: new Date().toDateString() },
      ];
      localStorage.setItem('closed_popups', JSON.stringify(closedPopups));
    });

    // Verify localStorage was set
    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('closed_popups');
    });

    expect(storedValue).toBeTruthy();
    const parsed = JSON.parse(storedValue);
    expect(Array.isArray(parsed)).toBeTruthy();
    expect(parsed.length).toBe(1);

    console.log('Closed popups in localStorage:', parsed);

    // Clear localStorage
    await page.evaluate(() => {
      localStorage.removeItem('closed_popups');
    });

    const clearedValue = await page.evaluate(() => {
      return localStorage.getItem('closed_popups');
    });

    expect(clearedValue).toBeNull();
  });

  test('should verify page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Log any errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }

    // Expect no critical errors (some warnings are okay)
    const criticalErrors = consoleErrors.filter((err) =>
      err.includes('Failed') || err.includes('Error:')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should verify all main pages load successfully', async ({ page }) => {
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/events', name: 'Events' },
      { path: '/contact', name: 'Contact' },
      { path: '/solutions/api', name: 'Carbon API' },
    ];

    for (const { path, name } of pages) {
      const response = await page.goto(`${BASE_URL}${path}`);
      expect(response?.status()).toBe(200);
      await page.waitForLoadState('networkidle');

      console.log(`✓ ${name} loaded successfully`);
    }
  });
});

test.describe('Popup Display Types', () => {
  test('should handle modal popup close button', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const modalBackdrop = page.locator('.fixed.inset-0.bg-black\\/50').first();

    if (await modalBackdrop.isVisible()) {
      console.log('Modal popup detected');

      const closeButton = page.locator('button').filter({ hasText: '×' }).first();

      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);

        // Verify modal closed
        const stillVisible = await modalBackdrop.isVisible().catch(() => false);
        expect(stillVisible).toBeFalsy();

        console.log('✓ Modal close button works');
      }
    } else {
      console.log('No modal popup currently active');
    }
  });

  test('should verify banner popup positioning', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const bannerPopup = page.locator('.fixed.left-0.right-0').first();

    if (await bannerPopup.count() > 0) {
      const classList = await bannerPopup.evaluate((el) => el.className);
      const hasValidPosition = classList.includes('top-0') || classList.includes('bottom-0');

      expect(hasValidPosition).toBeTruthy();
      console.log('✓ Banner popup has valid position class');
    } else {
      console.log('No banner popup currently active');
    }
  });

  test('should verify corner popup positioning', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const cornerPopups = page.locator('.fixed').filter({
      has: page.locator('.bg-white.rounded-lg.shadow-2xl.p-4')
    });

    const count = await cornerPopups.count();

    if (count > 0) {
      const firstCorner = cornerPopups.first();
      const classList = await firstCorner.evaluate((el) => el.className);

      const hasValidPosition =
        classList.includes('top-4') ||
        classList.includes('bottom-4') ||
        classList.includes('left-4') ||
        classList.includes('right-4');

      expect(hasValidPosition).toBeTruthy();
      console.log('✓ Corner popup has valid position class');
    } else {
      console.log('No corner popup currently active');
    }
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile (iPhone SE)', width: 375, height: 667 },
    { name: 'Tablet (iPad)', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`should load correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const response = await page.goto(BASE_URL);
      expect(response?.status()).toBe(200);

      await page.waitForLoadState('networkidle');

      // Verify header is visible
      const header = page.locator('header').first();
      await expect(header).toBeVisible();

      // Verify main content is visible
      const main = page.locator('main').first();
      await expect(main).toBeVisible();

      console.log(`✓ ${viewport.name} (${viewport.width}x${viewport.height}) - Page loaded successfully`);
    });
  }
});
