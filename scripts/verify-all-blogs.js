const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function verify() {
  console.log('=== 생성된 블로그 전체 확인 ===\n');

  const stats = await sql`
    SELECT
      COUNT(*) as total,
      SUM(LENGTH(content)) as total_chars,
      AVG(LENGTH(content)) as avg_chars
    FROM blogs
  `;

  console.log(`📊 통계:`);
  console.log(`  - 총 블로그: ${stats[0].total}개`);
  console.log(`  - 총 컨텐츠: ${parseInt(stats[0].total_chars).toLocaleString()}자`);
  console.log(`  - 평균 길이: ${parseInt(stats[0].avg_chars).toLocaleString()}자`);

  console.log(`\n📝 블로그 목록:\n`);

  const blogs = await sql`
    SELECT title, slug, LENGTH(content) as len, reading_time, published_at
    FROM blogs
    ORDER BY published_at DESC
  `;

  blogs.forEach((blog, i) => {
    console.log(`${i+1}. ${blog.title}`);
    console.log(`   - Slug: ${blog.slug}`);
    console.log(`   - 길이: ${blog.len.toLocaleString()}자`);
    console.log(`   - 읽기: ${blog.reading_time}분`);
    console.log(`   - 날짜: ${new Date(blog.published_at).toLocaleDateString('ko-KR')}`);
    console.log();
  });

  console.log(`✅ 완료`);
}

verify();
