/**
 * Cloudflare Pages Function: Contact Form Submission
 *
 * POST /api/contact-form
 * Handles contact form submissions and sends email via Resend
 */

interface Env {
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
}

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

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  try {
    // Check if Resend is configured
    if (!context.env.RESEND_API_KEY) {
      return Response.json(
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
    const body: ContactFormData = await context.request.json();

    // Validate input
    const validationErrors = validateContactForm(body);
    if (validationErrors.length > 0) {
      return Response.json(
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

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: context.env.RESEND_FROM_EMAIL || 'noreply@glec.io',
        to: 'contact@glec.io',
        reply_to: sanitizedData.email,
        subject: `[GLEC 상담 신청] ${sanitizedData.company} - ${sanitizedData.name}`,
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
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🎯 새로운 상담 신청</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">GLEC 무료 상담 신청이 접수되었습니다</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 이름</div>
                <div class="value">${sanitizedData.name}</div>
              </div>

              <div class="field">
                <div class="label">🏢 회사명</div>
                <div class="value">${sanitizedData.company}</div>
              </div>

              <div class="field">
                <div class="label">📧 이메일</div>
                <div class="value"><a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></div>
              </div>

              <div class="field">
                <div class="label">📞 전화번호</div>
                <div class="value"><a href="tel:${sanitizedData.phone}">${sanitizedData.phone}</a></div>
              </div>

              <div class="field">
                <div class="label">🚚 보유 차량 대수</div>
                <div class="value">${sanitizedData.vehicleCount}</div>
              </div>

              <div class="field">
                <div class="label">💬 문의 내용</div>
                <div class="value" style="white-space: pre-wrap;">${sanitizedData.message}</div>
              </div>

              <div class="footer">
                <p>📅 접수 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
                <p>⚡ 영업일 기준 24시간 내에 담당자가 연락드립니다.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Resend email error:', error);
      return Response.json(
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

    const emailResult = await emailResponse.json();

    // Success response
    return Response.json({
      success: true,
      data: {
        id: emailResult.id,
        message: '상담 신청이 성공적으로 접수되었습니다',
      },
    });
  } catch (error) {
    console.error('Contact form submission error:', error);

    return Response.json(
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
