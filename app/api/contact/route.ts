/**
 * Contact Form Submission API
 *
 * POST /api/contact
 * Handles contact form submissions:
 * 1. Validate input
 * 2. Save to database (Neon PostgreSQL via @neondatabase/serverless)
 * 3. Send email via Resend
 *
 * Based on Contact page Zod schema:
 * - company_name, contact_name, email, phone, inquiry_type, message, privacy_consent
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

interface ContactFormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  inquiry_type: 'PRODUCT' | 'PARTNERSHIP' | 'SUPPORT' | 'GENERAL';
  message: string;
  privacy_consent: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone validation regex (Korean format: 010-XXXX-XXXX)
const PHONE_REGEX = /^010-\d{4}-\d{4}$/;

function validateContactForm(data: ContactFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Company name validation
  if (!data.company_name || data.company_name.trim().length === 0) {
    errors.push({ field: 'company_name', message: '회사명을 입력해주세요' });
  } else if (data.company_name.trim().length > 100) {
    errors.push({ field: 'company_name', message: '회사명은 100자 이하로 입력해주세요' });
  }

  // Contact name validation
  if (!data.contact_name || data.contact_name.trim().length === 0) {
    errors.push({ field: 'contact_name', message: '담당자명을 입력해주세요' });
  } else if (data.contact_name.trim().length > 50) {
    errors.push({ field: 'contact_name', message: '담당자명은 50자 이하로 입력해주세요' });
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: '이메일을 입력해주세요' });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: '유효한 이메일 형식이 아닙니다' });
  }

  // Phone validation
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push({ field: 'phone', message: '전화번호를 입력해주세요' });
  } else if (!PHONE_REGEX.test(data.phone)) {
    errors.push({ field: 'phone', message: '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)' });
  }

  // Inquiry type validation
  const validTypes = ['PRODUCT', 'PARTNERSHIP', 'SUPPORT', 'GENERAL'];
  if (!data.inquiry_type || !validTypes.includes(data.inquiry_type)) {
    errors.push({ field: 'inquiry_type', message: '문의 유형을 선택해주세요' });
  }

  // Message validation
  if (!data.message || data.message.trim().length === 0) {
    errors.push({ field: 'message', message: '문의 내용을 입력해주세요' });
  } else if (data.message.trim().length < 10) {
    errors.push({ field: 'message', message: '문의 내용은 최소 10자 이상 입력해주세요' });
  } else if (data.message.trim().length > 1000) {
    errors.push({ field: 'message', message: '문의 내용은 1,000자 이하로 입력해주세요' });
  }

  // Privacy consent validation
  if (data.privacy_consent !== true) {
    errors.push({ field: 'privacy_consent', message: '개인정보 수집 및 이용에 동의해주세요' });
  }

  return errors;
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ContactFormData = await request.json();

    // Validate input
    const validationErrors = validateContactForm(body);
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
      company_name: sanitizeInput(body.company_name),
      contact_name: sanitizeInput(body.contact_name),
      email: sanitizeInput(body.email),
      phone: sanitizeInput(body.phone),
      inquiry_type: body.inquiry_type,
      message: sanitizeInput(body.message),
      privacy_consent: body.privacy_consent,
    };

    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Generate UUID for id
    const contactId = crypto.randomUUID();

    // Save to database
    const result = await sql`
      INSERT INTO contacts (
        id,
        company_name,
        contact_name,
        email,
        phone,
        inquiry_type,
        message,
        privacy_consent,
        status,
        ip_address,
        created_at,
        updated_at
      ) VALUES (
        ${contactId},
        ${sanitizedData.company_name},
        ${sanitizedData.contact_name},
        ${sanitizedData.email},
        ${sanitizedData.phone},
        ${sanitizedData.inquiry_type},
        ${sanitizedData.message},
        ${sanitizedData.privacy_consent},
        'NEW',
        ${ipAddress},
        NOW(),
        NOW()
      )
      RETURNING id, created_at
    `;

    const contact = result[0];

    // Send email notification to admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'oillex.co.kr@gmail.com';
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@no-reply.glec.io';

    try {
      // Email to admin (notification)
      const inquiryTypeLabels = {
        PRODUCT: '제품 문의',
        PARTNERSHIP: '제휴 문의',
        SUPPORT: '기술 지원',
        GENERAL: '일반 문의',
      };

      const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>GLEC 고객 문의</title>
        </head>
        <body style="font-family: 'Pretendard', sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0600f7; border-bottom: 2px solid #0600f7; padding-bottom: 10px;">
              🔔 새로운 고객 문의
            </h1>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">📋 문의 정보</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; width: 120px;">문의 유형:</td>
                  <td style="padding: 8px;">${inquiryTypeLabels[sanitizedData.inquiry_type]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">회사명:</td>
                  <td style="padding: 8px;">${sanitizedData.company_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">담당자명:</td>
                  <td style="padding: 8px;">${sanitizedData.contact_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">이메일:</td>
                  <td style="padding: 8px;">
                    <a href="mailto:${sanitizedData.email}" style="color: #0600f7;">${sanitizedData.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">전화번호:</td>
                  <td style="padding: 8px;">${sanitizedData.phone}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">💬 문의 내용</h3>
              <p style="white-space: pre-wrap;">${sanitizedData.message}</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 12px; color: #666;">
              <p style="margin: 5px 0;"><strong>접수 ID:</strong> ${contact.id}</p>
              <p style="margin: 5px 0;"><strong>접수 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
              <p style="margin: 5px 0;"><strong>IP 주소:</strong> ${ipAddress}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
              <p>이 이메일은 GLEC 웹사이트 Contact Form에서 자동 발송되었습니다.</p>
              <p>Admin Dashboard: <a href="https://glec-website.vercel.app/admin/contacts" style="color: #0600f7;">https://glec-website.vercel.app/admin/contacts</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: `GLEC <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        replyTo: sanitizedData.email, // User can reply directly
        subject: `[GLEC 문의] ${inquiryTypeLabels[sanitizedData.inquiry_type]} - ${sanitizedData.company_name}`,
        html: adminEmailHtml,
      });

      console.log('[Contact Form] Admin notification email sent to:', ADMIN_EMAIL);

      // Email to user (auto-response)
      const userEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>GLEC 문의 접수 확인</title>
        </head>
        <body style="font-family: 'Pretendard', sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #0600f7; border-bottom: 2px solid #0600f7; padding-bottom: 10px;">
              ✅ 문의가 접수되었습니다
            </h1>

            <p>안녕하세요, <strong>${sanitizedData.contact_name}</strong>님!</p>
            <p>GLEC에 문의해 주셔서 감사합니다.</p>
            <p>고객님의 문의가 성공적으로 접수되었으며, 담당자가 확인 후 <strong>영업일 기준 1-2일 내</strong>에 답변드리겠습니다.</p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">📋 접수된 문의 내용</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; width: 120px;">문의 유형:</td>
                  <td style="padding: 8px;">${inquiryTypeLabels[sanitizedData.inquiry_type]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">회사명:</td>
                  <td style="padding: 8px;">${sanitizedData.company_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">이메일:</td>
                  <td style="padding: 8px;">${sanitizedData.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">전화번호:</td>
                  <td style="padding: 8px;">${sanitizedData.phone}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e8f4ff; padding: 15px; border-left: 4px solid #0600f7; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">
                <strong>💡 빠른 답변을 원하시나요?</strong><br>
                긴급한 사항은 <a href="tel:02-1234-5678" style="color: #0600f7;">02-1234-5678</a>로 연락해 주세요.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #999;">
              <p>GLEC - ISO-14083 국제표준 물류 탄소배출 측정</p>
              <p>웹사이트: <a href="https://glec-website.vercel.app" style="color: #0600f7;">https://glec-website.vercel.app</a></p>
              <p style="margin-top: 15px;">
                이 이메일은 발신 전용입니다. 문의사항은 이메일 답장 또는 웹사이트 Contact Form을 이용해 주세요.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: `GLEC <${FROM_EMAIL}>`,
        to: sanitizedData.email,
        subject: '[GLEC] 문의 접수 확인 - 영업일 기준 1-2일 내 답변드리겠습니다',
        html: userEmailHtml,
      });

      console.log('[Contact Form] Auto-response email sent to:', sanitizedData.email);

    } catch (emailError) {
      console.error('[Contact Form] Email sending failed:', emailError);
      // Don't fail the API call even if email fails
      // Contact is already saved to database
    }

    // Success response
    return NextResponse.json({
      success: true,
      data: {
        id: contact.id,
        message: '문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
      },
    });
  } catch (error) {
    console.error('Contact form submission error:', error);

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
