const fs = require('fs');

const filePath = 'app/api/admin/events/route.ts';

let content = fs.readFileSync(filePath, 'utf-8');

// Fix 1: Add crypto import after neon import (around line 19)
const oldImports = `import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);`;

const newImports = `import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);`;

content = content.replace(oldImports, newImports);

// Fix 2: Add UUID generation before INSERT (after line 273)
const oldInsertPrep = `      // Insert event (Neon Tagged Template Literals)
      const now = new Date();
      const publishedAt = validated.status === 'PUBLISHED' ? now : null;

      const result = await sql\`
        INSERT INTO events (
          title, slug, description, status, start_date, end_date,
          location, location_details, thumbnail_url, max_participants,
          published_at, author_id, created_at, updated_at
        )
        VALUES (
          \${validated.title},`;

const newInsertPrep = `      // Insert event (Neon Tagged Template Literals)
      const now = new Date();
      const publishedAt = validated.status === 'PUBLISHED' ? now : null;

      // Generate UUID for new event
      const newId = crypto.randomUUID();

      const result = await sql\`
        INSERT INTO events (
          id,
          title, slug, description, status, start_date, end_date,
          location, location_details, thumbnail_url, max_participants,
          published_at, author_id, created_at, updated_at
        )
        VALUES (
          \${newId},
          \${validated.title},`;

content = content.replace(oldInsertPrep, newInsertPrep);

fs.writeFileSync(filePath, content, 'utf-8');

console.log('✅ Fixed Events API:');
console.log('   1. Added crypto import');
console.log('   2. Added UUID generation: const newId = crypto.randomUUID()');
console.log('   3. Added id column to INSERT statement');
console.log('   4. Added ${newId} value to INSERT VALUES');
