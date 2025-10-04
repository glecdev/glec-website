/**
 * Test Helper Utilities
 *
 * Purpose: Reusable functions for E2E tests
 */

import { Page } from '@playwright/test';

/**
 * Close all popups on the page
 * - Modal popups (×  button)
 * - Banner popups
 * - Corner popups
 */
export async function closeAllPopups(page: Page) {
  try {
    // Set init script to disable popups on all future page loads
    await page.addInitScript(() => {
      localStorage.setItem('disable_popups_for_tests', 'true');
    });

    // Close modal popups (click × button or backdrop)
    const closeButtons = page.locator('button').filter({ hasText: '×' });
    const count = await closeButtons.count();

    for (let i = 0; i < count; i++) {
      try {
        await closeButtons.nth(i).click({ timeout: 1000 });
        await page.waitForTimeout(300);
      } catch {
        // Ignore if button not clickable
      }
    }

    // Close any remaining modal backdrops
    const backdrops = page.locator('.fixed.inset-0.bg-black\\/50');
    const backdropCount = await backdrops.count();

    for (let i = 0; i < backdropCount; i++) {
      try {
        await backdrops.nth(i).click({ timeout: 1000, force: true });
        await page.waitForTimeout(300);
      } catch {
        // Ignore
      }
    }

    // Aggressively remove ALL popup-related elements from DOM
    await page.evaluate(() => {
      // Remove all fixed positioned elements with high z-index (likely popups)
      const allFixed = document.querySelectorAll('.fixed, [class*="fixed"]');
      allFixed.forEach((el) => {
        const zIndex = window.getComputedStyle(el).zIndex;
        const zNum = parseInt(zIndex);
        // Remove if z-index > 10 (likely a popup/modal), but preserve header (z-50)
        // Also remove popups at z-60
        if (!isNaN(zNum) && ((zNum > 10 && zNum < 45) || (zNum >= 60 && zNum < 100))) {
          el.remove();
        }
      });

      // Remove common popup patterns
      const selectors = [
        '.fixed.inset-0',
        '.fixed.left-0.right-0',
        '.fixed.top-0.right-0',
        '.fixed.bottom-0.right-0',
        '[role="dialog"]',
        '[role="alertdialog"]',
        '.modal',
        '.popup'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          // Don't remove if it's the header
          if (!el.classList.contains('sticky')) {
            el.remove();
          }
        });
      });

      // Clear all localStorage related to popups
      try {
        localStorage.removeItem('closed_popups');
        localStorage.removeItem('popup_shown');
        // Set a flag to disable popups entirely for tests
        localStorage.setItem('disable_popups_for_tests', 'true');
      } catch (e) {
        // localStorage might not be available
      }

      // Find and unmount PopupManager React component if it exists
      const popupManagerRoot = document.querySelector('[data-popup-manager]');
      if (popupManagerRoot) {
        popupManagerRoot.remove();
      }
    });

    await page.waitForTimeout(500);
  } catch (error) {
    console.warn('[Test Utils] Error closing popups:', error);
  }
}

/**
 * Admin login helper
 */
export async function adminLogin(page: Page, baseUrl: string) {
  // Set popup disable flag BEFORE page load
  await page.addInitScript(() => {
    localStorage.setItem('disable_popups_for_tests', 'true');
  });

  await page.goto(`${baseUrl}/admin/login`);
  await closeAllPopups(page);

  await page.fill('input[type="email"]', 'admin@glec.io');
  await page.fill('input[type="password"]', 'admin123!');

  // Close any popups before clicking submit
  await closeAllPopups(page);

  await page.click('button[type="submit"]');

  // Wait for navigation with longer timeout
  try {
    await page.waitForURL(/\/admin\/(dashboard|notices|press)/, { timeout: 15000 });
  } catch {
    // If redirect fails, check if we're already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('/admin/login')) {
      console.log('[Admin Login] Already logged in:', currentUrl);
    } else {
      throw new Error('Login failed - still on login page');
    }
  }

  await closeAllPopups(page);
}

/**
 * Wait for page to be stable (no pending requests)
 */
export async function waitForPageStable(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Fallback to domcontentloaded
    await page.waitForLoadState('domcontentloaded', { timeout });
  }
}

/**
 * Clear all localStorage
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Get console errors from page
 */
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Check if element is clickable (not covered by popup)
 */
export async function isElementClickable(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector).first();
    await element.waitFor({ state: 'visible', timeout: 3000 });

    const box = await element.boundingBox();
    if (!box) return false;

    // Check if element is covered by popup
    const isCovered = await page.evaluate((coords) => {
      const el = document.elementFromPoint(coords.x + coords.width / 2, coords.y + coords.height / 2);
      return el?.closest('.fixed.inset-0') !== null;
    }, box);

    return !isCovered;
  } catch {
    return false;
  }
}
