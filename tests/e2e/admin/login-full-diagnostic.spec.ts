import { test, expect, type Request, type Response } from '@playwright/test';

test.describe('Admin Login - Full Diagnostic Test', () => {
  test('should diagnose login flow with complete network and state tracking', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3006';

    console.log('\n' + '='.repeat(80));
    console.log('🔍 ADMIN LOGIN FULL DIAGNOSTIC TEST');
    console.log('='.repeat(80));

    // ============================================================
    // STEP 1: Navigate to login page
    // ============================================================
    console.log('\n📍 STEP 1: Navigate to login page');
    console.log('-'.repeat(80));

    const loginUrl = `${baseUrl}/admin/login`;
    console.log(`   Target URL: ${loginUrl}`);

    await page.goto(loginUrl);
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Page loaded successfully');

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/diagnostic-01-initial.png', fullPage: true });
    console.log('   📸 Screenshot: diagnostic-01-initial.png');

    // ============================================================
    // STEP 2: Enter credentials using pressSequentially()
    // ============================================================
    console.log('\n📍 STEP 2: Enter credentials using pressSequentially()');
    console.log('-'.repeat(80));

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    // Check if inputs exist
    const emailExists = await emailInput.count() > 0;
    const passwordExists = await passwordInput.count() > 0;
    console.log(`   Email input found: ${emailExists}`);
    console.log(`   Password input found: ${passwordExists}`);

    if (!emailExists || !passwordExists) {
      throw new Error('Login form inputs not found!');
    }

    // Enter email
    console.log('   ⌨️  Entering email: admin@glec.io');
    await emailInput.click();
    await emailInput.pressSequentially('admin@glec.io', { delay: 50 });

    // Enter password
    console.log('   ⌨️  Entering password: admin123!');
    await passwordInput.click();
    await passwordInput.pressSequentially('admin123!', { delay: 50 });

    // ============================================================
    // STEP 3: Wait for React state to update
    // ============================================================
    console.log('\n📍 STEP 3: Wait for React state to update (500ms)');
    console.log('-'.repeat(80));

    await page.waitForTimeout(500);
    console.log('   ✅ Waited 500ms');

    // ============================================================
    // STEP 4: Verify input values before submit
    // ============================================================
    console.log('\n📍 STEP 4: Verify input values before submit');
    console.log('-'.repeat(80));

    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    console.log(`   Email input value: "${emailValue}"`);
    console.log(`   Password input value: "${passwordValue}"`);
    console.log(`   Email matches expected: ${emailValue === 'admin@glec.io'}`);
    console.log(`   Password matches expected: ${passwordValue === 'admin123!'}`);

    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/diagnostic-02-before-submit.png', fullPage: true });
    console.log('   📸 Screenshot: diagnostic-02-before-submit.png');

    // ============================================================
    // STEP 5: Set up network request listener
    // ============================================================
    console.log('\n📍 STEP 5: Set up network request listener');
    console.log('-'.repeat(80));

    let capturedRequest: Request | null = null;
    let capturedResponse: Response | null = null;
    let requestBody: string | null = null;
    let responseBody: string | null = null;

    // Listen for the POST request
    page.on('request', async (request) => {
      if (request.url().includes('/api/admin/login') && request.method() === 'POST') {
        capturedRequest = request;
        try {
          const postData = request.postData();
          requestBody = postData || null;
          console.log('   📤 POST Request captured:');
          console.log(`      URL: ${request.url()}`);
          console.log(`      Method: ${request.method()}`);
          console.log(`      Headers:`, JSON.stringify(request.headers(), null, 2));
          console.log(`      Body: ${requestBody}`);
        } catch (error) {
          console.log('   ⚠️  Could not capture request body:', error);
        }
      }
    });

    // Listen for the response
    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/login') && response.request().method() === 'POST') {
        capturedResponse = response;
        try {
          const responseText = await response.text();
          responseBody = responseText;
          console.log('   📥 POST Response captured:');
          console.log(`      Status: ${response.status()} ${response.statusText()}`);
          console.log(`      Headers:`, JSON.stringify(response.headers(), null, 2));
          console.log(`      Body: ${responseBody}`);

          // Try to parse as JSON
          try {
            const jsonBody = JSON.parse(responseBody);
            console.log('   📋 Parsed JSON Response:');
            console.log(JSON.stringify(jsonBody, null, 2));
          } catch (parseError) {
            console.log('   ⚠️  Response is not valid JSON');
          }
        } catch (error) {
          console.log('   ⚠️  Could not capture response body:', error);
        }
      }
    });

    console.log('   ✅ Network listeners set up');

    // ============================================================
    // STEP 6: Click submit button
    // ============================================================
    console.log('\n📍 STEP 6: Click submit button');
    console.log('-'.repeat(80));

    const submitButton = page.locator('button[type="submit"]');
    const submitExists = await submitButton.count() > 0;
    console.log(`   Submit button found: ${submitExists}`);

    if (!submitExists) {
      throw new Error('Submit button not found!');
    }

    const buttonText = await submitButton.textContent();
    console.log(`   Button text: "${buttonText}"`);

    console.log('   🖱️  Clicking submit button...');
    await submitButton.click();
    console.log('   ✅ Button clicked');

    // ============================================================
    // STEP 7: Wait for POST response (up to 5 seconds)
    // ============================================================
    console.log('\n📍 STEP 7: Wait for POST response');
    console.log('-'.repeat(80));

    try {
      const response = await page.waitForResponse(
        (response) => response.url().includes('/api/admin/login') && response.request().method() === 'POST',
        { timeout: 5000 }
      );
      console.log(`   ✅ Response received: ${response.status()} ${response.statusText()}`);
    } catch (error) {
      console.log('   ❌ No response received within 5 seconds');
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Wait a bit for any client-side processing
    await page.waitForTimeout(1000);

    // ============================================================
    // STEP 8: Log full request/response details
    // ============================================================
    console.log('\n📍 STEP 8: Summary of captured network data');
    console.log('-'.repeat(80));

    if (capturedRequest) {
      console.log('   ✅ Request was captured');
      console.log(`      URL: ${capturedRequest.url()}`);
      console.log(`      Method: ${capturedRequest.method()}`);
      console.log(`      Request Body: ${requestBody || '(empty)'}`);
    } else {
      console.log('   ❌ Request was NOT captured');
    }

    if (capturedResponse) {
      console.log('   ✅ Response was captured');
      console.log(`      Status: ${capturedResponse.status()}`);
      console.log(`      Response Body: ${responseBody || '(empty)'}`);
    } else {
      console.log('   ❌ Response was NOT captured');
    }

    // ============================================================
    // STEP 9: Check localStorage for admin_token
    // ============================================================
    console.log('\n📍 STEP 9: Check localStorage for admin_token');
    console.log('-'.repeat(80));

    const adminToken = await page.evaluate(() => {
      return localStorage.getItem('admin_token');
    });

    console.log(`   admin_token in localStorage: ${adminToken ? `"${adminToken}"` : '(not found)'}`);

    if (adminToken) {
      console.log('   ✅ Token was stored');
    } else {
      console.log('   ❌ Token was NOT stored');
    }

    // ============================================================
    // STEP 10: Check current URL after 3 seconds
    // ============================================================
    console.log('\n📍 STEP 10: Check current URL after 3 seconds');
    console.log('-'.repeat(80));

    console.log('   ⏱️  Waiting 3 seconds...');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    console.log(`   Expected URL: ${baseUrl}/admin/notices (or /admin/dashboard)`);
    console.log(`   URL matches /admin/notices: ${currentUrl.includes('/admin/notices')}`);
    console.log(`   URL matches /admin/dashboard: ${currentUrl.includes('/admin/dashboard')}`);
    console.log(`   Still on login page: ${currentUrl.includes('/admin/login')}`);

    if (currentUrl.includes('/admin/login')) {
      console.log('   ❌ REDIRECT FAILED - Still on login page!');
    } else if (currentUrl.includes('/admin/')) {
      console.log('   ✅ REDIRECT SUCCESS - Now on admin page');
    } else {
      console.log('   ⚠️  UNEXPECTED - Redirected to unknown page');
    }

    // ============================================================
    // STEP 11: Take screenshot of final state
    // ============================================================
    console.log('\n📍 STEP 11: Take screenshot of final state');
    console.log('-'.repeat(80));

    await page.screenshot({ path: 'test-results/diagnostic-03-final-state.png', fullPage: true });
    console.log('   📸 Screenshot: diagnostic-03-final-state.png');

    // ============================================================
    // FINAL SUMMARY
    // ============================================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Page loaded: YES`);
    console.log(`✅ Form inputs found: YES`);
    console.log(`✅ Email entered: ${emailValue === 'admin@glec.io' ? 'YES' : 'NO'}`);
    console.log(`✅ Password entered: ${passwordValue === 'admin123!' ? 'YES' : 'NO'}`);
    console.log(`✅ Submit button clicked: YES`);
    console.log(`${capturedRequest ? '✅' : '❌'} POST request captured: ${capturedRequest ? 'YES' : 'NO'}`);
    console.log(`${capturedResponse ? '✅' : '❌'} POST response captured: ${capturedResponse ? 'YES' : 'NO'}`);
    console.log(`${capturedResponse?.status() === 200 ? '✅' : '❌'} Response status 200: ${capturedResponse?.status() === 200 ? 'YES' : 'NO'}`);
    console.log(`${adminToken ? '✅' : '❌'} Token stored in localStorage: ${adminToken ? 'YES' : 'NO'}`);
    console.log(`${!currentUrl.includes('/admin/login') ? '✅' : '❌'} Redirect successful: ${!currentUrl.includes('/admin/login') ? 'YES' : 'NO'}`);
    console.log('='.repeat(80));

    // ============================================================
    // ASSERTIONS (intentionally lenient for diagnostic purposes)
    // ============================================================
    console.log('\n📍 Running assertions...');
    console.log('-'.repeat(80));

    // These are intentionally soft checks for diagnostic purposes
    // In a real test, you'd use expect() to fail on any issue

    if (!capturedRequest) {
      console.log('⚠️  WARNING: POST request was not captured');
    }

    if (!capturedResponse) {
      console.log('⚠️  WARNING: POST response was not captured');
    }

    if (!adminToken) {
      console.log('⚠️  WARNING: admin_token was not stored in localStorage');
    }

    if (currentUrl.includes('/admin/login')) {
      console.log('⚠️  WARNING: Page did not redirect from login page');
    }

    // Final assertion: At least verify we got a response
    expect(capturedResponse).toBeTruthy();
    expect(capturedResponse?.status()).toBe(200);

    console.log('✅ Diagnostic test completed');
    console.log('='.repeat(80) + '\n');
  });
});
