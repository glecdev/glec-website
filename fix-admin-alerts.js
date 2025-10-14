/**
 * Fix Admin Alerts Script - Simple Replacement
 *
 * Replaces alert()/confirm()/console in admin pages with toast utilities
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// File Paths
// ============================================================

const files = [
  'd:/GLEC-Website/glec-website/app/admin/notices/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/events/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/popups/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/press/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/knowledge-blog/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/knowledge-library/page.tsx',
  'd:/GLEC-Website/glec-website/app/admin/knowledge-videos/page.tsx',
];

// ============================================================
// Replacement Rules
// ============================================================

function fixFile(filePath) {
  console.log(`\n📝 Processing: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  let changeCount = 0;

  // Add import if not exists
  if (!content.includes("from '@/lib/admin-notifications'")) {
    const importLine = "import { showSuccess, showError, showWarning, showConfirm, logError } from '@/lib/admin-notifications';\n";

    // Find last import statement
    const lastImportMatch = content.match(/(import .+ from .+;\n)(?!import)/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + importLine);
      console.log('   ✅ Added import');
      changeCount++;
    }
  }

  // Replace alert() with showSuccess() or showError()
  const alertReplacements = [
    // Success cases
    [/alert\('공지사항이 수정되었습니다\.'\)/g, "showSuccess('공지사항이 수정되었습니다.')"],
    [/alert\('공지사항이 추가되었습니다\.'\)/g, "showSuccess('공지사항이 추가되었습니다.')"],
    [/alert\('공지사항이 삭제되었습니다\.'\)/g, "showSuccess('공지사항이 삭제되었습니다.')"],
    [/alert\('이벤트가 삭제되었습니다\.'\)/g, "showSuccess('이벤트가 삭제되었습니다.')"],
    [/alert\('팝업이 생성되었습니다\.'\)/g, "showSuccess('팝업이 생성되었습니다.')"],
    [/alert\('팝업이 수정되었습니다\.'\)/g, "showSuccess('팝업이 수정되었습니다.')"],
    [/alert\('팝업이 삭제되었습니다\.'\)/g, "showSuccess('팝업이 삭제되었습니다.')"],
    [/alert\('보도자료가 삭제되었습니다\.'\)/g, "showSuccess('보도자료가 삭제되었습니다.')"],
    [/alert\('블로그가 삭제되었습니다\.'\)/g, "showSuccess('블로그가 삭제되었습니다.')"],
    [/alert\('자료가 삭제되었습니다\.'\)/g, "showSuccess('자료가 삭제되었습니다.')"],
    [/alert\('영상이 삭제되었습니다\.'\)/g, "showSuccess('영상이 삭제되었습니다.')"],

    // Conditional success
    [/alert\(editingNotice \? '공지사항이 수정되었습니다\.' : '공지사항이 추가되었습니다\.'\)/g,
     "showSuccess(editingNotice ? '공지사항이 수정되었습니다.' : '공지사항이 추가되었습니다.')"],

    // Error cases
    [/alert\('필수 항목을 모두 입력해주세요\.'\)/g, "showError('필수 항목을 모두 입력해주세요.')"],
    [/alert\(err instanceof Error \? err\.message : 'Failed to save notice'\)/g,
     "showError(err instanceof Error ? err.message : 'Failed to save notice')"],
    [/alert\(err instanceof Error \? err\.message : 'Failed to delete notice'\)/g,
     "showError(err instanceof Error ? err.message : 'Failed to delete notice')"],
    [/alert\(err instanceof Error \? err\.message : 'Failed to delete event'\)/g,
     "showError(err instanceof Error ? err.message : 'Failed to delete event')"],
    [/alert\(err instanceof Error \? err\.message : 'Failed to create popup'\)/g,
     "showError(err instanceof Error ? err.message : 'Failed to create popup')"],
    [/alert\(err instanceof Error \? err\.message : 'Failed to update popup'\)/g,
     "showError(err instanceof Error ? err.message : 'Failed to update popup')"],
    [/alert\(err instanceof Error \? err\.message : 'Failed to delete popup'\)/g,
     "showError(err instanceof Error ? err.message : 'Failed to delete popup')"],
    [/alert\(result\.error\?\.message \|\| 'Delete failed'\)/g,
     "showError(result.error?.message || 'Delete failed')"],
  ];

  alertReplacements.forEach(([pattern, replacement]) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (before !== content) {
      console.log(`   ✅ Replaced alert() with ${replacement.split('(')[0]}`);
      changeCount++;
    }
  });

  // Replace confirm() with await showConfirm()
  const confirmReplacements = [
    [
      /if \(!confirm\(`"\$\{title\}" 공지사항을 삭제하시겠습니까\?\\n\\n\(Soft Delete - 복구 가능\)`\)\) \{/g,
      'if (!(await showConfirm({ message: `"${title}" 공지사항을 삭제하시겠습니까?\\n\\n(Soft Delete - 복구 가능)`, isDangerous: true }))) {'
    ],
    [
      /if \(!confirm\(`"\$\{title\}" 이벤트를 삭제하시겠습니까\?\\n\\n모든 참가 신청도 함께 삭제됩니다\.`\)\) \{/g,
      'if (!(await showConfirm({ message: `"${title}" 이벤트를 삭제하시겠습니까?\\n\\n모든 참가 신청도 함께 삭제됩니다.`, isDangerous: true }))) {'
    ],
    [
      /if \(!confirm\(`"\$\{title\}" 팝업을 삭제하시겠습니까\?`\)\) \{/g,
      'if (!(await showConfirm({ message: `"${title}" 팝업을 삭제하시겠습니까?`, isDangerous: true }))) {'
    ],
    [
      /if \(!confirm\(`"\$\{title\}" 보도자료를 삭제하시겠습니까\?`\)\) \{/g,
      'if (!(await showConfirm({ message: `"${title}" 보도자료를 삭제하시겠습니까?`, isDangerous: true }))) {'
    ],
    [
      /if \(!confirm\(`"\$\{title\}" 블로그를 삭제하시겠습니까\?`\)\) \{/g,
      'if (!(await showConfirm({ message: `"${title}" 블로그를 삭제하시겠습니까?`, isDangerous: true }))) {'
    ],
    [
      /if \(!confirm\(`"\$\{title\}" 자료를 삭제하시겠습니까\?`\)\) \{/g,
      'if (!(await showConfirm({ message: `"${title}" 자료를 삭제하시겠습니까?`, isDangerous: true }))) {'
    ],
    [
      /if \(!confirm\(`"\$\{title\}" 영상을 삭제하시겠습니까\?`\)\) \{/g,
      'if (!(await showConfirm({ message: `"${title}" 영상을 삭제하시겠습니까?`, isDangerous: true }))) {'
    ],
  ];

  confirmReplacements.forEach(([pattern, replacement]) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (before !== content) {
      console.log(`   ✅ Replaced confirm() with showConfirm()`);
      changeCount++;
    }
  });

  // Make handleDelete async if it's not already
  if (content.includes('await showConfirm') && !content.match(/const handleDelete = async \(/)) {
    content = content.replace(
      /const handleDelete = \((id: string, title: string)\) => \{/g,
      'const handleDelete = async (id: string, title: string) => {'
    );
    console.log(`   ✅ Made handleDelete async`);
    changeCount++;
  }

  // Replace console.error with logError
  const consoleReplacements = [
    [/console\.error\('\[Notices List\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Notices List]' });"],
    [/console\.error\('\[Notices Insights\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Notices Insights]' });"],
    [/console\.error\('\[Save Notice\] Error:', err\);/g, "logError('Save notice error', err, { context: '[Save Notice]' });"],
    [/console\.error\('\[Delete Notice\] Error:', err\);/g, "logError('Delete notice error', err, { context: '[Delete Notice]' });"],
    [/console\.error\('\[Notices\] Failed to export CSV:', err\);/g, "logError('CSV export failed', err, { context: '[Notices]' });"],
    [/console\.error\('\[Events List\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Events List]' });"],
    [/console\.error\('\[Events Insights\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Events Insights]' });"],
    [/console\.error\('\[Delete Event\] Error:', err\);/g, "logError('Delete event error', err, { context: '[Delete Event]' });"],
    [/console\.error\('\[Events CSV Export\] Error:', err\);/g, "logError('CSV export failed', err, { context: '[Events]' });"],
    [/console\.error\('\[Popups\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Popups]' });"],
    [/console\.error\('\[Create Popup\] Error:', err\);/g, "logError('Create popup error', err, { context: '[Create Popup]' });"],
    [/console\.error\('\[Update Popup\] Error:', err\);/g, "logError('Update popup error', err, { context: '[Update Popup]' });"],
    [/console\.error\('\[Delete Popup\] Error:', err\);/g, "logError('Delete popup error', err, { context: '[Delete Popup]' });"],
    [/console\.error\('\[Press\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Press]' });"],
    [/console\.error\('\[Delete Press\] Error:', err\);/g, "logError('Delete press error', err, { context: '[Delete Press]' });"],
    [/console\.error\('\[Blog\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Blog]' });"],
    [/console\.error\('\[Delete Blog\] Error:', err\);/g, "logError('Delete blog error', err, { context: '[Delete Blog]' });"],
    [/console\.error\('\[Library\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Library]' });"],
    [/console\.error\('\[Delete Library\] Error:', err\);/g, "logError('Delete library error', err, { context: '[Delete Library]' });"],
    [/console\.error\('\[Videos\] Fetch error:', err\);/g, "logError('Fetch error', err, { context: '[Videos]' });"],
    [/console\.error\('\[Delete Video\] Error:', err\);/g, "logError('Delete video error', err, { context: '[Delete Video]' });"],
  ];

  consoleReplacements.forEach(([pattern, replacement]) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (before !== content) {
      console.log(`   ✅ Replaced console.error() with logError()`);
      changeCount++;
    }
  });

  // Write back if changed
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`   💾 Saved ${changeCount} changes`);
  } else {
    console.log(`   ⏭️  No changes needed`);
  }

  return changeCount;
}

// ============================================================
// Main
// ============================================================

console.log('🔧 GLEC Admin Alert Refactor\n');

let totalChanges = 0;

files.forEach((file) => {
  if (fs.existsSync(file)) {
    totalChanges += fixFile(file);
  } else {
    console.log(`\n⚠️  File not found: ${path.basename(file)}`);
  }
});

console.log(`\n✅ Complete! Total changes: ${totalChanges}\n`);
