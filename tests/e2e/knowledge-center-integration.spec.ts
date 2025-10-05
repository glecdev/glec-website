/**
 * Knowledge Center Integration E2E Test
 *
 * Tests the complete Knowledge Center flow:
 * 1. Admin creates content in Admin Portal
 * 2. Content appears in Public Knowledge pages
 * 3. Content filtering/search works correctly
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3010';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

// Helper function: Admin login
async function adminLogin(page: any) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`);
}

test.describe('Knowledge Center - Complete Integration', () => {
  test('Library: Admin Create → Public Display', async ({ page }) => {
    // 1. Login as admin
    await adminLogin(page);

    // 2. Navigate to Library management
    await page.goto(`${BASE_URL}/admin/knowledge/library`);

    // 3. Create a new library item
    const testTitle = `E2E Test Library ${Date.now()}`;
    await page.click('text=새 자료 등록');
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="description"]', 'E2E test description for library item');
    await page.selectOption('select[name="category"]', 'WHITEPAPER');
    await page.selectOption('select[name="fileType"]', 'PDF');
    await page.fill('input[name="fileSize"]', '2.5 MB');
    await page.fill('input[name="fileUrl"]', 'https://example.com/test.pdf');
    await page.click('button:has-text("저장")');

    // 4. Wait for success message
    await expect(page.locator('text=저장되었습니다')).toBeVisible({ timeout: 5000 });

    // 5. Publish the item
    await page.click(`text=${testTitle}`);
    await page.click('button:has-text("발행")');
    await expect(page.locator('text=발행되었습니다')).toBeVisible({ timeout: 5000 });

    // 6. Navigate to public Library page
    await page.goto(`${BASE_URL}/knowledge/library`);

    // 7. Verify the item appears in public page
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 10000 });

    // 8. Test category filter
    await page.click('button:has-text("백서")');
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();

    // 9. Test search
    const searchKeyword = testTitle.substring(0, 15);
    await page.fill('input[placeholder*="검색"]', searchKeyword);
    await page.waitForTimeout(600); // Wait for debounce
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();
  });

  test('Videos: Admin Create → Public Display', async ({ page }) => {
    // 1. Login as admin
    await adminLogin(page);

    // 2. Navigate to Videos management
    await page.goto(`${BASE_URL}/admin/knowledge/videos`);

    // 3. Create a new video item
    const testTitle = `E2E Test Video ${Date.now()}`;
    await page.click('text=새 동영상 등록');
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="description"]', 'E2E test description for video');
    await page.fill('input[name="youtubeUrl"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.fill('input[name="duration"]', '3:33');
    await page.selectOption('select[name="tab"]', 'TUTORIALS');
    await page.click('button:has-text("저장")');

    // 4. Wait for success message
    await expect(page.locator('text=저장되었습니다')).toBeVisible({ timeout: 5000 });

    // 5. Publish the item
    await page.click(`text=${testTitle}`);
    await page.click('button:has-text("발행")');
    await expect(page.locator('text=발행되었습니다')).toBeVisible({ timeout: 5000 });

    // 6. Navigate to public Videos page
    await page.goto(`${BASE_URL}/knowledge/videos`);

    // 7. Verify the item appears in public page
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 10000 });

    // 8. Test tab filter
    await page.click('button:has-text("튜토리얼")');
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();

    // 9. Test search
    const searchKeyword = testTitle.substring(0, 15);
    await page.fill('input[placeholder*="검색"]', searchKeyword);
    await page.waitForTimeout(600); // Wait for debounce
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();
  });

  test('Blog: Admin Create → Public Display', async ({ page }) => {
    // 1. Login as admin
    await adminLogin(page);

    // 2. Navigate to Blog management
    await page.goto(`${BASE_URL}/admin/knowledge/blog`);

    // 3. Create a new blog post
    const testTitle = `E2E Test Blog Post ${Date.now()}`;
    await page.click('text=새 글 작성');
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="excerpt"]', 'E2E test excerpt for blog post');
    await page.fill('div[contenteditable="true"]', 'E2E test content for blog post with rich text editor.');
    await page.fill('input[name="author"]', 'Test Author');
    await page.click('button:has-text("저장")');

    // 4. Wait for success message
    await expect(page.locator('text=저장되었습니다')).toBeVisible({ timeout: 5000 });

    // 5. Publish the post
    await page.click(`text=${testTitle}`);
    await page.click('button:has-text("발행")');
    await expect(page.locator('text=발행되었습니다')).toBeVisible({ timeout: 5000 });

    // 6. Navigate to public Blog page
    await page.goto(`${BASE_URL}/knowledge/blog`);

    // 7. Verify the post appears in public page
    await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 10000 });

    // 8. Test search
    const searchKeyword = testTitle.substring(0, 15);
    await page.fill('input[placeholder*="검색"]', searchKeyword);
    await page.waitForTimeout(600); // Wait for debounce
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();
  });

  test('Library: DRAFT items should not appear in public', async ({ page }) => {
    // 1. Login as admin
    await adminLogin(page);

    // 2. Navigate to Library management
    await page.goto(`${BASE_URL}/admin/knowledge/library`);

    // 3. Create a DRAFT library item
    const draftTitle = `DRAFT Test Library ${Date.now()}`;
    await page.click('text=새 자료 등록');
    await page.fill('input[name="title"]', draftTitle);
    await page.fill('textarea[name="description"]', 'This should NOT appear in public');
    await page.selectOption('select[name="category"]', 'GUIDE');
    await page.selectOption('select[name="fileType"]', 'PDF');
    await page.fill('input[name="fileSize"]', '1.0 MB');
    await page.fill('input[name="fileUrl"]', 'https://example.com/draft.pdf');
    await page.click('button:has-text("저장")');

    // 4. Wait for success message
    await expect(page.locator('text=저장되었습니다')).toBeVisible({ timeout: 5000 });

    // 5. DO NOT publish (keep as DRAFT)

    // 6. Navigate to public Library page
    await page.goto(`${BASE_URL}/knowledge/library`);

    // 7. Verify the DRAFT item does NOT appear
    await expect(page.locator(`text=${draftTitle}`)).not.toBeVisible();
  });

  test('Public APIs: Response format validation', async ({ page }) => {
    // Test Library API response format
    const libraryResponse = await page.request.get(`${BASE_URL}/api/knowledge/library?page=1&per_page=5`);
    expect(libraryResponse.ok()).toBeTruthy();
    const libraryData = await libraryResponse.json();
    expect(libraryData).toHaveProperty('success', true);
    expect(libraryData).toHaveProperty('data');
    expect(libraryData).toHaveProperty('meta');
    expect(libraryData.meta).toHaveProperty('page', 1);
    expect(libraryData.meta).toHaveProperty('perPage', 5);
    expect(libraryData.meta).toHaveProperty('total');
    expect(libraryData.meta).toHaveProperty('totalPages');

    // Test Videos API response format
    const videosResponse = await page.request.get(`${BASE_URL}/api/knowledge/videos?page=1&per_page=5`);
    expect(videosResponse.ok()).toBeTruthy();
    const videosData = await videosResponse.json();
    expect(videosData).toHaveProperty('success', true);
    expect(videosData).toHaveProperty('data');
    expect(videosData).toHaveProperty('meta');

    // Test Blog API response format
    const blogResponse = await page.request.get(`${BASE_URL}/api/knowledge/blog?page=1&per_page=5`);
    expect(blogResponse.ok()).toBeTruthy();
    const blogData = await blogResponse.json();
    expect(blogData).toHaveProperty('success', true);
    expect(blogData).toHaveProperty('data');
    expect(blogData).toHaveProperty('meta');
  });

  test('Public APIs: Pagination works correctly', async ({ page }) => {
    // Test Library pagination
    const libraryPage1 = await page.request.get(`${BASE_URL}/api/knowledge/library?page=1&per_page=2`);
    const libraryData1 = await libraryPage1.json();
    expect(libraryData1.meta.page).toBe(1);
    expect(libraryData1.meta.perPage).toBe(2);
    expect(libraryData1.data.length).toBeLessThanOrEqual(2);

    const libraryPage2 = await page.request.get(`${BASE_URL}/api/knowledge/library?page=2&per_page=2`);
    const libraryData2 = await libraryPage2.json();
    expect(libraryData2.meta.page).toBe(2);

    // Verify different items on different pages (if enough data exists)
    if (libraryData1.data.length > 0 && libraryData2.data.length > 0) {
      expect(libraryData1.data[0].id).not.toBe(libraryData2.data[0].id);
    }
  });

  test('Public APIs: Category/Tab filtering works', async ({ page }) => {
    // Test Library category filter
    const libraryFiltered = await page.request.get(`${BASE_URL}/api/knowledge/library?category=TECHNICAL`);
    const libraryFilteredData = await libraryFiltered.json();
    if (libraryFilteredData.data.length > 0) {
      libraryFilteredData.data.forEach((item: any) => {
        expect(item.category).toBe('TECHNICAL');
      });
    }

    // Test Videos tab filter
    const videosFiltered = await page.request.get(`${BASE_URL}/api/knowledge/videos?tab=TUTORIALS`);
    const videosFilteredData = await videosFiltered.json();
    if (videosFilteredData.data.length > 0) {
      videosFilteredData.data.forEach((item: any) => {
        expect(item.tab).toBe('TUTORIALS');
      });
    }
  });

  test('Public APIs: Search works correctly', async ({ page }) => {
    // Test Library search
    const librarySearched = await page.request.get(`${BASE_URL}/api/knowledge/library?search=Test`);
    const librarySearchedData = await librarySearched.json();
    if (librarySearchedData.data.length > 0) {
      librarySearchedData.data.forEach((item: any) => {
        expect(item.title.toLowerCase()).toContain('test');
      });
    }

    // Test Videos search
    const videosSearched = await page.request.get(`${BASE_URL}/api/knowledge/videos?search=Test`);
    const videosSearchedData = await videosSearched.json();
    if (videosSearchedData.data.length > 0) {
      videosSearchedData.data.forEach((item: any) => {
        expect(item.title.toLowerCase()).toContain('test');
      });
    }

    // Test Blog search
    const blogSearched = await page.request.get(`${BASE_URL}/api/knowledge/blog?search=Test`);
    const blogSearchedData = await blogSearched.json();
    if (blogSearchedData.data.length > 0) {
      blogSearchedData.data.forEach((item: any) => {
        expect(item.title.toLowerCase()).toContain('test');
      });
    }
  });
});
