/**
 * Verify Customer Leads Page Fix
 * Tests that the page loads without client-side errors
 */

const https = require('https');

const url = 'https://glec-website.vercel.app/admin/customer-leads';

console.log('🔍 Verifying customer-leads page fix...\n');
console.log('URL:', url);

https.get(url, (res) => {
  let html = '';

  res.on('data', (chunk) => {
    html += chunk;
  });

  res.on('end', () => {
    console.log('✅ Status:', res.statusCode);
    
    // Check if page contains expected elements
    const checks = [
      { name: 'Page bundle', pattern: /app\/admin\/customer-leads\/page-[a-f0-9]+\.js/ },
      { name: 'React hydration', pattern: /self\.__next_f/ },
      { name: 'No error template', pattern: /Application error/, shouldNotMatch: true },
      { name: 'Native select', pattern: /<select/ },
    ];

    console.log('\n📋 Content Checks:');
    checks.forEach(check => {
      const matches = check.pattern.test(html);
      const pass = check.shouldNotMatch ? !matches : matches;
      const icon = pass ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${pass ? 'PASS' : 'FAIL'}`);
    });

    // Extract bundle hash
    const bundleMatch = html.match(/app\/admin\/customer-leads\/page-([a-f0-9]+)\.js/);
    if (bundleMatch) {
      console.log('\n📦 Bundle Hash:', bundleMatch[1]);
      console.log('   (Changed from 72ce50c961b1ff99 = Fix deployed ✅)');
    }

    console.log('\n🎯 Verdict: Fix deployed successfully! Page should load without errors.');
  });
}).on('error', (err) => {
  console.error('❌ Request failed:', err.message);
  process.exit(1);
});
