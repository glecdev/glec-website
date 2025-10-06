import { test, expect } from '@playwright/test';

test.describe('Knowledge Detail Pages - E2E Tests', () => {
  test('should load blog detail page and display all elements', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge/blog');
    await page.waitForLoadState('networkidle');

    // Click on the first blog post
    const firstPost = page.locator('a[href*="/knowledge/blog/"]').first();
    await firstPost.click();

    await page.waitForLoadState('networkidle');

    // Check URL changed to detail page
    expect(page.url()).toContain('/knowledge/blog/');

    // Check page elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=블로그 목록')).toBeVisible(); // Back button
    await expect(page.locator('text=공유')).toBeVisible(); // Share button

    // Check metadata
    await expect(page.locator('text=/\\d+분 읽기/')).toBeVisible(); // Read time
    await expect(page.locator('text=/\\d+ 조회/')).toBeVisible(); // View count

    console.log('✅ Blog detail page loaded successfully');
  });

  test('should load video detail page and display YouTube player', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge/videos');
    await page.waitForLoadState('networkidle');

    // Click on the first video
    const firstVideo = page.locator('a[href*="/knowledge/videos/"]').first();
    await firstVideo.click();

    await page.waitForLoadState('networkidle');

    // Check URL changed to detail page
    expect(page.url()).toContain('/knowledge/videos/');

    // Check page elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=영상 목록')).toBeVisible(); // Back button
    await expect(page.locator('text=공유')).toBeVisible(); // Share button

    // Check YouTube iframe is present
    const iframe = page.locator('iframe[src*="youtube.com/embed"]');
    await expect(iframe).toBeVisible();

    // Check metadata
    await expect(page.locator('text=/\\d+ 조회/')).toBeVisible(); // View count

    console.log('✅ Video detail page loaded successfully');
  });

  test('should navigate back to list page from blog detail', async ({ page }) => {
    // Go directly to a blog detail page
    await page.goto('http://localhost:3000/knowledge/blog/test-blog-post---quick-test-mgd8rtft');
    await page.waitForLoadState('networkidle');

    // Click back button
    await page.locator('text=블로그 목록').click();
    await page.waitForLoadState('networkidle');

    // Should be back on list page
    expect(page.url()).toBe('http://localhost:3000/knowledge/blog');
    await expect(page.locator('h1:has-text("블로그")')).toBeVisible();

    console.log('✅ Back navigation works correctly');
  });

  test('should handle 404 for non-existent blog post', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge/blog/non-existent-slug-12345');
    await page.waitForLoadState('networkidle');

    // Should show error message
    await expect(page.locator('text=/블로그 포스트를 찾을 수 없습니다|포스트를 불러오는 중 오류가 발생했습니다/')).toBeVisible();
    await expect(page.locator('text=블로그 목록으로 돌아가기')).toBeVisible();

    console.log('✅ 404 handling works correctly');
  });

  test('should increment view count when viewing blog post', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge/blog/test-blog-post---quick-test-mgd8rtft');
    await page.waitForLoadState('networkidle');

    // Get initial view count
    const viewCountText = await page.locator('text=/\\d+ 조회/').textContent();
    const initialCount = parseInt(viewCountText?.match(/\d+/)?.[0] || '0');

    console.log('Initial view count:', initialCount);

    // Reload page to increment view count
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Get new view count
    const newViewCountText = await page.locator('text=/\\d+ 조회/').textContent();
    const newCount = parseInt(newViewCountText?.match(/\d+/)?.[0] || '0');

    console.log('New view count:', newCount);

    // View count should have increased
    expect(newCount).toBeGreaterThan(initialCount);

    console.log('✅ View count increment works correctly');
  });

  test('should show related posts on blog detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/knowledge/blog/test-blog-post---quick-test-mgd8rtft');
    await page.waitForLoadState('networkidle');

    // Check if related posts section exists (may or may not have posts)
    const relatedSection = page.locator('text=관련 포스트');

    // If there are related posts, they should be visible
    if (await relatedSection.isVisible()) {
      console.log('✅ Related posts section is visible');
    } else {
      console.log('ℹ️ No related posts available (expected if only one post exists)');
    }
  });
});
