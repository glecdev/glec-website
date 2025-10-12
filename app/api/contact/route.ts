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

// Email template rendering functions (inline for Edge Runtime compatibility)
function renderAdminEmail(data: {
  inquiryTypeLabel: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  contactId: string;
  timestamp: string;
  ipAddress: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🔔 새로운 고객 문의</h1>
    </div>
    <div style="padding: 30px 20px;">
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0600f7;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0600f7;">📋 문의 정보</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: 600; width: 120px; color: #666;">문의 유형:</td>
          <td style="padding: 8px 0;"><span style="display: inline-block; padding: 4px 12px; background-color: #0600f7; color: #ffffff; border-radius: 4px; font-size: 14px;">${data.inquiryTypeLabel}</span></td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">회사명:</td><td style="padding: 8px 0; font-weight: 500;">${data.companyName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">담당자명:</td><td style="padding: 8px 0;">${data.contactName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">이메일:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #0600f7; text-decoration: none; font-weight: 500;">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">전화번호:</td><td style="padding: 8px 0;">${data.phone}</td></tr>
        </table>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">💬 문의 내용</h3>
        <p style="margin: 0; white-space: pre-wrap; line-height: 1.8;">${data.message}</p>
      </div>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #666; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong>접수 ID:</strong> <code style="background-color: #e8e8e8; padding: 2px 6px; border-radius: 3px;">${data.contactId}</code></p>
        <p style="margin: 0 0 8px 0;"><strong>접수 시간:</strong> ${data.timestamp}</p>
        <p style="margin: 0;"><strong>IP 주소:</strong> ${data.ipAddress}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://glec-website.vercel.app/admin/contacts" style="display: inline-block; padding: 14px 32px; background-color: #0600f7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">Admin Dashboard에서 확인하기 →</a>
      </div>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 12px; color: #999;">이 이메일은 GLEC 웹사이트 Contact Form에서 자동 발송되었습니다.</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function renderUserEmail(data: {
  contactName: string;
  companyName: string;
  inquiryTypeLabel: string;
  contactId: string;
  timestamp: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">✅ 문의 접수 완료</h1>
    </div>
    <div style="padding: 30px 20px;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">안녕하세요, <strong>${data.contactName}</strong>님</p>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0600f7;">
        <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8;"><strong style="color: #0600f7;">${data.companyName}</strong> 고객님의 문의가 정상적으로 접수되었습니다.</p>
        <p style="margin: 0; font-size: 15px; line-height: 1.8;">담당자가 확인 후 <strong style="color: #0600f7;">영업일 기준 1-2일 내</strong>에 답변드리겠습니다.</p>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">📋 접수 정보</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: 600; width: 120px; color: #666;">접수 번호:</td>
          <td style="padding: 8px 0;"><code style="background-color: #e8e8e8; padding: 4px 8px; border-radius: 3px; font-size: 13px;">${data.contactId}</code></td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">접수 시간:</td><td style="padding: 8px 0;">${data.timestamp}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 600; color: #666;">문의 유형:</td>
          <td style="padding: 8px 0;"><span style="display: inline-block; padding: 4px 12px; background-color: #0600f7; color: #ffffff; border-radius: 4px; font-size: 13px;">${data.inquiryTypeLabel}</span></td></tr>
        </table>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px;">📞 긴급 문의</h3>
        <p style="margin: 0 0 10px 0; font-size: 14px;">빠른 상담이 필요하신 경우 아래 연락처로 문의해주세요.</p>
        <p style="margin: 0; font-size: 14px;"><strong>전화:</strong> <a href="tel:02-1234-5678" style="color: #0600f7; text-decoration: none;">02-1234-5678</a> | <strong>이메일:</strong> <a href="mailto:contact@glec.io" style="color: #0600f7; text-decoration: none;">contact@glec.io</a></p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://glec-website.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #0600f7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">GLEC 웹사이트 방문하기 →</a>
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 10px 0; font-size: 14px;">감사합니다.</p>
        <p style="margin: 0; font-size: 14px; color: #0600f7; font-weight: 600;">GLEC 드림</p>
      </div>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 12px; color: #999;">이 이메일은 GLEC 웹사이트 Contact Form에서 자동 발송되었습니다.</p>
    </div>
  </div>
</body>
</html>`.trim();
}

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
      // Inquiry type labels
      const inquiryTypeLabels = {
        PRODUCT: '제품 문의',
        PARTNERSHIP: '제휴 문의',
        SUPPORT: '기술 지원',
        GENERAL: '일반 문의',
      };

      // Prepare admin notification email data
      const now = new Date();
      const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      const timestamp = koreaTime.toISOString().replace('T', ' ').substring(0, 19);

      console.log('[Contact Form] Preparing to send emails...');
      console.log('[Contact Form] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
      console.log('[Contact Form] Resend client exists:', !!resend);
      console.log('[Contact Form] FROM_EMAIL:', FROM_EMAIL);
      console.log('[Contact Form] ADMIN_EMAIL:', ADMIN_EMAIL);
      console.log('[Contact Form] Contact ID:', contact.id);

      // Send admin notification email
      console.log('[Contact Form] About to call resend.emails.send() for admin...');
      const adminEmailResult = await resend.emails.send({
        from: `GLEC <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        replyTo: sanitizedData.email,
        subject: `[GLEC 문의] ${inquiryTypeLabels[sanitizedData.inquiry_type]} - ${sanitizedData.company_name}`,
        html: renderAdminEmail({
          inquiryTypeLabel: inquiryTypeLabels[sanitizedData.inquiry_type],
          companyName: sanitizedData.company_name,
          contactName: sanitizedData.contact_name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          message: sanitizedData.message,
          contactId: contact.id,
          timestamp,
          ipAddress,
        }),
      });

      console.log('[Contact Form] Admin email result:', JSON.stringify(adminEmailResult));

      if (adminEmailResult.error) {
        throw new Error(`Resend API error: ${JSON.stringify(adminEmailResult.error)}`);
      }

      console.log('[Contact Form] Admin notification email sent to:', ADMIN_EMAIL);

      // Send user auto-response email
      const userEmailResult = await resend.emails.send({
        from: `GLEC <${FROM_EMAIL}>`,
        to: sanitizedData.email,
        subject: '[GLEC] 문의 접수 확인 - 영업일 기준 1-2일 내 답변드리겠습니다',
        html: renderUserEmail({
          contactName: sanitizedData.contact_name,
          companyName: sanitizedData.company_name,
          inquiryTypeLabel: inquiryTypeLabels[sanitizedData.inquiry_type],
          contactId: contact.id,
          timestamp,
        }),
      });

      console.log('[Contact Form] User email result:', JSON.stringify(userEmailResult));

      if (userEmailResult.error) {
        throw new Error(`Resend API error: ${JSON.stringify(userEmailResult.error)}`);
      }

      console.log('[Contact Form] Auto-response email sent to:', sanitizedData.email);

    } catch (emailError) {
      console.error('[Contact Form] Email sending failed:');
      console.error('Error name:', emailError?.name);
      console.error('Error message:', emailError?.message);
      console.error('Error stack:', emailError?.stack);
      console.error('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
      console.error('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length);
      console.error('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
      console.error('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
      console.error('Resend client initialized:', !!resend);
      // Don't fail the API call even if email fails
      // Contact is already saved to database

      // Return error details in response for debugging
      return NextResponse.json({
        success: true,
        data: {
          id: contact.id,
          message: '문의가 접수되었습니다. 이메일 발송 중 오류가 발생했습니다.',
        },
        debug: {
          emailError: {
            name: emailError?.name,
            message: emailError?.message,
            hasApiKey: !!process.env.RESEND_API_KEY,
            apiKeyLength: process.env.RESEND_API_KEY?.length,
            fromEmail: process.env.RESEND_FROM_EMAIL,
            adminEmail: process.env.ADMIN_EMAIL,
          }
        }
      });
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
