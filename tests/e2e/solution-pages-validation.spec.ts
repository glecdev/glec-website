/**
 * Solution Pages Recursive Validation Test
 *
 * Tests all upgraded solution pages:
 * - /dtg (GLEC DTG Series5)
 * - /solutions/api (Carbon API)
 * - /solutions/cloud (GLEC Cloud)
 * - /solutions/ai-dtg (AI DTG)
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

test.describe('Solution Pages - Recursive Validation', () => {

  test.describe('DTG Product Page (/dtg)', () => {
    test('should load and display typing animation', async ({ page }) => {
      await page.goto(`${BASE_URL}/dtg`);

      // Wait for page load
      await expect(page).toHaveTitle(/GLEC DTG Series5/);

      // Check typing animation header (should eventually display)
      const header = page.locator('h1').first();
      await expect(header).toBeVisible({ timeout: 10000 });

      // Check for typing animation text (may be partial during animation)
      await expect(header).toContainText('90%', { timeout: 10000 });
    });

    test('should have interactive tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/dtg`);

      // Check for tabs
      const featuresTab = page.getByRole('button', { name: '주요 기능' });
      const specsTab = page.getByRole('button', { name: '기술 사양' });
      const installationTab = page.getByRole('button', { name: '설치 방법' });
      const pricingTab = page.getByRole('button', { name: '요금제' });

      await expect(featuresTab).toBeVisible();
      await expect(specsTab).toBeVisible();
      await expect(installationTab).toBeVisible();
      await expect(pricingTab).toBeVisible();

      // Test tab switching
      await specsTab.click();
      await expect(page.getByText('ARM Cortex-A53')).toBeVisible({ timeout: 5000 });

      await pricingTab.click();
      await expect(page.getByText('₩800,000')).toBeVisible({ timeout: 5000 });
    });

    test('should have gradient icon features (no emojis)', async ({ page }) => {
      await page.goto(`${BASE_URL}/dtg`);

      // Check for SVG icons (not emoji)
      const svgIcons = page.locator('svg[viewBox]');
      const iconCount = await svgIcons.count();
      expect(iconCount).toBeGreaterThan(10); // Should have many SVG icons

      // Check for NO emoji in feature cards
      const featureCards = page.locator('text=스마트폰 CPU').first();
      await expect(featureCards).toBeVisible();

      // Feature card should NOT contain emoji
      const featureText = await featureCards.textContent();
      expect(featureText).not.toMatch(/[\u{1F600}-\u{1F64F}]/u); // No emoji
    });

    test('should have trust indicators', async ({ page }) => {
      await page.goto(`${BASE_URL}/dtg`);

      await expect(page.getByText('1,200+ 차량')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('99.9% 가동률')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('ISO-14083 인증')).toBeVisible({ timeout: 5000 });
    });

    test('should have responsive CTA buttons', async ({ page }) => {
      await page.goto(`${BASE_URL}/dtg`);

      const ctaButton = page.getByRole('link', { name: /무료 상담|무료 체험/i }).first();
      await expect(ctaButton).toBeVisible();

      // Check hover effect (check for transition classes)
      const buttonClasses = await ctaButton.getAttribute('class');
      expect(buttonClasses).toContain('hover:');
    });
  });

  test.describe('Carbon API Page (/solutions/api)', () => {
    test('should load and display typing animation', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/api`);

      // Check typing animation header
      const header = page.locator('h1').first();
      await expect(header).toBeVisible({ timeout: 10000 });
      await expect(header).toContainText('개발자', { timeout: 10000 });
    });

    test('should have 3 interactive tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/api`);

      const featuresTab = page.getByRole('button', { name: '주요 기능' });
      const endpointsTab = page.getByRole('button', { name: 'API 엔드포인트' });
      const pricingTab = page.getByRole('button', { name: '요금제' });

      await expect(featuresTab).toBeVisible();
      await expect(endpointsTab).toBeVisible();
      await expect(pricingTab).toBeVisible();

      // Test tab switching
      await endpointsTab.click();
      await expect(page.getByText('48개 API 엔드포인트')).toBeVisible({ timeout: 5000 });

      await pricingTab.click();
      await expect(page.getByText('₩99,000')).toBeVisible({ timeout: 5000 });
    });

    test('should have 6 feature cards with gradient icons', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/api`);

      // Check for feature cards
      await expect(page.getByText('실시간 계산 API')).toBeVisible();
      await expect(page.getByText('배출계수 데이터베이스')).toBeVisible();
      await expect(page.getByText('보고서 생성 API')).toBeVisible();
      await expect(page.getByText('OAuth 2.0 인증')).toBeVisible();
      await expect(page.getByText('벌크 데이터 업로드')).toBeVisible();
      await expect(page.getByText('Webhook 알림')).toBeVisible();

      // Check for SVG gradient icons
      const svgIcons = page.locator('svg[viewBox]');
      const iconCount = await svgIcons.count();
      expect(iconCount).toBeGreaterThan(15);
    });

    test('should have code example in final CTA', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/api`);

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Check for code block
      await expect(page.locator('code').first()).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('curl -X POST')).toBeVisible({ timeout: 5000 });
    });

    test('should have trust indicators', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/api`);

      await expect(page.getByText('99.9% Uptime SLA')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('<100ms Response Time')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('ISO-14083 Certified')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('GLEC Cloud Page (/solutions/cloud)', () => {
    test('should load and display typing animation', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/cloud`);

      const header = page.locator('h1').first();
      await expect(header).toBeVisible({ timeout: 10000 });
      await expect(header).toContainText('클라우드', { timeout: 10000 });
    });

    test('should have 3 interactive tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/cloud`);

      const featuresTab = page.getByRole('button', { name: '주요 기능' });
      const dashboardTab = page.getByRole('button', { name: '대시보드' });
      const pricingTab = page.getByRole('button', { name: '요금제' });

      await expect(featuresTab).toBeVisible();
      await expect(dashboardTab).toBeVisible();
      await expect(pricingTab).toBeVisible();

      // Test dashboard tab
      await dashboardTab.click();
      await expect(page.getByText('실시간')).toBeVisible({ timeout: 5000 });

      // Test pricing tab
      await pricingTab.click();
      await expect(page.getByText('₩120,000')).toBeVisible({ timeout: 5000 });
    });

    test('should have 6 feature cards', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/cloud`);

      await expect(page.getByText('실시간 대시보드')).toBeVisible();
      await expect(page.getByText('EU CBAM 보고서')).toBeVisible();
      await expect(page.getByText('목표 관리')).toBeVisible();
      await expect(page.getByText('다중 사용자')).toBeVisible();
      await expect(page.getByText('API 통합')).toBeVisible();
      await expect(page.getByText('데이터 보안')).toBeVisible();
    });

    test('should have trust indicators', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/cloud`);

      await expect(page.getByText('1,200+ 기업 신뢰')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('99.9% Uptime')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('ISO-14083 인증')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('AI DTG Page (/solutions/ai-dtg)', () => {
    test('should load and display typing animation', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/ai-dtg`);

      const header = page.locator('h1').first();
      await expect(header).toBeVisible({ timeout: 10000 });
      await expect(header).toContainText('AI', { timeout: 10000 });
    });

    test('should have 3 interactive tabs', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/ai-dtg`);

      const featuresTab = page.getByRole('button', { name: '주요 기능' });
      const technologyTab = page.getByRole('button', { name: 'AI 기술' });
      const betaTab = page.getByRole('button', { name: 'Beta Program' });

      await expect(featuresTab).toBeVisible();
      await expect(technologyTab).toBeVisible();
      await expect(betaTab).toBeVisible();

      // Test technology tab
      await technologyTab.click();
      await expect(page.getByText('LSTM')).toBeVisible({ timeout: 5000 });

      // Test beta tab
      await betaTab.click();
      await expect(page.getByText('50% 할인')).toBeVisible({ timeout: 5000 });
    });

    test('should have 6 AI feature cards', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/ai-dtg`);

      await expect(page.getByText('배출량 예측 AI')).toBeVisible();
      await expect(page.getByText('경로 최적화')).toBeVisible();
      await expect(page.getByText('이상 패턴 감지')).toBeVisible();
      await expect(page.getByText('운전자 프로파일링')).toBeVisible();
      await expect(page.getByText('차량 상태 모니터링')).toBeVisible();
      await expect(page.getByText('자동 보고서 생성')).toBeVisible();
    });

    test('should have Coming Soon badge', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/ai-dtg`);

      await expect(page.getByText('Coming Soon')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Beta Program')).toBeVisible({ timeout: 5000 });
    });

    test('should have trust indicators', async ({ page }) => {
      await page.goto(`${BASE_URL}/solutions/ai-dtg`);

      await expect(page.getByText('95% 예측 정확도')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('15% 배출 감축')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('실시간 분석')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Cross-Page Consistency', () => {
    test('all pages should have gradient backgrounds', async ({ page }) => {
      const pages = [
        '/dtg',
        '/solutions/api',
        '/solutions/cloud',
        '/solutions/ai-dtg'
      ];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);

        // Check for gradient background class
        const hero = page.locator('section').first();
        const classes = await hero.getAttribute('class');
        expect(classes).toMatch(/gradient|bg-/);
      }
    });

    test('all pages should have CTA buttons', async ({ page }) => {
      const pages = [
        '/dtg',
        '/solutions/api',
        '/solutions/cloud',
        '/solutions/ai-dtg'
      ];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);

        // Check for at least one CTA button
        const ctaButtons = page.getByRole('link', { name: /문의|신청|시작|체험/i });
        const count = await ctaButtons.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('all pages should be mobile responsive', async ({ page }) => {
      const pages = [
        '/dtg',
        '/solutions/api',
        '/solutions/cloud',
        '/solutions/ai-dtg'
      ];

      // Test mobile viewport (375px - iPhone SE)
      await page.setViewportSize({ width: 375, height: 667 });

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);

        // Check header is visible
        const header = page.locator('h1').first();
        await expect(header).toBeVisible();

        // Check no horizontal overflow
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow 10px tolerance
      }
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('DTG page should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/dtg`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // Should load within 5s
    });

    test('all pages should have proper heading hierarchy', async ({ page }) => {
      const pages = ['/dtg', '/solutions/api', '/solutions/cloud', '/solutions/ai-dtg'];

      for (const pagePath of pages) {
        await page.goto(`${BASE_URL}${pagePath}`);

        // Check for h1
        const h1 = page.locator('h1');
        await expect(h1.first()).toBeVisible();

        // Check for h2
        const h2 = page.locator('h2');
        const h2Count = await h2.count();
        expect(h2Count).toBeGreaterThan(0);
      }
    });

    test('all pages should have keyboard navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/dtg`);

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      // Check focus is visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement || '');
    });
  });
});
