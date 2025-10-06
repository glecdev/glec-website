import { test, expect } from '@playwright/test';

test.describe('Knowledge Center Pages - Error Detection', () => {
  test('should load videos page without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Navigate to videos page
    await page.goto('http://localhost:3000/knowledge/videos');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for error message on page
    const errorText = await page.locator('body').textContent();
    
    console.log('=== VIDEOS PAGE STATUS ===');
    console.log('URL:', page.url());
    console.log('Errors found:', errors.length);
    if (errors.length > 0) {
      console.log('Error messages:', errors);
    }
    console.log('Page contains "error":', errorText?.toLowerCase().includes('error'));
    console.log('Page contains "exception":', errorText?.toLowerCase().includes('exception'));
    
    // Take screenshot
    await page.screenshot({ path: 'videos-page-error.png', fullPage: true });
  });

  test('should load blog page without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:3000/knowledge/blog');
    await page.waitForLoadState('networkidle');

    const errorText = await page.locator('body').textContent();
    
    console.log('=== BLOG PAGE STATUS ===');
    console.log('URL:', page.url());
    console.log('Errors found:', errors.length);
    if (errors.length > 0) {
      console.log('Error messages:', errors);
    }
    console.log('Page contains "error":', errorText?.toLowerCase().includes('error'));
    console.log('Page contains "exception":', errorText?.toLowerCase().includes('exception'));
    
    await page.screenshot({ path: 'blog-page-error.png', fullPage: true });
  });
});
