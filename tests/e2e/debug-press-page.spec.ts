/**
 * Press Page Network Debug Test
 *
 * Purpose: Press 페이지 네트워크 타임아웃 원인 분석
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Press Page Network Debug', () => {
  test('should analyze network requests and identify timeout cause', async ({ page }) => {
    const requests: string[] = [];
    const responses: Array<{ url: string; status: number; timing: number }> = [];
    const pendingRequests: string[] = [];

    // Track all network requests
    page.on('request', (request) => {
      const url = request.url();
      requests.push(url);
      pendingRequests.push(url);
      console.log('[REQUEST]', url);
    });

    // Track all responses
    page.on('response', (response) => {
      const url = response.url();
      const index = pendingRequests.indexOf(url);
      if (index > -1) {
        pendingRequests.splice(index, 1);
      }

      responses.push({
        url,
        status: response.status(),
        timing: 0, // timing 메서드 제거
      });
      console.log('[RESPONSE]', response.status(), url);
    });

    // Track failed requests
    page.on('requestfailed', (request) => {
      console.error('[REQUEST FAILED]', request.url(), request.failure()?.errorText);
    });

    console.log('\n=== Starting Press Page Load ===\n');

    // Navigate to Press page
    await page.goto(`${BASE_URL}/knowledge/press`);

    // Wait a bit to see what's happening
    await page.waitForTimeout(2000);

    console.log('\n=== After 2 seconds ===');
    console.log('Pending requests:', pendingRequests.length);
    console.log('Pending URLs:', pendingRequests);

    // Check if page is still loading
    const isLoading = await page.locator('.animate-pulse').isVisible().catch(() => false);
    console.log('Is loading state visible:', isLoading);

    // Check if error state
    const hasError = await page.locator('.text-red-500').isVisible().catch(() => false);
    console.log('Has error state:', hasError);

    // Try to wait for network idle with timeout
    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      console.log('\n✅ Network reached idle state');
    } catch (e) {
      console.log('\n❌ Network did NOT reach idle state after 5s');
      console.log('Still pending requests:', pendingRequests);
    }

    // Check API response
    const apiResponse = responses.find(r => r.url.includes('/api/notices'));
    if (apiResponse) {
      console.log('\n=== API Response Found ===');
      console.log('URL:', apiResponse.url);
      console.log('Status:', apiResponse.status);
      console.log('Timing:', apiResponse.timing, 'ms');
    } else {
      console.log('\n❌ No API response found for /api/notices');
    }

    // Final report
    console.log('\n=== Final Report ===');
    console.log('Total requests:', requests.length);
    console.log('Total responses:', responses.length);
    console.log('Pending requests:', pendingRequests.length);

    // Take screenshot for visual debugging
    await page.screenshot({ path: 'test-results/press-debug.png', fullPage: true });
    console.log('Screenshot saved: test-results/press-debug.png');
  });

  test('should test API endpoint directly', async ({ request }) => {
    console.log('\n=== Testing /api/notices?category=PRESS directly ===\n');

    const response = await request.get(`${BASE_URL}/api/notices?category=PRESS&per_page=20`);

    console.log('Status:', response.status());
    console.log('Headers:', await response.headers());

    const body = await response.text();
    console.log('Body length:', body.length);
    console.log('Body preview:', body.substring(0, 200));

    try {
      const json = JSON.parse(body);
      console.log('JSON success:', json.success);
      console.log('Data length:', json.data?.length);
      console.log('Meta:', json.meta);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
    }
  });
});
