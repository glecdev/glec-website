const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

// 테스트할 모든 어드민 콘텐츠 페이지
const CONTENT_PAGES = [
  { name: 'Knowledge Blog', path: '/admin/knowledge-blog', apiPath: '/api/admin/knowledge/blog', contentType: 'blog' },
  { name: 'Knowledge Videos', path: '/admin/knowledge-videos', apiPath: '/api/admin/knowledge/videos', contentType: 'video' },
  { name: 'Library Items', path: '/admin/library-items', apiPath: '/api/admin/knowledge/library', contentType: 'library' },
  { name: 'Notices', path: '/admin/notices', apiPath: '/api/admin/notices', contentType: 'notice' },
  { name: 'Events', path: '/admin/events', apiPath: '/api/admin/events', contentType: 'event' },
  { name: 'Press', path: '/admin/press', apiPath: '/api/admin/press', contentType: 'press' },
  { name: 'Popups', path: '/admin/popups', apiPath: '/api/admin/popups', contentType: 'popup' },
];

async function testAdminContentPages() {
  console.log('🔍 어드민 콘텐츠 전수 검증 시작\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const results = {
    login: null,
    pages: [],
    apis: [],
    database: null,
    summary: {
      total: CONTENT_PAGES.length,
      passed: 0,
      failed: 0,
      warnings: 0,
    },
  };

  try {
    // ========================================
    // Step 1: 로그인
    // ========================================
    console.log('1️⃣ 어드민 로그인 테스트...\n');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle', timeout: 30000 });

    // 로그인 폼 찾기
    const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="이메일"]').first();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = await page.locator('button[type="submit"], button:has-text("로그인")').first();

    if (!(await emailInput.isVisible())) {
      console.log('   ⚠️ 이미 로그인되어 있거나 로그인 폼을 찾을 수 없습니다.');
    } else {
      await emailInput.fill(ADMIN_EMAIL);
      await passwordInput.fill(ADMIN_PASSWORD);
      await loginButton.click();
      await page.waitForTimeout(2000);
    }

    const currentUrl = page.url();
    if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
      console.log('   ✅ 로그인 성공\n');
      results.login = { success: true, url: currentUrl };
    } else {
      console.log('   ❌ 로그인 실패\n');
      results.login = { success: false, url: currentUrl };
      results.summary.failed++;
    }

    // ========================================
    // Step 2: 각 콘텐츠 페이지 접속 및 검증
    // ========================================
    console.log('2️⃣ 콘텐츠 페이지 전수 검증...\n');

    for (const contentPage of CONTENT_PAGES) {
      console.log(`   📄 ${contentPage.name} (${contentPage.path})`);

      const pageResult = {
        name: contentPage.name,
        path: contentPage.path,
        apiPath: contentPage.apiPath,
        contentType: contentPage.contentType,
        pageLoadSuccess: false,
        contentCount: 0,
        errorMessage: null,
        screenshot: null,
      };

      try {
        // 페이지 접속
        await page.goto(`${BASE_URL}${contentPage.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        pageResult.pageLoadSuccess = true;

        // 2초 대기 (React 렌더링)
        await page.waitForTimeout(2000);

        // 스크린샷 저장
        const screenshotPath = `./screenshots/admin-${contentPage.contentType}-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: false });
        pageResult.screenshot = screenshotPath;

        // 콘텐츠 테이블 또는 카드 찾기
        const contentSelectors = [
          'table tbody tr',  // 테이블 행
          'div[class*="card"]',  // 카드 레이아웃
          'div[class*="item"]',  // 아이템 레이아웃
          'ul li',  // 리스트
        ];

        let contentElements = null;
        for (const selector of contentSelectors) {
          const elements = await page.locator(selector).all();
          if (elements.length > 0) {
            contentElements = elements;
            break;
          }
        }

        if (contentElements && contentElements.length > 0) {
          pageResult.contentCount = contentElements.length;
          console.log(`      ✅ 페이지 로드 성공 - ${contentElements.length}개 콘텐츠 발견`);
          results.summary.passed++;
        } else {
          // "데이터가 없습니다" 메시지 확인
          const emptyMessages = await page.locator('text=/데이터가 없습니다|등록된.*없습니다|No data/i').all();
          if (emptyMessages.length > 0) {
            console.log(`      ⚠️ 페이지 로드 성공 - 콘텐츠 0개 (빈 상태)`);
            pageResult.contentCount = 0;
            results.summary.warnings++;
          } else {
            console.log(`      ❌ 콘텐츠를 찾을 수 없음`);
            pageResult.errorMessage = '콘텐츠 요소를 찾을 수 없음';
            results.summary.failed++;
          }
        }

        // 페이지 HTML 일부 로그
        const pageTitle = await page.title();
        console.log(`      📝 페이지 제목: ${pageTitle}`);

      } catch (error) {
        console.log(`      ❌ 오류: ${error.message}`);
        pageResult.errorMessage = error.message;
        results.summary.failed++;
      }

      results.pages.push(pageResult);
      console.log('');
    }

    // ========================================
    // Step 3: API 직접 테스트
    // ========================================
    console.log('3️⃣ 콘텐츠 API 직접 테스트...\n');

    // 쿠키에서 토큰 가져오기
    const cookies = await context.cookies();
    const authToken = cookies.find(c => c.name === 'admin-token' || c.name === 'token');

    for (const contentPage of CONTENT_PAGES) {
      console.log(`   🔌 ${contentPage.name} API (${contentPage.apiPath})`);

      const apiResult = {
        name: contentPage.name,
        apiPath: contentPage.apiPath,
        success: false,
        statusCode: null,
        dataCount: 0,
        errorMessage: null,
      };

      try {
        const response = await page.request.get(`${BASE_URL}${contentPage.apiPath}`, {
          headers: authToken ? { 'Authorization': `Bearer ${authToken.value}` } : {},
        });

        apiResult.statusCode = response.status();

        if (response.ok()) {
          const data = await response.json();

          if (data.success) {
            // 데이터 개수 확인
            let dataCount = 0;
            if (Array.isArray(data.data)) {
              dataCount = data.data.length;
            } else if (data.data && typeof data.data === 'object') {
              // meta 정보가 있는 경우
              if (data.data.items && Array.isArray(data.data.items)) {
                dataCount = data.data.items.length;
              } else if (data.meta && data.meta.total) {
                dataCount = data.meta.total;
              }
            }

            apiResult.success = true;
            apiResult.dataCount = dataCount;
            console.log(`      ✅ API 성공 - ${dataCount}개 데이터`);
          } else {
            apiResult.errorMessage = data.error?.message || 'Unknown error';
            console.log(`      ❌ API 실패: ${apiResult.errorMessage}`);
          }
        } else {
          apiResult.errorMessage = `HTTP ${response.status()}`;
          console.log(`      ❌ API 실패: HTTP ${response.status()}`);
        }
      } catch (error) {
        apiResult.errorMessage = error.message;
        console.log(`      ❌ API 오류: ${error.message}`);
      }

      results.apis.push(apiResult);
      console.log('');
    }

    // ========================================
    // Step 4: 데이터베이스 직접 확인 (fetch 사용)
    // ========================================
    console.log('4️⃣ 데이터베이스 직접 확인...\n');

    const dbCheckScript = `
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);

      (async () => {
        const tables = ['blogs', 'videos', 'library_items', 'notices', 'events', 'press', 'popups'];
        const counts = {};

        for (const table of tables) {
          try {
            const result = await sql\`SELECT COUNT(*) as count FROM \${sql(table)}\`;
            counts[table] = Number(result[0].count);
          } catch (error) {
            counts[table] = { error: error.message };
          }
        }

        console.log(JSON.stringify(counts));
      })();
    `;

    console.log('   📊 각 테이블별 레코드 수:');
    console.log('   (실제 DB 확인은 서버 측에서 실행해야 합니다)\n');

  } catch (error) {
    console.error('❌ 전체 테스트 오류:', error);
  } finally {
    await browser.close();
  }

  // ========================================
  // 최종 요약 리포트
  // ========================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 전수 검증 결과 요약');
  console.log('='.repeat(80) + '\n');

  console.log(`총 페이지: ${results.summary.total}`);
  console.log(`✅ 통과: ${results.summary.passed}개`);
  console.log(`⚠️ 경고 (빈 콘텐츠): ${results.summary.warnings}개`);
  console.log(`❌ 실패: ${results.summary.failed}개\n`);

  // 페이지별 상세 결과
  console.log('📄 페이지별 상세 결과:');
  console.log('-'.repeat(80));
  results.pages.forEach((page, index) => {
    const status = page.contentCount > 0 ? '✅' : (page.contentCount === 0 ? '⚠️' : '❌');
    console.log(`${index + 1}. ${status} ${page.name}`);
    console.log(`   경로: ${page.path}`);
    console.log(`   콘텐츠 개수: ${page.contentCount}개`);
    if (page.errorMessage) {
      console.log(`   오류: ${page.errorMessage}`);
    }
    if (page.screenshot) {
      console.log(`   스크린샷: ${page.screenshot}`);
    }
    console.log('');
  });

  // API별 상세 결과
  console.log('🔌 API별 상세 결과:');
  console.log('-'.repeat(80));
  results.apis.forEach((api, index) => {
    const status = api.success && api.dataCount > 0 ? '✅' : (api.success && api.dataCount === 0 ? '⚠️' : '❌');
    console.log(`${index + 1}. ${status} ${api.name}`);
    console.log(`   엔드포인트: ${api.apiPath}`);
    console.log(`   상태 코드: ${api.statusCode}`);
    console.log(`   데이터 개수: ${api.dataCount}개`);
    if (api.errorMessage) {
      console.log(`   오류: ${api.errorMessage}`);
    }
    console.log('');
  });

  // 문제 진단 및 권장 사항
  console.log('🔧 문제 진단 및 권장 사항:');
  console.log('-'.repeat(80));

  const emptyPages = results.pages.filter(p => p.contentCount === 0 && p.pageLoadSuccess);
  const failedPages = results.pages.filter(p => !p.pageLoadSuccess || p.errorMessage);
  const emptyApis = results.apis.filter(a => a.success && a.dataCount === 0);
  const failedApis = results.apis.filter(a => !a.success);

  if (emptyPages.length > 0) {
    console.log(`\n⚠️ ${emptyPages.length}개 페이지에 콘텐츠가 없습니다:`);
    emptyPages.forEach(p => console.log(`   - ${p.name} (${p.path})`));
    console.log('\n   권장 사항:');
    console.log('   1. 데이터베이스에 샘플 데이터가 있는지 확인');
    console.log('   2. API가 올바른 데이터를 반환하는지 확인');
    console.log('   3. 프론트엔드 렌더링 로직 확인');
  }

  if (failedPages.length > 0) {
    console.log(`\n❌ ${failedPages.length}개 페이지에 오류가 있습니다:`);
    failedPages.forEach(p => console.log(`   - ${p.name}: ${p.errorMessage}`));
    console.log('\n   권장 사항:');
    console.log('   1. 브라우저 콘솔 에러 확인');
    console.log('   2. 네트워크 요청 실패 여부 확인');
    console.log('   3. React 컴포넌트 에러 확인');
  }

  if (emptyApis.length > 0) {
    console.log(`\n⚠️ ${emptyApis.length}개 API가 빈 데이터를 반환합니다:`);
    emptyApis.forEach(a => console.log(`   - ${a.name} (${a.apiPath})`));
    console.log('\n   권장 사항:');
    console.log('   1. 데이터베이스 테이블에 레코드가 있는지 확인');
    console.log('   2. SQL 쿼리가 올바른지 확인');
    console.log('   3. 필터링 조건이 너무 엄격한지 확인');
  }

  if (failedApis.length > 0) {
    console.log(`\n❌ ${failedApis.length}개 API 호출이 실패했습니다:`);
    failedApis.forEach(a => console.log(`   - ${a.name}: ${a.errorMessage}`));
    console.log('\n   권장 사항:');
    console.log('   1. API 엔드포인트가 존재하는지 확인');
    console.log('   2. 인증 토큰이 올바른지 확인');
    console.log('   3. 서버 로그 확인');
  }

  if (results.summary.failed === 0 && results.summary.warnings === 0) {
    console.log('\n✅ 모든 콘텐츠 페이지가 정상 작동합니다!');
  } else if (results.summary.failed === 0) {
    console.log('\n⚠️ 일부 콘텐츠가 비어있지만 시스템은 정상 작동합니다.');
  } else {
    console.log('\n❌ 일부 페이지에 심각한 문제가 있습니다. 즉시 수정이 필요합니다.');
  }

  console.log('\n' + '='.repeat(80));
  console.log('테스트 완료 시각:', new Date().toLocaleString('ko-KR'));
  console.log('='.repeat(80) + '\n');

  // JSON 결과 저장
  const fs = require('fs');
  const resultsPath = `./test-results-admin-content-${Date.now()}.json`;
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📁 상세 결과 저장: ${resultsPath}\n`);

  // 종료 코드
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

// 실행
testAdminContentPages().catch(error => {
  console.error('❌ 테스트 실행 오류:', error);
  process.exit(1);
});
