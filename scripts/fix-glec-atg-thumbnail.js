const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixThumbnail() {
  console.log('Fixing GLEC ATG thumbnail...\n');

  const result = await sql`
    UPDATE videos
    SET thumbnail_url = 'https://img.youtube.com/vi/' || youtube_video_id || '/hqdefault.jpg'
    WHERE title = 'GLEC ATG(AI TACHOGRAPH)'
    RETURNING id, title, youtube_video_id, thumbnail_url
  `;

  console.log('✅ Fixed thumbnail:');
  result.forEach(row => {
    console.log(`  - ${row.title}`);
    console.log(`    Video ID: ${row.youtube_video_id}`);
    console.log(`    Thumbnail: ${row.thumbnail_url}`);
  });
}

fixThumbnail().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
