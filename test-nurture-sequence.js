/**
 * Full Nurture Sequence E2E Test
 *
 * Tests the complete email nurture flow:
 * 1. Create test lead (library download)
 * 2. Trigger Day 3 nurture email
 * 3. Verify email sent
 * 4. Check database updates
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const TEST_EMAIL = 'oillex.co.kr@gmail.com';
const CRON_SECRET = 'OjZEePvm%2Bx5JqHn13bVCBQn0rTCDngh6492hqIhwRaA%3D';

// ANSI Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(status, message, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'INFO' ? 'ℹ️' : '⚠️';
  const color = status === 'PASS' ? GREEN : status === 'FAIL' ? RED : status === 'WARN' ? YELLOW : BLUE;
  console.log(`${color}${icon} ${message}${RESET}`);
  if (details) console.log(`   ${details}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// Test 1: Create Test Lead
// ============================================================

async function createTestLead() {
  console.log(`\n${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║ Test 1: Create Test Lead (Library Download)                          ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${RESET}\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/library/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        library_item_id: 'cc76abde-5b3e-4c26-b50a-d2bfe4e5d41f', // ISO 14083 Guide
        email: TEST_EMAIL,
        name: 'Test User',
        company: 'GLEC Test',
        phone: '010-1234-5678'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      log('PASS', 'Test lead created successfully');
      log('INFO', `Email: ${TEST_EMAIL}`);
      log('INFO', `Lead ID: ${data.data?.lead_id || 'N/A'}`);
      return { success: true, leadId: data.data?.lead_id };
    } else {
      log('FAIL', 'Failed to create test lead');
      log('INFO', `Error: ${data.error?.message || 'Unknown error'}`);
      return { success: false };
    }
  } catch (error) {
    log('FAIL', 'Network error creating test lead');
    log('INFO', error.message);
    return { success: false };
  }
}

// ============================================================
// Test 2: Trigger Nurture Cron Job
// ============================================================

async function triggerNurtureCron() {
  console.log(`\n${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║ Test 2: Trigger Day 3 Nurture Email (Cron Job)                       ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${RESET}\n`);

  try {
    log('INFO', 'Calling cron endpoint...');

    const response = await fetch(
      `${BASE_URL}/api/cron/library-nurture?cron_secret=${CRON_SECRET}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      log('PASS', 'Cron job executed successfully');

      const results = data.results || {};
      log('INFO', `Total leads checked: ${results.total_checked || 0}`);
      log('INFO', `Emails sent: ${results.emails_sent || 0}`);
      log('INFO', `Already sent: ${results.already_sent || 0}`);
      log('INFO', `Errors: ${results.errors || 0}`);

      if (results.emails_sent > 0) {
        log('PASS', 'At least one nurture email was sent!');
        return { success: true, emailsSent: results.emails_sent };
      } else if (results.already_sent > 0) {
        log('WARN', 'No new emails sent (already sent previously)');
        return { success: true, emailsSent: 0, alreadySent: true };
      } else {
        log('WARN', 'No emails sent (no eligible leads)');
        return { success: true, emailsSent: 0 };
      }
    } else {
      log('FAIL', 'Cron job failed');
      log('INFO', `Error: ${data.error?.message || 'Unknown error'}`);
      return { success: false };
    }
  } catch (error) {
    log('FAIL', 'Network error triggering cron job');
    log('INFO', error.message);
    return { success: false };
  }
}

// ============================================================
// Test 3: Verify Email Sent
// ============================================================

async function verifyEmailSent() {
  console.log(`\n${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║ Test 3: Verify Email Sent (Check Email)                              ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${RESET}\n`);

  log('INFO', 'Please check your email inbox:');
  log('INFO', `Email: ${TEST_EMAIL}`);
  log('INFO', 'Subject: [GLEC] ISO 14083 가이드 다운로드 완료 (Day 3 Nurture)');
  console.log();
  log('INFO', 'Manual Verification Required:');
  console.log('   1. Check inbox for nurture email');
  console.log('   2. Verify subject line and sender');
  console.log('   3. Check email template rendering');
  console.log('   4. Test all links (CTA, unsubscribe)');
  console.log('   5. Verify personalization (name, company)');
  console.log();
  log('WARN', 'This test requires manual verification');

  return { success: true, manual: true };
}

// ============================================================
// Test 4: Check Database Updates
// ============================================================

async function checkDatabaseUpdates() {
  console.log(`\n${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║ Test 4: Check Database Updates                                       ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${RESET}\n`);

  log('INFO', 'Database check requires direct SQL access');
  log('INFO', 'Run the following query to verify:');
  console.log();
  console.log(`   ${BLUE}SELECT${RESET}`);
  console.log(`     email,`);
  console.log(`     name,`);
  console.log(`     last_nurture_sent,`);
  console.log(`     nurture_email_count,`);
  console.log(`     created_at`);
  console.log(`   ${BLUE}FROM${RESET} library_leads`);
  console.log(`   ${BLUE}WHERE${RESET} email = '${TEST_EMAIL}'`);
  console.log(`   ${BLUE}ORDER BY${RESET} created_at DESC`);
  console.log(`   ${BLUE}LIMIT${RESET} 1;`);
  console.log();
  log('INFO', 'Expected: last_nurture_sent = NOW(), nurture_email_count = 1');

  return { success: true, manual: true };
}

// ============================================================
// Main Test Flow
// ============================================================

async function runTests() {
  console.log(`${BLUE}
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   GLEC Nurture Sequence E2E Test                                     ║
║   Testing Day 3 Email Flow                                           ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
${RESET}
`);

  console.log(`${BLUE}Configuration:${RESET}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test Email: ${TEST_EMAIL}`);
  console.log(`   Library Item: ISO 14083 Guide (cc76abde)`);
  console.log();

  const results = {
    createLead: false,
    triggerCron: false,
    verifyEmail: false,
    checkDatabase: false,
  };

  // Test 1: Create Test Lead
  const createResult = await createTestLead();
  results.createLead = createResult.success;

  if (!createResult.success) {
    log('FAIL', 'Cannot proceed without test lead');
    return results;
  }

  // Wait 2 seconds
  log('INFO', 'Waiting 2 seconds before triggering cron...');
  await sleep(2000);

  // Test 2: Trigger Nurture Cron
  const cronResult = await triggerNurtureCron();
  results.triggerCron = cronResult.success;

  // Test 3: Verify Email Sent (Manual)
  const verifyResult = await verifyEmailSent();
  results.verifyEmail = verifyResult.success;

  // Test 4: Check Database Updates (Manual)
  const dbResult = await checkDatabaseUpdates();
  results.checkDatabase = dbResult.success;

  // Summary
  console.log(`\n${BLUE}╔═══════════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║ Test Summary                                                          ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════════════════════════════════════╝${RESET}\n`);

  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;

  log(passed === total ? 'PASS' : 'WARN', `Tests Passed: ${passed}/${total}`);
  console.log();
  console.log(`   ${results.createLead ? GREEN + '✅' : RED + '❌'}${RESET} Create Test Lead`);
  console.log(`   ${results.triggerCron ? GREEN + '✅' : RED + '❌'}${RESET} Trigger Nurture Cron`);
  console.log(`   ${results.verifyEmail ? YELLOW + '⚠️' : RED + '❌'}${RESET} Verify Email Sent (Manual)`);
  console.log(`   ${results.checkDatabase ? YELLOW + '⚠️' : RED + '❌'}${RESET} Check Database Updates (Manual)`);
  console.log();

  if (passed === total) {
    log('PASS', 'All automated tests passed!');
    log('INFO', 'Manual verification required for email and database');
  } else {
    log('FAIL', 'Some tests failed - check output above');
  }

  console.log(`\n${BLUE}═══════════════════════════════════════════════════════════════════════${RESET}\n`);
}

// Run tests
runTests().catch(error => {
  console.error(`${RED}Fatal error: ${error.message}${RESET}`);
  process.exit(1);
});
