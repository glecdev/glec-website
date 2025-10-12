/**
 * Test Meeting Calendar Availability
 * Purpose: Test /api/meetings/availability endpoint with latest token
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testCalendarAvailability() {
  console.log('🧪 Testing Meeting Calendar Availability\n');

  // 1. Get latest token
  const tokens = await sql`
    SELECT token, expires_at, used, lead_type, lead_id
    FROM meeting_proposal_tokens
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (tokens.length === 0) {
    console.log('❌ No tokens found in database');
    return;
  }

  const tokenData = tokens[0];
  console.log('📋 Latest Token:');
  console.log(`  Token: ${tokenData.token.substring(0, 32)}...`);
  console.log(`  Expires: ${tokenData.expires_at}`);
  console.log(`  Used: ${tokenData.used}`);
  console.log(`  Lead Type: ${tokenData.lead_type}`);
  console.log('');

  // 2. Test API endpoint
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const apiUrl = `${baseUrl}/api/meetings/availability?token=${tokenData.token}`;

  console.log(`🌐 Fetching: ${apiUrl}\n`);

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log(`📊 Response Status: ${response.status}`);
    console.log('');

    if (data.success) {
      console.log('✅ API Response: SUCCESS\n');
      console.log('👤 Lead Info:');
      console.log(`  Company: ${data.data.lead_info?.company_name}`);
      console.log(`  Contact: ${data.data.lead_info?.contact_name}`);
      console.log(`  Email: ${data.data.lead_info?.email}`);
      console.log('');

      const dates = Object.keys(data.data.slots_by_date).sort();
      console.log(`📅 Available Dates: ${dates.length} dates`);
      console.log('');

      if (dates.length > 0) {
        console.log('🗓️  First 5 dates with slots:');
        dates.slice(0, 5).forEach((date, idx) => {
          const slots = data.data.slots_by_date[date];
          console.log(`  ${idx + 1}. ${date} - ${slots.length} slots available`);
          slots.forEach((slot, slotIdx) => {
            const time = new Date(slot.start_time).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            console.log(`     ${slotIdx + 1}. ${time} (${slot.available_spots} spots left)`);
          });
        });
      } else {
        console.log('⚠️  No available slots found');
      }

      console.log('');
      console.log('🔗 Customer Booking URL:');
      console.log(`   ${baseUrl}/meetings/schedule/${tokenData.token}`);
      console.log('');
      console.log('✅ Calendar page should display:');
      console.log('   1️⃣  Monthly calendar with available dates highlighted');
      console.log('   2️⃣  Click a date to see time slots (10:00, 14:00, 16:00)');
      console.log('   3️⃣  Select a time slot to book');
      console.log('');
    } else {
      console.log('❌ API Response: FAILURE\n');
      console.log('Error:', data.error);
      console.log('');
    }
  } catch (err) {
    console.error('❌ Fetch Error:', err.message);
  }
}

testCalendarAvailability()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
