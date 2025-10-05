import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('glec_session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session ID' },
        { status: 400 }
      );
    }

    // Insert event
    await sql`
      INSERT INTO analytics_events (
        id, session_id, event_type, event_name, event_data,
        page, element_id, element_text, created_at
      ) VALUES (
        ${crypto.randomUUID()},
        ${sessionId},
        ${body.eventType},
        ${body.eventName},
        ${body.eventData ? JSON.stringify(body.eventData) : null},
        ${body.page},
        ${body.elementId || null},
        ${body.elementText || null},
        NOW()
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
