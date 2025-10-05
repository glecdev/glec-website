/**
 * Admin Knowledge Center CRUD Verification Test
 *
 * Purpose: 어드민 사이트의 지식센터 모든 페이지의 컨텐츠를
 *          생성/수정/삭제할 수 있는지 기획의도에 맞게 검증
 *
 * Coverage:
 * 1. Knowledge Library (라이브러리) - CRUD
 * 2. Press (언론보도) - CRUD
 * 3. Knowledge Videos (영상자료) - CRUD
 * 4. Knowledge Blog (블로그) - CRUD
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

// Test data for each content type
const testData = {
  library: {
    title: '[E2E Test] ISO-14083 가이드북',
    category: 'WHITEPAPER',
    description: 'E2E 테스트용 라이브러리 컨텐츠입니다. 자동 생성된 데이터입니다.',
    fileUrl: 'https://example.com/test-whitepaper.pdf',
  },
  press: {
    title: '[E2E Test] GLEC, DHL과 글로벌 파트너십 체결',
    category: 'PARTNERSHIP',
    source: '매일경제',
    sourceUrl: 'https://example.com/test-press-release',
    publishedAt: '2025-01-15',
    summary: 'E2E 테스트용 언론보도 컨텐츠입니다.',
  },
  videos: {
    title: '[E2E Test] GLEC Cloud 제품 소개',
    category: 'PRODUCT_DEMO',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 300,
    description: 'E2E 테스트용 영상 컨텐츠입니다.',
  },
  blog: {
    title: '[E2E Test] 탄소중립 실현을 위한 7가지 전략',
    category: 'SUSTAINABILITY',
    content: '# E2E 테스트용 블로그\n\n이것은 자동 생성된 테스트 컨텐츠입니다.\n\n## 소제목\n\n본문 내용...',
    tags: ['탄소중립', 'ESG', '지속가능성'],
  },
};

// Helper: Admin login
async function adminLogin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);

  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 10000 });
}

// Helper: Navigate to admin page
async function navigateToAdminPage(page: Page, pageName: string) {
  const routes = {
    'library': '/admin/knowledge-library',
    'press': '/admin/press',
    'videos': '/admin/knowledge-videos',
    'blog': '/admin/knowledge-blog',
  };

  await page.goto(`${BASE_URL}${routes[pageName]}`);
  await page.waitForLoadState('networkidle');
}

// Helper: Delete all test data (cleanup)
async function cleanupTestData(page: Page, pageName: string) {
  await navigateToAdminPage(page, pageName);

  // Find all test items (starting with [E2E Test])
  const testItems = page.locator('text=/\\[E2E Test\\]/');
  const count = await testItems.count();

  for (let i = 0; i < count; i++) {
    // Always target the first item (since deleting removes it from the list)
    const item = testItems.first();

    // Find and click delete button
    const deleteBtn = item.locator('..').locator('button:has-text("삭제"), button[aria-label*="삭제"]').first();

    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Confirm deletion
      const confirmBtn = page.locator('button:has-text("확인"), button:has-text("삭제")').first();
      if (await confirmBtn.isVisible({ timeout: 2000 })) {
        await confirmBtn.click();
      }

      // Wait for deletion to complete
      await page.waitForTimeout(1000);
    }
  }
}

test.describe('Admin Knowledge Center CRUD Verification', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test.describe('1. Knowledge Library (라이브러리) CRUD', () => {
    test('should CREATE new library content', async ({ page }) => {
      await test.step('Navigate to Knowledge Library admin page', async () => {
        await navigateToAdminPage(page, 'library');
        await expect(page).toHaveURL(/\/admin\/knowledge-library/);
      });

      await test.step('Click "New" button', async () => {
        const newBtn = page.locator('button:has-text("새 자료"), a:has-text("새 자료"), button:has-text("추가")').first();
        await expect(newBtn).toBeVisible({ timeout: 5000 });
        await newBtn.click();
      });

      await test.step('Fill in library form', async () => {
        // Title
        await page.fill('input[name="title"], input[placeholder*="제목"]', testData.library.title);

        // Category
        const categorySelect = page.locator('select[name="category"], select:has-text("카테고리")').first();
        if (await categorySelect.isVisible()) {
          await categorySelect.selectOption(testData.library.category);
        }

        // Description
        await page.fill('textarea[name="description"], textarea[placeholder*="설명"]', testData.library.description);

        // File URL
        await page.fill('input[name="fileUrl"], input[placeholder*="URL"]', testData.library.fileUrl);
      });

      await test.step('Submit form and verify creation', async () => {
        await page.click('button[type="submit"]:has-text("저장"), button:has-text("생성")');

        // Wait for success message or redirect
        await page.waitForTimeout(2000);

        // Verify redirect to list page
        await expect(page).toHaveURL(/\/admin\/knowledge-library/, { timeout: 5000 });

        // Verify item appears in list
        await expect(page.locator(`text=${testData.library.title}`)).toBeVisible({ timeout: 5000 });
      });
    });

    test('should READ library content list', async ({ page }) => {
      await navigateToAdminPage(page, 'library');

      // Verify table/list exists
      const contentList = page.locator('table, [role="table"], .content-list').first();
      await expect(contentList).toBeVisible();

      // Verify test item is visible
      await expect(page.locator(`text=${testData.library.title}`)).toBeVisible();
    });

    test('should UPDATE existing library content', async ({ page }) => {
      await navigateToAdminPage(page, 'library');

      // Find test item
      const testItem = page.locator(`text=${testData.library.title}`).first();
      await expect(testItem).toBeVisible();

      // Click edit button
      const editBtn = testItem.locator('..').locator('button:has-text("수정"), a:has-text("수정")').first();
      await editBtn.click();

      // Update title
      const updatedTitle = testData.library.title + ' (수정됨)';
      await page.fill('input[name="title"], input[placeholder*="제목"]', updatedTitle);

      // Submit update
      await page.click('button[type="submit"]:has-text("저장"), button:has-text("수정")');
      await page.waitForTimeout(2000);

      // Verify update
      await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();
    });

    test('should DELETE library content', async ({ page }) => {
      await navigateToAdminPage(page, 'library');

      // Find test item
      const testItem = page.locator('text=/\\[E2E Test\\].*라이브러리/').first();

      if (await testItem.isVisible()) {
        // Click delete button
        const deleteBtn = testItem.locator('..').locator('button:has-text("삭제")').first();
        await deleteBtn.click();

        // Confirm deletion
        const confirmBtn = page.locator('button:has-text("확인"), button:has-text("삭제")').first();
        await confirmBtn.click();

        // Verify deletion
        await expect(testItem).not.toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('2. Press (언론보도) CRUD', () => {
    test('should CREATE new press content', async ({ page }) => {
      await navigateToAdminPage(page, 'press');

      const newBtn = page.locator('button:has-text("새 기사"), a:has-text("새 기사"), button:has-text("추가")').first();
      await newBtn.click();

      // Fill form
      await page.fill('input[name="title"]', testData.press.title);
      await page.selectOption('select[name="category"]', testData.press.category);
      await page.fill('input[name="source"]', testData.press.source);
      await page.fill('input[name="sourceUrl"]', testData.press.sourceUrl);
      await page.fill('input[name="publishedAt"], input[type="date"]', testData.press.publishedAt);
      await page.fill('textarea[name="summary"]', testData.press.summary);

      // Submit
      await page.click('button[type="submit"]:has-text("저장")');
      await page.waitForTimeout(2000);

      // Verify
      await expect(page.locator(`text=${testData.press.title}`)).toBeVisible();
    });

    test('should READ, UPDATE, DELETE press content', async ({ page }) => {
      await navigateToAdminPage(page, 'press');

      // READ
      await expect(page.locator(`text=${testData.press.title}`)).toBeVisible();

      // UPDATE
      const editBtn = page.locator(`text=${testData.press.title}`).locator('..').locator('button:has-text("수정")').first();
      await editBtn.click();

      const updatedTitle = testData.press.title + ' (수정됨)';
      await page.fill('input[name="title"]', updatedTitle);
      await page.click('button[type="submit"]:has-text("저장")');
      await page.waitForTimeout(2000);

      await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();

      // DELETE
      const deleteBtn = page.locator(`text=${updatedTitle}`).locator('..').locator('button:has-text("삭제")').first();
      await deleteBtn.click();

      const confirmBtn = page.locator('button:has-text("확인"), button:has-text("삭제")').first();
      await confirmBtn.click();

      await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible();
    });
  });

  test.describe('3. Knowledge Videos (영상자료) CRUD', () => {
    test('should CREATE new video content', async ({ page }) => {
      await navigateToAdminPage(page, 'videos');

      const newBtn = page.locator('button:has-text("새 영상"), button:has-text("추가")').first();
      await newBtn.click();

      // Fill form
      await page.fill('input[name="title"]', testData.videos.title);
      await page.selectOption('select[name="category"]', testData.videos.category);
      await page.fill('input[name="youtubeUrl"], input[placeholder*="YouTube"]', testData.videos.youtubeUrl);
      await page.fill('input[name="duration"], input[type="number"]', testData.videos.duration.toString());
      await page.fill('textarea[name="description"]', testData.videos.description);

      // Submit
      await page.click('button[type="submit"]:has-text("저장")');
      await page.waitForTimeout(2000);

      // Verify
      await expect(page.locator(`text=${testData.videos.title}`)).toBeVisible();
    });

    test('should READ, UPDATE, DELETE video content', async ({ page }) => {
      await navigateToAdminPage(page, 'videos');

      // READ
      await expect(page.locator(`text=${testData.videos.title}`)).toBeVisible();

      // UPDATE
      const editBtn = page.locator(`text=${testData.videos.title}`).locator('..').locator('button:has-text("수정")').first();
      await editBtn.click();

      const updatedTitle = testData.videos.title + ' (수정됨)';
      await page.fill('input[name="title"]', updatedTitle);
      await page.click('button[type="submit"]:has-text("저장")');
      await page.waitForTimeout(2000);

      await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();

      // DELETE
      const deleteBtn = page.locator(`text=${updatedTitle}`).locator('..').locator('button:has-text("삭제")').first();
      await deleteBtn.click();

      const confirmBtn = page.locator('button:has-text("확인"), button:has-text("삭제")').first();
      await confirmBtn.click();

      await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible();
    });
  });

  test.describe('4. Knowledge Blog (블로그) CRUD', () => {
    test('should CREATE new blog post', async ({ page }) => {
      await navigateToAdminPage(page, 'blog');

      const newBtn = page.locator('button:has-text("새 글"), button:has-text("작성"), button:has-text("추가")').first();
      await newBtn.click();

      // Fill form
      await page.fill('input[name="title"]', testData.blog.title);
      await page.selectOption('select[name="category"]', testData.blog.category);

      // Content editor (could be TipTap or textarea)
      const contentEditor = page.locator('textarea[name="content"], .ProseMirror, [contenteditable="true"]').first();
      await contentEditor.fill(testData.blog.content);

      // Tags (if available)
      for (const tag of testData.blog.tags) {
        const tagInput = page.locator('input[name="tags"], input[placeholder*="태그"]').first();
        if (await tagInput.isVisible()) {
          await tagInput.fill(tag);
          await page.keyboard.press('Enter');
        }
      }

      // Submit
      await page.click('button[type="submit"]:has-text("저장"), button:has-text("발행")');
      await page.waitForTimeout(2000);

      // Verify
      await expect(page.locator(`text=${testData.blog.title}`)).toBeVisible();
    });

    test('should READ, UPDATE, DELETE blog post', async ({ page }) => {
      await navigateToAdminPage(page, 'blog');

      // READ
      await expect(page.locator(`text=${testData.blog.title}`)).toBeVisible();

      // UPDATE
      const editBtn = page.locator(`text=${testData.blog.title}`).locator('..').locator('button:has-text("수정")').first();
      await editBtn.click();

      const updatedTitle = testData.blog.title + ' (수정됨)';
      await page.fill('input[name="title"]', updatedTitle);
      await page.click('button[type="submit"]:has-text("저장")');
      await page.waitForTimeout(2000);

      await expect(page.locator(`text=${updatedTitle}`)).toBeVisible();

      // DELETE
      const deleteBtn = page.locator(`text=${updatedTitle}`).locator('..').locator('button:has-text("삭제")').first();
      await deleteBtn.click();

      const confirmBtn = page.locator('button:has-text("확인"), button:has-text("삭제")').first();
      await confirmBtn.click();

      await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible();
    });
  });

  test.describe('Cleanup', () => {
    test('should cleanup all test data', async ({ page }) => {
      // Cleanup Library
      await cleanupTestData(page, 'library');

      // Cleanup Press
      await cleanupTestData(page, 'press');

      // Cleanup Videos
      await cleanupTestData(page, 'videos');

      // Cleanup Blog
      await cleanupTestData(page, 'blog');
    });
  });
});
