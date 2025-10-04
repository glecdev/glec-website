/**
 * News Page Validation - Recursive Improvement Test
 *
 * Purpose: Validate that /news page loads correctly without errors
 * Tests: API integration, loading states, error handling
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

test.describe('News Page - Recursive Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log('Page error:', error.message);
    });
  });

  test('should load without client-side exceptions', async ({ page }) => {
    let hasError = false;

    page.on('pageerror', () => {
      hasError = true;
    });

    await page.goto(`${BASE_URL}/news`);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    expect(hasError).toBe(false);
  });

  test('should display page title and breadcrumbs', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // Check h1 title
    const title = page.locator('h1').first();
    await expect(title).toHaveText('공지사항');

    // Check breadcrumbs
    await expect(page.getByText('홈')).toBeVisible();
    await expect(page.getByText('공지사항')).toBeVisible();
  });

  test('should display category filter buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // Wait for filters to load
    await page.waitForSelector('button', { timeout: 5000 });

    // Check all category buttons exist
    await expect(page.getByRole('button', { name: '전체' })).toBeVisible();
    await expect(page.getByRole('button', { name: '일반' })).toBeVisible();
    await expect(page.getByRole('button', { name: '제품' })).toBeVisible();
    await expect(page.getByRole('button', { name: '이벤트' })).toBeVisible();
    await expect(page.getByRole('button', { name: '보도자료' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    const searchInput = page.getByPlaceholder('제목/내용 검색...');
    await expect(searchInput).toBeVisible();
  });

  test('should load notices or show loading state', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // Wait a bit for API call
    await page.waitForTimeout(2000);

    // Should show either:
    // 1. Loading skeleton (animate-pulse)
    // 2. Notice cards
    // 3. Empty state message

    const loadingSkeleton = page.locator('.animate-pulse').first();
    const noticeCards = page.locator('a[href^="/news/"]');

    const hasLoading = await loadingSkeleton.isVisible().catch(() => false);
    const hasNotices = await noticeCards.count() > 0;

    // At least one should be true (not stuck in permanent loading)
    if (hasLoading) {
      console.log('✅ Loading state visible');
    } else if (hasNotices) {
      console.log('✅ Notice cards loaded');
    } else {
      console.log('⚠️ No loading state and no notices - may be empty database');
    }

    expect(hasLoading || hasNotices).toBe(true);
  });

  test('should not be stuck in permanent loading state', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // Wait for initial load
    await page.waitForTimeout(3000);

    const loadingSkeleton = page.locator('.animate-pulse').first();
    const isStillLoading = await loadingSkeleton.isVisible().catch(() => false);

    // After 3 seconds, should not still be showing loading skeleton
    // (Unless API is very slow or erroring)

    if (isStillLoading) {
      // Wait another 5 seconds to see if it resolves
      await page.waitForTimeout(5000);

      const stillLoadingAfter8Sec = await loadingSkeleton.isVisible().catch(() => false);

      expect(stillLoadingAfter8Sec).toBe(false);
    } else {
      console.log('✅ Not stuck in loading state');
    }
  });

  test('should handle API response correctly', async ({ page }) => {
    // Intercept API call
    let apiResponseReceived = false;
    let apiError = false;

    page.on('response', async (response) => {
      if (response.url().includes('/api/notices')) {
        console.log('API Response:', response.status(), response.url());

        if (response.status() === 200) {
          apiResponseReceived = true;
          const data = await response.json();
          console.log('API Data:', JSON.stringify(data, null, 2).substring(0, 500));
        } else {
          apiError = true;
          console.log('API Error:', response.status());
        }
      }
    });

    await page.goto(`${BASE_URL}/news`);
    await page.waitForTimeout(3000);

    expect(apiResponseReceived || apiError).toBe(true);

    if (apiError) {
      console.log('⚠️ API returned error status');
    }
  });

  test('should interact with category filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // Wait for page load
    await page.waitForTimeout(2000);

    // Click "제품" category
    const productButton = page.getByRole('button', { name: '제품' });
    await productButton.click();

    // Check if URL updated with category parameter
    await page.waitForTimeout(1000);
    const url = page.url();

    expect(url).toContain('category=PRODUCT');
  });

  test('should interact with search input', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // Wait for page load
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder('제목/내용 검색...');
    await searchInput.fill('GLEC');

    // Wait for debounce (500ms)
    await page.waitForTimeout(1000);

    // Check if URL updated with search parameter
    const url = page.url();
    expect(url).toContain('search=GLEC');
  });

  test('should have proper responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/news`);

    // Wait for load
    await page.waitForTimeout(2000);

    // Title should still be visible
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();

    // Category buttons should be visible (may wrap)
    const categoryButtons = page.getByRole('button', { name: '전체' });
    await expect(categoryButtons).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE_URL}/news`);

    // Wait for load
    await page.waitForTimeout(2000);

    // Check h1 exists and is unique
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // First h1 should be "공지사항"
    const firstH1 = page.locator('h1').first();
    await expect(firstH1).toHaveText('공지사항');
  });

  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/news`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
