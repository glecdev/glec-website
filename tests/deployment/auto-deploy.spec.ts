import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * GLEC Website - Playwright 기반 자동 배포 스크립트
 *
 * 이 스크립트는 다음 작업을 자동으로 수행합니다:
 * 1. GitHub 로그인
 * 2. GitHub 저장소 생성 (glecdev/website)
 * 3. Cloudflare Dashboard 로그인
 * 4. Cloudflare Pages와 GitHub 연동
 * 5. 빌드 설정 구성
 * 6. 환경 변수 설정
 * 7. 배포 트리거 및 모니터링
 */

test.describe('GLEC Website - Automated Deployment', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // 타임아웃 증가 (배포는 시간이 오래 걸림)
    test.setTimeout(1800000); // 30분
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Step 1: GitHub Login', async () => {
    console.log('🔐 GitHub 로그인 시작...');

    await page.goto('https://github.com/login');

    // GitHub 이메일/사용자명 입력
    await page.fill('input[name="login"]', process.env.GITHUB_USERNAME || 'glecdev');

    // GitHub 비밀번호 입력
    await page.fill('input[name="password"]', process.env.GITHUB_PASSWORD || '');

    // 로그인 버튼 클릭
    await page.click('input[type="submit"]');

    // 2FA가 활성화된 경우 대기
    const has2FA = await page.locator('input[name="app_otp"]').isVisible({ timeout: 5000 }).catch(() => false);

    if (has2FA) {
      console.log('⚠️  2FA 인증 필요 - 수동으로 코드를 입력해주세요 (60초 대기)');
      await page.waitForTimeout(60000); // 1분 대기
    }

    // 로그인 성공 확인
    await expect(page.locator('[aria-label="Create new..."]')).toBeVisible({ timeout: 30000 });

    console.log('✅ GitHub 로그인 성공');
  });

  test('Step 2: Create GitHub Repository', async () => {
    console.log('📦 GitHub 저장소 생성 시작...');

    // 저장소가 이미 존재하는지 확인
    await page.goto('https://github.com/glecdev/website');

    const repoExists = await page.locator('h1:has-text("glecdev/website")').isVisible({ timeout: 5000 }).catch(() => false);

    if (repoExists) {
      console.log('✅ 저장소가 이미 존재합니다. 다음 단계로 진행합니다.');
      return;
    }

    // 새 저장소 생성
    await page.goto('https://github.com/new');

    // Organization 선택 (glecdev)
    const orgSelect = await page.locator('select[name="owner"]').isVisible({ timeout: 5000 }).catch(() => false);
    if (orgSelect) {
      await page.selectOption('select[name="owner"]', { label: 'glecdev' });
    }

    // 저장소 이름 입력
    await page.fill('input[name="repository[name]"]', 'website');

    // Description 입력
    await page.fill('input[name="repository[description]"]', 'GLEC - ISO-14083 국제표준 물류 탄소배출 측정 솔루션');

    // Public 선택
    await page.click('input[value="public"]');

    // Initialize 옵션 모두 체크 해제 (이미 로컬에 코드가 있음)
    const initCheckbox = await page.locator('input[name="repository[auto_init]"]').isVisible({ timeout: 2000 }).catch(() => false);
    if (initCheckbox) {
      await page.uncheck('input[name="repository[auto_init]"]');
    }

    // 저장소 생성 버튼 클릭
    await page.click('button:has-text("Create repository")');

    // 생성 완료 대기
    await expect(page.locator('h1:has-text("Quick setup")')).toBeVisible({ timeout: 10000 });

    console.log('✅ GitHub 저장소 생성 성공: https://github.com/glecdev/website');
  });

  test('Step 3: Cloudflare Dashboard Login', async () => {
    console.log('🔐 Cloudflare Dashboard 로그인 시작...');

    await page.goto('https://dash.cloudflare.com/login');

    // 이메일 입력
    await page.fill('input[type="email"]', 'contact@glec.io');

    // Next 버튼 클릭
    await page.click('button:has-text("Next")');

    // 비밀번호 입력 대기
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    console.log('⚠️  Cloudflare 비밀번호를 수동으로 입력해주세요 (60초 대기)');
    await page.waitForTimeout(60000); // 1분 대기

    // 로그인 성공 확인 (Dashboard 로딩)
    await expect(page.locator('text=/Workers & Pages|Dashboard/i')).toBeVisible({ timeout: 30000 });

    console.log('✅ Cloudflare Dashboard 로그인 성공');
  });

  test('Step 4: Navigate to Pages Project', async () => {
    console.log('📂 Pages 프로젝트 이동 중...');

    // Workers & Pages 메뉴 클릭
    await page.click('a:has-text("Workers & Pages")');

    await page.waitForTimeout(2000);

    // glec-website 프로젝트 찾기
    const projectCard = page.locator('text=glec-website').first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });

    // 프로젝트 클릭
    await projectCard.click();

    await page.waitForTimeout(2000);

    console.log('✅ glec-website 프로젝트 열기 성공');
  });

  test('Step 5: Connect to Git', async () => {
    console.log('🔗 GitHub 연동 시작...');

    // Settings 탭 클릭
    await page.click('a:has-text("Settings")');

    await page.waitForTimeout(2000);

    // Builds & deployments 섹션으로 스크롤
    await page.locator('text=Builds & deployments').scrollIntoViewIfNeeded();

    await page.waitForTimeout(1000);

    // Connect to Git 버튼 클릭
    const connectButton = page.locator('button:has-text("Connect to Git"), a:has-text("Connect to Git")').first();
    await connectButton.click();

    await page.waitForTimeout(2000);

    // GitHub 선택
    await page.click('button:has-text("GitHub"), a:has-text("GitHub")');

    await page.waitForTimeout(2000);

    // GitHub OAuth 팝업 처리
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      // 팝업 트리거 대기
    ]);

    if (popup) {
      // Authorize Cloudflare Workers & Pages
      await popup.click('button:has-text("Authorize")');
      await popup.waitForTimeout(3000);
    }

    console.log('✅ GitHub 인증 완료');
  });

  test('Step 6: Select Repository', async () => {
    console.log('📦 저장소 선택 중...');

    await page.waitForTimeout(3000);

    // Organization 선택 (glecdev)
    const orgSelect = await page.locator('select').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (orgSelect) {
      await page.selectOption('select', { label: 'glecdev' });
      await page.waitForTimeout(2000);
    }

    // Repository 선택 (website)
    await page.click('div:has-text("website"), button:has-text("website")');

    await page.waitForTimeout(2000);

    // Begin setup 클릭
    await page.click('button:has-text("Begin setup")');

    await page.waitForTimeout(3000);

    console.log('✅ 저장소 선택 완료');
  });

  test('Step 7: Configure Build Settings', async () => {
    console.log('⚙️  빌드 설정 구성 중...');

    // Framework preset이 Next.js로 자동 감지되었는지 확인
    const frameworkSelect = page.locator('select[name="framework"]');
    const currentFramework = await frameworkSelect.inputValue();

    if (currentFramework !== 'nextjs') {
      await frameworkSelect.selectOption({ label: 'Next.js' });
    }

    console.log('✅ Framework: Next.js 선택됨');

    // Build command 확인/설정
    const buildCommand = page.locator('input[name="build_command"]');
    await buildCommand.clear();
    await buildCommand.fill('npm run build');

    console.log('✅ Build command: npm run build');

    // Build output directory 확인/설정
    const outputDir = page.locator('input[name="build_output_directory"]');
    await outputDir.clear();
    await outputDir.fill('.next');

    console.log('✅ Output directory: .next');

    // Root directory 설정
    const rootDir = page.locator('input[name="root_directory"]');
    if (await rootDir.isVisible({ timeout: 2000 }).catch(() => false)) {
      await rootDir.clear();
      await rootDir.fill('glec-website');
      console.log('✅ Root directory: glec-website');
    }

    await page.waitForTimeout(2000);

    console.log('✅ 빌드 설정 구성 완료');
  });

  test('Step 8: Add Environment Variables', async () => {
    console.log('🔐 환경 변수 설정 시작...');

    // Environment variables 섹션으로 이동
    await page.click('text=Environment variables');

    await page.waitForTimeout(2000);

    // 환경 변수 목록
    const envVars = [
      {
        name: 'DATABASE_URL',
        value: process.env.DATABASE_URL || '',
        secret: true,
        production: true
      },
      {
        name: 'JWT_SECRET',
        value: process.env.JWT_SECRET || '',
        secret: true,
        production: true
      },
      {
        name: 'RESEND_API_KEY',
        value: process.env.RESEND_API_KEY || '',
        secret: true,
        production: true
      },
      {
        name: 'RESEND_FROM_EMAIL',
        value: 'noreply@glec.io',
        secret: false,
        production: true
      },
      {
        name: 'R2_ACCOUNT_ID',
        value: 'c3f6cde2ef3a46eb48b8e215535a4a9e',
        secret: false,
        production: true
      },
      {
        name: 'R2_ACCESS_KEY_ID',
        value: process.env.R2_ACCESS_KEY_ID || '',
        secret: true,
        production: true
      },
      {
        name: 'R2_SECRET_ACCESS_KEY',
        value: process.env.R2_SECRET_ACCESS_KEY || '',
        secret: true,
        production: true
      },
      {
        name: 'R2_BUCKET_NAME',
        value: 'glec-files',
        secret: false,
        production: true
      },
      {
        name: 'ADMIN_EMAIL',
        value: 'admin@glec.io',
        secret: false,
        production: true
      },
      {
        name: 'ADMIN_PASSWORD_HASH',
        value: process.env.ADMIN_PASSWORD_HASH || '',
        secret: true,
        production: true
      }
    ];

    for (const envVar of envVars) {
      if (!envVar.value) {
        console.log(`⚠️  ${envVar.name}: 값이 없습니다. 건너뜁니다.`);
        continue;
      }

      console.log(`📝 환경 변수 추가: ${envVar.name}`);

      // Add variable 버튼 클릭
      await page.click('button:has-text("Add variable")');

      await page.waitForTimeout(1000);

      // Variable name 입력
      await page.fill('input[placeholder="Variable name"]', envVar.name);

      // Value 입력
      await page.fill('input[placeholder="Value"], textarea[placeholder="Value"]', envVar.value);

      // Type 선택 (Secret or Plain text)
      if (envVar.secret) {
        await page.click('label:has-text("Secret")');
      } else {
        await page.click('label:has-text("Plain text")');
      }

      // Environment 선택
      if (envVar.production) {
        await page.click('label:has-text("Production")');
      }

      // Save 버튼 클릭
      await page.click('button:has-text("Save")');

      await page.waitForTimeout(2000);

      console.log(`✅ ${envVar.name} 추가 완료`);
    }

    console.log('✅ 모든 환경 변수 설정 완료');
  });

  test('Step 9: Save and Deploy', async () => {
    console.log('🚀 배포 시작...');

    // Save and Deploy 버튼 클릭
    await page.click('button:has-text("Save and Deploy")');

    await page.waitForTimeout(5000);

    console.log('✅ 배포 트리거 성공');
    console.log('📊 빌드 로그 모니터링 시작...');
  });

  test('Step 10: Monitor Build Logs', async () => {
    console.log('📊 빌드 로그 모니터링 중...');

    // Deployments 탭으로 이동
    await page.click('a:has-text("Deployments")');

    await page.waitForTimeout(3000);

    // 최신 배포 클릭
    const latestDeployment = page.locator('tr').first();
    await latestDeployment.click();

    await page.waitForTimeout(2000);

    // View build logs 클릭
    await page.click('button:has-text("View build logs"), a:has-text("View build logs")');

    await page.waitForTimeout(2000);

    // 빌드 완료까지 대기 (최대 15분)
    console.log('⏳ 빌드 완료 대기 (최대 15분)...');

    await page.waitForSelector('text=/Success|Deployed|Build complete/i', {
      timeout: 900000 // 15분
    });

    console.log('✅ 빌드 성공!');

    // Production URL 추출
    const productionURL = await page.locator('a[href*="pages.dev"]').first().textContent();
    console.log(`🌐 Production URL: ${productionURL}`);

    // 결과를 파일로 저장
    const deploymentResult = {
      success: true,
      productionURL: productionURL,
      timestamp: new Date().toISOString(),
      message: 'Deployment completed successfully'
    };

    fs.writeFileSync(
      path.join(__dirname, '../../deployment-result.json'),
      JSON.stringify(deploymentResult, null, 2)
    );

    console.log('✅ 배포 완료! 결과가 deployment-result.json에 저장되었습니다.');
  });

  test('Step 11: Verify Deployment', async () => {
    console.log('✅ 배포 검증 시작...');

    // deployment-result.json 읽기
    const resultPath = path.join(__dirname, '../../deployment-result.json');
    const result = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));

    // Production URL 접속
    await page.goto(result.productionURL);

    await page.waitForTimeout(3000);

    // Homepage 로딩 확인
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    console.log('✅ Homepage 로딩 성공');

    // Hero section 확인
    const heroVisible = await page.locator('text=/ISO-14083|GLEC|탄소배출/i').isVisible({ timeout: 5000 }).catch(() => false);
    expect(heroVisible).toBe(true);

    console.log('✅ Hero section 표시됨');

    // Navigation 확인
    const navVisible = await page.locator('header, nav').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(navVisible).toBe(true);

    console.log('✅ Navigation 표시됨');

    // Footer 확인
    const footerVisible = await page.locator('footer').isVisible({ timeout: 5000 }).catch(() => false);
    expect(footerVisible).toBe(true);

    console.log('✅ Footer 표시됨');

    // 콘솔 에러 확인
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(5000);

    if (consoleErrors.length > 0) {
      console.log(`⚠️  콘솔 에러 ${consoleErrors.length}개 발견:`);
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('✅ 콘솔 에러 없음');
    }

    console.log('✅ 배포 검증 완료!');
  });
});
