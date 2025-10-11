const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function resetBlogs() {
  console.log('=== 모든 블로그 삭제 ===');
  await sql`DELETE FROM blogs`;
  console.log('✅ 완료');
}

resetBlogs().catch(console.error);
