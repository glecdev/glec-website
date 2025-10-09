const fs = require('fs');

const filePath = 'app/api/admin/popups/route.ts';

let content = fs.readFileSync(filePath, 'utf-8');

// Step 1: Add crypto import after neon import (around line 14)
const oldImports = `import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import type { PopupDisplayType } from '@prisma/client';

const sql = neon(process.env.DATABASE_URL!);`;

const newImports = `import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import type { PopupDisplayType } from '@prisma/client';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);`;

content = content.replace(oldImports, newImports);

// Step 2: Add UUID generation and id column to INSERT
const oldInsert = `      const input = validation.data;

      // Insert popup
      const result = await sql\`
        INSERT INTO popups (
          title, content, image_url, link_url, display_type,
          is_active, start_date, end_date, z_index, show_once_per_day,
          position, size, background_color, created_at, updated_at
        ) VALUES (
          \${input.title},`;

const newInsert = `      const input = validation.data;

      // Generate UUID for new popup
      const newId = crypto.randomUUID();

      // Insert popup
      const result = await sql\`
        INSERT INTO popups (
          id,
          title, content, image_url, link_url, display_type,
          is_active, start_date, end_date, z_index, show_once_per_day,
          position, size, background_color, created_at, updated_at
        ) VALUES (
          \${newId},
          \${input.title},`;

content = content.replace(oldInsert, newInsert);

fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ Fixed Popups API UUID generation:');
console.log('   1. Added crypto import');
console.log('   2. Added const newId = crypto.randomUUID()');
console.log('   3. Added id column to INSERT statement');
console.log('   4. Added ${newId} value to INSERT VALUES');
