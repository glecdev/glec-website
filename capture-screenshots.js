/**
 * Visual Regression Testing - Screenshot Capture
 * CLAUDE.md Step 6 Phase 3
 *
 * Captures screenshots at 3 breakpoints:
 * - Mobile: 375px (iPhone SE)
 * - Tablet: 768px (iPad)
 * - Desktop: 1280px (Laptop)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://glec-website.vercel.app';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 }
];

const pages = [
  { path: '/', name: 'homepage' },
  { path: '/admin/login', name: 'admin-login' },
  { path: '/products/dtg-series5', name: 'product-dtg' },
  { path: '/products/carbon-api', name: 'product-api' },
  { path: '/knowledge/blog', name: 'knowledge-blog' },
  { path: '/contact', name: 'contact' }
];

async function captureScreenshots() {
  const outputDir = path.join(__dirname, 'screenshots', 'v0.2.0');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('📸 Visual Regression Testing - Screenshot Capture');
  console.log('🌐 URL:', BASE_URL);
  console.log('📁 Output:', outputDir);
  console.log('='.repeat(70));

  const browser = await chromium.launch();

  for (const viewport of viewports) {
    console.log(`\n📱 ${viewport.name.toUpperCase()} (${viewport.width}x${viewport.height})`);
    console.log('-'.repeat(70));

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });

    const page = await context.newPage();

    for (const pageInfo of pages) {
      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        const filename = `${pageInfo.name}_${viewport.name}.png`;
        const filepath = path.join(outputDir, filename);

        await page.screenshot({
          path: filepath,
          fullPage: true
        });

        console.log(`✅ ${pageInfo.name.padEnd(20)} → ${filename}`);
      } catch (error) {
        console.log(`❌ ${pageInfo.name.padEnd(20)} → ERROR: ${error.message}`);
      }
    }

    await context.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  console.log('✅ Screenshot Capture Complete');
  console.log(`📁 Location: ${outputDir}`);
  console.log('='.repeat(70));

  // Generate report
  const report = {
    version: 'v0.2.0',
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewports: viewports.map(v => `${v.name} (${v.width}x${v.height})`),
    pages: pages.map(p => p.path),
    totalScreenshots: viewports.length * pages.length,
    outputDirectory: outputDir
  };

  fs.writeFileSync(
    path.join(outputDir, 'report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log('\n📊 Visual Regression Report:');
  console.log(`   Total Screenshots: ${report.totalScreenshots}`);
  console.log(`   Viewports: ${report.viewports.join(', ')}`);
  console.log(`   Pages: ${report.pages.length}`);
}

captureScreenshots().catch(console.error);
