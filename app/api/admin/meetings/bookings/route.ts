/**
 * Admin Meeting Bookings API
 * GET /api/admin/meetings/bookings
 *
 * Purpose: 어드민이 모든 미팅 예약을 조회하고 관리
 * Features:
 * - 전체 예약 목록 조회 (페이지네이션)
 * - 상태별 필터링 (PENDING/CONFIRMED/CANCELLED/COMPLETED)
 * - 날짜별 정렬
 * - 고객 정보 포함
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);
    const status = searchParams.get('status'); // PENDING, CONFIRMED, CANCELLED, COMPLETED
    const searchQuery = searchParams.get('search'); // company name or contact name

    const offset = (page - 1) * perPage;

    // Build WHERE clause
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      whereConditions.push(`mb.booking_status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (searchQuery) {
      whereConditions.push(`(
        c.company_name ILIKE $${paramIndex} OR
        c.contact_name ILIKE $${paramIndex} OR
        ll.company_name ILIKE $${paramIndex} OR
        ll.contact_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Count total bookings
    const countQuery = `
      SELECT COUNT(*) as total
      FROM meeting_bookings mb
      LEFT JOIN contacts c ON mb.lead_type = 'CONTACT' AND mb.lead_id::text = c.id::text
      LEFT JOIN library_leads ll ON mb.lead_type = 'LIBRARY_LEAD' AND mb.lead_id = ll.id
      ${whereClause}
    `;

    const countResult = await sql.query(countQuery, queryParams);
    const totalCount = parseInt(countResult[0]?.total || '0');

    // Fetch bookings
    const dataQuery = `
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

        -- Lead info (CONTACT)
        c.company_name as contact_company,
        c.contact_name as contact_name,
        c.email as contact_email,
        c.phone as contact_phone,

        -- Lead info (LIBRARY_LEAD)
        ll.company_name as library_company,
        ll.contact_name as library_contact,
        ll.email as library_email,
        ll.phone as library_phone
      FROM meeting_bookings mb
      INNER JOIN meeting_slots ms ON mb.meeting_slot_id = ms.id
      LEFT JOIN contacts c ON mb.lead_type = 'CONTACT' AND mb.lead_id::text = c.id::text
      LEFT JOIN library_leads ll ON mb.lead_type = 'LIBRARY_LEAD' AND mb.lead_id = ll.id
      ${whereClause}
      ORDER BY ms.start_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(perPage, offset);
    const bookings = await sql.query(dataQuery, queryParams);

    // Transform data
    const transformedBookings = bookings.map((booking: any) => ({
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
      },

      customer: {
        lead_type: booking.lead_type,
        lead_id: booking.lead_id,
        company_name: booking.contact_company || booking.library_company || 'N/A',
        contact_name: booking.contact_name || booking.library_contact || 'N/A',
        email: booking.contact_email || booking.library_email || 'N/A',
        phone: booking.contact_phone || booking.library_phone || 'N/A',
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      meta: {
        total: totalCount,
        page,
        per_page: perPage,
        total_pages: Math.ceil(totalCount / perPage),
      },
    });

  } catch (error: any) {
    console.error('[Admin Meeting Bookings] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to fetch meeting bookings',
        },
      },
      { status: 500 }
    );
  }
}
