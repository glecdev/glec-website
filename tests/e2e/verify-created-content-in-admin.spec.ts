import { test } from '@playwright/test';

const BASE_URL = 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

test.setTimeout(120000);

test('Verify recently created Notice appears in Admin table', async ({ page }) => {
  console.log('🔐 Logging into Admin...');

  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/admin/dashboard`, { timeout: 20000 });

  console.log('✅ Logged in');

  await page.goto(`${BASE_URL}/admin/notices`);
  await page.waitForLoadState('networkidle');

  console.log('📊 Notices Admin Page loaded');

  await page.screenshot({ path: 'test-results/admin-notices-table-full.png', fullPage: true });

  const tableText = await page.locator('table').textContent();
  
  console.log('📝 Table content (first 500 chars):');
  console.log(tableText?.substring(0, 500));

  const hasE2ETest = tableText?.includes('E2E');

  console.log(`\n🔍 Contains "E2E": ${hasE2ETest ? '✅ YES' : '❌ NO'}`);

  if (hasE2ETest) {
    const e2eRows = await page.locator('tr:has-text("E2E")').count();
    console.log(`Found ${e2eRows} rows containing "E2E"`);
  }
});
