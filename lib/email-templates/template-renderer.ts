/**
 * Email Template Renderer
 *
 * Fetches email templates from database and renders them with dynamic variables
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface TemplateVariables {
  [key: string]: string | number | undefined | null;
}

interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  subject_line: string;
  preview_text: string | null;
  html_body: string;
  plain_text_body: string;
  available_variables: string[];
  is_active: boolean;
}

/**
 * Fetch template by category and nurture day
 */
export async function getTemplateByCategory(
  categoryKey: string,
  nurtureDay: number
): Promise<EmailTemplate | null> {
  try {
    const templates = await sql`
      SELECT
        t.id,
        t.template_key,
        t.template_name,
        t.subject_line,
        t.preview_text,
        t.html_body,
        t.plain_text_body,
        t.available_variables,
        t.is_active
      FROM email_templates t
      INNER JOIN email_template_categories c ON t.category_id = c.id
      WHERE c.category_key = ${categoryKey}
        AND t.nurture_day = ${nurtureDay}
        AND t.is_active = TRUE
        AND (t.is_default = TRUE OR t.content_type IS NULL)
      ORDER BY t.is_default DESC, t.created_at DESC
      LIMIT 1
    `;

    if (templates.length === 0) {
      console.warn(`[Template Renderer] No template found for ${categoryKey} Day ${nurtureDay}`);
      return null;
    }

    return templates[0] as EmailTemplate;
  } catch (error) {
    console.error(`[Template Renderer] Error fetching template:`, error);
    return null;
  }
}

/**
 * Fetch template by specific content (library item or event)
 */
export async function getTemplateByContent(
  contentType: string,
  contentId: string,
  nurtureDay: number
): Promise<EmailTemplate | null> {
  try {
    const templates = await sql`
      SELECT
        t.id,
        t.template_key,
        t.template_name,
        t.subject_line,
        t.preview_text,
        t.html_body,
        t.plain_text_body,
        t.available_variables,
        t.is_active
      FROM email_templates t
      WHERE t.content_type = ${contentType}
        AND t.content_id = ${contentId}
        AND t.nurture_day = ${nurtureDay}
        AND t.is_active = TRUE
      LIMIT 1
    `;

    if (templates.length === 0) {
      // Fallback to generic category template
      const categoryKey = contentType === 'library_item' ? 'LIBRARY_DOWNLOAD' : 'EVENT_REGISTRATION';
      return await getTemplateByCategory(categoryKey, nurtureDay);
    }

    return templates[0] as EmailTemplate;
  } catch (error) {
    console.error(`[Template Renderer] Error fetching content template:`, error);
    return null;
  }
}

/**
 * Render template with variables
 */
function renderTemplate(template: string, variables: TemplateVariables): string {
  let rendered = template;

  // Replace all {variable_name} placeholders
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    const replacement = value !== null && value !== undefined ? String(value) : '';
    rendered = rendered.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
  }

  return rendered;
}

/**
 * Get rendered email content for library download nurture
 */
export async function getLibraryNurtureEmail(
  nurtureDay: number,
  variables: TemplateVariables,
  libraryItemId?: string
) {
  // Try content-specific template first
  let template: EmailTemplate | null = null;

  if (libraryItemId) {
    template = await getTemplateByContent('library_item', libraryItemId, nurtureDay);
  }

  // Fallback to generic LIBRARY_DOWNLOAD template
  if (!template) {
    template = await getTemplateByCategory('LIBRARY_DOWNLOAD', nurtureDay);
  }

  if (!template) {
    throw new Error(`No template found for Library Download Day ${nurtureDay}`);
  }

  return {
    template_id: template.id,
    template_key: template.template_key,
    subject: renderTemplate(template.subject_line, variables),
    html: renderTemplate(template.html_body, variables),
    text: renderTemplate(template.plain_text_body, variables),
    preview_text: template.preview_text ? renderTemplate(template.preview_text, variables) : undefined,
  };
}

/**
 * Get rendered email content for contact form nurture
 */
export async function getContactFormNurtureEmail(
  nurtureDay: number,
  variables: TemplateVariables
) {
  const template = await getTemplateByCategory('CONTACT_FORM', nurtureDay);

  if (!template) {
    throw new Error(`No template found for Contact Form Day ${nurtureDay}`);
  }

  return {
    template_id: template.id,
    template_key: template.template_key,
    subject: renderTemplate(template.subject_line, variables),
    html: renderTemplate(template.html_body, variables),
    text: renderTemplate(template.plain_text_body, variables),
    preview_text: template.preview_text ? renderTemplate(template.preview_text, variables) : undefined,
  };
}

/**
 * Get rendered email content for demo request nurture
 */
export async function getDemoRequestNurtureEmail(
  nurtureDay: number,
  variables: TemplateVariables
) {
  const template = await getTemplateByCategory('DEMO_REQUEST', nurtureDay);

  if (!template) {
    throw new Error(`No template found for Demo Request Day ${nurtureDay}`);
  }

  return {
    template_id: template.id,
    template_key: template.template_key,
    subject: renderTemplate(template.subject_line, variables),
    html: renderTemplate(template.html_body, variables),
    text: renderTemplate(template.plain_text_body, variables),
    preview_text: template.preview_text ? renderTemplate(template.preview_text, variables) : undefined,
  };
}

/**
 * Get contact form confirmation email (immediate send)
 *
 * Note: Uses inline template since DB constraint doesn't allow nurture_day = 0
 * TODO: Move to database template when constraint is updated
 */
export function getContactFormConfirmationEmail(variables: TemplateVariables) {
  const subject = renderTemplate('[GLEC] {contact_name}님, 문의가 접수되었습니다', variables);

  const html = renderTemplate(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC - 문의 접수 확인</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">GLEC</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">글로벌 물류 탄소배출 측정 전문가</p>
  </div>

  <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">안녕하세요 {contact_name}님 👋</h2>

    <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px;">
      <strong>{company_name}</strong>에서 보내주신 문의가 <strong>정상적으로 접수</strong>되었습니다.
    </p>

    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
      담당자가 확인 후 영업일 기준 <strong>24시간 이내</strong>에 연락드리겠습니다.
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 0 0 24px 0; border-left: 4px solid #0600f7;">
      <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 접수 내용</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">회사명</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{company_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">담당자</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{contact_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">이메일</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">연락처</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{phone}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://glec-website.vercel.app" style="display: inline-block; background: #0600f7; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">GLEC 웹사이트 방문하기</a>
    </div>

    <div style="background: #eff6ff; padding: 16px; border-radius: 6px; margin: 24px 0 0 0;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">💡 먼저 궁금하신 내용이 있으신가요?</p>
      <p style="margin: 0; color: #3b82f6; font-size: 13px;">자료실에서 ISO-14083 가이드북, 탄소배출 계산 사례 등을 무료로 다운로드하실 수 있습니다.</p>
      <a href="https://glec-website.vercel.app/knowledge/library" style="color: #0600f7; text-decoration: underline; font-size: 13px; font-weight: 500; display: inline-block; margin-top: 8px;">자료실 바로가기 →</a>
    </div>
  </div>

  <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 8px 0;">본 이메일은 발신 전용입니다. 답장은 처리되지 않습니다.</p>
    <p style="margin: 0 0 16px 0;">문의사항은 <a href="mailto:contact@glec.io" style="color: #0600f7; text-decoration: none;">contact@glec.io</a>로 연락 주세요.</p>
    <p style="margin: 0; color: #d1d5db;">© 2025 GLEC. All rights reserved.</p>
  </div>

</body>
</html>`, variables);

  const text = renderTemplate(`안녕하세요 {contact_name}님,

{company_name}에서 보내주신 문의가 정상적으로 접수되었습니다.

담당자가 확인 후 영업일 기준 24시간 이내에 연락드리겠습니다.

📋 접수 내용
- 회사명: {company_name}
- 담당자: {contact_name}
- 이메일: {email}
- 연락처: {phone}

💡 먼저 궁금하신 내용이 있으신가요?
자료실에서 ISO-14083 가이드북, 탄소배출 계산 사례 등을 무료로 다운로드하실 수 있습니다.
https://glec-website.vercel.app/knowledge/library

감사합니다.
GLEC 팀 드림

---
본 이메일은 발신 전용입니다.
문의사항: contact@glec.io
© 2025 GLEC. All rights reserved.`, variables);

  return { subject, html, text };
}

/**
 * Log email send to history table
 */
export async function logEmailSend(
  templateId: string,
  leadId: string,
  email: string,
  resendEmailId: string | null,
  status: 'sent' | 'failed',
  errorMessage?: string
) {
  try {
    await sql`
      INSERT INTO email_send_history (
        template_id,
        lead_id,
        recipient_email,
        resend_email_id,
        send_status,
        error_message,
        sent_at
      ) VALUES (
        ${templateId},
        ${leadId},
        ${email},
        ${resendEmailId},
        ${status},
        ${errorMessage || null},
        NOW()
      )
    `;

    // Update template stats
    if (status === 'sent') {
      await sql`
        INSERT INTO email_template_stats (template_id, total_sent, last_sent_at)
        VALUES (${templateId}, 1, NOW())
        ON CONFLICT (template_id)
        DO UPDATE SET
          total_sent = email_template_stats.total_sent + 1,
          last_sent_at = NOW()
      `;
    }
  } catch (error) {
    console.error('[Template Renderer] Error logging email send:', error);
  }
}
