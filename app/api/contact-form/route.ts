/**
 * Contact Form Submission API
 *
 * POST /api/contact-form
 * Handles contact form submissions:
 * 1. Validate input
 * 2. Save to database (Prisma)
 * 3. Send email via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Resend only if API key is available (prevents build-time errors)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  vehicleCount: string;
  message: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone validation regex (Korean format)
const PHONE_REGEX = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;

function validateContactForm(data: ContactFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: '이름을 입력해주세요' });
  }

  // Company validation
  if (!data.company || data.company.trim().length === 0) {
    errors.push({ field: 'company', message: '회사명을 입력해주세요' });
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: '이메일을 입력해주세요' });
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.push({ field: 'email', message: '올바른 이메일 형식이 아닙니다' });
  }

  // Phone validation
  if (!data.phone || data.phone.trim().length === 0) {
    errors.push({ field: 'phone', message: '전화번호를 입력해주세요' });
  } else if (!PHONE_REGEX.test(data.phone.replace(/-/g, ''))) {
    errors.push({ field: 'phone', message: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)' });
  }

  // Message validation
  if (!data.message || data.message.trim().length === 0) {
    errors.push({ field: 'message', message: '문의 내용을 입력해주세요' });
  } else if (data.message.trim().length < 10) {
    errors.push({ field: 'message', message: '문의 내용을 최소 10자 이상 입력해주세요' });
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
      name: sanitizeInput(body.name),
      company: sanitizeInput(body.company),
      email: sanitizeInput(body.email),
      phone: sanitizeInput(body.phone),
      vehicleCount: body.vehicleCount,
      message: sanitizeInput(body.message),
    };

    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Save to database
    const contact = await prisma.contact.create({
      data: {
        companyName: sanitizedData.company,
        contactName: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        inquiryType: 'PRODUCT',
        message: `${sanitizedData.message}\n\n보유 차량 대수: ${sanitizedData.vehicleCount}`,
        privacyConsent: true,
        status: 'NEW',
        ipAddress: ipAddress,
      },
    });

    // Send email via Resend (optional - continue even if email fails)
    let emailSent = false;
    let emailError = null;

    if (resend) {
      try {
        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@glec.io',
          to: 'contact@glec.io',
          replyTo: sanitizedData.email,
          subject: `[GLEC 상담 신청] ${sanitizedData.company} - ${sanitizedData.name}`,
          html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h1>상담 신청</h1><p>이름: ${sanitizedData.name}</p><p>회사: ${sanitizedData.company}</p><p>이메일: ${sanitizedData.email}</p><p>전화: ${sanitizedData.phone}</p><p>차량: ${sanitizedData.vehicleCount}</p><p>내용: ${sanitizedData.message}</p></body></html>`,
        });

        if (emailResult.error) {
          emailError = emailResult.error;
          console.error('Resend email error:', emailResult.error);
        } else {
          emailSent = true;
        }
      } catch (err) {
        emailError = err;
        console.error('Email sending exception:', err);
      }
    }

    // Success response
    return NextResponse.json({
      success: true,
      data: {
        id: contact.id,
        message: '상담 신청이 성공적으로 접수되었습니다',
        emailSent: emailSent,
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
