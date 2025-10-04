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
import { neon } from '@neondatabase/serverless';
import type { Notice } from '@prisma/client';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

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

    // Build SQL query with proper parameter binding
    // Note: Neon serverless driver uses tagged template literals for safety
    let countQuery;
    let dataQuery;

    if (category && search) {
      // Both filters
      const searchPattern = `%${search}%`;
      countQuery = sql`
        SELECT COUNT(*) as count
        FROM notices
        WHERE status = 'PUBLISHED'
          AND category = ${category}
          AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
      `;
      dataQuery = sql`
        SELECT
          id, title, slug, content, excerpt, status, category,
          thumbnail_url, view_count, published_at, author_id,
          created_at, updated_at
        FROM notices
        WHERE status = 'PUBLISHED'
          AND category = ${category}
          AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page}
        OFFSET ${(page - 1) * per_page}
      `;
    } else if (category) {
      // Category only
      countQuery = sql`
        SELECT COUNT(*) as count
        FROM notices
        WHERE status = 'PUBLISHED'
          AND category = ${category}
      `;
      dataQuery = sql`
        SELECT
          id, title, slug, content, excerpt, status, category,
          thumbnail_url, view_count, published_at, author_id,
          created_at, updated_at
        FROM notices
        WHERE status = 'PUBLISHED'
          AND category = ${category}
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page}
        OFFSET ${(page - 1) * per_page}
      `;
    } else if (search) {
      // Search only
      const searchPattern = `%${search}%`;
      countQuery = sql`
        SELECT COUNT(*) as count
        FROM notices
        WHERE status = 'PUBLISHED'
          AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
      `;
      dataQuery = sql`
        SELECT
          id, title, slug, content, excerpt, status, category,
          thumbnail_url, view_count, published_at, author_id,
          created_at, updated_at
        FROM notices
        WHERE status = 'PUBLISHED'
          AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page}
        OFFSET ${(page - 1) * per_page}
      `;
    } else {
      // No filters
      countQuery = sql`
        SELECT COUNT(*) as count
        FROM notices
        WHERE status = 'PUBLISHED'
      `;
      dataQuery = sql`
        SELECT
          id, title, slug, content, excerpt, status, category,
          thumbnail_url, view_count, published_at, author_id,
          created_at, updated_at
        FROM notices
        WHERE status = 'PUBLISHED'
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page}
        OFFSET ${(page - 1) * per_page}
      `;
    }

    // Execute queries
    const countResult = await countQuery;
    const total = Number(countResult[0]?.count || 0);
    const total_pages = Math.ceil(total / per_page);

    const notices = await dataQuery;

    // Transform to match Notice type (snake_case to camelCase for consistency)
    const paginatedNotices = notices.map((notice: any) => ({
      id: notice.id,
      title: notice.title,
      slug: notice.slug,
      content: notice.content,
      excerpt: notice.excerpt,
      status: notice.status,
      category: notice.category,
      thumbnailUrl: notice.thumbnail_url,
      viewCount: notice.view_count,
      publishedAt: notice.published_at,
      authorId: notice.author_id,
      createdAt: notice.created_at,
      updatedAt: notice.updated_at,
    }));

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
    // Query database for notice by slug
    const notices = await sql`
      SELECT
        id,
        title,
        slug,
        content,
        excerpt,
        status,
        category,
        thumbnail_url,
        view_count,
        published_at,
        author_id,
        created_at,
        updated_at
      FROM notices
      WHERE slug = ${slug}
        AND status = 'PUBLISHED'
      LIMIT 1
    `;

    if (notices.length === 0) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '요청한 공지사항을 찾을 수 없습니다',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const notice = notices[0];

    // Increment view count
    await sql`
      UPDATE notices
      SET view_count = view_count + 1,
          updated_at = NOW()
      WHERE id = ${notice.id}
    `;

    // Transform to match Notice type
    const noticeData = {
      id: notice.id,
      title: notice.title,
      slug: notice.slug,
      content: notice.content,
      excerpt: notice.excerpt,
      status: notice.status,
      category: notice.category,
      thumbnailUrl: notice.thumbnail_url,
      viewCount: notice.view_count + 1, // Reflect incremented view count
      publishedAt: notice.published_at,
      authorId: notice.author_id,
      createdAt: notice.created_at,
      updatedAt: notice.updated_at,
    };

    const response: NoticeDetailResponse = {
      success: true,
      data: noticeData as any,
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
