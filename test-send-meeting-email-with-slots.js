/**
 * Send Meeting Proposal Email (with slots verified)
 * Purpose: 미팅 슬롯이 준비된 상태에서 테스트 이메일 발송
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function sendMeetingEmail() {
  console.log('📧 Sending Meeting Proposal Email\n');

  // 1. Get a library lead for testing
  const leads = await sql`
    SELECT id, company_name, contact_name, email
    FROM library_leads
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (leads.length === 0) {
    console.log('❌ No library leads found');
    return;
  }

  const lead = leads[0];
  console.log('👤 Sending to:');
  console.log(`  Company: ${lead.company_name}`);
  console.log(`  Contact: ${lead.contact_name}`);
  console.log(`  Email: ${lead.email}`);
  console.log('');

  // 2. Send meeting proposal
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/admin/leads/send-meeting-proposal`;

  console.log(`🌐 Calling API: ${apiUrl}\n`);

  const requestBody = {
    lead_type: 'LIBRARY_LEAD',
    lead_id: lead.id,
    meeting_purpose: '라이브러리 자료 다운로드 후속 상담 및 GLEC Cloud 도입 컨설팅',
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

    console.log(`📊 Response Status: ${response.status}`);
    console.log('');

    if (result.success) {
      console.log('✅ Email sent successfully!\n');
      console.log('📋 Meeting Proposal Details:');
      console.log(`  Token ID: ${result.data.token_id}`);
      console.log(`  Booking URL: ${result.data.booking_url}`);
      console.log(`  Expires At: ${result.data.expires_at}`);
      console.log(`  Email Sent: ${result.data.email_sent ? 'YES' : 'NO'}`);
      console.log('');

      // 3. Verify available slots
      const availabilityUrl = `${baseUrl}/api/meetings/availability?token=${result.data.booking_url.split('/').pop()}`;
      const availabilityResponse = await fetch(availabilityUrl);
      const availabilityData = await availabilityResponse.json();

      if (availabilityData.success) {
        const dates = Object.keys(availabilityData.data.slots_by_date).sort();
        console.log('📅 Verified Available Slots:');
        console.log(`  Total Dates: ${dates.length}`);
        console.log(`  Total Slots: ${availabilityData.data.total_slots}`);
        console.log('');
        console.log('🗓️  First 3 dates:');
        dates.slice(0, 3).forEach((date, idx) => {
          const slots = availabilityData.data.slots_by_date[date];
          console.log(`  ${idx + 1}. ${date}: ${slots.length} slots (${slots.map(s => new Date(s.start_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })).join(', ')})`);
        });
      }

      console.log('');
      console.log('✅ Customer can now:');
      console.log('  1️⃣  Click "미팅 시간 선택하기" in email');
      console.log('  2️⃣  See monthly calendar with 21 available dates');
      console.log('  3️⃣  Click any weekday (Mon-Fri) to see time slots');
      console.log('  4️⃣  Choose from 10:00 AM, 2:00 PM, or 4:00 PM');
      console.log('  5️⃣  Book the meeting instantly');
      console.log('');
    } else {
      console.log('❌ Email sending failed\n');
      console.log('Error:', result.error);
      console.log('');
    }
  } catch (err) {
    console.error('❌ Request Error:', err.message);
  }
}

sendMeetingEmail()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
