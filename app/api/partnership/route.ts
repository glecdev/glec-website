/**
 * Partnership Form Submission API
 *
 * POST /api/partnership
 * Handles partnership application submissions and sends email via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


// Initialize Resend only if API key is available (prevents build-time errors)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface PartnershipFormData {
  companyName: string;
  contactName: string;
  email: string;
  partnershipType: string;
  proposal: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid partnership types
const VALID_PARTNERSHIP_TYPES = ['tech', 'reseller', 'consulting', 'other'];

function validatePartnershipForm(data: PartnershipFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Company name validation
  if (!data.companyName || data.companyName.trim().length === 0) {
    errors.push({ field: 'companyName', message: '회사명을 입력해주세요' });
  } else if (data.companyName.length > 100) {
    errors.push({ field: 'companyName', message: '회사명은 100자 이하로 입력해주세요' });
  }

  // Contact name validation
  if (!data.contactName || data.contactName.trim().length === 0) {
    errors.push({ field: 'contactName', message: '담당자 이름을 입력해주세요' });
  } else if (data.contactName.length > 50) {
    errors.push({ field: 'contactName', message: '담당자 이름은 50자 이하로 입력해주세요' });
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: '이메일을 입력해주세요' });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: '올바른 이메일 형식이 아닙니다' });
  }

  // Partnership type validation
  if (!data.partnershipType || data.partnershipType.trim().length === 0) {
    errors.push({ field: 'partnershipType', message: '파트너십 유형을 선택해주세요' });
  } else if (!VALID_PARTNERSHIP_TYPES.includes(data.partnershipType)) {
    errors.push({ field: 'partnershipType', message: '유효하지 않은 파트너십 유형입니다' });
  }

  // Proposal validation
  if (!data.proposal || data.proposal.trim().length === 0) {
    errors.push({ field: 'proposal', message: '제안 내용을 입력해주세요' });
  } else if (data.proposal.trim().length < 10) {
    errors.push({ field: 'proposal', message: '제안 내용을 최소 10자 이상 입력해주세요' });
  } else if (data.proposal.length > 1000) {
    errors.push({ field: 'proposal', message: '제안 내용은 1000자 이하로 입력해주세요' });
  }

  return errors;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function getPartnershipTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    tech: '기술 파트너',
    reseller: '리셀러',
    consulting: '컨설팅',
    other: '기타',
  };
  return labels[type] || type;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!resend) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: '이메일 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.',
          },
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body: PartnershipFormData = await request.json();

    // Validate input
    const validationErrors = validatePartnershipForm(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력 정보를 확인해주세요',
            details: validationErrors,
          },
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      companyName: sanitizeInput(body.companyName),
      contactName: sanitizeInput(body.contactName),
      email: sanitizeInput(body.email),
      partnershipType: body.partnershipType,
      proposal: sanitizeInput(body.proposal),
    };

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@glec.io',
      to: 'partnership@glec.io',
      replyTo: sanitizedData.email,
      subject: `[GLEC 파트너십 신청] ${getPartnershipTypeLabel(sanitizedData.partnershipType)} - ${sanitizedData.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #0600f7; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-left: 3px solid #0600f7; }
            .proposal { background: white; padding: 15px; border-left: 3px solid #0600f7; white-space: pre-wrap; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🤝 새로운 파트너십 신청</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">GLEC 파트너십 신청이 접수되었습니다</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">🏢 회사명</div>
                <div class="value">${sanitizedData.companyName}</div>
              </div>

              <div class="field">
                <div class="label">👤 담당자 이름</div>
                <div class="value">${sanitizedData.contactName}</div>
              </div>

              <div class="field">
                <div class="label">📧 이메일</div>
                <div class="value"><a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></div>
              </div>

              <div class="field">
                <div class="label">🔖 파트너십 유형</div>
                <div class="value">${getPartnershipTypeLabel(sanitizedData.partnershipType)}</div>
              </div>

              <div class="field">
                <div class="label">💡 제안 내용</div>
                <div class="proposal">${sanitizedData.proposal}</div>
              </div>

              <div class="footer">
                <p>📅 접수 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
                <p>⚡ 영업일 기준 3일 내에 담당자가 연락드립니다.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailResult.error) {
      console.error('Resend email error:', emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_SEND_ERROR',
            message: '이메일 전송 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      data: {
        id: emailResult.data?.id,
        message: '파트너십 신청이 성공적으로 접수되었습니다',
      },
    });
  } catch (error) {
    console.error('Partnership form submission error:', error);

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
