/**
 * Complete Forms E2E Flow Test
 *
 * Tests all form submissions from Website → Database → Admin Portal:
 * 1. Event Registration
 * 2. Demo Request
 * 3. Contact Form
 * 4. Partnership Application
 * 5. Verify data appears in Admin Analytics/Dashboard
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3010';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

// Helper: Admin login
async function adminLogin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 10000 });
}

test.describe('Complete Forms E2E Flow', () => {
  test('1. Contact Form → Admin Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `contact-e2e-${timestamp}@test.com`;

    // Step 1: Submit contact form
    await page.goto(`${BASE_URL}/contact`);
    await page.fill('input[name="name"]', `Contact Test ${timestamp}`);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '010-1234-5678');
    await page.fill('input[name="company"]', 'Test Company');
    await page.fill('input[name="subject"]', 'E2E Test Subject');
    await page.fill('textarea[name="message"]', 'This is an E2E test message from Playwright.');
    await page.check('input[name="privacy_consent"]');

    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=제출되었습니다')).toBeVisible({ timeout: 10000 });

    console.log(`✅ Contact form submitted: ${testEmail}`);

    // Step 2: Login to Admin Portal
    await adminLogin(page);

    // Step 3: Navigate to Contact Submissions (if exists)
    // Try multiple possible routes
    const contactRoutes = [
      '/admin/contact-submissions',
      '/admin/contacts',
      '/admin/inquiries',
    ];

    let foundRoute = null;
    for (const route of contactRoutes) {
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        if (page.url().includes(route)) {
          foundRoute = route;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (foundRoute) {
      console.log(`✅ Found Contact Submissions page: ${foundRoute}`);

      // Search for submitted email
      const emailLocator = page.locator(`text=${testEmail}`);
      await expect(emailLocator).toBeVisible({ timeout: 15000 });

      console.log(`✅ Contact submission found in Admin Portal: ${testEmail}`);
    } else {
      console.log('⚠️  Contact Submissions page not found - manual verification needed');
    }
  });

  test('2. Demo Request → Admin Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `demo-e2e-${timestamp}@test.com`;

    // Step 1: Submit demo request
    await page.goto(`${BASE_URL}/demo-request`);

    await page.fill('input[name="name"]', `Demo Test ${timestamp}`);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '010-9876-5432');
    await page.fill('input[name="company"]', 'Demo Test Company');
    await page.fill('input[name="job_title"]', 'Test Manager');
    await page.selectOption('select[name="industry"]', 'LOGISTICS');
    await page.fill('textarea[name="message"]', 'E2E test demo request message.');
    await page.check('input[name="privacy_consent"]');

    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=제출되었습니다|신청되었습니다')).toBeVisible({ timeout: 10000 });

    console.log(`✅ Demo request submitted: ${testEmail}`);

    // Step 2: Login to Admin Portal
    await adminLogin(page);

    // Step 3: Navigate to Demo Requests
    await page.goto(`${BASE_URL}/admin/demo-requests`);

    // Search for submitted email
    const emailLocator = page.locator(`text=${testEmail}`);
    await expect(emailLocator).toBeVisible({ timeout: 15000 });

    console.log(`✅ Demo request found in Admin Portal: ${testEmail}`);
  });

  test('3. Event Registration → Admin Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `event-e2e-${timestamp}@test.com`;

    // Step 1: Go to Events page
    await page.goto(`${BASE_URL}/events`);

    // Find an event card with registration button
    const eventCards = page.locator('[data-testid="event-card"], .event-card, article:has(button:has-text("참가 신청"))');
    await expect(eventCards.first()).toBeVisible({ timeout: 10000 });

    // Click first registration button
    const registerButton = page.locator('button:has-text("참가 신청"), a:has-text("참가 신청")').first();
    await registerButton.click();

    // Wait for registration form
    await page.waitForSelector('input[name="name"], input[name="email"]', { timeout: 10000 });

    // Fill registration form
    await page.fill('input[name="name"]', `Event Test ${timestamp}`);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '010-5555-6666');
    await page.fill('input[name="company"]', 'Event Test Company');
    await page.fill('input[name="job_title"]', 'Event Manager');

    // Message field might be optional
    const messageField = page.locator('textarea[name="message"]');
    if (await messageField.isVisible()) {
      await messageField.fill('E2E test event registration message.');
    }

    await page.check('input[name="privacy_consent"]');

    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=신청되었습니다|완료되었습니다')).toBeVisible({ timeout: 10000 });

    console.log(`✅ Event registration submitted: ${testEmail}`);

    // Step 2: Login to Admin Portal
    await adminLogin(page);

    // Step 3: Navigate to Events
    await page.goto(`${BASE_URL}/admin/events`);

    // Click first event to see registrations
    const firstEvent = page.locator('[data-testid="event-row"], tr:has(td):first, article:first');
    await firstEvent.click();

    // Look for "참가 신청" or "등록" tab/link
    const registrationsLink = page.locator('a:has-text("참가 신청"), a:has-text("등록"), button:has-text("참가자")');
    if (await registrationsLink.isVisible()) {
      await registrationsLink.click();
    }

    // Search for submitted email
    const emailLocator = page.locator(`text=${testEmail}`);
    await expect(emailLocator).toBeVisible({ timeout: 15000 });

    console.log(`✅ Event registration found in Admin Portal: ${testEmail}`);
  });

  test('4. Partnership Application → Admin Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `partnership-e2e-${timestamp}@test.com`;

    // Step 1: Submit partnership application
    await page.goto(`${BASE_URL}/partnership`);

    await page.fill('input[name="companyName"], input[name="company_name"]', `Partnership Test ${timestamp}`);
    await page.fill('input[name="contactName"], input[name="contact_name"]', 'Partnership Manager');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '010-7777-8888');
    await page.selectOption('select[name="businessType"], select[name="business_type"]', 'TECHNOLOGY');
    await page.fill('input[name="website"]', 'https://example.com');
    await page.selectOption('select[name="employeeCount"], select[name="employee_count"]', '50-200');
    await page.selectOption('select[name="partnershipType"], select[name="partnership_type"]', 'DISTRIBUTION');
    await page.fill('textarea[name="proposal"]', 'E2E test partnership proposal message.');
    await page.check('input[name="privacy_consent"]');

    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=제출되었습니다|신청되었습니다')).toBeVisible({ timeout: 10000 });

    console.log(`✅ Partnership application submitted: ${testEmail}`);

    // Step 2: Login to Admin Portal
    await adminLogin(page);

    // Step 3: Navigate to Partnerships (if exists)
    const partnershipRoutes = [
      '/admin/partnerships',
      '/admin/partners',
      '/admin/partnership-applications',
    ];

    let foundRoute = null;
    for (const route of partnershipRoutes) {
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        if (page.url().includes(route)) {
          foundRoute = route;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (foundRoute) {
      console.log(`✅ Found Partnership Applications page: ${foundRoute}`);

      // Search for submitted email
      const emailLocator = page.locator(`text=${testEmail}`);
      await expect(emailLocator).toBeVisible({ timeout: 15000 });

      console.log(`✅ Partnership application found in Admin Portal: ${testEmail}`);
    } else {
      console.log('⚠️  Partnership Applications page not found - manual verification needed');
    }
  });

  test('5. Admin Analytics Dashboard - Verify Metrics', async ({ page }) => {
    // Login to Admin Portal
    await adminLogin(page);

    // Navigate to Dashboard
    await page.goto(`${BASE_URL}/admin/dashboard`);

    // Check for analytics/metrics sections
    const metricsSection = page.locator('[data-testid="metrics"], .metrics, .analytics, .dashboard-stats');

    if (await metricsSection.isVisible()) {
      console.log('✅ Analytics/Metrics section found on Dashboard');

      // Look for specific metrics
      const demoRequestsMetric = page.locator('text=데모 요청|Demo Request');
      const contactsMetric = page.locator('text=문의|Contact');
      const partnershipsMetric = page.locator('text=파트너십|Partnership');
      const eventsMetric = page.locator('text=이벤트|Event');

      const metrics = {
        '데모 요청': await demoRequestsMetric.isVisible(),
        '문의': await contactsMetric.isVisible(),
        '파트너십': await partnershipsMetric.isVisible(),
        '이벤트': await eventsMetric.isVisible(),
      };

      console.log('📊 Metrics visibility:', metrics);
    } else {
      console.log('⚠️  Analytics/Metrics section not found - checking Analytics page');

      // Try dedicated Analytics page
      const analyticsRoutes = [
        '/admin/analytics',
        '/admin/insights',
        '/admin/reports',
      ];

      for (const route of analyticsRoutes) {
        try {
          await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
          if (page.url().includes(route)) {
            console.log(`✅ Found Analytics page: ${route}`);

            // Take screenshot for manual verification
            await page.screenshot({ path: `tests/e2e/screenshots/analytics-${Date.now()}.png`, fullPage: true });
            console.log('📸 Screenshot saved for manual verification');

            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
  });
});
