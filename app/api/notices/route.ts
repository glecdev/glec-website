/**
 * GET /api/notices
 *
 * Based on: GLEC-API-Specification.yaml (GET /api/notices, GET /api/notices/{slug})
 * Security: CLAUDE.md - No hardcoding, dynamic data only
 * Purpose: Fetch published notices for website
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - per_page: number (default: 10, max: 50)
 * - category: NoticeCategory (optional)
 * - search: string (optional)
 * - slug: string (optional) - If provided, returns single notice
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMockNoticesWithIds } from '@/lib/mock-data';
import type { Notice } from '@prisma/client';

// Response type based on API Spec
interface NoticesResponse {
  success: boolean;
  data: Notice[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

interface NoticeDetailResponse {
  success: boolean;
  data: Notice;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    // If slug is provided, return single notice
    if (slug) {
      return await getNoticeBySlug(slug);
    }

    // Otherwise, return paginated list
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(
      parseInt(searchParams.get('per_page') || '10', 10),
      50 // Max per_page from API Spec
    );
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Validation: page must be >= 1
    if (page < 1 || isNaN(page)) {
      const errorResponse: ErrorResponse = {
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
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_PER_PAGE',
          message: 'per_page must be between 1 and 50',
          details: [{ field: 'per_page', message: 'Invalid per_page value' }],
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: Replace with Prisma query when DB is connected
    // const notices = await prisma.notice.findMany({
    //   where: {
    //     status: 'PUBLISHED',
    //     ...(category && { category: category as NoticeCategory }),
    //     ...(search && {
    //       OR: [
    //         { title: { contains: search, mode: 'insensitive' } },
    //         { content: { contains: search, mode: 'insensitive' } },
    //       ],
    //     }),
    //   },
    //   orderBy: { publishedAt: 'desc' },
    //   skip: (page - 1) * per_page,
    //   take: per_page,
    // });

    // Mock implementation (temporary)
    let allNotices = getMockNoticesWithIds();

    // Filter by status (only PUBLISHED)
    allNotices = allNotices.filter((n) => n.status === 'PUBLISHED');

    // Filter by category
    if (category) {
      allNotices = allNotices.filter((n) => n.category === category);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      allNotices = allNotices.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by publishedAt DESC
    allNotices.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    // Pagination
    const total = allNotices.length;
    const total_pages = Math.ceil(total / per_page);
    const startIndex = (page - 1) * per_page;
    const paginatedNotices = allNotices.slice(
      startIndex,
      startIndex + per_page
    );

    // Response format from API Spec
    const response: NoticesResponse = {
      success: true,
      data: paginatedNotices,
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
    console.error('[GET /api/notices] Error:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Helper function: Get single notice by slug
 */
async function getNoticeBySlug(slug: string) {
  try {
    // TODO: Replace with Prisma query when DB is connected
    // const notice = await prisma.notice.findFirst({
    //   where: {
    //     slug,
    //     status: 'PUBLISHED',
    //   },
    // });

    // Mock implementation (temporary)
    const allNotices = getMockNoticesWithIds();
    const notice = allNotices.find(
      (n) => n.slug === slug && n.status === 'PUBLISHED'
    );

    if (!notice) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '요청한 공지사항을 찾을 수 없습니다',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Increment view count (TODO: Update in DB when connected)
    // await prisma.notice.update({
    //   where: { id: notice.id },
    //   data: { viewCount: { increment: 1 } },
    // });

    const response: NoticeDetailResponse = {
      success: true,
      data: notice,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[GET /api/notices by slug] Error:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
