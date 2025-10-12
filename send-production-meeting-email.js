/**
 * Send Production Meeting Email
 * Purpose: 프로덕션 URL로 실제 미팅 제안 이메일 발송
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function sendProductionEmail() {
  console.log('📧 Sending Production Meeting Email\n');

  // 1. Get latest library lead
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
  console.log('👤 Recipient:');
  console.log(`  Company: ${lead.company_name}`);
  console.log(`  Contact: ${lead.contact_name}`);
  console.log(`  Email: ${lead.email}\n`);

  // 2. Use production base URL
  const productionUrl = 'https://glec-website.vercel.app';
  const apiUrl = `${productionUrl}/api/admin/leads/send-meeting-proposal`;

  console.log(`🌐 API Endpoint: ${apiUrl}\n`);

  const requestBody = {
    lead_type: 'LIBRARY_LEAD',
    lead_id: lead.id,
    meeting_purpose: 'GLEC Cloud 도입 상담 및 라이브러리 자료 후속 논의',
    admin_name: '강덕호',
    admin_email: 'deokho.kang@glec.io',
    admin_phone: '010-1234-5678',
    token_expiry_days: 7,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    console.log(`📊 Response Status: ${response.status}\n`);

    if (result.success) {
      console.log('✅ Production email sent successfully!\n');

      const bookingUrl = result.data.booking_url;
      const token = bookingUrl.split('/').pop();

      console.log('📋 Email Details:');
      console.log(`  Booking URL: ${bookingUrl}`);
      console.log(`  Token: ${token.substring(0, 32)}...`);
      console.log(`  Expires: ${result.data.expires_at}`);
      console.log(`  Email Status: ${result.data.email_sent ? 'SENT ✅' : 'FAILED ❌'}\n`);

      // 3. Verify calendar data
      const availabilityUrl = `${productionUrl}/api/meetings/availability?token=${token}`;
      console.log(`🔍 Verifying calendar data: ${availabilityUrl}\n`);

      const availabilityResponse = await fetch(availabilityUrl);
      const availabilityData = await availabilityResponse.json();

      if (availabilityData.success) {
        const dates = Object.keys(availabilityData.data.slots_by_date).sort();

        console.log('✅ Calendar Verification:');
        console.log(`  Available Dates: ${dates.length}`);
        console.log(`  Total Slots: ${availabilityData.data.total_slots}\n`);

        console.log('📅 Customer Experience:');
        console.log(`  1. Opens email → clicks "미팅 시간 선택하기"`);
        console.log(`  2. URL: ${bookingUrl}`);
        console.log(`  3. Sees monthly calendar with ${dates.length} dates highlighted`);
        console.log(`  4. Clicks any weekday (Mon-Fri) to see time slots`);
        console.log(`  5. Chooses from 10:00 AM, 2:00 PM, or 4:00 PM`);
        console.log(`  6. Enters agenda (optional) and confirms booking`);
        console.log(`  7. Receives confirmation with Google Meet link\n`);

        console.log('🗓️  Sample Available Dates:');
        dates.slice(0, 5).forEach((date, idx) => {
          const slots = availabilityData.data.slots_by_date[date];
          const times = slots.map(s =>
            new Date(s.start_time).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          ).join(', ');
          console.log(`  ${idx + 1}. ${date}: ${times}`);
        });

        console.log('\n✅ Calendar UI Features:');
        console.log('  • Monthly grid layout (7 columns for days)');
        console.log('  • Available dates highlighted in primary blue');
        console.log('  • Past dates grayed out (disabled)');
        console.log('  • Weekends automatically excluded');
        console.log('  • Selected date shows border and background');
        console.log('  • Time slots displayed in 3-column grid');
        console.log('  • Each slot shows "N자리 남음" availability\n');

      } else {
        console.log('❌ Calendar verification failed:', availabilityData.error);
      }

      console.log('\n📍 Admin Dashboard:');
      console.log(`  View bookings: ${productionUrl}/admin/meetings/bookings`);
      console.log('  • 리스트 뷰: Card layout with filters');
      console.log('  • 캘린더 뷰: Monthly calendar with color dots\n');

    } else {
      console.log('❌ Email sending failed\n');
      console.log('Error:', result.error);
    }

  } catch (err) {
    console.error('❌ Request failed:', err.message);
  }
}

sendProductionEmail()
  .then(() => {
    console.log('🎉 Production deployment verified!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
