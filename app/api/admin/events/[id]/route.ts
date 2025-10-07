/**
 * Admin Event Single Operations API
 *
 * Based on: GLEC-API-Specification.yaml
 * Requirements:
 * - FR-ADMIN-012: 이벤트 수정
 * - FR-ADMIN-013: 이벤트 삭제
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 *
 * Endpoints:
 * - GET /api/admin/events/[id] - Get single event
 * - PATCH /api/admin/events/[id] - Update event
 * - DELETE /api/admin/events/[id] - Delete event (cascade delete registrations)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';

// ============================================================
// Database Connection
// ============================================================

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// Validation Schemas
// ============================================================

const EventUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  location: z.string().min(1).max(200).optional(),
  location_details: z.string().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable(),
  max_participants: z.number().int().positive().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
});

// ============================================================
// GET /api/admin/events/[id] - Get single event
// ============================================================

export const GET = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const eventId = params.id;

      const result = await sql`SELECT * FROM events WHERE id = ${eventId}`;

      if (result.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '이벤트를 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

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

      return NextResponse.json(
        {
          success: true,
          data: transformedEvent,
        },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[GET /api/admin/events/[id]] Error:', error);
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
// PATCH /api/admin/events/[id] - Update event
// ============================================================

export const PATCH = withAuth(
  async (request: NextRequest, { params, user }) => {
    try {
      const eventId = params.id;
      const body = await request.json();

      // Validate with Zod
      const validationResult = EventUpdateSchema.safeParse(body);

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

      // Check if event exists
      const existingEvent = await sql`SELECT * FROM events WHERE id = ${eventId}`;

      if (existingEvent.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '이벤트를 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      // Check slug uniqueness if slug is being changed
      if (validated.slug && validated.slug !== existingEvent[0].slug) {
        const slugExists = await sql`SELECT id FROM events WHERE slug = ${validated.slug} AND id != ${eventId}`;

        if (slugExists.length > 0) {
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
      }

      // Validate date range if both dates are provided
      if (validated.start_date && validated.end_date) {
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
      }

      // Build update query dynamically
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (validated.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        params.push(validated.title);
      }
      if (validated.slug !== undefined) {
        updates.push(`slug = $${paramIndex++}`);
        params.push(validated.slug);
      }
      if (validated.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        params.push(validated.description);
      }
      if (validated.start_date !== undefined) {
        updates.push(`start_date = $${paramIndex++}`);
        params.push(validated.start_date);
      }
      if (validated.end_date !== undefined) {
        updates.push(`end_date = $${paramIndex++}`);
        params.push(validated.end_date);
      }
      if (validated.location !== undefined) {
        updates.push(`location = $${paramIndex++}`);
        params.push(validated.location);
      }
      if ('location_details' in validated) {
        updates.push(`location_details = $${paramIndex++}`);
        params.push(validated.location_details);
      }
      if ('thumbnail_url' in validated) {
        updates.push(`thumbnail_url = $${paramIndex++}`);
        params.push(validated.thumbnail_url);
      }
      if ('max_participants' in validated) {
        updates.push(`max_participants = $${paramIndex++}`);
        params.push(validated.max_participants);
      }

      // Auto-update publishedAt if status changes to PUBLISHED
      if (validated.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        params.push(validated.status);

        if (validated.status === 'PUBLISHED' && existingEvent[0].status !== 'PUBLISHED') {
          updates.push(`published_at = $${paramIndex++}`);
          params.push(new Date());
        }
      }

      // Always update updated_at
      updates.push(`updated_at = $${paramIndex++}`);
      params.push(new Date());

      // Add event ID as last parameter
      params.push(eventId);

      const updateQuery = `
        UPDATE events
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await sql.query(updateQuery, params);
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

      console.log('[PATCH /api/admin/events/[id]] Updated event:', {
        id: event.id,
        title: event.title,
        status: event.status,
      });

      return NextResponse.json(
        {
          success: true,
          data: transformedEvent,
        },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[PATCH /api/admin/events/[id]] Error:', error);

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

// ============================================================
// DELETE /api/admin/events/[id] - Delete event
// ============================================================

export const DELETE = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const eventId = params.id;

      // Check if event exists and is not already deleted
      const existingEvent = await sql`SELECT id FROM events WHERE id = ${eventId} AND deleted_at IS NULL`;

      if (existingEvent.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '이벤트를 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      // Soft delete event (set deleted_at timestamp)
      await sql`UPDATE events SET deleted_at = NOW(), updated_at = NOW() WHERE id = ${eventId}`;

      console.log('[DELETE /api/admin/events/[id]] Soft deleted event:', {
        id: eventId,
      });

      // Return 200 OK with success message
      return NextResponse.json(
        {
          success: true,
          message: '이벤트가 삭제되었습니다',
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[DELETE /api/admin/events/[id]] Error:', error);
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
