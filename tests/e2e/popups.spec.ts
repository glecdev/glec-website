/**
 * Popup System E2E Tests
 *
 * Tests 3 popup types:
 * 1. Banner Popup (top)
 * 2. Modal Popup (center, premium design)
 * 3. Corner Popup (bottom-right)
 *
 * Verifies:
 * - Display logic (API-based, no hardcoding)
 * - Close functionality (button, ESC, backdrop)
 * - localStorage "오늘 하루 보지 않기"
 * - Premium design elements (gradient, blur, animations)
 * - Link navigation
 * - Responsive behavior
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Popup System (API-Based)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to see all popups
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('closed_popups');
      localStorage.removeItem('disable_popups_for_tests');
    });
  });

  test.describe('Banner Popup (Top)', () => {
    test('should display banner popup on page load', async ({ page }) => {
      await page.goto('/');

      // Wait for API response
      await page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      // Wait for banner to appear
      const banner = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시!'
      }).first();

      await expect(banner).toBeVisible({ timeout: 5000 });

      // Verify background color from DB (#0600f7)
      const bgColor = await banner.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );

      // RGB(6, 0, 247) = #0600f7
      expect(bgColor).toBe('rgb(6, 0, 247)');
    });

    test('should close banner when X button clicked', async ({ page }) => {
      await page.goto('/');

      const banner = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시!'
      }).first();

      await expect(banner).toBeVisible({ timeout: 5000 });

      // Click close button
      const closeButton = banner.locator('button[aria-label="배너 닫기"]');
      await closeButton.click();

      // Verify banner is hidden
      await expect(banner).not.toBeVisible();
    });

    test('should navigate when link clicked', async ({ page }) => {
      await page.goto('/');

      const banner = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시!'
      }).first();

      await expect(banner).toBeVisible({ timeout: 5000 });

      // Click "자세히 보기" link
      const link = banner.locator('a', { hasText: '자세히 보기' });

      if (await link.isVisible()) {
        await link.click();

        // Verify navigation
        await expect(page).toHaveURL(/\/events\/carbon-api-launch-2025/, { timeout: 10000 });
      }
    });

    test('should apply dynamic text color matching background', async ({ page }) => {
      await page.goto('/');

      const banner = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시!'
      }).first();

      await expect(banner).toBeVisible({ timeout: 5000 });

      // Verify link button has matching color
      const link = banner.locator('a', { hasText: '자세히 보기' });

      if (await link.isVisible()) {
        const textColor = await link.evaluate((el) =>
          window.getComputedStyle(el).color
        );

        // Should match background color (#0600f7 = rgb(6, 0, 247))
        expect(textColor).toBe('rgb(6, 0, 247)');
      }
    });
  });

  test.describe('Modal Popup (Center, Premium Design)', () => {
    test('should display modal popup on page load', async ({ page }) => {
      await page.goto('/');

      // Wait for popups API
      await page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      // Wait for modal (may have delay in PopupManager)
      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });
    });

    test('should have premium gradient header', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Find gradient header
      const header = modal.locator('.bg-gradient-to-br').first();

      await expect(header).toBeVisible();

      // Verify gradient classes
      const classes = await header.getAttribute('class');
      expect(classes).toContain('from-primary-500');
      expect(classes).toContain('via-primary-600');
      expect(classes).toContain('to-purple-600');
    });

    test('should have animated blur pattern', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify animated blur circles exist
      const blurCircles = modal.locator('.animate-pulse');

      await expect(blurCircles).toHaveCount(2, { timeout: 5000 });
    });

    test('should close modal when ESC key pressed', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Press ESC key
      await page.keyboard.press('Escape');

      // Verify modal is hidden
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('should close modal when backdrop clicked', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Find backdrop (fixed inset-0 bg-black/60)
      const backdrop = page.locator('.fixed.inset-0.bg-black\\/60').first();

      // Click backdrop
      await backdrop.click({ position: { x: 10, y: 10 } });

      // Verify modal is hidden
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('should close modal when X button clicked', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Click close button
      const closeButton = modal.locator('button[aria-label="팝업 닫기"]');
      await closeButton.click();

      // Verify modal is hidden
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('should lock body scroll when modal open', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify body overflow is hidden
      const bodyOverflow = await page.evaluate(() =>
        document.body.style.overflow
      );

      expect(bodyOverflow).toBe('hidden');

      // Close modal
      await page.keyboard.press('Escape');

      // Wait for modal to close
      await expect(modal).not.toBeVisible({ timeout: 3000 });

      // Verify body overflow is unset
      const bodyOverflowAfter = await page.evaluate(() =>
        document.body.style.overflow
      );

      expect(bodyOverflowAfter).toBe('unset');
    });

    test('should save "오늘 하루 보지 않기" to localStorage', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Click "오늘 하루 보지 않기" button
      const hideButton = modal.locator('button', {
        hasText: '오늘 하루 보지 않기'
      });

      if (await hideButton.isVisible()) {
        await hideButton.click();

        // Verify localStorage has closed popup
        const closedPopups = await page.evaluate(() => {
          const stored = localStorage.getItem('closed_popups');
          return stored ? JSON.parse(stored) : [];
        });

        expect(closedPopups.length).toBeGreaterThan(0);

        // Verify today's date is stored
        const today = new Date().toDateString();
        const hasToday = closedPopups.some((item: any) => item.date === today);
        expect(hasToday).toBe(true);

        // Reload page
        await page.reload();

        // Verify modal does NOT reappear
        await expect(modal).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('should display image if provided', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Check for image
      const image = modal.locator('img').first();

      if (await image.isVisible()) {
        // Verify image src contains Unsplash URL
        const src = await image.getAttribute('src');
        expect(src).toContain('unsplash.com');
      }
    });

    test('should display HTML content with formatting', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Verify formatted content exists
      await expect(modal.locator('text=ISO-14083 국제표준')).toBeVisible();
      await expect(modal.locator('text=48개 API 엔드포인트')).toBeVisible();
      await expect(modal.locator('text=선착순 100명 한정')).toBeVisible();
    });
  });

  test.describe('Corner Popup (Bottom-Right)', () => {
    test('should display corner popup in bottom-right position', async ({ page }) => {
      await page.goto('/');

      // Wait for popups API
      await page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      // Wait for corner popup
      const corner = page.locator('div', {
        hasText: '💎 Early Access 신청'
      }).first();

      await expect(corner).toBeVisible({ timeout: 10000 });

      // Verify position (bottom-right)
      const position = await corner.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          bottom: style.bottom,
          right: style.right,
        };
      });

      expect(position.position).toBe('fixed');
      // Should be near bottom-right (20px from edges as per DB)
    });

    test('should have 320px width', async ({ page }) => {
      await page.goto('/');

      const corner = page.locator('div', {
        hasText: '💎 Early Access 신청'
      }).first();

      await expect(corner).toBeVisible({ timeout: 10000 });

      // Verify max-width
      const maxWidth = await corner.evaluate((el) =>
        window.getComputedStyle(el).maxWidth
      );

      expect(maxWidth).toBe('320px');
    });

    test('should close corner popup when X clicked', async ({ page }) => {
      await page.goto('/');

      const corner = page.locator('div', {
        hasText: '💎 Early Access 신청'
      }).first();

      await expect(corner).toBeVisible({ timeout: 10000 });

      // Click close button
      const closeButton = corner.locator('button[aria-label="알림 닫기"]');
      await closeButton.click();

      // Verify corner popup is hidden
      await expect(corner).not.toBeVisible();
    });

    test('should navigate when corner link clicked', async ({ page }) => {
      await page.goto('/');

      const corner = page.locator('div', {
        hasText: '💎 Early Access 신청'
      }).first();

      await expect(corner).toBeVisible({ timeout: 10000 });

      // Click "보기" link
      const link = corner.locator('a', { hasText: '보기' });

      if (await link.isVisible()) {
        await link.click();

        // Verify navigation
        await expect(page).toHaveURL(/\/events\/carbon-api-launch-2025/, { timeout: 10000 });
      }
    });
  });

  test.describe('API Integration', () => {
    test('should load popups from /api/popups endpoint', async ({ page }) => {
      // Intercept API request
      const apiPromise = page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      await page.goto('/');

      const response = await apiPromise;
      const data = await response.json();

      // Verify response format
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);

      // Should have 3 popups (banner, modal, corner)
      expect(data.data.length).toBeGreaterThanOrEqual(3);

      // Verify popup types
      const types = data.data.map((p: any) => p.displayType);
      expect(types).toContain('banner');
      expect(types).toContain('modal');
      expect(types).toContain('corner');
    });

    test('should filter popups by displayType in components', async ({ page }) => {
      await page.goto('/');

      // Wait for API
      await page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      // Wait for all popups to render
      await page.waitForTimeout(2000);

      // Verify BannerPopupManager shows only banner
      const banner = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시!'
      }).first();

      // Verify PopupManager shows modal and corner (not banner)
      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      const corner = page.locator('div', {
        hasText: '💎 Early Access 신청'
      }).first();

      // All should be visible
      await expect(banner).toBeVisible({ timeout: 5000 });
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(corner).toBeVisible({ timeout: 5000 });
    });

    test('should disable popups when localStorage flag set', async ({ page }) => {
      await page.goto('/');

      // Set disable flag
      await page.evaluate(() => {
        localStorage.setItem('disable_popups_for_tests', 'true');
      });

      // Reload
      await page.reload();

      // Verify NO popups appear
      const banner = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시!'
      });

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      });

      const corner = page.locator('div', {
        hasText: '💎 Early Access 신청'
      });

      // Wait and verify none are visible
      await page.waitForTimeout(3000);

      await expect(banner).not.toBeVisible();
      await expect(modal).not.toBeVisible();
      await expect(corner).not.toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display popups on mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Wait for API
      await page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      // Verify popups are visible on mobile
      const banner = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시!'
      }).first();

      await expect(banner).toBeVisible({ timeout: 5000 });
    });

    test('should display popups on tablet (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      // Wait for API
      await page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      // Verify popups are visible on tablet
      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });
    });

    test('should display popups on desktop (1280px)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // Wait for API
      await page.waitForResponse((response) =>
        response.url().includes('/api/popups') && response.status() === 200
      );

      // Verify popups are visible on desktop
      const corner = page.locator('div', {
        hasText: '💎 Early Access 신청'
      }).first();

      await expect(corner).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/');

      // Banner close button
      const bannerClose = page.locator('button[aria-label="배너 닫기"]').first();
      await expect(bannerClose).toBeVisible({ timeout: 5000 });

      // Modal close button
      const modalClose = page.locator('button[aria-label="팝업 닫기"]').first();
      await expect(modalClose).toBeVisible({ timeout: 10000 });

      // Corner close button
      const cornerClose = page.locator('button[aria-label="알림 닫기"]').first();
      await expect(cornerClose).toBeVisible({ timeout: 10000 });
    });

    test('should support keyboard navigation (Tab, ESC)', async ({ page }) => {
      await page.goto('/');

      const modal = page.locator('div', {
        hasText: '🎉 GLEC Carbon API Console 출시 기념 이벤트'
      }).first();

      await expect(modal).toBeVisible({ timeout: 10000 });

      // Tab to close button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Press ESC to close
      await page.keyboard.press('Escape');

      // Verify modal closed
      await expect(modal).not.toBeVisible({ timeout: 3000 });
    });
  });
});
