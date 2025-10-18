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

async function cleanupDuplicates() {
  console.log('🧹 GLEC 중복 데이터 정리 시작\n');
  console.log('='.repeat(80));

  try {
    // 1단계: 현재 중복 상태 확인
    console.log('\n📊 1단계: 현재 중복 상태 확인\n');

    const blogDuplicates = await sql`
      SELECT title, COUNT(*) as duplicates
      FROM blogs
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY duplicates DESC
    `;

    const videoDuplicates = await sql`
      SELECT title, COUNT(*) as duplicates
      FROM videos
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY duplicates DESC
    `;

    const libraryDuplicates = await sql`
      SELECT title, COUNT(*) as duplicates
      FROM libraries
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY duplicates DESC
    `;

    const pressDuplicates = await sql`
      SELECT title, COUNT(*) as duplicates
      FROM presses
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY duplicates DESC
    `;

    console.log(`   블로그 중복: ${blogDuplicates.length}개 제목`);
    if (blogDuplicates.length > 0) {
      blogDuplicates.forEach(d => console.log(`      - ${d.title}: ${d.duplicates}개`));
    }

    console.log(`\n   영상 중복: ${videoDuplicates.length}개 제목`);
    if (videoDuplicates.length > 0) {
      videoDuplicates.forEach(d => console.log(`      - ${d.title}: ${d.duplicates}개`));
    }

    console.log(`\n   자료실 중복: ${libraryDuplicates.length}개 제목`);
    if (libraryDuplicates.length > 0) {
      libraryDuplicates.forEach(d => console.log(`      - ${d.title}: ${d.duplicates}개`));
    }

    console.log(`\n   보도자료 중복: ${pressDuplicates.length}개 제목`);
    if (pressDuplicates.length > 0) {
      pressDuplicates.forEach(d => console.log(`      - ${d.title}: ${d.duplicates}개`));
    }

    // 2단계: 중복 제거 (가장 최신 1개만 유지)
    console.log('\n' + '='.repeat(80));
    console.log('\n🗑️  2단계: 중복 제거 (가장 최신 1개만 유지)\n');

    // 블로그 중복 제거
    const blogDeleted = await sql`
      WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
        FROM blogs
      )
      DELETE FROM blogs
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
    `;

    console.log(`   ✅ 블로그 중복 제거: ${blogDeleted.length || blogDeleted.count || 0}개 삭제`);

    // 영상 중복 제거
    const videoDeleted = await sql`
      WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
        FROM videos
      )
      DELETE FROM videos
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
    `;

    console.log(`   ✅ 영상 중복 제거: ${videoDeleted.length || videoDeleted.count || 0}개 삭제`);

    // 자료실 중복 제거
    const libraryDeleted = await sql`
      WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
        FROM libraries
      )
      DELETE FROM libraries
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
    `;

    console.log(`   ✅ 자료실 중복 제거: ${libraryDeleted.length || libraryDeleted.count || 0}개 삭제`);

    // 보도자료 중복 제거
    const pressDeleted = await sql`
      WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
        FROM presses
      )
      DELETE FROM presses
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
    `;

    console.log(`   ✅ 보도자료 중복 제거: ${pressDeleted.length || pressDeleted.count || 0}개 삭제`);

    // 공지사항 중복 제거
    const noticeDeleted = await sql`
      WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
        FROM notices
      )
      DELETE FROM notices
      WHERE id IN (
        SELECT id FROM duplicates WHERE rn > 1
      )
    `;

    console.log(`   ✅ 공지사항 중복 제거: ${noticeDeleted.length || noticeDeleted.count || 0}개 삭제`);

    // 3단계: 샘플 데이터 제거
    console.log('\n' + '='.repeat(80));
    console.log('\n🧼 3단계: 샘플 데이터 제거\n');

    // Rick Astley 영상 삭제
    const fakeVideoDeleted = await sql`
      DELETE FROM videos WHERE youtube_video_id = 'dQw4w9WgXcQ'
    `;

    console.log(`   ✅ Rick Astley 샘플 영상 삭제: ${fakeVideoDeleted.length || fakeVideoDeleted.count || 0}개`);

    // storage.glec.io 가짜 URL 자료실 삭제
    const fakeLibraryDeleted = await sql`
      DELETE FROM libraries WHERE file_url LIKE '%storage.glec.io%'
    `;

    console.log(`   ✅ 가짜 URL 자료실 삭제: ${fakeLibraryDeleted.length || fakeLibraryDeleted.count || 0}개`);

    // 외부 링크가 없는 보도자료 삭제
    const emptyPressDeleted = await sql`
      DELETE FROM presses WHERE external_url IS NULL OR external_url = ''
    `;

    console.log(`   ✅ 외부 링크 없는 보도자료 삭제: ${emptyPressDeleted.length || emptyPressDeleted.count || 0}개`);

    // 4단계: 정리 후 확인
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 4단계: 정리 후 최종 확인\n');

    const finalCounts = await sql`
      SELECT
        (SELECT COUNT(*) FROM blogs) as blogs,
        (SELECT COUNT(*) FROM videos) as videos,
        (SELECT COUNT(*) FROM libraries) as libraries,
        (SELECT COUNT(*) FROM presses) as presses,
        (SELECT COUNT(*) FROM notices) as notices
    `;

    console.log('   최종 콘텐츠 개수:');
    console.log(`      - 블로그: ${finalCounts[0].blogs}개`);
    console.log(`      - 영상: ${finalCounts[0].videos}개`);
    console.log(`      - 자료실: ${finalCounts[0].libraries}개`);
    console.log(`      - 보도자료: ${finalCounts[0].presses}개`);
    console.log(`      - 공지사항: ${finalCounts[0].notices}개`);

    // 중복 재확인
    const duplicateCheck = await sql`
      SELECT
        'blogs' as table_name,
        COUNT(*) - COUNT(DISTINCT title) as duplicates
      FROM blogs
      UNION ALL
      SELECT 'videos', COUNT(*) - COUNT(DISTINCT title) FROM videos
      UNION ALL
      SELECT 'libraries', COUNT(*) - COUNT(DISTINCT title) FROM libraries
      UNION ALL
      SELECT 'presses', COUNT(*) - COUNT(DISTINCT title) FROM presses
    `;

    console.log('\n   중복 여부 재확인:');
    duplicateCheck.forEach(d => {
      const status = d.duplicates === 0 || d.duplicates === '0' ? '✅' : '❌';
      console.log(`      ${status} ${d.table_name}: ${d.duplicates}개 중복`);
    });

    // 실제 GLEC 콘텐츠 확인
    const realContent = await sql`
      SELECT
        'videos' as type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE youtube_video_id != 'dQw4w9WgXcQ') as real_glec
      FROM videos
      UNION ALL
      SELECT
        'libraries',
        COUNT(*),
        COUNT(*) FILTER (WHERE file_url NOT LIKE '%storage.glec.io%')
      FROM libraries
      UNION ALL
      SELECT
        'presses',
        COUNT(*),
        COUNT(*) FILTER (WHERE external_url IS NOT NULL AND external_url != '')
      FROM presses
    `;

    console.log('\n   실제 GLEC 콘텐츠 개수:');
    realContent.forEach(r => {
      const status = r.real_glec > 0 ? '✅' : '❌';
      console.log(`      ${status} ${r.type}: ${r.real_glec}개 / ${r.total}개 (실제/전체)`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ 정리 완료!\n');

    const totalReal = realContent.reduce((sum, r) => sum + parseInt(r.real_glec), 0);

    if (totalReal === 0) {
      console.log('⚠️  현재 DB에 실제 GLEC 콘텐츠가 없습니다.');
      console.log('   다음 단계: GLEC 공식 소스에서 재수집 필요\n');
      console.log('📌 필요한 정보:');
      console.log('   1. GLEC 공식 블로그 URL');
      console.log('   2. GLEC YouTube 채널 URL');
      console.log('   3. GLEC 보도자료 페이지 URL');
      console.log('   4. (선택) GLEC 자료실 페이지 URL\n');
    } else {
      console.log(`✅ 실제 GLEC 콘텐츠 ${totalReal}개 발견!`);
      console.log('   어드민/웹사이트에서 정상 출력 확인 가능합니다.\n');
    }

  } catch (err) {
    console.error('❌ 오류:', err.message);
    console.error(err);
  }
}

cleanupDuplicates();
