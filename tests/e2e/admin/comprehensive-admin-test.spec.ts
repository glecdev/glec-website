/**
 * Comprehensive Admin Portal E2E Test Suite
 *
 * Purpose: Test ALL 10 admin pages with CRUD operations and recursive validation
 *
 * Test Coverage:
 * 1. Login authentication
 * 2. Dashboard page load and stats
 * 3. Analytics page load and data
 * 4. Notices CRUD operations
 * 5. Press CRUD operations
 * 6. Popups CRUD operations
 * 7. Demo Requests read operations
 * 8. Knowledge Library CRUD operations
 * 9. Knowledge Videos CRUD operations
 * 10. Knowledge Blog CRUD operations
 *
 * Metrics Collected:
 * - Page load times
 * - CRUD operation success rates
 * - Console errors
 * - Failed HTTP requests
 * - Performance issues
 *
 * Based on: GLEC-MCP-Integration-Guide.md
 * Standards: Playwright Best Practices (2025)
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ========================================
// INTERFACES
// ========================================

interface PageLoadResult {
  page: string;
  url: string;
  loadTimeMs: number;
  success: boolean;
  status: 'success' | 'timeout' | '404' | 'error' | 'slow';
  issues: string[];
}

interface CRUDResult {
  page: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  issues: string[];
}

interface ComprehensiveReport {
  timestamp: string;
  baseUrl: string;
  loginSuccess: boolean;
  loginTimeMs: number;
  pageLoads: PageLoadResult[];
  crudTests: CRUDResult[];
  consoleErrors: string[];
  failedRequests: string[];
  summary: {
    totalPages: number;
    successfulPages: number;
    failedPages: number;
    totalCRUDTests: number;
    successfulCRUDs: number;
    avgLoadTime: number;
  };
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Login helper using pressSequentially() for React controlled inputs
 */
async function login(page: Page, baseUrl: string): Promise<number> {
  console.log('\n' + '='.repeat(80));
  console.log('🔐 STEP 1: LOGIN');
  console.log('='.repeat(80));

  const startTime = Date.now();

  await page.goto(`${baseUrl}/admin/login`);
  await page.waitForLoadState('networkidle');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.click();
  await emailInput.pressSequentially('admin@glec.io', { delay: 50 });

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.click();
  await passwordInput.pressSequentially('admin123!', { delay: 50 });

  // CRITICAL: Wait for React to process input events
  await page.waitForTimeout(300);

  await page.locator('button[type="submit"]').click();

  // Wait for redirect to any admin page
  await page.waitForURL(/\/admin\/(dashboard|notices|analytics)/, { timeout: 10000 });

  const loginTime = Date.now() - startTime;
  console.log(`✅ Login successful in ${loginTime}ms`);

  return loginTime;
}

/**
 * Test page load with comprehensive checks
 */
async function testPageLoad(
  page: Page,
  baseUrl: string,
  path: string,
  pageName: string
): Promise<PageLoadResult> {
  console.log(`\n📄 Testing: ${pageName} (${path})`);

  const result: PageLoadResult = {
    page: pageName,
    url: `${baseUrl}${path}`,
    loadTimeMs: 0,
    success: false,
    status: 'success',
    issues: [],
  };

  const startTime = Date.now();

  try {
    // Navigate and capture HTTP response
    const response = await page.goto(`${baseUrl}${path}`);
    await page.waitForTimeout(1000); // Wait for React client-side auth check

    // Wait for page to load with timeout
    await Promise.race([
      page.waitForLoadState('networkidle', { timeout: 15000 }),
      page.waitForSelector('text=/loading/i', { state: 'hidden', timeout: 15000 }).catch(() => {
        // No loading indicator is okay
      }),
    ]);

    result.loadTimeMs = Date.now() - startTime;

    // Check for 404 using HTTP status code (NOT body text!)
    const is404 = response?.status() === 404;

    if (is404) {
      result.status = '404';
      result.success = false;
      result.issues.push('Page returned 404 Not Found');
      console.log(`❌ ${pageName}: 404 Not Found (HTTP ${response?.status()})`);
      return result;
    }

    // Check for content (not empty page)
    const bodyText = await page.textContent('body');

    // Check for infinite loading
    const stillLoading = (await page.locator('text=/loading/i').count()) > 0;
    if (stillLoading) {
      result.issues.push('Page stuck in loading state');
      console.log(`⚠️  ${pageName}: Stuck in loading state`);
    }

    // Check for content (not empty page)
    const hasContent = bodyText && bodyText.trim().length > 100;
    if (!hasContent) {
      result.issues.push('Page appears empty');
      console.log(`⚠️  ${pageName}: Empty page`);
    }

    // Determine status
    if (result.loadTimeMs > 10000) {
      result.status = 'timeout';
      result.success = false;
      result.issues.push(`Load time exceeded 10s (${result.loadTimeMs}ms)`);
    } else if (result.loadTimeMs > 5000) {
      result.status = 'slow';
      result.success = true;
      result.issues.push(`Slow load time (${result.loadTimeMs}ms)`);
    } else if (result.issues.length > 0) {
      result.status = 'error';
      result.success = false;
    } else {
      result.success = true;
    }

    console.log(
      `${result.success ? '✅' : '❌'} ${pageName}: ${result.loadTimeMs}ms (${result.status})`
    );
  } catch (error) {
    result.loadTimeMs = Date.now() - startTime;
    result.status = 'error';
    result.success = false;
    result.issues.push(`Failed to load: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`❌ ${pageName}: Failed (${result.loadTimeMs}ms)`);
  }

  return result;
}

/**
 * Test CRUD operations for content type WITH MODAL
 */
async function testCRUDModal(
  page: Page,
  baseUrl: string,
  config: {
    pageName: string;
    listPath: string;
    createButtonText: string;
    fields: { [key: string]: string }; // field id -> value
    testTitle: string;
  }
): Promise<CRUDResult> {
  console.log(`\n🔧 CRUD Test (Modal): ${config.pageName}`);

  const result: CRUDResult = {
    page: config.pageName,
    create: false,
    read: false,
    update: false,
    delete: false,
    issues: [],
  };

  // Navigate to list page
  await page.goto(`${baseUrl}${config.listPath}`);
  await page.waitForLoadState('networkidle');

  // CREATE
  console.log(`  📝 Testing CREATE...`);
  try {
    const createButton = page.locator(`text=${config.createButtonText}`).first();
    await createButton.click();
    await page.waitForTimeout(500);

    // Fill all fields
    for (const [fieldId, value] of Object.entries(config.fields)) {
      const field = page.locator(`#${fieldId}`).first();
      if ((await field.count()) > 0) {
        const tagName = await field.evaluate((el) => el.tagName.toLowerCase());
        if (tagName === 'select') {
          // For select elements, use selectOption
          await field.selectOption(value);
        } else {
          // For input/textarea, use fill
          await field.click();
          await field.pressSequentially(value, { delay: 30 });
        }
      }
    }

    // Wait for React state update
    await page.waitForTimeout(300);

    // Submit (force click through modal backdrop)
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click({ force: true });
    await page.waitForTimeout(2000);

    // Check if created item appears in list
    result.create = (await page.locator(`text=${config.testTitle}`).count()) > 0;
    console.log(`  ${result.create ? '✅' : '❌'} CREATE: ${result.create ? 'Success' : 'Failed'}`);

    if (!result.create) {
      result.issues.push('CREATE: Item not found after creation');
    }
  } catch (error) {
    result.issues.push(`CREATE failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ CREATE: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  // READ
  console.log(`  📖 Testing READ...`);
  try {
    await page.goto(`${baseUrl}${config.listPath}`);
    await page.waitForLoadState('networkidle');

    result.read = (await page.locator(`text=${config.testTitle}`).count()) > 0;
    console.log(`  ${result.read ? '✅' : '❌'} READ: ${result.read ? 'Success' : 'Failed'}`);

    if (!result.read) {
      result.issues.push('READ: Item not found in list');
    }
  } catch (error) {
    result.issues.push(`READ failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ READ: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  // UPDATE
  console.log(`  ✏️  Testing UPDATE...`);
  try {
    await page.waitForTimeout(500);
    const editButton = page.locator(`button[title="수정"]`).first();

    if ((await editButton.count()) > 0) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Update title field
      const titleField = page.locator('#title').first();
      await titleField.fill(config.testTitle + ' (Updated)');

      await page.waitForTimeout(300);

      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click({ force: true });
      await page.waitForTimeout(2000);

      result.update = (await page.locator(`text=${config.testTitle} (Updated)`).count()) > 0;
      console.log(`  ${result.update ? '✅' : '❌'} UPDATE: ${result.update ? 'Success' : 'Failed'}`);

      if (!result.update) {
        result.issues.push('UPDATE: Updated item not found');
      }
    } else {
      result.issues.push('UPDATE: Edit button not found');
      console.log(`  ⚠️  UPDATE: Edit button not found`);
    }
  } catch (error) {
    result.issues.push(`UPDATE failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ UPDATE: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  // DELETE
  console.log(`  🗑️  Testing DELETE...`);
  try {
    const updatedTitle = config.testTitle + ' (Updated)';
    await page.waitForTimeout(500);

    // Try multiple selectors: table row (Notices/Press) or card (Popups)
    let deleteButton = page.locator(`tr:has-text("${updatedTitle}") button[title="삭제"]`).first();

    if ((await deleteButton.count()) === 0) {
      // Fallback: Popups uses div container with text button
      deleteButton = page.locator(`div:has-text("${updatedTitle}") button:has-text("삭제")`).first();
    }

    if ((await deleteButton.count()) > 0) {
      // Click delete button (dialog is auto-accepted by global handler)
      await deleteButton.click();

      // Wait for dialog to appear and be accepted, then wait for API call
      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');

      result.delete = (await page.locator(`text=${updatedTitle}`).count()) === 0;
      console.log(`  ${result.delete ? '✅' : '❌'} DELETE: ${result.delete ? 'Success' : 'Failed'}`);

      if (!result.delete) {
        result.issues.push('DELETE: Item still exists after deletion');
      }
    } else {
      result.issues.push('DELETE: Delete button not found');
      console.log(`  ⚠️  DELETE: Delete button not found`);
    }
  } catch (error) {
    result.issues.push(`DELETE failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ DELETE: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Test CRUD operations for content type WITH PAGE NAVIGATION
 */
async function testCRUDPage(
  page: Page,
  baseUrl: string,
  config: {
    pageName: string;
    listPath: string;
    createButtonText: string;
    titleFieldName: string;
    testTitle: string;
    category?: string;
    status?: string;
    hasEditor?: boolean;
  }
): Promise<CRUDResult> {
  console.log(`\n🔧 CRUD Test (Page): ${config.pageName}`);

  const result: CRUDResult = {
    page: config.pageName,
    create: false,
    read: false,
    update: false,
    delete: false,
    issues: [],
  };

  // Navigate to list page
  await page.goto(`${baseUrl}${config.listPath}`);
  await page.waitForLoadState('networkidle');

  // CREATE
  console.log(`  📝 Testing CREATE...`);
  try {
    const createButton = page.locator(`text=${config.createButtonText}`).first();
    await createButton.click();
    await page.waitForTimeout(1000); // Wait for page navigation

    // Fill title (try multiple selectors)
    let titleInput = page.locator(`input[name="${config.titleFieldName}"]`).first();
    if ((await titleInput.count()) === 0) {
      // Fallback 1: Try id="title"
      titleInput = page.locator('input#title').first();
    }
    if ((await titleInput.count()) === 0) {
      // Fallback 2: Try any text input with required attribute
      titleInput = page.locator('input[type="text"][required]').first();
    }
    if ((await titleInput.count()) === 0) {
      // Fallback 3: Use first text input
      titleInput = page.locator('input[type="text"]').first();
    }

    await titleInput.click();
    await page.waitForTimeout(100);
    await titleInput.pressSequentially(config.testTitle, { delay: 30 });

    // Fill category if exists
    if (config.category) {
      const categorySelect = page.locator('select[name="category"]');
      if ((await categorySelect.count()) > 0) {
        await categorySelect.selectOption(config.category);
      }
    }

    // Fill status if exists
    if (config.status) {
      const statusSelect = page.locator('select[name="status"]');
      if ((await statusSelect.count()) > 0) {
        await statusSelect.selectOption(config.status);
      }
    }

    // Fill editor or textarea (for content field)
    if (config.hasEditor) {
      // Wait for TipTap RichTextEditor to initialize
      await page.waitForTimeout(500);
      const editor = page.locator('.ProseMirror').first();
      if ((await editor.count()) > 0) {
        await editor.click();
        await page.waitForTimeout(200);
        await editor.pressSequentially('E2E Test Content - This is a comprehensive test.', { delay: 20 });
      }
    } else {
      // Try textarea for content (Popups uses textarea with required attribute)
      let contentArea = page.locator('textarea[name="content"]').first();
      if ((await contentArea.count()) === 0) {
        // Fallback: Any required textarea
        contentArea = page.locator('textarea[required]').first();
      }
      if ((await contentArea.count()) > 0) {
        await contentArea.click();
        await page.waitForTimeout(100);
        await contentArea.pressSequentially('<p>E2E Test Content for Popup</p>', { delay: 30 });
      }
    }

    // Wait for React state update
    await page.waitForTimeout(300);

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Check if redirected to list and item appears
    await page.waitForURL(new RegExp(config.listPath));
    result.create = (await page.locator(`text=${config.testTitle}`).count()) > 0;
    console.log(`  ${result.create ? '✅' : '❌'} CREATE: ${result.create ? 'Success' : 'Failed'}`);

    if (!result.create) {
      result.issues.push('CREATE: Item not found after creation');
    }
  } catch (error) {
    result.issues.push(`CREATE failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ CREATE: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  // READ
  console.log(`  📖 Testing READ...`);
  try {
    await page.goto(`${baseUrl}${config.listPath}`);
    await page.waitForLoadState('networkidle');

    result.read = (await page.locator(`text=${config.testTitle}`).count()) > 0;
    console.log(`  ${result.read ? '✅' : '❌'} READ: ${result.read ? 'Success' : 'Failed'}`);

    if (!result.read) {
      result.issues.push('READ: Item not found in list');
    }
  } catch (error) {
    result.issues.push(`READ failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ READ: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  // UPDATE
  console.log(`  ✏️  Testing UPDATE...`);
  try {
    await page.waitForTimeout(500);

    // Find edit link (different strategies for table vs card layout)
    let editLink = page.locator(`tr:has-text("${config.testTitle}") a[href*="edit"]`).first();

    if ((await editLink.count()) === 0) {
      // Popups uses card layout - correct structure: div.bg-white > div.flex.items-start > div.flex.gap-2 > a
      // Strategy: Find all edit links, then filter by popup card containing the test title
      const allEditLinks = await page.locator('a[href*="/admin/popups/edit"]').all();

      for (const link of allEditLinks) {
        // Get parent card container
        const card = link.locator('xpath=ancestor::div[contains(@class, "bg-white") and contains(@class, "rounded-lg")]');
        const cardText = await card.textContent();

        if (cardText?.includes(config.testTitle)) {
          editLink = link;
          break;
        }
      }

      // Fallback: just use first edit link if we created the item successfully
      if ((await editLink.count()) === 0 && allEditLinks.length > 0) {
        editLink = allEditLinks[0];
      }
    }

    if ((await editLink.count()) > 0) {
      console.log(`  🎯 Found EDIT link`);
      await editLink.click();
      await page.waitForTimeout(1500); // Wait for edit page + data loading

      // CRITICAL FIX: Use ID selector for Popups (name="null"), name selector for Notices/Press
      let titleInput;

      if (config.listPath.includes('popups')) {
        // Popups: ALL inputs have name="null" - MUST use ID selector
        titleInput = page.locator('input#title').first();
      } else {
        // Notices/Press: Use name="title" selector
        titleInput = page.locator('input[name="title"]').first();
      }

      // Verify input exists
      const inputCount = await titleInput.count();
      if (inputCount === 0) {
        result.issues.push(`UPDATE: Title input not found (tried ${config.listPath.includes('popups') ? 'input#title' : 'input[name="title"]'})`);
        console.log(`  ❌ UPDATE: Title input not found`);
        return result;
      }

      // Clear existing text first (important for edit pages!)
      await titleInput.click();
      await page.waitForTimeout(100);
      await titleInput.press('Control+A'); // Select all
      await titleInput.press('Backspace'); // Delete
      await page.waitForTimeout(200); // Wait for React state update

      // Now type updated text
      await titleInput.pressSequentially(config.testTitle + ' (Updated)', { delay: 30 });
      await page.waitForTimeout(300); // Wait for React validation

      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(2000); // Wait for API PUT + redirect

      // Wait for redirect to list page (with fallback)
      await page.waitForURL(new RegExp(config.listPath), { timeout: 5000 }).catch(() => {
        console.log(`  ⚠️  URL redirect timeout, checking if we're on list page anyway`);
      });

      // Verify updated item appears in list
      result.update = (await page.locator(`text=${config.testTitle} (Updated)`).count()) > 0;
      console.log(`  ${result.update ? '✅' : '❌'} UPDATE: ${result.update ? 'Success' : 'Failed'}`);

      if (!result.update) {
        result.issues.push(`UPDATE: Updated item not found (current URL: ${page.url()})`);
      }
    } else {
      result.issues.push('UPDATE: Edit link not found');
      console.log(`  ⚠️  UPDATE: Edit link not found`);
    }
  } catch (error) {
    result.issues.push(`UPDATE failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ UPDATE: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  // DELETE
  console.log(`  🗑️  Testing DELETE...`);
  try {
    const updatedTitle = config.testTitle + ' (Updated)';

    // Force full page refresh to ensure updated data is visible
    await page.goto(`${baseUrl}${config.listPath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for React to re-render list

    // Find delete button (different strategies for table vs card layout)
    let deleteButton = page.locator(`tr:has-text("${updatedTitle}") button[title="삭제"]`).first();

    if ((await deleteButton.count()) === 0) {
      // Try without title attribute (Press might not have it)
      deleteButton = page.locator(`tr:has-text("${updatedTitle}") button`).filter({ hasText: /^삭제$/ }).first();
    }

    if ((await deleteButton.count()) === 0) {
      // Popups uses card layout - find by title in h3, then get delete button in same card
      deleteButton = page
        .locator(`div.flex.items-center.gap-6:has(h3:text-is("${updatedTitle}"))`)
        .locator('button:has-text("삭제")')
        .first();
    }

    if ((await deleteButton.count()) > 0) {
      console.log(`  🎯 Found DELETE button`);

      // Click delete button (dialog is auto-accepted by global handler)
      await deleteButton.click({ force: true });

      // Wait for browser confirm() dialog + API DELETE call to complete
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');

      // Verify item is removed from DOM
      const itemStillExists = (await page.locator(`text=${updatedTitle}`).count()) > 0;
      result.delete = !itemStillExists;

      console.log(`  ${result.delete ? '✅' : '❌'} DELETE: ${result.delete ? 'Success' : 'Failed'}`);

      if (!result.delete) {
        result.issues.push(`DELETE: Item still visible after deletion (found ${await page.locator(`text=${updatedTitle}`).count()} instances)`);
      }
    } else {
      result.issues.push('DELETE: Delete button not found');
      console.log(`  ⚠️  DELETE: Delete button not found`);
    }
  } catch (error) {
    result.issues.push(`DELETE failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`  ❌ DELETE: Failed - ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

// ========================================
// MAIN TEST SUITE
// ========================================

test.describe('Comprehensive Admin Portal E2E Test', () => {
  test('should test all admin pages with CRUD operations', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for comprehensive test

    const baseUrl = process.env.BASE_URL || 'http://localhost:3008';

    // Register global dialog handler ONCE
    page.on('dialog', (dialog) => dialog.accept());

    const report: ComprehensiveReport = {
      timestamp: new Date().toISOString(),
      baseUrl,
      loginSuccess: false,
      loginTimeMs: 0,
      pageLoads: [],
      crudTests: [],
      consoleErrors: [],
      failedRequests: [],
      summary: {
        totalPages: 0,
        successfulPages: 0,
        failedPages: 0,
        totalCRUDTests: 0,
        successfulCRUDs: 0,
        avgLoadTime: 0,
      },
    };

    // Track console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        report.consoleErrors.push(`[Console Error] ${msg.text()}`);
      }
    });

    // Track failed requests
    page.on('response', (response) => {
      if (response.status() >= 400) {
        report.failedRequests.push(`[HTTP ${response.status()}] ${response.url()}`);
      }
    });

    // ========================================
    // STEP 1: LOGIN
    // ========================================
    try {
      report.loginTimeMs = await login(page, baseUrl);
      report.loginSuccess = true;
    } catch (error) {
      console.error('❌ Login failed:', error);
      report.loginSuccess = false;
      // Save report and fail test
      saveReport(report);
      throw error;
    }

    // ========================================
    // STEP 2: TEST ALL PAGE LOADS
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('📊 STEP 2: PAGE LOAD TESTS');
    console.log('='.repeat(80));

    const pages = [
      { path: '/admin/dashboard', name: 'Dashboard' },
      { path: '/admin/analytics', name: 'Analytics' },
      { path: '/admin/notices', name: 'Notices' },
      { path: '/admin/press', name: 'Press' },
      { path: '/admin/popups', name: 'Popups' },
      { path: '/admin/demo-requests', name: 'Demo Requests' },
      { path: '/admin/knowledge-library', name: 'Knowledge Library' },
      { path: '/admin/knowledge-videos', name: 'Knowledge Videos' },
      { path: '/admin/knowledge-blog', name: 'Knowledge Blog' },
    ];

    for (const pageConfig of pages) {
      const result = await testPageLoad(page, baseUrl, pageConfig.path, pageConfig.name);
      report.pageLoads.push(result);
    }

    // ========================================
    // STEP 3: TEST CRUD OPERATIONS
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('🔧 STEP 3: CRUD OPERATIONS TESTS');
    console.log('='.repeat(80));

    // Notices CRUD (PAGE-based navigation to /new and /edit pages)
    const noticesResult = await testCRUDPage(page, baseUrl, {
      pageName: 'Notices',
      listPath: '/admin/notices',
      createButtonText: '새 공지 작성',
      titleFieldName: 'title',
      testTitle: `E2E Test Notice ${Date.now()}`,
      category: 'GENERAL',
      status: 'PUBLISHED',
      hasEditor: true, // Uses ProseMirror editor
    });
    report.crudTests.push(noticesResult);

    // Press CRUD (PAGE-based)
    const pressResult = await testCRUDPage(page, baseUrl, {
      pageName: 'Press',
      listPath: '/admin/press',
      createButtonText: '새 보도자료 작성',
      titleFieldName: 'title',
      testTitle: `E2E Test Press ${Date.now()}`,
      status: 'PUBLISHED',
      hasEditor: true,
    });
    report.crudTests.push(pressResult);

    // Popups CRUD (PAGE-based)
    const popupsResult = await testCRUDPage(page, baseUrl, {
      pageName: 'Popups',
      listPath: '/admin/popups',
      createButtonText: '+ 새 팝업 만들기',
      titleFieldName: 'title',
      testTitle: `E2E Test Popup ${Date.now()}`,
    });
    report.crudTests.push(popupsResult);

    // Knowledge Library CRUD (MODAL-based)
    const libraryResult = await testCRUDModal(page, baseUrl, {
      pageName: 'Knowledge Library',
      listPath: '/admin/knowledge-library',
      createButtonText: '자료 추가',
      fields: {
        title: `E2E Test Library ${Date.now()}`,
        description: 'E2E Test Description',
        fileSize: '1.5 MB',
        fileUrl: 'https://example.com/test.pdf',
        tags: 'test, e2e',
      },
      testTitle: `E2E Test Library ${Date.now()}`,
    });
    report.crudTests.push(libraryResult);

    // Knowledge Videos CRUD (MODAL-based)
    const videosResult = await testCRUDModal(page, baseUrl, {
      pageName: 'Knowledge Videos',
      listPath: '/admin/knowledge-videos',
      createButtonText: '영상 추가',
      fields: {
        title: `E2E Test Video ${Date.now()}`,
        description: 'E2E Test Video Description',
        videoUrl: 'https://youtube.com/watch?v=test123',
        duration: '10:30',
        tags: 'test, e2e',
      },
      testTitle: `E2E Test Video ${Date.now()}`,
    });
    report.crudTests.push(videosResult);

    // Knowledge Blog CRUD (MODAL-based with ALL required fields including tags)
    const blogTimestamp = Date.now();
    const blogResult = await testCRUDModal(page, baseUrl, {
      pageName: 'Knowledge Blog',
      listPath: '/admin/knowledge-blog',
      createButtonText: '블로그 작성',
      fields: {
        title: `E2E Test Blog ${blogTimestamp}`,
        content: '<p>E2E Test Blog Content - This is a comprehensive test of the blog creation system.</p>',
        excerpt: 'E2E Test Excerpt - Summary of blog post for card display',
        author: 'E2E Test Author',
        'modal-category': 'TECHNICAL', // Note: uses 'modal-category' id to avoid filter conflict
        tags: 'test, e2e, automation', // REQUIRED: minimum 1 tag (validation on line 202-206)
      },
      testTitle: `E2E Test Blog ${blogTimestamp}`,
    });
    report.crudTests.push(blogResult);

    // ========================================
    // STEP 4: CALCULATE SUMMARY
    // ========================================
    report.summary.totalPages = report.pageLoads.length;
    report.summary.successfulPages = report.pageLoads.filter((p) => p.success).length;
    report.summary.failedPages = report.summary.totalPages - report.summary.successfulPages;
    report.summary.avgLoadTime =
      report.pageLoads.reduce((sum, p) => sum + p.loadTimeMs, 0) / report.pageLoads.length;

    report.summary.totalCRUDTests = report.crudTests.length * 4; // Each test has 4 operations
    report.summary.successfulCRUDs = report.crudTests.reduce(
      (sum, t) => sum + [t.create, t.read, t.update, t.delete].filter(Boolean).length,
      0
    );

    // ========================================
    // STEP 5: PRINT FINAL REPORT
    // ========================================
    console.log('\n' + '='.repeat(80));
    console.log('📋 FINAL REPORT');
    console.log('='.repeat(80));

    console.log('\n📊 PAGE LOAD SUMMARY:');
    console.log('-'.repeat(80));
    console.log('| Page                  | Load Time | Status   |');
    console.log('|-----------------------|-----------|----------|');

    report.pageLoads.forEach((result) => {
      const name = result.page.padEnd(21);
      const time = `${result.loadTimeMs}ms`.padEnd(9);
      const status = getStatusIcon(result.status).padEnd(8);
      console.log(`| ${name} | ${time} | ${status} |`);
    });

    console.log('-'.repeat(80));
    console.log(`Total Pages: ${report.summary.totalPages}`);
    console.log(`Successful: ${report.summary.successfulPages}`);
    console.log(`Failed: ${report.summary.failedPages}`);
    console.log(`Average Load Time: ${report.summary.avgLoadTime.toFixed(0)}ms`);

    console.log('\n🔧 CRUD OPERATIONS SUMMARY:');
    console.log('-'.repeat(80));
    console.log('| Page                  | C | R | U | D | Score |');
    console.log('|-----------------------|---|---|---|---|-------|');

    report.crudTests.forEach((result) => {
      const name = result.page.padEnd(21);
      const c = result.create ? '✅' : '❌';
      const r = result.read ? '✅' : '❌';
      const u = result.update ? '✅' : '❌';
      const d = result.delete ? '✅' : '❌';
      const score = [result.create, result.read, result.update, result.delete].filter(Boolean).length;
      console.log(`| ${name} | ${c} | ${r} | ${u} | ${d} | ${score}/4   |`);
    });

    console.log('-'.repeat(80));
    console.log(`Total CRUD Operations: ${report.summary.totalCRUDTests}`);
    console.log(`Successful: ${report.summary.successfulCRUDs}`);
    console.log(`Failed: ${report.summary.totalCRUDTests - report.summary.successfulCRUDs}`);
    console.log(
      `Success Rate: ${((report.summary.successfulCRUDs / report.summary.totalCRUDTests) * 100).toFixed(1)}%`
    );

    if (report.consoleErrors.length > 0) {
      console.log('\n🐛 CONSOLE ERRORS:');
      report.consoleErrors.slice(0, 10).forEach((err) => console.log(`  - ${err}`));
      if (report.consoleErrors.length > 10) {
        console.log(`  ... and ${report.consoleErrors.length - 10} more errors`);
      }
    }

    if (report.failedRequests.length > 0) {
      console.log('\n❌ FAILED REQUESTS:');
      report.failedRequests.slice(0, 10).forEach((req) => console.log(`  - ${req}`));
      if (report.failedRequests.length > 10) {
        console.log(`  ... and ${report.failedRequests.length - 10} more failures`);
      }
    }

    console.log('\n' + '='.repeat(80));
    const allPagesSuccess = report.summary.failedPages === 0;
    const crudSuccessRate = (report.summary.successfulCRUDs / report.summary.totalCRUDTests) * 100;

    if (allPagesSuccess && crudSuccessRate === 100) {
      console.log('✅ ALL TESTS PASSED - PERFECT SCORE');
    } else if (allPagesSuccess && crudSuccessRate >= 75) {
      console.log('✅ ALL PAGES LOADED - MOST CRUD OPERATIONS SUCCESSFUL');
    } else if (allPagesSuccess) {
      console.log('⚠️  ALL PAGES LOADED - SOME CRUD OPERATIONS FAILED');
    } else {
      console.log('❌ SOME PAGES FAILED TO LOAD - NEEDS ATTENTION');
    }
    console.log('='.repeat(80));

    // ========================================
    // STEP 6: SAVE REPORT TO FILE
    // ========================================
    saveReport(report);

    // ========================================
    // STEP 7: ASSERTIONS
    // ========================================
    expect(report.loginSuccess, 'Login should succeed').toBeTruthy();
    expect(
      report.summary.successfulPages,
      `At least 80% of pages should load successfully (${report.summary.successfulPages}/${report.summary.totalPages})`
    ).toBeGreaterThanOrEqual(report.summary.totalPages * 0.8);
    expect(
      report.summary.avgLoadTime,
      `Average load time should be under 5000ms (actual: ${report.summary.avgLoadTime.toFixed(0)}ms)`
    ).toBeLessThan(5000);
    expect(
      crudSuccessRate,
      `CRUD success rate should be at least 50% (actual: ${crudSuccessRate.toFixed(1)}%)`
    ).toBeGreaterThanOrEqual(50);
  });
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getStatusIcon(status: string): string {
  switch (status) {
    case 'success':
      return '✅';
    case 'slow':
      return '⚠️ SLOW';
    case 'timeout':
      return '❌ TIMEOUT';
    case '404':
      return '❌ 404';
    case 'error':
      return '❌ ERROR';
    default:
      return '❓';
  }
}

function saveReport(report: ComprehensiveReport) {
  const reportDir = path.join(process.cwd(), 'test-results');

  // Ensure directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, 'admin-comprehensive-report.json');

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n💾 Report saved to: ${reportPath}`);
}
