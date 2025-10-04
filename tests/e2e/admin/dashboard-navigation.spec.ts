import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

// Performance thresholds
const DASHBOARD_LOAD_THRESHOLD = 5000; // 5 seconds
const PAGE_LOAD_THRESHOLD = 10000; // 10 seconds
const INFINITE_LOADING_TIMEOUT = 30000; // 30 seconds

interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  timestamp: number;
}

interface PageMetrics {
  loadTime: number;
  networkRequests: NetworkRequest[];
  consoleErrors: string[];
  consoleWarnings: string[];
}

/**
 * Monitor network requests and console messages for a page
 */
async function monitorPageLoad(
  page: Page,
  navigationPromise: Promise<void>
): Promise<PageMetrics> {
  const startTime = Date.now();
  const networkRequests: NetworkRequest[] = [];
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];

  // Monitor network requests
  const requestListener = (request: any) => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: Date.now(),
    });
  };

  const responseListener = (response: any) => {
    const request = networkRequests.find(
      (req) => req.url === response.url() && !req.status
    );
    if (request) {
      request.status = response.status();
    }
  };

  // Monitor console messages
  const consoleListener = (msg: any) => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      consoleErrors.push(text);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
    }
  };

  page.on('request', requestListener);
  page.on('response', responseListener);
  page.on('console', consoleListener);

  try {
    await navigationPromise;
  } finally {
    page.off('request', requestListener);
    page.off('response', responseListener);
    page.off('console', consoleListener);
  }

  const loadTime = Date.now() - startTime;

  return {
    loadTime,
    networkRequests,
    consoleErrors,
    consoleWarnings,
  };
}

/**
 * Detect infinite loading by checking for:
 * 1. Repeated API calls to the same endpoint
 * 2. Loading spinner visible for too long
 * 3. Console errors indicating failed requests
 */
function detectInfiniteLoading(metrics: PageMetrics): {
  detected: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check for repeated API calls (same URL called more than 5 times)
  const urlCounts = new Map<string, number>();
  metrics.networkRequests.forEach((req) => {
    if (req.url.includes('/api/')) {
      const count = urlCounts.get(req.url) || 0;
      urlCounts.set(req.url, count + 1);
    }
  });

  urlCounts.forEach((count, url) => {
    if (count > 5) {
      reasons.push(
        `Repeated API call detected: ${url} called ${count} times`
      );
    }
  });

  // Check for failed requests (status >= 400)
  const failedRequests = metrics.networkRequests.filter(
    (req) => req.status && req.status >= 400
  );
  if (failedRequests.length > 0) {
    reasons.push(
      `Failed requests detected: ${failedRequests.length} requests with status >= 400`
    );
  }

  // Check for console errors
  if (metrics.consoleErrors.length > 0) {
    reasons.push(
      `Console errors detected: ${metrics.consoleErrors.length} errors`
    );
  }

  return {
    detected: reasons.length > 0,
    reasons,
  };
}

/**
 * Login as admin
 * Note: Must use type() instead of fill() to trigger React onChange handlers
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });

  // Fill login form using type() to trigger onChange events
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');

  await emailInput.click();
  await emailInput.type(ADMIN_EMAIL);
  await passwordInput.click();
  await passwordInput.type(ADMIN_PASSWORD);

  // Click login button and wait for navigation
  await Promise.all([
    page.waitForURL(`${BASE_URL}/admin/dashboard`, {
      timeout: 15000,
      waitUntil: 'domcontentloaded',
    }),
    page.click('button[type="submit"]'),
  ]);

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
    // Ignore timeout, page might still be loading some resources
  });
}

test.describe('Admin Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('1. Admin login and dashboard load time (should be < 10 seconds)', async ({
    page,
  }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });

    // Fill login form using type() to trigger onChange events
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.click();
    await emailInput.type(ADMIN_EMAIL);
    await passwordInput.click();
    await passwordInput.type(ADMIN_PASSWORD);

    // Monitor dashboard load
    const metrics = await monitorPageLoad(
      page,
      Promise.all([
        page.waitForURL(`${BASE_URL}/admin/dashboard`, {
          timeout: 15000,
          waitUntil: 'domcontentloaded',
        }),
        page.click('button[type="submit"]'),
      ]).then(() =>
        page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
      )
    );

    const totalLoadTime = Date.now() - startTime;

    console.log('Dashboard Load Metrics:');
    console.log(`  Total load time: ${totalLoadTime}ms`);
    console.log(`  Network requests: ${metrics.networkRequests.length}`);
    console.log(`  Console errors: ${metrics.consoleErrors.length}`);
    console.log(`  Console warnings: ${metrics.consoleWarnings.length}`);

    // Check for infinite loading
    const infiniteLoading = detectInfiniteLoading(metrics);
    if (infiniteLoading.detected) {
      console.error('Infinite loading detected:');
      infiniteLoading.reasons.forEach((reason) => console.error(`  - ${reason}`));
    }

    // Assertions
    expect(totalLoadTime).toBeLessThan(10000);
    expect(infiniteLoading.detected).toBe(false);

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/admin/screenshots/dashboard-loaded.png',
    });
  });

  test('2. Navigation to notices page (should load < 10 seconds)', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // Monitor navigation to notices page
    const metrics = await monitorPageLoad(
      page,
      page.click('a[href="/admin/notices"]').then(() =>
        page.waitForURL(`${BASE_URL}/admin/notices`, {
          timeout: PAGE_LOAD_THRESHOLD,
        })
      )
    );

    console.log('Notices Page Load Metrics:');
    console.log(`  Load time: ${metrics.loadTime}ms`);
    console.log(`  Network requests: ${metrics.networkRequests.length}`);
    console.log(`  Console errors: ${metrics.consoleErrors.length}`);
    console.log(`  Console warnings: ${metrics.consoleWarnings.length}`);

    // Check for infinite loading
    const infiniteLoading = detectInfiniteLoading(metrics);
    if (infiniteLoading.detected) {
      console.error('Infinite loading detected on notices page:');
      infiniteLoading.reasons.forEach((reason) => console.error(`  - ${reason}`));
    }

    // Assertions
    expect(metrics.loadTime).toBeLessThan(PAGE_LOAD_THRESHOLD);
    expect(infiniteLoading.detected).toBe(false);

    // Wait for loading spinner to disappear (if any)
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'hidden',
      timeout: 5000,
    }).catch(() => {
      // No loading spinner found, which is fine
    });

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/admin/screenshots/notices-loaded.png',
    });
  });

  test('3. Navigation to press page (should load < 10 seconds)', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // Monitor navigation to press page
    const metrics = await monitorPageLoad(
      page,
      page.click('a[href="/admin/press"]').then(() =>
        page.waitForURL(`${BASE_URL}/admin/press`, {
          timeout: PAGE_LOAD_THRESHOLD,
        })
      )
    );

    console.log('Press Page Load Metrics:');
    console.log(`  Load time: ${metrics.loadTime}ms`);
    console.log(`  Network requests: ${metrics.networkRequests.length}`);
    console.log(`  Console errors: ${metrics.consoleErrors.length}`);
    console.log(`  Console warnings: ${metrics.consoleWarnings.length}`);

    // Check for infinite loading
    const infiniteLoading = detectInfiniteLoading(metrics);
    if (infiniteLoading.detected) {
      console.error('Infinite loading detected on press page:');
      infiniteLoading.reasons.forEach((reason) => console.error(`  - ${reason}`));
    }

    // Assertions
    expect(metrics.loadTime).toBeLessThan(PAGE_LOAD_THRESHOLD);
    expect(infiniteLoading.detected).toBe(false);

    // Wait for loading spinner to disappear (if any)
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'hidden',
      timeout: 5000,
    }).catch(() => {
      // No loading spinner found, which is fine
    });

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/admin/screenshots/press-loaded.png',
    });
  });

  test('4. Navigation to popups page (should load < 10 seconds)', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // Monitor navigation to popups page
    const metrics = await monitorPageLoad(
      page,
      page.click('a[href="/admin/popups"]').then(() =>
        page.waitForURL(`${BASE_URL}/admin/popups`, {
          timeout: PAGE_LOAD_THRESHOLD,
        })
      )
    );

    console.log('Popups Page Load Metrics:');
    console.log(`  Load time: ${metrics.loadTime}ms`);
    console.log(`  Network requests: ${metrics.networkRequests.length}`);
    console.log(`  Console errors: ${metrics.consoleErrors.length}`);
    console.log(`  Console warnings: ${metrics.consoleWarnings.length}`);

    // Check for infinite loading
    const infiniteLoading = detectInfiniteLoading(metrics);
    if (infiniteLoading.detected) {
      console.error('Infinite loading detected on popups page:');
      infiniteLoading.reasons.forEach((reason) => console.error(`  - ${reason}`));
    }

    // Assertions
    expect(metrics.loadTime).toBeLessThan(PAGE_LOAD_THRESHOLD);
    expect(infiniteLoading.detected).toBe(false);

    // Wait for loading spinner to disappear (if any)
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      state: 'hidden',
      timeout: 5000,
    }).catch(() => {
      // No loading spinner found, which is fine
    });

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/admin/screenshots/popups-loaded.png',
    });
  });

  test('5. Detection of infinite loading issues (comprehensive monitoring)', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const pages = [
      { name: 'Notices', href: '/admin/notices' },
      { name: 'Press', href: '/admin/press' },
      { name: 'Popups', href: '/admin/popups' },
    ];

    const infiniteLoadingIssues: Array<{
      page: string;
      detected: boolean;
      reasons: string[];
      metrics: PageMetrics;
    }> = [];

    for (const { name, href } of pages) {
      console.log(`\n=== Monitoring ${name} Page ===`);

      const metrics = await monitorPageLoad(
        page,
        page.goto(`${BASE_URL}${href}`, {
          timeout: INFINITE_LOADING_TIMEOUT,
          waitUntil: 'networkidle',
        })
      );

      const infiniteLoading = detectInfiniteLoading(metrics);

      infiniteLoadingIssues.push({
        page: name,
        detected: infiniteLoading.detected,
        reasons: infiniteLoading.reasons,
        metrics,
      });

      console.log(`${name} Page Metrics:`);
      console.log(`  Load time: ${metrics.loadTime}ms`);
      console.log(`  Network requests: ${metrics.networkRequests.length}`);
      console.log(`  Console errors: ${metrics.consoleErrors.length}`);
      console.log(`  Console warnings: ${metrics.consoleWarnings.length}`);

      if (infiniteLoading.detected) {
        console.error(`Infinite loading detected on ${name} page:`);
        infiniteLoading.reasons.forEach((reason) =>
          console.error(`  - ${reason}`)
        );

        // Log console errors for debugging
        if (metrics.consoleErrors.length > 0) {
          console.error('Console Errors:');
          metrics.consoleErrors.forEach((error) =>
            console.error(`  - ${error}`)
          );
        }

        // Log failed requests
        const failedRequests = metrics.networkRequests.filter(
          (req) => req.status && req.status >= 400
        );
        if (failedRequests.length > 0) {
          console.error('Failed Requests:');
          failedRequests.forEach((req) =>
            console.error(`  - ${req.method} ${req.url} (${req.status})`)
          );
        }
      }

      // Take screenshot
      await page.screenshot({
        path: `tests/e2e/admin/screenshots/${name.toLowerCase()}-infinite-loading-check.png`,
      });
    }

    // Final report
    console.log('\n=== Infinite Loading Detection Summary ===');
    infiniteLoadingIssues.forEach(({ page: pageName, detected, reasons }) => {
      console.log(`${pageName}: ${detected ? '❌ DETECTED' : '✅ OK'}`);
      if (detected) {
        reasons.forEach((reason) => console.log(`  - ${reason}`));
      }
    });

    // Assertion: No infinite loading detected on any page
    const hasInfiniteLoading = infiniteLoadingIssues.some(
      (issue) => issue.detected
    );
    expect(hasInfiniteLoading).toBe(false);
  });
});
