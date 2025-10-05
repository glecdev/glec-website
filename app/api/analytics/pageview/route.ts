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

    // Insert page view
    const pageViewId = crypto.randomUUID();
    await sql`
      INSERT INTO analytics_page_views (
        id, session_id, path, title, referrer, created_at
      ) VALUES (
        ${pageViewId},
        ${sessionId},
        ${body.path},
        ${body.title},
        ${body.referrer || null},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      pageViewId
    });

  } catch (error) {
    console.error('Analytics pageview error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}

// PATCH endpoint for updating duration and scroll depth
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageViewId, duration, scrollDepth, exitPage } = body;

    await sql`
      UPDATE analytics_page_views
      SET
        duration = ${duration || null},
        scroll_depth = ${scrollDepth || null},
        exit_page = ${exitPage || false}
      WHERE id = ${pageViewId}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics pageview update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update page view' },
      { status: 500 }
    );
  }
}
