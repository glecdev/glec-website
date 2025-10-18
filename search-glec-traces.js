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

async function searchGLECTraces() {
  console.log('🔍 GLEC 원본 콘텐츠 흔적 검색\n');
  console.log('='.repeat(80));

  try {
    // 1. 실제 GLEC YouTube 영상 검색 (dQw4w9WgXcQ가 아닌 것)
    console.log('\n📹 YouTube 영상 분석:\n');
    const videos = await sql`
      SELECT id, title, youtube_url, youtube_video_id, created_at
      FROM videos
      ORDER BY created_at DESC
    `;

    const realGLECVideos = videos.filter(v =>
      v.youtube_video_id !== 'dQw4w9WgXcQ' &&
      v.youtube_video_id !== 'unknown'
    );

    const fakeVideos = videos.filter(v =>
      v.youtube_video_id === 'dQw4w9WgXcQ'
    );

    console.log(`   총 영상: ${videos.length}개`);
    console.log(`   실제 GLEC 영상: ${realGLECVideos.length}개`);
    console.log(`   샘플 영상 (Rick Astley): ${fakeVideos.length}개\n`);

    if (realGLECVideos.length > 0) {
      console.log('   ✅ 실제 GLEC YouTube 영상 발견:\n');
      realGLECVideos.forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.title}`);
        console.log(`      YouTube ID: ${v.youtube_video_id}`);
        console.log(`      URL: ${v.youtube_url}`);
        console.log(`      생성일: ${new Date(v.created_at).toISOString().split('T')[0]}\n`);
      });
    } else {
      console.log('   ❌ 실제 GLEC YouTube 영상 없음 (모두 샘플 데이터)\n');
    }

    // 2. 실제 GLEC 보도자료 검색 (external_url 포함)
    console.log('\n📰 보도자료 분석:\n');
    const presses = await sql`
      SELECT id, title, media_outlet, external_url, created_at
      FROM presses
      WHERE external_url IS NOT NULL
      ORDER BY created_at DESC
    `;

    console.log(`   실제 외부 링크가 있는 보도자료: ${presses.length}개\n`);

    if (presses.length > 0) {
      console.log('   ✅ 외부 링크 보도자료:\n');
      presses.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title}`);
        console.log(`      언론사: ${p.media_outlet || 'N/A'}`);
        console.log(`      링크: ${p.external_url}`);
        console.log(`      생성일: ${new Date(p.created_at).toISOString().split('T')[0]}\n`);
      });
    } else {
      console.log('   ❌ 외부 링크가 있는 보도자료 없음\n');
    }

    // 3. 실제 GLEC 블로그 검색 (content에 특정 키워드)
    console.log('\n📝 블로그 분석:\n');
    const blogs = await sql`
      SELECT id, title, excerpt,
             LENGTH(content) as content_length,
             created_at
      FROM blogs
      ORDER BY created_at DESC
    `;

    console.log(`   총 블로그: ${blogs.length}개\n`);

    // 긴 콘텐츠는 실제 작성된 것일 가능성
    const longBlogs = blogs.filter(b => b.content_length > 5000);
    const shortBlogs = blogs.filter(b => b.content_length <= 5000);

    console.log(`   긴 콘텐츠 (5000자 이상): ${longBlogs.length}개`);
    console.log(`   짧은 콘텐츠 (5000자 이하): ${shortBlogs.length}개\n`);

    if (longBlogs.length > 0) {
      console.log('   긴 콘텐츠 블로그 (실제 작성 가능성):\n');
      longBlogs.forEach((b, i) => {
        console.log(`   ${i + 1}. ${b.title}`);
        console.log(`      글자 수: ${b.content_length}자`);
        console.log(`      생성일: ${new Date(b.created_at).toISOString().split('T')[0]}\n`);
      });
    }

    // 4. 자료실 분석 (실제 파일 vs 가짜 URL)
    console.log('\n📚 자료실 분석:\n');
    const libraries = await sql`
      SELECT id, title, file_url, file_size, category, created_at
      FROM libraries
      ORDER BY created_at DESC
    `;

    const realFiles = libraries.filter(l =>
      l.file_url &&
      (l.file_url.startsWith('/library/') ||
       l.file_url.includes('glec.io') ||
       l.file_url.includes('r2.dev'))
    );

    const fakeFiles = libraries.filter(l =>
      !l.file_url ||
      l.file_url.includes('storage.glec.io')
    );

    console.log(`   총 자료실 항목: ${libraries.length}개`);
    console.log(`   실제 파일 경로: ${realFiles.length}개`);
    console.log(`   가짜/없는 파일: ${fakeFiles.length}개\n`);

    if (realFiles.length > 0) {
      console.log('   ✅ 실제 파일 경로:\n');
      realFiles.forEach((l, i) => {
        console.log(`   ${i + 1}. ${l.title}`);
        console.log(`      파일: ${l.file_url}`);
        console.log(`      크기: ${l.file_size || 'N/A'}`);
        console.log(`      생성일: ${new Date(l.created_at).toISOString().split('T')[0]}\n`);
      });
    }

    // 5. 생성 날짜 분포 분석
    console.log('\n📅 생성 날짜 분포:\n');

    const allContent = [
      ...blogs.map(b => ({ type: 'blog', created_at: b.created_at })),
      ...videos.map(v => ({ type: 'video', created_at: v.created_at })),
      ...presses.map(p => ({ type: 'press', created_at: p.created_at })),
      ...libraries.map(l => ({ type: 'library', created_at: l.created_at }))
    ];

    const dateGroups = {};
    allContent.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!dateGroups[date]) {
        dateGroups[date] = { blog: 0, video: 0, press: 0, library: 0, total: 0 };
      }
      dateGroups[date][item.type]++;
      dateGroups[date].total++;
    });

    const sortedDates = Object.keys(dateGroups).sort().reverse();

    console.log('   날짜별 생성 건수:\n');
    sortedDates.forEach(date => {
      const group = dateGroups[date];
      console.log(`   ${date}: ${group.total}개`);
      console.log(`      - 블로그: ${group.blog}개, 영상: ${group.video}개, 보도: ${group.press}개, 자료: ${group.library}개`);
    });

    // 6. 최종 판정
    console.log('\n' + '='.repeat(80));
    console.log('\n🔎 최종 분석:\n');

    const hasRealGLECContent =
      realGLECVideos.length > 0 ||
      presses.filter(p => p.external_url && !p.external_url.includes('example.com')).length > 0 ||
      longBlogs.length > 5;

    if (hasRealGLECContent) {
      console.log('✅ **실제 GLEC 원본 콘텐츠 흔적 발견**');
      console.log('   - 현재 DB에 일부 원본 콘텐츠가 남아있을 가능성 있음');
    } else {
      console.log('❌ **실제 GLEC 원본 콘텐츠 흔적 없음**');
      console.log('   - 현재 DB의 모든 콘텐츠는 샘플 데이터로 판단됨');
      console.log('   - 2025-10-04 Prisma 마이그레이션 시 기존 콘텐츠가 삭제되었을 가능성');
    }

    console.log('\n📌 복구 옵션:');
    console.log('   1. Neon 데이터베이스 브랜치 히스토리 확인 (Neon Console)');
    console.log('   2. GLEC 공식 블로그/YouTube/보도자료에서 재수집');
    console.log('   3. Git 히스토리에서 seed 스크립트 확인');

  } catch (err) {
    console.error('❌ 오류:', err.message);
    console.error(err);
  }
}

searchGLECTraces();
