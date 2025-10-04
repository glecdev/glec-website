import { test, expect } from '@playwright/test';
import { closeAllPopups } from '../../helpers/test-utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

test.describe('Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Close any popups that might interfere
    await page.goto(`${BASE_URL}/admin/login`);
    await closeAllPopups(page);
  });

  test('should display login form', async ({ page }) => {
    // 제목 확인
    await expect(page.locator('h1')).toContainText('관리자 로그인');

    // 폼 요소 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    // 로그인 폼의 submit 버튼만 확인 (Footer 버튼 제외)
    await expect(page.locator('form button[type="submit"]').first()).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // 이메일 입력
    await page.fill('input[name="email"]', 'admin@glec.io');

    // 비밀번호 입력 (MOCK_ADMIN_USER의 실제 비밀번호)
    await page.fill('input[name="password"]', 'admin123!');

    // Close popups before clicking submit
    await closeAllPopups(page);

    // 로그인 폼의 submit 버튼 클릭
    await page.locator('form button[type="submit"]').first().click();

    // Wait for navigation (accept dashboard, notices, or press)
    await page.waitForURL(/\/admin\/(dashboard|notices|press)/, { timeout: 15000 });

    // Close any popups that appear after login
    await closeAllPopups(page);

    // Verify we're in admin area (not on login page)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin/login');
    expect(currentUrl).toContain('/admin/');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // 빈 폼으로 제출
    await closeAllPopups(page);
    await page.click('button[type="submit"]');

    // HTML5 validation 또는 커스텀 에러 메시지 확인
    const emailInput = page.locator('input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });
});
