/**
 * Check current library items in database
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkLibraryItems() {
  // First check schema
  const columns = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'library_items'
    ORDER BY ordinal_position
  `;

  console.log('📋 library_items columns:');
  columns.forEach(c => console.log(`   - ${c.column_name}`));
  console.log('');

  const items = await sql`
    SELECT *
    FROM library_items
    ORDER BY created_at DESC
  `;

  console.log('📚 Current Library Items:');
  console.log('Total:', items.length);
  console.log('');

  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   Type: ${item.file_type || 'N/A'}`);
    console.log(`   File: ${item.file_url || 'No file'}`);
    console.log(`   Created: ${item.created_at}`);
    console.log(`   ID: ${item.id}`);
    console.log('');
  });
}

checkLibraryItems();
