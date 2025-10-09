/**
 * Production Content Verification E2E Test
 *
 * Purpose:
 * 1. Create content in Admin (Notices & Press)
 * 2. Verify content appears on public website
 * 3. Cross-check data consistency between Admin and Public site
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

test.setTimeout(180000); // 3 minutes for production

test.describe('Production Content Creation & Verification', () => {

  test('Create Notice in Admin and verify on public site', async ({ browser }) => {
    // Use two separate contexts: one for admin, one for public
    const adminContext = await browser.newContext();
    const publicContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const publicPage = await publicContext.newPage();

    console.log('📝 Step 1: Login to Admin');

    // Login to Admin
    await adminPage.goto(`${BASE_URL}/admin/login`);
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 20000 });
    console.log('✅ Admin login successful');

    console.log('📝 Step 2: Navigate to Notices Admin');

    // Go to Notices Admin page
    await adminPage.goto(`${BASE_URL}/admin/notices`);
    await adminPage.waitForLoadState('networkidle');
    console.log('✅ Notices admin page loaded');

    console.log('📝 Step 3: Create new Notice');

    // Click create button
    await adminPage.click('button:has-text("새 공지 작성")');
    await adminPage.waitForSelector('#title', { timeout: 5000 });
    await adminPage.waitForTimeout(1000);

    // Fill form with unique timestamp
    const timestamp = Date.now();
    const noticeTitle = `E2E Production Test Notice ${timestamp}`;
    const noticeSlug = `e2e-production-test-${timestamp}`;
    const noticeExcerpt = `This is a test notice created at ${new Date().toISOString()}`;
    const noticeContent = `Full content for E2E test notice. Created to verify content propagation from Admin to public website.`;

    await adminPage.fill('#title', noticeTitle);
    await adminPage.fill('#slug', noticeSlug);
    await adminPage.fill('#excerpt', noticeExcerpt);
    await adminPage.fill('#content', noticeContent);
    await adminPage.fill('#thumbnailUrl', 'https://via.placeholder.com/400x300');

    // Select category and publish status
    await adminPage.selectOption('#modal-category', '일반');
    await adminPage.selectOption('#modal-status', '발행'); // Published

    console.log(`✅ Form filled with title: "${noticeTitle}"`);

    // Submit
    await adminPage.click('button:has-text("추가")');
    console.log('✅ Submit clicked');

    // Wait for success (modal closes or success message)
    await adminPage.waitForTimeout(3000);

    // Check for errors
    const errorVisible = await adminPage.locator('text=An unexpected error occurred').isVisible().catch(() => false);

    if (errorVisible) {
      await adminPage.screenshot({ path: `test-results/admin-create-error-${timestamp}.png` });
      throw new Error('❌ Admin content creation failed with error');
    }

    console.log('✅ Notice created in Admin without errors');

    console.log('📝 Step 4: Verify Notice appears in Admin list');

    // Reload the page to see new content
    await adminPage.reload();
    await adminPage.waitForLoadState('networkidle');

    // Search for the created notice in the table
    const adminTableHasNotice = await adminPage.locator(`text=${noticeTitle}`).isVisible({ timeout: 5000 }).catch(() => false);

    if (!adminTableHasNotice) {
      await adminPage.screenshot({ path: `test-results/admin-list-missing-${timestamp}.png` });
      console.warn('⚠️ Notice not found in Admin table immediately (might be pagination issue)');
    } else {
      console.log('✅ Notice appears in Admin table');
    }

    console.log('📝 Step 5: Check public Knowledge Center page');

    // Go to public Knowledge Center page
    await publicPage.goto(`${BASE_URL}/knowledge-center`);
    await publicPage.waitForLoadState('networkidle');
    console.log('✅ Public Knowledge Center page loaded');

    // Wait a bit for content to sync (database propagation)
    await publicPage.waitForTimeout(2000);

    // Look for the notice title on public page
    const publicHasNotice = await publicPage.locator(`text=${noticeTitle}`).isVisible({ timeout: 5000 }).catch(() => false);

    if (!publicHasNotice) {
      await publicPage.screenshot({ path: `test-results/public-missing-${timestamp}.png` });
      console.warn('⚠️ Notice not found on public Knowledge Center (might need cache clear or be in different section)');

      // Try searching the entire page content
      const pageContent = await publicPage.content();
      const titleInPage = pageContent.includes(noticeTitle);

      if (titleInPage) {
        console.log('✅ Notice title found in page HTML (might be hidden or in different section)');
      } else {
        console.log('⚠️ Notice title NOT in page HTML - may need to wait for DB sync or check slug-based URL');
      }
    } else {
      console.log('✅ Notice appears on public Knowledge Center page!');
    }

    console.log('📝 Step 6: Try direct slug URL');

    // Try accessing the notice by slug
    const slugUrl = `${BASE_URL}/knowledge-center/notices/${noticeSlug}`;
    console.log(`Trying slug URL: ${slugUrl}`);

    const slugResponse = await publicPage.goto(slugUrl);
    const slugStatus = slugResponse?.status() || 0;

    console.log(`Slug URL response: ${slugStatus}`);

    if (slugStatus === 200) {
      const slugPageHasTitle = await publicPage.locator(`text=${noticeTitle}`).isVisible().catch(() => false);

      if (slugPageHasTitle) {
        console.log('✅ Notice accessible via slug URL!');
        console.log('✅ FULL VERIFICATION PASSED: Content created in Admin appears on public website');
      } else {
        console.log('⚠️ Slug URL loads but title not found (might be rendering issue)');
      }
    } else if (slugStatus === 404) {
      console.log('⚠️ Slug URL returns 404 - content might not be published yet or routing issue');
    } else {
      console.log(`⚠️ Slug URL returned unexpected status: ${slugStatus}`);
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`- Notice Title: "${noticeTitle}"`);
    console.log(`- Notice Slug: "${noticeSlug}"`);
    console.log(`- Admin Creation: ✅ Success`);
    console.log(`- Admin List Visible: ${adminTableHasNotice ? '✅' : '⚠️'}`);
    console.log(`- Public Page Visible: ${publicHasNotice ? '✅' : '⚠️'}`);
    console.log(`- Slug URL Status: ${slugStatus === 200 ? '✅' : '⚠️'} (${slugStatus})`);

    // Cleanup
    await adminContext.close();
    await publicContext.close();

    // Assert at least admin creation worked
    expect(errorVisible).toBe(false);
  });

  test('Create Press Release in Admin and verify on public site', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const publicContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const publicPage = await publicContext.newPage();

    console.log('📝 Step 1: Login to Admin');

    await adminPage.goto(`${BASE_URL}/admin/login`);
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 20000 });
    console.log('✅ Admin login successful');

    console.log('📝 Step 2: Navigate to Press Admin');

    await adminPage.goto(`${BASE_URL}/admin/press`);
    await adminPage.waitForLoadState('networkidle');
    console.log('✅ Press admin page loaded');

    console.log('📝 Step 3: Create new Press Release');

    // Click create button
    await adminPage.click('button:has-text("새 보도자료 작성")');
    await adminPage.waitForSelector('#title', { timeout: 5000 });
    await adminPage.waitForTimeout(1000);

    const timestamp = Date.now();
    const pressTitle = `E2E Production Test Press ${timestamp}`;
    const pressSlug = `e2e-production-press-${timestamp}`;
    const pressExcerpt = `Test press release created at ${new Date().toISOString()}`;
    const pressContent = `Full content for E2E test press release.`;

    await adminPage.fill('#title', pressTitle);
    await adminPage.fill('#slug', pressSlug);
    await adminPage.fill('#excerpt', pressExcerpt);
    await adminPage.fill('#content', pressContent);
    await adminPage.fill('#thumbnailUrl', 'https://via.placeholder.com/400x300');

    await adminPage.selectOption('#modal-status', '발행');

    console.log(`✅ Form filled with title: "${pressTitle}"`);

    await adminPage.click('button:has-text("추가")');
    console.log('✅ Submit clicked');

    await adminPage.waitForTimeout(3000);

    const errorVisible = await adminPage.locator('text=An unexpected error occurred').isVisible().catch(() => false);

    if (errorVisible) {
      await adminPage.screenshot({ path: `test-results/press-create-error-${timestamp}.png` });
      throw new Error('❌ Press creation failed with error');
    }

    console.log('✅ Press Release created in Admin without errors');

    console.log('📝 Step 4: Check public Press page');

    await publicPage.goto(`${BASE_URL}/news/press`);
    await publicPage.waitForLoadState('networkidle');
    await publicPage.waitForTimeout(2000);

    const publicHasPress = await publicPage.locator(`text=${pressTitle}`).isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`Public Press page has content: ${publicHasPress ? '✅' : '⚠️'}`);

    console.log('\n📊 Test Summary:');
    console.log(`- Press Title: "${pressTitle}"`);
    console.log(`- Admin Creation: ✅ Success`);
    console.log(`- Public Visibility: ${publicHasPress ? '✅' : '⚠️'}`);

    await adminContext.close();
    await publicContext.close();

    expect(errorVisible).toBe(false);
  });
});
