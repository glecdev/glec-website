/**
 * Debug test for Blog CREATE to identify the exact failure point
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3008';

test('Debug Blog CREATE', async ({ page }) => {
  // Enable verbose console logging
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Login
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[name="email"]', 'admin@glec.io');
  await page.fill('input[name="password"]', 'admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\//);
  console.log('✅ Login successful');

  // Navigate to Blog
  await page.goto(`${BASE_URL}/admin/knowledge-blog`);
  await page.waitForLoadState('networkidle');
  console.log('✅ Blog page loaded');

  // Click create button
  const createButton = page.locator('text=블로그 작성').first();
  console.log('Checking create button...');
  console.log('Create button count:', await createButton.count());

  if (await createButton.count() === 0) {
    console.log('❌ Create button not found!');
    console.log('Available buttons:', await page.locator('button').allTextContents());
    throw new Error('Create button not found');
  }

  await createButton.click();
  await page.waitForTimeout(1000);
  console.log('✅ Clicked create button');

  // Check if modal opened
  const modalVisible = await page.locator('.modal, [role="dialog"]').count() > 0;
  console.log('Modal visible:', modalVisible);

  // Fill fields one by one with detailed logging
  const testTimestamp = Date.now();
  const fields = {
    title: `Debug Test Blog ${testTimestamp}`,
    content: '<p>Debug test content</p>',
    excerpt: 'Debug excerpt',
    author: 'Debug Author',
    'modal-category': 'TECHNICAL',
    tags: 'debug, test',
  };

  for (const [fieldId, value] of Object.entries(fields)) {
    console.log(`\nFilling field: ${fieldId}`);
    const field = page.locator(`#${fieldId}`).first();
    const fieldCount = await field.count();
    console.log(`  Field count: ${fieldCount}`);

    if (fieldCount === 0) {
      console.log(`  ❌ Field #${fieldId} not found!`);
      console.log('  Available IDs:', await page.locator('[id]').evaluateAll(els => els.map(el => el.id)));
      throw new Error(`Field #${fieldId} not found`);
    }

    const tagName = await field.evaluate(el => el.tagName.toLowerCase());
    console.log(`  Tag name: ${tagName}`);

    if (tagName === 'select') {
      console.log(`  Selecting option: ${value}`);
      await field.selectOption(value);
    } else {
      console.log(`  Filling text: ${value.substring(0, 20)}...`);
      await field.click();
      await field.pressSequentially(value, { delay: 20 });
    }

    await page.waitForTimeout(200);
    console.log(`  ✅ Filled ${fieldId}`);
  }

  console.log('\n✅ All fields filled');
  await page.waitForTimeout(500);

  // Find and click submit button
  console.log('\nLooking for submit button...');
  const submitButton = page.locator('button[type="submit"]').first();
  const submitCount = await submitButton.count();
  console.log('Submit button count:', submitCount);

  if (submitCount === 0) {
    console.log('❌ Submit button not found!');
    console.log('Available buttons:', await page.locator('button').allTextContents());
    throw new Error('Submit button not found');
  }

  console.log('Clicking submit button...');
  await submitButton.click({ force: true });
  await page.waitForTimeout(3000);

  // Check if item was created
  console.log('\nChecking if blog post was created...');
  const testTitle = `Debug Test Blog ${testTimestamp}`;
  const itemExists = await page.locator(`text=${testTitle}`).count() > 0;
  console.log('Blog post exists:', itemExists);

  if (!itemExists) {
    console.log('❌ Blog post not found in list');
    console.log('Visible text:', await page.locator('body').textContent());
  } else {
    console.log('✅ Blog post created successfully');
  }

  expect(itemExists).toBe(true);
});
