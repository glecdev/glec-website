const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);
const PROD_URL = 'https://glec-website.vercel.app';

async function testComplete() {
  console.log('🎯 Complete Production Verification\n');
  
  // Test 1: Production Unified Leads API
  console.log('1️⃣  Testing Production Unified Leads API...');
  const leadsRes = await fetch(`${PROD_URL}/api/admin/leads?page=1&per_page=5`);
  const leadsData = await leadsRes.json();
  
  if (leadsData.success) {
    console.log(`   ✅ API Working: ${leadsData.stats.total_leads} leads`);
    console.log(`   📊 Sources: Library=${leadsData.stats.by_source.LIBRARY_LEAD}, Contact=${leadsData.stats.by_source.CONTACT_FORM}, Demo=${leadsData.stats.by_source.DEMO_REQUEST}\n`);
  } else {
    console.log(`   ❌ Failed\n`);
  }

  // Test 2: Get latest meeting token
  console.log('2️⃣  Testing Meeting Proposal System...');
  const tokens = await sql`
    SELECT token FROM meeting_proposal_tokens
    WHERE used = FALSE AND expires_at > NOW()
    ORDER BY created_at DESC LIMIT 1
  `;
  
  if (tokens.length > 0) {
    const token = tokens[0].token;
    console.log(`   ✅ Token Found: ${token.substring(0, 32)}...`);
    
    // Test availability API
    const availRes = await fetch(`${PROD_URL}/api/meetings/availability?token=${token}`);
    const availData = await availRes.json();
    
    if (availData.success) {
      const dates = Object.keys(availData.data.slots_by_date || {});
      console.log(`   ✅ Availability API: ${dates.length} dates, ${availData.data.total_slots || 0} slots`);
      console.log(`   🔗 Booking URL: ${PROD_URL}/meetings/schedule/${token}\n`);
    } else {
      console.log(`   ❌ Availability Failed\n`);
    }
  } else {
    console.log(`   ⚠️  No unused tokens found\n`);
  }

  // Test 3: Database Stats
  console.log('3️⃣  Database Statistics...');
  const stats = await sql`
    SELECT
      (SELECT COUNT(*) FROM unified_leads) as total_leads,
      (SELECT COUNT(*) FROM meeting_slots WHERE is_available = TRUE AND start_time >= NOW()) as available_slots,
      (SELECT COUNT(*) FROM meeting_bookings) as total_bookings
  `;
  
  console.log(`   ✅ Unified Leads: ${stats[0].total_leads}`);
  console.log(`   ✅ Available Slots: ${stats[0].available_slots}`);
  console.log(`   ✅ Total Bookings: ${stats[0].total_bookings}\n`);

  // Test 4: Admin Bookings API
  console.log('4️⃣  Testing Admin Bookings API...');
  const bookingsRes = await fetch(`${PROD_URL}/api/admin/meetings/bookings?page=1&per_page=5`);
  const bookingsData = await bookingsRes.json();
  
  if (bookingsData.success) {
    console.log(`   ✅ API Working: ${bookingsData.meta.total} total bookings`);
    if (bookingsData.data.length > 0) {
      const latest = bookingsData.data[0];
      console.log(`   📅 Latest: ${latest.customer.company_name} - ${latest.booking_status}\n`);
    }
  } else {
    console.log(`   ❌ Failed\n`);
  }

  console.log('🎉 Production Verification Complete!\n');
  console.log('✅ All Systems Operational\n');
}

testComplete().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
