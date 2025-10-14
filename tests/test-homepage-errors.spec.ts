/**
 * Playwright E2E Test: Homepage Error Verification
 *
 * Purpose: Recursively verify that homepage loads without errors
 * Target: https://glec-website.vercel.app/
 *
 * Test Cases:
 * 1. No "Application error" message
 * 2. No JavaScript console errors
 * 3. No unhandled promise rejections
 * 4. All main sections render correctly
 * 5. Toaster component is mounted
 * 6. No missing dependencies
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

test.describe('Homepage Error Verification', () => {
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];
  let pageErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Reset error arrays
    consoleErrors = [];
    consoleWarnings = [];
    pageErrors = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Capture unhandled promise rejections
    page.on('console', (msg) => {
      if (msg.text().includes('Unhandled Promise rejection')) {
        pageErrors.push(msg.text());
      }
    });
  });

  test('1. Homepage should load without "Application error" message', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Check for "Application error" text
    const applicationError = page.getByText(/Application error.*client-side exception/i);
    await expect(applicationError).not.toBeVisible({ timeout: 5000 });

    // Check page title
    await expect(page).toHaveTitle(/GLEC.*ISO-14083/i);

    console.log('✅ Test 1 PASSED: No "Application error" message found');
  });

  test('2. Homepage should have no JavaScript console errors', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Check for critical errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        err.includes('Uncaught') ||
        err.includes('TypeError') ||
        err.includes('ReferenceError') ||
        err.includes('Toaster') ||
        err.includes('undefined')
    );

    if (criticalErrors.length > 0) {
      console.error('❌ Test 2 FAILED: Critical JavaScript errors found:');
      criticalErrors.forEach((err) => console.error(`   - ${err}`));
      throw new Error(`Found ${criticalErrors.length} critical JavaScript errors`);
    }

    console.log('✅ Test 2 PASSED: No critical JavaScript errors');
    console.log(`   (Total console errors: ${consoleErrors.length}, warnings: ${consoleWarnings.length})`);
  });

  test('3. Homepage should have no page errors or unhandled rejections', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    if (pageErrors.length > 0) {
      console.error('❌ Test 3 FAILED: Page errors found:');
      pageErrors.forEach((err) => console.error(`   - ${err}`));
      throw new Error(`Found ${pageErrors.length} page errors`);
    }

    console.log('✅ Test 3 PASSED: No page errors or unhandled rejections');
  });

  test('4. All main homepage sections should render', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Check for main sections
    const sections = [
      { name: 'Hero Section', selector: 'text=/ISO-14083/i' },
      { name: 'Problem Awareness', selector: 'text=/매일 밤/i' },
      { name: 'Solution Overview', selector: 'text=/단 하나의 플랫폼/i' },
      { name: 'Partners', selector: 'text=/함께하는 파트너/i' },
      { name: 'Latest News', selector: 'text=/최신 소식/i' },
      { name: 'Contact Form', selector: 'text=/무료 상담 신청/i' },
      { name: 'FAQ', selector: 'text=/자주 묻는 질문/i' },
    ];

    for (const section of sections) {
      const element = page.locator(section.selector).first();
      await expect(element).toBeVisible({ timeout: 10000 });
      console.log(`   ✓ ${section.name} rendered`);
    }

    console.log('✅ Test 4 PASSED: All main sections render correctly');
  });

  test('5. Toaster component should be present in DOM', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Check if Toaster container exists
    // react-hot-toast creates a div with specific attributes
    const toasterContainer = page.locator('[data-hot-toast-container], [role="region"][aria-live="polite"]').first();

    // The Toaster container should be in the DOM (even if no toasts are shown)
    const toasterExists = await toasterContainer.count() > 0;

    if (!toasterExists) {
      console.error('❌ Test 5 FAILED: Toaster component not found in DOM');
      throw new Error('Toaster component is not mounted');
    }

    console.log('✅ Test 5 PASSED: Toaster component is present in DOM');
  });

  test('6. No missing critical resources (JS/CSS)', async ({ page }) => {
    const failedRequests: { url: string; status: number }[] = [];

    page.on('response', (response) => {
      const url = response.url();
      const status = response.status();

      // Check for failed critical resources
      if (
        status >= 400 &&
        (url.includes('/_next/') || url.endsWith('.js') || url.endsWith('.css'))
      ) {
        failedRequests.push({ url, status });
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    if (failedRequests.length > 0) {
      console.error('❌ Test 6 FAILED: Failed to load critical resources:');
      failedRequests.forEach((req) => console.error(`   - ${req.url} (${req.status})`));
      throw new Error(`Found ${failedRequests.length} failed resource requests`);
    }

    console.log('✅ Test 6 PASSED: All critical resources loaded successfully');
  });

  test('7. Homepage should be interactive (buttons clickable)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Find the first CTA button
    const ctaButton = page.getByRole('button', { name: /무료 상담|문의하기/i }).first();

    // Check if button is visible and enabled
    await expect(ctaButton).toBeVisible({ timeout: 5000 });
    await expect(ctaButton).toBeEnabled();

    console.log('✅ Test 7 PASSED: Homepage is interactive');
  });

  test('8. No hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (
        text.includes('Hydration') ||
        text.includes('hydration') ||
        text.includes('did not match')
      ) {
        hydrationErrors.push(text);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    if (hydrationErrors.length > 0) {
      console.error('❌ Test 8 FAILED: Hydration errors found:');
      hydrationErrors.forEach((err) => console.error(`   - ${err}`));
      throw new Error(`Found ${hydrationErrors.length} hydration errors`);
    }

    console.log('✅ Test 8 PASSED: No hydration errors');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      // Take screenshot on failure
      await page.screenshot({
        path: `test-results/homepage-error-${testInfo.title.replace(/\s+/g, '-')}.png`,
        fullPage: true,
      });

      // Save console logs
      console.log('\n=== Console Errors ===');
      consoleErrors.forEach((err) => console.log(err));
      console.log('\n=== Console Warnings ===');
      consoleWarnings.forEach((warn) => console.log(warn));
      console.log('\n=== Page Errors ===');
      pageErrors.forEach((err) => console.log(err));
    }
  });
});

test.describe('Recursive Error Verification', () => {
  test('Run comprehensive error check 3 times', async ({ page }) => {
    const iterations = 3;
    const results: { iteration: number; passed: boolean; errors: string[] }[] = [];

    for (let i = 1; i <= iterations; i++) {
      console.log(`\n🔄 Iteration ${i}/${iterations}`);

      const errors: string[] = [];

      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      // Check for "Application error"
      const hasApplicationError = await page
        .getByText(/Application error.*client-side exception/i)
        .count() > 0;

      if (hasApplicationError) {
        errors.push('Found "Application error" message');
      }

      const passed = errors.length === 0;
      results.push({ iteration: i, passed, errors });

      console.log(`   ${passed ? '✅' : '❌'} Iteration ${i}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (!passed) {
        errors.forEach((err) => console.log(`      - ${err}`));
      }

      // Wait before next iteration
      if (i < iterations) {
        await page.waitForTimeout(2000);
      }
    }

    // Final verdict
    const allPassed = results.every((r) => r.passed);
    const passedCount = results.filter((r) => r.passed).length;

    console.log('\n📊 Recursive Verification Results:');
    console.log(`   Passed: ${passedCount}/${iterations}`);
    console.log(`   Success Rate: ${(passedCount / iterations * 100).toFixed(1)}%`);

    if (!allPassed) {
      throw new Error(
        `Recursive verification failed: ${passedCount}/${iterations} iterations passed`
      );
    }

    console.log('✅ All iterations PASSED: Homepage is error-free');
  });
});
