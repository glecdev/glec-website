/**
 * Test Admin Customer Leads Page
 */

async function test() {
  console.log('🔍 Testing Admin Customer Leads Page\n');

  // Step 1: Check if page loads (HTML)
  console.log('1️⃣ Testing page HTML...');
  try {
    const response = await fetch('http://localhost:3006/admin/customer-leads', {
      headers: {
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      console.log(`❌ Page load failed: ${response.status} ${response.statusText}\n`);
      return;
    }

    const html = await response.text();

    if (html.includes('리드 관리')) {
      console.log('✅ Page HTML loaded successfully');
      console.log('✅ Found "리드 관리" heading\n');
    } else if (html.includes('error')) {
      console.log('❌ Page contains error');
      console.log('Error snippet:', html.substring(0, 500), '\n');
    } else {
      console.log('⚠️ Page loaded but content unclear');
      console.log('HTML snippet:', html.substring(0, 500), '\n');
    }
  } catch (error) {
    console.error('❌ Failed to fetch page HTML:', error.message, '\n');
  }

  // Step 2: Check API endpoint
  console.log('2️⃣ Testing API endpoint...');
  try {
    const response = await fetch('http://localhost:3006/api/admin/library/leads?lead_status=ALL&library_item_id=ALL&page=1&per_page=20');

    if (!response.ok) {
      console.log(`❌ API failed: ${response.status} ${response.statusText}\n`);
      return;
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`✅ Found ${data.data.length} leads`);
      console.log(`✅ Total leads: ${data.meta.total}\n`);

      if (data.data.length > 0) {
        const firstLead = data.data[0];
        console.log('📋 First lead sample:');
        console.log(`   Company: ${firstLead.company_name}`);
        console.log(`   Contact: ${firstLead.contact_name}`);
        console.log(`   Email: ${firstLead.email}`);
        console.log(`   Status: ${firstLead.lead_status}`);
        console.log(`   Score: ${firstLead.lead_score}\n`);
      }
    } else {
      console.log('❌ API returned error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed to fetch API:', error.message, '\n');
  }

  // Step 3: Check library items API (used for dropdown)
  console.log('3️⃣ Testing library items API...');
  try {
    const response = await fetch('http://localhost:3006/api/admin/library/items?per_page=1000&status=ALL');

    if (!response.ok) {
      console.log(`❌ Library items API failed: ${response.status} ${response.statusText}\n`);
      return;
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ Library items API working');
      console.log(`✅ Found ${data.data.length} library items\n`);
    } else {
      console.log('❌ Library items API returned error:', data.error, '\n');
    }
  } catch (error) {
    console.error('❌ Failed to fetch library items:', error.message, '\n');
  }

  console.log('========================================');
  console.log('✅ All tests completed');
  console.log('========================================\n');

  console.log('📝 To access the page, open:');
  console.log('   http://localhost:3006/admin/customer-leads\n');
}

test().catch(console.error);
