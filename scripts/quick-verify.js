const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('=== Logging in...');
  await page.goto('https://glec-website.vercel.app/admin/login');
  await page.fill('input[type="email"]', 'admin@glec.io');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(dashboard|demo-requests)/, { timeout: 15000 });

  console.log('=== Testing Notices API...');
  await page.goto('https://glec-website.vercel.app/admin/notices');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  const noticesText = await page.textContent('body');
  const noticesError = noticesText.includes('An unexpected error occurred');
  console.log('Notices page has error:', noticesError);

  console.log('=== Testing Events API...');
  const eventsErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      eventsErrors.push(msg.text());
    }
  });
  await page.goto('https://glec-website.vercel.app/admin/events');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  const eventsText = await page.textContent('body');
  const eventsError = eventsText.includes('An unexpected error occurred');
  console.log('Events page has error:', eventsError);
  if (eventsErrors.length > 0) {
    console.log('Events console errors:', eventsErrors.slice(0, 2));
  }
  await page.screenshot({ path: 'test-results/events-detail.png', fullPage: true });

  console.log('=== Testing Press API...');
  await page.goto('https://glec-website.vercel.app/admin/press');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  const pressText = await page.textContent('body');
  const pressError = pressText.includes('An unexpected error occurred');
  console.log('Press page has error:', pressError);

  await browser.close();

  console.log('\n=== FINAL RESULTS ===');
  console.log('Notices:', noticesError ? '❌ FAILED' : '✅ PASSED');
  console.log('Events:', eventsError ? '❌ FAILED' : '✅ PASSED');
  console.log('Press:', pressError ? '❌ FAILED' : '✅ PASSED');

  const allPassed = !noticesError && !eventsError && !pressError;
  console.log('\n' + (allPassed ? '🎉 All pages working!' : '⚠️ Some pages still have errors'));
  process.exit(allPassed ? 0 : 1);
})();
