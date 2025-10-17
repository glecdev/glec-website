const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CREDENTIALS = {
  email: 'contact@glec.io',
  password: 'Contactglec0915@',
  verificationCode: process.env.VERIFICATION_CODE || '361020', // Can be passed via env var
};

const ENV_VARS = [
  {
    name: 'RESEND_WEBHOOK_SECRET',
    value: 'Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=',
  },
  {
    name: 'CRON_SECRET',
    value: 'OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=',
  },
  {
    name: 'ADMIN_NOTIFICATION_EMAIL',
    value: 'oillex.co.kr@gmail.com',
  },
];

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function updateVercelEnv() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const report = {
    loginSuccess: false,
    deletedVariables: [],
    addedVariables: [],
    screenshots: [],
    redeploymentTriggered: false,
    errors: [],
  };

  try {
    console.log('📍 Step 1: Navigating to Vercel login...');
    await page.goto('https://vercel.com/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-page.png'), fullPage: true });
    report.screenshots.push('01-login-page.png');

    console.log('🔐 Step 2: Entering credentials...');
    // Wait for email input
    await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
    await page.fill('input[name="email"], input[type="email"]', CREDENTIALS.email);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-email-entered.png'), fullPage: true });
    report.screenshots.push('02-email-entered.png');

    // Click continue to proceed to password or verification
    const continueButton = page.locator('button:has-text("Continue")').first();
    await continueButton.click();
    await page.waitForTimeout(3000);

    // Check if verification code page appears
    const verificationHeading = page.locator('h1:has-text("Verification"), h2:has-text("Verification")');
    if (await verificationHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('📧 Step 3: Verification code required!');
      console.log(`⚡ Auto-filling verification code: ${CREDENTIALS.verificationCode}`);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-verification-page.png'), fullPage: true });
      report.screenshots.push('03-verification-page.png');

      // Find and fill verification code inputs
      const codeInputs = page.locator('input[type="text"][inputmode="numeric"], input[type="tel"], input[maxlength="1"]');
      const inputCount = await codeInputs.count();

      if (inputCount > 0) {
        // Fill individual digit inputs
        const digits = CREDENTIALS.verificationCode.toString().split('');
        for (let i = 0; i < Math.min(digits.length, inputCount); i++) {
          await codeInputs.nth(i).fill(digits[i]);
          await page.waitForTimeout(100);
        }
      } else {
        // Try single input field
        const singleInput = page.locator('input[name*="code"], input[placeholder*="code"]').first();
        if (await singleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await singleInput.fill(CREDENTIALS.verificationCode.toString());
        }
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-code-entered.png'), fullPage: true });
      report.screenshots.push('03-code-entered.png');

      // Look for and click verify/continue button
      const verifyButton = page.locator('button:has-text("Verify"), button:has-text("Continue"), button:has-text("Submit")').first();
      if (await verifyButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await verifyButton.click();
      }

      // Wait for navigation away from verification page (indicating successful login)
      try {
        await page.waitForURL(url => !url.includes('/login') && !url.includes('/verify'), { timeout: 30000 });
        console.log('✅ Verification completed successfully!');
      } catch (error) {
        throw new Error('Verification failed - check if code is correct');
      }
    } else {
      // Enter password if password field appears
      const passwordField = page.locator('input[name="password"], input[type="password"]').first();
      if (await passwordField.isVisible({ timeout: 5000 }).catch(() => false)) {
        await passwordField.fill(CREDENTIALS.password);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-password-entered.png'), fullPage: true });
        report.screenshots.push('03-password-entered.png');

        // Click sign in button
        const signInButton = page.locator('button:has-text("Continue"), button:has-text("Sign in")').first();
        await signInButton.click();
      }
    }

    console.log('⏳ Step 4: Waiting for dashboard...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Check if we're on the dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('vercel.com') && !currentUrl.includes('login')) {
      report.loginSuccess = true;
      console.log('✅ Login successful!');
    } else {
      throw new Error(`Login may have failed. Current URL: ${currentUrl}`);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-dashboard.png'), fullPage: true });
    report.screenshots.push('04-dashboard.png');

    console.log('📍 Step 5: Navigating to project settings...');
    await page.goto('https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-env-vars-page.png'), fullPage: true });
    report.screenshots.push('05-env-vars-page.png');

    console.log('🗑️ Step 6: Deleting existing variables...');
    for (const envVar of ENV_VARS) {
      try {
        // Look for the variable row
        const varRow = page.locator(`tr:has-text("${envVar.name}")`).first();

        if (await varRow.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log(`   Deleting ${envVar.name}...`);

          // Find and click the more options button (three dots)
          const moreButton = varRow.locator('button[aria-label="More"], button:has-text("...")').first();
          await moreButton.click();
          await page.waitForTimeout(500);

          // Click delete option
          const deleteButton = page.locator('button:has-text("Delete"), [role="menuitem"]:has-text("Delete")').first();
          await deleteButton.click();
          await page.waitForTimeout(500);

          // Confirm deletion if confirmation dialog appears
          const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")').first();
          if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
          }

          report.deletedVariables.push(envVar.name);
          console.log(`   ✅ Deleted ${envVar.name}`);
        } else {
          console.log(`   ℹ️ ${envVar.name} not found (may not exist)`);
        }
      } catch (error) {
        console.log(`   ⚠️ Could not delete ${envVar.name}: ${error.message}`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-after-deletion.png'), fullPage: true });
    report.screenshots.push('06-after-deletion.png');

    console.log('➕ Step 7: Adding new variables...');
    for (const envVar of ENV_VARS) {
      try {
        console.log(`   Adding ${envVar.name}...`);

        // Click "Add New" button
        const addButton = page.locator('button:has-text("Add New")').first();
        await addButton.click();
        await page.waitForTimeout(1000);

        // Fill in the name
        const nameInput = page.locator('input[name="key"], input[placeholder*="NAME"]').first();
        await nameInput.fill(envVar.name);

        // Fill in the value (use Ctrl+A, Ctrl+V to ensure no trailing characters)
        const valueInput = page.locator('textarea[name="value"], textarea[placeholder*="VALUE"]').first();
        await valueInput.click();
        await valueInput.press('Control+A');
        await valueInput.fill(envVar.value);

        // Select Production environment
        const productionCheckbox = page.locator('input[type="checkbox"][value="production"], label:has-text("Production") input[type="checkbox"]').first();
        if (!await productionCheckbox.isChecked()) {
          await productionCheckbox.check();
        }

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `07-${envVar.name}-filled.png`), fullPage: true });
        report.screenshots.push(`07-${envVar.name}-filled.png`);

        // Click Save
        const saveButton = page.locator('button:has-text("Save")').first();
        await saveButton.click();
        await page.waitForTimeout(2000);

        report.addedVariables.push(envVar.name);
        console.log(`   ✅ Added ${envVar.name}`);
      } catch (error) {
        const errorMsg = `Failed to add ${envVar.name}: ${error.message}`;
        console.log(`   ❌ ${errorMsg}`);
        report.errors.push(errorMsg);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `error-${envVar.name}.png`), fullPage: true });
        report.screenshots.push(`error-${envVar.name}.png`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-all-vars-added.png'), fullPage: true });
    report.screenshots.push('08-all-vars-added.png');

    console.log('🔄 Step 8: Triggering redeployment...');
    await page.goto('https://vercel.com/glecdevs-projects/glec-website', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    // Click on Deployments tab
    const deploymentsTab = page.locator('a:has-text("Deployments"), button:has-text("Deployments")').first();
    await deploymentsTab.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-deployments-page.png'), fullPage: true });
    report.screenshots.push('09-deployments-page.png');

    // Find the latest deployment and click the more options button
    const latestDeployment = page.locator('tr, div[data-testid="deployment-row"]').first();
    const deploymentMoreButton = latestDeployment.locator('button[aria-label="More"], button:has-text("...")').first();
    await deploymentMoreButton.click();
    await page.waitForTimeout(500);

    // Click Redeploy
    const redeployButton = page.locator('button:has-text("Redeploy"), [role="menuitem"]:has-text("Redeploy")').first();
    await redeployButton.click();
    await page.waitForTimeout(1000);

    // Confirm redeployment if dialog appears
    const confirmRedeployButton = page.locator('button:has-text("Redeploy"), button:has-text("Confirm")').first();
    if (await confirmRedeployButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmRedeployButton.click();
      await page.waitForTimeout(2000);
      report.redeploymentTriggered = true;
      console.log('✅ Redeployment triggered!');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-redeployment-triggered.png'), fullPage: true });
    report.screenshots.push('10-redeployment-triggered.png');

  } catch (error) {
    console.error('❌ Error:', error.message);
    report.errors.push(error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-final.png'), fullPage: true });
    report.screenshots.push('error-final.png');
  } finally {
    await browser.close();
  }

  return report;
}

// Run the automation
(async () => {
  console.log('🚀 Starting Vercel environment variables update automation...\n');

  const report = await updateVercelEnv();

  console.log('\n' + '='.repeat(60));
  console.log('📊 AUTOMATION REPORT');
  console.log('='.repeat(60));
  console.log(`✅ Login Success: ${report.loginSuccess}`);
  console.log(`🗑️ Deleted Variables: ${report.deletedVariables.join(', ') || 'None'}`);
  console.log(`➕ Added Variables: ${report.addedVariables.join(', ') || 'None'}`);
  console.log(`🔄 Redeployment Triggered: ${report.redeploymentTriggered}`);
  console.log(`📸 Screenshots: ${report.screenshots.length} saved in ${SCREENSHOTS_DIR}`);

  if (report.errors.length > 0) {
    console.log(`❌ Errors: ${report.errors.length}`);
    report.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err}`);
    });
  }

  console.log('='.repeat(60));

  // Save report to JSON
  const reportPath = path.join(SCREENSHOTS_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 Full report saved to: ${reportPath}`);

  process.exit(report.errors.length > 0 ? 1 : 0);
})();
