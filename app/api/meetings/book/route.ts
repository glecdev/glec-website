/**
 * Meeting Booking API
 * POST /api/meetings/book
 *
 * Purpose: 고객이 미팅 시간 예약
 * Workflow:
 * 1. 토큰 검증 (format, expiry, used)
 * 2. 리드 정보 조회
 * 3. 슬롯 가용성 확인
 * 4. 예약 생성 (booking_status=CONFIRMED)
 * 5. 토큰 사용 처리 (used=TRUE, used_at=NOW)
 * 6. 슬롯 current_bookings 증가
 * 7. 리드 활동 로그 (MEETING_BOOKED)
 * 8. 예약 확인 이메일 발송 (Resend)
 * 9. 이메일 활동 로그 (EMAIL_SENT)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { isValidTokenFormat } from '@/lib/meeting-tokens';
import { renderMeetingConfirmation, MeetingConfirmationData } from '@/lib/email-templates/meeting-confirmation';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY);

interface BookMeetingRequest {
  token: string;
  meeting_slot_id: string;
  requested_agenda?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: BookMeetingRequest = await req.json();
    
    // 1. Validation
    if (!body.token || !isValidTokenFormat(body.token)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid token format',
          },
        },
        { status: 400 }
      );
    }
    
    if (!body.meeting_slot_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'meeting_slot_id is required',
          },
        },
        { status: 400 }
      );
    }
    
    // 2. Token lookup & validation
    const tokenResults = await sql`
      SELECT id, lead_type, lead_id, expires_at, used, used_at
      FROM meeting_proposal_tokens
      WHERE token = ${body.token}
      LIMIT 1
    `;
    
    if (tokenResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_NOT_FOUND',
            message: 'Token not found',
          },
        },
        { status: 404 }
      );
    }
    
    const tokenData = tokenResults[0];
    
    // Check expiry
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired',
          },
        },
        { status: 410 }
      );
    }
    
    // Check if already used
    if (tokenData.used) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_ALREADY_USED',
            message: 'This booking link has already been used',
          },
        },
        { status: 410 }
      );
    }
    
    // 3. Get lead info
    let lead: any = null;
    
    if (tokenData.lead_type === 'CONTACT') {
      const results = await sql`
        SELECT id, company_name, contact_name, email, phone
        FROM contacts
        WHERE id = ${tokenData.lead_id}::UUID
        LIMIT 1
      `;
      lead = results[0];
    } else if (tokenData.lead_type === 'LIBRARY_LEAD') {
      const results = await sql`
        SELECT id, company_name, contact_name, email, phone
        FROM library_leads
        WHERE id = ${tokenData.lead_id}
        LIMIT 1
      `;
      lead = results[0];
    }
    
    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEAD_NOT_FOUND',
            message: 'Lead information not found',
          },
        },
        { status: 404 }
      );
    }
    
    // 4. Check slot availability and get admin info
    const slotResults = await sql`
      SELECT
        id, title, meeting_type, duration_minutes, start_time, end_time,
        meeting_url, meeting_location, office_address, is_available, current_bookings, max_bookings,
        assigned_to
      FROM meeting_slots
      WHERE id = ${body.meeting_slot_id}
      AND is_available = TRUE
      AND start_time >= NOW()
      AND current_bookings < max_bookings
      LIMIT 1
    `;
    
    if (slotResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SLOT_NOT_AVAILABLE',
            message: 'This meeting slot is no longer available',
          },
        },
        { status: 409 }
      );
    }
    
    const slot = slotResults[0];
    
    // 5. Create booking
    const bookingResults = await sql`
      INSERT INTO meeting_bookings (
        meeting_slot_id,
        lead_type,
        lead_id,
        company_name,
        contact_name,
        email,
        phone,
        requested_agenda,
        booking_status,
        confirmed_at
      ) VALUES (
        ${body.meeting_slot_id},
        ${tokenData.lead_type},
        ${tokenData.lead_id}::UUID,
        ${lead.company_name},
        ${lead.contact_name},
        ${lead.email},
        ${lead.phone || null},
        ${body.requested_agenda || null},
        'CONFIRMED',
        NOW()
      )
      RETURNING *
    `;
    
    const booking = bookingResults[0];
    
    // 6. Mark token as used
    await sql`
      UPDATE meeting_proposal_tokens
      SET used = TRUE, used_at = NOW()
      WHERE id = ${tokenData.id}
    `;
    
    // 7. Update slot current_bookings (trigger will handle this automatically)
    // But we manually update for immediate consistency
    await sql`
      UPDATE meeting_slots
      SET current_bookings = current_bookings + 1
      WHERE id = ${body.meeting_slot_id}
    `;
    
    // 8. Log activity
    await sql`
      INSERT INTO lead_activities (
        lead_type,
        lead_id,
        activity_type,
        activity_description,
        metadata
      ) VALUES (
        ${tokenData.lead_type},
        ${tokenData.lead_id}::UUID,
        'MEETING_BOOKED',
        '미팅 예약 완료',
        ${JSON.stringify({
          booking_id: booking.id,
          meeting_slot_id: body.meeting_slot_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
        })}
      )
    `;
    
    // 9. Send confirmation email
    let emailSent = false;
    let emailId: string | undefined;

    try {
      // Calculate duration
      const startTime = new Date(slot.start_time);
      const endTime = new Date(slot.end_time);
      const durationMinutes = slot.duration_minutes || Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      const durationHours = Math.floor(durationMinutes / 60);
      const durationRemainingMinutes = durationMinutes % 60;
      const durationLabel =
        durationHours > 0
          ? `${durationHours}시간${durationRemainingMinutes > 0 ? ` ${durationRemainingMinutes}분` : ''}`
          : `${durationMinutes}분`;

      // Default admin info (replace with actual admin lookup if assigned_to is set)
      const adminName = process.env.DEFAULT_ADMIN_NAME || 'GLEC 담당자';
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'contact@glec.io';
      const adminPhone = process.env.DEFAULT_ADMIN_PHONE || '02-1234-5678';

      const emailData: MeetingConfirmationData = {
        contactName: lead.contact_name,
        companyName: lead.company_name,
        email: lead.email,
        phone: lead.phone || undefined,
        meetingTitle: slot.title,
        meetingType: slot.meeting_type,
        startTime: slot.start_time,
        endTime: slot.end_time,
        duration: durationLabel,
        meetingUrl: slot.meeting_url || undefined,
        meetingLocation: slot.meeting_location || 'ONLINE',
        officeAddress: slot.office_address || undefined,
        adminName,
        adminEmail,
        adminPhone,
        bookingId: booking.id,
        requestedAgenda: body.requested_agenda || undefined,
      };

      const emailHtml = renderMeetingConfirmation(emailData);

      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: lead.email,
        subject: `[GLEC] 미팅 예약이 확정되었습니다 - ${slot.title}`,
        html: emailHtml,
      });

      if (emailResult.error) {
        console.error('[Meeting Booking] Email send failed:', emailResult.error);
      } else {
        emailSent = true;
        emailId = emailResult.data?.id;

        // Log email activity
        await sql`
          INSERT INTO lead_activities (
            lead_type,
            lead_id,
            activity_type,
            activity_description,
            metadata
          ) VALUES (
            ${tokenData.lead_type},
            ${tokenData.lead_id}::UUID,
            'EMAIL_SENT',
            '미팅 확인 이메일 발송',
            ${JSON.stringify({
              email_id: emailId,
              email_type: 'MEETING_CONFIRMATION',
              booking_id: booking.id,
            })}
          )
        `;
      }
    } catch (emailError: any) {
      console.error('[Meeting Booking] Email error:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        booking_id: booking.id,
        meeting_slot: {
          title: slot.title,
          start_time: slot.start_time,
          end_time: slot.end_time,
          meeting_url: slot.meeting_url,
        },
        booking_status: 'CONFIRMED',
        confirmation_sent: emailSent,
        email_id: emailId,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Meeting Booking] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to create booking',
        },
      },
      { status: 500 }
    );
  }
}
