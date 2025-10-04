import { test } from '@playwright/test';

test('Find TipTap Editor Selectors', async ({ page }) => {
  const baseUrl = 'http://localhost:3008';

  // Login
  await page.goto(`${baseUrl}/admin/login`);
  await page.locator('input[name="email"]').fill('admin@glec.io');
  await page.locator('input[name="password"]').fill('admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(dashboard|notices)/);

  // === NOTICES EDIT PAGE ===
  console.log('\n=== NOTICES EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/notices`);
  await page.waitForLoadState('networkidle');

  const noticesEditLink = page.locator('a[href*="/admin/notices/edit"]').first();
  const noticesEditHref = await noticesEditLink.getAttribute('href');

  if (noticesEditHref) {
    await page.goto(`${baseUrl}${noticesEditHref}`);
    await page.waitForTimeout(2000);

    // Find regular inputs
    console.log('\nRegular inputs:');
    const titleInput = page.locator('input#title');
    console.log(`  Title: input#title (name="${await titleInput.getAttribute('name')}")`);

    const categorySelect = page.locator('select#category');
    console.log(`  Category: select#category (name="${await categorySelect.getAttribute('name')}")`);

    const excerptTextarea = page.locator('textarea#excerpt');
    console.log(`  Excerpt: textarea#excerpt (name="${await excerptTextarea.getAttribute('name')}")`);

    const thumbnailInput = page.locator('input#thumbnail_url');
    console.log(`  Thumbnail: input#thumbnail_url (name="${await thumbnailInput.getAttribute('name')}")`);

    // Find TipTap editor
    console.log('\nTipTap Editor:');
    const tiptapEditor = page.locator('.ProseMirror');
    const tiptapCount = await tiptapEditor.count();
    console.log(`  Found ${tiptapCount} TipTap editors`);

    if (tiptapCount > 0) {
      const role = await tiptapEditor.getAttribute('role');
      const contenteditable = await tiptapEditor.getAttribute('contenteditable');
      const ariaLabel = await tiptapEditor.getAttribute('aria-label');
      console.log(`  Selector: .ProseMirror`);
      console.log(`  contenteditable="${contenteditable}", role="${role}", aria-label="${ariaLabel}"`);

      // Test if we can type in it
      await tiptapEditor.click();
      await tiptapEditor.fill(''); // Clear
      await tiptapEditor.fill('Test content from Playwright');
      const text = await tiptapEditor.textContent();
      console.log(`  Text content after fill: "${text}"`);
    }

    // Find radio buttons
    console.log('\nStatus radio buttons:');
    const draftRadio = page.locator('input[name="status"][value="DRAFT"]');
    const publishedRadio = page.locator('input[name="status"][value="PUBLISHED"]');
    const archivedRadio = page.locator('input[name="status"][value="ARCHIVED"]');
    console.log(`  Draft: input[name="status"][value="DRAFT"]`);
    console.log(`  Published: input[name="status"][value="PUBLISHED"]`);
    console.log(`  Archived: input[name="status"][value="ARCHIVED"]`);
  }

  // === PRESS EDIT PAGE ===
  console.log('\n=== PRESS EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/press`);
  await page.waitForLoadState('networkidle');

  // Check if there are any press items
  const pressEditLinks = await page.locator('a[href*="/admin/press/edit"]').count();
  console.log(`Found ${pressEditLinks} edit links`);

  if (pressEditLinks > 0) {
    const pressEditLink = page.locator('a[href*="/admin/press/edit"]').first();
    const pressEditHref = await pressEditLink.getAttribute('href');

    await page.goto(`${baseUrl}${pressEditHref}`);
    await page.waitForTimeout(2000);

    console.log('\nPress edit page inputs:');
    const pressTitleInput = page.locator('input[name="title"]');
    console.log(`  Title: input[name="title"] (exists: ${await pressTitleInput.count() > 0})`);

    const pressTiptap = page.locator('.ProseMirror');
    console.log(`  TipTap editor: .ProseMirror (exists: ${await pressTiptap.count() > 0})`);
  } else {
    console.log('No press items to edit - checking NEW page instead');
    await page.click('text=새 보도자료 작성');
    await page.waitForTimeout(1000);

    const pressTitleInput = page.locator('input[name="title"]');
    console.log(`  Title: input[name="title"] (exists: ${await pressTitleInput.count() > 0})`);

    const pressTiptap = page.locator('.ProseMirror');
    console.log(`  TipTap editor: .ProseMirror (exists: ${await pressTiptap.count() > 0})`);
  }

  // === POPUPS EDIT PAGE ===
  console.log('\n=== POPUPS EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/popups/edit?id=1`);
  await page.waitForTimeout(2000);

  console.log('\nPopup edit page inputs:');

  // Try different selectors
  const popupInputs = {
    'input[name="title"]': await page.locator('input[name="title"]').count(),
    'input#title': await page.locator('input#title').count(),
    'input[placeholder*="제목"]': await page.locator('input[placeholder*="제목"]').count(),
    'input[type="text"]:visible': await page.locator('input[type="text"]:visible').count(),
  };

  console.log('Popup input selectors:');
  for (const [selector, count] of Object.entries(popupInputs)) {
    console.log(`  ${selector}: ${count} elements`);
  }

  // List all visible inputs
  const allVisibleInputs = await page.locator('input[type="text"]:visible').all();
  console.log(`\nAll ${allVisibleInputs.length} visible text inputs on popup edit:`);
  for (let i = 0; i < allVisibleInputs.length; i++) {
    const name = await allVisibleInputs[i].getAttribute('name');
    const id = await allVisibleInputs[i].getAttribute('id');
    const placeholder = await allVisibleInputs[i].getAttribute('placeholder');
    const label = await page.locator(`label[for="${id}"]`).textContent().catch(() => 'no label');
    console.log(`  Input ${i}: name="${name}", id="${id}", placeholder="${placeholder}"`);
    console.log(`    Label: "${label}"`);
  }

  // Check for textareas
  const popupTextareas = await page.locator('textarea:visible').all();
  console.log(`\nAll ${popupTextareas.length} visible textareas on popup edit:`);
  for (let i = 0; i < popupTextareas.length; i++) {
    const name = await popupTextareas[i].getAttribute('name');
    const id = await popupTextareas[i].getAttribute('id');
    console.log(`  Textarea ${i}: name="${name}", id="${id}"`);
  }

  // Check for TipTap
  const popupTiptap = page.locator('.ProseMirror');
  console.log(`\nTipTap editor: .ProseMirror (exists: ${await popupTiptap.count() > 0})`);
});
