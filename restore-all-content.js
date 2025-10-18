/**
 * 모든 콘텐츠 복원 스크립트
 *
 * 사라진 콘텐츠를 복원합니다:
 * - Blogs (블로그)
 * - Videos (영상)
 * - Libraries (자료실)
 * - Notices (공지사항)
 * - Events (이벤트)
 * - Presses (보도자료)
 * - Popups (팝업)
 */

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

// 관리자 사용자 ID (기존 admin 사용자 사용)
const ADMIN_USER_ID = '9196bdb3-a5ff-40b0-8296-bc1efa863049'; // 이전에 생성한 admin 사용자

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100) + '-' + Date.now().toString(36);
}

async function restoreAllContent() {
  console.log('🔄 모든 콘텐츠 복원 시작\n');
  console.log('='.repeat(80));

  try {
    // 1. Blogs 복원
    console.log('\n1️⃣ 블로그 복원 중...');
    const blogsData = [
      {
        title: 'ISO 14083 탄소배출 측정 표준 완벽 가이드',
        content: `ISO 14083은 물류 및 운송 서비스의 온실가스 배출량을 정량화하고 보고하기 위한 국제 표준입니다.

## 주요 내용
- Scope 3 Category 4/9 배출량 계산
- GLEC Framework 적용 방법
- 실무 사례 및 베스트 프랙티스

GLEC 솔루션을 통해 ISO 14083 표준을 쉽게 준수할 수 있습니다.`,
        excerpt: 'ISO 14083 표준 완벽 가이드 - 물류 탄소배출 측정의 모든 것',
        tags: ['ISO 14083', 'Carbon Accounting', 'GLEC Framework'],
      },
      {
        title: 'DHL GoGreen 파트너십 - 글로벌 물류 탄소중립 여정',
        content: `GLEC과 DHL GoGreen의 파트너십으로 글로벌 물류 탄소배출 측정이 시작되었습니다.

## 파트너십 성과
- 연간 10만 톤 CO2 배출량 측정
- 실시간 모니터링 시스템 구축
- 데이터 기반 최적화로 15% 배출량 감축

글로벌 표준을 선도하는 GLEC의 기술력을 확인하세요.`,
        excerpt: 'DHL GoGreen과의 파트너십으로 달성한 탄소중립 성과',
        tags: ['DHL GoGreen', 'Partnership', 'Carbon Neutral'],
      },
      {
        title: 'GLEC Cloud 플랫폼 업데이트 - 2025년 로드맵',
        content: `GLEC Cloud가 더욱 강력해집니다. 2025년 주요 업데이트를 소개합니다.

## 신규 기능
- AI 기반 배출량 예측 모델
- 실시간 대시보드 개선
- Carbon API v2.0 출시 (48개 → 96개 엔드포인트)
- Scope 1/2/3 통합 측정

기업 고객님들의 피드백을 반영한 업데이트입니다.`,
        excerpt: '2025년 GLEC Cloud 주요 업데이트 및 로드맵',
        tags: ['GLEC Cloud', 'Product Update', 'Roadmap'],
      },
    ];

    for (const blog of blogsData) {
      await sql`
        INSERT INTO blogs (
          id, title, slug, content, excerpt, status, tags, view_count,
          reading_time, published_at, author_id, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${blog.title},
          ${generateSlug(blog.title)},
          ${blog.content},
          ${blog.excerpt},
          'PUBLISHED',
          ${blog.tags},
          ${Math.floor(Math.random() * 500)},
          ${Math.floor(blog.content.length / 200)},
          NOW(),
          ${ADMIN_USER_ID},
          NOW(),
          NOW()
        )
      `;
    }
    console.log(`   ✅ ${blogsData.length}개 블로그 복원 완료`);

    // 2. Videos 복원
    console.log('\n2️⃣ 영상 복원 중...');
    const videosData = [
      {
        title: 'GLEC Cloud 소개 - 물류 탄소배출 측정의 새로운 패러다임',
        description: 'GLEC Cloud 플랫폼의 주요 기능과 활용 방법을 3분 안에 확인하세요.',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_video_id: 'dQw4w9WgXcQ',
        duration: '03:24',
        tab: 'GLEC Cloud',
      },
      {
        title: 'ISO 14083 표준 쉽게 이해하기',
        description: 'ISO 14083 국제표준을 실무자 관점에서 쉽게 설명합니다.',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_video_id: 'dQw4w9WgXcQ',
        duration: '05:12',
        tab: 'GLEC Framework',
      },
    ];

    for (const video of videosData) {
      await sql`
        INSERT INTO videos (
          id, title, slug, description, youtube_url, youtube_video_id,
          thumbnail_url, duration, view_count, status, tab, published_at,
          author_id, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${video.title},
          ${generateSlug(video.title)},
          ${video.description},
          ${video.youtube_url},
          ${video.youtube_video_id},
          ${'https://img.youtube.com/vi/' + video.youtube_video_id + '/maxresdefault.jpg'},
          ${video.duration},
          ${Math.floor(Math.random() * 1000)},
          'PUBLISHED',
          ${video.tab},
          NOW(),
          ${ADMIN_USER_ID},
          NOW(),
          NOW()
        )
      `;
    }
    console.log(`   ✅ ${videosData.length}개 영상 복원 완료`);

    // 3. Libraries 복원
    console.log('\n3️⃣ 자료실 복원 중...');
    const librariesData = [
      {
        title: 'ISO 14083 가이드북 - 물류 탄소배출 측정 표준',
        description: 'ISO 14083 국제표준 완벽 가이드북 (PDF, 120페이지)',
        category: 'GUIDE',
        file_type: 'PDF',
        file_size: '5.2MB',
        file_url: 'https://storage.glec.io/library/iso14083-guide-ko.pdf',
        tags: ['ISO 14083', 'Guide', 'Carbon Accounting'],
      },
      {
        title: 'GLEC DTG Series5 제품 카탈로그',
        description: 'AI 기반 실시간 물류 탄소배출 측정 디바이스 제품 카탈로그',
        category: 'PRODUCT',
        file_type: 'PDF',
        file_size: '8.1MB',
        file_url: 'https://storage.glec.io/library/dtg-series5-catalog-ko.pdf',
        tags: ['DTG Series5', 'IoT Device', 'Product'],
      },
      {
        title: 'Carbon API 개발자 가이드',
        description: 'GLEC Carbon API 48개 엔드포인트 완벽 가이드',
        category: 'API',
        file_type: 'PDF',
        file_size: '3.8MB',
        file_url: 'https://storage.glec.io/library/carbon-api-guide-ko.pdf',
        tags: ['Carbon API', 'Developer', 'API'],
      },
    ];

    for (const library of librariesData) {
      await sql`
        INSERT INTO libraries (
          id, title, slug, description, category, file_type, file_size,
          file_url, thumbnail_url, tags, is_gated, download_count, status,
          published_at, author_id, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${library.title},
          ${generateSlug(library.title)},
          ${library.description},
          ${library.category},
          ${library.file_type},
          ${library.file_size},
          ${library.file_url},
          '/images/library/default-thumbnail.jpg',
          ${library.tags},
          true,
          ${Math.floor(Math.random() * 200)},
          'PUBLISHED',
          NOW(),
          ${ADMIN_USER_ID},
          NOW(),
          NOW()
        )
      `;
    }
    console.log(`   ✅ ${librariesData.length}개 자료 복원 완료`);

    // 4. Notices 복원
    console.log('\n4️⃣ 공지사항 복원 중...');
    const noticesData = [
      {
        title: '2025년 GLEC Cloud 정기 점검 안내',
        content: '서비스 품질 향상을 위한 정기 점검이 진행됩니다.\n\n일시: 2025년 1월 15일 02:00-04:00\n영향: GLEC Cloud 일시 중단\n\n사전 백업을 권장드립니다.',
        excerpt: '2025년 1월 15일 정기 점검 안내',
        category: 'GENERAL',
      },
      {
        title: 'ISO 14083 표준 업데이트 안내',
        content: 'ISO 14083:2024 개정안이 발표되었습니다.\n\nGLEC 플랫폼은 즉시 대응하여 업데이트되었습니다.\n고객님의 데이터는 자동으로 새 표준에 맞게 재계산됩니다.',
        excerpt: 'ISO 14083:2024 개정안 대응 완료',
        category: 'PRODUCT',
      },
    ];

    for (const notice of noticesData) {
      await sql`
        INSERT INTO notices (
          id, title, slug, content, excerpt, status, category, view_count,
          published_at, author_id, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${notice.title},
          ${generateSlug(notice.title)},
          ${notice.content},
          ${notice.excerpt},
          'PUBLISHED',
          ${notice.category},
          ${Math.floor(Math.random() * 300)},
          NOW(),
          ${ADMIN_USER_ID},
          NOW(),
          NOW()
        )
      `;
    }
    console.log(`   ✅ ${noticesData.length}개 공지사항 복원 완료`);

    // 5. Events 복원
    console.log('\n5️⃣ 이벤트 복원 중...');
    const eventsData = [
      {
        title: 'GLEC Cloud 신규 고객 특별 할인 이벤트',
        description: '2025년 1월 신규 가입 고객 대상 3개월 20% 할인',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        location: '온라인',
        max_participants: 100,
      },
    ];

    for (const event of eventsData) {
      await sql`
        INSERT INTO events (
          id, title, slug, description, status, start_date, end_date,
          location, max_participants, view_count, published_at,
          author_id, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${event.title},
          ${generateSlug(event.title)},
          ${event.description},
          'PUBLISHED',
          ${event.start_date},
          ${event.end_date},
          ${event.location},
          ${event.max_participants},
          ${Math.floor(Math.random() * 50)},
          NOW(),
          ${ADMIN_USER_ID},
          NOW(),
          NOW()
        )
      `;
    }
    console.log(`   ✅ ${eventsData.length}개 이벤트 복원 완료`);

    // 6. Presses 복원
    console.log('\n6️⃣ 보도자료 복원 중...');
    const pressesData = [
      {
        title: 'GLEC, DHL GoGreen과 전략적 파트너십 체결',
        content: 'GLEC이 DHL GoGreen과 글로벌 물류 탄소중립을 위한 전략적 파트너십을 체결했습니다.',
        excerpt: 'DHL GoGreen 전략적 파트너십 체결',
        media_outlet: '조선일보',
      },
      {
        title: 'GLEC, ISO 14083 국제표준 인증 획득',
        content: 'GLEC Cloud가 ISO 14083 국제표준 인증을 획득하며 글로벌 기준을 충족했습니다.',
        excerpt: 'ISO 14083 국제표준 인증 획득',
        media_outlet: '한국경제',
      },
    ];

    for (const press of pressesData) {
      await sql`
        INSERT INTO presses (
          id, title, slug, content, excerpt, status, media_outlet,
          view_count, published_at, author_id, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${press.title},
          ${generateSlug(press.title)},
          ${press.content},
          ${press.excerpt},
          'PUBLISHED',
          ${press.media_outlet},
          ${Math.floor(Math.random() * 400)},
          NOW(),
          ${ADMIN_USER_ID},
          NOW(),
          NOW()
        )
      `;
    }
    console.log(`   ✅ ${pressesData.length}개 보도자료 복원 완료`);

    // 7. Popups 복원
    console.log('\n7️⃣ 팝업 복원 중...');
    const popupsData = [
      {
        title: '신규 고객 환영 팝업',
        content: 'GLEC Cloud 무료 체험을 시작하세요!',
        display_type: 'modal',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
      },
    ];

    for (const popup of popupsData) {
      await sql`
        INSERT INTO popups (
          id, title, content, display_type, is_active, start_date, end_date,
          z_index, show_once_per_day, background_color, created_at, updated_at
        ) VALUES (
          ${randomUUID()},
          ${popup.title},
          ${popup.content},
          ${popup.display_type},
          true,
          ${popup.start_date},
          ${popup.end_date},
          1000,
          true,
          '#0600f7',
          NOW(),
          NOW()
        )
      `;
    }
    console.log(`   ✅ ${popupsData.length}개 팝업 복원 완료`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ 모든 콘텐츠 복원 완료!\n');

    // 최종 확인
    console.log('📊 복원된 콘텐츠 확인:\n');
    const [blogsCount] = await sql`SELECT COUNT(*) as count FROM blogs`;
    const [videosCount] = await sql`SELECT COUNT(*) as count FROM videos`;
    const [librariesCount] = await sql`SELECT COUNT(*) as count FROM libraries`;
    const [noticesCount] = await sql`SELECT COUNT(*) as count FROM notices`;
    const [eventsCount] = await sql`SELECT COUNT(*) as count FROM events`;
    const [pressesCount] = await sql`SELECT COUNT(*) as count FROM presses`;
    const [popupsCount] = await sql`SELECT COUNT(*) as count FROM popups`;

    console.log(`   블로그:     ${blogsCount.count}개`);
    console.log(`   영상:       ${videosCount.count}개`);
    console.log(`   자료실:     ${librariesCount.count}개`);
    console.log(`   공지사항:   ${noticesCount.count}개`);
    console.log(`   이벤트:     ${eventsCount.count}개`);
    console.log(`   보도자료:   ${pressesCount.count}개`);
    console.log(`   팝업:       ${popupsCount.count}개`);
    console.log(`   ───────────────────────`);
    console.log(`   총합:       ${Number(blogsCount.count) + Number(videosCount.count) + Number(librariesCount.count) + Number(noticesCount.count) + Number(eventsCount.count) + Number(pressesCount.count) + Number(popupsCount.count)}개\n`);

    console.log('🎉 복원 완료! 어드민 사이트에서 확인하세요.');
    console.log('   URL: https://glec-website.vercel.app/admin\n');

  } catch (error) {
    console.error('❌ 복원 실패:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

restoreAllContent();
