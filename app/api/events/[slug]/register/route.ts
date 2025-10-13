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
import { addWebinarRegistrant } from '@/lib/zoom';
import { Resend } from 'resend';
import { renderWebinarInvitation, WebinarInvitationData } from '@/lib/email-templates/webinar-invitation';
import crypto from 'crypto';

// ============================================================
// Database Connection
// ============================================================

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY);

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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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
    const eventResult = await sql`
      SELECT * FROM events WHERE slug = ${slug} AND status = 'PUBLISHED'
    `;

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
      const countResult = await sql`
        SELECT COUNT(*)::int as count FROM event_registrations
        WHERE event_id = ${event.id} AND status IN ('PENDING', 'APPROVED')
      `;

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
    const duplicateCheck = await sql`
      SELECT id FROM event_registrations
      WHERE event_id = ${event.id} AND email = ${validated.email}
    `;

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
    const registrationId = crypto.randomUUID();

    const result = await sql`
      INSERT INTO event_registrations (
        id, event_id, name, email, phone, company, job_title, message,
        status, privacy_consent, marketing_consent, created_at, updated_at
      )
      VALUES (
        ${registrationId},
        ${event.id},
        ${validated.name},
        ${validated.email},
        ${validated.phone},
        ${validated.company || null},
        ${validated.job_title || null},
        ${validated.message || null},
        'PENDING',
        ${validated.privacy_consent},
        ${validated.marketing_consent},
        ${now},
        ${now}
      )
      RETURNING *
    `;

    const registration = result[0];

    // Zoom Webinar 자동화 (WEBINAR 타입 이벤트만)
    let webinarJoinUrl: string | null = null;
    let webinarRegistrantId: string | null = null;

    if (event.meeting_type === 'WEBINAR' && event.zoom_webinar_id) {
      try {
        // Zoom Webinar에 참가자 등록
        const [firstName, ...lastNameParts] = validated.name.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        const registrant = await addWebinarRegistrant(
          parseInt(event.zoom_webinar_id),
          {
            email: validated.email,
            first_name: firstName,
            last_name: lastName,
            org: validated.company || '',
            job_title: validated.job_title || '',
            phone: validated.phone || '',
          }
        );

        webinarJoinUrl = registrant.join_url;
        webinarRegistrantId = registrant.id;

        console.log(`[Webinar Registration] Added to Zoom: ${registrant.email} -> ${webinarJoinUrl}`);
      } catch (zoomError) {
        console.error('[Webinar Registration] Zoom API error:', zoomError);
        // Zoom 실패해도 등록은 계속 진행 (graceful degradation)
      }
    }

    // 웨비나 초대장 이메일 발송 (WEBINAR 타입만)
    let emailSent = false;
    let emailId: string | undefined;

    if (event.meeting_type === 'WEBINAR' && webinarJoinUrl) {
      try {
        const emailData: WebinarInvitationData = {
          participantName: validated.name,
          eventTitle: event.title,
          eventDescription: event.description,
          startTime: event.start_date,
          endTime: event.end_date,
          location: event.location,
          webinarJoinUrl: webinarJoinUrl,
          thumbnailUrl: event.thumbnail_url || undefined,
        };

        const emailHtml = renderWebinarInvitation(emailData);

        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: validated.email,
          subject: `[GLEC] ${event.title} 웨비나 초대장`,
          html: emailHtml,
        });

        if (emailResult.error) {
          console.error('[Webinar Registration] Email send failed:', emailResult.error);
        } else {
          emailSent = true;
          emailId = emailResult.data?.id;
          console.log(`[Webinar Registration] Invitation email sent: ${emailId}`);
        }
      } catch (emailError) {
        console.error('[Webinar Registration] Email error:', emailError);
      }
    }

    // Note: Event registrations are stored in event_registrations table
    // Marketing consent is tracked there for future campaigns
    // library_leads are only for document download requests (require library_item_id)
    if (validated.marketing_consent) {
      console.log(`[Event Registration] Marketing consent given: ${validated.email}`);
    }

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
      webinarJoinUrl: webinarJoinUrl, // 웨비나 참가 URL
      emailSent: emailSent, // 이메일 발송 여부
    };

    console.log('[POST /api/events/[slug]/register] Created registration:', {
      eventId: event.id,
      email: registration.email,
      status: registration.status,
      meetingType: event.meeting_type,
      webinarRegistered: !!webinarJoinUrl,
    });

    const successMessage = event.meeting_type === 'WEBINAR' && emailSent
      ? '참가 신청이 완료되었습니다. 웨비나 초대장을 이메일로 발송했습니다.'
      : '참가 신청이 완료되었습니다. 관리자 승인 후 이메일로 안내드리겠습니다.';

    return NextResponse.json(
      {
        success: true,
        data: transformedRegistration,
        message: successMessage,
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
