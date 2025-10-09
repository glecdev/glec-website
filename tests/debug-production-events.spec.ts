import { test, expect } from '@playwright/test';

test.describe('Production Events API Debug', () => {
  test('should test Events page with authentication', async ({ page }) => {
    // Enable console logging
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('Error') || msg.text().includes('[GET /api/admin/events]')) {
        console.log(`🔍 Console ${msg.type()}: ${msg.text()}`);
      }
    });

    // Capture network responses
    page.on('response', async (response) => {
      if (response.url().includes('/api/admin/events')) {
        console.log(`\n📡 API Response: ${response.url()}`);
        console.log(`Status: ${response.status()}`);

        try {
          const body = await response.json();
          console.log('Response Body:', JSON.stringify(body, null, 2));
        } catch (e) {
          console.log('Response (text):', await response.text().catch(() => 'Failed to read'));
        }
      }
    });

    // Step 1: Login
    console.log('\n🔐 Logging in...');
    await page.goto('https://glec-website.vercel.app/admin/login');
    await page.fill('input[type="email"]', 'admin@glec.io');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/(dashboard|demo-requests)/, { timeout: 15000 });
    console.log('✅ Logged in successfully');

    // Step 2: Navigate to Events page
    console.log('\n📄 Navigating to Events page...');
    await page.goto('https://glec-website.vercel.app/admin/events');

    // Wait for API call to complete
    await page.waitForTimeout(5000);

    // Step 3: Check for error message
    const bodyText = await page.textContent('body');
    const hasError = bodyText?.includes('An unexpected error occurred');

    console.log('\n📊 Results:');
    console.log('Has "An unexpected error occurred":', hasError);

    // Take screenshot
    await page.screenshot({ path: 'test-results/production-events-debug.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/production-events-debug.png');

    if (hasError) {
      console.log('\n❌ Events page still showing error');
    } else {
      console.log('\n✅ Events page loaded successfully!');
    }
  });
});
