import { test } from '@playwright/test';

test('Discover Edit Page Selectors', async ({ page }) => {
  const baseUrl = 'http://localhost:3008';

  // Login
  await page.goto(`${baseUrl}/admin/login`);
  await page.locator('input[name="email"]').fill('admin@glec.io');
  await page.locator('input[name="password"]').fill('admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(dashboard|notices)/);

  // === NOTICES: Create then Edit ===
  console.log('\n=== NOTICES EDIT PAGE ===');

  // Go to notices list
  await page.goto(`${baseUrl}/admin/notices`);
  await page.waitForLoadState('networkidle');

  // Create a new notice
  await page.click('text=새 공지 작성');
  await page.waitForTimeout(1000);

  // Fill in basic info to create it
  await page.locator('input[name="title"]').fill('Playwright Test Notice');
  const tiptapNew = page.locator('.ProseMirror').first();
  await tiptapNew.click();
  await tiptapNew.fill('Test content');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/notices$/);
  await page.waitForTimeout(1000);

  // Now find and click the first edit link
  const editLinks = await page.locator('a[href*="/admin/notices/edit"]').all();
  console.log(`\nFound ${editLinks.length} edit links in notices list`);

  if (editLinks.length > 0) {
    const href = await editLinks[0].getAttribute('href');
    console.log(`Navigating to: ${href}`);

    await page.goto(`${baseUrl}${href}`);
    await page.waitForTimeout(3000); // Wait for data to load

    // Now discover all selectors
    console.log('\n✅ Successfully loaded edit page!');

    // Regular inputs
    const titleExists = await page.locator('input#title').count() > 0;
    console.log(`\nTitle input: input#title (exists: ${titleExists})`);

    const categoryExists = await page.locator('select#category').count() > 0;
    console.log(`Category select: select#category (exists: ${categoryExists})`);

    const excerptExists = await page.locator('textarea#excerpt').count() > 0;
    console.log(`Excerpt textarea: textarea#excerpt (exists: ${excerptExists})`);

    const thumbnailExists = await page.locator('input#thumbnail_url').count() > 0;
    console.log(`Thumbnail input: input#thumbnail_url (exists: ${thumbnailExists})`);

    // TipTap editor
    const tiptapCount = await page.locator('.ProseMirror').count();
    console.log(`\nTipTap editor: .ProseMirror (count: ${tiptapCount})`);

    if (tiptapCount > 0) {
      const tiptap = page.locator('.ProseMirror').first();
      const contenteditable = await tiptap.getAttribute('contenteditable');
      const role = await tiptap.getAttribute('role');
      console.log(`  contenteditable="${contenteditable}", role="${role}"`);

      // Test filling
      console.log('\n  Testing TipTap fill()...');
      await tiptap.click();
      await tiptap.fill('Updated content via Playwright');
      const text = await tiptap.textContent();
      console.log(`  ✅ Text after fill: "${text}"`);
    }

    // Radio buttons
    const draftExists = await page.locator('input[name="status"][value="DRAFT"]').count() > 0;
    const publishedExists = await page.locator('input[name="status"][value="PUBLISHED"]').count() > 0;
    const archivedExists = await page.locator('input[name="status"][value="ARCHIVED"]').count() > 0;
    console.log(`\nStatus radios:`);
    console.log(`  DRAFT: ${draftExists}`);
    console.log(`  PUBLISHED: ${publishedExists}`);
    console.log(`  ARCHIVED: ${archivedExists}`);
  }

  // === PRESS: Check structure ===
  console.log('\n\n=== PRESS EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/press`);
  await page.waitForLoadState('networkidle');

  const pressEditLinks = await page.locator('a[href*="/admin/press/edit"]').count();
  console.log(`Found ${pressEditLinks} press edit links`);

  if (pressEditLinks > 0) {
    const pressHref = await page.locator('a[href*="/admin/press/edit"]').first().getAttribute('href');
    await page.goto(`${baseUrl}${pressHref}`);
    await page.waitForTimeout(2000);

    const pressTitleExists = await page.locator('input[name="title"]').count() > 0;
    const pressTiptapExists = await page.locator('.ProseMirror').count() > 0;
    console.log(`\nPress edit page:`);
    console.log(`  Title input: ${pressTitleExists}`);
    console.log(`  TipTap editor: ${pressTiptapExists}`);
  } else {
    console.log('No press items - checking NEW page');
    await page.click('text=새 보도자료 작성');
    await page.waitForTimeout(1000);

    const pressTitleExists = await page.locator('input[name="title"]').count() > 0;
    const pressTiptapExists = await page.locator('.ProseMirror').count() > 0;
    console.log(`\nPress new page:`);
    console.log(`  Title input: ${pressTitleExists}`);
    console.log(`  TipTap editor: ${pressTiptapExists}`);
  }

  // === POPUPS: Check structure ===
  console.log('\n\n=== POPUPS EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/popups`);
  await page.waitForLoadState('networkidle');

  const popupEditLinks = await page.locator('a[href*="/admin/popups/edit"]').count();
  console.log(`Found ${popupEditLinks} popup edit links`);

  if (popupEditLinks > 0) {
    const popupHref = await page.locator('a[href*="/admin/popups/edit"]').first().getAttribute('href');
    await page.goto(`${baseUrl}${popupHref}`);
    await page.waitForTimeout(2000);

    // Check all possible selectors
    console.log('\nPopup edit page inputs:');

    const allInputs = await page.locator('input:visible').all();
    console.log(`  Found ${allInputs.length} visible inputs`);

    for (let i = 0; i < Math.min(10, allInputs.length); i++) {
      const type = await allInputs[i].getAttribute('type');
      const name = await allInputs[i].getAttribute('name');
      const id = await allInputs[i].getAttribute('id');
      const placeholder = await allInputs[i].getAttribute('placeholder');
      console.log(`  Input ${i}: type="${type}", name="${name}", id="${id}", placeholder="${placeholder}"`);
    }

    const allTextareas = await page.locator('textarea:visible').all();
    console.log(`\n  Found ${allTextareas.length} visible textareas`);
    for (let i = 0; i < allTextareas.length; i++) {
      const name = await allTextareas[i].getAttribute('name');
      const id = await allTextareas[i].getAttribute('id');
      console.log(`  Textarea ${i}: name="${name}", id="${id}"`);
    }

    const popupTiptapExists = await page.locator('.ProseMirror').count() > 0;
    console.log(`\n  TipTap editor: ${popupTiptapExists}`);
  } else {
    console.log('No popup items to edit');
  }

  console.log('\n\n=== SUMMARY ===');
  console.log('Notices Edit: input#title, select#category, .ProseMirror, textarea#excerpt, input#thumbnail_url, input[name="status"]');
  console.log('Press Edit: input[name="title"], .ProseMirror');
  console.log('Popups Edit: (check output above)');
});
