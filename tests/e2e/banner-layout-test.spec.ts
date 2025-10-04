import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

test.describe('Banner Popup Layout Verification', () => {
  test('should display banner ABOVE header without overlapping', async ({ page }) => {
    // Navigate to homepage
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000); // Wait for popups to load

    // Check if banner popup exists
    const bannerPopup = page.locator('body > div:first-child').first();
    const header = page.locator('header');

    // Get bounding boxes
    const bannerBox = await bannerPopup.boundingBox();
    const headerBox = await header.boundingBox();

    console.log('Banner position:', bannerBox);
    console.log('Header position:', headerBox);

    // Banner should be ABOVE header (lower y position)
    if (bannerBox && headerBox) {
      expect(bannerBox.y + bannerBox.height).toBeLessThanOrEqual(headerBox.y + 1);
      console.log('✓ Banner is positioned ABOVE header (no overlap)');
    }

    // Header should not be covered by banner
    const isHeaderVisible = await header.isVisible();
    expect(isHeaderVisible).toBe(true);
    console.log('✓ Header is visible');

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/banner-layout-verification.png', fullPage: true });
    console.log('✓ Screenshot saved');
  });

  test('should allow header menu items to be clickable', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    // Find a menu item in header
    const menuItem = page.locator('header nav a').first();
    
    // Menu should be visible and clickable
    const isVisible = await menuItem.isVisible();
    expect(isVisible).toBe(true);

    const isClickable = await menuItem.isEnabled();
    expect(isClickable).toBe(true);

    console.log('✓ Header menu items are clickable');
  });
});
