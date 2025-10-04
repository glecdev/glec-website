import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

test.describe('Admin Login Diagnostic', () => {
  test('Diagnose login flow and infinite loading', async ({ page }) => {
    console.log('=== Starting Login Diagnostic ===\n');

    // Track all network requests
    const requests: string[] = [];
    const responses: Array<{ url: string; status: number }> = [];
    const consoleMessages: Array<{ type: string; text: string }> = [];

    page.on('request', (request) => {
      requests.push(`${request.method()} ${request.url()}`);
    });

    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      });
    });

    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/admin/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    console.log(`  ✓ Current URL: ${page.url()}\n`);

    // Step 2: Check page state
    console.log('Step 2: Checking page state...');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    const emailCount = await emailInput.count();
    const passwordCount = await passwordInput.count();
    const buttonCount = await submitButton.count();

    console.log(`  Email inputs found: ${emailCount}`);
    console.log(`  Password inputs found: ${passwordCount}`);
    console.log(`  Submit buttons found: ${buttonCount}\n`);

    // Step 3: Fill form (using type to trigger onChange)
    console.log('Step 3: Filling form...');
    await emailInput.click();
    await emailInput.type('admin@glec.io');
    await passwordInput.click();
    await passwordInput.type('admin123!');
    console.log('  ✓ Form filled\n');

    // Step 4: Check button state before click
    console.log('Step 4: Checking button state...');
    const buttonText = await submitButton.textContent();
    const buttonDisabled = await submitButton.isDisabled();
    console.log(`  Button text: "${buttonText}"`);
    console.log(`  Button disabled: ${buttonDisabled}\n`);

    // Step 5: Click submit and monitor what happens
    console.log('Step 5: Clicking submit button...');
    const requestsBeforeClick = requests.length;

    await submitButton.click();

    // Wait a bit to see what happens
    await page.waitForTimeout(2000);

    const requestsAfterClick = requests.length;
    console.log(`  New requests: ${requestsAfterClick - requestsBeforeClick}\n`);

    // Step 6: Check current state
    console.log('Step 6: Checking state after click...');
    const currentURL = page.url();
    const newButtonText = await submitButton.textContent();
    const newButtonDisabled = await submitButton.isDisabled();

    console.log(`  Current URL: ${currentURL}`);
    console.log(`  Button text: "${newButtonText}"`);
    console.log(`  Button disabled: ${newButtonDisabled}\n`);

    // Step 7: Check for errors
    console.log('Step 7: Checking for errors...');
    const errorElements = await page.locator('[role="alert"]').all();
    console.log(`  Alert elements found: ${errorElements.length}`);

    for (let i = 0; i < errorElements.length; i++) {
      const errorText = await errorElements[i].textContent();
      console.log(`  Alert ${i + 1}: "${errorText}"`);
    }
    console.log();

    // Step 8: Print network activity
    console.log('Step 8: Network Activity Summary');
    console.log(`  Total requests: ${requests.length}`);
    console.log(`  Recent requests (last 10):`);
    requests.slice(-10).forEach((req) => console.log(`    ${req}`));
    console.log();

    console.log('  Failed responses:');
    const failedResponses = responses.filter((r) => r.status >= 400);
    if (failedResponses.length === 0) {
      console.log('    None');
    } else {
      failedResponses.forEach((r) =>
        console.log(`    ${r.status} - ${r.url}`)
      );
    }
    console.log();

    // Step 9: Print console messages
    console.log('Step 9: Console Messages');
    console.log(`  Total messages: ${consoleMessages.length}`);
    const errors = consoleMessages.filter((m) => m.type === 'error');
    const warnings = consoleMessages.filter((m) => m.type === 'warning');

    if (errors.length > 0) {
      console.log('  Errors:');
      errors.forEach((e) => console.log(`    ${e.text}`));
    }

    if (warnings.length > 0) {
      console.log('  Warnings:');
      warnings.forEach((w) => console.log(`    ${w.text}`));
    }
    console.log();

    // Step 10: Wait longer to see if navigation happens
    console.log('Step 10: Waiting 10 seconds to see if navigation happens...');
    try {
      await page.waitForURL(`${BASE_URL}/admin/dashboard`, {
        timeout: 10000,
        waitUntil: 'domcontentloaded',
      });
      console.log('  ✓ Successfully navigated to dashboard!\n');
    } catch (error) {
      console.log('  ✗ Did NOT navigate to dashboard\n');

      // Take screenshot of stuck state
      await page.screenshot({
        path: 'tests/e2e/admin/screenshots/login-stuck-state.png',
        fullPage: true,
      });
      console.log('  Screenshot saved to: login-stuck-state.png\n');
    }

    // Final summary
    console.log('=== Diagnostic Summary ===');
    console.log(`Final URL: ${page.url()}`);
    console.log(
      `Login Success: ${page.url().includes('/admin/dashboard') ? 'YES' : 'NO'}`
    );
    console.log(`Total Network Requests: ${requests.length}`);
    console.log(`Failed Requests: ${failedResponses.length}`);
    console.log(`Console Errors: ${errors.length}`);
    console.log('========================\n');

    // This test always passes - it's just diagnostic
    expect(true).toBe(true);
  });
});
