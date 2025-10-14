/**
 * Fix Remaining Admin Alerts
 */

const fs = require('fs');

const files = [
  'd:/GLEC-Website/glec-website/app/admin/analytics/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/popups/new/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/popups/edit/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/popups/create/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/meetings/bookings/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/events/create/page.tsx',
];

console.log('🔧 Fixing remaining alert() usages\n');

files.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skip: ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Add import if needed
  if (!content.includes("from '@/lib/admin-notifications'") && content.includes('alert(')) {
    const lastImportMatch = content.match(/(import .+ from .+;\n)(?!import)/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + "import { showSuccess, showError, showWarning } from '@/lib/admin-notifications';\n");
      changed = true;
      console.log(`✅ Added import to ${filePath.split('/').pop()}`);
    }
  }

  // Replace generic alert() with showError()
  const alertCount = (content.match(/alert\(/g) || []).length;
  if (alertCount > 0) {
    content = content.replace(/alert\(/g, 'showError(');
    changed = true;
    console.log(`✅ Replaced ${alertCount} alert() in ${filePath.split('/').pop()}`);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

console.log('\n✅ Done!\n');
