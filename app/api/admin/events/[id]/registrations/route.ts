/**
 * Admin Event Registrations API
 *
 * Based on: GLEC-API-Specification.yaml
 * Requirements: FR-ADMIN-014 (이벤트 참가 신청 관리)
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 *
 * Endpoint:
 * - GET /api/admin/events/[id]/registrations - Get all registrations for an event
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';

// ============================================================
// Database Connection
// ============================================================

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// GET /api/admin/events/[id]/registrations
// ============================================================

export const GET = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const eventId = params.id;
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status');
      const search = searchParams.get('search');

      // First, get event details
      const eventResult = await sql`SELECT * FROM events WHERE id = ${eventId}`;

      if (eventResult.length === 0) {
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

      const event = eventResult[0];

      // Build WHERE clause for registrations
      const conditions: string[] = ['event_id = $1'];
      const params: any[] = [eventId];

      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }

      if (search) {
        conditions.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      const whereClause = conditions.join(' AND ');

      // Get registrations
      const registrationsQuery = `
        SELECT * FROM event_registrations
        WHERE ${whereClause}
        ORDER BY created_at DESC
      `;

      const registrations = await sql.query(registrationsQuery, params);

      // Transform snake_case to camelCase
      const transformedRegistrations = registrations.map((reg: any) => ({
        id: reg.id,
        name: reg.name,
        email: reg.email,
        phone: reg.phone,
        company: reg.company,
        jobTitle: reg.job_title,
        message: reg.message,
        status: reg.status,
        privacyConsent: reg.privacy_consent,
        marketingConsent: reg.marketing_consent,
        adminNotes: reg.admin_notes,
        createdAt: reg.created_at,
        updatedAt: reg.updated_at,
      }));

      const transformedEvent = {
        id: event.id,
        title: event.title,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        maxParticipants: event.max_participants,
      };

      return NextResponse.json(
        {
          success: true,
          data: {
            event: transformedEvent,
            registrations: transformedRegistrations,
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[GET /api/admin/events/[id]/registrations] Error:', error);
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
