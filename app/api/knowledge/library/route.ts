/**
 * Knowledge Library API
 *
 * Purpose: Provide library resources data
 * Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


const MOCK_LIBRARY_DATA = [
  {
    id: 'lib-001',
    title: 'ISO 14083 표준 가이드북',
    category: 'GUIDE',
    description: 'ISO 14083 국제표준 물류 탄소배출 측정 완벽 가이드',
    fileType: 'PDF',
    fileSize: '2.5 MB',
    fileUrl: '/downloads/iso-14083-guide.pdf',
    thumbnailUrl: '/images/library/iso-14083-thumb.jpg',
    publishedAt: '2025-01-15T00:00:00Z',
    downloadCount: 1247,
    tags: ['ISO', '표준', '탄소배출', '측정'],
  },
  {
    id: 'lib-002',
    title: 'GLEC Framework 활용 가이드',
    category: 'GUIDE',
    description: 'Global Logistics Emissions Council 프레임워크 실무 활용 가이드',
    fileType: 'PDF',
    fileSize: '3.2 MB',
    fileUrl: '/downloads/glec-framework-guide.pdf',
    thumbnailUrl: '/images/library/glec-framework-thumb.jpg',
    publishedAt: '2025-01-10T00:00:00Z',
    downloadCount: 892,
    tags: ['GLEC', 'Framework', '실무', '가이드'],
  },
  {
    id: 'lib-003',
    title: 'DHL GoGreen 파트너십 백서',
    category: 'WHITEPAPER',
    description: 'DHL GoGreen과 GLEC의 전략적 파트너십 사례',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    fileUrl: '/downloads/dhl-gogreen-partnership.pdf',
    thumbnailUrl: '/images/library/dhl-partnership-thumb.jpg',
    publishedAt: '2025-01-05T00:00:00Z',
    downloadCount: 1543,
    tags: ['DHL', 'GoGreen', '파트너십', '사례'],
  },
  {
    id: 'lib-004',
    title: 'DTG Series5 사용 매뉴얼',
    category: 'REPORT',
    description: 'GLEC DTG Series5 디지털 무역 서류 생성 솔루션 사용 매뉴얼',
    fileType: 'PDF',
    fileSize: '4.1 MB',
    fileUrl: '/downloads/dtg-series5-manual.pdf',
    thumbnailUrl: '/images/library/dtg-manual-thumb.jpg',
    publishedAt: '2025-01-01T00:00:00Z',
    downloadCount: 2156,
    tags: ['DTG', 'Series5', '매뉴얼', '사용법'],
  },
  {
    id: 'lib-005',
    title: 'Carbon API 개발자 문서',
    category: 'RESEARCH',
    description: 'GLEC Carbon API 개발자를 위한 기술 문서 및 예제',
    fileType: 'PDF',
    fileSize: '2.9 MB',
    fileUrl: '/downloads/carbon-api-docs.pdf',
    thumbnailUrl: '/images/library/api-docs-thumb.jpg',
    publishedAt: '2024-12-20T00:00:00Z',
    downloadCount: 3421,
    tags: ['API', '개발자', 'REST', '문서'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '12');

    let filteredData = [...MOCK_LIBRARY_DATA];

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
          item.description.toLowerCase().includes(searchLower) ||
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
    console.error('[API /knowledge/library] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch library data',
        },
      },
      { status: 500 }
    );
  }
}
