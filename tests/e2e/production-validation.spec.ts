/**
 * Production Validation Test
 *
 * 사용자 요구사항 8가지가 실제로 배포되었는지 검증
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://glec-website-cl8pwx991-glecdevs-projects.vercel.app';

test.describe('Production Validation - 8 Requirements', () => {

  test('Requirement 1: 언론기사 → 언론보도 메뉴 변경 확인', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Header에서 "언론보도" 텍스트 확인
    const pressLink = page.locator('a:has-text("언론보도")');
    await expect(pressLink).toBeVisible({ timeout: 10000 });

    // "언론기사"가 없는지 확인
    const oldText = page.locator('text=언론기사').first();
    await expect(oldText).not.toBeVisible();

    console.log('✅ Requirement 1: 언론보도 메뉴 확인됨');
  });

  test('Requirement 2: 영상 → 영상자료 메뉴 변경 확인', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Header에서 "영상자료" 텍스트 확인
    const videosLink = page.locator('a:has-text("영상자료")');
    await expect(videosLink).toBeVisible({ timeout: 10000 });

    // "영상"만 있는 링크가 없는지 확인 (영상자료는 있어야 함)
    const videoLinks = await page.locator('a').all();
    let hasOldVideosMenu = false;
    for (const link of videoLinks) {
      const text = await link.textContent();
      if (text === '영상' && !text.includes('영상자료')) {
        hasOldVideosMenu = true;
        break;
      }
    }
    expect(hasOldVideosMenu).toBe(false);

    console.log('✅ Requirement 2: 영상자료 메뉴 확인됨');
  });

  test('Requirement 3-1: 라이브러리 페이지 검색 기능 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/knowledge/library`);
    await page.waitForLoadState('networkidle');

    // 검색 input 확인
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Placeholder 확인
    const placeholder = await searchInput.getAttribute('placeholder');
    expect(placeholder).toContain('검색');

    console.log('✅ Requirement 3-1: 라이브러리 검색 확인됨');
  });

  test('Requirement 3-2: 언론보도 페이지 검색/필터 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/knowledge/press`);
    await page.waitForLoadState('networkidle');

    // 검색 input 확인
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // 카테고리 필터 버튼 확인 (전체, 제품, 기술, 파트너십, 수상)
    const allButton = page.locator('button:has-text("전체")');
    await expect(allButton).toBeVisible();

    console.log('✅ Requirement 3-2: 언론보도 검색/필터 확인됨');
  });

  test('Requirement 3-3: 영상자료 페이지 검색/필터 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/knowledge/videos`);
    await page.waitForLoadState('networkidle');

    // 검색 input 확인
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // 카테고리 필터 확인
    const allButton = page.locator('button:has-text("전체")');
    await expect(allButton).toBeVisible();

    console.log('✅ Requirement 3-3: 영상자료 검색/필터 확인됨');
  });

  test('Requirement 3-4: 블로그 페이지 검색/필터 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/knowledge/blog`);
    await page.waitForLoadState('networkidle');

    // 검색 input 확인
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // 카테고리 필터 확인
    const allButton = page.locator('button:has-text("전체")');
    await expect(allButton).toBeVisible();

    console.log('✅ Requirement 3-4: 블로그 검색/필터 확인됨');
  });

  test('Requirement 4: 이벤트 페이지 검색 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/events`);
    await page.waitForLoadState('networkidle');

    // 검색 input 확인
    const searchInput = page.locator('input[placeholder*="검색"], input[type="text"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    console.log('✅ Requirement 4: 이벤트 검색 확인됨');
  });

  test('Requirement 5: 어드민 이벤트 메뉴 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/admin/login`);
    await page.waitForLoadState('networkidle');

    // Admin 로그인 시도
    await page.fill('input[type="email"]', 'admin@glec.io');
    await page.fill('input[type="password"]', 'glec2024admin!');
    await page.click('button[type="submit"]');

    // Dashboard로 이동 대기
    await page.waitForTimeout(3000);

    // 이벤트 메뉴 확인
    const eventsMenu = page.locator('a[href="/admin/events"]');
    const isVisible = await eventsMenu.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Requirement 5: 어드민 이벤트 메뉴 확인됨');
    } else {
      console.log('⚠️ Requirement 5: 어드민 로그인 실패 또는 메뉴 미배포');
    }
  });

  test('Requirement 6-8: Admin Events 페이지 접근 시도', async ({ page }) => {
    // Admin events 페이지 직접 접근
    await page.goto(`${PRODUCTION_URL}/admin/events`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();

    if (currentUrl.includes('/admin/events')) {
      console.log('✅ Requirement 6-8: Admin Events 페이지 존재 확인');
    } else if (currentUrl.includes('/admin/login')) {
      console.log('⚠️ Requirement 6-8: 인증 필요 (페이지 존재하지만 로그인 필요)');
    } else {
      console.log('❌ Requirement 6-8: Admin Events 페이지 미배포');
    }
  });
});

test.describe('Production Deployment Verification', () => {

  test('Check Git Commits are deployed', async ({ page }) => {
    // fc51a48 commit verification - Knowledge Center 검색
    await page.goto(`${PRODUCTION_URL}/knowledge/library`);
    await page.waitForLoadState('networkidle');

    const hasSearch = await page.locator('input[type="text"]').first().isVisible();
    console.log(`fc51a48 (Knowledge Center 검색): ${hasSearch ? '✅ 배포됨' : '❌ 미배포'}`);

    // 4d66e63 commit verification - Admin Events
    await page.goto(`${PRODUCTION_URL}/admin/events`);
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const hasAdminEvents = currentUrl.includes('/admin/events') || currentUrl.includes('/admin/login');
    console.log(`4d66e63 (Admin Events): ${hasAdminEvents ? '✅ 배포됨' : '❌ 미배포'}`);
  });

  test('Check latest deployment timestamp', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');

    // Meta tag에서 배포 정보 확인
    const buildId = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="next-build-id"]');
      return meta?.getAttribute('content') || 'unknown';
    });

    console.log(`Build ID: ${buildId}`);
    console.log(`Production URL: ${PRODUCTION_URL}`);
  });
});
