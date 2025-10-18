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
