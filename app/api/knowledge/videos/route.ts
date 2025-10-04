/**
 * Knowledge Videos API
 *
 * Purpose: Provide video resources data
 * Mock implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';

const MOCK_VIDEOS_DATA = [
  {
    id: 'vid-001',
    title: 'GLEC 2분 소개 영상',
    description: '2분 만에 이해하는 GLEC 물류 탄소배출 측정 솔루션',
    category: 'PRODUCT',
    duration: '02:15',
    thumbnailUrl: '/images/videos/glec-intro-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    publishedAt: '2025-01-20T00:00:00Z',
    viewCount: 15243,
  },
  {
    id: 'vid-002',
    title: 'ISO 14083 표준 웨비나',
    description: 'ISO 14083 국제표준의 핵심 내용과 적용 방법',
    category: 'WEBINAR',
    duration: '08:42',
    thumbnailUrl: '/images/videos/iso-14083-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    publishedAt: '2025-01-15T00:00:00Z',
    viewCount: 8521,
  },
  {
    id: 'vid-003',
    title: 'DTG Series5 사용법',
    description: 'DTG Series5 솔루션 실무 활용 가이드',
    category: 'TUTORIAL',
    duration: '12:30',
    thumbnailUrl: '/images/videos/dtg-tutorial-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    publishedAt: '2025-01-10T00:00:00Z',
    viewCount: 12456,
  },
  {
    id: 'vid-004',
    title: 'Carbon API 개발 가이드',
    description: 'GLEC Carbon API를 활용한 탄소배출 계산 연동',
    category: 'TUTORIAL',
    duration: '15:20',
    thumbnailUrl: '/images/videos/api-dev-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example4',
    publishedAt: '2025-01-05T00:00:00Z',
    viewCount: 6834,
  },
  {
    id: 'vid-005',
    title: 'DHL GoGreen 파트너십 발표회',
    description: 'DHL GoGreen과의 협업을 통한 탄소배출 감축 성과',
    category: 'EVENT',
    duration: '10:45',
    thumbnailUrl: '/images/videos/dhl-case-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example5',
    publishedAt: '2025-01-01T00:00:00Z',
    viewCount: 9287,
  },
  {
    id: 'vid-006',
    title: 'GLEC Cloud 대시보드 투어',
    description: 'GLEC Cloud 실시간 대시보드 기능 둘러보기',
    category: 'PRODUCT',
    duration: '06:30',
    thumbnailUrl: '/images/videos/cloud-tour-thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example6',
    publishedAt: '2024-12-25T00:00:00Z',
    viewCount: 11234,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '12');

    let filteredData = [...MOCK_VIDEOS_DATA];

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
    console.error('[API /knowledge/videos] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch videos data',
        },
      },
      { status: 500 }
    );
  }
}
