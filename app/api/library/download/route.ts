/**
 * POST /api/library/download
 *
 * 라이브러리 자료 다운로드 신청 + 이메일 전송 + 리드 관리
 *
 * Business Flow:
 * 1. Validate input (Zod schema)
 * 2. Check library item exists and is published
 * 3. Save lead to library_leads table
 * 4. Calculate lead score (0-100)
 * 5. Send email with PDF attachment OR Google Drive link
 * 6. Update email sent status
 * 7. Increment download count
 * 8. Track analytics event
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

// ============================================================
// DATABASE CONNECTION
// ============================================================

const sql = neon(process.env.DATABASE_URL!);

// Validate RESEND_API_KEY at initialization
if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
  console.error('[Library Download] CRITICAL: RESEND_API_KEY is not set or is a placeholder!');
  console.error('[Library Download] Current value:', process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT_SET');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const libraryDownloadSchema = z.object({
  library_item_id: z.string().uuid('유효한 library item ID가 아닙니다'),
  company_name: z
    .string()
    .min(1, '회사명을 입력해주세요')
    .max(100, '회사명은 100자 이하로 입력해주세요'),
  contact_name: z
    .string()
    .min(1, '담당자명을 입력해주세요')
    .max(50, '담당자명은 50자 이하로 입력해주세요'),
  email: z
    .string()
    .email('유효한 이메일 형식이 아닙니다')
    .max(255, '이메일은 255자 이하로 입력해주세요'),
  phone: z
    .string()
    .regex(/^010-\d{4}-\d{4}$/, '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)')
    .optional(),
  privacy_consent: z.boolean().refine((val) => val === true, {
    message: '개인정보 수집 및 이용에 동의해주세요',
  }),
  marketing_consent: z.boolean().optional().default(false),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

type LibraryDownloadRequest = z.infer<typeof libraryDownloadSchema>;

// ============================================================
// TYPES
// ============================================================

interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  file_type: string;
  file_size_mb: number;
  file_url: string;
  download_type: 'EMAIL' | 'DIRECT' | 'GOOGLE_DRIVE';
  category: string;
  version: string;
}

interface LibraryLead {
  id: string;
  library_item_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  lead_status: string;
  lead_score: number;
  created_at: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate lead score (0-100)
 */
function calculateLeadScore(lead: LibraryDownloadRequest, libraryItem: LibraryItem): number {
  let score = 0;

  // 1. Source Type (30점)
  score += 30; // Library download is high intent

  // 2. Library Item Value (20점)
  if (libraryItem.category === 'FRAMEWORK') score += 20;
  else if (libraryItem.category === 'WHITEPAPER') score += 15;
  else if (libraryItem.category === 'CASE_STUDY') score += 10;
  else score += 5;

  // 3. Company Size (20점) - infer from email domain
  const domain = lead.email.split('@')[1];
  const companyScore = inferCompanySizeScore(domain);
  score += companyScore;

  // 4. Marketing Consent (10점)
  if (lead.marketing_consent) score += 10;

  // 5. Phone Provided (10점)
  if (lead.phone) score += 10;

  // 6. UTM Tracking (10점) - indicates marketing campaign engagement
  if (lead.utm_source || lead.utm_medium || lead.utm_campaign) score += 10;

  return Math.max(0, Math.min(100, score));
}

function inferCompanySizeScore(domain: string): number {
  // Fortune 500 / Large corporations
  const largeCorporations = [
    'samsung.com',
    'lg.com',
    'sk.com',
    'hyundai.com',
    'posco.com',
    'hanwha.com',
    'lotte.com',
    'gs.com',
  ];
  if (largeCorporations.some((corp) => domain.includes(corp))) return 20;

  // Logistics companies (high value target)
  const logisticsCompanies = [
    'dhl.com',
    'fedex.com',
    'ups.com',
    'cjlogistics.com',
    'hanjin.com',
    'kmlogis.com',
  ];
  if (logisticsCompanies.some((log) => domain.includes(log))) return 18;

  // Generic email domains (low score)
  const genericDomains = ['gmail.com', 'naver.com', 'daum.net', 'hotmail.com', 'outlook.com'];
  if (genericDomains.includes(domain)) return 0;

  // SMB / Corporate email (default)
  return 10;
}

/**
 * Check for disposable email domains
 */
function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
  ];

  const domain = email.split('@')[1];
  return disposableDomains.includes(domain);
}

/**
 * Send download email with PDF attachment or Google Drive link
 */
async function sendLibraryDownloadEmail(
  lead: LibraryDownloadRequest,
  libraryItem: LibraryItem,
  leadId: string
): Promise<void> {
  const googleDriveLink = 'https://drive.google.com/file/d/1mS9i6Mj5z68Vefmyu3OM_YZYobVEu1UZ/view?usp=drive_link';

  const htmlBody = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC Framework v3.0 다운로드</title>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; border-bottom: 3px solid #0600f7; }
    .header img { max-width: 150px; }
    .content { padding: 30px 20px; }
    .btn-primary { display: inline-block; padding: 14px 32px; background: #0600f7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .btn-primary:hover { background: #0500d0; }
    .attachment-notice { background: #f0f3ff; border-left: 4px solid #0600f7; padding: 15px; margin: 20px 0; }
    .additional-resources { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .additional-resources ul { list-style: none; padding: 0; }
    .additional-resources li { margin: 10px 0; padding-left: 20px; position: relative; }
    .additional-resources li:before { content: "→"; position: absolute; left: 0; color: #0600f7; font-weight: bold; }
    .cta { background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); color: #ffffff; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
    .cta h3 { margin: 0 0 10px 0; color: #ffffff; }
    .cta a { display: inline-block; padding: 14px 32px; background: #ffffff; color: #0600f7; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; margin-top: 40px; }
    .footer a { color: #0600f7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1 style="color: #0600f7; margin: 0;">GLEC</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">ISO-14083 국제표준 물류 탄소배출 측정</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <h1 style="margin-top: 0;">안녕하세요, ${lead.contact_name}님</h1>

      <p>
        <strong>${lead.company_name}</strong>에서 요청하신
        <strong>${libraryItem.title}</strong>을 보내드립니다.
      </p>

      <p>
        ${libraryItem.description}
      </p>

      <!-- Google Drive Link -->
      <div class="attachment-notice">
        <strong>📎 다운로드 링크</strong><br />
        아래 버튼을 클릭하여 Google Drive에서 다운로드하실 수 있습니다.
      </div>

      <div style="text-align: center;">
        <a href="${googleDriveLink}" class="btn-primary">
          다운로드 (Google Drive)
        </a>
      </div>

      <!-- Additional Resources -->
      <div class="additional-resources">
        <h2 style="margin-top: 0; color: #111827;">추가 자료</h2>
        <ul>
          <li>
            <a href="https://glec.io/products/dtg" style="color: #0600f7; text-decoration: none; font-weight: 500;">
              GLEC DTG Series5 - 차세대 운행기록장치 (80만원)
            </a>
          </li>
          <li>
            <a href="https://glec.io/products/carbon-api" style="color: #0600f7; text-decoration: none; font-weight: 500;">
              Carbon API Console - 48개 탄소배출 API (1,200만원/연)
            </a>
          </li>
          <li>
            <a href="https://glec.io/products/glec-cloud" style="color: #0600f7; text-decoration: none; font-weight: 500;">
              GLEC Cloud - 화주사용 대시보드 (12만원/월)
            </a>
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="cta">
        <h3>도입 상담이 필요하신가요?</h3>
        <p style="color: #ffffff; opacity: 0.9;">
          전문 컨설턴트가 귀사에 최적화된 솔루션을 안내해드립니다
        </p>
        <a href="https://glec.io/contact?source=library-email&lead_id=${leadId}">
          무료 상담 신청
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        이메일이 제대로 표시되지 않나요? 스팸 메일함을 확인해주세요.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>(주)글렉</strong><br />
        서울특별시 강남구 테헤란로 123<br />
        대표전화: 02-1234-5678 | 이메일: contact@glec.io
      </p>
      <p>
        <a href="https://glec.io/privacy-policy">개인정보처리방침</a> |
        <a href="https://glec.io/terms">이용약관</a> |
        <a href="https://glec.io/unsubscribe?email=${encodeURIComponent(lead.email)}">수신거부</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: 'GLEC <noreply@glec.io>',
    to: lead.email,
    subject: `[GLEC] ${libraryItem.title} 다운로드`,
    html: htmlBody,
  });
}

// ============================================================
// RATE LIMITING (Simple IP-based)
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (limit.count >= 5) {
    return false; // Exceeded limit (5 requests per hour)
  }

  limit.count++;
  return true;
}

// ============================================================
// POST HANDLER
// ============================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '시간당 최대 5회까지 다운로드 신청이 가능합니다',
          },
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const data = libraryDownloadSchema.parse(body);

    // 3. Check for disposable email
    if (isDisposableEmail(data.email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: '일회용 이메일은 사용할 수 없습니다',
          },
        },
        { status: 400 }
      );
    }

    // 4. Check library item exists and is published
    const libraryItems = await sql`
      SELECT * FROM library_items
      WHERE id = ${data.library_item_id}
      AND status = 'PUBLISHED'
      LIMIT 1
    `;

    if (libraryItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LIBRARY_ITEM_NOT_FOUND',
            message: '요청하신 자료를 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    const libraryItem = libraryItems[0] as LibraryItem;

    // 5. Calculate lead score
    const leadScore = calculateLeadScore(data, libraryItem);

    // 6. Save lead to database
    const leads = await sql`
      INSERT INTO library_leads (
        library_item_id,
        company_name,
        contact_name,
        email,
        phone,
        lead_status,
        lead_score,
        privacy_consent,
        marketing_consent,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer
      ) VALUES (
        ${data.library_item_id},
        ${data.company_name},
        ${data.contact_name},
        ${data.email},
        ${data.phone || null},
        'NEW',
        ${leadScore},
        ${data.privacy_consent},
        ${data.marketing_consent || false},
        'LIBRARY_PAGE',
        ${data.utm_source || null},
        ${data.utm_medium || null},
        ${data.utm_campaign || null},
        ${req.headers.get('referer') || null}
      )
      RETURNING *
    `;

    const lead = leads[0] as LibraryLead;

    // 7. Send email
    let emailSent = false;
    let emailError = null;

    try {
      await sendLibraryDownloadEmail(data, libraryItem, lead.id);
      emailSent = true;

      // 8. Update email sent status
      await sql`
        UPDATE library_leads
        SET email_sent = TRUE, email_sent_at = NOW()
        WHERE id = ${lead.id}
      `;
    } catch (error) {
      emailError = error;
      console.error('[Library Download] Email delivery failed:', error);
      console.error('[Library Download] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        resendApiKey: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT_SET',
      });

      // Update lead with email failure
      await sql`
        UPDATE library_leads
        SET email_sent = FALSE, email_sent_at = NULL
        WHERE id = ${lead.id}
      `;
    }

    // 9. Increment download count (only if email sent successfully)
    if (emailSent) {
      await sql`
        UPDATE library_items
        SET download_count = download_count + 1
        WHERE id = ${libraryItem.id}
      `;
    }

    // 10. Return response (success if lead saved, but indicate email status)
    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_DELIVERY_FAILED',
            message: '이메일 전송에 실패했습니다. 관리자에게 문의해주세요.',
            details: emailError instanceof Error ? emailError.message : 'Unknown error',
          },
          data: {
            lead_id: lead.id,
            email_sent: false,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '이메일로 다운로드 링크를 전송했습니다',
        data: {
          lead_id: lead.id,
          email_sent: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Library Download] Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값을 확인해주세요',
            details: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
        },
      },
      { status: 500 }
    );
  }
}
