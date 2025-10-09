/**
 * Admin Recursive Verification E2E Test
 *
 * Purpose: 재귀적 검증 및 개선 루프
 * - Dashboard 오류 확인
 * - 지식센터 공지사항 콘텐츠 발행 플로우 테스트
 * - 지식센터 보도자료 콘텐츠 발행 플로우 테스트
 * - Console 오류 수집 및 분석
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

// Helper: Login to admin
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 10000 });
}

// Helper: Collect console errors
function setupConsoleErrorCollector(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    errors.push(`[Page Error] ${error.message}`);
  });
  return errors;
}

test.describe('Admin Dashboard Verification', () => {
  test('Dashboard 페이지 로드 및 오류 확인', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page);

    // Login
    await loginAsAdmin(page);

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for heading
    const heading = await page.getByRole('heading', { name: /dashboard|대시보드/i });
    expect(await heading.count()).toBeGreaterThan(0);

    // Report console errors
    if (errors.length > 0) {
      console.log('\n🚨 Dashboard Console Errors:');
      errors.forEach((err) => console.log(err));
    } else {
      console.log('\n✅ Dashboard: No console errors');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard-screenshot.png', fullPage: true });

    // Check for error messages in UI
    const errorElements = await page.locator('[class*="error"], [role="alert"]').all();
    if (errorElements.length > 0) {
      console.log(`\n⚠️ Found ${errorElements.length} error elements in UI`);
      for (const elem of errorElements) {
        const text = await elem.textContent();
        console.log(`  - ${text}`);
      }
    }

    expect(errors.length).toBe(0);
  });
});

test.describe('지식센터 공지사항 - 콘텐츠 발행 플로우', () => {
  test('공지사항 생성 및 발행 테스트', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page);

    // Login
    await loginAsAdmin(page);

    // Navigate to Notices
    await page.click('text=지식센터 공지사항');
    await page.waitForURL('**/admin/notices', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    console.log('\n📝 공지사항 페이지 로드 완료');

    // Click "새 공지사항 작성" button
    const createButton = page.getByRole('button', { name: /새 공지사항|작성|create/i });
    if (await createButton.count() > 0) {
      await createButton.first().click();
      await page.waitForURL('**/admin/notices/new', { timeout: 10000 });
      await page.waitForLoadState('networkidle');

      console.log('✅ 새 공지사항 작성 페이지 진입');

      // Fill form
      await page.fill('input[name="title"], input[id="title"]', `Test Notice ${Date.now()}`);
      await page.fill('textarea[name="content"], textarea[id="content"]', '테스트 공지사항 내용입니다.');

      // Select category if exists
      const categorySelect = page.locator('select[name="category"], select[id="category"]');
      if (await categorySelect.count() > 0) {
        await categorySelect.selectOption('GENERAL');
      }

      // Select status = PUBLISHED
      const statusSelect = page.locator('select[name="status"], select[id="status"]');
      if (await statusSelect.count() > 0) {
        await statusSelect.selectOption('PUBLISHED');
      }

      // Take screenshot before submit
      await page.screenshot({ path: 'test-results/notices-create-form.png', fullPage: true });

      // Submit form
      const submitButton = page.getByRole('button', { name: /저장|발행|publish|save/i });
      await submitButton.click();

      // Wait for response (either success redirect or error message)
      await page.waitForTimeout(3000);

      // Check for errors
      const errorMessage = await page.locator('[class*="error"], [role="alert"]').first();
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log(`\n🚨 공지사항 발행 오류: ${errorText}`);

        // Take screenshot of error
        await page.screenshot({ path: 'test-results/notices-publish-error.png', fullPage: true });
      } else {
        console.log('\n✅ 공지사항 발행 성공');
      }
    } else {
      console.log('\n⚠️ "새 공지사항 작성" 버튼을 찾을 수 없음');
    }

    // Report console errors
    if (errors.length > 0) {
      console.log('\n🚨 공지사항 페이지 Console Errors:');
      errors.forEach((err) => console.log(err));
    }

    // Expect no errors
    expect(errors.length).toBe(0);
  });
});

test.describe('지식센터 보도자료 - 콘텐츠 발행 플로우', () => {
  test('보도자료 생성 및 발행 테스트', async ({ page }) => {
    const errors = setupConsoleErrorCollector(page);

    // Login
    await loginAsAdmin(page);

    // Navigate to Press
    await page.click('text=지식센터 보도자료');
    await page.waitForURL('**/admin/press', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    console.log('\n📰 보도자료 페이지 로드 완료');

    // Click "새 보도자료 작성" button
    const createButton = page.getByRole('button', { name: /새 보도자료|작성|create/i });
    if (await createButton.count() > 0) {
      await createButton.first().click();
      await page.waitForTimeout(2000);

      console.log('✅ 새 보도자료 작성 페이지 진입 시도');

      // Check if form appeared
      const titleInput = page.locator('input[name="title"], input[id="title"]');
      if (await titleInput.count() > 0) {
        // Fill form
        await titleInput.fill(`Test Press ${Date.now()}`);
        await page.fill('textarea[name="content"], textarea[id="content"]', '테스트 보도자료 내용입니다.');

        // Select status = PUBLISHED
        const statusSelect = page.locator('select[name="status"], select[id="status"]');
        if (await statusSelect.count() > 0) {
          await statusSelect.selectOption('PUBLISHED');
        }

        // Take screenshot before submit
        await page.screenshot({ path: 'test-results/press-create-form.png', fullPage: true });

        // Submit form
        const submitButton = page.getByRole('button', { name: /저장|발행|publish|save/i });
        await submitButton.click();

        // Wait for response
        await page.waitForTimeout(3000);

        // Check for errors
        const errorMessage = await page.locator('[class*="error"], [role="alert"]').first();
        if (await errorMessage.count() > 0) {
          const errorText = await errorMessage.textContent();
          console.log(`\n🚨 보도자료 발행 오류: ${errorText}`);

          // Take screenshot of error
          await page.screenshot({ path: 'test-results/press-publish-error.png', fullPage: true });
        } else {
          console.log('\n✅ 보도자료 발행 성공');
        }
      } else {
        console.log('\n⚠️ 보도자료 작성 폼을 찾을 수 없음');
        await page.screenshot({ path: 'test-results/press-no-form.png', fullPage: true });
      }
    } else {
      console.log('\n⚠️ "새 보도자료 작성" 버튼을 찾을 수 없음');
    }

    // Report console errors
    if (errors.length > 0) {
      console.log('\n🚨 보도자료 페이지 Console Errors:');
      errors.forEach((err) => console.log(err));
    }

    // Expect no errors
    expect(errors.length).toBe(0);
  });
});
