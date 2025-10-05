/**
 * Public Events API
 *
 * Based on: GLEC-API-Specification.yaml
 * Requirements: FR-WEB-015 (이벤트 목록 조회)
 *
 * Security: Public endpoint (no authentication required)
 * Filter: Only returns PUBLISHED events
 *
 * Endpoint: GET /api/events
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - per_page: number (default: 12, max: 50)
 * - status: EventStatus (optional, but public API filters PUBLISHED only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// ============================================================
// Database Connection
// ============================================================

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// Types
// ============================================================

type EventStatus = 'DRAFT' | 'PUBLISHED';

interface EventResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location: string;
  locationDetails: string | null;
  thumbnailUrl: string | null;
  maxParticipants: number | null;
  registrationCount: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: true;
  data: EventResponse[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

// ============================================================
// GET /api/events - List published events
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(
      parseInt(searchParams.get('per_page') || '12', 10),
      50 // Max per_page
    );
    const search = searchParams.get('search');

    // Validation: page must be >= 1
    if (page < 1 || isNaN(page)) {
      const errorResponse: ApiError = {
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
      const errorResponse: ApiError = {
        success: false,
        error: {
          code: 'INVALID_PER_PAGE',
          message: 'per_page must be between 1 and 50',
          details: [{ field: 'per_page', message: 'Invalid per_page value' }],
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Build WHERE clause (always filter PUBLISHED only for public API)
    const conditions: string[] = ["status = 'PUBLISHED'"];
    const params: any[] = [];

    if (search) {
      conditions.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM events ${whereClause}`;
    const countResult = await sql(countQuery, params);
    const total = parseInt(countResult[0].total, 10);

    // Get paginated events with registration count
    const offset = (page - 1) * per_page;
    const eventsQuery = `
      SELECT
        e.*,
        COALESCE(COUNT(er.id), 0)::int as registration_count
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status IN ('PENDING', 'APPROVED')
      ${whereClause}
      GROUP BY e.id
      ORDER BY e.start_date ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(per_page, offset);

    const events = await sql(eventsQuery, params);

    // Transform snake_case to camelCase
    const transformedEvents: EventResponse[] = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      status: event.status,
      startDate: event.start_date,
      endDate: event.end_date,
      location: event.location,
      locationDetails: event.location_details,
      thumbnailUrl: event.thumbnail_url,
      maxParticipants: event.max_participants,
      registrationCount: event.registration_count,
      viewCount: event.view_count,
      publishedAt: event.published_at,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));

    // Response format
    const response: ApiResponse = {
      success: true,
      data: transformedEvents,
      meta: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
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

    const errorResponse: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
