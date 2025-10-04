/**
 * Carbon API Product Page E2E Tests
 *
 * Tests for /api page functionality and content
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

test.describe('Carbon API Product Page', () => {
  test('should display hero section with correct content', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    // Hero Section - use first() to get hero heading specifically
    await expect(page.getByRole('heading', { name: 'GLEC Carbon API', exact: true })).toBeVisible();
    await expect(page.getByText('0.5초의 마법')).toBeVisible();
    await expect(page.getByText('ISO-14083 국제표준 기반 탄소배출량 계산 API')).toBeVisible();

    // CTA buttons - use first() for hero buttons
    await expect(page.getByRole('link', { name: 'API 키 발급 신청' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '실시간 데모 보기' })).toBeVisible();
  });

  test('should display pricing information', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    // Pricing
    await expect(page.getByText('건당 1,200원')).toBeVisible();
    await expect(page.getByText('사용량 기반 종량제')).toBeVisible();
    await expect(page.getByText('볼륨 할인 적용')).toBeVisible();
    await expect(page.getByText('최초 100건 무료 제공')).toBeVisible();
  });

  test('should display 48 API endpoints overview', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: '48개 API 엔드포인트' })).toBeVisible();
    await expect(page.getByText('5가지 운송 모드를 커버하는 완전한 탄소배출 계산 API')).toBeVisible();
  });

  test('should display all 5 transport modes', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    // Scroll to transport modes section
    const transportSection = page.getByRole('heading', { name: '5가지 운송 모드 지원' });
    await transportSection.scrollIntoViewIfNeeded();

    // Check all 5 modes
    await expect(page.getByText('육로 운송 (Road)')).toBeVisible();
    await expect(page.getByText('해상 운송 (Sea)')).toBeVisible();
    await expect(page.getByText('물류허브 (Hub)')).toBeVisible();
    await expect(page.getByText('항공 운송 (Air)')).toBeVisible();
    await expect(page.getByText('철도 운송 (Rail)')).toBeVisible();

    // Check API counts
    await expect(page.getByText('15개', { exact: true })).toBeVisible(); // Road
    await expect(page.getByText('12개', { exact: true })).toBeVisible(); // Sea
    await expect(page.getByText('8개', { exact: true })).toBeVisible();  // Hub
    await expect(page.getByText('7개', { exact: true })).toBeVisible();  // Air
    await expect(page.getByText('6개', { exact: true })).toBeVisible();  // Rail
  });

  test('should display key features section', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    const featuresSection = page.getByRole('heading', { name: '핵심 기능' });
    await featuresSection.scrollIntoViewIfNeeded();

    // Use getByRole for headings to avoid ambiguity
    await expect(page.getByRole('heading', { name: '정확한 계산' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '실시간 업데이트' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '상세 분석 데이터' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'RESTful API' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '완벽한 문서' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '확장 가능' })).toBeVisible();
  });

  test('should display API documentation preview with code examples', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    // Scroll to API docs section
    const docsSection = page.getByRole('heading', { name: 'API 문서 미리보기' });
    await docsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Check API endpoints - use locator with specific context
    await expect(page.locator('span.bg-green-600').filter({ hasText: 'POST' }).first()).toBeVisible();
    await expect(page.locator('span.bg-blue-600').filter({ hasText: 'GET' }).first()).toBeVisible();
    await expect(page.locator('code.text-green-400').filter({ hasText: '/api/carbon/road/freight' })).toBeVisible();
    await expect(page.locator('code.text-green-400').filter({ hasText: '/api/emission-factors' })).toBeVisible();
    await expect(page.locator('code.text-green-400').filter({ hasText: '/api/carbon/sea/container' })).toBeVisible();

    // Check code examples
    await expect(page.getByText('curl -X POST').first()).toBeVisible();
    await expect(page.getByText('Response:').first()).toBeVisible();
  });

  test('should display benefits section', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    const benefitsSection = page.getByRole('heading', { name: '왜 GLEC Carbon API인가?' });
    await benefitsSection.scrollIntoViewIfNeeded();

    await expect(page.getByText('48', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'API 엔드포인트', exact: true })).toBeVisible();
    await expect(page.getByText('0.5초').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '평균 응답 시간' })).toBeVisible();
    await expect(page.getByText('99.9%')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SLA 보장' })).toBeVisible();

    // Unique value propositions
    await expect(page.getByText('국내 유일', { exact: true })).toBeVisible();
    await expect(page.getByText('한국형 WTW (Well-to-Wheel) 배출계수 적용')).toBeVisible();
    await expect(page.getByText('ISO-14083').first()).toBeVisible();
  });

  test('should display CTA section with free trial offer', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    // Scroll to CTA
    const ctaSection = page.getByRole('heading', { name: '100건 무료 체험' });
    await ctaSection.scrollIntoViewIfNeeded();

    await expect(page.getByText('지금 API 키를 발급받고 바로 사용해보세요')).toBeVisible();

    const apiKeyButton = page.getByRole('link', { name: 'API 키 발급 신청' }).last();
    await expect(apiKeyButton).toBeVisible();
    await expect(apiKeyButton).toHaveAttribute('href', '/contact');

    const phoneLink = page.getByRole('link', { name: /전화 상담: 010-4481-5189/i }).last();
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('href', 'tel:010-4481-5189');
  });

  test('should have correct SEO metadata', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toContain('GLEC Carbon API');
    expect(title).toContain('ISO-14083');
    expect(title).toContain('0.5초');
  });

  test('should navigate to demo section when clicking demo button', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    const demoButton = page.getByRole('link', { name: '실시간 데모 보기' });
    await demoButton.click();
    await page.waitForTimeout(500);

    // Should be at #demo section
    const url = page.url();
    expect(url).toContain('#demo');
  });

  test('should display API endpoint examples with proper formatting', async ({ page }) => {
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    // Check endpoint badges
    await expect(page.locator('span').filter({ hasText: '/road/freight' })).toBeVisible();
    await expect(page.locator('span').filter({ hasText: '/sea/container' })).toBeVisible();
    await expect(page.locator('span').filter({ hasText: '/hub/warehouse' })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    // Hero should be visible
    await expect(page.getByRole('heading', { name: 'GLEC Carbon API', exact: true })).toBeVisible();

    // Pricing should stack vertically
    await expect(page.getByText('건당 1,200원')).toBeVisible();

    // Transport modes should be readable
    const roadMode = page.getByText('육로 운송 (Road)');
    await roadMode.scrollIntoViewIfNeeded();
    await expect(roadMode).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/api`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'GLEC Carbon API', exact: true })).toBeVisible();

    // Features should display in grid
    const featuresSection = page.getByRole('heading', { name: '핵심 기능' });
    await featuresSection.scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: '정확한 계산' })).toBeVisible();
  });
});
