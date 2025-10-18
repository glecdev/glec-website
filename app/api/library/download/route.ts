/**
 * Secure Library Download API
 *
 * GET /api/library/download?token=<jwt-token>
 *
 * Security:
 * - JWT token verification (24h expiry)
 * - Download tracking (library_leads table)
 * - File access validation
 * - CORS headers for production
 *
 * Flow:
 * 1. Customer receives email with download link
 * 2. Clicks link with JWT token
 * 3. Token verified
 * 4. Download tracked in database
 * 5. File served or redirected
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyDownloadToken, obfuscateEmail } from '@/lib/jwt-download';
import { rateLimiters, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit';

const sql = neon(process.env.DATABASE_URL!);

// ====================================================================
// GET Handler
// ====================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Check rate limit (50 requests per hour per IP)
    const rateLimitResult = rateLimiters.download.check(req);

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        createRateLimitResponse(rateLimitResult),
        { status: 429 }
      );

      addRateLimitHeaders(response.headers, rateLimitResult);

      return response;
    }

    // 2. Extract token from query string
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOKEN_REQUIRED',
            message: '다운로드 링크가 유효하지 않습니다. 토큰이 필요합니다.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Verify JWT token
    let payload;
    try {
      payload = verifyDownloadToken(token);
    } catch (err: any) {
      // Check if error is about expiry
      const isExpired = err.message?.includes('expired');

      return NextResponse.json(
        {
          success: false,
          error: {
            code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
            message: err.message || '다운로드 링크가 만료되었거나 유효하지 않습니다.',
          },
        },
        { status: 401 }
      );
    }

    const { library_item_id, lead_id, email } = payload;

    // 4. Verify library item exists and is published
    const items = await sql`
      SELECT
        id,
        title,
        file_url,
        file_type,
        file_size_mb,
        download_type,
        status,
        download_count
      FROM library_items
      WHERE id = ${library_item_id}
      LIMIT 1
    `;

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: '요청하신 자료를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    const item = items[0];

    // Only allow downloads for PUBLISHED items
    if (item.status !== 'PUBLISHED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_NOT_AVAILABLE',
            message: '이 자료는 현재 다운로드할 수 없습니다.',
          },
        },
        { status: 403 }
      );
    }

    // 5. Verify lead exists and matches email
    const leads = await sql`
      SELECT
        id,
        library_item_id,
        email,
        email_sent,
        email_opened,
        download_link_clicked,
        download_link_clicked_at,
        created_at
      FROM library_leads
      WHERE id = ${lead_id}
      LIMIT 1
    `;

    if (leads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEAD_NOT_FOUND',
            message: '다운로드 요청 정보를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    const lead = leads[0];

    // Verify email matches
    if (lead.email.toLowerCase() !== email.toLowerCase()) {
      console.error('[Download Security] Email mismatch:', {
        token_email: obfuscateEmail(email),
        lead_email: obfuscateEmail(lead.email),
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_MISMATCH',
            message: '다운로드 링크가 유효하지 않습니다.',
          },
        },
        { status: 403 }
      );
    }

    // 6. Track download in database
    const now = new Date().toISOString();

    await sql`
      UPDATE library_leads
      SET
        download_link_clicked = true,
        download_link_clicked_at = ${now},
        updated_at = ${now}
      WHERE id = ${lead_id}
    `;

    // 7. Increment download count on library item
    await sql`
      UPDATE library_items
      SET
        download_count = download_count + 1,
        updated_at = ${now}
      WHERE id = ${library_item_id}
    `;

    // Log successful download (obfuscated email for GDPR)
    console.log('[Library Download] Success:', {
      item_id: library_item_id,
      item_title: item.title,
      lead_id: lead_id,
      email: obfuscateEmail(email),
      timestamp: now,
    });

    // 8. Serve file or redirect
    const fileUrl = item.file_url;

    // If file is local (starts with /), redirect to public URL
    if (fileUrl.startsWith('/')) {
      const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}${fileUrl}`;
      return NextResponse.redirect(publicUrl, 302);
    }

    // If file is external (Google Drive, etc.), redirect
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return NextResponse.redirect(fileUrl, 302);
    }

    // Fallback: return JSON with file URL
    return NextResponse.json(
      {
        success: true,
        message: '다운로드가 시작됩니다',
        data: {
          file_url: fileUrl,
          file_type: item.file_type,
          file_size_mb: item.file_size_mb,
          title: item.title,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Library Download] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: '다운로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// OPTIONS Handler (CORS preflight)
// ====================================================================

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
