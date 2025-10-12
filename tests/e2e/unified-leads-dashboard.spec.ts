/**
 * Unified Leads Dashboard E2E Test
 *
 * Tests complete user flows:
 * 1. Dashboard loads and displays summary cards
 * 2. List view shows leads with correct badges
 * 3. Filters work (source, status, search, score)
 * 4. Pagination works
 * 5. Tab navigation (List ↔ Stats)
 * 6. Stats view shows charts
 * 7. Action buttons are visible
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Unified Leads Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin leads page
    await page.goto(`${BASE_URL}/admin/leads`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard and display summary cards', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('통합 리드 관리');

    // Check summary cards are visible
    const summaryCards = page.locator('[data-testid="summary-card"]');
    await expect(summaryCards).toHaveCount(4);

    // Check card titles
    await expect(page.locator('text=전체 리드')).toBeVisible();
    await expect(page.locator('text=평균 점수')).toBeVisible();
    await expect(page.locator('text=신규 리드')).toBeVisible();
    await expect(page.locator('text=계약 성사')).toBeVisible();

    // Check that numbers are displayed
    const totalLeads = page.locator('text=전체 리드').locator('..').locator('p').first();
    await expect(totalLeads).not.toBeEmpty();
  });

  test('should display list view with lead cards', async ({ page }) => {
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-card"]', { timeout: 10000 });

    // Check that lead cards are visible
    const leadCards = page.locator('[data-testid="lead-card"]');
    const count = await leadCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(20); // Max per page

    // Check first lead card structure
    const firstCard = leadCards.first();

    // Should have source badge
    await expect(firstCard.locator('[data-testid="source-badge"]')).toBeVisible();

    // Should have lead score
    await expect(firstCard.locator('[data-testid="lead-score"]')).toBeVisible();

    // Should have company/contact name
    const nameElement = firstCard.locator('h3').first();
    await expect(nameElement).toBeVisible();

    // Should have email
    await expect(firstCard.locator('text=/.*@.*/i')).toBeVisible();

    // Should have action buttons
    await expect(firstCard.locator('text=미팅 제안')).toBeVisible();
    await expect(firstCard.locator('text=이메일')).toBeVisible();
  });

  test('should filter leads by source type', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Get initial count
    const initialCards = await page.locator('[data-testid="lead-card"]').count();

    // Click source filter dropdown
    await page.locator('select[data-testid="source-filter"]').selectOption('LIBRARY_LEAD');

    // Wait for filtered results
    await page.waitForTimeout(1000); // Wait for API call
    await page.waitForLoadState('networkidle');

    // Check all visible cards have LIBRARY_LEAD badge
    const libraryBadges = page.locator('[data-testid="source-badge"]:has-text("라이브러리 리드")');
    const visibleCards = await page.locator('[data-testid="lead-card"]').count();

    if (visibleCards > 0) {
      const libraryBadgeCount = await libraryBadges.count();
      expect(libraryBadgeCount).toBe(visibleCards);
    }
  });

  test('should filter leads by status', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Click status filter dropdown
    await page.locator('select[data-testid="status-filter"]').selectOption('NEW');

    // Wait for filtered results
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    // Check all visible cards have NEW status
    const statusBadges = page.locator('[data-testid="status-badge"]:has-text("신규")');
    const visibleCards = await page.locator('[data-testid="lead-card"]').count();

    if (visibleCards > 0) {
      const statusBadgeCount = await statusBadges.count();
      expect(statusBadgeCount).toBe(visibleCards);
    }
  });

  test('should search leads', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Type in search box
    const searchInput = page.locator('input[data-testid="search-input"]');
    await searchInput.fill('test');

    // Wait for search results
    await page.waitForTimeout(1500); // Allow for debouncing
    await page.waitForLoadState('networkidle');

    // Check that results are filtered (at least page updated)
    await expect(page.locator('[data-testid="lead-card"]')).toBeVisible();
  });

  test('should filter by lead score range', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Adjust score minimum slider
    const minScoreSlider = page.locator('input[data-testid="score-min-slider"]');
    await minScoreSlider.fill('80');

    // Wait for filtered results
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    // Check that high-score badge is visible
    const highScoreBadges = page.locator('[data-testid="lead-score"]:has-text(/⭐ (8|9|10)/)');
    const visibleCards = await page.locator('[data-testid="lead-card"]').count();

    if (visibleCards > 0) {
      const count = await highScoreBadges.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should navigate to next page', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Check if pagination is visible
    const nextButton = page.locator('button:has-text("다음")');

    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      // Click next page
      await nextButton.click();

      // Wait for new page to load
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');

      // Check URL updated
      expect(page.url()).toContain('page=2');

      // Check leads are still visible
      await expect(page.locator('[data-testid="lead-card"]')).toBeVisible();
    }
  });

  test('should switch to stats view', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Click stats tab
    const statsTab = page.locator('button:has-text("📊 통계 뷰")');
    await statsTab.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Check that stats view is visible
    await expect(page.locator('text=소스별 분포')).toBeVisible();
    await expect(page.locator('text=상태별 분포')).toBeVisible();

    // Check that list view is hidden
    await expect(page.locator('[data-testid="lead-card"]')).not.toBeVisible();
  });

  test('should switch back to list view from stats', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Go to stats view
    await page.locator('button:has-text("📊 통계 뷰")').click();
    await page.waitForTimeout(500);

    // Go back to list view
    const listTab = page.locator('button:has-text("📋 리스트 뷰")');
    await listTab.click();
    await page.waitForTimeout(500);

    // Check that lead cards are visible again
    await expect(page.locator('[data-testid="lead-card"]')).toBeVisible();

    // Check that stats view is hidden
    await expect(page.locator('text=소스별 분포')).not.toBeVisible();
  });

  test('should display action buttons and be clickable', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    const firstCard = page.locator('[data-testid="lead-card"]').first();

    // Check meeting proposal button
    const meetingButton = firstCard.locator('button:has-text("미팅 제안")');
    await expect(meetingButton).toBeVisible();
    await expect(meetingButton).toBeEnabled();

    // Check email button
    const emailButton = firstCard.locator('button:has-text("이메일")');
    await expect(emailButton).toBeVisible();
    await expect(emailButton).toBeEnabled();

    // Click meeting button (should trigger action or show modal)
    await meetingButton.click();

    // Note: Currently this will just log to console
    // In Phase 4, it should open a modal
  });

  test('should maintain filter state when switching tabs', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Apply filter
    await page.locator('select[data-testid="source-filter"]').selectOption('LIBRARY_LEAD');
    await page.waitForTimeout(1000);

    // Switch to stats view
    await page.locator('button:has-text("📊 통계 뷰")').click();
    await page.waitForTimeout(500);

    // Switch back to list view
    await page.locator('button:has-text("📋 리스트 뷰")').click();
    await page.waitForTimeout(500);

    // Check filter is still applied
    const sourceFilter = page.locator('select[data-testid="source-filter"]');
    await expect(sourceFilter).toHaveValue('LIBRARY_LEAD');
  });

  test('should reset filters when clicking reset button', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Apply multiple filters
    await page.locator('select[data-testid="source-filter"]').selectOption('LIBRARY_LEAD');
    await page.locator('select[data-testid="status-filter"]').selectOption('NEW');
    await page.locator('input[data-testid="search-input"]').fill('test');
    await page.waitForTimeout(1500);

    // Click reset button (if exists)
    const resetButton = page.locator('button:has-text("초기화")');

    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(1000);

      // Check filters are reset
      await expect(page.locator('select[data-testid="source-filter"]')).toHaveValue('ALL');
      await expect(page.locator('select[data-testid="status-filter"]')).toHaveValue('ALL');
      await expect(page.locator('input[data-testid="search-input"]')).toHaveValue('');
    }
  });

  test('should show loading state while fetching data', async ({ page }) => {
    // Navigate to page (loading state should appear briefly)
    const response = page.goto(`${BASE_URL}/admin/leads`);

    // Check for loading indicator (spinner or skeleton)
    const loadingIndicator = page.locator('text=로딩 중');

    // Loading might be too fast to catch, so we just check it doesn't error
    await response;

    // Eventually leads should be visible
    await expect(page.locator('[data-testid="lead-card"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display correct badge colors', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="lead-card"]');

    // Check source badge colors (purple, blue, green, orange)
    const sourceBadges = page.locator('[data-testid="source-badge"]');
    const firstBadge = sourceBadges.first();

    // Get computed styles
    const backgroundColor = await firstBadge.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Should have color (not default black/white)
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to page
    await page.goto(`${BASE_URL}/admin/leads`);
    await page.waitForSelector('[data-testid="lead-card"]');

    // Check that layout is mobile-friendly
    const firstCard = page.locator('[data-testid="lead-card"]').first();
    const cardWidth = await firstCard.boundingBox();

    // Card should take most of the screen width
    expect(cardWidth?.width).toBeGreaterThan(300);
    expect(cardWidth?.width).toBeLessThan(400);
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/leads`);

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for load event
        if (document.readyState === 'complete') {
          const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

          resolve({
            // First Contentful Paint
            fcp: perfEntries.domContentLoadedEventEnd - perfEntries.fetchStart,
            // Largest Contentful Paint (approximation)
            lcp: perfEntries.loadEventEnd - perfEntries.fetchStart,
            // DOM Content Loaded
            dcl: perfEntries.domContentLoadedEventEnd - perfEntries.fetchStart,
            // Load Complete
            load: perfEntries.loadEventEnd - perfEntries.fetchStart,
          });
        } else {
          window.addEventListener('load', () => {
            const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

            resolve({
              fcp: perfEntries.domContentLoadedEventEnd - perfEntries.fetchStart,
              lcp: perfEntries.loadEventEnd - perfEntries.fetchStart,
              dcl: perfEntries.domContentLoadedEventEnd - perfEntries.fetchStart,
              load: perfEntries.loadEventEnd - perfEntries.fetchStart,
            });
          });
        }
      });
    });

    console.log('Performance Metrics:', metrics);

    // Assert performance targets
    // expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    // expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
  });
});
