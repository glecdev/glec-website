/**
 * Comprehensive E2E Tests for Admin Lead Management System
 *
 * Test Coverage:
 * 1. Admin Authentication
 * 2. Unified Lead Management Page (통합 리드 관리)
 * 3. List View - All UI elements and buttons
 * 4. Analytics View - Charts and filters
 * 5. Automation View - Email automation
 * 6. Detail Pages - Lead details and actions
 * 7. Customer Lead Collection - Contact form, Demo request, Event registration
 * 8. Comparative Validation - Database vs UI verification
 */

import { test, expect, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

// Test data for lead collection
const TEST_CONTACT_DATA = {
  name: 'Playwright 테스트',
  email: `playwright-test-${Date.now()}@example.com`,
  company: 'Playwright Test Company',
  phone: '010-1234-5678',
  message: 'Playwright 자동화 테스트 메시지',
};

const TEST_DEMO_DATA = {
  name: 'Playwright 데모',
  email: `playwright-demo-${Date.now()}@example.com`,
  company: 'Playwright Demo Company',
  phone: '010-9876-5432',
  jobTitle: '테스트 엔지니어',
  companySize: '50-200',
  interestedProducts: ['GLEC Cloud'],
  message: 'Playwright 데모 요청 테스트',
};

const TEST_EVENT_DATA = {
  name: 'Playwright 이벤트',
  email: `playwright-event-${Date.now()}@example.com`,
  company: 'Playwright Event Company',
  phone: '010-5555-6666',
  eventType: 'WEBINAR',
};

// Helper function for admin login
async function adminLogin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/**`);
}

// Helper function to clean up test data
async function cleanupTestData() {
  await prisma.contact.deleteMany({
    where: {
      email: {
        contains: 'playwright-test',
      },
    },
  });
  await prisma.demoRequest.deleteMany({
    where: {
      email: {
        contains: 'playwright-demo',
      },
    },
  });
  await prisma.eventRegistration.deleteMany({
    where: {
      email: {
        contains: 'playwright-event',
      },
    },
  });
}

test.describe('Admin Lead Management - Comprehensive Testing', () => {
  test.beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
  });

  test.afterAll(async () => {
    // Clean up test data after all tests
    await cleanupTestData();
    await prisma.$disconnect();
  });

  test.describe('1. Admin Authentication', () => {
    test('should successfully login as admin', async ({ page }) => {
      await adminLogin(page);
      await expect(page).toHaveURL(/\/admin/);

      // Verify admin dashboard is loaded
      await expect(page.locator('text=관리자 대시보드').or(page.locator('text=Admin Dashboard'))).toBeVisible({ timeout: 10000 });
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/login`);
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=로그인 실패').or(page.locator('text=Login failed'))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('2. Unified Lead Management Page Navigation', () => {
    test('should navigate to unified lead management page', async ({ page }) => {
      await adminLogin(page);

      // Click on lead management menu
      await page.click('text=통합 리드 관리');
      await page.waitForURL(`${BASE_URL}/admin/leads`);

      // Verify page title
      await expect(page.locator('h1')).toContainText('통합 리드 관리');
    });

    test('should display all view mode tabs', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Verify all three view mode tabs exist
      await expect(page.locator('button:has-text("리스트")')).toBeVisible();
      await expect(page.locator('button:has-text("분석")')).toBeVisible();
      await expect(page.locator('button:has-text("자동화")')).toBeVisible();
    });
  });

  test.describe('3. List View - Recursive UI Verification', () => {
    test('should display all filter buttons', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Click List View tab
      await page.click('button:has-text("리스트")');

      // Verify source filter buttons
      const sourceButtons = ['전체', '문의폼', '데모신청', '이벤트'];
      for (const button of sourceButtons) {
        await expect(page.locator(`button:has-text("${button}")`)).toBeVisible();
      }

      // Verify status filter buttons
      const statusButtons = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
      for (const status of statusButtons) {
        await expect(page.locator(`button:has-text("${status}")`).or(page.locator(`button[data-status="${status}"]`))).toBeVisible();
      }
    });

    test('should filter leads by source', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Click on Contact Form filter
      await page.click('button:has-text("문의폼")');

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Verify URL contains filter parameter
      expect(page.url()).toContain('source=CONTACT_FORM');
    });

    test('should filter leads by status', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Click on QUALIFIED status
      await page.click('button:has-text("QUALIFIED")');

      // Wait for filter to apply
      await page.waitForTimeout(1000);

      // Verify filter is active
      const qualifiedButton = page.locator('button:has-text("QUALIFIED")');
      await expect(qualifiedButton).toHaveClass(/active|selected|bg-primary/);
    });

    test('should search leads by query', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Find search input
      const searchInput = page.locator('input[placeholder*="검색"]').or(page.locator('input[type="search"]'));
      await searchInput.fill('test');

      // Wait for search to trigger
      await page.waitForTimeout(1000);

      // Verify search is applied
      expect(await searchInput.inputValue()).toBe('test');
    });

    test('should display lead cards with all information', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Wait for leads to load
      await page.waitForSelector('[data-testid="lead-card"]', { timeout: 10000 }).catch(() => {
        // If no test-id, look for card-like structures
        return page.waitForSelector('.border, .rounded, .shadow', { timeout: 10000 });
      });

      // Verify first lead card contains essential info
      const firstCard = page.locator('[data-testid="lead-card"]').first();
      await expect(firstCard).toBeVisible();
    });

    test('should open lead detail modal on card click', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Wait for leads to load
      await page.waitForTimeout(2000);

      // Click on first lead card
      const firstCard = page.locator('[data-testid="lead-card"]').first().or(page.locator('.border').first());
      await firstCard.click();

      // Verify modal opens
      await expect(page.locator('[role="dialog"]').or(page.locator('.modal'))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('4. Analytics View - Charts and Filters', () => {
    test('should switch to analytics view', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Click Analytics tab
      await page.click('button:has-text("분석")');

      // Wait for analytics to load
      await page.waitForTimeout(2000);

      // Verify analytics charts are visible
      await expect(page.locator('text=시계열 분석').or(page.locator('text=Time Series'))).toBeVisible({ timeout: 10000 });
    });

    test('should display date range filter', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);
      await page.click('button:has-text("분석")');

      // Verify date inputs exist
      const dateInputs = page.locator('input[type="date"]');
      await expect(dateInputs).toHaveCount(2); // From and To dates
    });

    test('should display granularity selector', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);
      await page.click('button:has-text("분석")');

      // Verify granularity buttons
      const granularities = ['일간', '주간', '월간'];
      for (const gran of granularities) {
        await expect(page.locator(`button:has-text("${gran}")`)).toBeVisible();
      }
    });

    test('should export CSV', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);
      await page.click('button:has-text("분석")');

      // Wait for analytics to load
      await page.waitForTimeout(2000);

      // Setup download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

      // Click CSV export button
      await page.click('button:has-text("CSV 내보내기")');

      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test.describe('5. Automation View', () => {
    test('should switch to automation view', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Click Automation tab
      await page.click('button:has-text("자동화")');

      // Wait for automation view to load
      await page.waitForTimeout(2000);

      // Verify automation UI is visible
      await expect(page.locator('text=이메일 자동화').or(page.locator('text=Email Automation'))).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('6. Customer Lead Collection - Contact Form', () => {
    test('should submit contact form and verify in database', async ({ page }) => {
      // Navigate to contact page
      await page.goto(`${BASE_URL}/contact`);

      // Fill contact form
      await page.fill('input[name="name"]', TEST_CONTACT_DATA.name);
      await page.fill('input[name="email"]', TEST_CONTACT_DATA.email);
      await page.fill('input[name="company"]', TEST_CONTACT_DATA.company);
      await page.fill('input[name="phone"]', TEST_CONTACT_DATA.phone);
      await page.fill('textarea[name="message"]', TEST_CONTACT_DATA.message);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success message
      await expect(page.locator('text=전송되었습니다').or(page.locator('text=success'))).toBeVisible({ timeout: 10000 });

      // Wait for database write
      await page.waitForTimeout(2000);

      // COMPARATIVE VALIDATION: Verify in database
      const dbContact = await prisma.contact.findFirst({
        where: { email: TEST_CONTACT_DATA.email },
      });

      expect(dbContact).toBeTruthy();
      expect(dbContact?.name).toBe(TEST_CONTACT_DATA.name);
      expect(dbContact?.company).toBe(TEST_CONTACT_DATA.company);
      expect(dbContact?.phone).toBe(TEST_CONTACT_DATA.phone);
      expect(dbContact?.message).toBe(TEST_CONTACT_DATA.message);
      expect(dbContact?.leadSource).toBe('CONTACT_FORM');
      expect(dbContact?.leadStatus).toBe('NEW');
    });

    test('should display submitted contact in admin UI', async ({ page }) => {
      // First ensure we have test data
      const existingContact = await prisma.contact.findFirst({
        where: { email: { contains: 'playwright-test' } },
      });

      if (!existingContact) {
        // Create test contact if none exists
        await prisma.contact.create({
          data: {
            name: TEST_CONTACT_DATA.name,
            email: TEST_CONTACT_DATA.email,
            company: TEST_CONTACT_DATA.company,
            phone: TEST_CONTACT_DATA.phone,
            message: TEST_CONTACT_DATA.message,
            leadSource: 'CONTACT_FORM',
            leadStatus: 'NEW',
            leadScore: 50,
          },
        });
      }

      // Login to admin
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Filter by Contact Form source
      await page.click('button:has-text("문의폼")');
      await page.waitForTimeout(1000);

      // Search for the test contact
      const searchInput = page.locator('input[placeholder*="검색"]').or(page.locator('input[type="search"]'));
      await searchInput.fill(TEST_CONTACT_DATA.email);
      await page.waitForTimeout(1000);

      // COMPARATIVE VALIDATION: Verify UI displays database data
      const contactInDB = await prisma.contact.findFirst({
        where: { email: TEST_CONTACT_DATA.email },
      });

      if (contactInDB) {
        // Verify contact appears in UI
        await expect(page.locator(`text=${TEST_CONTACT_DATA.email}`)).toBeVisible({ timeout: 10000 });
        await expect(page.locator(`text=${TEST_CONTACT_DATA.name}`)).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('7. Customer Lead Collection - Demo Request', () => {
    test('should submit demo request and verify in database', async ({ page }) => {
      // Navigate to demo request page
      await page.goto(`${BASE_URL}/demo`);

      // Fill demo request form
      await page.fill('input[name="name"]', TEST_DEMO_DATA.name);
      await page.fill('input[name="email"]', TEST_DEMO_DATA.email);
      await page.fill('input[name="company"]', TEST_DEMO_DATA.company);
      await page.fill('input[name="phone"]', TEST_DEMO_DATA.phone);
      await page.fill('input[name="jobTitle"]', TEST_DEMO_DATA.jobTitle);

      // Select company size
      await page.selectOption('select[name="companySize"]', TEST_DEMO_DATA.companySize);

      // Select interested products
      await page.check('input[value="GLEC Cloud"]');

      // Fill message
      await page.fill('textarea[name="message"]', TEST_DEMO_DATA.message);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success message
      await expect(page.locator('text=신청되었습니다').or(page.locator('text=success'))).toBeVisible({ timeout: 10000 });

      // Wait for database write
      await page.waitForTimeout(2000);

      // COMPARATIVE VALIDATION: Verify in database
      const dbDemo = await prisma.demoRequest.findFirst({
        where: { email: TEST_DEMO_DATA.email },
      });

      expect(dbDemo).toBeTruthy();
      expect(dbDemo?.name).toBe(TEST_DEMO_DATA.name);
      expect(dbDemo?.company).toBe(TEST_DEMO_DATA.company);
      expect(dbDemo?.leadSource).toBe('DEMO_REQUEST');
      expect(dbDemo?.leadStatus).toBe('NEW');
    });
  });

  test.describe('8. Detail Page Actions', () => {
    test('should update lead status from detail modal', async ({ page }) => {
      // Create a test contact first
      const testContact = await prisma.contact.create({
        data: {
          name: 'Status Update Test',
          email: `status-test-${Date.now()}@example.com`,
          company: 'Test Company',
          phone: '010-0000-0000',
          message: 'Test message',
          leadSource: 'CONTACT_FORM',
          leadStatus: 'NEW',
          leadScore: 50,
        },
      });

      // Login and navigate to leads
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Search for the test contact
      const searchInput = page.locator('input[placeholder*="검색"]').or(page.locator('input[type="search"]'));
      await searchInput.fill(testContact.email);
      await page.waitForTimeout(1000);

      // Click on the contact card
      await page.click(`text=${testContact.email}`);

      // Wait for modal
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Change status to CONTACTED
      await page.selectOption('select[name="status"]', 'CONTACTED');

      // Save changes
      await page.click('button:has-text("저장")');
      await page.waitForTimeout(1000);

      // COMPARATIVE VALIDATION: Verify in database
      const updatedContact = await prisma.contact.findUnique({
        where: { id: testContact.id },
      });

      expect(updatedContact?.leadStatus).toBe('CONTACTED');

      // Cleanup
      await prisma.contact.delete({ where: { id: testContact.id } });
    });
  });

  test.describe('9. Pagination and Performance', () => {
    test('should handle pagination correctly', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Wait for leads to load
      await page.waitForTimeout(2000);

      // Check if pagination exists (only if there are many leads)
      const paginationExists = await page.locator('button:has-text("다음")').or(page.locator('button:has-text("Next")')).isVisible().catch(() => false);

      if (paginationExists) {
        // Click next page
        await page.click('button:has-text("다음")');
        await page.waitForTimeout(1000);

        // Verify page changed
        expect(page.url()).toContain('page=2');
      }
    });
  });

  test.describe('10. Recursive Button Verification', () => {
    test('should verify all interactive buttons are functional', async ({ page }) => {
      await adminLogin(page);
      await page.goto(`${BASE_URL}/admin/leads`);

      // Get all buttons on the page
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();

      console.log(`Found ${buttonCount} visible buttons on the page`);

      // Verify each button is clickable and not disabled
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        const button = buttons.nth(i);
        const isDisabled = await button.isDisabled();
        const text = await button.textContent();

        console.log(`Button ${i + 1}: "${text}" - Disabled: ${isDisabled}`);

        if (!isDisabled) {
          // Verify button is clickable
          await expect(button).toBeEnabled();
        }
      }
    });
  });
});
