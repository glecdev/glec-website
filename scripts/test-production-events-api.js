const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== Logging in to get token...');
  await page.goto('https://glec-website.vercel.app/admin/login');
  await page.fill('input[type="email"]', 'admin@glec.io');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(dashboard|demo-requests)/, { timeout: 15000 });

  console.log('=== Getting token from localStorage...');
  const token = await page.evaluate(() => localStorage.getItem('admin_token'));
  console.log('Token obtained:', token ? 'Yes' : 'No');

  console.log('\n=== Testing Events API directly...');
  const apiResponse = await page.evaluate(async (authToken) => {
    try {
      const response = await fetch('/api/admin/events?page=1&per_page=5', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      return {
        status: response.status,
        ok: response.ok,
        data: data
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }, token);

  console.log('\n=== API Response ===');
  console.log('Status:', apiResponse.status);
  console.log('OK:', apiResponse.ok);
  console.log('Data:', JSON.stringify(apiResponse.data, null, 2));

  await browser.close();
})();
