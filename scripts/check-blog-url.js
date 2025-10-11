const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkBlog() {
  const blogs = await sql`SELECT slug, title, LENGTH(content) as len FROM blogs LIMIT 1`;
  if (blogs.length > 0) {
    console.log('Slug:', blogs[0].slug);
    console.log('Title:', blogs[0].title);
    console.log('Content length:', blogs[0].len, 'characters');
    console.log('\nURL: http://localhost:3000/knowledge/blog/' + blogs[0].slug);
  }
}

checkBlog();
