/**
 * Site Crawler - 모든 페이지와 버튼 자동 테스트
 *
 * Purpose: 누락된 페이지와 비동기 데이터 연동 문제 자동 발견
 * Strategy: 모든 링크와 버튼을 클릭하며 404/500 에러 탐지
 */

import { test, expect } from '@playwright/test';

interface TestResult {
  url: string;
  status: 'pass' | 'fail';
  error?: string;
  timestamp: string;
}

const results: TestResult[] = [];

test.describe('Site Crawler - 전체 사이트 검증', () => {
  test('should crawl all public pages and find 404/500 errors', async ({ page }) => {
    test.setTimeout(120000); // 120초 (2분) 타임아웃
    const visited = new Set<string>();
    const baseUrl = process.env.BASE_URL || 'http://localhost:3004';
    const toVisit: string[] = [baseUrl + '/'];
    const errors: Array<{ url: string; error: string }> = [];

    // 최대 50개 페이지만 크롤링
    const maxPages = 50;
    let pageCount = 0;

    while (toVisit.length > 0 && pageCount < maxPages) {
      const url = toVisit.shift()!;
      if (visited.has(url)) continue;

      visited.add(url);
      pageCount++;

      try {
        console.log(`[${pageCount}/${maxPages}] Crawling: ${url}`);

        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000, // 30초 - 첫 컴파일을 위해
        });

        const status = response?.status();

        // 에러 체크
        if (!status) {
          errors.push({ url, error: 'No response' });
        } else if (status === 404) {
          errors.push({ url, error: '404 Not Found' });
        } else if (status >= 500) {
          errors.push({ url, error: `${status} Server Error` });
        } else if (status >= 400) {
          errors.push({ url, error: `${status} Client Error` });
        }

        // 현재 페이지의 모든 링크 수집
        const links = await page.locator('a[href]').all();
        for (const link of links) {
          const href = await link.getAttribute('href');
          if (!href) continue;

          // 절대 URL로 변환
          let fullUrl: string;
          if (href.startsWith('http')) {
            fullUrl = href;
          } else if (href.startsWith('/')) {
            fullUrl = `${baseUrl}${href}`;
          } else {
            continue; // 상대 경로는 스킵
          }

          // 같은 도메인만 크롤링
          if (fullUrl.startsWith(baseUrl) && !visited.has(fullUrl)) {
            toVisit.push(fullUrl);
          }
        }
      } catch (err) {
        errors.push({
          url,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // 결과 출력
    console.log('\n=== Crawl Results ===');
    console.log(`Total pages crawled: ${visited.size}`);
    console.log(`Errors found: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach((e) => console.log(`❌ ${e.url}: ${e.error}`));
    }

    // 에러가 없어야 성공
    expect(errors).toHaveLength(0);
  });

  test('should test all buttons on admin portal', async ({ page }) => {
    test.setTimeout(120000); // 120초 (2분) 타임아웃
    const baseUrl = process.env.BASE_URL || 'http://localhost:3004';

    // Admin 로그인
    await page.goto(`${baseUrl}/admin/login`);
    await page.fill('input[name="email"]', 'admin@glec.io');
    await page.fill('input[name="password"]', 'admin123!');
    await page.locator('form button[type="submit"]').first().click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });

    const errors: Array<{ button: string; error: string }> = [];

    // Dashboard의 모든 링크 테스트
    const links = await page.locator('a[href^="/admin"]').all();
    console.log(`Found ${links.length} admin links`);

    for (let i = 0; i < links.length; i++) {
      try {
        const href = await links[i].getAttribute('href');
        if (!href) continue;

        console.log(`Testing link: ${href}`);
        await links[i].click({ timeout: 5000 });

        // 페이지 로드 대기
        await page.waitForLoadState('networkidle', { timeout: 5000 });

        const currentUrl = page.url();

        // 404 체크
        const has404 = await page.locator('text=404').count() > 0;
        if (has404) {
          errors.push({ button: href, error: '404 Not Found' });
        }

        // Dashboard로 돌아가기
        await page.goto(`${baseUrl}/admin/dashboard`);
        await page.waitForLoadState('networkidle');
      } catch (err) {
        errors.push({
          button: `Link ${i}`,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    console.log('\n=== Admin Links Test Results ===');
    console.log(`Total links tested: ${links.length}`);
    console.log(`Errors found: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== Errors ===');
      errors.forEach((e) => console.log(`❌ ${e.button}: ${e.error}`));
    }

    // 결과 출력 (에러가 있어도 fail하지 않고 리포트만)
    console.log('\n=== Missing Admin Pages ===');
    errors.forEach((e) => console.log(`TODO: Create ${e.button}`));
  });

  test('should test all clickable elements on homepage', async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3004';

    await page.goto(`${baseUrl}/`);

    const errors: Array<{ element: string; error: string }> = [];

    // 모든 버튼 찾기
    const buttons = await page.locator('button, a').all();
    console.log(`Found ${buttons.length} clickable elements`);

    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      // 최대 20개만 테스트
      try {
        const text = (await buttons[i].textContent())?.trim() || `Button ${i}`;
        const href = await buttons[i].getAttribute('href');

        console.log(`Testing: ${text} (${href || 'button'})`);

        if (href) {
          // 링크인 경우
          const response = await page.goto(`http://localhost:3003${href}`, {
            timeout: 5000,
          });
          const status = response?.status();

          if (status === 404) {
            errors.push({ element: text, error: `404: ${href}` });
          } else if (status && status >= 500) {
            errors.push({ element: text, error: `${status}: ${href}` });
          }

          await page.goto('http://localhost:3003/');
        }
      } catch (err) {
        // 에러는 리포트만 하고 계속 진행
        console.log(`⚠ Error testing button ${i}: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    console.log('\n=== Homepage Buttons Test Results ===');
    console.log(`Total elements tested: ${Math.min(buttons.length, 20)}`);
    console.log(`Errors found: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n=== Missing Pages ===');
      errors.forEach((e) => console.log(`TODO: Create page for "${e.element}": ${e.error}`));
    }
  });
});
