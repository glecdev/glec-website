/**
 * E2E Integration Test
 *
 * Comprehensive integration test for Email Template System
 *
 * Tests:
 * 1. Contact Form Submission → Lead Creation
 * 2. Template System → Variable Substitution
 * 3. Cron Jobs → Nurture Sequence
 * 4. Email History → Logging
 *
 * Run: npx tsx tests/e2e-integration-test.ts
 */

import dotenv from 'dotenv';
import {
  createTestContactLead,
  createTestLibraryLead,
  getContactLeadById,
  getLibraryLeadById,
  getEmailHistory,
  cleanupAllTestData,
} from './helpers/database';
import {
  getTemplateByCategory,
  renderTemplateContent,
  validateRenderedEmail,
  verifyAllNurtureDaysHaveTemplates,
  countTemplatesByCategory,
} from './helpers/templates';
import {
  submitContactForm,
  triggerContactNurtureCron,
  triggerLibraryNurtureCron,
  healthCheck,
  generateTestEmail,
} from './helpers/api';

dotenv.config({ path: '.env.local' });

// ============================================================
// TEST UTILITIES
// ============================================================

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => Promise<void>) {
  return async () => {
    testsRun++;
    process.stdout.write(`\n🧪 ${name}... `);

    try {
      await fn();
      testsPassed++;
      console.log('✅ PASS');
    } catch (error) {
      testsFailed++;
      console.log('❌ FAIL');
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ============================================================
// TEST SUITE
// ============================================================

async function runTests() {
  console.log('\n🚀 Starting E2E Integration Tests...\n');
  console.log('=' .repeat(60));

  // Cleanup before tests
  console.log('\n🧹 Cleaning up previous test data...');
  await cleanupAllTestData();
  console.log('✅ Cleanup complete');

  // ============================================================
  // Test 1: API Health Check
  // ============================================================

  await test('API health check', async () => {
    const health = await healthCheck();
    assert(health.status === 'healthy', 'API should be healthy');
    assert(health.checks.environment.status === 'pass', 'Environment check should pass');
    assert(health.checks.database.status === 'pass', 'Database check should pass');
  })();

  // ============================================================
  // Test 2: Template System - Verify Templates Exist
  // ============================================================

  await test('CONTACT_FORM templates exist for all nurture days', async () => {
    const result = await verifyAllNurtureDaysHaveTemplates('CONTACT_FORM');
    assert(result.valid, `Missing templates for days: ${result.missingDays.join(', ')}`);
  })();

  await test('LIBRARY_DOWNLOAD templates exist for all nurture days', async () => {
    const result = await verifyAllNurtureDaysHaveTemplates('LIBRARY_DOWNLOAD');
    assert(result.valid, `Missing templates for days: ${result.missingDays.join(', ')}`);
  })();

  await test('Total templates count >= 28', async () => {
    const counts = await countTemplatesByCategory();
    let total = 0;
    counts.forEach(count => { total += count; });
    assert(total >= 28, `Expected >= 28 templates, got ${total}`);
  })();

  // ============================================================
  // Test 3: Template Rendering - Variable Substitution
  // ============================================================

  await test('Template variable substitution works correctly', async () => {
    const template = await getTemplateByCategory('CONTACT_FORM', 3);
    assert(template !== null, 'CONTACT_FORM Day 3 template should exist');

    const rendered = renderTemplateContent(template!, {
      contact_name: 'John Doe',
      company_name: 'Acme Corp',
      email: 'john@acme.com',
      phone: '010-1234-5678',
    });

    // Verify no placeholders remain
    const validation = validateRenderedEmail(rendered.subject, rendered.html, rendered.text);
    assert(validation.valid, `Validation errors: ${validation.errors.join(', ')}`);

    // Verify variables were substituted
    assert(rendered.html.includes('John Doe'), 'HTML should contain contact_name');
    assert(rendered.html.includes('Acme Corp'), 'HTML should contain company_name');
    assert(!rendered.html.includes('{contact_name}'), 'HTML should not contain {contact_name}');
    assert(!rendered.html.includes('{company_name}'), 'HTML should not contain {company_name}');
  })();

  // ============================================================
  // Test 4: Contact Form Submission
  // ============================================================

  await test('Contact form submission creates lead', async () => {
    const testEmail = generateTestEmail('contact-test');

    const result = await submitContactForm({
      company_name: 'E2E Test Corp',
      contact_name: 'E2E Tester',
      email: testEmail,
      phone: '010-9999-9999',
      privacy_consent: true,
      marketing_consent: true,
    });

    assert(result.success, 'Contact form submission should succeed');
    assert(result.data?.lead_id, 'Should return lead_id');

    // Verify lead in database
    const lead = await getContactLeadById(result.data!.lead_id);
    assert(lead !== null, 'Lead should exist in database');
    assert(lead!.email === testEmail, 'Email should match');
    assert(lead!.company_name === 'E2E Test Corp', 'Company name should match');
  })();

  // ============================================================
  // Test 5: Nurture Sequence - Day 3
  // ============================================================

  await test('Contact lead Day 3 nurture email sent', async () => {
    // Create lead created 3 days ago
    const testEmail = generateTestEmail('nurture-day3');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const leadId = await createTestContactLead({
      email: testEmail,
      contact_name: 'Day 3 Tester',
      company_name: 'Day 3 Corp',
      created_at: threeDaysAgo,
      marketing_consent: true,
    });

    // Trigger cron
    const cronResult = await triggerContactNurtureCron();
    assert(cronResult.success, 'Cron job should succeed');

    // Small delay for async processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify lead updated
    const lead = await getContactLeadById(leadId);
    assert(lead !== null, 'Lead should exist');
    assert(lead!.nurture_day3_sent === true, 'nurture_day3_sent should be true');
    assert(lead!.nurture_day3_sent_at !== null, 'nurture_day3_sent_at should be set');

    // Verify email history
    const history = await getEmailHistory(leadId);
    assert(history.length > 0, 'Email history should exist');
    assert(history[0].send_status === 'sent', 'Email status should be sent');
  })();

  // ============================================================
  // Test 6: Dependency Chain - Day 7 requires Day 3
  // ============================================================

  await test('Day 7 email NOT sent if Day 3 not sent', async () => {
    // Create lead created 7 days ago but Day 3 NOT sent
    const testEmail = generateTestEmail('dependency-test');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const leadId = await createTestContactLead({
      email: testEmail,
      created_at: sevenDaysAgo,
      marketing_consent: true,
      // nurture_day3_sent defaults to FALSE
    });

    // Trigger cron
    await triggerContactNurtureCron();

    // Delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify Day 7 NOT sent
    const lead = await getContactLeadById(leadId);
    assert(lead !== null, 'Lead should exist');
    assert(lead!.nurture_day7_sent === false, 'Day 7 should NOT be sent without Day 3');
  })();

  // ============================================================
  // Test 7: Library Download Nurture
  // ============================================================

  await test('Library lead Day 3 nurture email sent', async () => {
    const testEmail = generateTestEmail('library-day3');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const leadId = await createTestLibraryLead({
      email: testEmail,
      contact_name: 'Library Tester',
      company_name: 'Library Corp',
      created_at: threeDaysAgo,
      marketing_consent: true,
    });

    // Trigger cron
    const cronResult = await triggerLibraryNurtureCron();
    assert(cronResult.success, 'Library cron should succeed');

    // Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify
    const lead = await getLibraryLeadById(leadId);
    assert(lead !== null, 'Library lead should exist');
    assert(lead!.nurture_day3_sent === true, 'Library Day 3 should be sent');

    // Verify email history
    const history = await getEmailHistory(leadId);
    assert(history.length > 0, 'Library email history should exist');
  })();

  // ============================================================
  // Test 8: Marketing Consent Opt-Out
  // ============================================================

  await test('Nurture email NOT sent if marketing_consent = false', async () => {
    const testEmail = generateTestEmail('optout-test');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const leadId = await createTestContactLead({
      email: testEmail,
      created_at: threeDaysAgo,
      marketing_consent: false, // Opted out
    });

    // Trigger cron
    await triggerContactNurtureCron();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify email NOT sent
    const lead = await getContactLeadById(leadId);
    assert(lead !== null, 'Lead should exist');
    assert(lead!.nurture_day3_sent === false, 'Email should NOT be sent to opted-out users');
  })();

  // ============================================================
  // Test 9: Email Bounce Handling
  // ============================================================

  await test('Nurture email NOT sent if email_bounced = true', async () => {
    const testEmail = generateTestEmail('bounced-test');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const leadId = await createTestContactLead({
      email: testEmail,
      created_at: threeDaysAgo,
      marketing_consent: true,
      email_bounced: true, // Bounced
    });

    // Trigger cron
    await triggerContactNurtureCron();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify email NOT sent
    const lead = await getContactLeadById(leadId);
    assert(lead !== null, 'Lead should exist');
    assert(lead!.nurture_day3_sent === false, 'Email should NOT be sent to bounced addresses');
  })();

  // ============================================================
  // Cleanup after tests
  // ============================================================

  console.log('\n' + '='.repeat(60));
  console.log('\n🧹 Cleaning up test data...');
  await cleanupAllTestData();
  console.log('✅ Cleanup complete');

  // ============================================================
  // Test Summary
  // ============================================================

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results:');
  console.log(`   Total: ${testsRun}`);
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    console.log('✅ Email Template System is working correctly\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${testsFailed} test(s) failed`);
    console.log('❌ Please review the errors above\n');
    process.exit(1);
  }
}

// ============================================================
// RUN TESTS
// ============================================================

runTests().catch(error => {
  console.error('\n💥 Fatal error running tests:', error);
  process.exit(1);
});
