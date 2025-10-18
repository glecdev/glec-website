/**
 * Verify File Upload Database Update
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function verifyUpload() {
  console.log('🔍 Verifying file upload database update...\n');

  try {
    // Get the most recent library item
    const items = await sql`
      SELECT
        id,
        title,
        file_url,
        file_type,
        file_size_mb,
        download_type,
        status,
        created_at,
        updated_at
      FROM library_items
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (items.length === 0) {
      console.log('❌ No library items found');
      return;
    }

    const item = items[0];

    console.log('✅ Latest Library Item:');
    console.log(`   ID: ${item.id}`);
    console.log(`   Title: ${item.title}`);
    console.log(`   File URL: ${item.file_url}`);
    console.log(`   File Type: ${item.file_type}`);
    console.log(`   File Size: ${item.file_size_mb} MB`);
    console.log(`   Download Type: ${item.download_type}`);
    console.log(`   Status: ${item.status}`);
    console.log(`   Created: ${item.created_at}`);
    console.log(`   Updated: ${item.updated_at}`);

    // Verify file URL points to local file
    if (item.file_url.startsWith('/library/')) {
      console.log('\n✅ File URL is local (starts with /library/)');
    } else {
      console.log('\n⚠️  File URL is not local');
    }

    // Verify download type is DIRECT
    if (item.download_type === 'DIRECT') {
      console.log('✅ Download type is DIRECT');
    } else {
      console.log(`⚠️  Download type is ${item.download_type}, expected DIRECT`);
    }

    // Verify file size was calculated
    if (item.file_size_mb > 0) {
      console.log(`✅ File size calculated: ${item.file_size_mb} MB`);
    } else {
      console.log('⚠️  File size is 0 or null');
    }

    console.log('\n🎉 Database verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyUpload();
