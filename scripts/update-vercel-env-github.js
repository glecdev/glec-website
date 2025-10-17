const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

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

    console.log('🔐 Step 2: Clicking GitHub login button...');
    // Look for GitHub login button
    const githubButton = page.locator('button:has-text("GitHub"), a:has-text("Continue with GitHub")').first();
    await githubButton.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-github-login.png'), fullPage: true });
    report.screenshots.push('02-github-login.png');

    console.log('⏸️  GitHub login page opened.');
    console.log('⏸️  Please log in to GitHub manually in the browser.');
    console.log('⏸️  The script will wait for 3 minutes for you to complete GitHub authentication...');

    // Wait for navigation back to Vercel (indicating successful GitHub auth)
    try {
      await page.waitForURL(url => url.includes('vercel.com') && !url.includes('login'), { timeout: 180000 });
      report.loginSuccess = true;
      console.log('✅ GitHub authentication completed successfully!');
    } catch (error) {
      throw new Error('GitHub authentication timeout - not completed within 3 minutes');
    }

    console.log('⏳ Step 3: Waiting for dashboard...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-dashboard.png'), fullPage: true });
    report.screenshots.push('03-dashboard.png');

    console.log('📍 Step 4: Navigating to project settings...');
    await page.goto('https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-env-vars-page.png'), fullPage: true });
    report.screenshots.push('04-env-vars-page.png');

    console.log('🗑️  Step 5: Deleting existing variables...');
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
          console.log(`   ℹ️  ${envVar.name} not found (may not exist)`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not delete ${envVar.name}: ${error.message}`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-after-deletion.png'), fullPage: true });
    report.screenshots.push('05-after-deletion.png');

    console.log('➕ Step 6: Adding new variables...');
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

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `06-${envVar.name}-filled.png`), fullPage: true });
        report.screenshots.push(`06-${envVar.name}-filled.png`);

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

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-all-vars-added.png'), fullPage: true });
    report.screenshots.push('07-all-vars-added.png');

    console.log('🔄 Step 7: Triggering redeployment...');
    await page.goto('https://vercel.com/glecdevs-projects/glec-website', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.waitForTimeout(2000);

    // Click on Deployments tab
    const deploymentsTab = page.locator('a:has-text("Deployments"), button:has-text("Deployments")').first();
    await deploymentsTab.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-deployments-page.png'), fullPage: true });
    report.screenshots.push('08-deployments-page.png');

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

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-redeployment-triggered.png'), fullPage: true });
    report.screenshots.push('09-redeployment-triggered.png');

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
  console.log('🚀 Starting Vercel environment variables update automation (GitHub login)...\n');

  const report = await updateVercelEnv();

  console.log('\n' + '='.repeat(60));
  console.log('📊 AUTOMATION REPORT');
  console.log('='.repeat(60));
  console.log(`✅ Login Success: ${report.loginSuccess}`);
  console.log(`🗑️  Deleted Variables: ${report.deletedVariables.join(', ') || 'None'}`);
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
  const reportPath = path.join(SCREENSHOTS_DIR, 'report-github.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 Full report saved to: ${reportPath}`);

  process.exit(report.errors.length > 0 ? 1 : 0);
})();
