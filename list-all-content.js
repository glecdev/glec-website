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

async function listAllContent() {
  console.log('📚 현재 데이터베이스에 저장된 콘텐츠 목록\n');
  console.log('='.repeat(80));

  // Blogs
  console.log('\n📝 블로그 (Blogs):\n');
  const blogs = await sql`
    SELECT id, title, status, published_at, created_at
    FROM blogs
    ORDER BY created_at DESC
  `;
  blogs.forEach((b, i) => {
    const createdDate = new Date(b.created_at).toISOString().split('T')[0];
    console.log(`${i+1}. ${b.title}`);
    console.log(`   상태: ${b.status} | 생성일: ${createdDate}`);
  });
  console.log(`\n   총 ${blogs.length}개`);

  // Videos
  console.log('\n\n🎥 영상 (Videos):\n');
  const videos = await sql`
    SELECT id, title, youtube_url, status, created_at
    FROM videos
    ORDER BY created_at DESC
  `;
  videos.forEach((v, i) => {
    const createdDate = new Date(v.created_at).toISOString().split('T')[0];
    console.log(`${i+1}. ${v.title}`);
    console.log(`   YouTube: ${v.youtube_url}`);
    console.log(`   생성일: ${createdDate}`);
  });
  console.log(`\n   총 ${videos.length}개`);

  // Libraries
  console.log('\n\n📖 자료실 (Libraries):\n');
  const libraries = await sql`
    SELECT id, title, file_type, category, created_at
    FROM libraries
    ORDER BY created_at DESC
  `;
  libraries.forEach((l, i) => {
    const createdDate = new Date(l.created_at).toISOString().split('T')[0];
    console.log(`${i+1}. ${l.title}`);
    console.log(`   타입: ${l.file_type} | 카테고리: ${l.category} | 생성일: ${createdDate}`);
  });
  console.log(`\n   총 ${libraries.length}개`);

  // Notices
  console.log('\n\n📢 공지사항 (Notices):\n');
  const notices = await sql`
    SELECT id, title, category, status, created_at
    FROM notices
    ORDER BY created_at DESC
  `;
  notices.forEach((n, i) => {
    const createdDate = new Date(n.created_at).toISOString().split('T')[0];
    console.log(`${i+1}. ${n.title}`);
    console.log(`   카테고리: ${n.category} | 생성일: ${createdDate}`);
  });
  console.log(`\n   총 ${notices.length}개`);

  // Events
  console.log('\n\n🎉 이벤트 (Events):\n');
  const events = await sql`
    SELECT id, title, status, start_date, end_date, created_at
    FROM events
    ORDER BY created_at DESC
  `;
  events.forEach((e, i) => {
    const startDate = new Date(e.start_date).toISOString().split('T')[0];
    const endDate = new Date(e.end_date).toISOString().split('T')[0];
    console.log(`${i+1}. ${e.title}`);
    console.log(`   기간: ${startDate} ~ ${endDate}`);
  });
  console.log(`\n   총 ${events.length}개`);

  // Presses
  console.log('\n\n📰 보도자료 (Presses):\n');
  const presses = await sql`
    SELECT id, title, media_outlet, status, created_at
    FROM presses
    ORDER BY created_at DESC
  `;
  presses.forEach((p, i) => {
    const createdDate = new Date(p.created_at).toISOString().split('T')[0];
    console.log(`${i+1}. ${p.title}`);
    console.log(`   언론사: ${p.media_outlet || 'N/A'} | 생성일: ${createdDate}`);
  });
  console.log(`\n   총 ${presses.length}개`);

  // Popups
  console.log('\n\n🔔 팝업 (Popups):\n');
  const popups = await sql`
    SELECT id, title, display_type, is_active, created_at
    FROM popups
    ORDER BY created_at DESC
  `;
  popups.forEach((p, i) => {
    const createdDate = new Date(p.created_at).toISOString().split('T')[0];
    console.log(`${i+1}. ${p.title}`);
    console.log(`   타입: ${p.display_type} | 활성: ${p.is_active} | 생성일: ${createdDate}`);
  });
  console.log(`\n   총 ${popups.length}개`);

  console.log('\n' + '='.repeat(80));

  const total = blogs.length + videos.length + libraries.length +
                notices.length + events.length + presses.length + popups.length;
  console.log(`\n📊 전체 콘텐츠: ${total}개`);
}

listAllContent().catch(err => {
  console.error('❌ 오류:', err.message);
});
