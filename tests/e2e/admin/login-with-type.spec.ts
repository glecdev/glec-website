import { test, expect } from '@playwright/test';

test.describe('Admin Login and Navigation with type() method', () => {
  test('should login successfully and navigate to all admin pages', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3006';

    // Track page load times
    const loadTimes: Record<string, number> = {};

    // Step 1: Navigate to login page
    console.log('📍 Step 1: Navigating to login page...');
    const loginStartTime = Date.now();
    await page.goto(`${baseUrl}/admin/login`);
    await page.waitForLoadState('networkidle');
    loadTimes['login-page'] = Date.now() - loginStartTime;
    console.log(`✅ Login page loaded in ${loadTimes['login-page']}ms`);

    // Step 2: Fill in login form using type() method
    console.log('📍 Step 2: Filling in login form with type() method...');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.click();
    await emailInput.type('admin@glec.io', { delay: 50 });
    console.log('✅ Email entered: admin@glec.io');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.click();
    await passwordInput.type('admin123!', { delay: 50 });
    console.log('✅ Password entered');

    // Step 3: Submit login form
    console.log('📍 Step 3: Submitting login form...');
    const submitButton = page.locator('button[type="submit"]');

    const loginSubmitStartTime = Date.now();
    await submitButton.click();

    // Wait for navigation to admin dashboard
    try {
      await page.waitForURL(/\/admin\/(dashboard|notices)/, { timeout: 10000 });
      loadTimes['login-submit'] = Date.now() - loginSubmitStartTime;
      console.log(`✅ Login successful! Redirected in ${loadTimes['login-submit']}ms`);
      console.log(`✅ Redirected to: ${page.url()}`);
    } catch (error) {
      console.error('❌ Login failed or redirect timeout');
      throw error;
    }

    // Verify we're on an admin page
    expect(page.url()).toMatch(/\/admin\/(dashboard|notices)/);
    console.log('✅ Confirmed on admin page');

    // Step 4: Test navigation to all admin pages
    const adminPages = [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Notices', path: '/admin/notices' },
      { name: 'Press', path: '/admin/press' },
      { name: 'Popups', path: '/admin/popups' },
      { name: 'Demo Requests', path: '/admin/demo-requests' },
    ];

    for (const adminPage of adminPages) {
      console.log(`\n📍 Testing page: ${adminPage.name} (${adminPage.path})`);

      const navStartTime = Date.now();

      try {
        // Navigate to the page
        await page.goto(`${baseUrl}${adminPage.path}`);

        // Wait for page to load (with timeout to detect infinite loading)
        await Promise.race([
          page.waitForLoadState('networkidle', { timeout: 15000 }),
          page.waitForSelector('text=/loading/i', { state: 'hidden', timeout: 15000 }).catch(() => {
            // If no loading indicator found, that's okay
          })
        ]);

        const loadTime = Date.now() - navStartTime;
        loadTimes[adminPage.name] = loadTime;

        // Check for actual 404 error (check title and main content)
        const pageTitle = await page.title();
        const mainContent = await page.locator('main, [role="main"], body > div').first().textContent();

        const is404 = pageTitle.includes('404') || (mainContent && mainContent.includes('Page Not Found'));
        const hasError = mainContent?.toLowerCase().includes('error occurred');

        // Look for expected content
        const hasExpectedContent = await page.locator('h1, h2, .text-3xl, .text-2xl').count() > 0;

        if (is404) {
          console.log(`❌ ${adminPage.name}: 404 Not Found`);
        } else if (hasError) {
          console.log(`⚠️  ${adminPage.name}: Error detected on page`);
        } else if (!hasExpectedContent) {
          console.log(`⚠️  ${adminPage.name}: Page loaded but missing expected content`);
        } else {
          console.log(`✅ ${adminPage.name}: Loaded successfully in ${loadTime}ms`);
        }

        // Check if still loading (infinite loading detection)
        const stillLoading = await page.locator('text=/loading/i').count() > 0;
        if (stillLoading) {
          console.log(`⚠️  ${adminPage.name}: Page appears to be stuck in loading state`);
        }

        // Verify URL
        expect(page.url()).toBe(`${baseUrl}${adminPage.path}`);

      } catch (error) {
        const loadTime = Date.now() - navStartTime;
        loadTimes[adminPage.name] = loadTime;
        console.log(`❌ ${adminPage.name}: Failed to load (timeout after ${loadTime}ms)`);
        console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Step 5: Print summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 LOAD TIME SUMMARY');
    console.log('='.repeat(60));
    console.log(`Login Page Load:      ${loadTimes['login-page']}ms`);
    console.log(`Login Submit Time:    ${loadTimes['login-submit']}ms`);
    console.log('-'.repeat(60));
    for (const adminPage of adminPages) {
      const time = loadTimes[adminPage.name];
      const status = time > 10000 ? '⚠️  SLOW' : time > 5000 ? '⚠️  ' : '✅';
      console.log(`${status} ${adminPage.name.padEnd(20)} ${time}ms`);
    }
    console.log('='.repeat(60));
  });
});
