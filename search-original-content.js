const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

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

async function searchOriginalContent() {
  console.log('🔍 NEON DB 전체 검색 - 원본 GLEC 콘텐츠 찾기\n');
  console.log('='.repeat(80));

  try {
    // 1. 고유 블로그 제목 추출
    const uniqueBlogs = await sql`
      SELECT DISTINCT ON (title)
        id, title, excerpt, tags, content,
        created_at, updated_at
      FROM blogs
      ORDER BY title, created_at DESC
    `;

    console.log(`\n📝 고유 블로그 제목 (${uniqueBlogs.length}개):\n`);
    uniqueBlogs.forEach((b, i) => {
      console.log(`${i + 1}. ${b.title}`);
      if (b.excerpt) {
        const excerptPreview = b.excerpt.length > 100
          ? b.excerpt.substring(0, 100) + '...'
          : b.excerpt;
        console.log(`   요약: ${excerptPreview}`);
      }
      if (b.tags && b.tags.length > 0) {
        console.log(`   태그: ${b.tags.join(', ')}`);
      }
      const createdDate = new Date(b.created_at).toISOString().split('T')[0];
      console.log(`   생성일: ${createdDate}`);
      console.log('');
    });

    // 2. 고유 영상 제목 추출
    const uniqueVideos = await sql`
      SELECT DISTINCT ON (title)
        id, title, description, youtube_url, youtube_video_id,
        duration, created_at
      FROM videos
      ORDER BY title, created_at DESC
    `;

    console.log(`\n🎥 고유 영상 제목 (${uniqueVideos.length}개):\n`);
    uniqueVideos.forEach((v, i) => {
      console.log(`${i + 1}. ${v.title}`);
      if (v.description) {
        const descPreview = v.description.length > 100
          ? v.description.substring(0, 100) + '...'
          : v.description;
        console.log(`   설명: ${descPreview}`);
      }
      console.log(`   YouTube ID: ${v.youtube_video_id}`);
      console.log(`   전체 URL: ${v.youtube_url}`);
      console.log(`   재생시간: ${v.duration || 'N/A'}`);
      const createdDate = new Date(v.created_at).toISOString().split('T')[0];
      console.log(`   생성일: ${createdDate}`);
      console.log('');
    });

    // 3. 고유 자료실 항목 추출
    const uniqueLibraries = await sql`
      SELECT DISTINCT ON (title)
        id, title, description, file_url, file_type,
        category, tags, created_at
      FROM libraries
      ORDER BY title, created_at DESC
    `;

    console.log(`\n📖 고유 자료실 항목 (${uniqueLibraries.length}개):\n`);
    uniqueLibraries.forEach((l, i) => {
      console.log(`${i + 1}. ${l.title}`);
      if (l.description) {
        const descPreview = l.description.length > 100
          ? l.description.substring(0, 100) + '...'
          : l.description;
        console.log(`   설명: ${descPreview}`);
      }
      console.log(`   파일 타입: ${l.file_type}`);
      console.log(`   카테고리: ${l.category}`);
      console.log(`   파일 URL: ${l.file_url}`);
      if (l.tags && l.tags.length > 0) {
        console.log(`   태그: ${l.tags.join(', ')}`);
      }
      console.log('');
    });

    // 4. 고유 보도자료 제목 추출
    const uniquePresses = await sql`
      SELECT DISTINCT ON (title)
        id, title, content, excerpt, media_outlet, external_url,
        created_at
      FROM presses
      ORDER BY title, created_at DESC
    `;

    console.log(`\n📰 고유 보도자료 제목 (${uniquePresses.length}개):\n`);
    uniquePresses.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   언론사: ${p.media_outlet || 'N/A'}`);
      if (p.external_url) {
        console.log(`   원문 링크: ${p.external_url}`);
      }
      if (p.excerpt) {
        const excerptPreview = p.excerpt.length > 100
          ? p.excerpt.substring(0, 100) + '...'
          : p.excerpt;
        console.log(`   요약: ${excerptPreview}`);
      } else if (p.content) {
        const contentPreview = p.content.length > 100
          ? p.content.substring(0, 100) + '...'
          : p.content;
        console.log(`   내용: ${contentPreview}`);
      }
      const createdDate = new Date(p.created_at).toISOString().split('T')[0];
      console.log(`   생성일: ${createdDate}`);
      console.log('');
    });

    // 5. 모든 팝업 추출
    const allPopups = await sql`
      SELECT id, title, content, image_url, link_url,
             display_type, is_active, created_at
      FROM popups
      ORDER BY created_at DESC
    `;

    console.log(`\n🔔 팝업 (${allPopups.length}개):\n`);
    allPopups.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      if (p.content) {
        const contentPreview = p.content.length > 80
          ? p.content.substring(0, 80) + '...'
          : p.content;
        console.log(`   내용: ${contentPreview}`);
      }
      if (p.link_url) {
        console.log(`   링크: ${p.link_url}`);
      }
      if (p.image_url) {
        console.log(`   이미지: ${p.image_url}`);
      }
      console.log(`   타입: ${p.display_type} | 활성: ${p.is_active}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n📊 요약:\n');
    console.log(`   고유 블로그: ${uniqueBlogs.length}개`);
    console.log(`   고유 영상: ${uniqueVideos.length}개`);
    console.log(`   고유 자료실: ${uniqueLibraries.length}개`);
    console.log(`   고유 보도자료: ${uniquePresses.length}개`);
    console.log(`   팝업: ${allPopups.length}개`);
    console.log(`   총 고유 콘텐츠: ${uniqueBlogs.length + uniqueVideos.length + uniqueLibraries.length + uniquePresses.length + allPopups.length}개`);

  } catch (err) {
    console.error('❌ 오류:', err.message);
    console.error(err);
  }
}

searchOriginalContent();
