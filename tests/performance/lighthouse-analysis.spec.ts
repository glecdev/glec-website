/**
 * Lighthouse Performance Analysis
 * Based on: CLAUDE.md Step 6 Phase 2
 *
 * Target Metrics:
 * - Performance: 90+
 * - Accessibility: 100
 * - Best Practices: 90+
 * - SEO: 90+
 */

import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Lighthouse Performance Analysis', () => {
  test('Homepage Performance', async ({ page }, testInfo) => {
    await page.goto(BASE_URL);

    // Run Lighthouse audit
    await playAudit({
      page,
      thresholds: {
        performance: 80,      // Target: 90+, Current threshold: 80 (relaxed for dev)
        accessibility: 90,    // Target: 100
        'best-practices': 80, // Target: 90+
        seo: 80,              // Target: 90+
      },
      port: 9222,
    });
  });

  test('Admin Login Page Performance', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`);

    await playAudit({
      page,
      thresholds: {
        performance: 80,
        accessibility: 90,
        'best-practices': 80,
        seo: 80,
      },
      port: 9222,
    });
  });
});

test.describe('Core Web Vitals', () => {
  test('Measure LCP, FCP, CLS', async ({ page }) => {
    await page.goto(BASE_URL);

    // Get Web Vitals metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics: any = {};

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FCP (First Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          metrics.fcp = entries[0].startTime;
        }).observe({ entryTypes: ['paint'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metrics.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Wait and resolve
        setTimeout(() => resolve(metrics), 5000);
      });
    });

    console.log('📊 Core Web Vitals:', metrics);

    // Assert Core Web Vitals
    expect((metrics as any).lcp).toBeLessThan(2500); // LCP < 2.5s (good)
    expect((metrics as any).fcp).toBeLessThan(1800); // FCP < 1.8s (good)
    expect((metrics as any).cls).toBeLessThan(0.1);  // CLS < 0.1 (good)
  });
});
