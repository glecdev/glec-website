/**
 * Quick Knowledge APIs Test
 * Tests all 3 Knowledge Center APIs (Library, Videos, Blog)
 */

const BASE_URL = 'http://localhost:3010';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

async function login(): Promise<string> {
  console.log('\n🔐 Step 1: Admin Login');
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${await response.text()}`);
  }

  const data: ApiResponse = await response.json();
  if (!data.success || !data.data?.token) {
    throw new Error(`Login response invalid: ${JSON.stringify(data)}`);
  }
  console.log(`✅ Login successful`);
  return data.data.token;
}

async function testLibraryAPI(token: string) {
  console.log('\n📚 Step 2: Testing Library API');

  // Test GET (should work with fixed sql.query())
  console.log('  📖 GET /api/admin/knowledge/library');
  const getRes = await fetch(`${BASE_URL}/api/admin/knowledge/library?page=1&per_page=5`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!getRes.ok) {
    const errorText = await getRes.text();
    throw new Error(`Library GET failed: ${getRes.status} ${errorText}`);
  }

  const getResult: ApiResponse = await getRes.json();
  console.log(`  ✅ GET Success - Found ${getResult.meta?.total || 0} items`);

  // Test POST (should work with fixed UUID generation)
  console.log('  📝 POST /api/admin/knowledge/library');
  const testLibrary = {
    title: 'Test Library Document - Quick Test',
    description: 'Testing UUID generation and sql.query() fixes',
    category: 'TECHNICAL',
    fileType: 'PDF',
    fileSize: '1.5 MB',
    fileUrl: 'https://example.com/test.pdf',
    tags: ['test', 'automation'],
  };

  const postRes = await fetch(`${BASE_URL}/api/admin/knowledge/library`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testLibrary),
  });

  if (!postRes.ok) {
    const errorText = await postRes.text();
    throw new Error(`Library POST failed: ${postRes.status} ${errorText}`);
  }

  const postResult: ApiResponse = await postRes.json();
  console.log(`  ✅ POST Success - Created ID: ${postResult.data?.id}`);

  return postResult.data?.id;
}

async function testVideosAPI(token: string) {
  console.log('\n🎬 Step 3: Testing Videos API');

  // Test GET
  console.log('  📖 GET /api/admin/knowledge/videos');
  const getRes = await fetch(`${BASE_URL}/api/admin/knowledge/videos?page=1&per_page=5`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!getRes.ok) {
    const errorText = await getRes.text();
    throw new Error(`Videos GET failed: ${getRes.status} ${errorText}`);
  }

  const getResult: ApiResponse = await getRes.json();
  console.log(`  ✅ GET Success - Found ${getResult.meta?.total || 0} items`);

  // Test POST
  console.log('  📝 POST /api/admin/knowledge/videos');
  const testVideo = {
    title: 'Test Video - Quick Test',
    description: 'Testing UUID generation and sql.query() fixes',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '3:33',
    category: 'TUTORIAL',
    tags: ['test', 'automation'],
  };

  const postRes = await fetch(`${BASE_URL}/api/admin/knowledge/videos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testVideo),
  });

  if (!postRes.ok) {
    const errorText = await postRes.text();
    throw new Error(`Videos POST failed: ${postRes.status} ${errorText}`);
  }

  const postResult: ApiResponse = await postRes.json();
  console.log(`  ✅ POST Success - Created ID: ${postResult.data?.id}`);

  return postResult.data?.id;
}

async function testBlogAPI(token: string) {
  console.log('\n📝 Step 4: Testing Blog API');

  // Test GET
  console.log('  📖 GET /api/admin/knowledge/blog');
  const getRes = await fetch(`${BASE_URL}/api/admin/knowledge/blog?page=1&per_page=5`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!getRes.ok) {
    const errorText = await getRes.text();
    throw new Error(`Blog GET failed: ${getRes.status} ${errorText}`);
  }

  const getResult: ApiResponse = await getRes.json();
  console.log(`  ✅ GET Success - Found ${getResult.meta?.total || 0} items`);

  // Test POST
  console.log('  📝 POST /api/admin/knowledge/blog');
  const testBlog = {
    title: 'Test Blog Post - Quick Test',
    content: 'This is a test blog post to verify UUID generation and sql.query() fixes are working correctly.',
    excerpt: 'Testing UUID generation and sql.query() fixes',
    author: 'Test Automation',
    category: 'TECHNICAL',
    tags: ['test', 'automation'],
  };

  const postRes = await fetch(`${BASE_URL}/api/admin/knowledge/blog`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testBlog),
  });

  if (!postRes.ok) {
    const errorText = await postRes.text();
    throw new Error(`Blog POST failed: ${postRes.status} ${errorText}`);
  }

  const postResult: ApiResponse = await postRes.json();
  console.log(`  ✅ POST Success - Created ID: ${postResult.data?.id}`);

  return postResult.data?.id;
}

async function main() {
  console.log('🚀 Knowledge Center APIs Quick Test');
  console.log('=====================================');

  try {
    const token = await login();

    const libraryId = await testLibraryAPI(token);
    const videoId = await testVideosAPI(token);
    const blogId = await testBlogAPI(token);

    console.log('\n✅ All Tests Passed!');
    console.log('=====================================');
    console.log(`Library ID: ${libraryId}`);
    console.log(`Video ID: ${videoId}`);
    console.log(`Blog ID: ${blogId}`);
    console.log('\n🎉 Knowledge Center APIs are working correctly!');
    console.log('   - UUID generation: ✅ Fixed');
    console.log('   - Neon SQL syntax: ✅ Fixed');
    console.log('   - GET methods: ✅ Working');
    console.log('   - POST methods: ✅ Working');

  } catch (error) {
    console.error('\n❌ Test Failed!');
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
