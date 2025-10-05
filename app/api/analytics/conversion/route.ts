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

    // Insert conversion
    await sql`
      INSERT INTO analytics_conversions (
        id, session_id, conversion_type, form_data, value, created_at
      ) VALUES (
        ${crypto.randomUUID()},
        ${sessionId},
        ${body.conversionType},
        ${body.formData ? JSON.stringify(body.formData) : null},
        ${body.value || null},
        NOW()
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics conversion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track conversion' },
      { status: 500 }
    );
  }
}
