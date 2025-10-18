const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('📊 데이터베이스 콘텐츠 확인 (Prisma)\n');
  console.log('='.repeat(80));

  try {
    // Blogs
    const blogsCount = await prisma.blogs.count();
    console.log(`✅ blogs             ${blogsCount}개`);
    if (blogsCount > 0) {
      const blogsSample = await prisma.blogs.findMany({ take: 3, orderBy: { created_at: 'desc' } });
      blogsSample.forEach((b, idx) => console.log(`   ${idx + 1}. ${b.title}`));
    }
    console.log('');

    // Videos
    const videosCount = await prisma.videos.count();
    console.log(`✅ videos            ${videosCount}개`);
    if (videosCount > 0) {
      const videosSample = await prisma.videos.findMany({ take: 3, orderBy: { created_at: 'desc' } });
      videosSample.forEach((v, idx) => console.log(`   ${idx + 1}. ${v.title}`));
    }
    console.log('');

    // Library Items
    const libraryCount = await prisma.library_items.count();
    console.log(`✅ library_items     ${libraryCount}개`);
    if (libraryCount > 0) {
      const librarySample = await prisma.library_items.findMany({ take: 3, orderBy: { created_at: 'desc' } });
      librarySample.forEach((l, idx) => console.log(`   ${idx + 1}. ${l.title}`));
    }
    console.log('');

    // Notices
    const noticesCount = await prisma.notices.count();
    console.log(`✅ notices           ${noticesCount}개`);
    if (noticesCount > 0) {
      const noticesSample = await prisma.notices.findMany({ take: 3, orderBy: { created_at: 'desc' } });
      noticesSample.forEach((n, idx) => console.log(`   ${idx + 1}. ${n.title}`));
    }
    console.log('');

    // Events
    const eventsCount = await prisma.events.count();
    console.log(`✅ events            ${eventsCount}개`);
    if (eventsCount > 0) {
      const eventsSample = await prisma.events.findMany({ take: 3, orderBy: { created_at: 'desc' } });
      eventsSample.forEach((e, idx) => console.log(`   ${idx + 1}. ${e.event_name}`));
    }
    console.log('');

    // Press - schema에 있는지 확인 필요
    try {
      const pressCount = await prisma.press_releases.count();
      console.log(`✅ press_releases    ${pressCount}개`);
      if (pressCount > 0) {
        const pressSample = await prisma.press_releases.findMany({ take: 3, orderBy: { created_at: 'desc' } });
        pressSample.forEach((p, idx) => console.log(`   ${idx + 1}. ${p.title}`));
      }
      console.log('');
    } catch (err) {
      console.log(`⚠️ press_releases    테이블 없음 또는 접근 불가`);
      console.log('');
    }

    // Popups
    const popupsCount = await prisma.popups.count();
    console.log(`✅ popups            ${popupsCount}개`);
    if (popupsCount > 0) {
      const popupsSample = await prisma.popups.findMany({ take: 3, orderBy: { created_at: 'desc' } });
      popupsSample.forEach((p, idx) => console.log(`   ${idx + 1}. ${p.title}`));
    }
    console.log('');

    console.log('='.repeat(80));
    const total = blogsCount + videosCount + libraryCount + noticesCount + eventsCount + popupsCount;
    console.log(`\n📊 총 콘텐츠: ${total}개\n`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
