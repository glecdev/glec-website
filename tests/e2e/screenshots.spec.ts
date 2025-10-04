/**
 * Screenshot Tests
 *
 * Capture screenshots for visual regression testing
 */

import { test } from '@playwright/test';
import { closeAllPopups } from '../helpers/test-utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
];

test.describe('Homepage Screenshots', () => {
  for (const viewport of viewports) {
    test(`should capture ${viewport.name} screenshots`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL);

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Close all popups before taking screenshots
      await closeAllPopups(page);
      await page.waitForTimeout(1000); // Give time for popups to fully close

      // Full page screenshot
      await page.screenshot({
        path: `tests/screenshots/homepage-${viewport.name}-full.png`,
        fullPage: true,
      });

      // Hero Section
      const heroSection = page.locator('section').first();
      await heroSection.screenshot({
        path: `tests/screenshots/hero-${viewport.name}.png`,
      });

      // Problem Awareness Section
      const problemSection = page.locator('section').filter({ hasText: '당신만 겪는 문제가 아닙니다' });
      await problemSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000); // Wait for animations
      await problemSection.screenshot({
        path: `tests/screenshots/problems-${viewport.name}.png`,
      });

      // Solution Overview Section
      const solutionSection = page.locator('section').filter({ hasText: '3가지 솔루션' });
      await solutionSection.scrollIntoViewIfNeeded();
      await solutionSection.screenshot({
        path: `tests/screenshots/solutions-${viewport.name}.png`,
      });

      // API Tab
      const apiTab = solutionSection.getByRole('button', { name: 'Carbon API' });
      await closeAllPopups(page); // Close popups before clicking
      await apiTab.click({ timeout: 15000, force: true });
      await page.waitForTimeout(2000); // Wait for typing animation
      await solutionSection.screenshot({
        path: `tests/screenshots/solutions-api-${viewport.name}.png`,
        timeout: 30000, // Increase timeout for screenshot capture
      });

      // Cloud Tab
      const cloudTab = solutionSection.getByRole('button', { name: 'GLEC Cloud' });
      await closeAllPopups(page); // Close popups before clicking
      await cloudTab.click({ timeout: 15000, force: true });
      await page.waitForTimeout(500);
      await solutionSection.screenshot({
        path: `tests/screenshots/solutions-cloud-${viewport.name}.png`,
      });

      // Case Studies Section
      const caseStudiesSection = page.locator('section').filter({ hasText: '검증된 성과' });
      await caseStudiesSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2500); // Wait for counter animation
      await caseStudiesSection.screenshot({
        path: `tests/screenshots/case-studies-${viewport.name}.png`,
      });

      // Partners Section
      const partnersSection = page.locator('section').filter({ hasText: '함께하는 파트너' });
      await partnersSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000); // Wait for animations
      await partnersSection.screenshot({
        path: `tests/screenshots/partners-${viewport.name}.png`,
      });

      // Latest News Section
      const newsSection = page.getByRole('region', { name: '최신 소식 섹션' });
      await newsSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await newsSection.screenshot({
        path: `tests/screenshots/news-${viewport.name}.png`,
      });

      // Contact Form Section
      const contactSection = page.getByRole('region', { name: '무료 상담 신청 폼 섹션' });
      await contactSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await contactSection.screenshot({
        path: `tests/screenshots/contact-form-${viewport.name}.png`,
      });

      // FAQ Section
      const faqSection = page.getByRole('region', { name: '자주 묻는 질문 섹션' });
      await faqSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await faqSection.screenshot({
        path: `tests/screenshots/faq-${viewport.name}.png`,
      });

      // Footer CTA Section
      const ctaSection = page.getByRole('region', { name: '무료 상담 신청 섹션' });
      await ctaSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await ctaSection.screenshot({
        path: `tests/screenshots/footer-cta-${viewport.name}.png`,
      });
    });
  }
});
