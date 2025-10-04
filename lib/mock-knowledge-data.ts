/**
 * Mock Knowledge Data Generators
 *
 * Purpose: Generate dynamic mock data for Knowledge CMS (NO HARDCODING)
 * Standards: CLAUDE.md (Section: Step 2 - Mock Data Generators)
 * Pattern: Functions that return FRESH data each call
 *
 * IMPORTANT: This file provides FUNCTIONS, not static arrays
 */

import {
  KnowledgeLibraryItem,
  KnowledgeVideo,
  KnowledgeBlogPost,
  KnowledgeCategory,
  VideoCategory,
  BlogCategory,
} from './types/knowledge';

// ============================================================
// LIBRARY DATA GENERATOR
// ============================================================

const LIBRARY_TITLES = [
  'ISO 14083 표준 가이드북',
  'GLEC Framework 활용 가이드',
  'DHL GoGreen 파트너십 백서',
  'DTG Series5 사용 매뉴얼',
  'Carbon API 개발자 문서',
  '물류 탄소배출 측정 Best Practices',
  'Scope 3 배출량 계산 방법론',
  '지속가능한 물류 전략 백서',
  '탄소중립 로드맵 가이드',
  '친환경 물류 사례 연구',
];

const LIBRARY_CATEGORIES: KnowledgeCategory[] = [
  'TECHNICAL',
  'GUIDE',
  'WHITEPAPER',
  'REPORT',
  'RESEARCH',
  'TUTORIAL',
  'CASE_STUDY',
];

export function generateMockLibraryItems(count: number): KnowledgeLibraryItem[] {
  const items: KnowledgeLibraryItem[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const title = LIBRARY_TITLES[i % LIBRARY_TITLES.length];
    const category = LIBRARY_CATEGORIES[i % LIBRARY_CATEGORIES.length];
    const daysAgo = Math.floor(Math.random() * 90); // Random date within last 90 days
    const publishedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    items.push({
      id: `lib-${String(i + 1).padStart(3, '0')}`,
      title: `${title} (${i + 1})`,
      description: `${title}에 대한 상세한 설명입니다. 이 자료는 ${category.toLowerCase()} 카테고리에 속하며, 실무에 즉시 적용 가능한 내용을 담고 있습니다.`,
      category,
      fileType: i % 4 === 0 ? 'PDF' : i % 4 === 1 ? 'DOCX' : i % 4 === 2 ? 'XLSX' : 'PPTX',
      fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      fileUrl: `/downloads/${title.toLowerCase().replace(/\s+/g, '-')}-${i + 1}.pdf`,
      thumbnailUrl: i % 3 === 0 ? `/images/library/thumb-${i + 1}.jpg` : null,
      downloadCount: Math.floor(Math.random() * 5000),
      tags: generateRandomTags(3, i),
      publishedAt,
      createdAt: publishedAt,
      updatedAt: new Date(now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return items;
}

// ============================================================
// VIDEO DATA GENERATOR
// ============================================================

const VIDEO_TITLES = [
  'ISO 14083 소개 영상',
  'GLEC Framework 활용 방법',
  'DTG Series5 제품 데모',
  'Carbon API 빠른 시작 가이드',
  'DHL GoGreen 파트너십 소개',
  '물류 탄소배출 측정 웨비나',
  'Scope 3 배출량 계산 튜토리얼',
  '고객 성공 사례 인터뷰',
  '지속가능한 물류 전략 세미나',
  '탄소중립 목표 달성 방법',
];

const VIDEO_CATEGORIES: VideoCategory[] = [
  'TECHNICAL',
  'GUIDE',
  'TUTORIAL',
  'WEBINAR',
  'CASE_STUDY',
  'PRODUCT_DEMO',
];

export function generateMockVideos(count: number): KnowledgeVideo[] {
  const videos: KnowledgeVideo[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const title = VIDEO_TITLES[i % VIDEO_TITLES.length];
    const category = VIDEO_CATEGORIES[i % VIDEO_CATEGORIES.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const publishedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const minutes = Math.floor(Math.random() * 30) + 3;
    const seconds = Math.floor(Math.random() * 60);

    videos.push({
      id: `vid-${String(i + 1).padStart(3, '0')}`,
      title: `${title} (${i + 1})`,
      description: `${title}에 대한 상세한 비디오 콘텐츠입니다. ${category.toLowerCase()} 카테고리의 전문적인 내용을 담고 있습니다.`,
      videoUrl: `https://youtube.com/watch?v=example-${i + 1}`,
      thumbnailUrl: `/images/videos/thumb-${i + 1}.jpg`,
      duration: `${minutes}:${String(seconds).padStart(2, '0')}`,
      category,
      viewCount: Math.floor(Math.random() * 10000),
      tags: generateRandomTags(4, i),
      publishedAt,
      createdAt: publishedAt,
      updatedAt: new Date(now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return videos;
}

// ============================================================
// BLOG DATA GENERATOR
// ============================================================

const BLOG_TITLES = [
  'ISO 14083 표준의 핵심 이해하기',
  'GLEC Framework 실무 적용 사례',
  '2025년 탄소배출 규제 동향',
  'DTG Series5 신기능 소개',
  '물류 업계의 ESG 경영 트렌드',
  'Scope 3 배출량 측정의 중요성',
  'DHL GoGreen과의 협업 성과',
  '탄소중립 달성을 위한 5가지 전략',
  '친환경 물류의 미래',
  'GLEC Cloud 플랫폼 업데이트',
];

const BLOG_CATEGORIES: BlogCategory[] = [
  'TECHNICAL',
  'GUIDE',
  'NEWS',
  'CASE_STUDY',
  'TUTORIAL',
  'INDUSTRY_INSIGHTS',
  'PRODUCT_UPDATES',
];

const AUTHORS = ['김철수', '이영희', '박지성', '최민수', 'John Smith', 'Sarah Lee'];

export function generateMockBlogPosts(count: number): KnowledgeBlogPost[] {
  const posts: KnowledgeBlogPost[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const title = BLOG_TITLES[i % BLOG_TITLES.length];
    const category = BLOG_CATEGORIES[i % BLOG_CATEGORIES.length];
    const author = AUTHORS[i % AUTHORS.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const publishedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    posts.push({
      id: `blog-${String(i + 1).padStart(3, '0')}`,
      title: `${title} (${i + 1})`,
      content: generateBlogContent(title, category),
      excerpt: `${title}에 대한 핵심 내용을 간단히 정리한 글입니다. ${category.toLowerCase()} 분야의 최신 정보와 인사이트를 제공합니다.`,
      author,
      category,
      tags: generateRandomTags(5, i),
      thumbnailUrl: i % 2 === 0 ? `/images/blog/thumb-${i + 1}.jpg` : null,
      viewCount: Math.floor(Math.random() * 15000),
      publishedAt,
      createdAt: publishedAt,
      updatedAt: new Date(now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return posts;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const TAG_POOL = [
  'ISO',
  '표준',
  '탄소배출',
  '측정',
  'GLEC',
  'Framework',
  '실무',
  '가이드',
  'DHL',
  'GoGreen',
  '파트너십',
  '사례',
  'DTG',
  'Series5',
  '매뉴얼',
  '사용법',
  'API',
  '개발자',
  'REST',
  '문서',
  'Scope 3',
  '지속가능성',
  'ESG',
  '친환경',
  '물류',
  '탄소중립',
  '데이터',
  '분석',
  '솔루션',
];

function generateRandomTags(count: number, seed: number): string[] {
  const tags: string[] = [];
  const shuffled = [...TAG_POOL].sort(() => 0.5 - Math.random());

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    tags.push(shuffled[(seed + i) % shuffled.length]);
  }

  return tags;
}

function generateBlogContent(title: string, category: string): string {
  return `
    <h2>${title}</h2>
    <p>이 글은 ${category} 카테고리의 콘텐츠로, 실무에 바로 적용 가능한 내용을 담고 있습니다.</p>

    <h3>주요 내용</h3>
    <ul>
      <li>ISO 14083 국제표준의 핵심 개념 이해</li>
      <li>GLEC Framework를 활용한 탄소배출 측정 방법</li>
      <li>실제 사례를 통한 적용 방법 학습</li>
      <li>데이터 기반 의사결정을 위한 인사이트</li>
    </ul>

    <h3>상세 설명</h3>
    <p>물류 탄소배출 측정은 현대 기업의 ESG 경영에서 필수적인 요소입니다.
    ISO 14083 국제표준은 이러한 측정을 표준화하여 투명성과 신뢰성을 보장합니다.</p>

    <p>GLEC Framework는 글로벌 물류 배출 위원회에서 개발한 프레임워크로,
    다양한 운송 수단과 경로에 대한 탄소배출을 정확하게 계산할 수 있습니다.</p>

    <blockquote>
      "데이터 기반의 정확한 측정 없이는 진정한 탄소중립 목표 달성이 불가능합니다."
    </blockquote>

    <h3>결론</h3>
    <p>이 글에서 다룬 내용을 바탕으로 귀사의 물류 프로세스에서
    탄소배출 측정을 시작해보시기 바랍니다. GLEC 솔루션은 이러한 여정을 지원합니다.</p>
  `;
}

// ============================================================
// SEARCH FUNCTIONS
// ============================================================

export function searchLibraryItems(
  items: KnowledgeLibraryItem[],
  searchTerm: string
): KnowledgeLibraryItem[] {
  const lowerSearch = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerSearch) ||
      item.description.toLowerCase().includes(lowerSearch) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
  );
}

export function searchVideos(videos: KnowledgeVideo[], searchTerm: string): KnowledgeVideo[] {
  const lowerSearch = searchTerm.toLowerCase();
  return videos.filter(
    (video) =>
      video.title.toLowerCase().includes(lowerSearch) ||
      video.description.toLowerCase().includes(lowerSearch) ||
      video.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
  );
}

export function searchBlogPosts(
  posts: KnowledgeBlogPost[],
  searchTerm: string
): KnowledgeBlogPost[] {
  const lowerSearch = searchTerm.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerSearch) ||
      post.excerpt.toLowerCase().includes(lowerSearch) ||
      post.content.toLowerCase().includes(lowerSearch) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
  );
}
