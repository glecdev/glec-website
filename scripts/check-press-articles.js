import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const articles = await sql`
  SELECT id, title, source, published_at 
  FROM presses 
  ORDER BY published_at DESC
`;

console.log('\n=== 📰 전체 언론기사 목록 ===\n');
console.log(`총 ${articles.length}개\n`);

articles.forEach((a, i) => {
  console.log(`${i+1}. ${a.title}`);
  console.log(`   출처: ${a.source}`);
  console.log(`   발행일: ${new Date(a.published_at).toLocaleDateString('ko-KR')}\n`);
});

// GLEC 어학원 관련 기사 필터링
const academyArticles = articles.filter(a => 
  a.title.includes('어학원') || 
  a.title.includes('학원') || 
  a.title.includes('교육') ||
  a.title.includes('영어') ||
  a.title.includes('유학')
);

if (academyArticles.length > 0) {
  console.log('\n❌ 삭제 대상 (어학원 관련):\n');
  academyArticles.forEach(a => {
    console.log(`  - ${a.title}`);
    console.log(`    ID: ${a.id}\n`);
  });
}
