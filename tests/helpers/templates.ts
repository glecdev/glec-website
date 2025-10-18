/**
 * Template Test Helpers
 *
 * Utilities for testing email template rendering and validation
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// TYPES
// ============================================================

export interface EmailTemplate {
  id: string;
  category_id: string;
  template_key: string;
  template_name: string;
  subject_line: string;
  preview_text?: string;
  html_body: string;
  plain_text_body: string;
  nurture_day: number;
  available_variables: string[];
  is_active: boolean;
  is_default: boolean;
  created_at: Date;
}

export interface TemplateVariables {
  [key: string]: string | number | undefined | null;
}

export interface TemplateStats {
  template_id: string;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_complained: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  last_sent_at?: Date;
}

// ============================================================
// TEMPLATE FETCHING
// ============================================================

export async function getTemplateByCategory(
  categoryKey: string,
  nurtureDay: number
): Promise<EmailTemplate | null> {
  const templates = await sql`
    SELECT
      t.id,
      t.category_id,
      t.template_key,
      t.template_name,
      t.subject_line,
      t.preview_text,
      t.html_body,
      t.plain_text_body,
      t.nurture_day,
      t.available_variables,
      t.is_active,
      t.is_default,
      t.created_at
    FROM email_templates t
    INNER JOIN email_template_categories c ON t.category_id = c.id
    WHERE c.category_key = ${categoryKey}
      AND t.nurture_day = ${nurtureDay}
      AND t.is_active = TRUE
    ORDER BY t.is_default DESC, t.created_at DESC
    LIMIT 1
  `;

  return templates[0] as EmailTemplate || null;
}

export async function getAllTemplatesByCategory(categoryKey: string): Promise<EmailTemplate[]> {
  const templates = await sql`
    SELECT
      t.id,
      t.category_id,
      t.template_key,
      t.template_name,
      t.subject_line,
      t.preview_text,
      t.html_body,
      t.plain_text_body,
      t.nurture_day,
      t.available_variables,
      t.is_active,
      t.is_default,
      t.created_at
    FROM email_templates t
    INNER JOIN email_template_categories c ON t.category_id = c.id
    WHERE c.category_key = ${categoryKey}
      AND t.is_active = TRUE
    ORDER BY t.nurture_day ASC, t.created_at DESC
  `;

  return templates as EmailTemplate[];
}

export async function getTemplateById(templateId: string): Promise<EmailTemplate | null> {
  const templates = await sql`
    SELECT
      t.id,
      t.category_id,
      t.template_key,
      t.template_name,
      t.subject_line,
      t.preview_text,
      t.html_body,
      t.plain_text_body,
      t.nurture_day,
      t.available_variables,
      t.is_active,
      t.is_default,
      t.created_at
    FROM email_templates t
    WHERE t.id = ${templateId}
    LIMIT 1
  `;

  return templates[0] as EmailTemplate || null;
}

// ============================================================
// TEMPLATE RENDERING
// ============================================================

export function renderTemplate(template: string, variables: TemplateVariables): string {
  let rendered = template;

  // Replace all {variable_name} placeholders
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    const replacement = value !== null && value !== undefined ? String(value) : '';
    rendered = rendered.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
  }

  return rendered;
}

export function renderTemplateContent(
  template: EmailTemplate,
  variables: TemplateVariables
): {
  subject: string;
  html: string;
  text: string;
  preview?: string;
} {
  return {
    subject: renderTemplate(template.subject_line, variables),
    html: renderTemplate(template.html_body, variables),
    text: renderTemplate(template.plain_text_body, variables),
    preview: template.preview_text ? renderTemplate(template.preview_text, variables) : undefined,
  };
}

// ============================================================
// TEMPLATE VALIDATION
// ============================================================

export function validateTemplateVariables(
  template: EmailTemplate,
  variables: TemplateVariables
): {
  valid: boolean;
  missingVariables: string[];
  unusedVariables: string[];
} {
  const missingVariables: string[] = [];
  const unusedVariables: string[] = [];

  // Check for missing required variables
  const availableVars = template.available_variables;
  for (const varName of availableVars) {
    if (!(varName in variables)) {
      missingVariables.push(varName);
    }
  }

  // Check for unused variables
  for (const varName of Object.keys(variables)) {
    if (!availableVars.includes(varName)) {
      unusedVariables.push(varName);
    }
  }

  return {
    valid: missingVariables.length === 0,
    missingVariables,
    unusedVariables,
  };
}

export function verifyNoPlaceholders(renderedContent: string): {
  valid: boolean;
  remainingPlaceholders: string[];
} {
  const placeholderPattern = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const matches = renderedContent.match(placeholderPattern) || [];

  return {
    valid: matches.length === 0,
    remainingPlaceholders: matches,
  };
}

export function validateRenderedEmail(
  subject: string,
  html: string,
  text: string
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check subject
  const subjectCheck = verifyNoPlaceholders(subject);
  if (!subjectCheck.valid) {
    errors.push(`Subject has unrendered placeholders: ${subjectCheck.remainingPlaceholders.join(', ')}`);
  }

  // Check HTML
  const htmlCheck = verifyNoPlaceholders(html);
  if (!htmlCheck.valid) {
    errors.push(`HTML has unrendered placeholders: ${htmlCheck.remainingPlaceholders.join(', ')}`);
  }

  // Check text
  const textCheck = verifyNoPlaceholders(text);
  if (!textCheck.valid) {
    errors.push(`Text has unrendered placeholders: ${textCheck.remainingPlaceholders.join(', ')}`);
  }

  // Check for empty content
  if (!subject.trim()) {
    errors.push('Subject is empty');
  }

  if (!html.trim()) {
    errors.push('HTML body is empty');
  }

  if (!text.trim()) {
    errors.push('Text body is empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// TEMPLATE STATISTICS
// ============================================================

export async function getTemplateStats(templateId: string): Promise<TemplateStats | null> {
  const stats = await sql`
    SELECT * FROM email_template_stats
    WHERE template_id = ${templateId}
    LIMIT 1
  `;

  return stats[0] as TemplateStats || null;
}

export async function getAllTemplateStats(): Promise<TemplateStats[]> {
  const stats = await sql`
    SELECT * FROM email_template_stats
    ORDER BY total_sent DESC
  `;

  return stats as TemplateStats[];
}

// ============================================================
// TEMPLATE COUNTING
// ============================================================

export async function countTemplatesByCategory(): Promise<Map<string, number>> {
  const results = await sql`
    SELECT
      c.category_key,
      COUNT(t.id) as count
    FROM email_template_categories c
    LEFT JOIN email_templates t ON t.category_id = c.id AND t.is_active = TRUE
    GROUP BY c.category_key
    ORDER BY c.category_key
  `;

  const counts = new Map<string, number>();
  for (const row of results) {
    counts.set(row.category_key, parseInt(row.count));
  }

  return counts;
}

export async function countTotalTemplates(): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM email_templates WHERE is_active = TRUE
  `;

  return parseInt(result[0].count);
}

// ============================================================
// TEST UTILITIES
// ============================================================

export async function verifyTemplateExists(
  categoryKey: string,
  nurtureDay: number
): Promise<boolean> {
  const template = await getTemplateByCategory(categoryKey, nurtureDay);
  return template !== null;
}

export async function verifyAllNurtureDaysHaveTemplates(
  categoryKey: string,
  expectedDays: number[] = [3, 7, 14, 30]
): Promise<{
  valid: boolean;
  missingDays: number[];
}> {
  const missingDays: number[] = [];

  for (const day of expectedDays) {
    const exists = await verifyTemplateExists(categoryKey, day);
    if (!exists) {
      missingDays.push(day);
    }
  }

  return {
    valid: missingDays.length === 0,
    missingDays,
  };
}
