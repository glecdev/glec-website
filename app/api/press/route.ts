/**
 * GET /api/press
 *
 * Based on: GLEC-API-Specification.yaml (GET /api/press)
 * Security: CLAUDE.md - No hardcoding, dynamic data only
 * Purpose: Fetch published press releases for website
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - per_page: number (default: 10, max: 50)
 * - search: string (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMockPressWithIds } from '@/lib/mock-data';
import type { Press } from '@prisma/client';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


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
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(
      parseInt(searchParams.get('per_page') || '10', 10),
      50
    );
    const search = searchParams.get('search');

    // Validation
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
    let allPress = getMockPressWithIds();

    // Filter by status (only PUBLISHED)
    allPress = allPress.filter((p) => p.status === 'PUBLISHED');

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      allPress = allPress.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by publishedAt DESC
    allPress.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    // Pagination
    const total = allPress.length;
    const total_pages = Math.ceil(total / per_page);
    const startIndex = (page - 1) * per_page;
    const paginatedPress = allPress.slice(startIndex, startIndex + per_page);

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
