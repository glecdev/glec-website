const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function diagnose() {
  console.log('=== 블로그 렌더링 문제 진단 ===\n');

  const blogs = await sql`
    SELECT title, slug, thumbnail_url,
           SUBSTRING(content, 1, 200) as content_preview,
           LENGTH(content) as content_length
    FROM blogs
    LIMIT 1
  `;

  if (blogs.length === 0) {
    console.log('❌ 블로그가 없습니다.');
    return;
  }

  const blog = blogs[0];

  console.log('📝 블로그 정보:');
  console.log('  - 제목:', blog.title);
  console.log('  - Slug:', blog.slug);
  console.log('  - 썸네일 URL:', blog.thumbnail_url);
  console.log('  - 본문 길이:', blog.content_length, '자');
  console.log('\n📄 본문 미리보기 (처음 200자):');
  console.log('---');
  console.log(blog.content_preview);
  console.log('---');

  // Check if content is markdown
  const hasMarkdownHeadings = blog.content_preview.includes('#');
  const hasMarkdownBold = blog.content_preview.includes('**');
  const hasMarkdownLinks = blog.content_preview.includes('[');

  console.log('\n🔍 Markdown 형식 검증:');
  console.log('  - Heading (#):', hasMarkdownHeadings ? '✅' : '❌');
  console.log('  - Bold (**):', hasMarkdownBold ? '✅' : '❌');
  console.log('  - Links ([]):', hasMarkdownLinks ? '✅' : '❌');

  // Check thumbnail URL
  if (blog.thumbnail_url) {
    const isValidUrl = blog.thumbnail_url.startsWith('http://') || blog.thumbnail_url.startsWith('https://');
    console.log('\n🖼️ 썸네일 URL 검증:');
    console.log('  - 유효한 URL:', isValidUrl ? '✅' : '❌');
    console.log('  - URL:', blog.thumbnail_url);
  } else {
    console.log('\n🖼️ 썸네일 URL: ❌ 없음');
  }
}

diagnose().catch(console.error);
