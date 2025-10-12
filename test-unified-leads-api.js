/**
 * Test Unified Leads API
 * Purpose: /api/admin/leads 엔드포인트 테스트
 */

const baseUrl = 'http://localhost:3000';

async function testUnifiedLeadsAPI() {
  console.log('🧪 Testing Unified Leads API\n');

  const tests = [
    {
      name: 'All Leads (No Filter)',
      url: `/api/admin/leads?page=1&per_page=10`,
    },
    {
      name: 'Library Leads Only',
      url: `/api/admin/leads?source_type=LIBRARY_LEAD`,
    },
    {
      name: 'Contact Form Only',
      url: `/api/admin/leads?source_type=CONTACT_FORM`,
    },
    {
      name: 'High Score Leads (80+)',
      url: `/api/admin/leads?score_min=80&score_max=100`,
    },
    {
      name: 'Search "GLEC"',
      url: `/api/admin/leads?search=GLEC`,
    },
    {
      name: 'Recent Leads (Last 7 days)',
      url: `/api/admin/leads?date_from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`,
    },
  ];

  for (const test of tests) {
    console.log(`📊 Test: ${test.name}`);
    console.log(`   URL: ${baseUrl}${test.url}\n`);

    try {
      const response = await fetch(`${baseUrl}${test.url}`);
      const result = await response.json();

      if (result.success) {
        console.log(`   ✅ Success`);
        console.log(`   Leads: ${result.data.length} / Total: ${result.meta.total}`);
        console.log(`   Avg Score: ${result.stats.avg_score}`);
        console.log(`   By Source:`);
        Object.entries(result.stats.by_source).forEach(([source, count]) => {
          if (count > 0) {
            console.log(`     - ${source}: ${count}`);
          }
        });

        if (result.data.length > 0) {
          const topLead = result.data[0];
          console.log(`   Top Lead: [${topLead.lead_source_type}] ${topLead.company_name} (Score: ${topLead.lead_score})`);
        }

        console.log('');
      } else {
        console.log(`   ❌ Failed: ${result.error.message}\n`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }
  }

  console.log('🎉 API Testing Complete!\n');
}

testUnifiedLeadsAPI()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Fatal:', err);
    process.exit(1);
  });
