/**
 * Complete Admin Portal E2E Test
 *
 * Tests ALL admin pages in one comprehensive flow:
 * 1. Login with type() method
 * 2. Dashboard - verify loads, check stats cards
 * 3. Analytics - verify loads, check 4 summary cards, check tables, test time range selector
 * 4. Notices - verify loads, check table/list
 * 5. Press - verify loads
 * 6. Popups - verify loads
 * 7. Demo Requests - verify loads
 *
 * Measures load time for each page.
 * Detects:
 * - Infinite loading (loading skeleton > 10s)
 * - Console errors
 * - Failed API requests
 * - 404 pages
 */

import { test, expect } from '@playwright/test';

interface LoadTimeResult {
  page: string;
  loadTimeMs: number;
  status: 'success' | 'timeout' | '404' | 'error' | 'slow';
  issues: string[];
}

test.describe('Complete Admin Portal E2E Test', () => {
  test('should test all admin pages comprehensively', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3006';
    const results: LoadTimeResult[] = [];
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];

    // Listen to console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Console Error] ${msg.text()}`);
      }
    });

    // Listen to failed requests
    page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`[HTTP ${response.status()}] ${response.url()}`);
      }
    });

    // ========================================
    // STEP 1: LOGIN
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('STEP 1: LOGIN');
    console.log('='.repeat(80));

    const loginStartTime = Date.now();
    await page.goto(`${baseUrl}/admin/login`);
    await page.waitForLoadState('networkidle');
    const loginPageLoadTime = Date.now() - loginStartTime;

    console.log(`✅ Login page loaded in ${loginPageLoadTime}ms`);

    // Fill in login form using pressSequentially() for React controlled inputs
    const emailInput = page.locator('input[name="email"]');
    await emailInput.click();
    await emailInput.pressSequentially('admin@glec.io', { delay: 50 });

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.click();
    await passwordInput.pressSequentially('admin123!', { delay: 50 });

    console.log('✅ Credentials entered');

    // CRITICAL: Wait for React to process the input events and update state
    await page.waitForTimeout(300);

    // Submit login
    const submitButton = page.locator('button[type="submit"]');
    const loginSubmitStartTime = Date.now();
    await submitButton.click();

    // Wait for redirect
    try {
      await page.waitForURL(/\/admin\/(dashboard|notices|analytics)/, { timeout: 10000 });
      const loginSubmitTime = Date.now() - loginSubmitStartTime;
      console.log(`✅ Login successful! Redirected in ${loginSubmitTime}ms`);
    } catch (error) {
      console.error('❌ Login failed or redirect timeout');
      throw error;
    }

    // ========================================
    // STEP 2: DASHBOARD
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('STEP 2: DASHBOARD');
    console.log('='.repeat(80));

    const dashboardResult = await testPage(page, baseUrl, '/admin/dashboard', {
      name: 'Dashboard',
      checks: async () => {
        const checks: string[] = [];

        // Check for heading
        const heading = await page.locator('h1').first().textContent();
        if (heading?.includes('대시보드') || heading?.includes('Dashboard')) {
          checks.push('✅ Dashboard heading found');
        } else {
          checks.push('⚠️ Dashboard heading not found');
        }

        // Check for stats cards (usually 4-6 cards)
        const statsCards = await page.locator('.bg-white.rounded-lg.border').count();
        if (statsCards >= 2) {
          checks.push(`✅ ${statsCards} stat cards found`);
        } else {
          checks.push(`⚠️ Only ${statsCards} stat cards found (expected >= 2)`);
        }

        return checks;
      }
    });
    results.push(dashboardResult);

    // ========================================
    // STEP 3: ANALYTICS (DETAILED)
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('STEP 3: ANALYTICS (DETAILED)');
    console.log('='.repeat(80));

    const analyticsResult = await testPage(page, baseUrl, '/admin/analytics', {
      name: 'Analytics',
      checks: async () => {
        const checks: string[] = [];

        // Check heading
        const heading = await page.locator('h1').first().textContent();
        if (heading?.includes('분석') || heading?.includes('Analytics')) {
          checks.push('✅ Analytics heading found');
        } else {
          checks.push('⚠️ Analytics heading not found');
        }

        // Check for 4 summary cards
        const summaryCards = await page.locator('.bg-white.rounded-lg.border.p-6.shadow-sm').count();
        if (summaryCards >= 4) {
          checks.push(`✅ ${summaryCards} summary cards found (expected 4)`);
        } else {
          checks.push(`⚠️ Only ${summaryCards} summary cards found (expected 4)`);
        }

        // Check for specific metric cards by looking for text content
        const pageContent = await page.textContent('body');
        const metrics = ['페이지 뷰', '총 CTA', '고유 방문자', '평균 세션'];
        metrics.forEach(metric => {
          if (pageContent?.includes(metric)) {
            checks.push(`✅ Metric "${metric}" found`);
          } else {
            checks.push(`⚠️ Metric "${metric}" not found`);
          }
        });

        // Check for tables (Top Pages, Top CTAs)
        const tables = await page.locator('table').count();
        if (tables >= 2) {
          checks.push(`✅ ${tables} tables found (expected 2: Top Pages, Top CTAs)`);
        } else {
          checks.push(`⚠️ Only ${tables} tables found (expected 2)`);
        }

        // Check table headers
        const tableHeaders = await page.locator('th').allTextContents();
        const expectedHeaders = ['페이지', '조회수', '버튼', '클릭수'];
        const foundHeaders = expectedHeaders.filter(h =>
          tableHeaders.some(th => th.includes(h))
        );
        checks.push(`✅ Found ${foundHeaders.length}/${expectedHeaders.length} expected table headers`);

        // Check for time range selector
        const timeRangeSelector = await page.locator('select#timeRange').count();
        if (timeRangeSelector > 0) {
          checks.push('✅ Time range selector found');

          // Test time range selector
          const options = await page.locator('select#timeRange option').allTextContents();
          if (options.length >= 3) {
            checks.push(`✅ ${options.length} time range options available`);
          } else {
            checks.push(`⚠️ Only ${options.length} time range options (expected >= 3)`);
          }

          // Try changing time range
          try {
            await page.selectOption('select#timeRange', 'last_7_days');
            await page.waitForTimeout(1000); // Wait for re-fetch
            checks.push('✅ Time range selector is interactive');
          } catch (error) {
            checks.push('⚠️ Time range selector interaction failed');
          }
        } else {
          checks.push('⚠️ Time range selector not found');
        }

        return checks;
      }
    });
    results.push(analyticsResult);

    // ========================================
    // STEP 4: NOTICES
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('STEP 4: NOTICES');
    console.log('='.repeat(80));

    const noticesResult = await testPage(page, baseUrl, '/admin/notices', {
      name: 'Notices',
      checks: async () => {
        const checks: string[] = [];

        const heading = await page.locator('h1').first().textContent();
        if (heading?.includes('공지사항') || heading?.includes('Notices')) {
          checks.push('✅ Notices heading found');
        }

        // Check for table or list
        const hasTable = await page.locator('table').count() > 0;
        const hasCards = await page.locator('.bg-white.rounded-lg.border').count() > 0;

        if (hasTable || hasCards) {
          checks.push(`✅ Notice list/table found (table: ${hasTable}, cards: ${hasCards})`);
        } else {
          checks.push('⚠️ Notice list/table not found');
        }

        return checks;
      }
    });
    results.push(noticesResult);

    // ========================================
    // STEP 5: PRESS
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('STEP 5: PRESS');
    console.log('='.repeat(80));

    const pressResult = await testPage(page, baseUrl, '/admin/press', {
      name: 'Press',
      checks: async () => {
        const checks: string[] = [];

        const heading = await page.locator('h1').first().textContent();
        if (heading?.includes('보도자료') || heading?.includes('Press')) {
          checks.push('✅ Press heading found');
        }

        const hasContent = await page.locator('.bg-white.rounded-lg.border').count() > 0;
        if (hasContent) {
          checks.push('✅ Press content found');
        }

        return checks;
      }
    });
    results.push(pressResult);

    // ========================================
    // STEP 6: POPUPS
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('STEP 6: POPUPS');
    console.log('='.repeat(80));

    const popupsResult = await testPage(page, baseUrl, '/admin/popups', {
      name: 'Popups',
      checks: async () => {
        const checks: string[] = [];

        const heading = await page.locator('h1').first().textContent();
        if (heading?.includes('팝업') || heading?.includes('Popups')) {
          checks.push('✅ Popups heading found');
        }

        const hasContent = await page.locator('.bg-white.rounded-lg.border').count() > 0;
        if (hasContent) {
          checks.push('✅ Popup content found');
        }

        return checks;
      }
    });
    results.push(popupsResult);

    // ========================================
    // STEP 7: DEMO REQUESTS
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('STEP 7: DEMO REQUESTS');
    console.log('='.repeat(80));

    const demoRequestsResult = await testPage(page, baseUrl, '/admin/demo-requests', {
      name: 'Demo Requests',
      checks: async () => {
        const checks: string[] = [];

        const heading = await page.locator('h1').first().textContent();
        if (heading?.includes('데모 요청') || heading?.includes('Demo')) {
          checks.push('✅ Demo Requests heading found');
        }

        const hasContent = await page.locator('.bg-white.rounded-lg.border').count() > 0;
        if (hasContent) {
          checks.push('✅ Demo request content found');
        }

        return checks;
      }
    });
    results.push(demoRequestsResult);

    // ========================================
    // FINAL REPORT
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('FINAL REPORT');
    console.log('='.repeat(80));

    // Print results table
    console.log('\n📊 PERFORMANCE SUMMARY');
    console.log('-'.repeat(80));
    console.log('| Page              | Load Time | Status   | Issues |');
    console.log('|-------------------|-----------|----------|--------|');

    results.forEach(result => {
      const pageName = result.page.padEnd(17);
      const loadTime = `${result.loadTimeMs}ms`.padEnd(9);
      const status = getStatusIcon(result.status).padEnd(8);
      const issueCount = result.issues.length;

      console.log(`| ${pageName} | ${loadTime} | ${status} | ${issueCount}      |`);
    });
    console.log('-'.repeat(80));

    // Print detailed issues
    const allIssues = results.filter(r => r.issues.length > 0);
    if (allIssues.length > 0) {
      console.log('\n⚠️  DETECTED ISSUES:');
      allIssues.forEach(result => {
        console.log(`\n${result.page}:`);
        result.issues.forEach(issue => console.log(`  - ${issue}`));
      });
    }

    // Print console errors
    if (consoleErrors.length > 0) {
      console.log('\n🐛 CONSOLE ERRORS:');
      consoleErrors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      if (consoleErrors.length > 10) {
        console.log(`  ... and ${consoleErrors.length - 10} more errors`);
      }
    }

    // Print failed requests
    if (failedRequests.length > 0) {
      console.log('\n❌ FAILED REQUESTS:');
      failedRequests.slice(0, 10).forEach(req => console.log(`  - ${req}`));
      if (failedRequests.length > 10) {
        console.log(`  ... and ${failedRequests.length - 10} more failures`);
      }
    }

    // Overall status
    const allSuccess = results.every(r => r.status === 'success');
    const hasSlowPages = results.some(r => r.status === 'slow');
    const hasErrors = results.some(r => r.status === 'error' || r.status === '404' || r.status === 'timeout');

    console.log('\n' + '='.repeat(80));
    if (allSuccess) {
      console.log('✅ ALL PAGES PASSED');
    } else if (hasErrors) {
      console.log('❌ SOME PAGES FAILED - NEEDS ATTENTION');
    } else if (hasSlowPages) {
      console.log('⚠️  ALL PAGES LOADED BUT SOME ARE SLOW');
    }
    console.log('='.repeat(80));

    // Store results for report generation
    (global as any).adminTestResults = {
      results,
      consoleErrors,
      failedRequests,
      loginPageLoadTime,
      timestamp: new Date().toISOString(),
    };

    // Assertions
    expect(allSuccess || hasSlowPages, 'All pages should load successfully or be slow (not error/404/timeout)').toBeTruthy();
  });
});

/**
 * Helper function to test a page
 */
async function testPage(
  page: any,
  baseUrl: string,
  path: string,
  options: {
    name: string;
    checks?: () => Promise<string[]>;
  }
): Promise<LoadTimeResult> {
  const result: LoadTimeResult = {
    page: options.name,
    loadTimeMs: 0,
    status: 'success',
    issues: [],
  };

  const startTime = Date.now();

  try {
    // Navigate to page
    await page.goto(`${baseUrl}${path}`);

    // Wait for page to load (with timeout to detect infinite loading)
    await Promise.race([
      page.waitForLoadState('networkidle', { timeout: 15000 }),
      page.waitForSelector('text=/loading/i', { state: 'hidden', timeout: 15000 }).catch(() => {
        // If no loading indicator found, that's okay
      })
    ]);

    result.loadTimeMs = Date.now() - startTime;

    // Check for 404
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('404') || pageContent?.includes('Not Found')) {
      result.status = '404';
      result.issues.push('Page returned 404 Not Found');
      console.log(`❌ ${options.name}: 404 Not Found`);
      return result;
    }

    // Check if still loading (infinite loading)
    const stillLoading = await page.locator('text=/loading/i').count() > 0;
    if (stillLoading) {
      result.issues.push('Page stuck in loading state');
      console.log(`⚠️  ${options.name}: Page appears to be stuck in loading state`);
    }

    // Check for errors
    if (pageContent?.includes('Error') || pageContent?.includes('error')) {
      result.issues.push('Error message detected on page');
      console.log(`⚠️  ${options.name}: Error detected on page`);
    }

    // Run custom checks
    if (options.checks) {
      const checks = await options.checks();
      checks.forEach(check => {
        console.log(`  ${check}`);
        if (check.startsWith('⚠️') || check.startsWith('❌')) {
          result.issues.push(check);
        }
      });
    }

    // Determine status
    if (result.loadTimeMs > 10000) {
      result.status = 'timeout';
      result.issues.push(`Load time exceeded 10s (${result.loadTimeMs}ms)`);
    } else if (result.loadTimeMs > 5000) {
      result.status = 'slow';
      result.issues.push(`Load time is slow (${result.loadTimeMs}ms)`);
    } else if (result.issues.length > 0) {
      result.status = 'error';
    }

    console.log(`✅ ${options.name}: Loaded in ${result.loadTimeMs}ms (status: ${result.status})`);

  } catch (error) {
    result.loadTimeMs = Date.now() - startTime;
    result.status = 'error';
    result.issues.push(`Failed to load: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`❌ ${options.name}: Failed to load (${result.loadTimeMs}ms)`);
    console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Get status icon
 */
function getStatusIcon(status: string): string {
  switch (status) {
    case 'success': return '✅';
    case 'slow': return '⚠️ SLOW';
    case 'timeout': return '❌ TIMEOUT';
    case '404': return '❌ 404';
    case 'error': return '❌ ERROR';
    default: return '❓';
  }
}
