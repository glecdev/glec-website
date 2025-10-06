import { test, expect } from '@playwright/test';

/**
 * AUTOMATED VERCEL ENVIRONMENT VARIABLES SETUP
 *
 * This script automates the process of adding environment variables
 * to Vercel through the web dashboard.
 *
 * Prerequisites:
 * 1. You must be logged into Vercel in your browser
 * 2. Run this with: npx playwright test tests/automation/set-vercel-env-automated.spec.ts --headed
 */

const VERCEL_ENV_URL = 'https://vercel.com/team_FyXieuFmjuvvBKq0uolrVZhg/glec-website/settings/environment-variables';

const ENV_VARS = [
  {
    name: 'DATABASE_URL',
    value: 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'DIRECT_URL',
    value: 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'JWT_SECRET',
    value: 'qzs1M2W/J+FALLBWRWITPkNstWi9W1rr5nvlo2Uax2w=',
    environments: ['production', 'preview']
  },
  {
    name: 'NEXTAUTH_SECRET',
    value: 't6SzA1D1Sn8r3ACMKR7jgFX73JjxsfdQXpeTNVPBWPE=',
    environments: ['production', 'preview']
  },
  {
    name: 'NEXTAUTH_URL',
    value: 'https://glec-website.vercel.app',
    environments: ['production']
  }
];

test.describe('Vercel Environment Variables Automation', () => {
  test.use({
    // Use existing browser session to stay logged in
    storageState: undefined,
  });

  test('Set all environment variables in Vercel', async ({ page }) => {
    console.log('\n🚀 ========================================');
    console.log('   Vercel Environment Variables Setup');
    console.log('========================================\n');

    // Navigate to Vercel environment variables page
    console.log('📍 Navigating to Vercel dashboard...');
    await page.goto(VERCEL_ENV_URL, { timeout: 60000 });

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if logged in
    const loginRequired = await page.locator('text=/sign in|log in/i').isVisible().catch(() => false);

    if (loginRequired) {
      console.log('\n⚠️  You need to log in to Vercel first!');
      console.log('   Please log in manually, then run this script again.');
      console.log('   Waiting 30 seconds for you to log in...\n');

      await page.waitForTimeout(30000);
    }

    // Try to find the "Add New" button
    console.log('🔍 Looking for "Add New" button...');

    for (const envVar of ENV_VARS) {
      console.log(`\n📦 Setting ${envVar.name}...`);

      try {
        // Click "Add New" button
        const addButton = page.locator('button:has-text("Add"), button:has-text("Add New")').first();
        await addButton.click({ timeout: 5000 });

        console.log('   ✅ Clicked "Add New" button');

        // Wait for modal/form to appear
        await page.waitForTimeout(1000);

        // Fill in the name
        const nameInput = page.locator('input[name="name"], input[placeholder*="NAME"], input[type="text"]').first();
        await nameInput.fill(envVar.name);
        console.log(`   ✅ Filled name: ${envVar.name}`);

        // Fill in the value
        const valueInput = page.locator('input[name="value"], textarea[name="value"], input[placeholder*="VALUE"]').first();
        await valueInput.fill(envVar.value);
        console.log(`   ✅ Filled value`);

        // Select environments
        for (const env of envVar.environments) {
          const checkbox = page.locator(`input[type="checkbox"][value="${env}"], label:has-text("${env}") input[type="checkbox"]`).first();
          await checkbox.check().catch(() => {
            console.log(`   ⚠️  Could not check ${env} checkbox automatically`);
          });
        }
        console.log(`   ✅ Selected environments: ${envVar.environments.join(', ')}`);

        // Click Save button
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Add")').last();
        await saveButton.click();
        console.log(`   ✅ Clicked Save button`);

        // Wait for save to complete
        await page.waitForTimeout(2000);

        console.log(`   ✅ ${envVar.name} added successfully!`);

      } catch (error) {
        console.log(`   ❌ Failed to add ${envVar.name}`);
        console.log(`   Error: ${error.message}`);
        console.log(`   💡 You may need to add this one manually`);
      }
    }

    console.log('\n========================================');
    console.log('   Environment Variables Setup Complete!');
    console.log('========================================\n');

    console.log('🔄 Next Steps:');
    console.log('1. Go to Deployments tab');
    console.log('2. Click "..." on the latest deployment');
    console.log('3. Click "Redeploy"');
    console.log('4. Wait 5 minutes');
    console.log('5. Test: https://glec-website.vercel.app/admin/login\n');

    // Take screenshot
    await page.screenshot({ path: 'test-results/vercel-env-setup-complete.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/vercel-env-setup-complete.png\n');
  });
});
