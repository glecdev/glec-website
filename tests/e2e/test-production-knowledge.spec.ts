import { test, expect } from '@playwright/test';

test.describe('Production Knowledge Pages - Full Test', () => {
  test('should display videos page correctly', async ({ page }) => {
    const consoleMessages: Array<{type: string, text: string}> = [];
    const pageErrors: string[] = [];
    const failedRequests: Array<{url: string, status: number}> = [];

    // Capture ALL console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    // Capture page errors (unhandled exceptions)
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Capture failed network requests
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('https://glec-website.vercel.app/knowledge/videos');
    await page.waitForLoadState('networkidle');

    // Log all diagnostic information
    console.log('\n=== VIDEOS PAGE DIAGNOSTICS ===');
    console.log('Page URL:', page.url());
    console.log('\nConsole Messages:', JSON.stringify(consoleMessages, null, 2));
    console.log('\nPage Errors:', JSON.stringify(pageErrors, null, 2));
    console.log('\nFailed Requests:', JSON.stringify(failedRequests, null, 2));

    // Check page content
    const bodyText = await page.locator('body').textContent();
    console.log('\nPage contains "Application error":', bodyText?.includes('Application error'));
    console.log('Page contains "영상자료":', bodyText?.includes('영상자료'));

    // Try to find elements
    const h1Count = await page.locator('h1').count();
    console.log('\nH1 elements found:', h1Count);

    if (h1Count > 0) {
      const heroTitle = await page.locator('h1').first().textContent();
      console.log('First H1 text:', heroTitle);
    }

    const categoryButtons = await page.locator('button:has-text("전체")').count();
    console.log('Category buttons found:', categoryButtons);

    // Take screenshot
    await page.screenshot({ path: 'production-videos.png', fullPage: true });

    // Assertions
    expect(pageErrors.length, `Page errors found: ${JSON.stringify(pageErrors)}`).toBe(0);
    expect(consoleMessages.filter(m => m.type === 'error').length, 'Console errors found').toBe(0);
  });

  test('should display blog page correctly', async ({ page }) => {
    const consoleMessages: Array<{type: string, text: string}> = [];
    const pageErrors: string[] = [];
    const failedRequests: Array<{url: string, status: number}> = [];

    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto('https://glec-website.vercel.app/knowledge/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n=== BLOG PAGE DIAGNOSTICS ===');
    console.log('Page URL:', page.url());
    console.log('\nConsole Messages:', JSON.stringify(consoleMessages, null, 2));
    console.log('\nPage Errors:', JSON.stringify(pageErrors, null, 2));
    console.log('\nFailed Requests:', JSON.stringify(failedRequests, null, 2));

    const bodyText = await page.locator('body').textContent();
    console.log('\nPage contains "Application error":', bodyText?.includes('Application error'));
    console.log('Page contains "블로그":', bodyText?.includes('블로그'));

    const h1Count = await page.locator('h1').count();
    console.log('\nH1 elements found:', h1Count);

    if (h1Count > 0) {
      const heroTitle = await page.locator('h1').first().textContent();
      console.log('First H1 text:', heroTitle);
    }

    await page.screenshot({ path: 'production-blog.png', fullPage: true });

    expect(pageErrors.length, `Page errors found: ${JSON.stringify(pageErrors)}`).toBe(0);
    expect(consoleMessages.filter(m => m.type === 'error').length, 'Console errors found').toBe(0);
  });
});
