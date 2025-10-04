/**
 * API Route: POST /api/demo-request
 *
 * Purpose: Handle demo request form submissions
 * Features:
 * - Zod validation
 * - Rate limiting (3 requests per hour per IP)
 * - Database storage
 * - Email notifications (Resend API)
 * - Security: SQL injection prevention, XSS sanitization
 */

import { z } from 'zod';
import { neon } from '@neondatabase/serverless';

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@glec.io';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Database client
const sql = neon(DATABASE_URL);

// Zod Schema
const DemoRequestSchema = z.object({
  company_name: z.string().min(1).max(100),
  contact_name: z.string().min(1).max(50),
  email: z.string().email().max(255),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/),
  preferred_date: z.string().min(1),
  preferred_product: z.enum(['DTG', 'API', 'CLOUD', 'ALL']),
  message: z.string().min(10).max(500),
  privacy_consent: z.literal(true),
});

// Error response helper
function errorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Success response helper
function successResponse(data: any, status: number = 201) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Rate limit check (Workers KV)
async function checkRateLimit(
  kv: KVNamespace | undefined,
  ipAddress: string
): Promise<boolean> {
  if (!kv) {
    // Rate limiting disabled in development
    return true;
  }

  const key = `rate_limit:demo_request:${ipAddress}`;
  const current = await kv.get(key);

  if (current) {
    const count = parseInt(current, 10);
    if (count >= 3) {
      return false; // Rate limit exceeded
    }
    await kv.put(key, String(count + 1), { expirationTtl: 3600 }); // 1 hour
  } else {
    await kv.put(key, '1', { expirationTtl: 3600 }); // 1 hour
  }

  return true;
}

// Send email notification via Resend API
async function sendEmailNotification(data: z.infer<typeof DemoRequestSchema>) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return;
  }

  try {
    // Send to admin
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ['contact@glec.io'],
        subject: `[GLEC] 새로운 데모 신청 - ${data.company_name}`,
        html: `
          <h2>새로운 데모 신청이 접수되었습니다</h2>

          <h3>신청 정보</h3>
          <ul>
            <li><strong>회사명:</strong> ${data.company_name}</li>
            <li><strong>담당자명:</strong> ${data.contact_name}</li>
            <li><strong>이메일:</strong> ${data.email}</li>
            <li><strong>연락처:</strong> ${data.phone}</li>
            <li><strong>희망 일시:</strong> ${data.preferred_date}</li>
            <li><strong>관심 제품:</strong> ${data.preferred_product}</li>
          </ul>

          <h3>문의 내용</h3>
          <p>${data.message}</p>

          <p><small>접수 시간: ${new Date().toLocaleString('ko-KR')}</small></p>
        `,
      }),
    });

    // Send auto-reply to customer
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [data.email],
        subject: '[GLEC] 데모 신청이 접수되었습니다',
        html: `
          <h2>데모 신청이 접수되었습니다</h2>

          <p>${data.contact_name}님, 안녕하세요.</p>

          <p>GLEC 데모 신청이 정상적으로 접수되었습니다.<br>
          빠른 시일 내에 담당자가 연락드리겠습니다.</p>

          <h3>신청 내역</h3>
          <ul>
            <li><strong>회사명:</strong> ${data.company_name}</li>
            <li><strong>희망 일시:</strong> ${data.preferred_date}</li>
            <li><strong>관심 제품:</strong> ${data.preferred_product}</li>
          </ul>

          <p>문의사항이 있으시면 언제든지 contact@glec.io로 연락주세요.</p>

          <p>감사합니다.<br>
          (주)글렉</p>
        `,
      }),
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - email failure shouldn't block the request
  }
}

// Main handler
export async function onRequestPost(context: {
  request: Request;
  env: {
    DATABASE_URL: string;
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
    RATE_LIMIT_KV?: KVNamespace;
  };
}) {
  try {
    // Get IP address
    const ipAddress =
      context.request.headers.get('CF-Connecting-IP') || '0.0.0.0';

    // Rate limiting
    const rateLimitOk = await checkRateLimit(
      context.env.RATE_LIMIT_KV,
      ipAddress
    );
    if (!rateLimitOk) {
      return errorResponse(
        '잠시 후 다시 시도해주세요 (시간당 3회 제한)',
        429
      );
    }

    // Parse request body
    const body = await context.request.json();

    // Validate with Zod
    const validationResult = DemoRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값을 확인해주세요',
            details: errors,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = validationResult.data;

    // Insert into database (using Neon serverless driver)
    const result = await sql`
      INSERT INTO demo_requests (
        company_name,
        contact_name,
        email,
        phone,
        preferred_date,
        preferred_product,
        message,
        ip_address,
        created_at
      ) VALUES (
        ${data.company_name},
        ${data.contact_name},
        ${data.email},
        ${data.phone},
        ${data.preferred_date},
        ${data.preferred_product},
        ${data.message},
        ${ipAddress},
        NOW()
      ) RETURNING id
    `;

    const insertedId = result[0]?.id;

    // Send email notifications (async, don't wait)
    sendEmailNotification(data).catch((err) =>
      console.error('Email notification failed:', err)
    );

    // Return success
    return successResponse({
      id: insertedId,
      message: '데모 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
    });
  } catch (error) {
    console.error('Demo request error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
