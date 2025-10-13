/**
 * Admin Meeting Booking Detail API
 * GET /api/admin/meetings/bookings/[id]
 *
 * Purpose: 특정 미팅 예약의 상세 정보 조회
 * Features:
 * - 예약 상세 정보 (상태, 안건, 취소 이유 등)
 * - 고객 정보 (회사명, 담당자, 연락처)
 * - 미팅 슬롯 정보 (시간, 장소, 타입)
 * - 예약 히스토리 및 액션
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch booking with full details
    const bookings = await sql`
      SELECT
        mb.id,
        mb.meeting_slot_id,
        mb.lead_type,
        mb.lead_id,
        mb.booking_status,
        mb.requested_agenda,
        mb.created_at,
        mb.cancelled_at,
        mb.cancellation_reason,

        -- Meeting slot info
        ms.title as meeting_title,
        ms.start_time,
        ms.end_time,
        ms.duration_minutes,
        ms.meeting_location,
        ms.meeting_type,
        ms.meeting_url,
        ms.max_participants,
        ms.status as slot_status,

        -- Lead info (CONTACT)
        c.company_name as contact_company,
        c.contact_name as contact_name,
        c.email as contact_email,
        c.phone as contact_phone,
        c.position as contact_position,
        c.consent_date as contact_consent_date,

        -- Lead info (LIBRARY_LEAD)
        ll.company_name as library_company,
        ll.contact_name as library_contact,
        ll.email as library_email,
        ll.phone as library_phone,
        ll.job_title as library_position,
        ll.created_at as library_created_at,
        ll.library_item_id as library_item_id,

        -- Library item info (if applicable)
        li.title as library_item_title,
        li.file_type as library_item_file_type
      FROM meeting_bookings mb
      INNER JOIN meeting_slots ms ON mb.meeting_slot_id = ms.id
      LEFT JOIN contacts c ON mb.lead_type = 'CONTACT' AND mb.lead_id::text = c.id
      LEFT JOIN library_leads ll ON mb.lead_type = 'LIBRARY_LEAD' AND mb.lead_id = ll.id
      LEFT JOIN library_items li ON ll.library_item_id = li.id
      WHERE mb.id = ${id}
    `;

    if (bookings.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found',
          },
        },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    // Transform data
    const transformedBooking = {
      id: booking.id,
      booking_status: booking.booking_status,
      requested_agenda: booking.requested_agenda,
      created_at: booking.created_at,
      cancelled_at: booking.cancelled_at,
      cancellation_reason: booking.cancellation_reason,

      meeting: {
        id: booking.meeting_slot_id,
        title: booking.meeting_title,
        start_time: booking.start_time,
        end_time: booking.end_time,
        duration_minutes: booking.duration_minutes,
        meeting_location: booking.meeting_location,
        meeting_type: booking.meeting_type,
        meeting_url: booking.meeting_url,
        max_participants: booking.max_participants,
        slot_status: booking.slot_status,
      },

      customer: {
        lead_type: booking.lead_type,
        lead_id: booking.lead_id,
        company_name: booking.contact_company || booking.library_company || 'N/A',
        contact_name: booking.contact_name || booking.library_contact || 'N/A',
        email: booking.contact_email || booking.library_email || 'N/A',
        phone: booking.contact_phone || booking.library_phone || 'N/A',
        position: booking.contact_position || booking.library_position || null,
        consent_date: booking.contact_consent_date || booking.library_created_at || null,
      },

      // Library item info (if lead is from library download)
      library_item: booking.library_item_id
        ? {
            id: booking.library_item_id,
            title: booking.library_item_title,
            file_type: booking.library_item_file_type,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: transformedBooking,
    });

  } catch (error: any) {
    console.error('[Admin Meeting Booking Detail] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to fetch booking detail',
        },
      },
      { status: 500 }
    );
  }
}
