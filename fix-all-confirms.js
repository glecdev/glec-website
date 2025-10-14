/**
 * Fix ALL remaining confirm() calls
 */

const fs = require('fs');
const path = require('path');

const updates = [
  {
    file: 'd:/GLEC-Website/glec-website/app/admin/knowledge-blog/page.tsx',
    changes: [
      {
        from: /if \(!confirm\(`"\$\{title\}" 블로그 글을 삭제하시겠습니까\?`\)\) \{/g,
        to: 'if (!(await showConfirm({ message: `"${title}" 블로그 글을 삭제하시겠습니까?`, isDangerous: true }))) {',
      },
      {
        from: /const handleDelete = \((id: string, title: string)\) => \{/g,
        to: 'const handleDelete = async (id: string, title: string) => {',
      },
    ],
  },
  {
    file: 'd:/GLEC-Website/glec-website/app/admin/library-items/page.tsx',
    changes: [
      {
        from: /if \(!confirm\(`"\$\{item\.title\}"을\(를\) 정말 삭제하시겠습니까\?`\)\) \{/g,
        to: 'if (!(await showConfirm({ message: `"${item.title}"을(를) 정말 삭제하시겠습니까?`, isDangerous: true }))) {',
      },
      {
        from: /const handleDeleteItem = \(item: LibraryItem\) => \{/g,
        to: 'const handleDeleteItem = async (item: LibraryItem) => {',
      },
    ],
  },
  {
    file: 'd:/GLEC-Website/glec-website/app/admin/popups/page.tsx',
    changes: [
      {
        from: /if \(!confirm\('이 팝업을 삭제하시겠습니까\?'\)\) return;/g,
        to: 'if (!(await showConfirm({ message: \'이 팝업을 삭제하시겠습니까?\', isDangerous: true }))) return;',
      },
      {
        from: /const handleDelete = \(id: string\) => \{/g,
        to: 'const handleDelete = async (id: string) => {',
      },
    ],
  },
  {
    file: 'd:/GLEC-Website/glec-website/app/admin/press/page.tsx',
    changes: [
      {
        from: /if \(!confirm\(`"\$\{title\}" 보도자료를 삭제하시겠습니까\?\\n\\n\(Soft Delete - 복구 가능\)`\)\) \{/g,
        to: 'if (!(await showConfirm({ message: `"${title}" 보도자료를 삭제하시겠습니까?\\n\\n(Soft Delete - 복구 가능)`, isDangerous: true }))) {',
      },
      {
        from: /const handleDelete = \((id: string, title: string)\) => \{/g,
        to: 'const handleDelete = async (id: string, title: string) => {',
      },
    ],
  },
];

console.log('🔧 Fixing ALL remaining confirm() calls\n');

updates.forEach(({ file, changes }) => {
  if (!fs.existsSync(file)) {
    console.log(`⏭️  Skip: ${path.basename(file)} (not found)`);
    return;
  }

  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Add import if needed
  if (!content.includes("from '@/lib/admin-notifications'")) {
    const lastImportMatch = content.match(/(import .+ from .+;\n)(?!import)/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + "import { showSuccess, showError, showConfirm, logError } from '@/lib/admin-notifications';\n");
      console.log(`✅ Added import to ${path.basename(file)}`);
      changed = true;
    }
  }

  // Apply changes
  changes.forEach(({ from, to }) => {
    const before = content;
    content = content.replace(from, to);
    if (before !== content) {
      console.log(`✅ Applied change in ${path.basename(file)}`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`💾 Saved ${path.basename(file)}\n`);
  } else {
    console.log(`⏭️  No changes needed for ${path.basename(file)}\n`);
  }
});

console.log('\n✅ All confirms fixed!\n');
