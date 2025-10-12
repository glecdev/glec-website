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
import {
  renderContactAdminNotification,
  type ContactAdminNotificationData
} from '@/lib/email-templates/contact-admin-notification';
import {
  renderContactUserAutoResponse,
  type ContactUserAutoResponseData
} from '@/lib/email-templates/contact-user-autoresponse';

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
      // Inquiry type labels
      const inquiryTypeLabels = {
        PRODUCT: '제품 문의',
        PARTNERSHIP: '제휴 문의',
        SUPPORT: '기술 지원',
        GENERAL: '일반 문의',
      };

      // Prepare admin notification email data
      const adminEmailData: ContactAdminNotificationData = {
        inquiryType: sanitizedData.inquiry_type,
        inquiryTypeLabel: inquiryTypeLabels[sanitizedData.inquiry_type],
        companyName: sanitizedData.company_name,
        contactName: sanitizedData.contact_name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        message: sanitizedData.message,
        contactId: contact.id,
        timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        ipAddress,
      };

      // Send admin notification email
      await resend.emails.send({
        from: `GLEC <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        replyTo: sanitizedData.email,
        subject: `[GLEC 문의] ${inquiryTypeLabels[sanitizedData.inquiry_type]} - ${sanitizedData.company_name}`,
        html: renderContactAdminNotification(adminEmailData),
      });

      console.log('[Contact Form] Admin notification email sent to:', ADMIN_EMAIL);

      // Prepare user auto-response email data
      const userEmailData: ContactUserAutoResponseData = {
        contactName: sanitizedData.contact_name,
        companyName: sanitizedData.company_name,
        inquiryTypeLabel: inquiryTypeLabels[sanitizedData.inquiry_type],
        contactId: contact.id,
        timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      };

      // Send user auto-response email
      await resend.emails.send({
        from: `GLEC <${FROM_EMAIL}>`,
        to: sanitizedData.email,
        subject: '[GLEC] 문의 접수 확인 - 영업일 기준 1-2일 내 답변드리겠습니다',
        html: renderContactUserAutoResponse(userEmailData),
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
