import { test } from '@playwright/test';

test('Debug Popups List - Edit Links', async ({ page }) => {
  const baseUrl = 'http://localhost:3008';

  // Login
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

  // Go to Popups list
  console.log('\n=== POPUPS LIST PAGE ===');
  await page.goto(`${baseUrl}/admin/popups`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check all links with href containing "edit"
  const editLinks = await page.locator('a[href*="edit"]').all();
  console.log(`Found ${editLinks.length} links with href containing "edit":`);

  for (let i = 0; i < editLinks.length; i++) {
    const href = await editLinks[i].getAttribute('href');
    const text = await editLinks[i].textContent();
    console.log(`  Link ${i}: href="${href}", text="${text?.trim()}"`);
  }

  // Check for "수정" text
  const modifyButtons = await page.locator('text=수정').all();
  console.log(`\nFound ${modifyButtons.length} elements with text "수정":`);

  for (let i = 0; i < modifyButtons.length; i++) {
    const tagName = await modifyButtons[i].evaluate(el => el.tagName);
    const href = await modifyButtons[i].evaluate(el => (el as HTMLAnchorElement).href);
    console.log(`  Element ${i}: <${tagName}>, href="${href}"`);
  }

  // Check all cards with different selectors
  const cards1 = await page.locator('div.flex.items-center.gap-6').all();
  console.log(`\nFound ${cards1.length} cards with "div.flex.items-center.gap-6"`);

  const cards2 = await page.locator('div').filter({ has: page.locator('a[href*="edit"]') }).all();
  console.log(`Found ${cards2.length} divs containing edit links`);

  // Based on source code analysis, cards should have this structure:
  // div.bg-white.rounded-lg.shadow-sm.border.p-6 (the popup card)
  //   div.flex.items-start.justify-between.gap-4
  //     div (drag handle)
  //     div.flex-1 (content)
  //     div.flex.gap-2 (actions with edit/delete links)

  const popupCards = await page.locator('div.bg-white.rounded-lg.shadow-sm.border.p-6').all();
  console.log(`\nFound ${popupCards.length} popup cards with selector "div.bg-white.rounded-lg.shadow-sm.border.p-6"`);

  if (popupCards.length > 0) {
    console.log('\nFirst popup card structure:');
    const firstCardHTML = await popupCards[0].innerHTML();
    console.log(firstCardHTML.substring(0, 1500) + '\n...');
  }

  // Check if edit links are inside action divs
  const actionDivs = await page.locator('div.flex.gap-2').all();
  console.log(`\nFound ${actionDivs.length} action divs with selector "div.flex.gap-2"`);

  // Check table rows
  const tableRows = await page.locator('tr').all();
  console.log(`\nFound ${tableRows.length} table rows`);

  if (tableRows.length > 1) {
    console.log('\nFirst data row HTML:');
    const firstRowHTML = await tableRows[1].innerHTML();
    console.log(firstRowHTML);
  }
});
