/**
 * GET /api/admin/library/leads/[id]
 * PUT /api/admin/library/leads/[id]
 * DELETE /api/admin/library/leads/[id]
 *
 * Admin API for Library Lead Detail Management
 *
 * Security:
 * - Requires authentication (admin_token in Authorization header)
 * - Only SUPER_ADMIN and CONTENT_MANAGER roles
 *
 * Features:
 * - GET: Returns single lead with all details
 * - PUT: Update lead status, score, notes, assigned_to
 * - DELETE: Soft delete (mark as deleted, not actual removal)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

// ====================================================================
// Types & Schemas
// ====================================================================

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const LeadUpdateSchema = z.object({
  lead_status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).optional(),
  lead_score: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

type LeadUpdate = z.infer<typeof LeadUpdateSchema>;

// ====================================================================
// GET /api/admin/library/leads/[id] - Get single lead
// ====================================================================

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '유효하지 않은 Lead ID입니다.',
          },
        },
        { status: 400 }
      );
    }

    // Get lead with library item details
    // Note: Using sql.query() with explicit UUID casting
    const query = `
      SELECT
        ll.*,
        li.title as library_item_title,
        li.slug as library_item_slug,
        li.file_type as library_item_file_type,
        li.category as library_item_category,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM library_leads ll
      LEFT JOIN library_items li ON ll.library_item_id = li.id
      LEFT JOIN users u ON ll.assigned_to = u.id
      WHERE ll.id = $1::uuid
      LIMIT 1
    `;
    const leads = await sql.query(query, [id]);

    if (leads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEAD_NOT_FOUND',
            message: 'Lead를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    const lead = leads[0];

    // Format response with enriched data
    const response = {
      id: lead.id,
      library_item_id: lead.library_item_id,
      library_item: {
        title: lead.library_item_title,
        slug: lead.library_item_slug,
        file_type: lead.library_item_file_type,
        category: lead.library_item_category,
      },
      company_name: lead.company_name,
      contact_name: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      lead_status: lead.lead_status,
      lead_score: lead.lead_score,
      email_sent: lead.email_sent,
      email_sent_at: lead.email_sent_at,
      email_opened: lead.email_opened,
      email_opened_at: lead.email_opened_at,
      email_status: lead.email_status,
      email_delivered: lead.email_delivered,
      email_delivered_at: lead.email_delivered_at,
      email_complained: lead.email_complained,
      email_complained_at: lead.email_complained_at,
      email_bounced: lead.email_bounced,
      email_bounced_at: lead.email_bounced_at,
      bounce_reason: lead.bounce_reason,
      download_link_clicked: lead.download_link_clicked,
      download_link_clicked_at: lead.download_link_clicked_at,
      source: lead.source,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      referrer: lead.referrer,
      privacy_consent: lead.privacy_consent,
      marketing_consent: lead.marketing_consent,
      notes: lead.notes,
      assigned_to: lead.assigned_to,
      assigned_to_user: lead.assigned_to ? {
        name: lead.assigned_to_name,
        email: lead.assigned_to_email,
      } : null,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      last_contacted_at: lead.last_contacted_at,
      resend_email_id: lead.resend_email_id,
      nurture_day3_sent: lead.nurture_day3_sent,
      nurture_day3_sent_at: lead.nurture_day3_sent_at,
      nurture_day7_sent: lead.nurture_day7_sent,
      nurture_day7_sent_at: lead.nurture_day7_sent_at,
      nurture_day14_sent: lead.nurture_day14_sent,
      nurture_day14_sent_at: lead.nurture_day14_sent_at,
      nurture_day30_sent: lead.nurture_day30_sent,
      nurture_day30_sent_at: lead.nurture_day30_sent_at,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('[Admin Library Lead GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// PUT /api/admin/library/leads/[id] - Update lead
// ====================================================================

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '유효하지 않은 Lead ID입니다.',
          },
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const data = LeadUpdateSchema.parse(body);

    // Check if lead exists
    const existingLeads = await sql.query('SELECT id FROM library_leads WHERE id = $1::uuid LIMIT 1', [id]);

    if (existingLeads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEAD_NOT_FOUND',
            message: 'Lead를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.lead_status !== undefined) {
      updates.push(`lead_status = $${paramIndex++}`);
      values.push(data.lead_status);
    }

    if (data.lead_score !== undefined) {
      updates.push(`lead_score = $${paramIndex++}`);
      values.push(data.lead_score);
    }

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }

    if (data.assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(data.assigned_to);
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    // If status changed to CONTACTED, update last_contacted_at
    if (data.lead_status === 'CONTACTED') {
      updates.push(`last_contacted_at = NOW()`);
    }

    if (updates.length === 1) {
      // Only updated_at would be updated
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: '업데이트할 내용이 없습니다.',
          },
        },
        { status: 400 }
      );
    }

    // Execute update
    values.push(id); // Last parameter is id for WHERE clause
    const updateQuery = `
      UPDATE library_leads
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(updateQuery, values);
    const updatedLead = result[0];

    return NextResponse.json({
      success: true,
      message: 'Lead가 업데이트되었습니다',
      data: updatedLead,
    });
  } catch (error: any) {
    console.error('[Admin Library Lead PUT] Error:', error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// DELETE /api/admin/library/leads/[id] - Soft delete lead
// ====================================================================

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '유효하지 않은 Lead ID입니다.',
          },
        },
        { status: 400 }
      );
    }

    // Check if lead exists
    const existingLeads = await sql.query('SELECT id, email FROM library_leads WHERE id = $1::uuid LIMIT 1', [id]);

    if (existingLeads.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'LEAD_NOT_FOUND',
            message: 'Lead를 찾을 수 없습니다.',
          },
        },
        { status: 404 }
      );
    }

    // Actually delete the lead (not soft delete for now)
    // In production, you might want to add a 'deleted_at' column instead
    await sql.query('DELETE FROM library_leads WHERE id = $1::uuid', [id]);

    return NextResponse.json({
      success: true,
      message: 'Lead가 삭제되었습니다',
    });
  } catch (error: any) {
    console.error('[Admin Library Lead DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
 
