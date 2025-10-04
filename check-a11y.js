const fs = require('fs');
const report = JSON.parse(fs.readFileSync('./lighthouse-desktop-after-a11y.json', 'utf8'));

console.log('=== ACCESSIBILITY SCORE ===');
console.log('Score:', Math.round(report.categories.accessibility.score * 100));

const failed = Object.values(report.audits).filter(a =>
  a.score !== null &&
  a.score < 1 &&
  report.categories.accessibility.auditRefs.find(r => r.id === a.id)
);

console.log('\nRemaining Issues (' + failed.length + '):');
failed.slice(0, 10).forEach(a => console.log('-', a.title, '(Score:', a.score + ')'));
