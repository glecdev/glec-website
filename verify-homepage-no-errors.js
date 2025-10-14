/**
 * Playwright Homepage Error Verification Script
 *
 * Purpose: Recursively verify homepage has no errors
 * Run: node verify-homepage-no-errors.js
 */

const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';

async function verifyHomepage() {
  console.log('🚀 Starting Homepage Error Verification...\n');
  console.log(`Target URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const testResults = [];
  let overallPassed = true;

  // Capture errors
  const consoleErrors = [];
  const pageErrors = [];
  const hydrationErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
    const text = msg.text();
    if (text.includes('Hydration') || text.includes('hydration') || text.includes('did not match')) {
      hydrationErrors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  // Test 1: No "Application error" message
  console.log('Test 1: Checking for "Application error" message...');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const applicationError = await page.getByText(/Application error.*client-side exception/i).count();
    if (applicationError > 0) {
      console.log('   ❌ FAILED: Found "Application error" message');
      testResults.push({ test: 'Application Error Check', passed: false });
      overallPassed = false;
    } else {
      console.log('   ✅ PASSED: No "Application error" message\n');
      testResults.push({ test: 'Application Error Check', passed: true });
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    testResults.push({ test: 'Application Error Check', passed: false });
    overallPassed = false;
  }

  // Test 2: Page title
  console.log('Test 2: Checking page title...');
  try {
    const title = await page.title();
    if (title.includes('GLEC') && title.includes('ISO-14083')) {
      console.log(`   ✅ PASSED: Title is "${title}"\n`);
      testResults.push({ test: 'Page Title', passed: true });
    } else {
      console.log(`   ❌ FAILED: Unexpected title "${title}"\n`);
      testResults.push({ test: 'Page Title', passed: false });
      overallPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    testResults.push({ test: 'Page Title', passed: false });
    overallPassed = false;
  }

  // Test 3: Main sections render
  console.log('Test 3: Checking main sections...');
  const sections = [
    { name: 'Hero Section', text: 'ISO-14083' },
    { name: 'Problem Awareness', text: '매일 밤' },
    { name: 'Solution Overview', text: '단 하나의 플랫폼' },
    { name: 'Partners', text: '함께하는 파트너' },
    { name: 'Contact Form', text: '무료 상담 신청' },
  ];

  let allSectionsRendered = true;
  for (const section of sections) {
    try {
      const element = page.getByText(section.text, { exact: false }).first();
      const isVisible = await element.isVisible({ timeout: 5000 });
      if (isVisible) {
        console.log(`   ✓ ${section.name} rendered`);
      } else {
        console.log(`   ✗ ${section.name} NOT visible`);
        allSectionsRendered = false;
      }
    } catch (error) {
      console.log(`   ✗ ${section.name} NOT found`);
      allSectionsRendered = false;
    }
  }

  if (allSectionsRendered) {
    console.log('   ✅ PASSED: All main sections rendered\n');
    testResults.push({ test: 'Main Sections', passed: true });
  } else {
    console.log('   ❌ FAILED: Some sections missing\n');
    testResults.push({ test: 'Main Sections', passed: false });
    overallPassed = false;
  }

  // Test 4: No critical JavaScript errors
  console.log('Test 4: Checking JavaScript console errors...');
  await page.waitForTimeout(2000);

  const criticalErrors = consoleErrors.filter(
    (err) =>
      err.includes('Uncaught') ||
      err.includes('TypeError') ||
      err.includes('ReferenceError') ||
      err.includes('Toaster') ||
      err.includes('undefined')
  );

  if (criticalErrors.length > 0) {
    console.log('   ❌ FAILED: Critical JavaScript errors found:');
    criticalErrors.forEach((err) => console.log(`      - ${err}`));
    console.log('');
    testResults.push({ test: 'JavaScript Errors', passed: false });
    overallPassed = false;
  } else {
    console.log(`   ✅ PASSED: No critical JavaScript errors`);
    console.log(`      (Total console errors: ${consoleErrors.length})\n`);
    testResults.push({ test: 'JavaScript Errors', passed: true });
  }

  // Test 5: No page errors
  console.log('Test 5: Checking page errors...');
  if (pageErrors.length > 0) {
    console.log('   ❌ FAILED: Page errors found:');
    pageErrors.forEach((err) => console.log(`      - ${err}`));
    console.log('');
    testResults.push({ test: 'Page Errors', passed: false });
    overallPassed = false;
  } else {
    console.log('   ✅ PASSED: No page errors\n');
    testResults.push({ test: 'Page Errors', passed: true });
  }

  // Test 6: No hydration errors
  console.log('Test 6: Checking hydration errors...');
  if (hydrationErrors.length > 0) {
    console.log('   ❌ FAILED: Hydration errors found:');
    hydrationErrors.forEach((err) => console.log(`      - ${err}`));
    console.log('');
    testResults.push({ test: 'Hydration Errors', passed: false });
    overallPassed = false;
  } else {
    console.log('   ✅ PASSED: No hydration errors\n');
    testResults.push({ test: 'Hydration Errors', passed: true });
  }

  // Test 7: Toaster component present
  console.log('Test 7: Checking Toaster component...');
  try {
    const toasterContainer = await page.locator('[data-hot-toast-container], [role="region"][aria-live="polite"]').count();
    if (toasterContainer > 0) {
      console.log('   ✅ PASSED: Toaster component is mounted\n');
      testResults.push({ test: 'Toaster Component', passed: true });
    } else {
      console.log('   ❌ FAILED: Toaster component not found\n');
      testResults.push({ test: 'Toaster Component', passed: false });
      overallPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    testResults.push({ test: 'Toaster Component', passed: false });
    overallPassed = false;
  }

  // Recursive verification (3 iterations)
  console.log('═══════════════════════════════════════════════════');
  console.log('🔄 RECURSIVE VERIFICATION (3 iterations)');
  console.log('═══════════════════════════════════════════════════\n');

  const iterations = 3;
  const iterationResults = [];

  for (let i = 1; i <= iterations; i++) {
    console.log(`Iteration ${i}/${iterations}:`);

    const errors = [];

    // Reload page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check for "Application error"
    const appError = await page.getByText(/Application error.*client-side exception/i).count();
    if (appError > 0) {
      errors.push('Found "Application error" message');
    }

    // Check for critical console errors
    const newConsoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        newConsoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    const newCriticalErrors = newConsoleErrors.filter(
      (err) => err.includes('Uncaught') || err.includes('TypeError') || err.includes('Toaster')
    );

    if (newCriticalErrors.length > 0) {
      errors.push(`Critical console errors: ${newCriticalErrors.length}`);
    }

    const passed = errors.length === 0;
    iterationResults.push({ iteration: i, passed, errors });

    console.log(`   ${passed ? '✅' : '❌'} ${passed ? 'PASSED' : 'FAILED'}`);
    if (!passed) {
      errors.forEach((err) => console.log(`      - ${err}`));
    }
    console.log('');
  }

  const allIterationsPassed = iterationResults.every((r) => r.passed);
  const passedCount = iterationResults.filter((r) => r.passed).length;

  console.log('📊 Recursive Verification Results:');
  console.log(`   Passed: ${passedCount}/${iterations}`);
  console.log(`   Success Rate: ${((passedCount / iterations) * 100).toFixed(1)}%`);

  if (!allIterationsPassed) {
    console.log(`   ❌ FAILED: Only ${passedCount}/${iterations} iterations passed\n`);
    overallPassed = false;
  } else {
    console.log(`   ✅ PASSED: All ${iterations} iterations succeeded\n`);
  }

  // Take screenshot
  await page.screenshot({ path: 'homepage-verification-screenshot.png', fullPage: true });
  console.log('📸 Screenshot saved: homepage-verification-screenshot.png\n');

  await browser.close();

  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════\n');

  testResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.test}: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
  });

  console.log(`\nRecursive Verification: ${allIterationsPassed ? '✅ PASSED' : '❌ FAILED'} (${passedCount}/${iterations})`);

  const totalTests = testResults.length + 1; // +1 for recursive verification
  const totalPassed = testResults.filter((r) => r.passed).length + (allIterationsPassed ? 1 : 0);

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`OVERALL RESULT: ${overallPassed && allIterationsPassed ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log(`Total: ${totalPassed}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════════════════════\n');

  process.exit(overallPassed && allIterationsPassed ? 0 : 1);
}

verifyHomepage().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
