/**
 * Simple Performance Measurement
 * Based on: CLAUDE.md Step 6 Phase 2
 *
 * Measures:
 * - Page load time
 * - Time to Interactive (TTI)
 * - Response times
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

test.describe('Performance Measurement', () => {
  test('Homepage Load Performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    console.log(`📊 Homepage Load Time: ${loadTime}ms`);

    // Assert load time < 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Admin Login Page Load Performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    console.log(`📊 Admin Login Load Time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(3000);
  });

  test('API Response Times', async ({ page }) => {
    // Test Login API
    const loginStart = Date.now();

    const loginResponse = await page.request.post(`${BASE_URL}/api/admin/login`, {
      data: {
        email: 'admin@glec.io',
        password: 'admin123!'
      }
    });

    const loginTime = Date.now() - loginStart;
    console.log(`📊 Login API Response Time: ${loginTime}ms`);

    expect(loginResponse.status()).toBe(200);
    expect(loginTime).toBeLessThan(500);

    const data = await loginResponse.json();
    const token = data.data.token;

    // Test Notices GET API (if exists)
    const noticesStart = Date.now();

    const noticesResponse = await page.request.get(`${BASE_URL}/api/admin/notices`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const noticesTime = Date.now() - noticesStart;
    console.log(`📊 Notices API Response Time: ${noticesTime}ms`);

    // Expect 200 or 404 (GET endpoint may not exist yet)
    if (noticesResponse.status() === 200) {
      expect(noticesTime).toBeLessThan(500);
    }
  });

  test('Check Image Optimization', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for images without width/height
    const unoptimizedImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img =>
        !img.hasAttribute('width') || !img.hasAttribute('height')
      ).map(img => img.src);
    });

    console.log(`📊 Unoptimized Images: ${unoptimizedImages.length}`);

    if (unoptimizedImages.length > 0) {
      console.log('⚠️  Images missing width/height:', unoptimizedImages);
    }
  });

  test('Check for Render-Blocking Resources', async ({ page }) => {
    const resourceSizes: Record<string, number[]> = {
      script: [],
      stylesheet: [],
      font: []
    };

    page.on('response', async (response) => {
      const url = response.url();
      const size = parseInt(response.headers()['content-length'] || '0', 10);

      if (url.endsWith('.js')) {
        resourceSizes.script.push(size);
      } else if (url.endsWith('.css')) {
        resourceSizes.stylesheet.push(size);
      } else if (url.match(/\.(woff2?|ttf|otf)$/)) {
        resourceSizes.font.push(size);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const totalJS = resourceSizes.script.reduce((a, b) => a + b, 0);
    const totalCSS = resourceSizes.stylesheet.reduce((a, b) => a + b, 0);
    const totalFonts = resourceSizes.font.reduce((a, b) => a + b, 0);

    console.log(`📊 JavaScript: ${(totalJS / 1024).toFixed(2)} KB`);
    console.log(`📊 CSS: ${(totalCSS / 1024).toFixed(2)} KB`);
    console.log(`📊 Fonts: ${(totalFonts / 1024).toFixed(2)} KB`);

    // Warn if JS bundle is too large
    if (totalJS > 500 * 1024) {
      console.log(`⚠️  JavaScript bundle is large: ${(totalJS / 1024).toFixed(2)} KB`);
    }
  });
});
