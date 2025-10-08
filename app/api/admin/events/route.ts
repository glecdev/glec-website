/**
 * Admin Events API - List and Create
 *
 * Based on: GLEC-API-Specification.yaml
 * Requirements:
 * - FR-ADMIN-010: 이벤트 목록 조회
 * - FR-ADMIN-011: 이벤트 작성
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 *
 * Endpoints:
 * - GET /api/admin/events - List all events (including DRAFT)
 * - POST /api/admin/events - Create new event
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// ============================================================
// Database Connection
// ============================================================

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// Validation Schemas
// ============================================================

const EventCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().min(1, 'Description is required'),
  start_date: z.string().datetime(), // ISO 8601 datetime
  end_date: z.string().datetime(),
  location: z.string().min(1, 'Location is required').max(200),
  location_details: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  max_participants: z.number().int().positive().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

// ============================================================
// GET /api/admin/events - List events
// ============================================================

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
      const status = searchParams.get('status');
      const search = searchParams.get('search');

      if (page < 1 || isNaN(page)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PAGE',
              message: 'Page number must be >= 1',
            },
          },
          { status: 400 }
        );
      }

      // Build dynamic WHERE clause with Neon Tagged Template Literals
      let countResult;
      let events;
      const offset = (page - 1) * per_page;

      if (status && search) {
        const searchPattern = `%${search}%`;
        countResult = await sql`
          SELECT COUNT(*) as total FROM events
          WHERE deleted_at IS NULL AND status = ${status} AND title ILIKE ${searchPattern}
        `;
        events = await sql`
          SELECT
            e.*,
            COUNT(er.id)::int as registration_count
          FROM events e
          LEFT JOIN event_registrations er ON e.id = er.event_id
          WHERE e.deleted_at IS NULL AND e.status = ${status} AND e.title ILIKE ${searchPattern}
          GROUP BY e.id
          ORDER BY e.start_date ASC
          LIMIT ${per_page} OFFSET ${offset}
        `;
      } else if (status) {
        countResult = await sql`
          SELECT COUNT(*) as total FROM events WHERE deleted_at IS NULL AND status = ${status}
        `;
        events = await sql`
          SELECT
            e.*,
            COUNT(er.id)::int as registration_count
          FROM events e
          LEFT JOIN event_registrations er ON e.id = er.event_id
          WHERE e.deleted_at IS NULL AND e.status = ${status}
          GROUP BY e.id
          ORDER BY e.start_date ASC
          LIMIT ${per_page} OFFSET ${offset}
        `;
      } else if (search) {
        const searchPattern = `%${search}%`;
        countResult = await sql`
          SELECT COUNT(*) as total FROM events WHERE deleted_at IS NULL AND title ILIKE ${searchPattern}
        `;
        events = await sql`
          SELECT
            e.*,
            COUNT(er.id)::int as registration_count
          FROM events e
          LEFT JOIN event_registrations er ON e.id = er.event_id
          WHERE e.deleted_at IS NULL AND e.title ILIKE ${searchPattern}
          GROUP BY e.id
          ORDER BY e.start_date ASC
          LIMIT ${per_page} OFFSET ${offset}
        `;
      } else {
        countResult = await sql`
          SELECT COUNT(*) as total FROM events WHERE deleted_at IS NULL
        `;
        events = await sql`
          SELECT
            e.*,
            COUNT(er.id)::int as registration_count
          FROM events e
          LEFT JOIN event_registrations er ON e.id = er.event_id
          WHERE e.deleted_at IS NULL
          GROUP BY e.id
          ORDER BY e.start_date ASC
          LIMIT ${per_page} OFFSET ${offset}
        `;
      }

      const total = parseInt(countResult[0].total, 10);

      // Transform snake_case to camelCase
      const transformedEvents = events.map((event: any) => ({
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
        viewCount: event.view_count,
        publishedAt: event.published_at,
        authorId: event.author_id,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        _count: {
          registrations: event.registration_count,
        },
      }));

      return NextResponse.json(
        {
          success: true,
          data: transformedEvents,
          meta: {
            page,
            per_page,
            total,
            total_pages: Math.ceil(total / per_page),
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[GET /api/admin/events] Error:', error);
      console.error('[GET /api/admin/events] Error Details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: (error as any)?.code,
        detail: (error as any)?.detail,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// POST /api/admin/events - Create event
// ============================================================

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();

      // Validate with Zod
      const validationResult = EventCreateSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const validated = validationResult.data;

      // Check slug uniqueness (Neon Tagged Template Literals)
      const existingEvent = await sql`
        SELECT id FROM events WHERE slug = ${validated.slug}
      `;

      if (existingEvent.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SLUG_EXISTS',
              message: 'Slug already exists. Please use a different slug.',
            },
          },
          { status: 400 }
        );
      }

      // Validate date range
      const startDate = new Date(validated.start_date);
      const endDate = new Date(validated.end_date);
      if (endDate < startDate) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'End date must be after start date',
            },
          },
          { status: 400 }
        );
      }

      // Insert event (Neon Tagged Template Literals)
      const now = new Date();
      const publishedAt = validated.status === 'PUBLISHED' ? now : null;

      // Generate UUID for new event
      const newId = crypto.randomUUID();

      const result = await sql`
        INSERT INTO events (
          id,
          title, slug, description, status, start_date, end_date,
          location, location_details, thumbnail_url, max_participants,
          published_at, author_id, created_at, updated_at
        )
        VALUES (
          ${newId},
          ${validated.title},
          ${validated.slug},
          ${validated.description},
          ${validated.status},
          ${validated.start_date},
          ${validated.end_date},
          ${validated.location},
          ${validated.location_details || null},
          ${validated.thumbnail_url || null},
          ${validated.max_participants || null},
          ${publishedAt},
          ${user.userId},
          ${now},
          ${now}
        )
        RETURNING *
      `;

      const event = result[0];

      // Transform to camelCase
      const transformedEvent = {
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
        viewCount: event.view_count,
        publishedAt: event.published_at,
        authorId: event.author_id,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      };

      console.log('[POST /api/admin/events] Created event:', {
        id: event.id,
        title: event.title,
        slug: event.slug,
        status: event.status,
      });

      return NextResponse.json(
        {
          success: true,
          data: transformedEvent,
        },
        {
          status: 201,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[POST /api/admin/events] Error:', error);
      console.error('[POST /api/admin/events] Error Details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: (error as any)?.code,
        detail: (error as any)?.detail,
      });

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_JSON',
              message: 'Invalid JSON in request body',
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
