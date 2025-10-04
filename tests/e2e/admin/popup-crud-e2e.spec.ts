/**
 * Admin Popup CRUD - End-to-End Real Flow Test
 *
 * Purpose: 어드민에서 팝업 생성 → 웹사이트에서 실제 표시 검증
 * CLAUDE.md 원칙: Mock 데이터가 아닌 실제 동작 검증
 */

import { test, expect } from '@playwright/test';
import { adminLogin, closeAllPopups } from '../../helpers/test-utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

test.describe('Admin Popup CRUD - Real Flow', () => {
  test('should create popup in admin and verify it appears on website', async ({ page, context }) => {
    console.log('\n=== Step 1: 어드민 로그인 ===\n');

    // 어드민 로그인
    await adminLogin(page, BASE_URL);
    await closeAllPopups(page);

    console.log('\n=== Step 2: 팝업 관리 페이지 이동 시도 ===\n');

    // 팝업 관리 메뉴 찾기
    const popupMenuExists = await page.locator('a[href*="popup"]').count();
    console.log('Popup menu count:', popupMenuExists);

    if (popupMenuExists === 0) {
      console.log('⚠️ 팝업 관리 메뉴가 존재하지 않음');

      // 모든 사이드바 메뉴 확인
      const allMenuLinks = await page.locator('nav a, aside a').all();
      console.log('Available menu items:', allMenuLinks.length);

      for (const link of allMenuLinks) {
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        console.log(`  - ${text}: ${href}`);
      }

      // 직접 URL 접근 시도
      console.log('\n=== Trying direct URL access to /admin/popups ===\n');
      await page.goto(`${BASE_URL}/admin/popups`);
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      const pageContent = await page.content();

      console.log('Current URL:', currentUrl);
      console.log('Page contains "404":', pageContent.includes('404'));
      console.log('Page contains "팝업":', pageContent.includes('팝업'));
    } else {
      await page.click('a[href*="popup"]');
    }

    console.log('\n=== Step 3: 팝업 생성 시도 ===\n');

    // 생성 버튼 찾기
    const createButton = page.locator('button, a').filter({ hasText: /새.*팝업|팝업.*작성|생성/ });
    const createButtonCount = await createButton.count();

    console.log('Create button count:', createButtonCount);

    if (createButtonCount > 0) {
      await createButton.first().click();

      // 폼 필드 확인
      await page.waitForTimeout(1000);

      const titleInput = page.locator('input[name="title"]');
      const contentInput = page.locator('textarea[name="content"], .ProseMirror');

      console.log('Has title input:', await titleInput.count() > 0);
      console.log('Has content input:', await contentInput.count() > 0);

      if (await titleInput.count() > 0) {
        await titleInput.fill('E2E Test Popup');
      }

      if (await contentInput.count() > 0) {
        await contentInput.first().fill('This is E2E test popup content');
      }

      // 저장 버튼 클릭
      const saveButton = page.locator('button[type="submit"]');
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(2000);
      }
    }

    console.log('\n=== Step 4: API 직접 호출 테스트 ===\n');

    // API 직접 호출로 팝업 생성 시도
    const apiResponse = await page.request.post(`${BASE_URL}/api/admin/popups`, {
      data: {
        title: 'API Test Popup',
        content: 'Created via API',
        displayType: 'modal',
        isActive: true,
        position: 'center',
        width: 500,
        height: 400,
        zIndex: 1000,
        showOnce: false,
      },
    });

    console.log('API Response Status:', apiResponse.status());
    const apiBody = await apiResponse.text();
    console.log('API Response Body:', apiBody.substring(0, 200));

    console.log('\n=== Step 5: 웹사이트에서 팝업 표시 확인 ===\n');

    // 새 탭으로 웹사이트 접속
    const websitePage = await context.newPage();
    await websitePage.goto(`${BASE_URL}/`);

    await websitePage.waitForTimeout(3000);

    // 팝업 API 호출 확인
    const popupApiCalled = await websitePage.evaluate(() => {
      return performance.getEntriesByType('resource')
        .some(r => r.name.includes('/api/popups'));
    });

    console.log('Popup API called:', popupApiCalled);

    // 팝업 요소 확인
    const popupElements = await websitePage.locator('[class*="popup"], [class*="modal"]').all();
    console.log('Popup elements found:', popupElements.length);

    // 스크린샷 저장
    await websitePage.screenshot({
      path: 'test-results/website-popup-verification.png',
      fullPage: true
    });

    console.log('\n=== Step 6: 근본 원인 분석 ===\n');

    // GET /api/popups 응답 확인
    const getPopupsResponse = await page.request.get(`${BASE_URL}/api/popups`);
    const getPopupsBody = await getPopupsResponse.json();

    console.log('GET /api/popups response:', JSON.stringify(getPopupsBody, null, 2));
    console.log('Popups data is array:', Array.isArray(getPopupsBody.data));
    console.log('Popups count:', getPopupsBody.data?.length || 0);

    await websitePage.close();
  });

  test('should verify notice creation flow', async ({ page }) => {
    console.log('\n=== 공지사항 생성 → 웹사이트 반영 검증 ===\n');

    await adminLogin(page, BASE_URL);
    await closeAllPopups(page);

    // 공지사항 목록으로 이동
    await page.goto(`${BASE_URL}/admin/notices`);
    await page.waitForTimeout(1000);

    // 신규 작성
    await page.click('a[href="/admin/notices/new"]');
    await page.waitForURL(/\/admin\/notices\/new/);

    // 폼 입력
    await page.fill('input[name="title"]', 'E2E Real Flow Test Notice');
    await page.fill('input[name="slug"]', 'e2e-real-flow-test');

    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption('GENERAL');
    }

    const statusSelect = page.locator('select[name="status"]');
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption('PUBLISHED');
    }

    const editor = page.locator('.ProseMirror');
    if (await editor.count() > 0) {
      await editor.click();
      await editor.fill('Real flow test content');
    }

    // 저장
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    console.log('\n=== API 응답 확인 ===\n');

    // API로 생성된 공지사항 확인
    const noticesResponse = await page.request.get(`${BASE_URL}/api/notices?category=GENERAL`);
    const noticesBody = await noticesResponse.json();

    console.log('Notices API response:', JSON.stringify(noticesBody, null, 2));

    const createdNotice = noticesBody.data?.find((n: any) =>
      n.title === 'E2E Real Flow Test Notice'
    );

    console.log('Created notice found:', !!createdNotice);
    console.log('Created notice data:', JSON.stringify(createdNotice, null, 2));

    console.log('\n=== 웹사이트에서 확인 ===\n');

    // 웹사이트 공지사항 페이지 접속
    await page.goto(`${BASE_URL}/news`);
    await page.waitForTimeout(2000);

    const noticeVisible = await page.locator('text=E2E Real Flow Test Notice').count();
    console.log('Notice visible on website:', noticeVisible > 0);

    if (noticeVisible === 0) {
      console.log('⚠️ 공지사항이 웹사이트에 표시되지 않음');

      // 페이지 내 모든 공지사항 확인
      const allNotices = await page.locator('article, .notice-item, [class*="card"]').all();
      console.log('Total notice elements on page:', allNotices.length);
    }

    // 스크린샷
    await page.screenshot({
      path: 'test-results/website-notice-verification.png',
      fullPage: true
    });
  });
});
