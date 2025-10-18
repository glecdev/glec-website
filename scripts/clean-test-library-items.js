/**
 * Delete test library items (fake URLs)
 * Keep only real items like GLEC Framework v3.0
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function cleanTestItems() {
  console.log('🧹 Deleting test library items...\n');

  // Delete items with fake storage.glec.io URLs
  const deleted = await sql`
    DELETE FROM library_items
    WHERE file_url LIKE 'https://storage.glec.io/%'
    RETURNING id, title
  `;

  console.log(`✅ Deleted ${deleted.length} test items:\n`);
  deleted.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   ID: ${item.id}`);
  });

  console.log('\n📚 Remaining library items:');
  const remaining = await sql`
    SELECT id, title, file_url
    FROM library_items
    ORDER BY created_at DESC
  `;

  console.log(`Total: ${remaining.length}\n`);
  remaining.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   File: ${item.file_url}`);
    console.log('');
  });
}

cleanTestItems();
