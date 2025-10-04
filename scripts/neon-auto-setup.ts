/**
 * Neon Database Auto Setup Script
 *
 * Purpose: Automatically create Neon account and database using Playwright
 * Email: contact@glec.io
 * Project: glec-production
 * Region: AWS ap-northeast-1 (Tokyo)
 */

import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface NeonCredentials {
  email: string;
  password: string;
  projectName: string;
  region: string;
  connectionString: string;
  directUrl: string;
}

async function setupNeonDatabase(): Promise<NeonCredentials> {
  console.log('🚀 Starting Neon Database Auto Setup...\n');

  const browser: Browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down actions for visibility
  });

  const context = await browser.newContext();
  const page: Page = await context.newPage();

  const credentials: NeonCredentials = {
    email: 'contact@glec.io',
    password: generateSecurePassword(),
    projectName: 'glec-production',
    region: 'aws-ap-northeast-1',
    connectionString: '',
    directUrl: ''
  };

  try {
    // Step 1: Navigate to Neon signup
    console.log('📍 Step 1: Navigating to Neon signup page...');
    await page.goto('https://console.neon.tech/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if we should use GitHub signup or email signup
    const githubButton = page.locator('button:has-text("Continue with GitHub")');
    const emailOption = page.locator('text=Email');

    if (await githubButton.count() > 0) {
      console.log('✅ Found GitHub signup option');
      console.log('⚠️  Note: GitHub signup requires manual authorization');
      console.log('💡 Switching to email signup...');

      // Click "Sign up with Email" if available
      const emailSignupButton = page.locator('button:has-text("Email"), a:has-text("Email")');
      if (await emailSignupButton.count() > 0) {
        await emailSignupButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Step 2: Fill signup form
    console.log('📝 Step 2: Filling signup form...');

    // Wait for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(credentials.email);
    console.log(`   Email: ${credentials.email}`);

    // Fill password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(credentials.password);
    console.log(`   Password: ${credentials.password}`);

    // Save credentials to file
    const credentialsPath = path.join(__dirname, '../.neon-credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    console.log(`   ✅ Credentials saved to: ${credentialsPath}`);

    // Click signup button
    const signupButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Continue")').first();
    await signupButton.click();
    console.log('   ✅ Signup form submitted');

    // Step 3: Wait for email verification or redirect
    console.log('📧 Step 3: Waiting for email verification...');
    console.log('   ⚠️  Please check contact@glec.io inbox and verify email');
    console.log('   ⏳ Waiting 60 seconds for verification...');

    // Wait for either:
    // 1. Redirect to dashboard (email verified)
    // 2. Email verification message
    await page.waitForTimeout(60000); // 60 seconds

    // Check if we're on dashboard
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('console.neon.tech') && !currentUrl.includes('signup')) {
      console.log('   ✅ Email verified! Redirected to console');
    } else {
      console.log('   ⏳ Still waiting for email verification');
      console.log('   💡 Please verify email manually and press Enter to continue...');

      // Wait for manual verification
      await new Promise((resolve) => {
        process.stdin.once('data', () => resolve(null));
      });

      // Navigate to console after verification
      await page.goto('https://console.neon.tech', { waitUntil: 'networkidle' });
    }

    // Step 4: Create project
    console.log('🏗️  Step 4: Creating project...');

    // Look for "Create a project" button
    const createProjectButton = page.locator('button:has-text("Create a project"), button:has-text("Create project"), a:has-text("Create project")').first();

    if (await createProjectButton.count() > 0) {
      await createProjectButton.click();
      await page.waitForTimeout(2000);
      console.log('   ✅ Clicked "Create a project"');
    } else {
      console.log('   ⚠️  "Create project" button not found, may already be on project creation page');
    }

    // Fill project name
    const projectNameInput = page.locator('input[name="name"], input[placeholder*="project"], input[label*="Project name"]').first();
    if (await projectNameInput.count() > 0) {
      await projectNameInput.clear();
      await projectNameInput.fill(credentials.projectName);
      console.log(`   Project name: ${credentials.projectName}`);
    }

    // Select region (AWS ap-northeast-1 Tokyo)
    const regionSelect = page.locator('select:has-text("Region"), button:has-text("Region")').first();
    if (await regionSelect.count() > 0) {
      await regionSelect.click();
      await page.waitForTimeout(500);

      // Look for Tokyo region
      const tokyoOption = page.locator('text=/Tokyo|ap-northeast-1/i').first();
      if (await tokyoOption.count() > 0) {
        await tokyoOption.click();
        console.log(`   Region: AWS ap-northeast-1 (Tokyo)`);
      }
    }

    // Click "Create project"
    const createButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await createButton.click();
    console.log('   ✅ Project creation submitted');

    // Wait for project to be created
    await page.waitForTimeout(5000);

    // Step 5: Get connection string
    console.log('🔌 Step 5: Extracting connection string...');

    // Wait for connection details to load
    await page.waitForTimeout(3000);

    // Look for "Connection Details" or "Connect" button
    const connectionButton = page.locator('button:has-text("Connection"), button:has-text("Connect"), a:has-text("Connection")').first();
    if (await connectionButton.count() > 0) {
      await connectionButton.click();
      await page.waitForTimeout(1000);
    }

    // Look for "Pooled connection" option
    const pooledOption = page.locator('text="Pooled connection", button:has-text("Pooled")').first();
    if (await pooledOption.count() > 0) {
      await pooledOption.click();
      await page.waitForTimeout(500);
      console.log('   ✅ Selected "Pooled connection"');
    }

    // Extract connection string from input or code block
    const connectionStringSelector = 'input[readonly], code, pre, textarea[readonly]';
    const connectionElements = page.locator(connectionStringSelector);

    for (let i = 0; i < await connectionElements.count(); i++) {
      const text = await connectionElements.nth(i).textContent();
      if (text && text.includes('postgresql://') && text.includes('neon.tech')) {
        credentials.connectionString = text.trim();
        console.log(`   ✅ Connection string extracted`);
        console.log(`   ${credentials.connectionString.substring(0, 50)}...`);
        break;
      }
    }

    // Get direct URL (non-pooled)
    const directOption = page.locator('text="Direct connection", button:has-text("Direct")').first();
    if (await directOption.count() > 0) {
      await directOption.click();
      await page.waitForTimeout(500);

      for (let i = 0; i < await connectionElements.count(); i++) {
        const text = await connectionElements.nth(i).textContent();
        if (text && text.includes('postgresql://') && text.includes('neon.tech')) {
          credentials.directUrl = text.trim();
          console.log(`   ✅ Direct URL extracted`);
          break;
        }
      }
    }

    // Save final credentials
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    console.log('\n✅ Neon database setup complete!');
    console.log(`📄 Credentials saved to: ${credentialsPath}`);

    // Keep browser open for verification
    console.log('\n⏸️  Browser will stay open for 30 seconds for verification...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error during Neon setup:', error);
    throw error;
  } finally {
    await browser.close();
  }

  return credentials;
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Run if executed directly
if (require.main === module) {
  setupNeonDatabase()
    .then((credentials) => {
      console.log('\n🎉 Setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Run deployment script:');
      console.log(`   .\\scripts\\complete-deployment.ps1 -DatabaseUrl "${credentials.connectionString}"`);
      console.log('\n2. Verify admin features at:');
      console.log('   https://glec-website.vercel.app/admin/login');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    });
}

export { setupNeonDatabase };
export type { NeonCredentials };
