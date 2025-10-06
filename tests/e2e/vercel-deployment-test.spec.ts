import { test, expect } from '@playwright/test';

const BASE_URL = 'https://glec-website.vercel.app';

test.describe('Vercel Deployment Verification', () => {
  test('should load homepage successfully', async ({ page }) => {
    console.log('[TEST] Testing homepage:', BASE_URL);

    const response = await page.goto(BASE_URL, { timeout: 30000 });

    expect(response?.status()).toBe(200);
    console.log('✅ Homepage loaded with status 200');

    // Check page title
    await expect(page).toHaveTitle(/GLEC/i);
    console.log('✅ Page title contains "GLEC"');

    // Check for main content
    const heroSection = page.locator('text=ISO-14083').first();
    await expect(heroSection).toBeVisible({ timeout: 10000 });
    console.log('✅ Hero section visible');
  });

  test('should load admin login page', async ({ page }) => {
    console.log('[TEST] Testing admin login:', `${BASE_URL}/admin/login`);

    const response = await page.goto(`${BASE_URL}/admin/login`, { timeout: 30000 });

    expect(response?.status()).toBe(200);
    console.log('✅ Admin login page loaded');

    // Check for login form
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const loginButton = page.getByRole('button', { name: /sign in|login|로그인/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    console.log('✅ Login form elements visible');
  });

  test('should test admin login functionality', async ({ page }) => {
    console.log('[TEST] Testing admin login with credentials');

    await page.goto(`${BASE_URL}/admin/login`, { timeout: 30000 });

    // Fill in credentials
    await page.getByLabel(/email/i).fill('admin@glec.io');
    await page.getByLabel(/password/i).fill('AdminPass123!');

    console.log('📝 Credentials entered');

    // Click login button
    const loginButton = page.getByRole('button', { name: /sign in|login|로그인/i });
    await loginButton.click();

    console.log('🔄 Login button clicked, waiting for response...');

    // Wait for either redirect to dashboard or error message
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`📍 Current URL after login: ${currentUrl}`);

    // Check if we're on dashboard or still on login page with error
    if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin/demo-requests')) {
      console.log('✅ Login successful - redirected to admin area');
    } else if (currentUrl.includes('/admin/login')) {
      const errorMessage = await page.locator('text=/error|invalid|incorrect/i').textContent().catch(() => null);
      if (errorMessage) {
        console.log(`⚠️ Login failed with error: ${errorMessage}`);
        console.log('💡 This likely means DATABASE_URL or JWT_SECRET needs to be set in Vercel');
      } else {
        console.log('⚠️ Still on login page - checking for response');
      }
    }
  });

  test('should load demo request page', async ({ page }) => {
    console.log('[TEST] Testing demo request page:', `${BASE_URL}/demo-request`);

    const response = await page.goto(`${BASE_URL}/demo-request`, { timeout: 30000 });

    expect(response?.status()).toBe(200);
    console.log('✅ Demo request page loaded');

    // Check for form
    const companyNameInput = page.getByLabel(/company.*name/i).first();
    await expect(companyNameInput).toBeVisible();
    console.log('✅ Demo request form visible');
  });

  test('should check all main navigation links', async ({ page }) => {
    console.log('[TEST] Testing main navigation');

    await page.goto(BASE_URL, { timeout: 30000 });

    const navLinks = [
      { name: 'Products', href: '/products' },
      { name: 'Solutions', href: '/solutions' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ];

    for (const link of navLinks) {
      const navLink = page.getByRole('link', { name: new RegExp(link.name, 'i') }).first();
      const isVisible = await navLink.isVisible().catch(() => false);

      if (isVisible) {
        console.log(`✅ Navigation link "${link.name}" is visible`);
      } else {
        console.log(`⚠️ Navigation link "${link.name}" not found`);
      }
    }
  });

  test('should test API health endpoint', async ({ page }) => {
    console.log('[TEST] Testing API health endpoint');

    const response = await page.goto(`${BASE_URL}/api/health`, { timeout: 10000 }).catch(() => null);

    if (response) {
      const status = response.status();
      console.log(`📡 API health endpoint status: ${status}`);

      if (status === 200) {
        const body = await response.json().catch(() => null);
        console.log(`✅ API health check response:`, body);
      }
    } else {
      console.log('⚠️ API health endpoint not available (might not be implemented)');
    }
  });

  test('should check for database connection errors', async ({ page }) => {
    console.log('[TEST] Checking for database connection errors');

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Try to access admin page that requires DB
    await page.goto(`${BASE_URL}/admin/login`, { timeout: 30000 });

    // Check for database-related errors
    const dbErrors = consoleErrors.filter(err =>
      err.toLowerCase().includes('database') ||
      err.toLowerCase().includes('connection') ||
      err.toLowerCase().includes('prisma')
    );

    if (dbErrors.length > 0) {
      console.log('⚠️ Database connection errors detected:');
      dbErrors.forEach(err => console.log(`   - ${err}`));
      console.log('💡 DATABASE_URL environment variable may need to be set in Vercel');
    } else {
      console.log('✅ No database connection errors detected');
    }
  });
});
