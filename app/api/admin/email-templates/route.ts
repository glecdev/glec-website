/**
 * GET /api/admin/email-templates
 * POST /api/admin/email-templates
 *
 * Email Template Management API
 * - List all templates with filters
 * - Create new template
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// GET: List Email Templates
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const categoryId = searchParams.get('category_id');
    const nurtureDay = searchParams.get('nurture_day');
    const isActive = searchParams.get('is_active');
    const contentType = searchParams.get('content_type');
    const contentId = searchParams.get('content_id');
    const search = searchParams.get('search');

    // Build query conditions
    let conditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (categoryId) {
      conditions.push(`t.category_id = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    if (nurtureDay) {
      conditions.push(`t.nurture_day = $${paramIndex}`);
      params.push(parseInt(nurtureDay));
      paramIndex++;
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(`t.is_active = $${paramIndex}`);
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (contentType) {
      conditions.push(`t.content_type = $${paramIndex}`);
      params.push(contentType);
      paramIndex++;
    }

    if (contentId) {
      conditions.push(`t.content_id = $${paramIndex}`);
      params.push(contentId);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(t.template_name ILIKE $${paramIndex} OR t.subject_line ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // If no filters, use tagged template (no params)
    if (conditions.length === 0) {
      const templates = await sql`
        SELECT
          t.*,
          c.category_name,
          c.category_key,
          c.icon as category_icon,
          s.total_sent,
          s.total_delivered,
          s.total_opened,
          s.total_clicked,
          s.delivery_rate,
          s.open_rate,
          s.click_rate,
          s.last_sent_at
        FROM email_templates t
        LEFT JOIN email_template_categories c ON t.category_id = c.id
        LEFT JOIN email_template_stats s ON t.id = s.template_id
        ORDER BY t.created_at DESC
      `;

      return NextResponse.json({
        success: true,
        data: templates,
        meta: {
          total: templates.length,
        },
      });
    }

    // With filters, use sql.query() for parameterized query
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const queryText = `
      SELECT
        t.*,
        c.category_name,
        c.category_key,
        c.icon as category_icon,
        s.total_sent,
        s.total_delivered,
        s.total_opened,
        s.total_clicked,
        s.delivery_rate,
        s.open_rate,
        s.click_rate,
        s.last_sent_at
      FROM email_templates t
      LEFT JOIN email_template_categories c ON t.category_id = c.id
      LEFT JOIN email_template_stats s ON t.id = s.template_id
      ${whereClause}
      ORDER BY t.created_at DESC
    `;

    const templates = await sql.query(queryText, params);

    return NextResponse.json({
      success: true,
      data: templates,
      meta: {
        total: templates.length,
      },
    });
  } catch (error) {
    console.error('[Admin] Email templates list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch templates',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST: Create Email Template
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      category_id,
      content_type,
      content_id,
      template_key,
      template_name,
      description,
      nurture_day,
      subject_line,
      preview_text,
      html_body,
      plain_text_body,
      available_variables,
      is_active,
      is_default,
      ab_test_group,
      ab_test_weight,
      send_delay_hours,
    } = body;

    // Validation
    if (!category_id || !template_key || !template_name || !nurture_day || !subject_line || !html_body || !plain_text_body) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '필수 항목을 입력해주세요',
            details: [
              !category_id && { field: 'category_id', message: 'Required' },
              !template_key && { field: 'template_key', message: 'Required' },
              !template_name && { field: 'template_name', message: 'Required' },
              !nurture_day && { field: 'nurture_day', message: 'Required' },
              !subject_line && { field: 'subject_line', message: 'Required' },
              !html_body && { field: 'html_body', message: 'Required' },
              !plain_text_body && { field: 'plain_text_body', message: 'Required' },
            ].filter(Boolean),
          },
        },
        { status: 400 }
      );
    }

    // Validate nurture_day
    if (![3, 7, 14, 30].includes(nurture_day)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'nurture_day must be 3, 7, 14, or 30',
          },
        },
        { status: 400 }
      );
    }

    // Check if template_key already exists
    const existing = await sql`
      SELECT id FROM email_templates WHERE template_key = ${template_key}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_KEY',
            message: '이미 존재하는 template_key입니다',
          },
        },
        { status: 400 }
      );
    }

    // Insert template
    const result = await sql`
      INSERT INTO email_templates (
        category_id,
        content_type,
        content_id,
        template_key,
        template_name,
        description,
        nurture_day,
        subject_line,
        preview_text,
        html_body,
        plain_text_body,
        available_variables,
        is_active,
        is_default,
        ab_test_group,
        ab_test_weight,
        send_delay_hours
      ) VALUES (
        ${category_id},
        ${content_type || null},
        ${content_id || null},
        ${template_key},
        ${template_name},
        ${description || null},
        ${nurture_day},
        ${subject_line},
        ${preview_text || null},
        ${html_body},
        ${plain_text_body},
        ${JSON.stringify(available_variables || [])},
        ${is_active !== undefined ? is_active : true},
        ${is_default !== undefined ? is_default : false},
        ${ab_test_group || null},
        ${ab_test_weight || 100},
        ${send_delay_hours || 0}
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        data: result[0],
        message: '이메일 템플릿이 생성되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin] Email template create error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create template',
        },
      },
      { status: 500 }
    );
  }
}
