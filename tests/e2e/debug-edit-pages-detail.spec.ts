import { test } from '@playwright/test';

test('Debug Edit Pages Detail Analysis', async ({ page }) => {
  const baseUrl = 'http://localhost:3008';

  // Login first
  await page.goto(`${baseUrl}/admin/login`);
  await page.locator('input[name="email"]').fill('admin@glec.io');
  await page.locator('input[name="password"]').fill('admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(dashboard|notices)/);

  // 1. Check Notices Edit Page with real ID
  console.log('\n=== NOTICES EDIT PAGE (Real ID) ===');
  await page.goto(`${baseUrl}/admin/notices`);
  await page.waitForLoadState('networkidle');

  // Find first edit link
  const noticesEditLink = page.locator('a[href*="/admin/notices/edit"]').first();
  const noticesEditHref = await noticesEditLink.getAttribute('href');
  console.log(`First edit link: ${noticesEditHref}`);

  if (noticesEditHref) {
    await page.goto(`${baseUrl}${noticesEditHref}`);
    await page.waitForTimeout(2000);

    const allInputs = await page.locator('input').all();
    console.log(`\nFound ${allInputs.length} total inputs on edit page:`);
    for (let i = 0; i < allInputs.length; i++) {
      const name = await allInputs[i].getAttribute('name');
      const type = await allInputs[i].getAttribute('type');
      const id = await allInputs[i].getAttribute('id');
      const value = await allInputs[i].inputValue();
      console.log(`  Input ${i}: type="${type}", name="${name}", id="${id}", value="${value?.substring(0, 30)}..."`);
    }

    // Check for textarea
    const textareas = await page.locator('textarea').all();
    console.log(`\nFound ${textareas.length} textareas:`);
    for (let i = 0; i < textareas.length; i++) {
      const name = await textareas[i].getAttribute('name');
      const id = await textareas[i].getAttribute('id');
      console.log(`  Textarea ${i}: name="${name}", id="${id}"`);
    }
  }

  // 2. Check Press Edit Page with real ID
  console.log('\n=== PRESS EDIT PAGE (Real ID) ===');
  await page.goto(`${baseUrl}/admin/press`);
  await page.waitForLoadState('networkidle');

  const pressEditLink = page.locator('a[href*="/admin/press/edit"]').first();
  const pressEditHref = await pressEditLink.getAttribute('href');
  console.log(`First edit link: ${pressEditHref}`);

  if (pressEditHref) {
    await page.goto(`${baseUrl}${pressEditHref}`);
    await page.waitForTimeout(2000);

    const allInputs = await page.locator('input').all();
    console.log(`\nFound ${allInputs.length} total inputs on edit page:`);
    for (let i = 0; i < Math.min(5, allInputs.length); i++) {
      const name = await allInputs[i].getAttribute('name');
      const type = await allInputs[i].getAttribute('type');
      console.log(`  Input ${i}: type="${type}", name="${name}"`);
    }
  }

  // 3. Check Popups Edit Page with real ID
  console.log('\n=== POPUPS EDIT PAGE (Real ID) ===');
  await page.goto(`${baseUrl}/admin/popups/edit?id=1`);
  await page.waitForTimeout(2000);

  const popupInputs = await page.locator('input').all();
  console.log(`\nFound ${popupInputs.length} total inputs on popup edit page:`);
  for (let i = 0; i < popupInputs.length; i++) {
    const name = await popupInputs[i].getAttribute('name');
    const type = await popupInputs[i].getAttribute('type');
    const id = await popupInputs[i].getAttribute('id');
    const placeholder = await popupInputs[i].getAttribute('placeholder');
    console.log(`  Input ${i}: type="${type}", name="${name}", id="${id}", placeholder="${placeholder}"`);
  }

  // Check for textareas
  const popupTextareas = await page.locator('textarea').all();
  console.log(`\nFound ${popupTextareas.length} textareas:`);
  for (let i = 0; i < popupTextareas.length; i++) {
    const name = await popupTextareas[i].getAttribute('name');
    const id = await popupTextareas[i].getAttribute('id');
    console.log(`  Textarea ${i}: name="${name}", id="${id}"`);
  }
});
