const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = envContent.split('\n').filter(line => line && !line.startsWith('#'));
  envVars.forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      const value = values.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

const sql = neon(process.env.DATABASE_URL);
const authorId = '9196bdb3-a5ff-40b0-8296-bc1efa863049'; // GLEC Administrator

function extractYouTubeID(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : 'unknown';
}

function slugify(text) {
  const baseSlug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 90);

  // Add short UUID to avoid duplicates
  const uniqueId = randomUUID().substring(0, 8);
  return `${baseSlug}-${uniqueId}`;
}

async function restoreGLECVideos() {
  console.log('📹 GLEC YouTube 영상 복구 시작\n');
  console.log('='.repeat(80));

  try {
    // Load videos JSON
    const videosPath = path.join(__dirname, 'data', 'youtube-videos-enriched.json');
    const videos = JSON.parse(fs.readFileSync(videosPath, 'utf-8'));

    console.log(`\n📊 총 ${videos.length}개 영상 발견\n`);

    let importCount = 0;
    let skipCount = 0;

    for (const video of videos) { // 전체 88개 복구
      const youtubeID = extractYouTubeID(video.videoUrl);

      // 중복 확인
      const existing = await sql`
        SELECT id FROM videos WHERE youtube_video_id = ${youtubeID}
      `;

      if (existing.length > 0) {
        skipCount++;
        continue;
      }

      const slug = slugify(video.title);
      const description = video.description === '이 영상에 대한 설명이 없습니다.'
        ? `${video.title}에 대한 영상입니다. GLEC의 물류 탄소배출 측정 및 관리 솔루션에 대해 자세히 알아보세요.`
        : video.description;

      await sql`
        INSERT INTO videos (
          id,
          title,
          slug,
          description,
          youtube_url,
          youtube_video_id,
          thumbnail_url,
          channel_name,
          duration,
          view_count,
          status,
          tab,
          published_at,
          author_id,
          created_at,
          updated_at
        ) VALUES (
          ${randomUUID()},
          ${video.title},
          ${slug},
          ${description},
          ${video.videoUrl},
          ${youtubeID},
          ${video.thumbnailUrl},
          'GLEC Official',
          ${video.duration || 'Unknown'},
          ${video.viewCount || 0},
          'PUBLISHED',
          '전체',
          NOW(),
          ${authorId},
          NOW(),
          NOW()
        )
      `;

      importCount++;
      if (importCount % 10 === 0 || importCount === videos.length) {
        console.log(`   ✅ [${importCount}/${videos.length}] ${video.title.substring(0, 60)}...`);
      }
    }

    // 최종 확인
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 복구 결과\n');

    const result = await sql`
      SELECT COUNT(*) as total FROM videos
    `;

    console.log(`   총 영상: ${result[0].total}개`);
    console.log(`   복구됨: ${importCount}개`);
    console.log(`   스킵됨: ${skipCount}개`);

    // 제목 목록
    const allVideos = await sql`
      SELECT title, youtube_video_id
      FROM videos
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\n   최근 복구된 영상:\n');
    allVideos.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.title.substring(0, 70)}...`);
      console.log(`      YouTube ID: ${v.youtube_video_id}\n`);
    });

    console.log('='.repeat(80));
    console.log('\n✅ GLEC YouTube 영상 복구 완료!\n');

  } catch (err) {
    console.error('❌ 오류:', err.message);
    console.error(err);
  }
}

restoreGLECVideos();
