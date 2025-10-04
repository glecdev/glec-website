const fs = require('fs');
const report = JSON.parse(fs.readFileSync('./lighthouse-mobile-tbt.json', 'utf8'));

const perf = report.categories.performance;
const audits = report.audits;

console.log('=== MOBILE PERFORMANCE ===');
console.log('Performance Score:', Math.round(perf.score * 100));

console.log('\n=== CORE WEB VITALS ===');
console.log('FCP:', audits['first-contentful-paint'].displayValue);
console.log('LCP:', audits['largest-contentful-paint'].displayValue);
console.log('TBT:', audits['total-blocking-time'].displayValue);
console.log('CLS:', audits['cumulative-layout-shift'].displayValue);
console.log('Speed Index:', audits['speed-index'].displayValue);

console.log('\n=== TBT BREAKDOWN (Main Thread Work) ===');
const mainThread = audits['mainthread-work-breakdown'];
if (mainThread && mainThread.details && mainThread.details.items) {
  mainThread.details.items.forEach(item => {
    console.log('-', item.group + ':', item.duration.toFixed(0) + 'ms');
  });
}

console.log('\n=== LONG TASKS ===');
const longTasks = audits['long-tasks'];
if (longTasks && longTasks.details && longTasks.details.items) {
  console.log('Total long tasks:', longTasks.details.items.length);
  longTasks.details.items.slice(0, 5).forEach((task, i) => {
    console.log(`${i+1}. Duration: ${task.duration.toFixed(0)}ms, URL: ${task.url || 'inline'}`);
  });
}

console.log('\n=== JAVASCRIPT EXECUTION TIME ===');
const jsExec = audits['bootup-time'];
if (jsExec && jsExec.details && jsExec.details.items) {
  jsExec.details.items.slice(0, 10).forEach(item => {
    console.log('-', item.url.substring(item.url.lastIndexOf('/') + 1).substring(0, 50));
    console.log('  Total:', item.total.toFixed(0) + 'ms',
                '| Script Eval:', item.scripting.toFixed(0) + 'ms',
                '| Parse:', item.scriptParseCompile.toFixed(0) + 'ms');
  });
}

console.log('\n=== OPTIMIZATION OPPORTUNITIES ===');
const unused = audits['unused-javascript'];
if (unused && unused.details && unused.details.items) {
  console.log('\n1. Unused JavaScript (potential savings):');
  unused.details.items.slice(0, 5).forEach(item => {
    console.log('-', item.url.substring(item.url.lastIndexOf('/') + 1).substring(0, 50));
    console.log('  Wasted:', (item.wastedBytes / 1024).toFixed(1) + 'KB',
                '| Transfer:', (item.totalBytes / 1024).toFixed(1) + 'KB');
  });
}

const renderBlocking = audits['render-blocking-resources'];
if (renderBlocking && renderBlocking.details && renderBlocking.details.items) {
  console.log('\n2. Render-blocking resources:');
  renderBlocking.details.items.forEach(item => {
    console.log('-', item.url.substring(item.url.lastIndexOf('/') + 1));
    console.log('  Wasted time:', item.wastedMs.toFixed(0) + 'ms');
  });
}
