import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function verifyBlogs() {
  console.log('📊 블로그 데이터베이스 현황 확인\n');

  // Status별 카운트
  const statusCount = await sql`
    SELECT status, COUNT(*) as count
    FROM blogs
    GROUP BY status
  `;
  console.log('Status별 블로그 수:');
  statusCount.forEach(s => console.log(`  ${s.status}: ${s.count}개`));

  // 전체 블로그 목록
  const allBlogs = await sql`
    SELECT id, title, slug, reading_time, published_at
    FROM blogs
    ORDER BY published_at DESC
  `;

  console.log(`\n전체 블로그 목록 (총 ${allBlogs.length}개):\n`);
  allBlogs.forEach((blog, index) => {
    const date = new Date(blog.published_at).toLocaleDateString('ko-KR');
    console.log(`${index + 1}. ${blog.title}`);
    console.log(`   - Slug: ${blog.slug}`);
    console.log(`   - Reading Time: ${blog.reading_time}분`);
    console.log(`   - Published: ${date}\n`);
  });
}

verifyBlogs().catch(console.error);
