/**
 * Demo Request API
 *
 * POST /api/demo-requests
 * Handles demo request form submissions:
 * 1. Validate input with Zod
 * 2. Save to database (Prisma)
 * 3. Send confirmation email via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const DemoRequestSchema = z.object({
  // Step 1: Company Information
  companyName: z.string().min(1, '회사명을 입력해주세요'),
  contactName: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    errorMap: () => ({ message: '회사 규모를 선택해주세요' }),
  }),

  // Step 2: Interest & Requirements
  productInterests: z
    .array(z.string())
    .min(1, '최소 1개 이상의 제품을 선택해주세요'),
  useCase: z.string().min(10, '사용 목적을 최소 10자 이상 입력해주세요'),
  currentSolution: z.string().optional(),
  monthlyShipments: z.enum(['<100', '100-1000', '1000-10000', '10000+'], {
    errorMap: () => ({ message: '월간 배송량을 선택해주세요' }),
  }),

  // Step 3: Schedule Demo
  preferredDate: z.string().min(1, '희망 날짜를 선택해주세요'),
  preferredTime: z
    .string()
    .regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, '시간을 선택해주세요'),
  additionalMessage: z.string().optional(),
});

type DemoRequestData = z.infer<typeof DemoRequestSchema>;

interface ValidationError {
  field: string;
  message: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function formatPhoneNumber(phone: string): string {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
  return phone;
}

/**
 * Generate confirmation email HTML
 */
function generateConfirmationEmail(data: DemoRequestData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0600f7 0%, #000a42 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #0600f7;
      margin: 0 0 15px 0;
      border-bottom: 2px solid #0600f7;
      padding-bottom: 8px;
    }
    .info-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      min-width: 140px;
    }
    .info-value {
      color: #333;
    }
    .products {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .product-badge {
      background-color: #e0e7ff;
      color: #0600f7;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
    }
    .highlight {
      background-color: #fff9db;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .highlight strong {
      color: #0600f7;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }
    .footer a {
      color: #0600f7;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>데모 신청 접수 완료</h1>
      <p>빠른 시일 내에 연락드리겠습니다</p>
    </div>

    <div class="content">
      <p>안녕하세요, <strong>${sanitizeInput(data.contactName)}</strong>님!</p>
      <p>GLEC 데모 신청이 성공적으로 접수되었습니다. 아래 내용을 확인해주세요.</p>

      <div class="section">
        <h2>회사 정보</h2>
        <div class="info-row">
          <div class="info-label">회사명</div>
          <div class="info-value">${sanitizeInput(data.companyName)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">담당자</div>
          <div class="info-value">${sanitizeInput(data.contactName)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">이메일</div>
          <div class="info-value">${sanitizeInput(data.email)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">전화번호</div>
          <div class="info-value">${formatPhoneNumber(data.phone)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">회사 규모</div>
          <div class="info-value">${data.companySize}명</div>
        </div>
      </div>

      <div class="section">
        <h2>관심 제품</h2>
        <div class="products">
          ${data.productInterests.map((product) => `<div class="product-badge">${product}</div>`).join('')}
        </div>
      </div>

      <div class="section">
        <h2>사용 목적</h2>
        <p>${sanitizeInput(data.useCase)}</p>
      </div>

      ${
        data.currentSolution
          ? `
      <div class="section">
        <h2>현재 사용 중인 솔루션</h2>
        <p>${sanitizeInput(data.currentSolution)}</p>
      </div>
      `
          : ''
      }

      <div class="section">
        <h2>월간 배송량</h2>
        <p>${data.monthlyShipments}건</p>
      </div>

      <div class="highlight">
        <strong>희망 데모 일정</strong><br>
        ${data.preferredDate} ${data.preferredTime}
      </div>

      ${
        data.additionalMessage
          ? `
      <div class="section">
        <h2>추가 메시지</h2>
        <p>${sanitizeInput(data.additionalMessage)}</p>
      </div>
      `
          : ''
      }

      <p style="margin-top: 30px;">
        담당자가 영업일 기준 <strong>24시간 이내</strong>에 연락드릴 예정입니다.
      </p>
      <p>
        궁금하신 사항이 있으시면 언제든지 <a href="mailto:demo@glec.io">demo@glec.io</a>로 문의해주세요.
      </p>
    </div>

    <div class="footer">
      <p><strong>GLEC Inc.</strong></p>
      <p>서울특별시 강남구 테헤란로 123</p>
      <p>문의: <a href="mailto:demo@glec.io">demo@glec.io</a> | 전화: 02-1234-5678</p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        이 이메일은 발신 전용입니다. 회신하지 마세요.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate internal notification email HTML
 */
function generateInternalNotificationEmail(data: DemoRequestData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 20px auto; }
    h1 { color: #0600f7; font-size: 24px; }
    .info { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .info p { margin: 8px 0; }
    .label { font-weight: 600; color: #666; display: inline-block; min-width: 120px; }
    .urgent { background: #fff9db; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔔 새로운 데모 신청</h1>

    <div class="urgent">
      <strong>희망 일정:</strong> ${data.preferredDate} ${data.preferredTime}
    </div>

    <div class="info">
      <p><span class="label">회사명:</span> ${sanitizeInput(data.companyName)}</p>
      <p><span class="label">담당자:</span> ${sanitizeInput(data.contactName)}</p>
      <p><span class="label">이메일:</span> ${sanitizeInput(data.email)}</p>
      <p><span class="label">전화번호:</span> ${formatPhoneNumber(data.phone)}</p>
      <p><span class="label">회사 규모:</span> ${data.companySize}명</p>
      <p><span class="label">월간 배송량:</span> ${data.monthlyShipments}건</p>
    </div>

    <h2 style="font-size: 18px; color: #0600f7;">관심 제품</h2>
    <p>${data.productInterests.join(', ')}</p>

    <h2 style="font-size: 18px; color: #0600f7;">사용 목적</h2>
    <p>${sanitizeInput(data.useCase)}</p>

    ${data.currentSolution ? `<h2 style="font-size: 18px; color: #0600f7;">현재 솔루션</h2><p>${sanitizeInput(data.currentSolution)}</p>` : ''}
    ${data.additionalMessage ? `<h2 style="font-size: 18px; color: #0600f7;">추가 메시지</h2><p>${sanitizeInput(data.additionalMessage)}</p>` : ''}

    <p style="margin-top: 30px; padding: 15px; background: #e0e7ff; border-radius: 8px;">
      <strong>Action Required:</strong> 24시간 이내 고객 연락 필요
    </p>
  </div>
</body>
</html>
  `.trim();
}

// ============================================================
// API HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validationResult = DemoRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors: ValidationError[] = validationResult.error.errors.map(
        (err) => ({
          field: err.path[0] as string,
          message: err.message,
        })
      );

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

    const data = validationResult.data;

    // Sanitize inputs
    const sanitizedData = {
      companyName: sanitizeInput(data.companyName),
      contactName: sanitizeInput(data.contactName),
      email: sanitizeInput(data.email),
      phone: formatPhoneNumber(data.phone),
      companySize: data.companySize,
      productInterests: data.productInterests,
      useCase: sanitizeInput(data.useCase),
      currentSolution: data.currentSolution
        ? sanitizeInput(data.currentSolution)
        : null,
      monthlyShipments: data.monthlyShipments,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      additionalMessage: data.additionalMessage
        ? sanitizeInput(data.additionalMessage)
        : null,
    };

    // Get client IP address
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Save to database
    const demoRequest = await prisma.demoRequest.create({
      data: {
        companyName: sanitizedData.companyName,
        contactName: sanitizedData.contactName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        companySize: sanitizedData.companySize,
        productInterests: sanitizedData.productInterests,
        useCase: sanitizedData.useCase,
        currentSolution: sanitizedData.currentSolution,
        monthlyShipments: sanitizedData.monthlyShipments,
        preferredDate: new Date(sanitizedData.preferredDate),
        preferredTime: sanitizedData.preferredTime,
        additionalMessage: sanitizedData.additionalMessage,
        status: 'NEW',
        privacyConsent: true,
        ipAddress: ipAddress,
      },
    });

    // Send confirmation email to customer
    let customerEmailSent = false;
    let internalEmailSent = false;

    if (resend) {
      try {
        // Customer confirmation email
        const customerEmailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@glec.io',
          to: sanitizedData.email,
          subject: '[GLEC] 데모 신청이 접수되었습니다',
          html: generateConfirmationEmail(data),
        });

        if (!customerEmailResult.error) {
          customerEmailSent = true;
        } else {
          console.error('Customer email error:', customerEmailResult.error);
        }

        // Internal notification email
        const internalEmailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@glec.io',
          to: 'demo@glec.io',
          replyTo: sanitizedData.email,
          subject: `[데모 신청] ${sanitizedData.companyName} - ${sanitizedData.contactName}`,
          html: generateInternalNotificationEmail(data),
        });

        if (!internalEmailResult.error) {
          internalEmailSent = true;
        } else {
          console.error('Internal email error:', internalEmailResult.error);
        }
      } catch (err) {
        console.error('Email sending exception:', err);
      }
    }

    // Success response
    return NextResponse.json({
      success: true,
      data: {
        id: demoRequest.id,
        message: '데모 신청이 성공적으로 접수되었습니다',
        emailSent: customerEmailSent,
        preferredDate: sanitizedData.preferredDate,
        preferredTime: sanitizedData.preferredTime,
      },
    });
  } catch (error) {
    console.error('Demo request submission error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        },
      },
      { status: 500 }
    );
  }
}
