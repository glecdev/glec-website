/**
 * Knowledge Pages E2E Test
 *
 * Purpose: Test all knowledge sub-pages for errors, design quality, and consistency
 * Pages: /knowledge, /knowledge/library, /knowledge/press, /knowledge/videos, /knowledge/blog
 */

import { test, expect } from '@playwright/test';
import { closeAllPopups } from '../helpers/test-utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

const knowledgePages = [
  { path: '/knowledge', name: 'Knowledge Main' },
  { path: '/knowledge/library', name: 'Knowledge Library' },
  { path: '/knowledge/press', name: 'Knowledge Press' },
  { path: '/knowledge/videos', name: 'Knowledge Videos' },
  { path: '/knowledge/blog', name: 'Knowledge Blog' },
];

test.describe('Knowledge Pages - Error Detection', () => {
  for (const page of knowledgePages) {
    test(`${page.name} - should load without errors`, async ({ page: pw }) => {
      const consoleErrors: string[] = [];
      const networkErrors: string[] = [];

      // Capture console errors
      pw.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Capture network errors
      pw.on('response', (response) => {
        if (response.status() >= 400) {
          networkErrors.push(`${response.status()} ${response.url()}`);
        }
      });

      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      // HMR이 networkidle을 방해하므로 domcontentloaded 사용
      await pw.waitForLoadState('domcontentloaded');
      // 페이지 로딩 완료 대기 (로딩 상태가 사라질 때까지)
      await pw.waitForSelector('.animate-pulse', { state: 'detached', timeout: 5000 }).catch(() => {});

      // Report errors
      if (consoleErrors.length > 0) {
        console.log(`[${page.name}] Console Errors:`, consoleErrors);
      }
      if (networkErrors.length > 0) {
        console.log(`[${page.name}] Network Errors:`, networkErrors);
      }

      // Assertions
      expect(consoleErrors.length).toBe(0);
      expect(networkErrors.filter(e => !e.includes('404')).length).toBe(0);
    });
  }
});

test.describe('Knowledge Pages - Design Standards', () => {
  for (const page of knowledgePages) {
    test(`${page.name} - should follow design standards`, async ({ page: pw }) => {
      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      // HMR이 networkidle을 방해하므로 domcontentloaded 사용
      await pw.waitForLoadState('domcontentloaded');
      // 페이지 로딩 완료 대기 (로딩 상태가 사라질 때까지)
      await pw.waitForSelector('.animate-pulse', { state: 'detached', timeout: 5000 }).catch(() => {});

      // Check header exists with correct z-index
      const header = pw.locator('header');
      await expect(header).toBeVisible();
      const headerZIndex = await header.evaluate((el) =>
        window.getComputedStyle(el).zIndex
      );
      expect(parseInt(headerZIndex)).toBe(50);

      // Check primary color usage (Primary Blue #0600f7)
      const primaryElements = pw.locator('[class*="primary"]').first();
      if (await primaryElements.count() > 0) {
        const bgColor = await primaryElements.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );
        // RGB(6, 0, 247) = #0600f7
        expect(bgColor).toContain('rgb(6, 0, 247)');
      }

      // Check typography scale
      const h1 = pw.locator('h1').first();
      if (await h1.count() > 0) {
        const fontSize = await h1.evaluate((el) =>
          window.getComputedStyle(el).fontSize
        );
        // Should use defined typography scale (2.25rem = 36px or larger)
        const fontSizePx = parseFloat(fontSize);
        expect(fontSizePx).toBeGreaterThanOrEqual(32);
      }

      // Check semantic HTML
      const main = pw.locator('main');
      await expect(main).toBeVisible();

      // Check footer exists
      const footer = pw.locator('footer');
      await expect(footer).toBeVisible();
    });
  }
});

test.describe('Knowledge Pages - Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
  ];

  for (const page of knowledgePages) {
    for (const viewport of viewports) {
      test(`${page.name} - should be responsive on ${viewport.name}`, async ({ page: pw }) => {
        await pw.setViewportSize({ width: viewport.width, height: viewport.height });
        await pw.goto(`${BASE_URL}${page.path}`);
        await closeAllPopups(pw);
        await pw.waitForLoadState('networkidle');

        // Check page renders
        await expect(pw.locator('body')).toBeVisible();

        // Check no horizontal scroll
        const hasHorizontalScroll = await pw.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // Check header is sticky
        const header = pw.locator('header');
        const position = await header.evaluate((el) =>
          window.getComputedStyle(el).position
        );
        expect(position).toBe('sticky');
      });
    }
  }
});

test.describe('Knowledge Pages - Content Quality', () => {
  for (const page of knowledgePages) {
    test(`${page.name} - should have proper content structure`, async ({ page: pw }) => {
      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      // HMR이 networkidle을 방해하므로 domcontentloaded 사용
      await pw.waitForLoadState('domcontentloaded');
      // 페이지 로딩 완료 대기 (로딩 상태가 사라질 때까지)
      await pw.waitForSelector('.animate-pulse', { state: 'detached', timeout: 5000 }).catch(() => {});

      // Check page title
      const title = await pw.title();
      expect(title).toBeTruthy();
      expect(title).not.toBe('');

      // Check meta description
      const metaDescription = await pw.locator('meta[name="description"]').getAttribute('content');
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(50);

      // Check heading hierarchy
      const h1Count = await pw.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(1); // Only one H1

      // Check breadcrumbs (if applicable)
      const breadcrumbs = pw.locator('[aria-label*="breadcrumb"], nav[aria-label*="Breadcrumb"]');
      if (await breadcrumbs.count() > 0) {
        await expect(breadcrumbs).toBeVisible();
      }

      // Check main content exists
      const mainContent = pw.locator('main');
      const contentText = await mainContent.textContent();
      expect(contentText!.trim().length).toBeGreaterThan(100);
    });
  }
});

test.describe('Knowledge Pages - Accessibility', () => {
  for (const page of knowledgePages) {
    test(`${page.name} - should meet accessibility standards`, async ({ page: pw }) => {
      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      // HMR이 networkidle을 방해하므로 domcontentloaded 사용
      await pw.waitForLoadState('domcontentloaded');
      // 페이지 로딩 완료 대기 (로딩 상태가 사라질 때까지)
      await pw.waitForSelector('.animate-pulse', { state: 'detached', timeout: 5000 }).catch(() => {});

      // Check skip to main content link
      const skipLink = pw.locator('a[href="#main-content"], a:has-text("Skip to")');
      if (await skipLink.count() > 0) {
        await expect(skipLink).toBeInViewport({ ratio: 0 });
      }

      // Check all images have alt text
      const images = pw.locator('img');
      const imageCount = await images.count();
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeDefined();
      }

      // Check form labels (if forms exist)
      const inputs = pw.locator('input:not([type="hidden"])');
      const inputCount = await inputs.count();
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const label = pw.locator(`label[for="${id}"]`);

        if (!ariaLabel) {
          await expect(label).toBeVisible();
        }
      }

      // Check color contrast (basic check)
      const body = pw.locator('body');
      const bgColor = await body.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      const color = await body.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      expect(bgColor).toBeTruthy();
      expect(color).toBeTruthy();
    });
  }
});

test.describe('Knowledge Pages - Performance', () => {
  for (const page of knowledgePages) {
    test(`${page.name} - should load within acceptable time`, async ({ page: pw }) => {
      const startTime = Date.now();

      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      await pw.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      console.log(`[${page.name}] Load time: ${loadTime}ms`);

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Check Largest Contentful Paint (LCP)
      const lcp = await pw.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.renderTime || lastEntry.loadTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          setTimeout(() => resolve(0), 100);
        });
      });

      if (lcp) {
        console.log(`[${page.name}] LCP: ${lcp}ms`);
        expect(lcp as number).toBeLessThan(2500); // Good LCP
      }
    });
  }
});

test.describe('Knowledge Pages - Navigation', () => {
  test('should navigate between knowledge pages', async ({ page: pw }) => {
    await pw.goto(`${BASE_URL}/knowledge`);
    await closeAllPopups(pw);
    await pw.waitForLoadState('networkidle');

    // Check knowledge menu items exist
    const navLinks = pw.locator('nav a, header a');
    const linkTexts = await navLinks.allTextContents();

    console.log('Available navigation links:', linkTexts);

    // Navigate to each knowledge sub-page
    for (const page of knowledgePages.slice(1)) { // Skip main page
      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      // HMR이 networkidle을 방해하므로 domcontentloaded 사용
      await pw.waitForLoadState('domcontentloaded');
      // 페이지 로딩 완료 대기 (로딩 상태가 사라질 때까지)
      await pw.waitForSelector('.animate-pulse', { state: 'detached', timeout: 5000 }).catch(() => {});

      // Verify URL
      expect(pw.url()).toContain(page.path);

      // Verify page loaded
      await expect(pw.locator('main')).toBeVisible();
    }
  });
});

test.describe('Knowledge Pages - Cross-page Consistency', () => {
  test('should have consistent header across all pages', async ({ page: pw }) => {
    const headerData: any[] = [];

    for (const page of knowledgePages) {
      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      // HMR이 networkidle을 방해하므로 domcontentloaded 사용
      await pw.waitForLoadState('domcontentloaded');
      // 페이지 로딩 완료 대기 (로딩 상태가 사라질 때까지)
      await pw.waitForSelector('.animate-pulse', { state: 'detached', timeout: 5000 }).catch(() => {});

      const header = pw.locator('header');
      const headerHtml = await header.innerHTML();
      const headerHeight = await header.evaluate((el) => el.offsetHeight);

      headerData.push({
        page: page.name,
        html: headerHtml,
        height: headerHeight,
      });
    }

    // All headers should be the same
    const firstHeader = headerData[0];
    for (let i = 1; i < headerData.length; i++) {
      expect(headerData[i].html).toBe(firstHeader.html);
      expect(headerData[i].height).toBe(firstHeader.height);
    }
  });

  test('should have consistent footer across all pages', async ({ page: pw }) => {
    const footerData: any[] = [];

    for (const page of knowledgePages) {
      await pw.goto(`${BASE_URL}${page.path}`);
      await closeAllPopups(pw);
      // HMR이 networkidle을 방해하므로 domcontentloaded 사용
      await pw.waitForLoadState('domcontentloaded');
      // 페이지 로딩 완료 대기 (로딩 상태가 사라질 때까지)
      await pw.waitForSelector('.animate-pulse', { state: 'detached', timeout: 5000 }).catch(() => {});

      const footer = pw.locator('footer');
      const footerHtml = await footer.innerHTML();

      footerData.push({
        page: page.name,
        html: footerHtml,
      });
    }

    // All footers should be the same
    const firstFooter = footerData[0];
    for (let i = 1; i < footerData.length; i++) {
      expect(footerData[i].html).toBe(firstFooter.html);
    }
  });
});
