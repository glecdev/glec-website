import { test } from '@playwright/test';

test('Debug Edit Pages DOM Structure', async ({ page }) => {
  const baseUrl = 'http://localhost:3008';

  // Login first
  await page.goto(`${baseUrl}/admin/login`);
  const emailInput = page.locator('input[name="email"]');
  await emailInput.click();
  await emailInput.pressSequentially('admin@glec.io', { delay: 50 });
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.click();
  await passwordInput.pressSequentially('admin123!', { delay: 50 });
  await page.waitForTimeout(300);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(dashboard|notices)/);

  // 1. Test Notices Edit Page
  console.log('\n=== NOTICES EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/notices`);
  await page.waitForLoadState('networkidle');

  // Create a test notice first
  await page.click('text=새 공지 작성');
  await page.waitForTimeout(1000);

  const titleInput = page.locator('input').first();
  const titleName = await titleInput.getAttribute('name');
  const titleId = await titleInput.getAttribute('id');
  const titleType = await titleInput.getAttribute('type');

  console.log(`Notices NEW page - Title input:`);
  console.log(`  name="${titleName}"`);
  console.log(`  id="${titleId}"`);
  console.log(`  type="${titleType}"`);
  console.log(`  selector: input[name="${titleName}"]`);

  // Check if EDIT page exists
  await page.goto(`${baseUrl}/admin/notices/edit?id=test123`);
  await page.waitForTimeout(2000);

  const editInputs = await page.locator('input[type="text"]').all();
  console.log(`\nNotices EDIT page - Found ${editInputs.length} text inputs:`);
  for (let i = 0; i < Math.min(3, editInputs.length); i++) {
    const name = await editInputs[i].getAttribute('name');
    const id = await editInputs[i].getAttribute('id');
    const placeholder = await editInputs[i].getAttribute('placeholder');
    console.log(`  Input ${i}: name="${name}", id="${id}", placeholder="${placeholder}"`);
  }

  // 2. Test Press Edit Page
  console.log('\n=== PRESS EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/press`);
  await page.waitForLoadState('networkidle');

  await page.click('text=새 보도자료 작성');
  await page.waitForTimeout(1000);

  const pressInputs = await page.locator('input[type="text"]').all();
  console.log(`Press NEW page - Found ${pressInputs.length} text inputs:`);
  for (let i = 0; i < Math.min(3, pressInputs.length); i++) {
    const name = await pressInputs[i].getAttribute('name');
    console.log(`  Input ${i}: name="${name}"`);
  }

  // 3. Test Popups Edit Page
  console.log('\n=== POPUPS EDIT PAGE ===');
  await page.goto(`${baseUrl}/admin/popups`);
  await page.waitForLoadState('networkidle');

  const newButton = page.locator('text=+ 새 팝업 만들기').first();
  if (await newButton.count() > 0) {
    await newButton.click();
    await page.waitForTimeout(1500);

    const popupInputs = await page.locator('input[type="text"]').all();
    console.log(`Popups NEW page - Found ${popupInputs.length} text inputs:`);
    for (let i = 0; i < Math.min(5, popupInputs.length); i++) {
      const name = await popupInputs[i].getAttribute('name');
      const id = await popupInputs[i].getAttribute('id');
      const required = await popupInputs[i].getAttribute('required');
      console.log(`  Input ${i}: name="${name}", id="${id}", required="${required}"`);
    }
  }

  // Check Popups list for edit links
  await page.goto(`${baseUrl}/admin/popups`);
  await page.waitForLoadState('networkidle');

  const editLinks = await page.locator('a[href*="edit"]').all();
  console.log(`\nPopups list - Found ${editLinks.length} edit links:`);
  for (let i = 0; i < Math.min(3, editLinks.length); i++) {
    const href = await editLinks[i].getAttribute('href');
    const text = await editLinks[i].textContent();
    console.log(`  Link ${i}: href="${href}", text="${text}"`);
  }
});
