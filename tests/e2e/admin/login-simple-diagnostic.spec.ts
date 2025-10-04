import { test, expect } from '@playwright/test';

test.describe('Admin Login - Simple Diagnostic', () => {
  test('should capture network traffic and console logs', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3006';

    // Collect all console messages
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(text);
      console.log('   BROWSER:', text);
    });

    // Collect page errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      const errorText = `${error.message}\n${error.stack}`;
      pageErrors.push(errorText);
      console.log('   ❌ PAGE ERROR:', errorText);
    });

    // Collect all network requests
    const requests: Array<{ url: string; method: string; postData?: string }> = [];
    page.on('request', (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData() || undefined,
      });
      if (request.url().includes('/api/')) {
        console.log(`   📤 REQUEST: ${request.method()} ${request.url()}`);
        if (request.postData()) {
          console.log(`   📦 BODY: ${request.postData()}`);
        }
      }
    });

    // Collect all network responses
    const responses: Array<{ url: string; status: number }> = [];
    const failedResources: Array<{ url: string; status: number }> = [];
    page.on('response', async (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      });
      if (response.status() === 404) {
        failedResources.push({
          url: response.url(),
          status: response.status(),
        });
        console.log(`   ❌ 404: ${response.url()}`);
      }
      if (response.url().includes('/api/')) {
        console.log(`   📥 RESPONSE: ${response.status()} ${response.url()}`);
        try {
          const body = await response.text();
          console.log(`   📦 BODY: ${body}`);
        } catch (e) {
          // Ignore
        }
      }
    });

    console.log('\n🔍 Starting Simple Diagnostic Test');
    console.log('='.repeat(80));

    // Navigate to login page
    console.log('\n1️⃣ Navigate to login page');
    await page.goto(`${baseUrl}/admin/login`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');

    // Check form elements
    console.log('\n2️⃣ Check form elements');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    expect(await emailInput.count()).toBe(1);
    expect(await passwordInput.count()).toBe(1);
    expect(await submitButton.count()).toBe(1);
    console.log('✅ All form elements found');

    // Fill form
    console.log('\n3️⃣ Fill form');
    await emailInput.fill('admin@glec.io');
    await passwordInput.fill('admin123!');
    console.log('✅ Form filled');

    // Wait for React to update
    await page.waitForTimeout(500);

    // Verify values
    console.log('\n4️⃣ Verify input values');
    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();
    console.log(`   Email: "${emailValue}"`);
    console.log(`   Password: "${passwordValue}"`);
    expect(emailValue).toBe('admin@glec.io');
    expect(passwordValue).toBe('admin123!');
    console.log('✅ Values correct');

    // Check if button is enabled
    console.log('\n5️⃣ Check submit button state');
    const isDisabled = await submitButton.isDisabled();
    console.log(`   Button disabled: ${isDisabled}`);
    expect(isDisabled).toBe(false);
    console.log('✅ Button is enabled');

    // Check if form has onsubmit handler
    console.log('\n5.5️⃣ Check if form has event listener');
    const formInfo = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return { exists: false };

      return {
        exists: true,
        hasOnSubmit: typeof form.onsubmit === 'function',
        action: form.action,
        method: form.method,
        // Try to get React props (if accessible)
        hasReactProps: '__reactProps' in form || '__reactInternalInstance' in form,
      };
    });
    console.log(`   Form exists: ${formInfo.exists}`);
    console.log(`   Form.onsubmit: ${formInfo.hasOnSubmit}`);
    console.log(`   Form.action: ${formInfo.action}`);
    console.log(`   Form.method: ${formInfo.method}`);
    console.log(`   Has React props: ${formInfo.hasReactProps}`);

    // Set up promise to wait for navigation or response
    console.log('\n6️⃣ Click submit and wait for response');
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/admin/login'),
      { timeout: 10000 }
    ).catch((err) => {
      console.log('❌ No API response within 10 seconds');
      return null;
    });

    // Click submit
    await submitButton.click();
    console.log('✅ Button clicked');

    // Wait for response
    const response = await responsePromise;

    if (response) {
      console.log(`✅ Got response: ${response.status()}`);
      const body = await response.text();
      console.log(`   Response body: ${body}`);
    } else {
      console.log('❌ No API response captured');
    }

    // Wait for any navigation
    await page.waitForTimeout(3000);

    // Final state
    console.log('\n7️⃣ Final state');
    const finalUrl = page.url();
    console.log(`   Current URL: ${finalUrl}`);
    console.log(`   Still on login: ${finalUrl.includes('/admin/login')}`);

    // Check localStorage
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    console.log(`   Token in localStorage: ${token ? 'YES' : 'NO'}`);

    // Summary
    console.log('\n📊 Summary');
    console.log('='.repeat(80));
    console.log(`Total console logs: ${consoleLogs.length}`);
    console.log(`Total page errors: ${pageErrors.length}`);
    console.log(`Total requests: ${requests.length}`);
    console.log(`Total responses: ${responses.length}`);
    console.log(`Failed resources (404): ${failedResources.length}`);
    console.log(`API login requests: ${requests.filter((r) => r.url.includes('/api/admin/login')).length}`);
    console.log(`API login responses: ${responses.filter((r) => r.url.includes('/api/admin/login')).length}`);
    console.log(`Token stored: ${token ? 'YES' : 'NO'}`);
    console.log(`Redirected: ${!finalUrl.includes('/admin/login') ? 'YES' : 'NO'}`);

    // List page errors first (most important)
    if (pageErrors.length > 0) {
      console.log('\n❌ Page Errors:');
      pageErrors.forEach((error) => console.log(`   ${error}`));
    }

    // List all console logs
    if (consoleLogs.length > 0) {
      console.log('\n📝 Browser Console Logs:');
      consoleLogs.forEach((log) => console.log(`   ${log}`));
    }

    // List failed resources
    if (failedResources.length > 0) {
      console.log('\n❌ Failed Resources (404):');
      failedResources.forEach((res) => {
        console.log(`   ${res.status} ${res.url}`);
      });
    }

    // List all API requests
    const apiRequests = requests.filter((r) => r.url.includes('/api/'));
    if (apiRequests.length > 0) {
      console.log('\n📡 API Requests:');
      apiRequests.forEach((req) => {
        console.log(`   ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`   Body: ${req.postData}`);
        }
      });
    } else {
      console.log('\n⚠️  NO API REQUESTS CAPTURED!');
    }

    console.log('\n' + '='.repeat(80));
  });
});
