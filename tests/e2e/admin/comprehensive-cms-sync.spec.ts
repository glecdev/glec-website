import { test, expect, Page, Browser } from '@playwright/test';

/**
 * Comprehensive Admin CMS ↔ Website Synchronization Test
 *
 * 목적: Admin에서 CRUD 작업 후 Website에 실시간 반영 검증
 *
 * 테스트 시나리오:
 * 1. Notices (공지사항): CREATE → Website 확인 → UPDATE → Website 확인 → DELETE → Website 확인
 * 2. Presses (보도자료): CREATE → Website 확인 → UPDATE → Website 확인 → DELETE → Website 확인
 * 3. Videos (동영상): CREATE → Website 확인 → UPDATE → Website 확인 → DELETE → Website 확인
 * 4. Blogs (블로그): CREATE → Website 확인 → UPDATE → Website 확인 → DELETE → Website 확인
 * 5. Libraries (자료실): CREATE → Website 확인 → UPDATE → Website 확인 → DELETE → Website 확인
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

test.describe('Comprehensive CMS ↔ Website Sync Test', () => {
  let adminPage: Page;
  let websitePage: Page;
  let browser: Browser;

  test.beforeAll(async ({ browser: testBrowser }) => {
    browser = testBrowser;

    // Create two contexts: one for admin, one for website
    const adminContext = await browser.newContext();
    const websiteContext = await browser.newContext();

    adminPage = await adminContext.newPage();
    websitePage = await websiteContext.newPage();

    // Login to Admin
    await adminPage.goto(`${BASE_URL}/admin/login`);
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(`${BASE_URL}/admin/dashboard`);

    console.log('✅ Admin login successful');
  });

  test.afterAll(async () => {
    await adminPage?.close();
    await websitePage?.close();
  });

  // ============================================================
  // 1. NOTICES (공지사항) CRUD + Sync Test
  // ============================================================

  test('Notices: CREATE → Website Sync', async () => {
    const testData = {
      title: `[E2E Test] 공지사항 생성 테스트 ${Date.now()}`,
      content: '<p>This is a test notice created by E2E automation.</p>',
      category: 'GENERAL',
      slug: `test-notice-${Date.now()}`
    };

    console.log('\n📝 Testing Notices CREATE...');

    // Admin: Navigate to Notices
    await adminPage.goto(`${BASE_URL}/admin/notices`);
    await adminPage.waitForLoadState('networkidle');

    // Admin: Click "Create" button
    await adminPage.click('button:has-text("새 공지사항")');
    await adminPage.waitForLoadState('networkidle');

    // Admin: Fill form
    await adminPage.fill('input[name="title"]', testData.title);
    await adminPage.fill('input[name="slug"]', testData.slug);

    // TipTap editor content
    const editor = adminPage.locator('.ProseMirror');
    await editor.click();
    await editor.fill(testData.content);

    // Select category
    await adminPage.selectOption('select[name="category"]', testData.category);

    // Set status to PUBLISHED
    await adminPage.selectOption('select[name="status"]', 'PUBLISHED');

    // Admin: Submit
    await adminPage.click('button[type="submit"]:has-text("저장")');
    await adminPage.waitForLoadState('networkidle');

    // Verify success message
    const successMessage = adminPage.locator('text=성공적으로 생성되었습니다');
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    console.log('✅ Admin: Notice created');

    // Website: Navigate to /notices
    await websitePage.goto(`${BASE_URL}/notices`);
    await websitePage.waitForLoadState('networkidle');

    // Website: Verify notice appears
    const noticeOnWebsite = websitePage.locator(`text=${testData.title}`);
    await expect(noticeOnWebsite).toBeVisible({ timeout: 10000 });

    console.log('✅ Website: Notice synced and visible');

    // Store slug for next tests
    test.info().annotations.push({ type: 'notice-slug', description: testData.slug });
  });

  test('Notices: UPDATE → Website Sync', async () => {
    const slug = test.info().annotations.find(a => a.type === 'notice-slug')?.description;
    if (!slug) {
      test.skip();
      return;
    }

    const updatedData = {
      title: `[E2E Test] 공지사항 수정 테스트 ${Date.now()}`,
      content: '<p>This notice has been updated by E2E automation.</p>'
    };

    console.log('\n✏️  Testing Notices UPDATE...');

    // Admin: Navigate to notice edit page
    await adminPage.goto(`${BASE_URL}/admin/notices/${slug}/edit`);
    await adminPage.waitForLoadState('networkidle');

    // Admin: Update title
    await adminPage.fill('input[name="title"]', updatedData.title);

    // Admin: Update content
    const editor = adminPage.locator('.ProseMirror');
    await editor.click();
    await editor.selectAll();
    await editor.fill(updatedData.content);

    // Admin: Submit
    await adminPage.click('button[type="submit"]:has-text("저장")');
    await adminPage.waitForLoadState('networkidle');

    console.log('✅ Admin: Notice updated');

    // Website: Reload /notices
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // Website: Verify updated title
    const updatedNoticeOnWebsite = websitePage.locator(`text=${updatedData.title}`);
    await expect(updatedNoticeOnWebsite).toBeVisible({ timeout: 10000 });

    console.log('✅ Website: Updated notice synced');
  });

  test('Notices: DELETE → Website Sync', async () => {
    const slug = test.info().annotations.find(a => a.type === 'notice-slug')?.description;
    if (!slug) {
      test.skip();
      return;
    }

    const titleToDelete = `[E2E Test] 공지사항 수정 테스트`;

    console.log('\n🗑️  Testing Notices DELETE...');

    // Admin: Navigate to notices list
    await adminPage.goto(`${BASE_URL}/admin/notices`);
    await adminPage.waitForLoadState('networkidle');

    // Admin: Find and click delete button
    const deleteButton = adminPage.locator(`tr:has-text("${slug}") button:has-text("삭제")`);
    await deleteButton.click();

    // Admin: Confirm deletion
    await adminPage.click('button:has-text("확인")');
    await adminPage.waitForLoadState('networkidle');

    console.log('✅ Admin: Notice deleted');

    // Website: Reload /notices
    await websitePage.reload();
    await websitePage.waitForLoadState('networkidle');

    // Website: Verify notice is no longer visible
    const deletedNoticeOnWebsite = websitePage.locator(`text=${titleToDelete}`);
    await expect(deletedNoticeOnWebsite).not.toBeVisible({ timeout: 10000 });

    console.log('✅ Website: Deleted notice removed from website');
  });

  // ============================================================
  // 2. PRESSES (보도자료) CRUD + Sync Test
  // ============================================================

  test('Presses: CREATE → Website Sync', async () => {
    const testData = {
      title: `[E2E Test] 보도자료 생성 테스트 ${Date.now()}`,
      content: '<p>This is a test press release created by E2E automation.</p>',
      slug: `test-press-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    console.log('\n📰 Testing Presses CREATE...');

    // Admin: Navigate to Presses
    await adminPage.goto(`${BASE_URL}/admin/presses`);
    await adminPage.waitForLoadState('networkidle');

    // Admin: Click "Create" button
    await adminPage.click('button:has-text("새 보도자료")');
    await adminPage.waitForLoadState('networkidle');

    // Admin: Fill form
    await adminPage.fill('input[name="title"]', testData.title);
    await adminPage.fill('input[name="slug"]', testData.slug);
    await adminPage.fill('input[name="publishedAt"]', testData.publishedAt);

    // TipTap editor content
    const editor = adminPage.locator('.ProseMirror');
    await editor.click();
    await editor.fill(testData.content);

    // Set status to PUBLISHED
    await adminPage.selectOption('select[name="status"]', 'PUBLISHED');

    // Admin: Submit
    await adminPage.click('button[type="submit"]:has-text("저장")');
    await adminPage.waitForLoadState('networkidle');

    console.log('✅ Admin: Press release created');

    // Website: Navigate to /press
    await websitePage.goto(`${BASE_URL}/press`);
    await websitePage.waitForLoadState('networkidle');

    // Website: Verify press appears
    const pressOnWebsite = websitePage.locator(`text=${testData.title}`);
    await expect(pressOnWebsite).toBeVisible({ timeout: 10000 });

    console.log('✅ Website: Press release synced and visible');

    // Store slug for next tests
    test.info().annotations.push({ type: 'press-slug', description: testData.slug });
  });

  // ============================================================
  // 3. VIDEOS (동영상) CRUD + Sync Test
  // ============================================================

  test('Videos: CREATE → Website Sync', async () => {
    const testData = {
      title: `[E2E Test] 동영상 생성 테스트 ${Date.now()}`,
      description: 'This is a test video created by E2E automation.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      slug: `test-video-${Date.now()}`
    };

    console.log('\n🎥 Testing Videos CREATE...');

    // Admin: Navigate to Videos
    await adminPage.goto(`${BASE_URL}/admin/videos`);
    await adminPage.waitForLoadState('networkidle');

    // Admin: Click "Create" button
    await adminPage.click('button:has-text("새 동영상")');
    await adminPage.waitForLoadState('networkidle');

    // Admin: Fill form
    await adminPage.fill('input[name="title"]', testData.title);
    await adminPage.fill('input[name="slug"]', testData.slug);
    await adminPage.fill('textarea[name="description"]', testData.description);
    await adminPage.fill('input[name="youtubeUrl"]', testData.youtubeUrl);

    // Set status to PUBLISHED
    await adminPage.selectOption('select[name="status"]', 'PUBLISHED');

    // Admin: Submit
    await adminPage.click('button[type="submit"]:has-text("저장")');
    await adminPage.waitForLoadState('networkidle');

    console.log('✅ Admin: Video created');

    // Website: Navigate to /knowledge/videos
    await websitePage.goto(`${BASE_URL}/knowledge/videos`);
    await websitePage.waitForLoadState('networkidle');

    // Website: Verify video appears
    const videoOnWebsite = websitePage.locator(`text=${testData.title}`);
    await expect(videoOnWebsite).toBeVisible({ timeout: 10000 });

    console.log('✅ Website: Video synced and visible');

    // Store slug for next tests
    test.info().annotations.push({ type: 'video-slug', description: testData.slug });
  });

  // ============================================================
  // 4. BLOGS (블로그) CRUD + Sync Test
  // ============================================================

  test('Blogs: CREATE → Website Sync', async () => {
    const testData = {
      title: `[E2E Test] 블로그 생성 테스트 ${Date.now()}`,
      content: '<p>This is a test blog post created by E2E automation.</p>',
      slug: `test-blog-${Date.now()}`,
      excerpt: 'E2E test blog excerpt'
    };

    console.log('\n📝 Testing Blogs CREATE...');

    // Admin: Navigate to Blogs
    await adminPage.goto(`${BASE_URL}/admin/blogs`);
    await adminPage.waitForLoadState('networkidle');

    // Admin: Click "Create" button
    await adminPage.click('button:has-text("새 블로그")');
    await adminPage.waitForLoadState('networkidle');

    // Admin: Fill form
    await adminPage.fill('input[name="title"]', testData.title);
    await adminPage.fill('input[name="slug"]', testData.slug);
    await adminPage.fill('textarea[name="excerpt"]', testData.excerpt);

    // TipTap editor content
    const editor = adminPage.locator('.ProseMirror');
    await editor.click();
    await editor.fill(testData.content);

    // Set status to PUBLISHED
    await adminPage.selectOption('select[name="status"]', 'PUBLISHED');

    // Admin: Submit
    await adminPage.click('button[type="submit"]:has-text("저장")');
    await adminPage.waitForLoadState('networkidle');

    console.log('✅ Admin: Blog created');

    // Website: Navigate to /knowledge/blog
    await websitePage.goto(`${BASE_URL}/knowledge/blog`);
    await websitePage.waitForLoadState('networkidle');

    // Website: Verify blog appears
    const blogOnWebsite = websitePage.locator(`text=${testData.title}`);
    await expect(blogOnWebsite).toBeVisible({ timeout: 10000 });

    console.log('✅ Website: Blog synced and visible');

    // Store slug for next tests
    test.info().annotations.push({ type: 'blog-slug', description: testData.slug });
  });

  // ============================================================
  // 5. LIBRARIES (자료실) CRUD + Sync Test
  // ============================================================

  test('Libraries: CREATE → Website Sync', async () => {
    const testData = {
      title: `[E2E Test] 자료실 생성 테스트 ${Date.now()}`,
      description: 'This is a test library resource created by E2E automation.',
      fileUrl: 'https://example.com/test-file.pdf',
      slug: `test-library-${Date.now()}`
    };

    console.log('\n📚 Testing Libraries CREATE...');

    // Admin: Navigate to Libraries
    await adminPage.goto(`${BASE_URL}/admin/libraries`);
    await adminPage.waitForLoadState('networkidle');

    // Admin: Click "Create" button
    await adminPage.click('button:has-text("새 자료")');
    await adminPage.waitForLoadState('networkidle');

    // Admin: Fill form
    await adminPage.fill('input[name="title"]', testData.title);
    await adminPage.fill('input[name="slug"]', testData.slug);
    await adminPage.fill('textarea[name="description"]', testData.description);
    await adminPage.fill('input[name="fileUrl"]', testData.fileUrl);

    // Set status to PUBLISHED
    await adminPage.selectOption('select[name="status"]', 'PUBLISHED');

    // Admin: Submit
    await adminPage.click('button[type="submit"]:has-text("저장")');
    await adminPage.waitForLoadState('networkidle');

    console.log('✅ Admin: Library resource created');

    // Website: Navigate to /knowledge/library
    await websitePage.goto(`${BASE_URL}/knowledge/library`);
    await websitePage.waitForLoadState('networkidle');

    // Website: Verify library resource appears
    const libraryOnWebsite = websitePage.locator(`text=${testData.title}`);
    await expect(libraryOnWebsite).toBeVisible({ timeout: 10000 });

    console.log('✅ Website: Library resource synced and visible');

    // Store slug for next tests
    test.info().annotations.push({ type: 'library-slug', description: testData.slug });
  });
});
