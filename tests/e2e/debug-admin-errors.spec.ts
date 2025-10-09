/**
 * Debug Admin Pages Errors
 *
 * Purpose: Capture screenshots and console errors from production admin pages
 * Target: Notices, Events, Press pages
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123';

test.describe('Admin Pages Error Debugging', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/(dashboard|demo-requests)/, { timeout: 15000 });
  });

  test('1. Notices Page - Debug', async ({ page }) => {
    const errors: string[] = [];
    const apiErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Capture network errors
    page.on('response', (response) => {
      if (response.status() >= 400) {
        apiErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${BASE_URL}/admin/notices`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/notices-page-error.png', fullPage: true });

    // Check for error text
    const bodyText = await page.textContent('body');
    const hasError = bodyText?.includes('An unexpected error occurred') ||
                     bodyText?.includes('Error') ||
                     bodyText?.includes('에러');

    console.log('=== NOTICES PAGE DEBUG ===');
    console.log('Has Error Message:', hasError);
    console.log('Console Errors:', errors);
    console.log('API Errors:', apiErrors);
    console.log('Page URL:', page.url());

    // Save error info
    if (errors.length > 0 || apiErrors.length > 0 || hasError) {
      console.log('⚠️ ERRORS FOUND ON NOTICES PAGE');
    }
  });

  test('2. Events Page - Debug', async ({ page }) => {
    const errors: string[] = [];
    const apiErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        apiErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${BASE_URL}/admin/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/events-page-error.png', fullPage: true });

    const bodyText = await page.textContent('body');
    const hasError = bodyText?.includes('An unexpected error occurred') ||
                     bodyText?.includes('Error') ||
                     bodyText?.includes('에러');

    console.log('=== EVENTS PAGE DEBUG ===');
    console.log('Has Error Message:', hasError);
    console.log('Console Errors:', errors);
    console.log('API Errors:', apiErrors);
    console.log('Page URL:', page.url());

    if (errors.length > 0 || apiErrors.length > 0 || hasError) {
      console.log('⚠️ ERRORS FOUND ON EVENTS PAGE');
    }
  });

  test('3. Press Page - Debug', async ({ page }) => {
    const errors: string[] = [];
    const apiErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        apiErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${BASE_URL}/admin/press`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/press-page-error.png', fullPage: true });

    const bodyText = await page.textContent('body');
    const hasError = bodyText?.includes('An unexpected error occurred') ||
                     bodyText?.includes('Error') ||
                     bodyText?.includes('에러');

    console.log('=== PRESS PAGE DEBUG ===');
    console.log('Has Error Message:', hasError);
    console.log('Console Errors:', errors);
    console.log('API Errors:', apiErrors);
    console.log('Page URL:', page.url());

    if (errors.length > 0 || apiErrors.length > 0 || hasError) {
      console.log('⚠️ ERRORS FOUND ON PRESS PAGE');
    }
  });

  test('4. API Endpoints - Direct Test', async ({ page, request }) => {
    // Get token from localStorage
    await page.goto(`${BASE_URL}/admin/dashboard`);
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));

    console.log('=== API ENDPOINTS TEST ===');
    console.log('Token exists:', !!token);

    // Test Notices API
    const noticesResponse = await request.get(`${BASE_URL}/api/admin/notices?page=1&per_page=20`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Notices API Status:', noticesResponse.status());
    if (noticesResponse.status() >= 400) {
      const body = await noticesResponse.text();
      console.log('Notices API Error:', body);
    }

    // Test Events API
    const eventsResponse = await request.get(`${BASE_URL}/api/admin/events?page=1&per_page=20`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Events API Status:', eventsResponse.status());
    if (eventsResponse.status() >= 400) {
      const body = await eventsResponse.text();
      console.log('Events API Error:', body);
    }

    // Test Press API
    const pressResponse = await request.get(`${BASE_URL}/api/admin/press?page=1&per_page=20`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Press API Status:', pressResponse.status());
    if (pressResponse.status() >= 400) {
      const body = await pressResponse.text();
      console.log('Press API Error:', body);
    }
  });
});
