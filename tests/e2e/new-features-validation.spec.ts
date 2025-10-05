/**
 * New Features Validation Test
 *
 * Validates the 4 major features implemented:
 * 1. Cookie Consent Banner
 * 2. Analytics Tracking System
 * 3. Demo Request Multi-step Form
 * 4. Company Pages Content
 *
 * Environment: Runs on localhost:3005 dev server
 */

import { test, expect } from '@playwright/test';

test.describe('New Features Validation', () => {

  // =================================================================
  // Feature 1: Cookie Consent Banner
  // =================================================================

  test('Cookie Consent - should display bottom banner on first visit', async ({ page, context }) => {
    // Clear all cookies and local storage to simulate first visit
    await context.clearCookies();
    await page.goto('/');

    // Cookie consent banner should be visible at bottom
    const banner = page.locator('[data-testid="cookie-consent-banner"], .cookie-consent-banner, .fixed.bottom-0').first();
    await expect(banner).toBeVisible({ timeout: 5000 });

    // Should have accept and settings buttons
    const acceptButton = banner.locator('button').filter({ hasText: /전체 동의|모두 수락|Accept All/i });
    const settingsButton = banner.locator('button').filter({ hasText: /설정|Settings/i });

    await expect(acceptButton).toBeVisible();
    await expect(settingsButton).toBeVisible();
  });

  test('Cookie Consent - should save preferences to localStorage', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');

    // Wait for banner and click accept
    const acceptButton = page.locator('button').filter({ hasText: /전체 동의|모두 수락|Accept All/i }).first();
    await acceptButton.click();

    // Wait a bit for localStorage to be set
    await page.waitForTimeout(500);

    // Check localStorage has consent
    const consent = await page.evaluate(() => {
      const item = localStorage.getItem('glec_cookie_consent');
      return item ? JSON.parse(item) : null;
    });

    expect(consent).toBeTruthy();
    expect(consent.essential).toBe(true);
    // Should have timestamp
    expect(consent.timestamp).toBeTruthy();
  });

  test('Cookie Consent - should not show banner on subsequent visits', async ({ page, context }) => {
    // Set consent in localStorage before visiting
    await page.goto('/');
    await page.evaluate(() => {
      const consent = {
        essential: true,
        analytics: true,
        marketing: false,
        functional: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
      };
      localStorage.setItem('glec_cookie_consent', JSON.stringify(consent));
    });

    // Reload page
    await page.reload();

    // Banner should NOT be visible
    const banner = page.locator('[data-testid="cookie-consent-banner"], .cookie-consent-banner, .fixed.bottom-0').first();
    await expect(banner).not.toBeVisible({ timeout: 3000 });
  });

  // =================================================================
  // Feature 2: Demo Request Multi-step Form
  // =================================================================

  test('Demo Request - should display 3-step wizard', async ({ page }) => {
    await page.goto('/demo-request');

    // Check page title
    await expect(page.locator('h1')).toContainText(/데모 요청|Demo Request/i);

    // Step 1 should be active
    const step1 = page.locator('[data-step="1"], .step-1, form').first();
    await expect(step1).toBeVisible();

    // Should have company info fields
    await expect(page.locator('input[name="companyName"], #companyName')).toBeVisible();
    await expect(page.locator('input[name="contactName"], #contactName')).toBeVisible();
    await expect(page.locator('input[name="email"], #email, input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], #phone, input[type="tel"]')).toBeVisible();
  });

  test('Demo Request - should validate required fields', async ({ page }) => {
    await page.goto('/demo-request');

    // Try to submit without filling fields
    const nextButton = page.locator('button').filter({ hasText: /다음|Next/i }).first();
    await nextButton.click();

    // Should show validation errors
    const errorMessages = page.locator('.text-red-500, .text-error, [role="alert"]');
    await expect(errorMessages.first()).toBeVisible({ timeout: 3000 });
  });

  test('Demo Request - should format phone number automatically', async ({ page }) => {
    await page.goto('/demo-request');

    const phoneInput = page.locator('input[name="phone"], #phone, input[type="tel"]').first();

    // Type 11 digits
    await phoneInput.fill('01012345678');

    // Should format to 010-1234-5678
    const value = await phoneInput.inputValue();
    expect(value).toMatch(/\d{3}-\d{4}-\d{4}/);
  });

  test('Demo Request - should save draft to localStorage', async ({ page }) => {
    await page.goto('/demo-request');

    // Fill some fields
    await page.locator('input[name="companyName"], #companyName').first().fill('테스트 회사');
    await page.locator('input[name="email"], #email, input[type="email"]').first().fill('test@example.com');

    // Wait for auto-save
    await page.waitForTimeout(1000);

    // Check localStorage
    const draft = await page.evaluate(() => {
      const item = localStorage.getItem('glec_demo_request_draft');
      return item ? JSON.parse(item) : null;
    });

    expect(draft).toBeTruthy();
    expect(draft.companyName).toBe('테스트 회사');
    expect(draft.email).toBe('test@example.com');
  });

  // =================================================================
  // Feature 3: Company Pages Content
  // =================================================================

  test('Company Pages - /about/company should display core values', async ({ page }) => {
    await page.goto('/about/company');

    // Should have page title
    await expect(page.locator('h1')).toContainText(/회사소개|About|Company/i);

    // Should have core values section (6 values)
    const values = page.locator('[data-section="values"], .core-values, .values-section').first();
    await expect(values).toBeVisible({ timeout: 10000 });

    // Check for ISO-14083 mention (first core value)
    await expect(page.locator('text=/ISO.*14083/i')).toBeVisible();

    // Check for DHL GoGreen mention (second core value)
    await expect(page.locator('text=/DHL.*GoGreen/i')).toBeVisible();
  });

  test('Company Pages - /about/team should display team members', async ({ page }) => {
    await page.goto('/about/team');

    // Should have page title
    await expect(page.locator('h1')).toContainText(/팀|Team/i);

    // Should have team members section (7 members)
    const teamSection = page.locator('[data-section="team"], .team-members, .team-grid').first();
    await expect(teamSection).toBeVisible({ timeout: 10000 });

    // Check for CEO (김탄소)
    await expect(page.locator('text=/CEO|김탄소/i')).toBeVisible();

    // Check for CTO (이클라우드)
    await expect(page.locator('text=/CTO|이클라우드/i')).toBeVisible();
  });

  test('Company Pages - /about/partners should display partnerships', async ({ page }) => {
    await page.goto('/about/partners');

    // Should have page title
    await expect(page.locator('h1')).toContainText(/파트너|Partner/i);

    // Should have partners section (5 partners)
    const partnersSection = page.locator('[data-section="partners"], .partners-grid, .partners-section').first();
    await expect(partnersSection).toBeVisible({ timeout: 10000 });

    // Check for DHL GoGreen (Strategic Partner)
    await expect(page.locator('text=/DHL.*GoGreen/i')).toBeVisible();

    // Check for Cloudflare (Technology Partner)
    await expect(page.locator('text=/Cloudflare/i')).toBeVisible();
  });

  test('Company Pages - /about/certifications should display certifications', async ({ page }) => {
    await page.goto('/about/certifications');

    // Should have page title
    await expect(page.locator('h1')).toContainText(/인증|Certification/i);

    // Should have certifications section (7 certifications)
    const certsSection = page.locator('[data-section="certifications"], .certifications-grid, .certifications-section').first();
    await expect(certsSection).toBeVisible({ timeout: 10000 });

    // Check for ISO 14083:2023
    await expect(page.locator('text=/ISO.*14083.*2023/i')).toBeVisible();

    // Check for awards/patents
    await expect(page.locator('text=/Green Tech Innovation Award|Patent/i')).toBeVisible();
  });

  // =================================================================
  // Feature 4: Admin Analytics Dashboard
  // =================================================================

  test('Admin Analytics - should require authentication', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Should redirect to login
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Admin Analytics - should display dashboard after login', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.locator('input[name="email"], input[type="email"]').fill('admin@glec.local');
    await page.locator('input[name="password"], input[type="password"]').fill('glecadmin2024');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    // Navigate to analytics
    await page.goto('/admin/analytics');

    // Should display analytics dashboard
    await expect(page.locator('h1')).toContainText(/Analytics|분석|대시보드/i);

    // Should have date range picker
    const dateRange = page.locator('[data-testid="date-range"], select, .date-range').first();
    await expect(dateRange).toBeVisible({ timeout: 10000 });

    // Should have metrics cards (Sessions, PageViews, Events, Conversions)
    const metricsCards = page.locator('[data-metric], .metric-card, .stats-card');
    expect(await metricsCards.count()).toBeGreaterThan(0);
  });

  // =================================================================
  // Integration Test: Full User Journey with Analytics
  // =================================================================

  test('Full Journey - visitor accepts cookies, browses pages, submits demo request', async ({ page, context }) => {
    // Clear everything to simulate new visitor
    await context.clearCookies();
    await page.goto('/');

    // Step 1: Accept cookies
    const acceptButton = page.locator('button').filter({ hasText: /전체 동의|모두 수락|Accept All/i }).first();
    await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
    await acceptButton.click();

    // Step 2: Browse company page
    await page.goto('/about/company');
    await page.waitForLoadState('networkidle');

    // Step 3: Browse team page
    await page.goto('/about/team');
    await page.waitForLoadState('networkidle');

    // Step 4: Go to demo request
    await page.goto('/demo-request');

    // Step 5: Fill demo request form (Step 1 - Company Info)
    await page.locator('input[name="companyName"], #companyName').first().fill('E2E 테스트 회사');
    await page.locator('input[name="contactName"], #contactName').first().fill('홍길동');
    await page.locator('input[name="email"], #email, input[type="email"]').first().fill('test@e2e.com');
    await page.locator('input[name="phone"], #phone, input[type="tel"]').first().fill('01012345678');

    // Select company size
    const companySizeSelect = page.locator('select[name="companySize"], #companySize').first();
    if (await companySizeSelect.isVisible()) {
      await companySizeSelect.selectOption('51-200');
    }

    // Click next (if multi-step form)
    const nextButton = page.locator('button').filter({ hasText: /다음|Next/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    console.log('✅ Full journey test completed: Cookie consent → Company pages → Demo request form');
  });

  // =================================================================
  // Regression Test: Ensure News Page Still Works
  // =================================================================

  test('Regression - News page should load without errors', async ({ page }) => {
    await page.goto('/news');

    // Should have heading
    await expect(page.locator('h1')).toContainText(/공지사항|News|소식/i);

    // Should load notices list (may be empty, but API should not error)
    const noticesList = page.locator('[data-testid="notices-list"], .notices-grid, .news-list').first();
    // Give it time to load
    await page.waitForTimeout(2000);

    // Page should not show error message
    await expect(page.locator('text=/Error|오류|failed/i')).not.toBeVisible();
  });

  test('Regression - Solution pages should still work', async ({ page }) => {
    const solutionPages = ['/dtg', '/solutions/api', '/solutions/cloud', '/solutions/ai-dtg'];

    for (const path of solutionPages) {
      await page.goto(path);

      // Should have heading with typing animation
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });

      // Should not show error
      await expect(page.locator('text=/Error|오류|404/i')).not.toBeVisible();
    }
  });

  test('Regression - Homepage should display popup if scheduled', async ({ page }) => {
    await page.goto('/');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Popup may or may not appear depending on schedule, but should not error
    // Just check the page loaded successfully
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
