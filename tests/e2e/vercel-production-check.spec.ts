import { test, expect } from '@playwright/test';

const BASE_URL = 'https://glec-website.vercel.app';

test.describe('Vercel Production Site Check', () => {
  test('FULL CHECK: Homepage → Admin Login → Test Login', async ({ page }) => {
    console.log('\n🚀 ========================================');
    console.log('   GLEC Vercel Deployment Full Check');
    console.log('========================================\n');

    // Step 1: Homepage
    console.log('📍 Step 1: Testing Homepage');
    await page.goto(BASE_URL, { timeout: 30000 });
    console.log(`   ✅ Homepage loaded: ${BASE_URL}`);

    await expect(page).toHaveTitle(/GLEC/i);
    console.log('   ✅ Page title contains "GLEC"');

    // Step 2: Admin Login Page
    console.log('\n📍 Step 2: Testing Admin Login Page');
    await page.goto(`${BASE_URL}/admin/login`, { timeout: 30000 });
    console.log(`   ✅ Admin login page loaded: ${BASE_URL}/admin/login`);

    // Check for Korean or English login form
    const emailInput = page.locator('input[type="email"], input[name="email"], [placeholder*="이메일"], [placeholder*="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("로그인"), button:has-text("Login"), button:has-text("Sign In")').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
    console.log('   ✅ Login form elements found (이메일, 비밀번호, 로그인 버튼)');

    // Step 3: Test Login
    console.log('\n📍 Step 3: Testing Admin Login with Credentials');
    await emailInput.fill('admin@glec.io');
    await passwordInput.fill('AdminPass123!');
    console.log('   📝 Entered credentials: admin@glec.io');

    await loginButton.click();
    console.log('   🔄 Clicked login button, waiting for response...');

    // Wait for navigation or error
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    console.log(`   📍 Current URL: ${currentUrl}`);

    // Check result
    if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin/demo-requests')) {
      console.log('\n   ✅ ========================================');
      console.log('   ✅ LOGIN SUCCESSFUL!');
      console.log('   ✅ Redirected to admin area');
      console.log('   ✅ Environment variables are correctly set!');
      console.log('   ✅ ========================================\n');

      // Take screenshot of dashboard
      await page.screenshot({ path: 'test-results/vercel-admin-dashboard-success.png', fullPage: true });
      console.log('   📸 Screenshot saved: vercel-admin-dashboard-success.png');

    } else if (currentUrl.includes('/admin/login')) {
      // Still on login page - check for error
      const errorElement = await page.locator('text=/오류|에러|error|invalid|incorrect|failed/i').first();
      const errorVisible = await errorElement.isVisible().catch(() => false);

      if (errorVisible) {
        const errorText = await errorElement.textContent();
        console.log('\n   ⚠️  ========================================');
        console.log('   ⚠️  LOGIN FAILED');
        console.log(`   ⚠️  Error message: ${errorText}`);
        console.log('   ⚠️  ========================================\n');
      } else {
        console.log('\n   ⚠️  ========================================');
        console.log('   ⚠️  LOGIN ISSUE - Still on login page');
        console.log('   ⚠️  No error message visible');
        console.log('   ⚠️  ========================================\n');
      }

      // Take screenshot
      await page.screenshot({ path: 'test-results/vercel-admin-login-issue.png', fullPage: true });
      console.log('   📸 Screenshot saved: vercel-admin-login-issue.png');

      // Check console for errors
      console.log('\n   🔍 Checking browser console for errors...');

    } else {
      console.log(`\n   ⚠️  Unexpected URL: ${currentUrl}`);
    }

    // Step 4: Check Environment Variables Status
    console.log('\n📍 Step 4: Environment Variables Check');
    console.log('   Required environment variables:');
    console.log('   - DATABASE_URL (Neon PostgreSQL)');
    console.log('   - JWT_SECRET (for authentication)');
    console.log('   - NEXTAUTH_SECRET (for sessions)');
    console.log('   - NEXTAUTH_URL (production URL)');

    if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin/demo-requests')) {
      console.log('\n   ✅ All environment variables appear to be set correctly!');
    } else {
      console.log('\n   ⚠️  Environment variables may need to be set in Vercel Dashboard');
      console.log('   💡 Go to: https://vercel.com/dashboard → glec-website → Settings → Environment Variables');
    }

    console.log('\n========================================');
    console.log('   Full Check Complete');
    console.log('========================================\n');
  });

  test('CHECK: Demo Request Page', async ({ page }) => {
    console.log('\n🔍 Testing Demo Request Page');

    await page.goto(`${BASE_URL}/demo-request`, { timeout: 30000 });
    console.log(`✅ Page loaded: ${BASE_URL}/demo-request`);

    // Check for form fields (Korean labels)
    const formFields = await page.locator('input, textarea, select').count();
    console.log(`✅ Found ${formFields} form fields`);

    if (formFields > 5) {
      console.log('✅ Demo request form appears complete');
    } else {
      console.log('⚠️  Demo request form may be incomplete');
    }
  });

  test('CHECK: API Endpoints', async ({ request }) => {
    console.log('\n🔍 Testing API Endpoints');

    const endpoints = [
      { path: '/api/demo-request', method: 'GET', expectedStatus: [200, 405, 404] },
      { path: '/api/admin/login', method: 'GET', expectedStatus: [200, 405, 404] },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await request.get(`${BASE_URL}${endpoint.path}`);
        const status = response.status();

        if (endpoint.expectedStatus.includes(status)) {
          console.log(`✅ ${endpoint.path}: Status ${status}`);
        } else {
          console.log(`⚠️  ${endpoint.path}: Unexpected status ${status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.path}: Failed to connect`);
      }
    }
  });
});
