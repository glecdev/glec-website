/**
 * Meeting Slots Management API
 * 
 * Endpoints:
 * - GET /api/admin/meetings/slots - List all meeting slots
 * - POST /api/admin/meetings/slots - Create new meeting slot
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface CreateMeetingSlotRequest {
  title: string;
  description?: string;
  meeting_type: 'DEMO' | 'CONSULTATION' | 'ONBOARDING' | 'FOLLOWUP' | 'OTHER';
  duration_minutes: number;
  meeting_location: 'ONLINE' | 'OFFICE' | 'CLIENT_OFFICE';
  meeting_url?: string;
  office_address?: string;
  start_time: string;
  end_time: string;
  max_bookings?: number;
  assigned_to?: string;
  timezone?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const meeting_type = searchParams.get('meeting_type') || 'ALL';
    const is_available = searchParams.get('is_available') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '50');
    const offset = (page - 1) * per_page;
    
    let countQuery = 'SELECT COUNT(*) as total FROM meeting_slots WHERE 1=1';
    let dataQuery = 'SELECT * FROM meeting_slots WHERE 1=1';
    
    if (meeting_type !== 'ALL') {
      countQuery += ` AND meeting_type = '${meeting_type}'`;
      dataQuery += ` AND meeting_type = '${meeting_type}'`;
    }
    
    if (is_available !== 'ALL') {
      const availVal = is_available === 'true';
      countQuery += ` AND is_available = ${availVal}`;
      dataQuery += ` AND is_available = ${availVal}`;
    }
    
    dataQuery += ` ORDER BY start_time ASC LIMIT ${per_page} OFFSET ${offset}`;
    
    const countResult = await sql([countQuery]);
    const slots = await sql([dataQuery]);
    
    const total = parseInt(countResult[0]?.total || '0');
    
    return NextResponse.json({
      success: true,
      data: slots,
      meta: {
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error: any) {
    console.error('[Meetings Slots API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to fetch meeting slots',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateMeetingSlotRequest = await req.json();
    
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title is required',
          },
        },
        { status: 400 }
      );
    }
    
    if (!body.start_time || !body.end_time) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'start_time and end_time are required',
          },
        },
        { status: 400 }
      );
    }
    
    const startTime = new Date(body.start_time);
    const endTime = new Date(body.end_time);
    
    if (endTime <= startTime) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'end_time must be after start_time',
          },
        },
        { status: 400 }
      );
    }
    
    const result = await sql`
      INSERT INTO meeting_slots (
        title,
        description,
        meeting_type,
        duration_minutes,
        meeting_location,
        meeting_url,
        office_address,
        start_time,
        end_time,
        max_bookings,
        assigned_to,
        timezone
      ) VALUES (
        ${body.title},
        ${body.description || null},
        ${body.meeting_type},
        ${body.duration_minutes},
        ${body.meeting_location},
        ${body.meeting_url || null},
        ${body.office_address || null},
        ${body.start_time},
        ${body.end_time},
        ${body.max_bookings || 1},
        ${body.assigned_to || null},
        ${body.timezone || 'Asia/Seoul'}
      )
      RETURNING *
    `;
    
    return NextResponse.json({
      success: true,
      data: result[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Meetings Slots API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to create meeting slot',
        },
      },
      { status: 500 }
    );
  }
}
