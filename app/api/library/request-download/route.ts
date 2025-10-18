/**
 * Library Download Request API
 *
 * POST /api/library/request-download
 *
 * Flow:
 * 1. Customer fills form with contact info
 * 2. Lead created in library_leads table
 * 3. JWT download token generated (24h expiry)
 * 4. Email sent with secure download link
 * 5. Customer clicks link → /api/library/download?token=...
 * 6. Download tracked and file served
 *
 * Security:
 * - Input validation (Zod)
 * - Rate limiting (TODO: implement)
 * - Email verification
 * - JWT token generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { Resend } from 'resend';
import { generateDownloadToken, generateDownloadUrl } from '@/lib/jwt-download';
import { rateLimiters, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY);

// ====================================================================
// Validation Schema
// ====================================================================

const DownloadRequestSchema = z.object({
  library_item_id: z.string().uuid('유효한 자료 ID가 아닙니다'),
  company_name: z.string().min(1, '회사명을 입력해주세요').max(200, '회사명이 너무 깁니다'),
  contact_name: z.string().min(1, '담당자명을 입력해주세요').max(100, '담당자명이 너무 깁니다'),
  email: z.string().email('유효한 이메일 주소를 입력해주세요').max(255, '이메일이 너무 깁니다'),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  industry: z.string().optional(),
  marketing_consent: z.boolean().optional(),
  privacy_consent: z.boolean({
    required_error: '개인정보 처리 방침에 동의해주세요',
  }),
});

type DownloadRequestData = z.infer<typeof DownloadRequestSchema>;

// ====================================================================
// POST Handler
// ====================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Check rate limit (10 requests per hour per IP)
    const rateLimitResult = rateLimiters.downloadRequest.check(req);

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        createRateLimitResponse(rateLimitResult),
        { status: 429 }
      );

      addRateLimitHeaders(response.headers, rateLimitResult);

      return response;
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const validationResult = DownloadRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 정보를 확인해주세요',
            details: errors,
          },
        },
        { status: 400 }
      );
    }

    const data: DownloadRequestData = validationResult.data;

    // 3. Verify library item exists and is published
    const items = await sql`
      SELECT
        id,
        title,
        slug,
        file_type,
        file_size_mb,
        download_type,
        requires_form,
        status
      FROM library_items
      WHERE id = ${data.library_item_id}
      LIMIT 1
    `;

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: '요청하신 자료를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    const item = items[0];

    if (item.status !== 'PUBLISHED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ITEM_NOT_AVAILABLE',
            message: '이 자료는 현재 다운로드할 수 없습니다',
          },
        },
        { status: 403 }
      );
    }

    // 4. Create lead in database
    const leadId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Calculate lead score (basic algorithm)
    const leadScore = 70; // Default score (can be enhanced)

    await sql`
      INSERT INTO library_leads (
        id,
        library_item_id,
        company_name,
        contact_name,
        email,
        phone,
        lead_score,
        lead_status,
        marketing_consent,
        privacy_consent,
        email_sent,
        email_opened,
        download_link_clicked,
        created_at,
        updated_at
      ) VALUES (
        ${leadId},
        ${data.library_item_id},
        ${data.company_name},
        ${data.contact_name},
        ${data.email},
        ${data.phone || null},
        ${leadScore},
        'NEW',
        ${data.marketing_consent || false},
        ${data.privacy_consent},
        false,
        false,
        false,
        ${now},
        ${now}
      )
    `;

    // 5. Generate JWT download token (24h expiry)
    const downloadToken = generateDownloadToken(data.library_item_id, leadId, data.email, {
      expiresIn: '24h',
    });

    // 6. Generate download URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const downloadUrl = generateDownloadUrl(baseUrl, downloadToken);

    // 7. Send email with download link
    let emailSent = false;
    try {
      const emailResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'GLEC <noreply@glec.io>',
        to: data.email,
        subject: `[GLEC] ${item.title} 다운로드 링크`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 자료 다운로드</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">GLEC</h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">ISO-14083 물류 탄소배출 측정</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #18181b; font-size: 24px; font-weight: 600;">요청하신 자료를 보내드립니다</h2>

              <p style="margin: 0 0 20px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                안녕하세요, <strong>${data.contact_name}</strong>님<br>
                ${data.company_name}에서 요청하신 자료를 안전하게 다운로드하실 수 있습니다.
              </p>

              <!-- Library Item Info -->
              <div style="background-color: #f4f4f5; border-left: 4px solid #0600f7; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #71717a; font-size: 12px; text-transform: uppercase; font-weight: 600;">다운로드 자료</p>
                <p style="margin: 0 0 8px 0; color: #18181b; font-size: 18px; font-weight: 600;">${item.title}</p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">
                  ${item.file_type} • ${item.file_size_mb} MB
                </p>
              </div>

              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #0600f7 0%, #0500d0 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(6, 0, 247, 0.3);">
                      📥 자료 다운로드
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 16px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  ⏰ <strong>다운로드 링크는 24시간 동안 유효합니다</strong><br>
                  기간이 지난 후에는 다시 요청해주세요.
                </p>
              </div>

              <p style="margin: 0 0 10px 0; color: #3f3f46; font-size: 14px; line-height: 1.6;">
                자료가 도움이 되셨으면 좋겠습니다.<br>
                추가 문의사항이 있으시면 언제든지 연락주세요.
              </p>

              <p style="margin: 0; color: #3f3f46; font-size: 14px; line-height: 1.6;">
                감사합니다,<br>
                <strong>GLEC 팀</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 10px 0; color: #71717a; font-size: 12px;">
                이 이메일은 GLEC 자료 다운로드 요청에 대한 응답입니다.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 11px;">
                © 2025 GLEC. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });

      if (emailResult.id) {
        emailSent = true;

        // Update lead with email sent status
        await sql`
          UPDATE library_leads
          SET
            email_sent = true,
            email_sent_at = ${now},
            updated_at = ${now}
          WHERE id = ${leadId}
        `;
      }
    } catch (emailError: any) {
      console.error('[Library Download Request] Email send failed:', emailError);
      // Continue even if email fails (lead is still created)
    }

    // 8. Return success response with rate limit headers
    const response = NextResponse.json(
      {
        success: true,
        message: emailSent
          ? '이메일로 다운로드 링크를 전송했습니다'
          : '다운로드 요청이 접수되었습니다 (이메일 전송 실패)',
        data: {
          lead_id: leadId,
          email_sent: emailSent,
          download_url: downloadUrl, // For testing only, remove in production
        },
      },
      { status: 201 }
    );

    // Add rate limit headers to successful response
    addRateLimitHeaders(response.headers, rateLimitResult);

    return response;
  } catch (error: any) {
    console.error('[Library Download Request] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: '다운로드 요청 중 오류가 발생했습니다',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
}
