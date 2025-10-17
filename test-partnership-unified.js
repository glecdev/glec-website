/**
 * Partnership → Unified Leads Verification
 */

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';
const timestamp = Date.now();

let adminToken = null;
let partnershipId = null;

async function adminLogin() {
  console.log('🔑 Admin Login...');
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  adminToken = (await res.json()).data.token;
  console.log('✅ Logged in\n');
}

async function createPartnership() {
  console.log('🤝 Step 1: Submit Partnership...');

  const data = {
    companyName: `파트너십 통합리드 검증 ${timestamp}`,
    contactName: `파트너십 담당자 ${timestamp}`,
    email: `partnership-verify-${timestamp}@example.com`,
    partnershipType: 'tech',
    proposal: '통합 리드 검증 테스트 - 기술 파트너십 제안입니다. IoT 디바이스 통합을 통한 실시간 탄소배출 데이터 수집 시스템을 제안합니다.'
  };

  const res = await fetch(`${BASE_URL}/api/partnership`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();

  if (result.success) {
    partnershipId = result.data.id;
    console.log(`   ✅ Partnership ID: ${partnershipId}`);
    console.log(`   Email: partnership-verify-${timestamp}@example.com\n`);
    return true;
  } else {
    console.log(`   ❌ Failed: ${result.error?.message}\n`);
    return false;
  }
}

async function verifyInUnifiedLeads() {
  console.log('🔍 Step 2: Verify in Unified Leads...\n');

  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for DB

  const res = await fetch(`${BASE_URL}/api/admin/leads?source_type=PARTNERSHIP&per_page=100`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const result = await res.json();

  if (!result.success) {
    console.log(`   ❌ API failed: ${result.error?.message}\n`);
    return false;
  }

  const ourLead = result.data.find(lead => lead.lead_id === partnershipId);

  if (ourLead) {
    console.log('   ✅ Partnership found in unified_leads!');
    console.log('');
    console.log('   📋 Lead Details:');
    console.log(`      Lead Source: ${ourLead.lead_source_type}`);
    console.log(`      Company: ${ourLead.company_name}`);
    console.log(`      Contact: ${ourLead.contact_name}`);
    console.log(`      Email: ${ourLead.email}`);
    console.log(`      Lead Score: ${ourLead.lead_score}`);
    console.log(`      Lead Status: ${ourLead.lead_status}`);
    console.log(`      Partnership Type: ${ourLead.partnership_type}`);
    console.log(`      Created: ${new Date(ourLead.created_at).toLocaleString()}`);
    console.log('');
    return true;
  } else {
    console.log('   ❌ Partnership NOT found in unified_leads');
    console.log(`   Expected ID: ${partnershipId}`);
    console.log(`   Total PARTNERSHIP leads: ${result.data.length}`);
    console.log('');
    return false;
  }
}

async function verifyInAdminPartnershipAPI() {
  console.log('🔍 Step 3: Verify in Admin Partnership API...\n');

  const res = await fetch(`${BASE_URL}/api/admin/partnerships`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const result = await res.json();

  if (!result.success) {
    console.log(`   ❌ API failed: ${result.error?.message}\n`);
    return false;
  }

  const found = result.data.some(p => p.id === partnershipId);

  if (found) {
    console.log('   ✅ Partnership found in admin partnerships API!');
    console.log('');
    return true;
  } else {
    console.log('   ❌ Partnership NOT found in admin partnerships API');
    console.log(`   Total partnerships: ${result.data.length}`);
    console.log('');
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('PARTNERSHIP → UNIFIED LEADS VERIFICATION');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    await adminLogin();
    const created = await createPartnership();

    if (!created) {
      console.log('❌ Partnership creation failed. Stopping test.\n');
      return;
    }

    const inUnified = await verifyInUnifiedLeads();
    const inAdmin = await verifyInAdminPartnershipAPI();

    console.log('═══════════════════════════════════════════════════');
    console.log('📊 VERIFICATION RESULTS');
    console.log('═══════════════════════════════════════════════════\n');

    console.log(`   Partnership Created: ✅`);
    console.log(`   Unified Leads: ${inUnified ? '✅' : '❌'}`);
    console.log(`   Admin Partnership API: ${inAdmin ? '✅' : '❌'}`);
    console.log('');

    if (inUnified && inAdmin) {
      console.log('   🎉 SUCCESS: Partnership fully integrated!');
    } else {
      console.log('   ⚠️  PARTIAL: Some integration missing');
    }

    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.log('\n❌ TEST FAILED:', error.message);
    console.log(error.stack);
  }
}

main();
