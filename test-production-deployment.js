/**
 * Test Production Deployment
 * Purpose: 배포된 프로덕션 환경의 모든 시스템 검증
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Production URL
const PROD_URL = 'https://glec-website.vercel.app';

async function testProductionDeployment() {
  console.log('🧪 Testing Production Deployment\n');
  console.log(`📍 Production URL: ${PROD_URL}\n`);

  const results = {
    passed: [],
    failed: [],
  };

  // Test 1: Unified Leads API
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test 1: Unified Leads API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const leadsUrl = `${PROD_URL}/api/admin/leads?page=1&per_page=10`;
    console.log(`   GET ${leadsUrl}\n`);

    const leadsResponse = await fetch(leadsUrl);
    const leadsData = await leadsResponse.json();

    if (leadsData.success && leadsData.data && leadsData.stats) {
      console.log('   ✅ Unified Leads API Working\n');
      console.log(`   📊 Statistics:`);
      console.log(`      Total Leads: ${leadsData.stats.total_leads}`);
      console.log(`      Average Score: ${leadsData.stats.avg_score}`);
      console.log(`      By Source:`);
      Object.entries(leadsData.stats.by_source).forEach(([source, count]) => {
        if (count > 0) {
          console.log(`         - ${source}: ${count}`);
        }
      });
      console.log('');
      results.passed.push('Unified Leads API');
    } else {
      console.log('   ❌ Unified Leads API Failed\n');
      results.failed.push('Unified Leads API');
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    results.failed.push('Unified Leads API');
  }

  // Test 2: Database
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗄️  Test 2: Database Integration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const viewCheck = await sql`SELECT COUNT(*) as count FROM unified_leads`;
    const slotsCheck = await sql`SELECT COUNT(*) as count FROM meeting_slots WHERE is_available = TRUE AND start_time >= NOW()`;
    
    console.log(`   ✅ Unified Leads: ${viewCheck[0].count} total\n`);
    console.log(`   ✅ Meeting Slots: ${slotsCheck[0].count} available\n`);
    results.passed.push('Database Integration');
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
    results.failed.push('Database Integration');
  }

  // Final Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalTests = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);

  console.log(`✅ Passed: ${results.passed.length}/${totalTests} (${passRate}%)\n`);
  
  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.join(', ')}\n`);
  }

  if (results.failed.length === 0) {
    console.log('🎉 All Production Tests Passed!\n');
  }
}

testProductionDeployment().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Fatal Error:', err);
  process.exit(1);
});
