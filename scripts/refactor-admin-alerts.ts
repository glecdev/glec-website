/**
 * Refactor Admin Alerts Script
 *
 * Purpose: Replace all alert(), confirm(), console.log/error/warn() with centralized utilities
 * Target: All files in app/admin/**\/*.tsx
 * Based on: CLAUDE.md Step 5 검증 (하드코딩 제거)
 *
 * Transformations:
 * 1. alert('message') → showSuccess('message') or showError('message')
 * 2. confirm('message') → await showConfirm({ message: 'message' })
 * 3. console.log(...) → logInfo(...) [development only]
 * 4. console.error(...) → logError(...) [always logs]
 *
 * Usage:
 * ```bash
 * npx tsx scripts/refactor-admin-alerts.ts
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ============================================================
// File Discovery
// ============================================================

async function findAdminFiles(): Promise<string[]> {
  const pattern = 'd:/GLEC-Website/glec-website/app/admin/**/*.tsx';
  const files = await glob(pattern, { nodir: true });
  console.log(`\n📁 Found ${files.length} admin files\n`);
  return files;
}

// ============================================================
// Transformation Rules
// ============================================================

interface RefactorResult {
  filePath: string;
  changed: boolean;
  changes: string[];
}

function refactorFile(filePath: string): RefactorResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modifiedContent = content;
  const changes: string[] = [];

  // Rule 1: Add import if needed
  const needsImport =
    (content.includes('alert(') ||
      content.includes('confirm(') ||
      content.match(/console\.(log|error|warn)/)) &&
    !content.includes("from '@/lib/admin-notifications'");

  if (needsImport) {
    // Find where to insert import (after existing imports)
    const importMatch = modifiedContent.match(/^(import .+;\n)+/m);
    if (importMatch) {
      const lastImportIndex = modifiedContent.lastIndexOf(importMatch[0]) + importMatch[0].length;
      const newImport = `import { showSuccess, showError, showWarning, showConfirm, logInfo, logError, logWarning } from '@/lib/admin-notifications';\n`;
      modifiedContent =
        modifiedContent.slice(0, lastImportIndex) +
        newImport +
        modifiedContent.slice(lastImportIndex);
      changes.push('Added import from @/lib/admin-notifications');
    }
  }

  // Rule 2: Replace alert() with showSuccess() or showError()
  // Heuristic: if message contains "성공", "완료", "저장", "추가" → showSuccess
  // if message contains "실패", "에러", "오류" → showError
  // otherwise → showWarning
  const alertPattern = /alert\(([^)]+)\)/g;
  let alertMatch;
  while ((alertMatch = alertPattern.exec(content)) !== null) {
    const message = alertMatch[1];
    let replacement;

    if (
      message.includes('성공') ||
      message.includes('완료') ||
      message.includes('저장') ||
      message.includes('추가') ||
      message.includes('수정되었습니다') ||
      message.includes('삭제되었습니다')
    ) {
      replacement = `showSuccess(${message})`;
    } else if (
      message.includes('실패') ||
      message.includes('에러') ||
      message.includes('오류') ||
      message.includes('Failed') ||
      message.includes('Error')
    ) {
      replacement = `showError(${message})`;
    } else {
      replacement = `showWarning(${message})`;
    }

    modifiedContent = modifiedContent.replace(`alert(${message})`, replacement);
    changes.push(`Replaced alert(${message.substring(0, 30)}...) with ${replacement.split('(')[0]}`);
  }

  // Rule 3: Replace confirm() with await showConfirm()
  const confirmPattern = /if\s*\(\s*!?confirm\(([^)]+)\)\s*\)\s*\{/g;
  let confirmMatch;
  while ((confirmMatch = confirmPattern.exec(content)) !== null) {
    const message = confirmMatch[1];
    const negated = confirmMatch[0].includes('!confirm');

    const replacement = negated
      ? `if (!(await showConfirm({ message: ${message} }))) {`
      : `if (await showConfirm({ message: ${message} })) {`;

    modifiedContent = modifiedContent.replace(confirmMatch[0], replacement);
    changes.push(`Replaced confirm(${message.substring(0, 30)}...) with showConfirm`);
  }

  // Rule 4: Make functions async if they use await showConfirm
  if (modifiedContent.includes('await showConfirm') && !content.includes('await showConfirm')) {
    // Find function declarations that now need async
    const functionPattern = /(const\s+\w+\s*=\s*)\(([^)]*)\)\s*=>\s*\{/g;
    modifiedContent = modifiedContent.replace(functionPattern, '$1async ($2) => {');
    changes.push('Made function async due to await showConfirm');
  }

  // Rule 5: Replace console.log/error/warn with logInfo/logError/logWarning
  modifiedContent = modifiedContent.replace(
    /console\.log\(([^;]+)\);/g,
    (match, args) => {
      changes.push(`Replaced console.log with logInfo`);
      return `logInfo(${args});`;
    }
  );

  modifiedContent = modifiedContent.replace(
    /console\.error\(([^;]+)\);/g,
    (match, args) => {
      changes.push(`Replaced console.error with logError`);
      return `logError(${args});`;
    }
  );

  modifiedContent = modifiedContent.replace(
    /console\.warn\(([^;]+)\);/g,
    (match, args) => {
      changes.push(`Replaced console.warn with logWarning`);
      return `logWarning(${args});`;
    }
  );

  return {
    filePath,
    changed: content !== modifiedContent,
    changes,
  };
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('🔧 GLEC Admin Alert Refactor Script\n');
  console.log('Purpose: Replace alert/confirm/console with centralized utilities\n');

  const files = await findAdminFiles();
  const results: RefactorResult[] = [];

  for (const file of files) {
    const result = refactorFile(file);
    results.push(result);

    if (result.changed) {
      console.log(`✅ ${path.basename(result.filePath)}`);
      result.changes.forEach((change) => console.log(`   - ${change}`));
      console.log('');
    }
  }

  const changedFiles = results.filter((r) => r.changed);
  console.log(`\n📊 Summary:`);
  console.log(`   Total files: ${files.length}`);
  console.log(`   Changed files: ${changedFiles.length}`);
  console.log(`   Unchanged files: ${files.length - changedFiles.length}`);

  if (changedFiles.length > 0) {
    console.log(`\n⚠️  DRY RUN MODE - No files were modified`);
    console.log(`\n💡 To apply changes, uncomment the fs.writeFileSync() line in the script\n`);
  } else {
    console.log(`\n✅ No changes needed - all files already use centralized utilities\n`);
  }
}

main().catch((error) => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
