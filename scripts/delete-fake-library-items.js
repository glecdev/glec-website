/**
 * Delete library items with non-existent files (fake storage.glec.io URLs)
 * Keep only GLEC Framework v3.0 with real file
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function deleteFakeItems() {
  console.log('🧹 Deleting library items with non-existent files...\n');

  // Delete items with fake storage.glec.io URLs
  const deleted = await sql`
    DELETE FROM library_items
    WHERE file_url LIKE 'https://storage.glec.io/%'
    RETURNING id, title, file_url
  `;

  console.log(`✅ Deleted ${deleted.length} items with fake URLs:\n`);
  deleted.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   File URL: ${item.file_url}`);
    console.log(`   ID: ${item.id}`);
    console.log('');
  });

  console.log('📚 Remaining library items (with real files):');
  const remaining = await sql`
    SELECT id, title, file_url, file_type, file_size_mb
    FROM library_items
    ORDER BY created_at DESC
  `;

  console.log(`Total: ${remaining.length}\n`);
  remaining.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   Type: ${item.file_type}`);
    console.log(`   Size: ${item.file_size_mb} MB`);
    console.log(`   File: ${item.file_url}`);
    console.log('');
  });

  console.log('✨ Cleanup complete!');
  console.log('📋 Ready for Admin UI testing');
}

deleteFakeItems();
