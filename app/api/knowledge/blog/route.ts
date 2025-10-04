/**
 * Knowledge Blog API
 *
 * Purpose: Provide blog posts data
 * Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


const MOCK_BLOG_DATA = [
  {
    id: 'blog-001',
    title: '물류 업계의 탄소배출 감축 트렌드 2025',
    slug: 'logistics-carbon-reduction-trends-2025',
    category: 'TREND',
    excerpt: '2025년 물류 업계가 주목해야 할 탄소배출 감축 트렌드와 전략',
    content: '물류 업계는 지속 가능성을 위한 혁신적인 솔루션을 도입하고 있습니다...',
    author: 'GLEC 편집팀',
    authorAvatar: '/images/authors/glec-team.jpg',
    thumbnailUrl: '/images/blog/trend-2025-thumb.jpg',
    publishedAt: '2025-01-22T00:00:00Z',
    readTime: '8분',
    tags: ['트렌드', '물류', '탄소감축', '2025'],
  },
  {
    id: 'blog-002',
    title: 'ISO 14083 도입으로 얻은 3가지 이점',
    slug: 'iso-14083-adoption-benefits',
    category: 'INSIGHT',
    excerpt: 'ISO 14083 표준 도입 기업들이 경험한 실질적인 이점',
    content: 'ISO 14083을 도입한 기업들은 다음과 같은 이점을 얻었습니다...',
    author: '김지환',
    authorAvatar: '/images/authors/kim-jihwan.jpg',
    thumbnailUrl: '/images/blog/iso-benefits-thumb.jpg',
    publishedAt: '2025-01-18T00:00:00Z',
    readTime: '6분',
    tags: ['ISO', '14083', '이점', '도입'],
  },
  {
    id: 'blog-003',
    title: 'DTG Series5로 무역 서류 작성 시간 90% 단축',
    slug: 'dtg-series5-efficiency-boost',
    category: 'CASE_STUDY',
    excerpt: 'DTG Series5 도입 기업의 생산성 향상 사례 분석',
    content: 'A 기업은 DTG Series5 도입 후 무역 서류 작성 시간을 90% 단축했습니다...',
    author: '박민수',
    authorAvatar: '/images/authors/park-minsu.jpg',
    thumbnailUrl: '/images/blog/dtg-case-thumb.jpg',
    publishedAt: '2025-01-15T00:00:00Z',
    readTime: '10분',
    tags: ['DTG', 'Series5', '사례', '생산성'],
  },
  {
    id: 'blog-004',
    title: 'Carbon API로 구현하는 실시간 탄소배출 모니터링',
    slug: 'realtime-carbon-monitoring-api',
    category: 'TECH',
    excerpt: 'Carbon API를 활용한 실시간 탄소배출 추적 시스템 구축',
    content: 'GLEC Carbon API를 사용하면 실시간으로 탄소배출을 모니터링할 수 있습니다...',
    author: '이서연',
    authorAvatar: '/images/authors/lee-seoyeon.jpg',
    thumbnailUrl: '/images/blog/api-monitoring-thumb.jpg',
    publishedAt: '2025-01-12T00:00:00Z',
    readTime: '12분',
    tags: ['API', '모니터링', '실시간', '탄소배출'],
  },
  {
    id: 'blog-005',
    title: 'DHL GoGreen 파트너십 성과 리포트',
    slug: 'dhl-gogreen-partnership-report',
    category: 'REPORT',
    excerpt: 'DHL GoGreen과의 협업을 통한 탄소감축 성과 분석',
    content: 'DHL GoGreen과의 파트너십을 통해 달성한 탄소감축 성과를 공유합니다...',
    author: '최현우',
    authorAvatar: '/images/authors/choi-hyunwoo.jpg',
    thumbnailUrl: '/images/blog/dhl-report-thumb.jpg',
    publishedAt: '2025-01-08T00:00:00Z',
    readTime: '15분',
    tags: ['DHL', 'GoGreen', '리포트', '성과'],
  },
  {
    id: 'blog-006',
    title: 'GLEC Cloud 신기능 업데이트 소개',
    slug: 'glec-cloud-new-features',
    category: 'PRODUCT',
    excerpt: 'GLEC Cloud 최신 업데이트에 추가된 5가지 신기능',
    content: 'GLEC Cloud의 최신 버전에서는 다음과 같은 신기능이 추가되었습니다...',
    author: '정다은',
    authorAvatar: '/images/authors/jung-daeun.jpg',
    thumbnailUrl: '/images/blog/cloud-update-thumb.jpg',
    publishedAt: '2025-01-05T00:00:00Z',
    readTime: '7분',
    tags: ['Cloud', '업데이트', '신기능', '제품'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '12');

    let filteredData = [...MOCK_BLOG_DATA];

    // Filter by category
    if (category) {
      filteredData = filteredData.filter((item) => item.category === category);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.excerpt.toLowerCase().includes(searchLower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const total = filteredData.length;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = filteredData.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('[API /knowledge/blog] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch blog data',
        },
      },
      { status: 500 }
    );
  }
}
