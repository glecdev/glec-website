/**
 * Neon Database Setup - Automated with Playwright
 *
 * Purpose: Create Neon account and extract connection string
 * Email: contact@glec.io
 * Project: glec-production
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Neon Database Setup', () => {
  test.setTimeout(300000); // 5 minutes

  test('Create Neon account and database', async ({ page }) => {
    console.log('\n🚀 Starting Neon Database Auto Setup...\n');

    const credentials = {
      email: 'contact@glec.io',
      password: 'GLEC2025Neon!@#$',
      projectName: 'glec-production',
      connectionString: '',
      directUrl: ''
    };

    // Step 1: Navigate to Neon signup
    console.log('📍 Step 1: Navigating to Neon signup...');
    await page.goto('https://console.neon.tech/signup');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/neon-01-signup-page.png', fullPage: true });
    console.log('   📸 Screenshot saved: neon-01-signup-page.png');

    // Step 2: Check signup options
    console.log('📝 Step 2: Filling signup form...');

    //Try clicking "Sign up with Email" button
    const emailButton = page.locator('button:has-text("Email"), a:has-text("Email"), text="Sign up with Email"').first();
    if (await emailButton.count() > 0) {
      await emailButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Clicked "Sign up with Email"');
    }

    // Fill email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(credentials.email);
    console.log(`   ✅ Email filled: ${credentials.email}`);

    // Fill password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(credentials.password);
    console.log(`   ✅ Password filled`);

    await page.screenshot({ path: 'test-results/neon-02-form-filled.png', fullPage: true });

    // Accept terms if checkbox exists
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
      console.log('   ✅ Terms accepted');
    }

    // Click signup/continue button
    const signupButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Continue"), button:has-text("Create account")').first();
    await signupButton.click();
    console.log('   ✅ Signup submitted');

    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test-results/neon-03-after-signup.png', fullPage: true });

    // Step 3: Handle email verification
    console.log('📧 Step 3: Checking for email verification...');
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('verify') || await page.locator('text=/verify|verification|check.*email/i').count() > 0) {
      console.log('   ⏳ Email verification required');
      console.log('   💡 Please check contact@glec.io and click verification link');
      console.log('   ⏳ Waiting 120 seconds...');

      // Wait for verification or manual intervention
      await page.waitForTimeout(120000);

      // Try navigating to console
      await page.goto('https://console.neon.tech');
      await page.waitForTimeout(3000);
    }

    // Step 4: Create project or check if exists
    console.log('🏗️  Step 4: Creating project...');
    await page.screenshot({ path: 'test-results/neon-04-console.png', fullPage: true });

    // Check if already on project creation or dashboard
    const createButton = page.locator('button:has-text("Create a project"), button:has-text("Create project"), button:has-text("New project")').first();

    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Clicked "Create project"');
    }

    // Fill project name if input exists
    const projectNameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await projectNameInput.count() > 0 && await projectNameInput.isVisible()) {
      await projectNameInput.clear();
      await projectNameInput.fill(credentials.projectName);
      console.log(`   ✅ Project name: ${credentials.projectName}`);
    }

    // Select Tokyo region
    const regionButton = page.locator('button:has-text("Region"), select, div:has-text("Region")').first();
    if (await regionButton.count() > 0) {
      await regionButton.click();
      await page.waitForTimeout(500);

      const tokyoOption = page.locator('text=/Tokyo|ap-northeast-1/i').first();
      if (await tokyoOption.count() > 0) {
        await tokyoOption.click();
        console.log('   ✅ Region: Tokyo (ap-northeast-1)');
      }
    }

    await page.screenshot({ path: 'test-results/neon-05-project-form.png', fullPage: true });

    // Submit project creation
    const createProjectButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    if (await createProjectButton.count() > 0) {
      await createProjectButton.click();
      console.log('   ✅ Project creation submitted');
      await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: 'test-results/neon-06-project-created.png', fullPage: true });

    // Step 5: Extract connection string
    console.log('🔌 Step 5: Extracting connection string...');
    await page.waitForTimeout(3000);

    // Look for connection string in various places
    const possibleSelectors = [
      'code:has-text("postgresql://")',
      'pre:has-text("postgresql://")',
      'input[readonly][value*="postgresql://"]',
      'textarea[readonly]:has-text("postgresql://")',
      '[data-testid*="connection"]',
      'button:has-text("Copy")'
    ];

    // Try to find and click "Connection details" or similar
    const connectionButton = page.locator('button:has-text("Connection"), a:has-text("Connection"), text="Connection details"').first();
    if (await connectionButton.count() > 0) {
      await connectionButton.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Opened connection details');
    }

    await page.screenshot({ path: 'test-results/neon-07-connection-details.png', fullPage: true });

    // Try to select "Pooled connection"
    const pooledButton = page.locator('button:has-text("Pooled"), text="Pooled connection"').first();
    if (await pooledButton.count() > 0) {
      await pooledButton.click();
      await page.waitForTimeout(500);
      console.log('   ✅ Selected "Pooled connection"');
    }

    // Extract connection string from page
    for (const selector of possibleSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();

      for (let i = 0; i < count; i++) {
        const text = await elements.nth(i).textContent();
        if (text && text.includes('postgresql://') && text.includes('neon.tech')) {
          credentials.connectionString = text.trim();
          console.log('   ✅ Pooled connection string found!');
          console.log(`   ${credentials.connectionString.substring(0, 60)}...`);
          break;
        }
      }

      if (credentials.connectionString) break;
    }

    // Get direct URL
    const directButton = page.locator('button:has-text("Direct"), text="Direct connection"').first();
    if (await directButton.count() > 0) {
      await directButton.click();
      await page.waitForTimeout(500);

      for (const selector of possibleSelectors) {
        const elements = page.locator(selector);
        const count = await elements.count();

        for (let i = 0; i < count; i++) {
          const text = await elements.nth(i).textContent();
          if (text && text.includes('postgresql://') && text.includes('neon.tech')) {
            credentials.directUrl = text.trim();
            console.log('   ✅ Direct connection string found!');
            break;
          }
        }

        if (credentials.directUrl) break;
      }
    }

    // Save credentials to file
    const credentialsPath = path.join(process.cwd(), '.neon-credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    console.log(`\n✅ Credentials saved to: ${credentialsPath}`);

    // Final screenshot
    await page.screenshot({ path: 'test-results/neon-08-final.png', fullPage: true });

    // Assertions
    expect(credentials.connectionString).toContain('postgresql://');
    expect(credentials.connectionString).toContain('neon.tech');

    console.log('\n🎉 Neon database setup complete!');
    console.log('\n📋 Next steps:');
    console.log(`   1. Connection string: ${credentials.connectionString.substring(0, 60)}...`);
    console.log(`   2. Run: .\\scripts\\complete-deployment.ps1 -DatabaseUrl "${credentials.connectionString}"`);

    // Keep browser open for verification
    await page.waitForTimeout(10000);
  });
});
