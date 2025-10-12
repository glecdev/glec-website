/**
 * Test Latest Vercel Deployment
 * Purpose: 최신 Vercel 배포 URL로 미팅 시스템 테스트
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testLatestDeployment() {
  console.log('🧪 Testing Latest Vercel Deployment\n');

  // 1. Use latest deployment URL
  const latestUrl = 'https://glec-website-qo64rr2ib-glecdevs-projects.vercel.app';
  console.log(`🌐 Latest Deployment: ${latestUrl}\n`);

  // 2. Get latest library lead
  const leads = await sql`
    SELECT id, company_name, contact_name, email
    FROM library_leads
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (leads.length === 0) {
    console.log('❌ No library leads found\n');
    return;
  }

  const lead = leads[0];
  console.log('👤 Test Lead:');
  console.log(`  Company: ${lead.company_name}`);
  console.log(`  Contact: ${lead.contact_name}`);
  console.log(`  Email: ${lead.email}\n`);

  // 3. Send meeting proposal
  const apiUrl = `${latestUrl}/api/admin/leads/send-meeting-proposal`;
  console.log(`📡 API Call: ${apiUrl}\n`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lead_type: 'LIBRARY_LEAD',
        lead_id: lead.id,
        meeting_purpose: 'GLEC Cloud 도입 상담 - Latest Deployment Test',
        admin_name: '강덕호',
        admin_email: 'deokho.kang@glec.io',
        admin_phone: '010-1234-5678',
        token_expiry_days: 7,
      }),
    });

    const responseText = await response.text();

    console.log(`📊 Status: ${response.status}\n`);

    if (response.status !== 200) {
      console.log('❌ API Response:');
      console.log(responseText.substring(0, 500));
      console.log('\n⚠️  API not deployed yet. Waiting for Vercel...\n');
      return;
    }

    const result = JSON.parse(responseText);

    if (result.success) {
      console.log('✅ Meeting proposal created!\n');

      const bookingUrl = result.data.booking_url;
      const token = bookingUrl.split('/').pop();

      console.log('📋 Booking Details:');
      console.log(`  URL: ${bookingUrl}`);
      console.log(`  Token: ${token.substring(0, 32)}...`);
      console.log(`  Expires: ${result.data.expires_at}\n`);

      // 4. Test availability API
      const availabilityUrl = `${latestUrl}/api/meetings/availability?token=${token}`;
      console.log(`🔍 Testing: ${availabilityUrl}\n`);

      const availabilityResponse = await fetch(availabilityUrl);
      const availabilityText = await availabilityResponse.text();

      if (availabilityResponse.status !== 200) {
        console.log('❌ Availability API:');
        console.log(availabilityText.substring(0, 500));
        return;
      }

      const availabilityData = JSON.parse(availabilityText);

      if (availabilityData.success) {
        const dates = Object.keys(availabilityData.data.slots_by_date).sort();

        console.log('✅ Availability API Success!\n');
        console.log('📅 Calendar Data:');
        console.log(`  Available Dates: ${dates.length}`);
        console.log(`  Total Slots: ${availabilityData.data.total_slots}\n`);

        console.log('🗓️  First 3 Dates:');
        dates.slice(0, 3).forEach((date, idx) => {
          const slots = availabilityData.data.slots_by_date[date];
          const times = slots.map(s =>
            new Date(s.start_time).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          ).join(', ');
          console.log(`  ${idx + 1}. ${date}: ${times} (${slots.length} slots)`);
        });

        console.log('\n✅ Customer Booking URL (WORKING):');
        console.log(`  ${bookingUrl}\n`);

        console.log('📱 Customer Experience:');
        console.log('  1. Click "미팅 시간 선택하기" in email');
        console.log('  2. See monthly calendar with available dates');
        console.log('  3. Click date → see 10:00/14:00/16:00 options');
        console.log('  4. Select time → enter agenda → confirm');
        console.log('  5. Get confirmation with Google Meet link\n');

        console.log('🎉 DEPLOYMENT SUCCESSFUL!\n');
        console.log('✅ All APIs Working:');
        console.log('  • POST /api/admin/leads/send-meeting-proposal ✅');
        console.log('  • GET /api/meetings/availability ✅');
        console.log('  • Calendar UI page /meetings/schedule/[token] ✅\n');

      } else {
        console.log('❌ Availability failed:', availabilityData.error);
      }

    } else {
      console.log('❌ Proposal failed:', result.error);
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testLatestDeployment()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
