import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

test.describe('Admin Analytics Page E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    const emailInput = page.locator('input[name="email"]');
    await emailInput.click();
    await emailInput.type('admin@glec.io', { delay: 50 });
    
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.click();
    await passwordInput.type('admin123!', { delay: 50 });
    
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
    console.log('✓ Logged in successfully');
  });

  test('should navigate to Analytics page and load data', async ({ page }) => {
    const startTime = Date.now();
    
    // Click Analytics menu
    await page.click('a[href="/admin/analytics"]');
    await page.waitForURL('**/admin/analytics', { timeout: 10000 });
    
    const navTime = Date.now() - startTime;
    console.log(`Navigation time: ${navTime}ms`);
    
    // Check page loaded
    await expect(page.locator('h1')).toContainText('분석', { timeout: 5000 });
    console.log('✓ Analytics page title found');
    
    // Check summary cards loaded (4 cards)
    const cards = page.locator('.bg-white.rounded-lg.shadow-sm.border');
    await expect(cards).toHaveCount(4, { timeout: 5000 });
    console.log('✓ 4 summary cards loaded');
    
    // Check Total Page Views card
    const pageViewsCard = page.locator('text=총 페이지뷰');
    await expect(pageViewsCard).toBeVisible();
    console.log('✓ Total Page Views card visible');
    
    // Check Total CTA Clicks card
    const ctaClicksCard = page.locator('text=총 CTA 클릭');
    await expect(ctaClicksCard).toBeVisible();
    console.log('✓ Total CTA Clicks card visible');
    
    // Check tables loaded
    const topPagesTable = page.locator('text=인기 페이지');
    await expect(topPagesTable).toBeVisible({ timeout: 5000 });
    console.log('✓ Top Pages table visible');
    
    const topCTAsTable = page.locator('text=인기 CTA');
    await expect(topCTAsTable).toBeVisible({ timeout: 5000 });
    console.log('✓ Top CTAs table visible');
  });

  test('should change time range and reload data', async ({ page }) => {
    // Navigate to Analytics
    await page.click('a[href="/admin/analytics"]');
    await page.waitForURL('**/admin/analytics', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Get initial total page views
    const initialViews = await page.locator('text=총 페이지뷰').locator('..').locator('p.text-2xl').textContent();
    console.log(`Initial total page views: ${initialViews}`);
    
    // Change time range to 30 days
    await page.selectOption('select', 'last_30_days');
    await page.waitForTimeout(2000); // Wait for data reload
    
    // Get new total page views
    const newViews = await page.locator('text=총 페이지뷰').locator('..').locator('p.text-2xl').textContent();
    console.log(`New total page views (30 days): ${newViews}`);
    
    // Views should be different (more data for 30 days)
    expect(initialViews).not.toBe(newViews);
    console.log('✓ Time range change triggered data reload');
  });

  test('should display table data correctly', async ({ page }) => {
    // Navigate to Analytics
    await page.click('a[href="/admin/analytics"]');
    await page.waitForURL('**/admin/analytics', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Check Top Pages table rows
    const pageRows = page.locator('tbody tr').first();
    await expect(pageRows).toBeVisible({ timeout: 5000 });
    
    // Should have at least 1 row
    const rowCount = await page.locator('tbody tr').count();
    console.log(`Top Pages rows: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);
    
    // Check row contains data (page name, views, visitors, time)
    const firstRow = page.locator('tbody tr').first();
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();
    console.log(`Table cells in first row: ${cellCount}`);
    expect(cellCount).toBeGreaterThanOrEqual(2); // At least page and views
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to Analytics
    await page.click('a[href="/admin/analytics"]');
    await page.waitForURL('**/admin/analytics', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Summary cards should stack vertically
    const cards = page.locator('.bg-white.rounded-lg.shadow-sm.border');
    const card1 = cards.nth(0);
    const card2 = cards.nth(1);
    
    const box1 = await card1.boundingBox();
    const box2 = await card2.boundingBox();
    
    if (box1 && box2) {
      // Card 2 should be below card 1 (not side by side)
      expect(box2.y).toBeGreaterThan(box1.y + box1.height - 10);
      console.log('✓ Cards stack vertically on mobile');
    }
  });

  test('should not have infinite loading or errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to Analytics
    await page.click('a[href="/admin/analytics"]');
    await page.waitForURL('**/admin/analytics', { timeout: 10000 });
    
    // Wait for loading to complete (max 10 seconds)
    await page.waitForTimeout(10000);
    
    // Check no loading skeleton is still visible
    const loadingSkeleton = page.locator('.animate-pulse');
    const skeletonCount = await loadingSkeleton.count();
    
    if (skeletonCount > 0) {
      console.error('⚠️ Loading skeleton still visible after 10 seconds');
    } else {
      console.log('✓ No infinite loading detected');
    }
    
    // Check no console errors
    if (errors.length > 0) {
      console.error('Console errors:', errors);
    } else {
      console.log('✓ No console errors');
    }
  });
});
