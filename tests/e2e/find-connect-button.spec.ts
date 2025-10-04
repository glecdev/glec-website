import { test, expect } from '@playwright/test';

test.describe('Cloudflare Dashboard - Find Connect to Git Button', () => {
  test('Navigate and find Connect to Git button', async ({ page }) => {
    console.log('🔍 Step 1: Navigate to Cloudflare Dashboard');

    // Step 1: Go to Cloudflare Dashboard
    await page.goto('https://dash.cloudflare.com/');
    await page.waitForLoadState('networkidle');

    console.log('📸 Current URL:', page.url());
    console.log('📄 Page Title:', await page.title());

    // Take screenshot of initial page
    await page.screenshot({ path: 'cloudflare-step1-initial.png', fullPage: true });

    // Step 2: Check if login is required
    const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);

    if (isLoginPage) {
      console.log('🔐 Login page detected - manual login required');
      console.log('Please login with: contact@glec.io');

      // Wait for manual login (2 minutes)
      console.log('⏰ Waiting 120 seconds for manual login...');
      await page.waitForTimeout(120000);

      await page.screenshot({ path: 'cloudflare-step2-after-login.png', fullPage: true });
    }

    console.log('🔍 Step 3: Looking for Workers & Pages section');

    // Step 3: Find and click Workers & Pages
    const workersAndPagesSelectors = [
      'text=Workers & Pages',
      'a:has-text("Workers & Pages")',
      '[href*="workers-and-pages"]',
      '[href*="workers"]',
      'nav a:has-text("Workers")',
    ];

    let found = false;
    for (const selector of workersAndPagesSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ Found "Workers & Pages" using selector: ${selector}`);
          await element.click();
          found = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Not found with selector: ${selector}`);
      }
    }

    if (!found) {
      console.log('⚠️ Workers & Pages not found, listing all visible links:');
      const links = await page.locator('a').all();
      for (let i = 0; i < Math.min(links.length, 20); i++) {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        console.log(`  - Link ${i}: "${text}" → ${href}`);
      }

      await page.screenshot({ path: 'cloudflare-step3-workers-not-found.png', fullPage: true });
    } else {
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'cloudflare-step3-workers-page.png', fullPage: true });
    }

    console.log('🔍 Step 4: Looking for glec-website project');

    // Step 4: Find glec-website project
    const projectSelectors = [
      'text=glec-website',
      'a:has-text("glec-website")',
      '[href*="glec-website"]',
    ];

    found = false;
    for (const selector of projectSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ Found "glec-website" using selector: ${selector}`);
          await element.click();
          found = true;
          break;
        }
      } catch (e) {
        console.log(`❌ Not found with selector: ${selector}`);
      }
    }

    if (!found) {
      console.log('⚠️ glec-website project not found, listing all visible text:');
      const allText = await page.locator('body').textContent();
      console.log('Page content preview:', allText?.slice(0, 500));

      await page.screenshot({ path: 'cloudflare-step4-project-not-found.png', fullPage: true });
    } else {
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'cloudflare-step4-project-page.png', fullPage: true });
    }

    console.log('🔍 Step 5: Looking for Settings or Connect to Git');

    // Step 5: Look for Settings tab or Connect to Git button
    const settingsSelectors = [
      'text=Settings',
      'a:has-text("Settings")',
      'button:has-text("Settings")',
      '[role="tab"]:has-text("Settings")',
    ];

    for (const selector of settingsSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ Found "Settings" using selector: ${selector}`);
          await element.click();
          await page.waitForLoadState('networkidle');
          break;
        }
      } catch (e) {
        console.log(`❌ Settings not found with selector: ${selector}`);
      }
    }

    await page.screenshot({ path: 'cloudflare-step5-settings-page.png', fullPage: true });

    console.log('🔍 Step 6: Looking for Connect to Git button');

    // Step 6: Find Connect to Git button
    const connectButtonSelectors = [
      'text=Connect to Git',
      'button:has-text("Connect to Git")',
      'a:has-text("Connect to Git")',
      'text=Connect Git',
      'button:has-text("Connect Git")',
      'text=GitHub',
      'button:has-text("GitHub")',
      'text=Git integration',
      'text=Source',
      '[href*="git"]',
      '[href*="github"]',
    ];

    let connectButton = null;
    for (const selector of connectButtonSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 })) {
          console.log(`✅ FOUND "Connect to Git" button using selector: ${selector}`);
          connectButton = element;

          // Get button details
          const text = await element.textContent();
          const tag = await element.evaluate(el => el.tagName);
          const classes = await element.getAttribute('class');

          console.log('📍 Button Details:');
          console.log(`  - Text: "${text}"`);
          console.log(`  - Tag: ${tag}`);
          console.log(`  - Classes: ${classes}`);

          // Highlight the button
          await element.evaluate(el => {
            (el as HTMLElement).style.border = '5px solid red';
            (el as HTMLElement).style.backgroundColor = 'yellow';
          });

          await page.screenshot({ path: 'cloudflare-step6-button-found.png', fullPage: true });

          break;
        }
      } catch (e) {
        console.log(`❌ Not found with selector: ${selector}`);
      }
    }

    if (!connectButton) {
      console.log('⚠️ Connect to Git button not found!');
      console.log('📸 Taking full page screenshot for analysis...');

      // Get all buttons on the page
      const buttons = await page.locator('button, a[role="button"]').all();
      console.log(`Found ${buttons.length} buttons/links on the page:`);

      for (let i = 0; i < Math.min(buttons.length, 30); i++) {
        const text = await buttons[i].textContent();
        const tag = await buttons[i].evaluate(el => el.tagName);
        console.log(`  ${i + 1}. [${tag}] "${text?.trim()}"`);
      }

      await page.screenshot({ path: 'cloudflare-step6-button-not-found-full.png', fullPage: true });

      // Get page HTML for debugging
      const html = await page.content();
      await page.evaluate(() => {
        const fs = require('fs');
        fs.writeFileSync('cloudflare-page-source.html', document.documentElement.outerHTML);
      }).catch(() => {
        // If evaluate fails, just continue
        console.log('Could not save page source');
      });
    }

    console.log('🎉 Analysis complete! Check screenshots:');
    console.log('  - cloudflare-step1-initial.png');
    console.log('  - cloudflare-step2-after-login.png (if login was needed)');
    console.log('  - cloudflare-step3-workers-page.png');
    console.log('  - cloudflare-step4-project-page.png');
    console.log('  - cloudflare-step5-settings-page.png');
    console.log('  - cloudflare-step6-button-found.png (or -not-found-full.png)');

    // Keep browser open for manual inspection
    console.log('⏰ Keeping browser open for 60 seconds for manual inspection...');
    await page.waitForTimeout(60000);
  });
});
