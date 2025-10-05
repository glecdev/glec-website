import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

const sql = neon(process.env.DATABASE_URL!);

// Helper: Anonymize IP (GDPR compliance)
function anonymizeIP(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) {
    parts[3] = '0'; // Mask last octet
    return parts.join('.');
  }
  return '0.0.0.0';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('glec_session_id')?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Parse user agent
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const device = parser.getDevice().type || 'desktop';
    const browser = parser.getBrowser().name || 'unknown';
    const os = parser.getOS().name || 'unknown';

    // Get IP address (anonymized)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') || '0.0.0.0';
    const anonymizedIP = anonymizeIP(ip);

    // Check if session exists
    const existing = await sql`
      SELECT id FROM analytics_sessions WHERE session_id = ${sessionId}
    `;

    if (existing.length === 0) {
      // Create new session
      await sql`
        INSERT INTO analytics_sessions (
          id, session_id, ip_address, user_agent, device, browser, os,
          referrer, landing_page, cookie_consent, created_at, updated_at
        ) VALUES (
          ${crypto.randomUUID()},
          ${sessionId},
          ${anonymizedIP},
          ${userAgent},
          ${device},
          ${browser},
          ${os},
          ${body.referrer || null},
          ${body.landingPage},
          ${JSON.stringify(body.cookieConsent)},
          NOW(),
          NOW()
        )
      `;
    } else {
      // Update existing session
      await sql`
        UPDATE analytics_sessions
        SET updated_at = NOW()
        WHERE session_id = ${sessionId}
      `;
    }

    const response = NextResponse.json({
      success: true,
      sessionId
    });

    // Set session cookie (1 year)
    response.cookies.set('glec_session_id', sessionId, {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;

  } catch (error) {
    console.error('Analytics session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
