/**
 * GET /api/admin/email-templates/[id]
 * PUT /api/admin/email-templates/[id]
 * DELETE /api/admin/email-templates/[id]
 *
 * Email Template Detail API
 * - Get single template with stats
 * - Update template
 * - Delete template
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// GET: Get Single Email Template
// ============================================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const templates = await sql`
      SELECT
        t.*,
        c.category_name,
        c.category_key,
        c.icon as category_icon,
        c.is_content_specific,
        s.total_sent,
        s.total_delivered,
        s.total_opened,
        s.total_clicked,
        s.total_bounced,
        s.total_complained,
        s.delivery_rate,
        s.open_rate,
        s.click_rate,
        s.bounce_rate,
        s.complaint_rate,
        s.last_sent_at
      FROM email_templates t
      LEFT JOIN email_template_categories c ON t.category_id = c.id
      LEFT JOIN email_template_stats s ON t.id = s.template_id
      WHERE t.id = ${id}
    `;

    if (templates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '템플릿을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: templates[0],
    });
  } catch (error) {
    console.error('[Admin] Email template get error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch template',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT: Update Email Template
// ============================================================

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if template exists
    const existing = await sql`
      SELECT id FROM email_templates WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '템플릿을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // Validate nurture_day if provided
    if (nurture_day && ![3, 7, 14, 30].includes(nurture_day)) {
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

    // Check template_key uniqueness if being changed
    if (template_key) {
      const duplicate = await sql`
        SELECT id FROM email_templates
        WHERE template_key = ${template_key} AND id != ${id}
      `;

      if (duplicate.length > 0) {
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
    }

    // Build update query
    const updates = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (category_id !== undefined) {
      updates.push(`category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }

    if (content_type !== undefined) {
      updates.push(`content_type = $${paramIndex}`);
      values.push(content_type);
      paramIndex++;
    }

    if (content_id !== undefined) {
      updates.push(`content_id = $${paramIndex}`);
      values.push(content_id);
      paramIndex++;
    }

    if (template_key !== undefined) {
      updates.push(`template_key = $${paramIndex}`);
      values.push(template_key);
      paramIndex++;
    }

    if (template_name !== undefined) {
      updates.push(`template_name = $${paramIndex}`);
      values.push(template_name);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (nurture_day !== undefined) {
      updates.push(`nurture_day = $${paramIndex}`);
      values.push(nurture_day);
      paramIndex++;
    }

    if (subject_line !== undefined) {
      updates.push(`subject_line = $${paramIndex}`);
      values.push(subject_line);
      paramIndex++;
    }

    if (preview_text !== undefined) {
      updates.push(`preview_text = $${paramIndex}`);
      values.push(preview_text);
      paramIndex++;
    }

    if (html_body !== undefined) {
      updates.push(`html_body = $${paramIndex}`);
      values.push(html_body);
      paramIndex++;
    }

    if (plain_text_body !== undefined) {
      updates.push(`plain_text_body = $${paramIndex}`);
      values.push(plain_text_body);
      paramIndex++;
    }

    if (available_variables !== undefined) {
      updates.push(`available_variables = $${paramIndex}`);
      values.push(JSON.stringify(available_variables));
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    if (is_default !== undefined) {
      updates.push(`is_default = $${paramIndex}`);
      values.push(is_default);
      paramIndex++;
    }

    if (ab_test_group !== undefined) {
      updates.push(`ab_test_group = $${paramIndex}`);
      values.push(ab_test_group);
      paramIndex++;
    }

    if (ab_test_weight !== undefined) {
      updates.push(`ab_test_weight = $${paramIndex}`);
      values.push(ab_test_weight);
      paramIndex++;
    }

    if (send_delay_hours !== undefined) {
      updates.push(`send_delay_hours = $${paramIndex}`);
      values.push(send_delay_hours);
      paramIndex++;
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    // Add id to values
    values.push(id);

    const updateQuery = `
      UPDATE email_templates
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(updateQuery, values);

    return NextResponse.json({
      success: true,
      data: result[0],
      message: '템플릿이 수정되었습니다',
    });
  } catch (error) {
    console.error('[Admin] Email template update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update template',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE: Delete Email Template
// ============================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if template exists
    const existing = await sql`
      SELECT id, template_name FROM email_templates WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '템플릿을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // Check if template has been used (has send history)
    const history = await sql`
      SELECT COUNT(*) as count FROM email_send_history WHERE template_id = ${id}
    `;

    if (history[0].count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_HISTORY',
            message: '이미 발송된 이력이 있는 템플릿은 삭제할 수 없습니다. 비활성화(is_active=false)를 권장합니다.',
          },
        },
        { status: 400 }
      );
    }

    // Delete template (cascade will delete stats)
    await sql`
      DELETE FROM email_templates WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: '템플릿이 삭제되었습니다',
    });
  } catch (error) {
    console.error('[Admin] Email template delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete template',
        },
      },
      { status: 500 }
    );
  }
}
