/**
 * Meeting Booking API
 * POST /api/meetings/book
 * 
 * Purpose: 고객이 미팅 시간 예약
 * Workflow:
 * 1. 토큰 검증
 * 2. 슬롯 가용성 확인
 * 3. 예약 생성
 * 4. 토큰 사용 처리
 * 5. 예약 확인 이메일 발송 (TODO: Phase 3.5)
 * 6. 리드 활동 로그
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isValidTokenFormat } from '@/lib/meeting-tokens';

const sql = neon(process.env.DATABASE_URL!);

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
    
    // 4. Check slot availability
    const slotResults = await sql`
      SELECT id, title, start_time, end_time, meeting_url, is_available, current_bookings, max_bookings
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
    
    // TODO: Send confirmation email (Phase 3.5)
    
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
        confirmation_sent: false, // TODO: true when email sent
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
