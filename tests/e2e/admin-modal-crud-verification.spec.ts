/**
 * Admin Modal-Based CRUD E2E Verification Test
 *
 * Purpose: Verify all admin pages with modal pattern work correctly
 * Pages: Notices, Press, Popups
 * Pattern: Knowledge Library modal-based CRUD
 *
 * Test Coverage:
 * 1. Login flow
 * 2. Navigate to each admin page
 * 3. Click "Create" button → Modal opens
 * 4. Fill form → Submit → Modal closes → Auto-refresh
 * 5. Click "Edit" button → Modal opens with data
 * 6. Update form → Submit → Modal closes → Auto-refresh
 * 7. Click "Delete" button → Confirm → Item removed
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!@#';

test.describe('Admin Modal-Based CRUD Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL(`${BASE_URL}/admin`, { timeout: 10000 });
  });

  test('Notices: Create → Edit → Delete flow', async ({ page }) => {
    // Navigate to Notices page
    await page.goto(`${BASE_URL}/admin/notices`);
    await expect(page.getByRole('heading', { name: '공지사항 관리' })).toBeVisible({ timeout: 10000 });

    // Step 1: Open Create Modal
    const createButton = page.locator('button:has-text("새 공지 작성")').first();
    await createButton.click();

    // Wait for modal to appear
    await expect(page.locator('text=새 공지사항 만들기')).toBeVisible({ timeout: 5000 });

    // Step 2: Fill Create Form
    const timestamp = Date.now();
    const testTitle = `E2E Test Notice ${timestamp}`;

    await page.fill('input[placeholder*="제목"]', testTitle);
    await page.fill('textarea[placeholder*="내용"]', `This is an E2E test notice created at ${timestamp}`);
    await page.selectOption('select', 'GENERAL');

    // Step 3: Submit Create Form
    const submitButton = page.locator('button[type="submit"]:has-text("추가")');
    await submitButton.click();

    // Wait for modal to close and auto-refresh
    await expect(page.locator('text=새 공지사항 만들기')).toBeHidden({ timeout: 5000 });

    // Verify item appears in list (wait for auto-refresh)
    await page.waitForTimeout(2000); // Wait for fetchNotices()
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 5000 });

    // Step 4: Open Edit Modal
    const editButton = page.locator(`tr:has-text("${testTitle}") button[title="수정"]`).first();
    await editButton.click();

    // Wait for modal with data
    await expect(page.locator('text=공지사항 수정')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`input[value="${testTitle}"]`)).toBeVisible();

    // Step 5: Update Form
    const updatedTitle = `${testTitle} (Updated)`;
    await page.fill('input[placeholder*="제목"]', updatedTitle);

    // Step 6: Submit Update
    const updateButton = page.locator('button[type="submit"]:has-text("수정")');
    await updateButton.click();

    // Wait for modal to close
    await expect(page.locator('text=공지사항 수정')).toBeHidden({ timeout: 5000 });

    // Verify updated item (wait for auto-refresh)
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible({ timeout: 5000 });

    // Step 7: Delete Item
    const deleteButton = page.locator(`tr:has-text("${updatedTitle}") button[title="삭제"]`).first();

    // Handle confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await deleteButton.click();

    // Verify item removed (wait for auto-refresh)
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${updatedTitle}`)).toBeHidden({ timeout: 5000 });
  });

  test('Press: Create → Edit → Delete flow', async ({ page }) => {
    // Navigate to Press page
    await page.goto(`${BASE_URL}/admin/press`);
    await expect(page.getByRole('heading', { name: '언론보도 관리' })).toBeVisible({ timeout: 10000 });

    // Step 1: Open Create Modal
    const createButton = page.locator('button:has-text("새 보도자료 작성")').first();
    await createButton.click();

    await expect(page.locator('text=새 보도자료 만들기')).toBeVisible({ timeout: 5000 });

    // Step 2: Fill Create Form
    const timestamp = Date.now();
    const testTitle = `E2E Test Press ${timestamp}`;

    await page.fill('input[placeholder*="제목"]', testTitle);
    await page.fill('textarea[placeholder*="내용"]', `This is an E2E test press created at ${timestamp}`);
    await page.fill('input[placeholder*="언론사"]', 'E2E Test Media');

    // Step 3: Submit
    const submitButton = page.locator('button[type="submit"]:has-text("추가")');
    await submitButton.click();

    await expect(page.locator('text=새 보도자료 만들기')).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 5000 });

    // Step 4: Edit
    const editButton = page.locator(`tr:has-text("${testTitle}") button[title="수정"]`).first();
    await editButton.click();

    await expect(page.locator('text=보도자료 수정')).toBeVisible({ timeout: 5000 });

    const updatedTitle = `${testTitle} (Updated)`;
    await page.fill('input[placeholder*="제목"]', updatedTitle);

    const updateButton = page.locator('button[type="submit"]:has-text("수정")');
    await updateButton.click();

    await expect(page.locator('text=보도자료 수정')).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible({ timeout: 5000 });

    // Step 5: Delete
    const deleteButton = page.locator(`tr:has-text("${updatedTitle}") button[title="삭제"]`).first();
    page.on('dialog', dialog => dialog.accept());
    await deleteButton.click();

    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${updatedTitle}`)).toBeHidden({ timeout: 5000 });
  });

  test('Popups: Create → Edit → Delete flow', async ({ page }) => {
    // Navigate to Popups page
    await page.goto(`${BASE_URL}/admin/popups`);
    await expect(page.getByRole('heading', { name: '팝업 관리' })).toBeVisible({ timeout: 10000 });

    // Step 1: Open Create Modal
    const createButton = page.locator('button:has-text("새 팝업 만들기")').first();
    await createButton.click();

    await expect(page.locator('text=새 팝업 만들기')).toBeVisible({ timeout: 5000 });

    // Step 2: Fill Create Form (13 fields)
    const timestamp = Date.now();
    const testTitle = `E2E Test Popup ${timestamp}`;

    await page.fill('input[placeholder*="제목"]', testTitle);
    await page.fill('textarea', `This is an E2E test popup created at ${timestamp}`);
    await page.selectOption('select >> nth=0', 'modal');
    await page.selectOption('select >> nth=1', 'center');
    await page.fill('input[type="number"] >> nth=0', '600'); // width
    await page.fill('input[type="number"] >> nth=1', '400'); // height

    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('input[type="date"] >> nth=0', today);
    await page.fill('input[type="date"] >> nth=1', nextMonth);

    // Step 3: Submit
    const submitButton = page.locator('button[type="submit"]:has-text("추가")');
    await submitButton.click();

    await expect(page.locator('text=새 팝업 만들기')).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 5000 });

    // Step 4: Edit
    const editButton = page.locator(`div:has-text("${testTitle}") button:has-text("수정")`).first();
    await editButton.click();

    await expect(page.locator('text=팝업 수정')).toBeVisible({ timeout: 5000 });

    const updatedTitle = `${testTitle} (Updated)`;
    await page.fill('input[placeholder*="제목"]', updatedTitle);

    const updateButton = page.locator('button[type="submit"]:has-text("수정")');
    await updateButton.click();

    await expect(page.locator('text=팝업 수정')).toBeHidden({ timeout: 5000 });
    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${updatedTitle}`)).toBeVisible({ timeout: 5000 });

    // Step 5: Delete
    const deleteButton = page.locator(`div:has-text("${updatedTitle}") button:has-text("삭제")`).first();
    page.on('dialog', dialog => dialog.accept());
    await deleteButton.click();

    await page.waitForTimeout(2000);
    await expect(page.locator(`text=${updatedTitle}`)).toBeHidden({ timeout: 5000 });
  });

  test('Events: Navigate to Create/Edit pages', async ({ page }) => {
    // Navigate to Events page
    await page.goto(`${BASE_URL}/admin/events`);
    await expect(page.getByRole('heading', { name: '이벤트 관리' })).toBeVisible({ timeout: 10000 });

    // Step 1: Click Create button (should navigate to /admin/events/create)
    const createButton = page.locator('a:has-text("새 이벤트 작성")').first();
    await createButton.click();

    // Verify navigation to Create page
    await expect(page).toHaveURL(`${BASE_URL}/admin/events/create`, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: '이벤트 작성' })).toBeVisible({ timeout: 5000 });

    // Go back to Events list
    await page.goto(`${BASE_URL}/admin/events`);

    // Step 2: Click first Edit link (should navigate to /admin/events/[id]/edit)
    const firstEditLink = page.locator('a[title="수정"]').first();
    const isVisible = await firstEditLink.isVisible({ timeout: 3000 }).catch(() => false);

    if (isVisible) {
      await firstEditLink.click();

      // Verify navigation to Edit page
      await expect(page.url()).toContain('/admin/events/');
      await expect(page.url()).toContain('/edit');
      await expect(page.getByRole('heading', { name: '이벤트 수정' })).toBeVisible({ timeout: 5000 });
    } else {
      console.log('⚠️ No events found for Edit test (expected if database is empty)');
    }
  });

  test('Performance: Modal open/close timing', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/notices`);
    await expect(page.getByRole('heading', { name: '공지사항 관리' })).toBeVisible({ timeout: 10000 });

    // Measure modal open time
    const createButton = page.locator('button:has-text("새 공지 작성")').first();

    const startOpen = Date.now();
    await createButton.click();
    await expect(page.locator('text=새 공지사항 만들기')).toBeVisible({ timeout: 5000 });
    const openTime = Date.now() - startOpen;

    console.log(`✅ Modal open time: ${openTime}ms (target: < 200ms)`);
    expect(openTime).toBeLessThan(500); // Relaxed threshold for CI

    // Measure modal close time
    const cancelButton = page.locator('button:has-text("취소")').first();

    const startClose = Date.now();
    await cancelButton.click();
    await expect(page.locator('text=새 공지사항 만들기')).toBeHidden({ timeout: 5000 });
    const closeTime = Date.now() - startClose;

    console.log(`✅ Modal close time: ${closeTime}ms (target: < 200ms)`);
    expect(closeTime).toBeLessThan(500); // Relaxed threshold for CI
  });
});
