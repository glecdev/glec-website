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

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function waitForManualLogin(page) {
  console.log('\n' + '='.repeat(70));
  console.log('⏸️  브라우저가 열렸습니다. 로그인을 진행해주세요.');
  console.log('⏸️  로그인이 완료되면 자동으로 환경 변수 설정을 시작합니다.');
  console.log('⏸️  대기 시간: 무제한');
  console.log('='.repeat(70) + '\n');

  // 무한 대기: URL이 login/verify가 아닌 vercel.com으로 변경될 때까지
  let attempts = 0;
  while (true) {
    const currentUrl = page.url();

    // 로그인 완료 감지: login/verify 페이지가 아니고, vercel.com 도메인인 경우
    if (currentUrl.includes('vercel.com') &&
        !currentUrl.includes('/login') &&
        !currentUrl.includes('/verify')) {
      console.log('✅ 로그인 감지됨! 자동화를 시작합니다...\n');
      return true;
    }

    attempts++;
    if (attempts % 10 === 0) {
      console.log(`   대기 중... (${attempts * 2}초 경과)`);
    }

    await page.waitForTimeout(2000);
  }
}

async function updateVercelEnv() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null
  });

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
    console.log('🚀 Vercel 환경 변수 자동 설정 시작...\n');
    console.log('📍 Step 1: Vercel 로그인 페이지 열기...');

    await page.goto('https://vercel.com/login', { waitUntil: 'networkidle', timeout: 60000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-page.png'), fullPage: true });
    report.screenshots.push('01-login-page.png');

    // 사용자가 로그인할 때까지 무한 대기
    await waitForManualLogin(page);
    report.loginSuccess = true;

    console.log('⏳ Step 2: 대시보드 로딩 대기...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-dashboard.png'), fullPage: true });
    report.screenshots.push('02-dashboard.png');

    console.log('📍 Step 3: Environment Variables 페이지로 이동...');
    await page.goto('https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables', {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-env-vars-page.png'), fullPage: true });
    report.screenshots.push('03-env-vars-page.png');

    console.log('\n🗑️  Step 4: 기존 변수 삭제 중...');
    for (const envVar of ENV_VARS) {
      try {
        // 변수 행 찾기 - 여러 셀렉터 시도
        const selectors = [
          `tr:has-text("${envVar.name}")`,
          `div[data-testid*="env-var"]:has-text("${envVar.name}")`,
          `div:has-text("${envVar.name}"):has(button)`
        ];

        let varRow = null;
        for (const selector of selectors) {
          varRow = page.locator(selector).first();
          if (await varRow.isVisible({ timeout: 2000 }).catch(() => false)) {
            break;
          }
        }

        if (varRow && await varRow.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`   🔍 ${envVar.name} 찾음. 삭제 시도...`);

          // More 버튼 찾기
          const moreButtonSelectors = [
            'button[aria-label="More"]',
            'button:has-text("...")',
            'button[aria-haspopup="menu"]',
            'button svg[data-testid="geist-icon"]'
          ];

          let clicked = false;
          for (const selector of moreButtonSelectors) {
            const moreButton = varRow.locator(selector).first();
            if (await moreButton.isVisible({ timeout: 1000 }).catch(() => false)) {
              await moreButton.click();
              await page.waitForTimeout(1000);
              clicked = true;
              break;
            }
          }

          if (clicked) {
            // Delete 버튼 클릭
            const deleteSelectors = [
              'button:has-text("Delete")',
              '[role="menuitem"]:has-text("Delete")',
              'div:has-text("Delete")'
            ];

            for (const selector of deleteSelectors) {
              const deleteButton = page.locator(selector).first();
              if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await deleteButton.click();
                await page.waitForTimeout(1000);
                break;
              }
            }

            // 확인 다이얼로그에서 Delete 버튼 클릭
            const confirmSelectors = [
              'button:has-text("Delete")',
              'button:has-text("Confirm")'
            ];

            for (const selector of confirmSelectors) {
              const confirmButton = page.locator(selector).first();
              if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await confirmButton.click();
                await page.waitForTimeout(2000);
                break;
              }
            }

            report.deletedVariables.push(envVar.name);
            console.log(`   ✅ ${envVar.name} 삭제 완료`);
          }
        } else {
          console.log(`   ℹ️  ${envVar.name} 없음 (스킵)`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${envVar.name} 삭제 실패: ${error.message}`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-after-deletion.png'), fullPage: true });
    report.screenshots.push('04-after-deletion.png');

    console.log('\n➕ Step 5: 새 환경 변수 추가 중...');
    for (const envVar of ENV_VARS) {
      try {
        console.log(`   📝 ${envVar.name} 추가 중...`);

        // Add New 버튼 찾기
        const addButtonSelectors = [
          'button:has-text("Add New")',
          'button:has-text("Add")',
          'button[aria-label*="Add"]'
        ];

        let addClicked = false;
        for (const selector of addButtonSelectors) {
          const addButton = page.locator(selector).first();
          if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(2000);
            addClicked = true;
            break;
          }
        }

        if (!addClicked) {
          throw new Error('Add New 버튼을 찾을 수 없습니다');
        }

        // Name 입력
        const nameSelectors = [
          'input[name="key"]',
          'input[name="name"]',
          'input[placeholder*="NAME"]',
          'input[placeholder*="Key"]'
        ];

        let nameInput = null;
        for (const selector of nameSelectors) {
          nameInput = page.locator(selector).first();
          if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            break;
          }
        }

        if (nameInput) {
          await nameInput.fill(envVar.name);
          await page.waitForTimeout(500);
        }

        // Value 입력
        const valueSelectors = [
          'textarea[name="value"]',
          'textarea[placeholder*="VALUE"]',
          'textarea[placeholder*="Value"]',
          'input[name="value"]'
        ];

        let valueInput = null;
        for (const selector of valueSelectors) {
          valueInput = page.locator(selector).first();
          if (await valueInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            break;
          }
        }

        if (valueInput) {
          await valueInput.click();
          await page.waitForTimeout(200);

          // 값 입력 - 개행 없이 정확하게
          await valueInput.fill('');
          await page.waitForTimeout(200);
          await valueInput.type(envVar.value, { delay: 10 });
          await page.waitForTimeout(500);
        }

        // Production 체크박스 선택
        const prodCheckboxSelectors = [
          'input[type="checkbox"][value="production"]',
          'label:has-text("Production") input[type="checkbox"]',
          'input[id*="production"]'
        ];

        for (const selector of prodCheckboxSelectors) {
          const prodCheckbox = page.locator(selector).first();
          if (await prodCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
            const isChecked = await prodCheckbox.isChecked().catch(() => false);
            if (!isChecked) {
              await prodCheckbox.check();
              await page.waitForTimeout(500);
            }
            break;
          }
        }

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `05-${envVar.name}-filled.png`), fullPage: true });
        report.screenshots.push(`05-${envVar.name}-filled.png`);

        // Save 버튼 클릭
        const saveButton = page.locator('button:has-text("Save")').first();
        await saveButton.click();
        await page.waitForTimeout(3000);

        report.addedVariables.push(envVar.name);
        console.log(`   ✅ ${envVar.name} 추가 완료`);
      } catch (error) {
        const errorMsg = `${envVar.name} 추가 실패: ${error.message}`;
        console.log(`   ❌ ${errorMsg}`);
        report.errors.push(errorMsg);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `error-${envVar.name}.png`), fullPage: true });
        report.screenshots.push(`error-${envVar.name}.png`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-all-vars-added.png'), fullPage: true });
    report.screenshots.push('06-all-vars-added.png');

    console.log('\n🔄 Step 6: 재배포 트리거 중...');
    await page.goto('https://vercel.com/glecdevs-projects/glec-website', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(3000);

    // Deployments 탭 클릭
    const deploymentsSelectors = [
      'a:has-text("Deployments")',
      'button:has-text("Deployments")',
      'nav a[href*="deployments"]'
    ];

    for (const selector of deploymentsSelectors) {
      const deploymentsTab = page.locator(selector).first();
      if (await deploymentsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deploymentsTab.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-deployments-page.png'), fullPage: true });
    report.screenshots.push('07-deployments-page.png');

    // 최신 deployment의 More 버튼 클릭
    const latestDeployment = page.locator('tr, div[data-testid="deployment-row"]').first();
    const deploymentMoreButton = latestDeployment.locator('button[aria-label="More"], button:has-text("..."), button[aria-haspopup="menu"]').first();

    if (await deploymentMoreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deploymentMoreButton.click();
      await page.waitForTimeout(1000);

      // Redeploy 클릭
      const redeployButton = page.locator('button:has-text("Redeploy"), [role="menuitem"]:has-text("Redeploy")').first();
      if (await redeployButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await redeployButton.click();
        await page.waitForTimeout(2000);

        // 확인 다이얼로그
        const confirmButton = page.locator('button:has-text("Redeploy"), button:has-text("Confirm")').first();
        if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmButton.click();
          await page.waitForTimeout(3000);
          report.redeploymentTriggered = true;
          console.log('✅ 재배포 트리거 완료!');
        }
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-redeployment-triggered.png'), fullPage: true });
    report.screenshots.push('08-redeployment-triggered.png');

    console.log('\n✅ 모든 작업 완료!');
    console.log('⏳ 10초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    report.errors.push(error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-final.png'), fullPage: true });
    report.screenshots.push('error-final.png');
  } finally {
    await browser.close();
  }

  return report;
}

// 실행
(async () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Vercel 환경 변수 자동 설정 (수동 로그인 버전)');
  console.log('='.repeat(70));
  console.log('\n📋 설정할 변수:');
  ENV_VARS.forEach(v => console.log(`   • ${v.name}`));
  console.log('');

  const report = await updateVercelEnv();

  console.log('\n' + '='.repeat(70));
  console.log('📊 최종 보고서');
  console.log('='.repeat(70));
  console.log(`✅ 로그인 성공: ${report.loginSuccess}`);
  console.log(`🗑️  삭제된 변수: ${report.deletedVariables.length > 0 ? report.deletedVariables.join(', ') : '없음'}`);
  console.log(`➕ 추가된 변수: ${report.addedVariables.length > 0 ? report.addedVariables.join(', ') : '없음'}`);
  console.log(`🔄 재배포 트리거: ${report.redeploymentTriggered ? '성공' : '실패'}`);
  console.log(`📸 스크린샷: ${report.screenshots.length}개 (${SCREENSHOTS_DIR})`);

  if (report.errors.length > 0) {
    console.log(`\n❌ 오류 (${report.errors.length}건):`);
    report.errors.forEach((err, idx) => console.log(`   ${idx + 1}. ${err}`));
  }

  console.log('='.repeat(70));

  const reportPath = path.join(SCREENSHOTS_DIR, 'report-manual-login.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📝 상세 보고서: ${reportPath}\n`);

  process.exit(report.errors.length > 0 ? 1 : 0);
})();
