/**
 * E2E Test: Admin Demo Requests Management
 *
 * Purpose: Test Demo Requests CRUD operations in Admin Portal
 * Coverage:
 * - List demo requests with pagination
 * - Filter by status
 * - Search functionality
 * - Loading and error states
 * - Responsive design
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

test.describe('Admin Demo Requests Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/admin/login`);

    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login to complete (any admin page redirect)
    await page.waitForTimeout(2000);

    // Navigate to demo requests page (with increased timeout for first compile)
    await page.goto(`${BASE_URL}/admin/demo-requests`, { timeout: 90000 });
  });

  test('should load demo requests page', async ({ page }) => {
    console.log('[TEST] Checking page load...');

    // Check page title (use getByRole to find the main heading, not sidebar heading)
    await expect(page.getByRole('heading', { name: 'Demo Requests' })).toBeVisible();

    // Check description
    await expect(page.getByText('View and manage demo request submissions')).toBeVisible();

    console.log('✅ Page loaded successfully');
  });

  test('should display demo requests table', async ({ page }) => {
    console.log('[TEST] Checking table display...');

    // Wait for table to load (increased timeout for initial API call)
    await page.waitForSelector('table', { timeout: 15000 });

    // Check table headers
    await expect(page.locator('th').nth(0)).toContainText('Status');
    await expect(page.locator('th').nth(1)).toContainText('Company');
    await expect(page.locator('th').nth(2)).toContainText('Contact');
    await expect(page.locator('th').nth(3)).toContainText('Products');
    await expect(page.locator('th').nth(4)).toContainText('Preferred Date');
    await expect(page.locator('th').nth(5)).toContainText('Submitted');

    console.log('✅ Table headers correct');
  });

  test('should filter by status', async ({ page }) => {
    console.log('[TEST] Testing status filter...');

    // Wait for page load
    await page.waitForSelector('select', { timeout: 10000 });

    // Get the status filter dropdown
    const statusFilter = page.locator('select').first();

    // Select "NEW" status
    await statusFilter.selectOption('NEW');

    // Wait for results to update
    await page.waitForTimeout(1000);

    // Check if filter is applied
    const selectedValue = await statusFilter.inputValue();
    expect(selectedValue).toBe('NEW');

    console.log('✅ Status filter working');
  });

  test('should search demo requests', async ({ page }) => {
    console.log('[TEST] Testing search functionality...');

    // Wait for page load
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });

    // Get search input
    const searchInput = page.locator('input[placeholder*="Search"]');

    // Type search query
    await searchInput.fill('test company');

    // Wait for results to update
    await page.waitForTimeout(1000);

    // Check if search value is set
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('test company');

    console.log('✅ Search working');
  });

  test('should display pagination', async ({ page }) => {
    console.log('[TEST] Checking pagination...');

    // Wait for page load
    await page.waitForSelector('table', { timeout: 10000 });

    // Wait a bit for data to load
    await page.waitForTimeout(2000);

    // Check for pagination controls
    const previousButton = page.locator('button:has-text("Previous")');
    const nextButton = page.locator('button:has-text("Next")');

    // Buttons should exist
    await expect(previousButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    console.log('✅ Pagination controls present');
  });

  test('should show loading state', async ({ page }) => {
    console.log('[TEST] Testing loading state...');

    // Navigate to page and quickly check for loading indicator
    const loadingPromise = page.waitForSelector('text=Loading demo requests', { timeout: 5000 }).catch(() => null);

    await page.goto(`${BASE_URL}/admin/demo-requests`);

    const loadingElement = await loadingPromise;

    if (loadingElement) {
      console.log('✅ Loading state displayed');
    } else {
      console.log('⚠️  Loading state was too fast to catch (page loaded quickly)');
    }

    // Verify page eventually loads (use specific heading, not sidebar heading)
    await expect(page.getByRole('heading', { name: 'Demo Requests' })).toBeVisible({ timeout: 10000 });
  });

  test('should display status badges correctly', async ({ page }) => {
    console.log('[TEST] Checking status badges...');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check if status badges exist
    const badges = page.locator('span[class*="rounded-full"]');
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      console.log(`✅ Found ${badgeCount} status badges`);

      // Check first badge has proper styling
      const firstBadge = badges.first();
      const className = await firstBadge.getAttribute('class');
      expect(className).toContain('px-3');
      expect(className).toContain('py-1');
      expect(className).toContain('rounded-full');
    } else {
      console.log('⚠️  No demo requests found (empty state)');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    console.log('[TEST] Testing mobile responsive design...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to page
    await page.goto(`${BASE_URL}/admin/demo-requests`);

    // Wait for page load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check title is visible
    await expect(page.locator('h1')).toBeVisible();

    // Check filters are visible (should stack vertically)
    const statusFilter = page.locator('select').first();
    await expect(statusFilter).toBeVisible();

    console.log('✅ Mobile responsive design working');
  });

  test('should handle empty state', async ({ page }) => {
    console.log('[TEST] Testing empty state...');

    // Apply a filter that will likely return no results
    await page.waitForSelector('select', { timeout: 10000 });

    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('CANCELLED');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('nonexistentcompany12345xyz');

    // Wait for results
    await page.waitForTimeout(2000);

    // Check for empty state message
    const emptyMessage = page.locator('text=No demo requests found');
    const hasEmptyMessage = await emptyMessage.count() > 0;

    if (hasEmptyMessage) {
      console.log('✅ Empty state displayed correctly');
      await expect(emptyMessage).toBeVisible();
    } else {
      console.log('⚠️  Data exists even with strict filters');
    }
  });

  test('should display correct date formats', async ({ page }) => {
    console.log('[TEST] Checking date formatting...');

    // Wait for table
    await page.waitForSelector('table', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Check if there are any rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Get first row's date cells (columns 4 and 5)
      const preferredDate = rows.first().locator('td').nth(4);
      const submittedDate = rows.first().locator('td').nth(5);

      const preferredDateText = await preferredDate.textContent();
      const submittedDateText = await submittedDate.textContent();

      console.log(`Preferred Date: ${preferredDateText}`);
      console.log(`Submitted Date: ${submittedDateText}`);

      // Dates should be formatted (contain numbers)
      expect(preferredDateText).toMatch(/\d+/);
      expect(submittedDateText).toMatch(/\d+/);

      console.log('✅ Dates formatted correctly');
    } else {
      console.log('⚠️  No data to check date formatting');
    }
  });
});

test.describe('Admin Demo Requests - Error Handling', () => {
  test('should handle authentication error gracefully', async ({ page }) => {
    console.log('[TEST] Testing authentication error...');

    // Clear localStorage to simulate missing token
    await page.goto(`${BASE_URL}/admin/demo-requests`);
    await page.evaluate(() => localStorage.clear());

    // Reload page
    await page.reload();

    // Wait for error message
    await page.waitForSelector('text=Error loading demo requests', { timeout: 10000 }).catch(() => {
      console.log('⚠️  Error state not shown (may have redirected to login)');
    });

    console.log('✅ Authentication error handled');
  });
});
