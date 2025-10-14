/**
 * Admin Event Registration Update API
 *
 * Based on: GLEC-API-Specification.yaml
 * Requirements: FR-ADMIN-014 (이벤트 참가 신청 상태 변경)
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 *
 * Endpoint:
 * - PATCH /api/admin/events/[id]/registrations/[registrationId] - Update registration status
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
// Validation Schema
// ============================================================

const RegistrationUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status must be APPROVED, REJECTED, or CANCELLED' }),
  }),
  admin_notes: z.string().optional(),
});

// ============================================================
// PATCH - Update registration status
// ============================================================

export const PATCH = withAuth(
  async (request: NextRequest, { params }: { params: Promise<{ id: string; registrationId: string }> }) => {
    try {
      const { id: eventId, registrationId } = await params;
      const body = await request.json();

      // Validate
      const validationResult = RegistrationUpdateSchema.safeParse(body);

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

      // Check if registration exists and belongs to this event
      const existingReg = await sql`SELECT * FROM event_registrations WHERE id = ${registrationId} AND event_id = ${eventId}`;

      if (existingReg.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '참가 신청을 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      // Update status
      const result = await sql`
        UPDATE event_registrations
        SET status = ${validated.status},
            admin_notes = ${validated.admin_notes || existingReg[0].admin_notes},
            updated_at = ${new Date().toISOString()}
        WHERE id = ${registrationId}
        RETURNING *
      `;

      const registration = result[0];

      // Transform to camelCase
      const transformedRegistration = {
        id: registration.id,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        company: registration.company,
        jobTitle: registration.job_title,
        message: registration.message,
        status: registration.status,
        privacyConsent: registration.privacy_consent,
        marketingConsent: registration.marketing_consent,
        adminNotes: registration.admin_notes,
        createdAt: registration.created_at,
        updatedAt: registration.updated_at,
      };

      console.log('[PATCH /api/admin/events/[id]/registrations/[registrationId]] Updated registration:', {
        id: registration.id,
        status: registration.status,
      });

      return NextResponse.json(
        {
          success: true,
          data: transformedRegistration,
        },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[PATCH /api/admin/events/[id]/registrations/[registrationId]] Error:', error);

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
