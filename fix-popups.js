const fs = require('fs');

const filePath = 'app/api/admin/popups/route.ts';

let content = fs.readFileSync(filePath, 'utf-8');

// Fix line 28: Change enum to lowercase to match database enum
const oldLine = "  displayType: z.enum(['MODAL', 'BANNER', 'CORNER']).default('MODAL'),";
const newLine = "  displayType: z.enum(['modal', 'banner', 'corner']).default('modal'),";

content = content.replace(oldLine, newLine);

fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ Fixed Popups API schema: displayType enum changed to lowercase');
console.log('   Old: z.enum([\'MODAL\', \'BANNER\', \'CORNER\']).default(\'MODAL\')');
console.log('   New: z.enum([\'modal\', \'banner\', \'corner\']).default(\'modal\')');
