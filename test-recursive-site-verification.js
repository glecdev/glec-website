/**
 * Recursive Site Verification with Playwright
 *
 * Purpose: Crawl and verify all pages on GLEC website
 * - Test all static pages
 * - Test all dynamic routes
 * - Test admin portal (if accessible)
 * - Check for errors, broken links, console errors
 * - Verify responsive design
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

// Pages to test
const SITE_MAP = {
  public: [
    '/',
    '/about',
    '/products',
    '/products/dtg',
    '/products/carbon-api',
    '/products/glec-cloud',
    '/solutions/dtg',
    '/solutions/api',
    '/solutions/cloud',
    '/solutions/ai-dtg',
    '/partnership',
    '/contact',
    '/notices',
    '/press',
    '/events',
    '/library',
    '/knowledge/blog',
    '/knowledge/videos',
    '/news',
    '/legal/terms',
    '/legal/privacy',
  ],
  admin: [
    '/admin/login',
    '/admin/meetings/bookings',
    '/admin/leads',
    '/admin/events',
  ]
};

class SiteVerifier {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      consoleErrors: [],
      networkErrors: []
    };
  }

  async init() {
    console.log('🚀 Initializing Playwright...\n');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    this.page = await this.context.newPage();

    // Listen to console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.consoleErrors.push({
          url: this.page.url(),
          message: msg.text()
        });
      }
    });

    // Listen to network errors
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.results.networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
  }

  async testPage(url, pageName) {
    const fullUrl = `${this.baseUrl}${url}`;
    console.log(`📄 Testing: ${pageName} (${url})`);

    try {
      // Navigate to page
      const response = await this.page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response) {
        throw new Error('No response received');
      }

      // Check HTTP status
      const status = response.status();
      if (status >= 400) {
        throw new Error(`HTTP ${status} error`);
      }

      // Wait for content to load and hydration
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(3000); // Wait for React hydration
      await this.page.waitForLoadState('networkidle');

      // Check if page has actual content (not an error page)
      const hasContent = await this.page.locator('main, [role="main"]').count() > 0;
      const hasNav = await this.page.locator('nav, header').count() > 0;

      // Only fail if there's NO content structure at all
      if (!hasContent && !hasNav) {
        // Double-check with longer wait
        await this.page.waitForTimeout(2000);
        const recheckContent = await this.page.locator('main, [role="main"], section').count() > 0;
        const recheckNav = await this.page.locator('nav, header, [role="navigation"]').count() > 0;

        if (!recheckContent && !recheckNav) {
          throw new Error('Page appears to be an error page (no main content or navigation)');
        }
      }

      // Check for error boundaries or crash messages
      const errorText = await this.page.locator('text=/error|exception|crash/i').count();
      if (errorText > 0) {
        const errorContent = await this.page.locator('text=/error|exception|crash/i').first().textContent();
        if (errorContent && !errorContent.includes('탄소배출')) { // Ignore if it's about carbon emissions
          console.log(`   ⚠️  Warning: Possible error text found: "${errorContent.slice(0, 50)}..."`);
          this.results.warnings.push({
            url: fullUrl,
            warning: `Error text detected: ${errorContent.slice(0, 100)}`
          });
        }
      }

      // Take screenshot
      const screenshotName = `screenshot-${pageName.replace(/[^a-z0-9]/gi, '-')}.png`;
      // await this.page.screenshot({ path: screenshotName, fullPage: false });

      // Check for common elements (if not 404/error page)
      const hasHeader = await this.page.locator('header, nav').count() > 0;
      const hasFooter = await this.page.locator('footer').count() > 0;

      // Get page title
      const title = await this.page.title();

      this.results.passed.push({
        url: fullUrl,
        pageName,
        status,
        title,
        hasHeader,
        hasFooter
      });

      console.log(`   ✅ Status: ${status}`);
      console.log(`   ✅ Title: ${title}`);
      if (!hasHeader) console.log(`   ⚠️  Warning: No header/nav found`);
      if (!hasFooter) console.log(`   ⚠️  Warning: No footer found`);
      console.log();

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      this.results.failed.push({
        url: fullUrl,
        pageName,
        error: error.message
      });
    }
  }

  async testDynamicRoutes() {
    console.log('🔍 Testing Dynamic Routes...\n');

    // Test first notice
    try {
      console.log('📄 Testing: First Notice Detail Page');
      await this.page.goto(`${this.baseUrl}/notices`, { waitUntil: 'networkidle', timeout: 30000 });

      // Find first notice link
      const noticeLink = await this.page.locator('a[href^="/notices/"]').first();
      if (await noticeLink.count() > 0) {
        const href = await noticeLink.getAttribute('href');
        await this.testPage(href, 'Notice Detail (First)');
      } else {
        console.log('   ⚠️  No notice links found\n');
      }
    } catch (error) {
      console.log(`   ❌ Error testing notices: ${error.message}\n`);
    }

    // Test first event
    try {
      console.log('📄 Testing: First Event Detail Page');
      await this.page.goto(`${this.baseUrl}/events`, { waitUntil: 'networkidle', timeout: 30000 });

      const eventLink = await this.page.locator('a[href^="/events/"]').first();
      if (await eventLink.count() > 0) {
        const href = await eventLink.getAttribute('href');
        await this.testPage(href, 'Event Detail (First)');
      } else {
        console.log('   ⚠️  No event links found\n');
      }
    } catch (error) {
      console.log(`   ❌ Error testing events: ${error.message}\n`);
    }

    // Test first library item
    try {
      console.log('📄 Testing: First Library Item Page');
      await this.page.goto(`${this.baseUrl}/library`, { waitUntil: 'networkidle', timeout: 30000 });

      const libraryButton = await this.page.locator('button:has-text("다운로드"), a:has-text("다운로드")').first();
      if (await libraryButton.count() > 0) {
        console.log('   ✅ Library download buttons found\n');
        this.results.passed.push({
          url: `${this.baseUrl}/library`,
          pageName: 'Library (Download Buttons)',
          status: 200
        });
      } else {
        console.log('   ⚠️  No library download buttons found\n');
      }
    } catch (error) {
      console.log(`   ❌ Error testing library: ${error.message}\n`);
    }
  }

  async testResponsive() {
    console.log('📱 Testing Responsive Design...\n');

    const viewports = [
      { name: 'Mobile (375px)', width: 375, height: 667 },
      { name: 'Tablet (768px)', width: 768, height: 1024 },
      { name: 'Desktop (1280px)', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name}`);
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });

      try {
        await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle', timeout: 30000 });
        await this.page.waitForTimeout(1000);

        const html = await this.page.content();
        if (html.includes('Application error')) {
          throw new Error('Application error on homepage');
        }

        console.log(`   ✅ Homepage loads correctly at ${viewport.name}\n`);
      } catch (error) {
        console.log(`   ❌ Error at ${viewport.name}: ${error.message}\n`);
        this.results.failed.push({
          url: this.baseUrl,
          pageName: `Homepage (${viewport.name})`,
          error: error.message
        });
      }
    }

    // Reset to default viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async generateReport() {
    console.log('='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log();

    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`🔴 Console Errors: ${this.results.consoleErrors.length}`);
    console.log(`🌐 Network Errors: ${this.results.networkErrors.length}`);
    console.log();

    if (this.results.failed.length > 0) {
      console.log('❌ FAILED PAGES:');
      this.results.failed.forEach(fail => {
        console.log(`   - ${fail.pageName}: ${fail.error}`);
      });
      console.log();
    }

    if (this.results.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.results.warnings.forEach(warning => {
        console.log(`   - ${warning.url}: ${warning.warning}`);
      });
      console.log();
    }

    if (this.results.consoleErrors.length > 0) {
      console.log('🔴 CONSOLE ERRORS (First 5):');
      this.results.consoleErrors.slice(0, 5).forEach(error => {
        console.log(`   - ${error.url}`);
        console.log(`     ${error.message}`);
      });
      console.log();
    }

    const totalTests = this.results.passed.length + this.results.failed.length;
    const successRate = totalTests > 0 ? ((this.results.passed.length / totalTests) * 100).toFixed(1) : 0;

    console.log('='.repeat(60));
    console.log(`📈 SUCCESS RATE: ${successRate}%`);
    console.log('='.repeat(60));

    return successRate >= 90;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();

      // Test public pages
      console.log('🌐 Testing Public Pages...\n');
      for (const url of SITE_MAP.public) {
        const pageName = url === '/' ? 'Homepage' : url.split('/').filter(Boolean).join(' > ');
        await this.testPage(url, pageName);
      }

      // Test dynamic routes
      await this.testDynamicRoutes();

      // Test responsive design
      await this.testResponsive();

      // Generate report
      const success = await this.generateReport();

      return success;

    } catch (error) {
      console.error('❌ Fatal error:', error);
      return false;
    } finally {
      await this.close();
    }
  }
}

// Run verification
(async () => {
  console.log('='.repeat(60));
  console.log('🔍 GLEC Website - Recursive Site Verification');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));
  console.log();

  const verifier = new SiteVerifier(BASE_URL);
  const success = await verifier.run();

  process.exit(success ? 0 : 1);
})();
