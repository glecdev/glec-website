/**
 * GET /api/events
 *
 * Security: CLAUDE.md - No hardcoding, dynamic data only (Mock data temporary)
 * Purpose: Fetch events for website
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - per_page: number (default: 12, max: 50)
 * - status: EventStatus (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Event, EventsApiResponse, EventsApiError } from '@/types/event';

// Mock data generator (temporary until database is connected)
// IMPORTANT: This will be replaced with Prisma queries
function getMockEvents(): Event[] {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + 30);
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - 30);

  return [
    {
      id: '1',
      title: 'ISO-14083 국제표준 세미나',
      description:
        '물류 탄소배출 국제표준 ISO-14083의 실무 적용 사례를 공유하는 세미나입니다. DHL GoGreen과 Smart Freight Centre의 전문가가 직접 참석합니다.',
      startDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), 15, 14, 0).toISOString(),
      endDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), 15, 18, 0).toISOString(),
      location: '서울 강남구 코엑스 컨퍼런스룸 401호',
      locationDetails: '2호선 삼성역 5번 출구 도보 5분',
      status: 'UPCOMING',
      imageUrl: '/images/events/iso-seminar.jpg',
      registrationUrl: '/contact?event=iso-seminar',
      maxAttendees: 100,
      currentAttendees: 67,
      tags: ['세미나', 'ISO-14083', '국제표준'],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    },
    {
      id: '2',
      title: 'GLEC DTG Series5 제품 론칭 행사',
      description:
        '차세대 운행기록장치 DTG Series5의 공식 론칭 행사입니다. 실제 제품 데모와 함께 특별 할인 혜택을 제공합니다.',
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 10, 0).toISOString(),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 17, 0).toISOString(),
      location: '서울 송파구 올림픽로 300 롯데월드타워 76층',
      status: 'UPCOMING',
      imageUrl: '/images/events/dtg-launch.jpg',
      registrationUrl: '/contact?event=dtg-launch',
      maxAttendees: 200,
      currentAttendees: 143,
      tags: ['제품 론칭', 'DTG Series5', '하드웨어'],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
    },
    {
      id: '3',
      title: '물류기업 탄소중립 전략 웨비나',
      description:
        '598,404개 국내 물류기업을 위한 온라인 웨비나입니다. Zoom을 통해 실시간으로 참여하실 수 있습니다.',
      startDate: now.toISOString(),
      endDate: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
      location: '온라인 (Zoom)',
      locationDetails: '등록 후 이메일로 Zoom 링크 발송',
      status: 'ONGOING',
      registrationUrl: '/contact?event=carbon-webinar',
      maxAttendees: 500,
      currentAttendees: 287,
      tags: ['웨비나', '탄소중립', '온라인'],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '4',
      title: 'DHL GoGreen 파트너십 체결 기념 행사',
      description:
        'GLEC과 DHL GoGreen의 공식 파트너십 체결을 기념하는 행사입니다. 글로벌 물류 탄소중립의 새로운 이정표를 함께 축하합니다.',
      startDate: pastDate.toISOString(),
      endDate: new Date(pastDate.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      location: '서울 중구 세종대로 110 서울시청',
      status: 'COMPLETED',
      imageUrl: '/images/events/dhl-partnership.jpg',
      tags: ['파트너십', 'DHL', '기념 행사'],
      createdAt: new Date(pastDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: pastDate.toISOString(),
    },
    {
      id: '5',
      title: 'Carbon API Console 워크샵',
      description:
        '개발자를 위한 Carbon API 실습 워크샵입니다. 48개 API 엔드포인트를 실제로 사용해보며 통합 방법을 학습합니다.',
      startDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), 20, 13, 0).toISOString(),
      endDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), 20, 18, 0).toISOString(),
      location: '서울 강남구 테헤란로 152 강남파이낸스센터',
      locationDetails: '개발자 라운지 5층',
      status: 'UPCOMING',
      registrationUrl: '/contact?event=api-workshop',
      maxAttendees: 50,
      currentAttendees: 23,
      tags: ['워크샵', 'API', '개발자'],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(),
    },
    {
      id: '6',
      title: 'GLEC Cloud 사용자 교육',
      description:
        '화주사를 위한 GLEC Cloud 대시보드 사용법 교육입니다. 실시간 탄소배출 모니터링과 리포트 생성 방법을 배웁니다.',
      startDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), 25, 10, 0).toISOString(),
      endDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), 25, 12, 0).toISOString(),
      location: '서울 서초구 서초대로 74길 4 삼성생명 서초타워',
      status: 'UPCOMING',
      registrationUrl: '/contact?event=cloud-training',
      maxAttendees: 80,
      currentAttendees: 54,
      tags: ['교육', 'GLEC Cloud', '대시보드'],
      createdAt: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
      updatedAt: new Date(now.getFullYear(), now.getMonth(), 4).toISOString(),
    },
  ];
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(
      parseInt(searchParams.get('per_page') || '12', 10),
      50 // Max per_page
    );
    const statusFilter = searchParams.get('status');

    // Validation: page must be >= 1
    if (page < 1 || isNaN(page)) {
      const errorResponse: EventsApiError = {
        success: false,
        error: {
          code: 'INVALID_PAGE',
          message: 'Page number must be >= 1',
          details: [{ field: 'page', message: 'Invalid page number' }],
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validation: per_page must be 1-50
    if (per_page < 1 || per_page > 50 || isNaN(per_page)) {
      const errorResponse: EventsApiError = {
        success: false,
        error: {
          code: 'INVALID_PER_PAGE',
          message: 'per_page must be between 1 and 50',
          details: [{ field: 'per_page', message: 'Invalid per_page value' }],
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validation: status filter (if provided)
    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED'];
    if (statusFilter && !validStatuses.includes(statusFilter)) {
      const errorResponse: EventsApiError = {
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          details: [{ field: 'status', message: 'Invalid status value' }],
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: Replace with Prisma query when DB is connected
    // const events = await prisma.event.findMany({
    //   where: {
    //     ...(statusFilter && { status: statusFilter }),
    //   },
    //   orderBy: { startDate: 'asc' },
    //   skip: (page - 1) * per_page,
    //   take: per_page,
    // });

    // Mock implementation (temporary)
    let allEvents = getMockEvents();

    // Filter by status
    if (statusFilter) {
      allEvents = allEvents.filter((e) => e.status === statusFilter);
    }

    // Sort by startDate ASC (upcoming events first)
    allEvents.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB;
    });

    // Pagination
    const total = allEvents.length;
    const total_pages = Math.ceil(total / per_page);
    const startIndex = (page - 1) * per_page;
    const paginatedEvents = allEvents.slice(startIndex, startIndex + per_page);

    // Response format
    const response: EventsApiResponse = {
      success: true,
      data: paginatedEvents,
      meta: {
        page,
        per_page,
        total,
        total_pages,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[GET /api/events] Error:', error);

    const errorResponse: EventsApiError = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
