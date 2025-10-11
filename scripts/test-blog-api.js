async function testBlogAPI() {
  try {
    const response = await fetch('http://localhost:3004/api/knowledge/blog');
    const data = await response.json();

    console.log('=== API Response ===');
    console.log('Success:', data.success);
    console.log('Total blogs:', data.meta?.total);
    console.log('Returned blogs:', data.data?.length);
    console.log('\n=== Blog List ===');

    data.data?.forEach((blog, index) => {
      console.log(`\n${index + 1}. ${blog.title}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Published: ${blog.publishedAt}`);
      console.log(`   Read Time: ${blog.readTime}`);
      console.log(`   Author: ${blog.author}`);
      console.log(`   Excerpt: ${blog.excerpt?.substring(0, 100)}...`);
    });

    console.log('\n=== Missing Fields Check ===');
    const firstBlog = data.data[0];
    console.log('First blog has category?', 'category' in firstBlog);
    console.log('First blog fields:', Object.keys(firstBlog));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBlogAPI();
