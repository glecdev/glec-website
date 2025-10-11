const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function cleanTestBlogs() {
  console.log('=== 테스트 블로그 컨텐츠 삭제 ===\n');

  // 1. 현재 블로그 목록 확인
  const blogs = await sql`
    SELECT id, title, created_at
    FROM blogs
    ORDER BY created_at DESC
  `;

  console.log(`총 ${blogs.length}개의 블로그 발견:\n`);
  blogs.forEach((blog, index) => {
    console.log(`${index + 1}. ${blog.title} (${blog.created_at})`);
  });

  // 2. 테스트 컨텐츠 패턴 확인
  const testPatterns = [
    'E2E Test',
    'Test Blog',
    '테스트',
    'Sample',
    'Dummy',
    'Lorem ipsum'
  ];

  const testBlogs = blogs.filter(blog => 
    testPatterns.some(pattern => blog.title.includes(pattern))
  );

  if (testBlogs.length === 0) {
    console.log('\n✅ 테스트 컨텐츠가 없습니다.');
    return;
  }

  console.log(`\n삭제할 테스트 컨텐츠 ${testBlogs.length}개:\n`);
  testBlogs.forEach((blog, index) => {
    console.log(`${index + 1}. ${blog.title}`);
  });

  // 3. 삭제 실행
  for (const blog of testBlogs) {
    await sql`DELETE FROM blogs WHERE id = ${blog.id}`;
    console.log(`  ✅ 삭제: ${blog.title}`);
  }

  console.log(`\n✅ ${testBlogs.length}개의 테스트 컨텐츠 삭제 완료`);
}

cleanTestBlogs().catch(err => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
