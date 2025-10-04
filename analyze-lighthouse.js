const fs = require('fs');
const reportType = process.argv[2] || 'desktop';
const report = JSON.parse(fs.readFileSync(`./lighthouse-${reportType}-report.json`, 'utf8'));

console.log(`\n======================================`);
console.log(`  LIGHTHOUSE ${reportType.toUpperCase()} REPORT`);
console.log(`======================================\n`);

console.log('=== LIGHTHOUSE DESKTOP SCORES ===');
console.log('Performance:', Math.round(report.categories.performance.score * 100));
console.log('Accessibility:', Math.round(report.categories.accessibility.score * 100));
console.log('Best Practices:', Math.round(report.categories['best-practices'].score * 100));
console.log('SEO:', Math.round(report.categories.seo.score * 100));

console.log('\n=== CORE WEB VITALS ===');
const metrics = report.audits;
console.log('FCP:', metrics['first-contentful-paint'].displayValue);
console.log('LCP:', metrics['largest-contentful-paint'].displayValue);
console.log('TBT:', metrics['total-blocking-time'].displayValue);
console.log('CLS:', metrics['cumulative-layout-shift'].displayValue);
console.log('Speed Index:', metrics['speed-index'].displayValue);

console.log('\n=== PERFORMANCE OPPORTUNITIES ===');
const opportunities = Object.values(report.audits)
  .filter(a => a.score !== null && a.score < 1 && a.details && a.details.type === 'opportunity')
  .sort((a,b) => (b.numericValue || 0) - (a.numericValue || 0))
  .slice(0, 8);
opportunities.forEach(o => console.log('-', o.title, '(' + (o.displayValue || 'N/A') + ')'));

console.log('\n=== ACCESSIBILITY ISSUES ===');
const a11yAudits = report.categories.accessibility.auditRefs
  .filter(ref => {
    const audit = report.audits[ref.id];
    return audit.score !== null && audit.score < 1;
  })
  .slice(0, 10);
a11yAudits.forEach(ref => {
  const audit = report.audits[ref.id];
  console.log('-', audit.title, '(Score:', audit.score + ')');
});

console.log('\n=== DIAGNOSTICS ===');
const diagnostics = report.audits['diagnostics'];
if (diagnostics && diagnostics.details) {
  console.log('Total Requests:', diagnostics.details.items[0].numRequests);
  console.log('Total Size:', Math.round(diagnostics.details.items[0].totalByteWeight / 1024), 'KB');
  console.log('Main Thread Time:', diagnostics.details.items[0].mainDocumentTransferSize);
}
