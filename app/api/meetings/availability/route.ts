/**
 * Meeting Availability API
 * GET /api/meetings/availability?token={token}
 * 
 * Purpose: 고객이 예약 가능한 미팅 시간대 조회
 * Workflow:
 * 1. 토큰 검증 (유효성, 만료, 사용여부)
 * 2. 리드 정보 조회
 * 3. 가능한 미팅 슬롯 조회 (향후 30일)
 * 4. 날짜별 그룹핑하여 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isValidTokenFormat } from '@/lib/meeting-tokens';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    // 1. Token validation
    if (!token || !isValidTokenFormat(token)) {
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
    
    // 2. Token lookup
    const tokenResults = await sql`
      SELECT 
        id,
        lead_type,
        lead_id,
        expires_at,
        used,
        used_at,
        created_at
      FROM meeting_proposal_tokens
      WHERE token = ${token}
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
    
    // 3. Check expiry
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired',
            expires_at: tokenData.expires_at,
          },
        },
        { status: 410 }
      );
    }
    
    // 4. Check if already used
    if (tokenData.used) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_ALREADY_USED',
            message: 'This booking link has already been used',
            used_at: tokenData.used_at,
          },
        },
        { status: 410 }
      );
    }
    
    // 5. Get lead info
    let leadInfo: any = null;
    
    if (tokenData.lead_type === 'CONTACT') {
      const results = await sql`
        SELECT company_name, contact_name, email
        FROM contacts
        WHERE id = ${tokenData.lead_id}::UUID
        LIMIT 1
      `;
      leadInfo = results[0] || null;
    } else if (tokenData.lead_type === 'LIBRARY_LEAD') {
      const results = await sql`
        SELECT company_name, contact_name, email
        FROM library_leads
        WHERE id = ${tokenData.lead_id}
        LIMIT 1
      `;
      leadInfo = results[0] || null;
    }
    
    // 6. Get available meeting slots (next 30 days)
    const slots = await sql`
      SELECT 
        id,
        title,
        description,
        meeting_type,
        duration_minutes,
        meeting_location,
        meeting_url,
        office_address,
        start_time,
        end_time,
        timezone,
        current_bookings,
        max_bookings
      FROM meeting_slots
      WHERE is_available = TRUE
      AND start_time >= NOW()
      AND start_time <= NOW() + INTERVAL '30 days'
      AND current_bookings < max_bookings
      ORDER BY start_time ASC
    `;
    
    // 7. Group slots by date
    const slotsByDate: Record<string, any[]> = {};
    
    slots.forEach((slot: any) => {
      const date = new Date(slot.start_time).toISOString().split('T')[0];
      if (!slotsByDate[date]) {
        slotsByDate[date] = [];
      }
      slotsByDate[date].push({
        id: slot.id,
        title: slot.title,
        description: slot.description,
        meeting_type: slot.meeting_type,
        duration_minutes: slot.duration_minutes,
        meeting_location: slot.meeting_location,
        start_time: slot.start_time,
        end_time: slot.end_time,
        timezone: slot.timezone,
        available_spots: slot.max_bookings - slot.current_bookings,
      });
    });
    
    return NextResponse.json({
      success: true,
      data: {
        token_valid: true,
        expires_at: tokenData.expires_at,
        lead_info: leadInfo,
        slots_by_date: slotsByDate,
        total_slots: slots.length,
      },
    });
  } catch (error: any) {
    console.error('[Meeting Availability] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to fetch meeting availability',
        },
      },
      { status: 500 }
    );
  }
}
