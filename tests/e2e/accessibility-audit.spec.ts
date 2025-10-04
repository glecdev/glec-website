/**
 * Accessibility Audit with axe-core
 *
 * Purpose: WCAG 2.1 AA 표준 준수 검증
 * Based on: GLEC-Design-System-Standards.md (접근성 표준)
 * Tools: @axe-core/playwright
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Knowledge Main', path: '/knowledge' },
  { name: 'Knowledge Library', path: '/knowledge/library' },
  { name: 'Knowledge Press', path: '/knowledge/press' },
  { name: 'Knowledge Videos', path: '/knowledge/videos' },
  { name: 'Knowledge Blog', path: '/knowledge/blog' },
];

test.describe('WCAG 2.1 AA Accessibility Audit', () => {
  test.setTimeout(120000); // 2 minutes per test

  for (const page of pages) {
    test(`${page.name} - should have no critical accessibility violations`, async ({ page: pw }) => {
      await pw.goto(`${BASE_URL}${page.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Wait for page to load
      await pw.waitForTimeout(2000);

      // Close any popups that might interfere
      await pw.evaluate(() => {
        localStorage.setItem('disable_popups_for_tests', 'true');
      });

      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page: pw })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      console.log(`\n=== ${page.name} Accessibility Report ===`);
      console.log(`Violations: ${accessibilityScanResults.violations.length}`);
      console.log(`Passes: ${accessibilityScanResults.passes.length}`);
      console.log(`Incomplete: ${accessibilityScanResults.incomplete.length}`);

      // Log all violations
      if (accessibilityScanResults.violations.length > 0) {
        console.log('\n🔴 Critical Violations:');
        accessibilityScanResults.violations.forEach((violation, index) => {
          console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
          console.log(`   Description: ${violation.description}`);
          console.log(`   Help: ${violation.help}`);
          console.log(`   Affected nodes: ${violation.nodes.length}`);

          violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
            console.log(`   - Node ${nodeIndex + 1}: ${node.html.substring(0, 100)}...`);
            console.log(`     Failure: ${node.failureSummary}`);
          });
        });
      }

      // Assert no critical or serious violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalViolations,
        `Found ${criticalViolations.length} critical/serious violations:\n` +
        criticalViolations.map(v => `- ${v.id}: ${v.description}`).join('\n')
      ).toHaveLength(0);
    });
  }
});

test.describe('Color Contrast Verification', () => {
  test.setTimeout(120000); // 2 minutes per test

  test('Primary color should have sufficient contrast', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Check primary button color contrast
    const primaryButton = page.locator('button, a').filter({ hasText: /무료.*데모|신청|문의/ }).first();

    if (await primaryButton.count() > 0) {
      const contrast = await primaryButton.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;

        // Debug: Log element info
        console.log('[DEBUG] Element:', {
          tag: el.tagName,
          text: el.textContent,
          classes: el.className,
          bg: bgColor,
          color: textColor
        });

        // Convert RGB to relative luminance
        const getLuminance = (rgb: string) => {
          const match = rgb.match(/\d+/g);
          if (!match) return 0;

          const [r, g, b] = match.map(Number);
          const [rs, gs, bs] = [r, g, b].map(c => {
            const val = c / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
          });

          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };

        const l1 = getLuminance(bgColor);
        const l2 = getLuminance(textColor);
        const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        return {
          bgColor,
          textColor,
          contrast: contrast.toFixed(2),
          meetsAA: contrast >= 4.5,
          meetsAAA: contrast >= 7
        };
      });

      console.log('\n=== Primary Button Color Contrast ===');
      console.log(`Background: ${contrast.bgColor}`);
      console.log(`Text: ${contrast.textColor}`);
      console.log(`Contrast Ratio: ${contrast.contrast}:1`);
      console.log(`WCAG AA (4.5:1): ${contrast.meetsAA ? '✅' : '❌'}`);
      console.log(`WCAG AAA (7:1): ${contrast.meetsAAA ? '✅' : '❌'}`);

      expect(Number(contrast.contrast)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe('Keyboard Navigation', () => {
  test.setTimeout(120000); // 2 minutes per test

  test('Should navigate main menu with keyboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Start from first focusable element
    await page.keyboard.press('Tab');

    // Navigate through main menu
    for (let i = 0; i < 10; i++) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          text: el?.textContent?.substring(0, 30),
          href: (el as HTMLAnchorElement)?.href,
          visible: el ? window.getComputedStyle(el).visibility !== 'hidden' : false
        };
      });

      console.log(`Tab ${i + 1}: ${focused.tag} - "${focused.text?.trim()}"`);

      // Verify focus is visible
      expect(focused.visible).toBe(true);

      await page.keyboard.press('Tab');
    }
  });
});
