/**
 * Iteration 6 E2E Test: Admin PUT/DELETE Endpoints
 *
 * Purpose: Verify PUT/DELETE operations work correctly in real browser environment
 * Based on: CLAUDE.md Step 6 Phase 1 - MCP E2E Testing
 *
 * Test Scenarios:
 * 1. Login to Admin Portal
 * 2. Create → Edit → Verify (PUT)
 * 3. Delete → Verify (DELETE)
 * 4. Test all 4 Admin APIs (Notices, Press, Popups, Events)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!@#';

test.describe('Iteration 6: Admin PUT/DELETE E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login to Admin Portal
    await page.goto(`${BASE_URL}/admin/login`);

    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 10000 });
  });

  test('Notices: Create → Edit (PUT) → Delete', async ({ page }) => {
    // Navigate to Notices
    await page.goto(`${BASE_URL}/admin/notices`);
    await page.waitForLoadState('networkidle');

    // 1. Create new notice
    await page.click('button:has-text("새 공지사항")');
    await page.waitForSelector('form', { timeout: 5000 });

    await page.fill('input[name="title"]', 'E2E Test Notice - PUT/DELETE');
    await page.fill('textarea[name="content"]', '<p>Original content for E2E test</p>');
    await page.selectOption('select[name="category"]', 'GENERAL');
    await page.selectOption('select[name="status"]', 'DRAFT');

    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000); // Wait for creation

    // Verify notice appears in list
    const noticeRow = page.locator('tr:has-text("E2E Test Notice - PUT/DELETE")').first();
    await expect(noticeRow).toBeVisible();

    // 2. Edit notice (PUT)
    await noticeRow.click();
    await page.waitForTimeout(1000);

    // Click Edit button
    await page.click('button:has-text("수정")');
    await page.waitForSelector('form');

    // Update fields
    await page.fill('input[name="title"]', 'E2E Test Notice - UPDATED via PUT');
    await page.selectOption('select[name="status"]', 'PUBLISHED');

    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // Verify update
    await page.reload();
    await expect(page.locator('text=E2E Test Notice - UPDATED via PUT')).toBeVisible();
    await expect(page.locator('text=PUBLISHED')).toBeVisible();

    // 3. Delete notice (DELETE)
    const updatedRow = page.locator('tr:has-text("E2E Test Notice - UPDATED via PUT")').first();
    await updatedRow.click();
    await page.waitForTimeout(1000);

    await page.click('button:has-text("삭제")');

    // Confirm delete dialog
    await page.click('button:has-text("확인")');
    await page.waitForTimeout(2000);

    // Verify deletion
    await page.reload();
    await expect(page.locator('text=E2E Test Notice - UPDATED via PUT')).not.toBeVisible();
  });

  test('Press: Create → Edit (PUT) → Delete', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/press`);
    await page.waitForLoadState('networkidle');

    // 1. Create
    await page.click('button:has-text("새 보도자료")');
    await page.waitForSelector('form');

    await page.fill('input[name="title"]', 'E2E Test Press - PUT/DELETE');
    await page.fill('textarea[name="content"]', '<p>Press release content</p>');
    await page.selectOption('select[name="status"]', 'DRAFT');

    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // 2. Edit (PUT)
    const pressRow = page.locator('tr:has-text("E2E Test Press - PUT/DELETE")').first();
    await pressRow.click();
    await page.click('button:has-text("수정")');

    await page.fill('input[name="title"]', 'E2E Test Press - UPDATED');
    await page.fill('input[name="mediaOutlet"]', 'TechCrunch');
    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // Verify
    await page.reload();
    await expect(page.locator('text=E2E Test Press - UPDATED')).toBeVisible();
    await expect(page.locator('text=TechCrunch')).toBeVisible();

    // 3. Delete
    const updatedRow = page.locator('tr:has-text("E2E Test Press - UPDATED")').first();
    await updatedRow.click();
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
    await page.waitForTimeout(2000);

    await page.reload();
    await expect(page.locator('text=E2E Test Press - UPDATED')).not.toBeVisible();
  });

  test('Popups: Create → Edit (PUT) → Delete', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/popups`);
    await page.waitForLoadState('networkidle');

    // 1. Create
    await page.click('button:has-text("새 팝업")');
    await page.waitForSelector('form');

    await page.fill('input[name="title"]', 'E2E Test Popup - PUT/DELETE');
    await page.fill('textarea[name="content"]', '<p>Popup content</p>');
    await page.selectOption('select[name="displayType"]', 'modal');
    await page.check('input[name="isActive"]'); // Set to active

    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // 2. Edit (PUT)
    const popupRow = page.locator('tr:has-text("E2E Test Popup - PUT/DELETE")').first();
    await popupRow.click();
    await page.click('button:has-text("수정")');

    await page.fill('input[name="title"]', 'E2E Test Popup - UPDATED');
    await page.uncheck('input[name="isActive"]'); // Toggle to inactive
    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // Verify
    await page.reload();
    await expect(page.locator('text=E2E Test Popup - UPDATED')).toBeVisible();
    // Verify isActive = false (inactive badge)
    const row = page.locator('tr:has-text("E2E Test Popup - UPDATED")');
    await expect(row.locator('text=비활성')).toBeVisible();

    // 3. Delete
    await row.click();
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
    await page.waitForTimeout(2000);

    await page.reload();
    await expect(page.locator('text=E2E Test Popup - UPDATED')).not.toBeVisible();
  });

  test('Events: Create → Edit (PUT) → Delete', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/events`);
    await page.waitForLoadState('networkidle');

    // 1. Create
    await page.click('button:has-text("새 이벤트")');
    await page.waitForSelector('form');

    await page.fill('input[name="title"]', 'E2E Test Event - PUT/DELETE');
    await page.fill('textarea[name="description"]', 'Event description');
    await page.fill('input[name="location"]', 'Seoul, Korea');

    // Set dates (7 days from now)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 8);

    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);
    await page.selectOption('select[name="status"]', 'DRAFT');

    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // 2. Edit (PUT)
    const eventRow = page.locator('tr:has-text("E2E Test Event - PUT/DELETE")').first();
    await eventRow.click();
    await page.click('button:has-text("수정")');

    await page.fill('input[name="title"]', 'E2E Test Event - UPDATED');
    await page.fill('input[name="maxParticipants"]', '100');
    await page.selectOption('select[name="status"]', 'PUBLISHED');
    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // Verify
    await page.reload();
    await expect(page.locator('text=E2E Test Event - UPDATED')).toBeVisible();
    await expect(page.locator('text=100')).toBeVisible(); // Max participants
    await expect(page.locator('text=PUBLISHED')).toBeVisible();

    // 3. Delete
    const updatedRow = page.locator('tr:has-text("E2E Test Event - UPDATED")').first();
    await updatedRow.click();
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
    await page.waitForTimeout(2000);

    await page.reload();
    await expect(page.locator('text=E2E Test Event - UPDATED')).not.toBeVisible();
  });

  test('API Response Time: PUT/DELETE should be < 1s', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/notices`);

    // Intercept API calls
    const apiCalls: { method: string; url: string; duration: number }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      const method = response.request().method();

      if ((method === 'PUT' || method === 'DELETE') && url.includes('/api/admin/')) {
        const timing = response.request().timing();
        if (timing) {
          const duration = timing.responseEnd - timing.requestStart;
          apiCalls.push({ method, url, duration });
        }
      }
    });

    // Create test notice
    await page.click('button:has-text("새 공지사항")');
    await page.fill('input[name="title"]', 'Performance Test Notice');
    await page.fill('textarea[name="content"]', '<p>Content</p>');
    await page.selectOption('select[name="category"]', 'GENERAL');
    await page.selectOption('select[name="status"]', 'DRAFT');
    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // Edit (PUT)
    const row = page.locator('tr:has-text("Performance Test Notice")').first();
    await row.click();
    await page.click('button:has-text("수정")');
    await page.fill('input[name="title"]', 'Performance Test - UPDATED');
    await page.click('button[type="submit"]:has-text("저장")');
    await page.waitForTimeout(2000);

    // Delete
    const updatedRow = page.locator('tr:has-text("Performance Test - UPDATED")').first();
    await updatedRow.click();
    await page.click('button:has-text("삭제")');
    await page.click('button:has-text("확인")');
    await page.waitForTimeout(2000);

    // Verify performance
    const putCalls = apiCalls.filter(call => call.method === 'PUT');
    const deleteCalls = apiCalls.filter(call => call.method === 'DELETE');

    console.log('PUT API Calls:', putCalls);
    console.log('DELETE API Calls:', deleteCalls);

    // All PUT/DELETE should be < 1000ms
    for (const call of apiCalls) {
      expect(call.duration).toBeLessThan(1000);
    }
  });
});
