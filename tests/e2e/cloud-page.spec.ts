/**
 * GLEC Cloud Product Page E2E Tests
 *
 * Tests for /cloud page functionality and content
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

test.describe('GLEC Cloud Product Page', () => {
  test('should display hero section with correct content', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    // Hero Section - use locator('h1') to get only hero heading
    await expect(page.locator('h1').filter({ hasText: 'GLEC Cloud' })).toBeVisible();
    await expect(page.getByText('매일 밤 11시, 엑셀과의 전쟁을 끝내세요')).toBeVisible();
    await expect(page.getByText('실시간 모니터링 · 자동 보고서 생성 · 데이터 내보내기')).toBeVisible();

    // CTA buttons
    await expect(page.getByRole('link', { name: '14일 무료 체험' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '가격 확인하기' })).toBeVisible();
  });

  test('should display all 3 pricing tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    // Pricing tiers
    await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();

    // Pricing
    await expect(page.getByText('월 12만원')).toBeVisible();
    await expect(page.getByText('월 35만원')).toBeVisible();
    await expect(page.getByText('별도 협의')).toBeVisible();

    // Capacity
    await expect(page.getByText('차량 10대까지')).toBeVisible();
    await expect(page.getByText('차량 50대까지')).toBeVisible();
    await expect(page.getByText('차량 100대 이상')).toBeVisible();
  });

  test('should highlight Pro tier as featured', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    // Pro tier should have "인기" badge
    await expect(page.getByText('인기')).toBeVisible();
  });

  test('should display all 6 key features', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    const featuresSection = page.getByRole('heading', { name: '핵심 기능' });
    await featuresSection.scrollIntoViewIfNeeded();

    // Use h3 locators for feature headings
    await expect(page.locator('h3').filter({ hasText: /^실시간 모니터링$/ }).first()).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: '자동 보고서 생성' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: '데이터 내보내기' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: '이메일 알림' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'API 연동' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: '안전한 보안' })).toBeVisible();
  });

  test('should display dashboard preview section', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    const dashboardSection = page.getByRole('heading', { name: '직관적인 대시보드' });
    await dashboardSection.scrollIntoViewIfNeeded();

    await expect(page.getByRole('heading', { name: '한눈에 보는 전체 현황' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '상세 차량별 분석' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '자동 생성 보고서' })).toBeVisible();

    // Dashboard features
    await expect(page.getByText('실시간 차량 위치 지도')).toBeVisible();
    await expect(page.getByText('차량별 일일 운행 기록')).toBeVisible();
    await expect(page.getByText('월간/연간 배출량 요약')).toBeVisible();
  });

  test('should display integration ecosystem section', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    const integrationSection = page.getByRole('heading', { name: '완벽한 통합 생태계' });
    await integrationSection.scrollIntoViewIfNeeded();

    // Use h3 locators for integration names
    await expect(page.locator('h3').filter({ hasText: 'GLEC DTG' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Carbon API' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: /^GLEC Cloud$/ })).toBeVisible();

    // Integration flow
    await expect(page.getByText('DTG 하드웨어')).toBeVisible();
    await expect(page.getByText('로 데이터 수집')).toBeVisible();
    await expect(page.getByText('로 배출량 계산')).toBeVisible();
    await expect(page.getByText('로 보고서 자동 생성')).toBeVisible();
  });

  test('should display benefits section', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    const benefitsSection = page.getByRole('heading', { name: '왜 GLEC Cloud인가?' });
    await benefitsSection.scrollIntoViewIfNeeded();

    // Benefits metrics
    await expect(page.getByText('80%', { exact: true })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: '업무 자동화' })).toBeVisible();
    await expect(page.getByText('5분', { exact: true })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: /^보고서 생성$/ })).toBeVisible();
    await expect(page.getByText('24/7')).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: /^실시간 모니터링$/ }).last()).toBeVisible();
  });

  test('should display customer results', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    const benefitsSection = page.getByRole('heading', { name: '왜 GLEC Cloud인가?' });
    await benefitsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Customer results
    await expect(page.getByText('158만 톤')).toBeVisible();
    await expect(page.getByText('DHL 연간 CO₂ 감축량')).toBeVisible();
    await expect(page.getByText('92%')).toBeVisible();
    await expect(page.getByText('고객 만족도 (NPS)')).toBeVisible();
    await expect(page.getByText('3개월')).toBeVisible();
    await expect(page.getByText('평균 ROI 달성 기간')).toBeVisible();
  });

  test('should display CTA section with free trial', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    // Scroll to CTA
    const ctaSection = page.getByRole('heading', { name: '14일 무료 체험' }).last();
    await ctaSection.scrollIntoViewIfNeeded();

    await expect(page.getByText('신용카드 등록 없이 바로 시작하세요')).toBeVisible();
    await expect(page.getByText('언제든 취소 가능합니다')).toBeVisible();

    const freeTrialButton = page.getByRole('link', { name: /무료 체험 시작/i }).last();
    await expect(freeTrialButton).toBeVisible();
    await expect(freeTrialButton).toHaveAttribute('href', '/contact');

    const phoneLink = page.getByRole('link', { name: /전화 상담: 010-4481-5189/i }).last();
    await expect(phoneLink).toBeVisible();
    await expect(phoneLink).toHaveAttribute('href', 'tel:010-4481-5189');
  });

  test('should have correct SEO metadata', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toContain('GLEC Cloud');
    expect(title).toContain('실시간 모니터링');
    expect(title).toContain('월 12만원');
  });

  test('should navigate to pricing section when clicking pricing button', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    const pricingButton = page.getByRole('link', { name: '가격 확인하기' });
    await pricingButton.click();
    await page.waitForTimeout(500);

    // Should be at #pricing section
    const url = page.url();
    expect(url).toContain('#pricing');
  });

  test('should display pricing tier CTAs', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    // Count all CTAs - 2 무료체험 (Basic, Pro) + 1 상담신청 (Enterprise) + 1 CTA section = 4 total
    const allCTAs = page.getByRole('link', { name: /무료 체험 시작|상담 신청/ });
    await expect(allCTAs).toHaveCount(4);

    // Verify at least one of each type is visible
    await expect(page.getByRole('link', { name: '무료 체험 시작' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '상담 신청' })).toBeVisible();
  });

  test('should display Basic tier features', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('차량 10대 모니터링')).toBeVisible();
    await expect(page.getByText('실시간 대시보드').first()).toBeVisible();
    await expect(page.getByText('월간 자동 보고서', { exact: true })).toBeVisible();
    await expect(page.getByText('이메일 지원').first()).toBeVisible();
  });

  test('should display Pro tier features', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('차량 50대 모니터링')).toBeVisible();
    await expect(page.getByText('주간/월간 자동 보고서')).toBeVisible();
    await expect(page.getByText('전화 + 이메일 지원')).toBeVisible();
    await expect(page.getByText('맞춤형 리포트')).toBeVisible();
  });

  test('should display Enterprise tier features', async ({ page }) => {
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('무제한 차량 모니터링')).toBeVisible();
    await expect(page.getByText('커스텀 보고서')).toBeVisible();
    await expect(page.getByText('전담 매니저')).toBeVisible();
    await expect(page.getByText('온프레미스 설치 옵션')).toBeVisible();
    await expect(page.getByText('SLA 99.9% 보장')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    // Hero should be visible
    await expect(page.locator('h1').filter({ hasText: 'GLEC Cloud' })).toBeVisible();

    // Pricing tiers should stack vertically
    await expect(page.getByText('월 12만원')).toBeVisible();
    await expect(page.getByText('월 35만원')).toBeVisible();

    // Features should be readable
    const featuresSection = page.getByRole('heading', { name: '핵심 기능' });
    await featuresSection.scrollIntoViewIfNeeded();
    await expect(page.locator('h3').filter({ hasText: /^실시간 모니터링$/ }).first()).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/cloud`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').filter({ hasText: 'GLEC Cloud' })).toBeVisible();

    // Pricing tiers should display in grid
    await expect(page.getByRole('heading', { name: 'Basic' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();
  });
});
