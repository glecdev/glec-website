/**
 * Public Event Registration API
 *
 * Based on: GLEC-API-Specification.yaml
 * Requirements: FR-WEB-016 (이벤트 참가 신청)
 *
 * Security: Public endpoint (no authentication required)
 *
 * Endpoint:
 * - POST /api/events/[slug]/register - Create event registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';

// ============================================================
// Database Connection
// ============================================================

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// Validation Schema
// ============================================================

const RegistrationCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone is required').max(20),
  company: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: 'Privacy consent is required',
  }),
  marketing_consent: z.boolean().optional().default(false),
});

// ============================================================
// POST - Create registration
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const body = await request.json();

    // Validate
    const validationResult = RegistrationCreateSchema.safeParse(body);

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

    // Get event by slug
    const eventResult = await sql(
      'SELECT * FROM events WHERE slug = $1 AND status = $2',
      [slug, 'PUBLISHED']
    );

    if (eventResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EVENT_NOT_FOUND',
            message: '이벤트를 찾을 수 없거나 참가 신청이 마감되었습니다',
          },
        },
        { status: 404 }
      );
    }

    const event = eventResult[0];

    // Check if event is closed
    if (event.status === 'CLOSED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EVENT_CLOSED',
            message: '이벤트 참가 신청이 마감되었습니다',
          },
        },
        { status: 400 }
      );
    }

    // Check if max participants reached
    if (event.max_participants) {
      const countResult = await sql(
        `SELECT COUNT(*)::int as count FROM event_registrations
         WHERE event_id = $1 AND status IN ('PENDING', 'APPROVED')`,
        [event.id]
      );

      const currentCount = countResult[0].count;

      if (currentCount >= event.max_participants) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'EVENT_FULL',
              message: '참가 신청 인원이 마감되었습니다',
            },
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicate registration (same email for same event)
    const duplicateCheck = await sql(
      'SELECT id FROM event_registrations WHERE event_id = $1 AND email = $2',
      [event.id, validated.email]
    );

    if (duplicateCheck.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_REGISTRATION',
            message: '이미 참가 신청하셨습니다',
          },
        },
        { status: 400 }
      );
    }

    // Create registration
    const now = new Date();
    const insertQuery = `
      INSERT INTO event_registrations (
        event_id, name, email, phone, company, job_title, message,
        status, privacy_consent, marketing_consent, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const result = await sql(insertQuery, [
      event.id,
      validated.name,
      validated.email,
      validated.phone,
      validated.company || null,
      validated.job_title || null,
      validated.message || null,
      'PENDING', // Default status
      validated.privacy_consent,
      validated.marketing_consent,
      now,
      now,
    ]);

    const registration = result[0];

    // Transform to camelCase
    const transformedRegistration = {
      id: registration.id,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      company: registration.company,
      jobTitle: registration.job_title,
      status: registration.status,
      createdAt: registration.created_at,
    };

    console.log('[POST /api/events/[slug]/register] Created registration:', {
      eventId: event.id,
      email: registration.email,
      status: registration.status,
    });

    return NextResponse.json(
      {
        success: true,
        data: transformedRegistration,
        message: '참가 신청이 완료되었습니다. 관리자 승인 후 이메일로 안내드리겠습니다.',
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[POST /api/events/[slug]/register] Error:', error);

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
}
