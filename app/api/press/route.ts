/**
 * GET /api/press
 *
 * Based on: GLEC-API-Specification.yaml (GET /api/press, GET /api/press/{slug})
 * Security: CLAUDE.md - No hardcoding, dynamic data only
 * Purpose: Fetch published press releases from presses table
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - per_page: number (default: 10, max: 50)
 * - search: string (optional)
 * - slug: string (optional) - If provided, returns single press
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import type { Notice as Press } from '@prisma/client';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

// Response type based on API Spec
interface PressResponse {
  success: boolean;
  data: Press[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

interface PressDetailResponse {
  success: boolean;
  data: Press;
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
    // Press always has category=PRESS
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

    if (search) {
      // Search only
      const searchPattern = `%${search}%`;
      countQuery = sql`
        SELECT COUNT(*) as count
        FROM presses
        WHERE status = 'PUBLISHED' AND deleted_at IS NULL
          AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
      `;
      dataQuery = sql`
        SELECT
          id, title, slug, content, excerpt, status,
          thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
          created_at, updated_at
        FROM presses
        WHERE status = 'PUBLISHED' AND deleted_at IS NULL
          AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page}
        OFFSET ${(page - 1) * per_page}
      `;
    } else {
      // No filters
      countQuery = sql`
        SELECT COUNT(*) as count
        FROM presses
        WHERE status = 'PUBLISHED' AND deleted_at IS NULL
      `;
      dataQuery = sql`
        SELECT
          id, title, slug, content, excerpt, status,
          thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
          created_at, updated_at
        FROM presses
        WHERE status = 'PUBLISHED' AND deleted_at IS NULL
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page}
        OFFSET ${(page - 1) * per_page}
      `;
    }

    // Execute queries
    const countResult = await countQuery;
    const total = Number(countResult[0]?.count || 0);
    const total_pages = Math.ceil(total / per_page);

    const pressItems = await dataQuery;

    // Transform to match Press type (snake_case to camelCase for consistency)
    const paginatedPress = pressItems.map((press: any) => ({
      id: press.id,
      title: press.title,
      slug: press.slug,
      content: press.content,
      excerpt: press.excerpt,
      status: press.status,
      thumbnailUrl: press.thumbnail_url,
      mediaOutlet: press.media_outlet,
      externalUrl: press.external_url,
      viewCount: press.view_count,
      publishedAt: press.published_at,
      authorId: press.author_id,
      createdAt: press.created_at,
      updatedAt: press.updated_at,
    }));

    // Response format from API Spec
    const response: PressResponse = {
      success: true,
      data: paginatedPress,
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
    console.error('[GET /api/press] Error:', error);

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
 * Helper function: Get single press by slug
 */
async function getNoticeBySlug(slug: string) {
  try {
    // Query database for press by slug
    const pressItems = await sql`
      SELECT
        id,
        title,
        slug,
        content,
        excerpt,
        status,
        thumbnail_url,
        media_outlet,
        external_url,
        view_count,
        published_at,
        author_id,
        created_at,
        updated_at
      FROM presses
      WHERE slug = ${slug}
        AND status = 'PUBLISHED'
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (pressItems.length === 0) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '요청한 press를 찾을 수 없습니다',
        },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const press = pressItems[0];

    // Increment view count
    await sql`
      UPDATE presses
      SET view_count = view_count + 1,
          updated_at = NOW()
      WHERE id = ${press.id}
    `;

    // Transform to match Press type
    const pressData = {
      id: press.id,
      title: press.title,
      slug: press.slug,
      content: press.content,
      excerpt: press.excerpt,
      status: press.status,
      thumbnailUrl: press.thumbnail_url,
      mediaOutlet: press.media_outlet,
      externalUrl: press.external_url,
      viewCount: press.view_count + 1, // Reflect incremented view count
      publishedAt: press.published_at,
      authorId: press.author_id,
      createdAt: press.created_at,
      updatedAt: press.updated_at,
    };

    const response: PressDetailResponse = {
      success: true,
      data: pressData as any,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[GET /api/press by slug] Error:', error);

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
