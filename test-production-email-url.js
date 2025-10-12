/**
 * Test Production Email URL Generation
 *
 * Purpose: Verify SITE_URL environment variable is set correctly in Vercel
 * Expected: booking_url should be clean without newlines
 */

const https = require('https');

const BASE_URL = 'https://glec-website.vercel.app';

async function sendRequest(method, path, body = null) {
  const url = new URL(path, BASE_URL);
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testProductionEmailUrl() {
  console.log('🧪 Production Email URL Generation Test');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  try {
    // 1. Create temporary meeting slot
    console.log('1️⃣  Creating temporary meeting slot...');
    const slotData = {
      title: 'Production URL Test',
      description: 'Verify SITE_URL environment variable',
      start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      meeting_location: 'ONLINE',
      meeting_type: 'DEMO',
      is_available: true,
    };

    const slotResponse = await sendRequest('POST', '/api/admin/meetings/slots', slotData);
    if (slotResponse.status !== 201) {
      console.log(`❌ Failed to create slot: ${JSON.stringify(slotResponse.data)}`);
      return;
    }
    const slotId = slotResponse.data.data.id;
    console.log(`✅ Slot created: ${slotId}\n`);

    // 2. Get lead with email
    console.log('2️⃣  Fetching lead with email...');
    const leadsResponse = await sendRequest('GET', '/api/admin/library/leads?per_page=20');
    const leadWithEmail = leadsResponse.data.data.find(lead => lead.email);
    if (!leadWithEmail) {
      console.log('❌ No lead with email found');
      await sendRequest('DELETE', `/api/admin/meetings/slots/${slotId}`);
      return;
    }
    console.log(`✅ Lead: ${leadWithEmail.email}\n`);

    // 3. Send meeting proposal
    console.log('3️⃣  Sending meeting proposal...');
    const proposalData = {
      lead_type: 'LIBRARY_LEAD',
      lead_id: leadWithEmail.id,
      message: 'Production URL verification test',
    };
    const proposalResponse = await sendRequest('POST', '/api/admin/leads/send-meeting-proposal', proposalData);

    // Clean up: delete test slot
    await sendRequest('DELETE', `/api/admin/meetings/slots/${slotId}`);

    if (proposalResponse.status === 200 && proposalResponse.data.success) {
      const bookingUrl = proposalResponse.data.data.booking_url;

      console.log(`✅ Meeting proposal sent successfully!\n`);
      console.log('📧 Response Data:');
      console.log(JSON.stringify(proposalResponse.data, null, 2));
      console.log('\n' + '='.repeat(70));
      console.log('🔍 URL VALIDATION');
      console.log('='.repeat(70));
      console.log(`Booking URL: ${bookingUrl}`);

      // Check for newlines
      const hasNewline = bookingUrl.includes('\n') || bookingUrl.includes('\r');
      console.log(`\n✅ Has newline character: ${hasNewline ? '❌ YES (FAILED)' : '✅ NO (PASSED)'}`);

      // Check URL format
      try {
        const url = new URL(bookingUrl);
        console.log(`✅ Valid URL format: ✅ YES`);
        console.log(`   - Protocol: ${url.protocol}`);
        console.log(`   - Host: ${url.host}`);
        console.log(`   - Path: ${url.pathname}`);
      } catch (err) {
        console.log(`❌ Valid URL format: ❌ NO (FAILED)`);
        console.log(`   Error: ${err.message}`);
      }

      // Check domain
      const expectedDomain = 'glec-website.vercel.app';
      const actualDomain = bookingUrl.replace(/https?:\/\//, '').split('/')[0].trim();
      const domainMatch = actualDomain === expectedDomain || actualDomain.includes('vercel.app');
      console.log(`✅ Correct domain: ${domainMatch ? '✅ YES' : '⚠️  Different deployment URL'}`);
      console.log(`   Expected: ${expectedDomain}`);
      console.log(`   Actual: ${actualDomain}`);

      console.log('\n' + '='.repeat(70));

      if (!hasNewline && domainMatch) {
        console.log('✅ ✅ ✅ ALL CHECKS PASSED ✅ ✅ ✅');
        console.log('\nEmail button will link correctly to schedule page!');
      } else {
        console.log('❌ ❌ ❌ SOME CHECKS FAILED ❌ ❌ ❌');
        console.log('\nPlease verify:');
        console.log('1. SITE_URL environment variable is set in Vercel');
        console.log('2. Value: https://glec-website.vercel.app');
        console.log('3. Redeployed after adding environment variable');
      }

    } else {
      console.log(`❌ Failed to send meeting proposal`);
      console.log(JSON.stringify(proposalResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testProductionEmailUrl();
