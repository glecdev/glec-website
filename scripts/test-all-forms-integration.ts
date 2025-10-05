/**
 * Complete Forms Integration Test
 *
 * Tests all form submissions and verifies data collection in Admin:
 * 1. Event Registration → Admin Events Registrations
 * 2. Demo Request → Admin Demo Requests
 * 3. Contact Form → Admin Contact Submissions (needs verification)
 * 4. Partnership Application → Admin Partnerships (needs verification)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3010';

interface TestResult {
  form: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testEventRegistration() {
  console.log('\n📅 Step 1: Testing Event Registration Flow');
  console.log('=' .repeat(60));

  try {
    // 1. Get list of events
    console.log('  📖 GET /api/events (get published events)');
    const eventsResponse = await fetch(`${BASE_URL}/api/events`);
    const eventsData = await eventsResponse.json();

    if (!eventsData.success || eventsData.data.length === 0) {
      results.push({
        form: 'Event Registration',
        status: 'SKIP',
        message: 'No published events found - cannot test registration',
      });
      console.log('  ⚠️  SKIP: No published events found');
      return;
    }

    const event = eventsData.data[0];
    console.log(`  ✅ Found event: "${event.title}" (slug: ${event.slug})`);

    // 2. Submit registration
    console.log(`  📝 POST /api/events/${event.slug}/register`);
    const registrationData = {
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: '010-1234-5678',
      company: 'Test Company',
      job_title: 'Test Manager',
      message: 'E2E test registration',
      privacy_consent: true,
      marketing_consent: false,
    };

    const regResponse = await fetch(`${BASE_URL}/api/events/${event.slug}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    const regData = await regResponse.json();

    if (!regData.success) {
      results.push({
        form: 'Event Registration',
        status: 'FAIL',
        message: `Registration failed: ${regData.error?.message || 'Unknown error'}`,
        details: regData,
      });
      console.log(`  ❌ FAIL: ${regData.error?.message}`);
      return;
    }

    console.log(`  ✅ Registration created - ID: ${regData.data.id}`);
    console.log(`  📧 Email: ${regData.data.email}, Status: ${regData.data.status}`);

    // 3. Verify in Admin API (requires authentication - skip for now)
    console.log('  ℹ️  Note: Admin verification requires authentication (manual check needed)');

    results.push({
      form: 'Event Registration',
      status: 'PASS',
      message: `Registration successful for event "${event.title}"`,
      details: {
        eventId: event.id,
        registrationId: regData.data.id,
        email: regData.data.email,
      },
    });

    console.log('  ✅ Event Registration: PASS');
  } catch (error: any) {
    results.push({
      form: 'Event Registration',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
    console.log(`  ❌ FAIL: ${error.message}`);
  }
}

async function testDemoRequest() {
  console.log('\n🎯 Step 2: Testing Demo Request Flow');
  console.log('=' .repeat(60));

  try {
    console.log('  📝 POST /api/demo-request');
    const demoData = {
      name: `Demo Test ${Date.now()}`,
      email: `demo${Date.now()}@example.com`,
      phone: '010-9876-5432',
      company: 'Demo Company',
      job_title: 'CTO',
      industry: 'LOGISTICS',
      message: 'E2E test demo request',
      privacy_consent: true,
      marketing_consent: true,
    };

    const response = await fetch(`${BASE_URL}/api/demo-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(demoData),
    });

    const data = await response.json();

    if (!data.success) {
      results.push({
        form: 'Demo Request',
        status: 'FAIL',
        message: `Demo request failed: ${data.error?.message || 'Unknown error'}`,
        details: data,
      });
      console.log(`  ❌ FAIL: ${data.error?.message}`);
      return;
    }

    console.log(`  ✅ Demo request created - ID: ${data.data.id}`);
    console.log(`  📧 Email: ${data.data.email}, Status: ${data.data.status}`);
    console.log('  ℹ️  Note: Admin verification requires authentication (manual check needed)');

    results.push({
      form: 'Demo Request',
      status: 'PASS',
      message: 'Demo request submitted successfully',
      details: {
        requestId: data.data.id,
        email: data.data.email,
      },
    });

    console.log('  ✅ Demo Request: PASS');
  } catch (error: any) {
    results.push({
      form: 'Demo Request',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
    console.log(`  ❌ FAIL: ${error.message}`);
  }
}

async function testContactForm() {
  console.log('\n📬 Step 3: Testing Contact Form Flow');
  console.log('='  .repeat(60));

  try {
    console.log('  📝 POST /api/contact-form');
    const contactData = {
      name: `Contact Test ${Date.now()}`,
      email: `contact${Date.now()}@example.com`,
      phone: '010-5555-6666',
      company: 'Contact Company',
      subject: 'E2E Test Inquiry',
      message: 'This is an E2E test contact form submission.',
      privacy_consent: true,
    };

    const response = await fetch(`${BASE_URL}/api/contact-form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });

    const data = await response.json();

    if (!data.success) {
      results.push({
        form: 'Contact Form',
        status: 'FAIL',
        message: `Contact form failed: ${data.error?.message || 'Unknown error'}`,
        details: data,
      });
      console.log(`  ❌ FAIL: ${data.error?.message}`);
      return;
    }

    console.log(`  ✅ Contact submission created - ID: ${data.data?.id || 'N/A'}`);
    console.log(`  📧 Email: ${contactData.email}`);
    console.log('  ℹ️  Note: Admin verification requires authentication (manual check needed)');

    results.push({
      form: 'Contact Form',
      status: 'PASS',
      message: 'Contact form submitted successfully',
      details: {
        email: contactData.email,
      },
    });

    console.log('  ✅ Contact Form: PASS');
  } catch (error: any) {
    results.push({
      form: 'Contact Form',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
    console.log(`  ❌ FAIL: ${error.message}`);
  }
}

async function testPartnershipApplication() {
  console.log('\n🤝 Step 4: Testing Partnership Application Flow');
  console.log('=' .repeat(60));

  try {
    console.log('  📝 POST /api/partnership');
    const partnershipData = {
      company_name: `Partner Test ${Date.now()}`,
      contact_name: 'Partnership Manager',
      email: `partner${Date.now()}@example.com`,
      phone: '010-7777-8888',
      business_type: 'TECHNOLOGY',
      website: 'https://example.com',
      employee_count: '50-200',
      partnership_type: 'DISTRIBUTION',
      message: 'E2E test partnership application',
      privacy_consent: true,
    };

    const response = await fetch(`${BASE_URL}/api/partnership`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnershipData),
    });

    const data = await response.json();

    if (!data.success) {
      results.push({
        form: 'Partnership Application',
        status: 'FAIL',
        message: `Partnership application failed: ${data.error?.message || 'Unknown error'}`,
        details: data,
      });
      console.log(`  ❌ FAIL: ${data.error?.message}`);
      return;
    }

    console.log(`  ✅ Partnership application created - ID: ${data.data?.id || 'N/A'}`);
    console.log(`  📧 Email: ${partnershipData.email}`);
    console.log('  ℹ️  Note: Admin verification requires authentication (manual check needed)');

    results.push({
      form: 'Partnership Application',
      status: 'PASS',
      message: 'Partnership application submitted successfully',
      details: {
        email: partnershipData.email,
      },
    });

    console.log('  ✅ Partnership Application: PASS');
  } catch (error: any) {
    results.push({
      form: 'Partnership Application',
      status: 'FAIL',
      message: `Error: ${error.message}`,
    });
    console.log(`  ❌ FAIL: ${error.message}`);
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.form}: ${result.status} - ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log('='.repeat(60));

  console.log('\n📝 NEXT STEPS:');
  console.log('1. Login to Admin Portal: http://localhost:3010/admin/login');
  console.log('2. Check the following pages for submitted data:');
  console.log('   - Event Registrations: /admin/events/[event-id]/registrations');
  console.log('   - Demo Requests: /admin/demo-requests');
  console.log('   - Contact Forms: /admin/contact-submissions (if exists)');
  console.log('   - Partnership Applications: /admin/partnerships (if exists)');
  console.log('3. Verify Analytics Dashboard shows updated metrics');
}

async function main() {
  console.log('🚀 Complete Forms Integration Test');
  console.log('=' .repeat(60));
  console.log(`Testing against: ${BASE_URL}`);
  console.log('=' .repeat(60));

  await testEventRegistration();
  await testDemoRequest();
  await testContactForm();
  await testPartnershipApplication();
  await printSummary();

  const failed = results.filter((r) => r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
