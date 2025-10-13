/**
 * Zoom API Setup - Playwright Automation
 *
 * Purpose: contact@glec.io 계정으로 Zoom Marketplace에 로그인하여
 *          Server-to-Server OAuth App을 생성하고 credentials를 캡처
 *
 * Usage: npx playwright test scripts/zoom-api-setup.ts --headed --project=chromium
 *
 * Manual Steps if automation fails:
 * 1. Go to https://marketplace.zoom.us/develop/create
 * 2. Login with contact@glec.io
 * 3. Click "Build App" → "Server-to-Server OAuth"
 * 4. Fill in app info and create
 * 5. Copy Account ID, Client ID, Client Secret
 */

import { chromium, Browser, Page } from 'playwright';

interface ZoomCredentials {
  accountId: string;
  clientId: string;
  clientSecret: string;
}

async function setupZoomAPI(): Promise<ZoomCredentials | null> {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 ZOOM API SETUP - PLAYWRIGHT AUTOMATION');
  console.log('='.repeat(70));

  let browser: Browser | null = null;

  try {
    // Step 1: Launch browser
    console.log('\n📋 Step 1: Launching Chromium browser...');
    browser = await chromium.launch({
      headless: false, // Show browser for manual intervention if needed
      slowMo: 1000, // Slow down for visibility
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    // Step 2: Navigate to Zoom Marketplace
    console.log('\n📋 Step 2: Navigating to Zoom Marketplace...');
    await page.goto('https://marketplace.zoom.us/develop/create', {
      waitUntil: 'networkidle',
    });

    console.log('✅ Page loaded:', page.url());

    // Check if already logged in
    const isLoggedIn = await page.locator('text=Build App').isVisible({ timeout: 5000 }).catch(() => false);

    if (!isLoggedIn) {
      // Step 3: Login
      console.log('\n📋 Step 3: Not logged in. Redirecting to login page...');

      // Wait for redirect to sign in page
      await page.waitForURL('**/signin**', { timeout: 10000 }).catch(() => {});

      console.log('🔑 Please login manually with contact@glec.io');
      console.log('   Email: contact@glec.io');
      console.log('   Password: [Enter your password]');
      console.log('\n⏳ Waiting for login... (will auto-detect when complete)');

      // Wait for redirect back to marketplace after login
      await page.waitForURL('**/marketplace.zoom.us/**', { timeout: 300000 }); // 5 minutes timeout
      console.log('✅ Login successful!');

      // Navigate back to create page
      await page.goto('https://marketplace.zoom.us/develop/create', {
        waitUntil: 'networkidle',
      });
    } else {
      console.log('✅ Already logged in!');
    }

    // Step 4: Check for existing apps
    console.log('\n📋 Step 4: Checking for existing Server-to-Server OAuth apps...');

    // Click "Manage" to see existing apps
    const manageLink = page.locator('a:has-text("Manage")').first();
    if (await manageLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await manageLink.click();
      await page.waitForLoadState('networkidle');

      console.log('📂 Checking existing apps...');

      // Look for "GLEC Meeting System" app
      const existingApp = page.locator('text=GLEC Meeting System').first();
      const appExists = await existingApp.isVisible({ timeout: 3000 }).catch(() => false);

      if (appExists) {
        console.log('✅ Found existing "GLEC Meeting System" app!');
        console.log('📝 Attempting to retrieve credentials...');

        // Click on the app
        await existingApp.click();
        await page.waitForLoadState('networkidle');

        // Try to extract credentials
        const credentials = await extractCredentials(page);
        if (credentials) {
          console.log('\n✅ Successfully retrieved credentials!');
          return credentials;
        }
      }

      // Navigate back to create page
      await page.goto('https://marketplace.zoom.us/develop/create', {
        waitUntil: 'networkidle',
      });
    }

    // Step 5: Create new Server-to-Server OAuth app
    console.log('\n📋 Step 5: Creating new Server-to-Server OAuth app...');

    // Look for "Server-to-Server OAuth" button
    const serverToServerButton = page.locator('button:has-text("Server-to-Server OAuth"), a:has-text("Server-to-Server OAuth")').first();

    if (await serverToServerButton.isVisible({ timeout: 5000 })) {
      console.log('🔘 Clicking "Server-to-Server OAuth" button...');
      await serverToServerButton.click();
      await page.waitForLoadState('networkidle');

      // Fill in app info
      console.log('📝 Filling in app information...');

      // App Name
      const appNameInput = page.locator('input[name="name"], input[placeholder*="app name"]').first();
      if (await appNameInput.isVisible({ timeout: 5000 })) {
        await appNameInput.fill('GLEC Meeting System');
        console.log('   ✅ App Name: GLEC Meeting System');
      }

      // Short Description (if required)
      const descInput = page.locator('textarea[name="shortDescription"], textarea[placeholder*="description"]').first();
      if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await descInput.fill('Automated meeting scheduling system for GLEC customers. Creates Zoom meetings automatically when customers book consultations.');
        console.log('   ✅ Description added');
      }

      // Company Name (if required)
      const companyInput = page.locator('input[name="companyName"], input[placeholder*="company"]').first();
      if (await companyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await companyInput.fill('GLEC');
        console.log('   ✅ Company Name: GLEC');
      }

      // Developer Name (if required)
      const devNameInput = page.locator('input[name="developerName"], input[placeholder*="developer"]').first();
      if (await devNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await devNameInput.fill('GLEC Development Team');
        console.log('   ✅ Developer Name added');
      }

      // Developer Email (if required)
      const devEmailInput = page.locator('input[name="developerEmail"], input[type="email"]').first();
      if (await devEmailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await devEmailInput.fill('contact@glec.io');
        console.log('   ✅ Developer Email: contact@glec.io');
      }

      // Click "Create" button
      const createButton = page.locator('button:has-text("Create"), button[type="submit"]').first();
      if (await createButton.isVisible({ timeout: 5000 })) {
        console.log('🚀 Clicking "Create" button...');
        await createButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Wait for creation to complete
      }

      // Extract credentials
      console.log('\n📋 Step 6: Extracting credentials...');
      const credentials = await extractCredentials(page);

      if (credentials) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ ZOOM API APP CREATED SUCCESSFULLY!');
        console.log('='.repeat(70));
        console.log('\n📋 Credentials:');
        console.log(`   Account ID:     ${credentials.accountId}`);
        console.log(`   Client ID:      ${credentials.clientId}`);
        console.log(`   Client Secret:  ${credentials.clientSecret}`);
        console.log('\n💾 Next steps:');
        console.log('   1. Add these credentials to .env.local:');
        console.log('');
        console.log('      ZOOM_ACCOUNT_ID="' + credentials.accountId + '"');
        console.log('      ZOOM_CLIENT_ID="' + credentials.clientId + '"');
        console.log('      ZOOM_CLIENT_SECRET="' + credentials.clientSecret + '"');
        console.log('');
        console.log('   2. Test the connection: npx tsx scripts/test-zoom-connection.ts');
        console.log('');

        // Keep browser open for manual verification
        console.log('⏸️  Browser will remain open for 30 seconds for verification...');
        await page.waitForTimeout(30000);

        return credentials;
      } else {
        console.error('\n❌ Failed to extract credentials automatically.');
        console.error('📝 Please manually copy credentials from the page.');
        console.error('⏸️  Browser will remain open...');

        // Keep browser open indefinitely for manual extraction
        await page.waitForTimeout(300000); // 5 minutes
        return null;
      }
    } else {
      console.error('❌ Could not find "Server-to-Server OAuth" button');
      console.error('📸 Taking screenshot: zoom-error.png');
      await page.screenshot({ path: 'zoom-error.png', fullPage: true });
      console.error('⏸️  Browser will remain open for manual intervention...');
      await page.waitForTimeout(300000); // 5 minutes
      return null;
    }
  } catch (error: any) {
    console.error('\n❌ Error during Zoom API setup:', error.message);
    console.error('\n💡 Please try manual setup:');
    console.error('   1. Go to https://marketplace.zoom.us/develop/create');
    console.error('   2. Login with contact@glec.io');
    console.error('   3. Create "Server-to-Server OAuth" app');
    console.error('   4. Copy credentials to .env.local');

    if (browser) {
      console.error('\n⏸️  Browser will remain open for manual setup...');
      await new Promise(resolve => setTimeout(resolve, 300000)); // 5 minutes
    }

    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract credentials from Zoom app page
 */
async function extractCredentials(page: Page): Promise<ZoomCredentials | null> {
  try {
    // Wait for credentials to be visible
    await page.waitForTimeout(2000);

    // Try different selectors for credentials
    let accountId = '';
    let clientId = '';
    let clientSecret = '';

    // Method 1: Look for labeled fields
    accountId = await page.locator('text=Account ID').locator('..').locator('code, input, span[class*="value"]').first().textContent().catch(() => '') || '';
    clientId = await page.locator('text=Client ID').locator('..').locator('code, input, span[class*="value"]').first().textContent().catch(() => '') || '';
    clientSecret = await page.locator('text=Client Secret').locator('..').locator('code, input, span[class*="value"]').first().textContent().catch(() => '') || '';

    // Method 2: Look for input fields
    if (!accountId) {
      accountId = await page.locator('input[name="accountId"], input[id*="account"]').first().inputValue().catch(() => '') || '';
    }
    if (!clientId) {
      clientId = await page.locator('input[name="clientId"], input[id*="client"][id*="id"]').first().inputValue().catch(() => '') || '';
    }
    if (!clientSecret) {
      clientSecret = await page.locator('input[name="clientSecret"], input[id*="secret"]').first().inputValue().catch(() => '') || '';
    }

    // Validate
    if (accountId && clientId && clientSecret) {
      return {
        accountId: accountId.trim(),
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim(),
      };
    }

    console.error('⚠️  Could not extract all credentials automatically');
    console.error(`   Account ID: ${accountId ? '✅' : '❌'}`);
    console.error(`   Client ID: ${clientId ? '✅' : '❌'}`);
    console.error(`   Client Secret: ${clientSecret ? '✅' : '❌'}`);

    return null;
  } catch (error: any) {
    console.error('❌ Error extracting credentials:', error.message);
    return null;
  }
}

// Run setup
console.log('\n🚀 Starting Zoom API setup automation...');
setupZoomAPI()
  .then((credentials) => {
    if (credentials) {
      console.log('\n✅ Setup complete!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Setup incomplete. Please complete manually.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
