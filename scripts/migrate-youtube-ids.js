/**
 * YouTube Video ID Migration Script
 *
 * Purpose: Fix incorrect youtube_video_id extraction
 * Root Cause: Old regex pattern failed to handle ?si= share parameters
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('=== YouTube Video ID Migration ===\n');

  // Step 1: Identify affected rows
  console.log('Step 1: Identifying affected rows...');
  const affectedRows = await sql`
    SELECT
      id,
      title,
      youtube_url,
      youtube_video_id AS current_id
    FROM videos
    WHERE
      (LENGTH(youtube_video_id) > 11 OR youtube_video_id ~ '[?&=]')
      OR youtube_video_id = 'unknown'
  `;

  console.log(`Found ${affectedRows.length} rows to update:\n`);
  affectedRows.forEach(row => {
    const url = row.youtube_url;
    let correctId = row.current_id;

    // Extract correct ID using URL parsing
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        correctId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
        correctId = urlObj.searchParams.get('v') || correctId;
      } else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
        correctId = urlObj.pathname.slice(7);
      }
    } catch (err) {
      console.warn(`  ! Failed to parse URL: ${url}`);
    }

    console.log(`  - ${row.title}`);
    console.log(`    Current: ${row.current_id}`);
    console.log(`    Correct: ${correctId}\n`);
  });

  if (affectedRows.length === 0) {
    console.log('✅ No rows need migration. Exiting.');
    return;
  }

  // Step 2: Update each row individually
  console.log('Step 2: Updating youtube_video_id...');
  for (const row of affectedRows) {
    const url = row.youtube_url;
    let correctId = row.current_id;

    // Extract correct ID
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'youtu.be') {
        correctId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
        correctId = urlObj.searchParams.get('v') || correctId;
      } else if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
        correctId = urlObj.pathname.slice(7);
      }

      // Update database
      await sql`
        UPDATE videos
        SET
          youtube_video_id = ${correctId},
          updated_at = NOW()
        WHERE id = ${row.id}
      `;

      console.log(`  ✅ Updated: ${row.title} → ${correctId}`);
    } catch (err) {
      console.error(`  ❌ Failed to update ${row.title}:`, err.message);
    }
  }

  // Step 3: Update thumbnail URLs
  console.log('\nStep 3: Updating thumbnail URLs...');
  const thumbnailResult = await sql`
    UPDATE videos
    SET
      thumbnail_url = 'https://img.youtube.com/vi/' || youtube_video_id || '/hqdefault.jpg',
      updated_at = NOW()
    WHERE
      thumbnail_url LIKE 'https://img.youtube.com/vi/%'
    RETURNING id, title, thumbnail_url
  `;
  console.log(`✅ Updated ${thumbnailResult.length} thumbnail URLs.\n`);

  // Step 4: Verify results
  console.log('Step 4: Verifying results...');
  const verified = await sql`
    SELECT
      id,
      title,
      youtube_url,
      youtube_video_id,
      thumbnail_url,
      updated_at
    FROM videos
    ORDER BY updated_at DESC
    LIMIT 10
  `;

  console.log('Recent updates:');
  verified.forEach(row => {
    const idLength = row.youtube_video_id.length;
    const isValid = idLength === 11 && !/[?&=]/.test(row.youtube_video_id);
    const icon = isValid ? '✅' : '⚠️';

    console.log(`  ${icon} ${row.title}`);
    console.log(`     Video ID: ${row.youtube_video_id} (${idLength} chars)`);
    console.log(`     Thumbnail: ${row.thumbnail_url}\n`);
  });

  console.log('=== Migration Complete ===');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
