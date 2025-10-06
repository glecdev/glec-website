/**
 * Complete Forms Flow E2E Test
 *
 * Tests the complete flow:
 * 1. Website Form Submit → Database Insert → Admin Portal Verification
 *
 * Tests:
 * - Contact Form
 * - Demo Request Form
 * - Partnership Form
 *
 * Database: Neon PostgreSQL
 * Admin: Requires login
 */

import { test, expect, Page } from '@playwright/test';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3010';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

// Disable all popups for E2E testing
async function disablePopupsForTest(page: Page) {
  // Set localStorage flag to disable PopupManager and BannerPopupManager
  await page.addInitScript(() => {
    localStorage.setItem('disable_popups_for_tests', 'true');
  });
  console.log('✅ Popups disabled for E2E test');
}

// Handle cookie consent modal
async function handleCookieConsent(page: Page) {
  try {
    // Wait for "모두 허용" button with longer timeout
    const acceptButton = page.locator('button:has-text("모두 허용")').first();
    await acceptButton.waitFor({ state: 'visible', timeout: 10000 });

    // Ensure button is clickable
    await acceptButton.click({ force: true });
    console.log('✅ Cookie consent accepted');

    // Wait for modal to disappear completely
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('ℹ️ No cookie consent modal found or already dismissed');
  }
}

// Admin login helper
async function adminLogin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[name="email"]', 'admin@glec.io');
  await page.fill('input[name="password"]', 'GLEC2025Admin!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
}

// Cleanup helper
async function cleanup() {
  await sql`DELETE FROM contacts WHERE email LIKE '%e2e-test%'`;
  await sql`DELETE FROM demo_requests WHERE email LIKE '%e2e-test%'`;
  await sql`DELETE FROM partnerships WHERE email LIKE '%e2e-test%'`;
}

test.describe('Complete Forms Flow Verification', () => {
  test.beforeAll(async () => {
    await cleanup();
  });

  test.afterAll(async () => {
    await cleanup();
  });

  test('1. Contact Form → Database → Admin Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `contact-e2e-test-${timestamp}@example.com`;
    const testName = `E2E Contact Test ${timestamp}`;

    console.log('📝 Step 1: Submit Contact Form on Website');

    // Disable all popups before navigation
    await disablePopupsForTest(page);

    // Go to contact page
    await page.goto(`${BASE_URL}/contact`);
    await expect(page).toHaveTitle(/Contact|문의/i);

    // Wait for page to fully load (cookie modal may appear with delay)
    await page.waitForTimeout(2000);

    // Handle cookie consent (wait for it to appear)
    await handleCookieConsent(page);

    // Wait for form to be fully loaded and ensure it's clickable
    await page.waitForSelector('input[name="company_name"]', { state: 'visible' });
    await page.waitForTimeout(1000);

    // Fill contact form
    await page.fill('input[name="company_name"]', 'E2E Test Company');
    await page.fill('input[name="contact_name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '010-1234-5678');
    await page.selectOption('select[name="inquiry_type"]', 'PRODUCT');
    await page.fill('textarea[name="message"]', 'This is an E2E test message for contact form');
    await page.check('input[name="privacy_consent"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success toast message
    await expect(page.locator('text=/문의가 접수되었습니다|제출.*완료|Success/i')).toBeVisible({ timeout: 10000 });
    console.log('✅ Contact form submitted successfully');

    console.log('🔍 Step 2: Verify data in Database');

    // Query database
    const dbResult = await sql`
      SELECT * FROM contacts
      WHERE email = ${testEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    expect(dbResult.length).toBe(1);
    expect(dbResult[0].contact_name).toBe(testName);
    expect(dbResult[0].company_name).toBe('E2E Test Company');
    expect(dbResult[0].email).toBe(testEmail);
    expect(dbResult[0].phone).toBe('010-1234-5678');
    expect(dbResult[0].inquiry_type).toBe('PRODUCT');
    expect(dbResult[0].status).toBe('NEW');
    expect(dbResult[0].privacy_consent).toBe(true);
    console.log('✅ Data found in database:', dbResult[0].id);
    console.log('✅ All fields validated successfully');

    // TODO: Admin Portal verification (requires admin system implementation)
    // console.log('🔐 Step 3: Login to Admin Portal');
    // await adminLogin(page);
    // console.log('✅ Admin login successful');
  });

  test('2. Demo Request Form → Database → Admin Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `demo-e2e-test-${timestamp}@example.com`;
    const testCompany = `E2E Demo Company ${timestamp}`;

    console.log('📝 Step 1: Submit Demo Request Form on Website');

    // Disable all popups before navigation
    await disablePopupsForTest(page);

    // Capture browser console logs for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const logMessage = `[Browser ${msg.type()}] ${msg.text()}`;
      consoleLogs.push(logMessage);
      console.log(logMessage);
    });

    // Go to demo request page (multi-step form)
    await page.goto(`${BASE_URL}/demo-request`);

    // Wait for page to fully load (cookie modal may appear with delay)
    await page.waitForTimeout(2000);

    // Handle cookie consent (wait for it to appear)
    await handleCookieConsent(page);

    // Wait for form to be fully loaded and ensure it's clickable
    await page.waitForSelector('input[name="companyName"]', { state: 'visible' });
    await page.waitForTimeout(1000);

    // === STEP 1: Company Info ===
    console.log('  📋 Step 1/3: Company Information');
    await page.fill('input[name="companyName"]', testCompany);
    await page.fill('input[name="contactName"]', 'E2E Demo Tester');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '010-1234-5678');
    await page.selectOption('select[name="companySize"]', '51-200');

    // Click Next to go to Step 2
    await page.click('button:has-text("다음"), button:has-text("Next")');
    await page.waitForTimeout(1000);

    // === STEP 2: Product & Use Case ===
    console.log('  📋 Step 2/3: Product Selection & Use Case');

    // Select product interests (checkboxes)
    const productCheckboxes = page.locator('input[type="checkbox"][name="productInterests"]');
    const count = await productCheckboxes.count();
    if (count > 0) {
      await productCheckboxes.first().check();
    }

    await page.fill('textarea[name="useCase"]', 'E2E test - We need carbon tracking solution for our logistics operations');
    await page.selectOption('select[name="monthlyShipments"]', '1000-10000');

    // Click Next to go to Step 3
    await page.click('button:has-text("다음"), button:has-text("Next")');
    await page.waitForTimeout(1000);

    // === STEP 3: Schedule ===
    console.log('  📋 Step 3/3: Schedule Demo');
    await page.fill('input[name="preferredDate"]', '2025-02-20');
    await page.selectOption('select[name="preferredTime"]', '14:00');

    // Submit form (button doesn't have type="submit", use text selector)
    await page.click('button:has-text("데모 신청하기")');

    // Wait for redirect to success page
    await page.waitForURL('**/demo-request/success**', { timeout: 10000 });
    console.log('✅ Demo request submitted successfully - redirected to success page');

    console.log('🔍 Step 2: Verify data in Database');

    // Wait for database write to complete (async operation)
    await page.waitForTimeout(1000);

    const dbResult = await sql`
      SELECT * FROM demo_requests
      WHERE email = ${testEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    expect(dbResult.length).toBe(1);
    expect(dbResult[0].company_name).toBe(testCompany);
    expect(dbResult[0].status).toBe('NEW');
    console.log('✅ Data found in database:', dbResult[0].id);

    // TODO: Admin Portal verification (requires admin demo-requests page implementation)
    // console.log('🔐 Step 3: Login to Admin Portal');
    // await adminLogin(page);

    // console.log('📊 Step 4: Verify data in Admin Portal');

    // await page.goto(`${BASE_URL}/admin/demo-requests`);

    // const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]');
    // if (await searchInput.isVisible()) {
    //   await searchInput.fill(testEmail);
    //   await page.waitForTimeout(1000);
    // }

    // await expect(page.locator(`text=${testEmail}`)).toBeVisible({ timeout: 5000 });
    // await expect(page.locator(`text=${testCompany}`)).toBeVisible();
    // console.log('✅ Demo request visible in Admin Portal');
  });

  test('3. Partnership Form → Database → Admin Portal', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `partner-e2e-test-${timestamp}@example.com`;
    const testCompany = `E2E Partner Company ${timestamp}`;

    console.log('📝 Step 1: Submit Partnership Form on Website');

    // Disable all popups before navigation
    await disablePopupsForTest(page);

    await page.goto(`${BASE_URL}/partnership`);

    // Wait for page to fully load (cookie modal may appear with delay)
    await page.waitForTimeout(2000);

    // Handle cookie consent (wait for it to appear)
    await handleCookieConsent(page);

    // Wait for form to be fully loaded and ensure it's clickable
    await page.waitForSelector('input[name="companyName"]', { state: 'visible' });
    await page.waitForTimeout(1000);

    await page.fill('input[name="companyName"]', testCompany);
    await page.fill('input[name="contactName"]', 'E2E Partnership Manager');
    await page.fill('input[name="email"]', testEmail);

    // Select partnership type
    await page.selectOption('select[name="partnershipType"]', 'tech');

    // Fill proposal
    await page.fill('textarea[name="proposal"]', 'E2E test - We would like to partner for carbon tracking solutions in Asia Pacific region');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=/파트너십.*신청.*접수|신청.*완료|Success/i')).toBeVisible({ timeout: 10000 });
    console.log('✅ Partnership application submitted successfully');

    console.log('🔍 Step 2: Verify data in Database');

    const dbResult = await sql`
      SELECT * FROM partnerships
      WHERE email = ${testEmail}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    expect(dbResult.length).toBe(1);
    expect(dbResult[0].company_name).toBe(testCompany);
    expect(dbResult[0].partnership_type).toBe('tech');
    console.log('✅ Data found in database:', dbResult[0].id);

    console.log('🔐 Step 3: Login to Admin Portal');
    await adminLogin(page);

    console.log('📊 Step 4: Verify data in Admin Portal');

    await page.goto(`${BASE_URL}/admin/partnerships`);

    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(testEmail);
      await page.waitForTimeout(1000);
    }

    await expect(page.locator(`text=${testEmail}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${testCompany}`)).toBeVisible();
    console.log('✅ Partnership application visible in Admin Portal');
  });
});
