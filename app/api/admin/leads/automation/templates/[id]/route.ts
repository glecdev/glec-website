/**
 * Email Template Detail API
 * GET /api/admin/leads/automation/templates/[id]
 * PUT /api/admin/leads/automation/templates/[id]
 * DELETE /api/admin/leads/automation/templates/[id]
 *
 * Purpose: Single template operations
 * Authentication: Required (CONTENT_MANAGER or higher)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const EmailTemplateTypeEnum = z.enum(['WELCOME', 'CONFIRMATION', 'FOLLOW_UP', 'NURTURE', 'RE_ENGAGEMENT']);
const LeadSourceTypeEnum = z.enum(['LIBRARY_LEAD', 'CONTACT_FORM', 'DEMO_REQUEST', 'EVENT_REGISTRATION']);
const TriggerTypeEnum = z.enum(['LEAD_CREATED', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'TIME_ELAPSED', 'STATUS_CHANGED']);

// PUT body validation
const UpdateTemplateSchema = z.object({
  template_name: z.string().min(1).max(100).optional(),
  template_type: EmailTemplateTypeEnum.optional(),
  lead_source_type: LeadSourceTypeEnum.optional(),
  subject: z.string().min(1).max(200).optional(),
  html_body: z.string().min(1).optional(),
  text_body: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  trigger_type: TriggerTypeEnum.optional(),
  trigger_delay_minutes: z.number().int().min(0).optional(),
  is_ab_test: z.boolean().optional(),
  ab_variant_id: z.string().uuid().nullable().optional(),
  ab_traffic_split: z.number().int().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

// ============================================================
// GET /api/admin/leads/automation/templates/[id]
// ============================================================

export const GET = withAuth(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const templateId = params.id;

    // 1. Validate UUID
    const uuidSchema = z.string().uuid();
    const validatedId = uuidSchema.parse(templateId);

    // 2. Fetch template with full details
    const template = await prisma.emailTemplate.findUnique({
      where: { id: validatedId },
      include: {
        automationRules: {
          include: {
            emailSends: {
              select: {
                status: true,
                sentAt: true,
              },
            },
          },
        },
        emailSends: {
          select: {
            status: true,
            sentAt: true,
            openedAt: true,
            clickedAt: true,
          },
          orderBy: {
            sentAt: 'desc',
          },
          take: 10, // Last 10 sends
        },
        emailMetrics: {
          select: {
            date: true,
            hour: true,
            sentCount: true,
            deliveredCount: true,
            openedCount: true,
            clickedCount: true,
            convertedCount: true,
          },
          orderBy: {
            date: 'desc',
          },
          take: 30, // Last 30 days
        },
        abVariant: {
          select: {
            id: true,
            templateName: true,
            isActive: true,
          },
        },
        abVariants: {
          select: {
            id: true,
            templateName: true,
            isActive: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: `Template with ID "${templateId}" not found`,
          },
        },
        { status: 404 }
      );
    }

    // 3. Calculate detailed stats
    const totalSent = template.emailMetrics.reduce((sum, m) => sum + m.sentCount, 0);
    const totalDelivered = template.emailMetrics.reduce((sum, m) => sum + m.deliveredCount, 0);
    const totalOpened = template.emailMetrics.reduce((sum, m) => sum + m.openedCount, 0);
    const totalClicked = template.emailMetrics.reduce((sum, m) => sum + m.clickedCount, 0);
    const totalConverted = template.emailMetrics.reduce((sum, m) => sum + m.convertedCount, 0);

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const conversionRate = totalClicked > 0 ? (totalConverted / totalClicked) * 100 : 0;

    // 4. Format response
    const response = {
      template_id: template.id,
      template_name: template.templateName,
      template_type: template.templateType,
      lead_source_type: template.leadSourceType,

      // Email Content
      subject: template.subject,
      html_body: template.htmlBody,
      text_body: template.textBody,
      variables: template.variables,

      // Trigger Configuration
      trigger_type: template.triggerType,
      trigger_delay_minutes: template.triggerDelayMinutes,

      // A/B Testing
      is_ab_test: template.isAbTest,
      ab_variant: template.abVariant
        ? {
            template_id: template.abVariant.id,
            template_name: template.abVariant.templateName,
            is_active: template.abVariant.isActive,
          }
        : null,
      ab_variants: template.abVariants.map((v) => ({
        template_id: v.id,
        template_name: v.templateName,
        is_active: v.isActive,
      })),
      ab_traffic_split: template.abTrafficSplit,

      // Metadata
      is_active: template.isActive,
      version: template.version,
      created_at: template.createdAt,
      updated_at: template.updatedAt,

      // Stats
      stats: {
        sent_count: totalSent,
        delivered_count: totalDelivered,
        opened_count: totalOpened,
        clicked_count: totalClicked,
        converted_count: totalConverted,
        delivery_rate: parseFloat(deliveryRate.toFixed(1)),
        open_rate: parseFloat(openRate.toFixed(1)),
        click_rate: parseFloat(clickRate.toFixed(1)),
        conversion_rate: parseFloat(conversionRate.toFixed(1)),
      },

      // Automation Rules
      automation_rules: template.automationRules.map((rule) => ({
        rule_id: rule.id,
        rule_name: rule.ruleName,
        trigger_type: rule.triggerType,
        trigger_delay_minutes: rule.triggerDelayMinutes,
        is_active: rule.isActive,
        total_sends: rule.emailSends.length,
      })),

      // Recent Sends
      recent_sends: template.emailSends.map((send) => ({
        status: send.status,
        sent_at: send.sentAt,
        opened_at: send.openedAt,
        clicked_at: send.clickedAt,
      })),

      // Metrics (last 30 days)
      metrics: template.emailMetrics.map((m) => ({
        date: m.date,
        hour: m.hour,
        sent_count: m.sentCount,
        delivered_count: m.deliveredCount,
        opened_count: m.openedCount,
        clicked_count: m.clickedCount,
        converted_count: m.convertedCount,
      })),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[GET /api/admin/leads/automation/templates/[id]] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid template ID format',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch email template',
        },
      },
      { status: 500 }
    );
  }
}, { requiredRole: 'CONTENT_MANAGER' });

// ============================================================
// PUT /api/admin/leads/automation/templates/[id]
// ============================================================

export const PUT = withAuth(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const templateId = params.id;

    // 1. Validate UUID
    const uuidSchema = z.string().uuid();
    const validatedId = uuidSchema.parse(templateId);

    // 2. Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id: validatedId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: `Template with ID "${templateId}" not found`,
          },
        },
        { status: 404 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const data = UpdateTemplateSchema.parse(body);

    // 4. If updating template_name, check for duplicates
    if (data.template_name && data.template_name !== existingTemplate.templateName) {
      const duplicateTemplate = await prisma.emailTemplate.findUnique({
        where: { templateName: data.template_name },
      });

      if (duplicateTemplate) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_TEMPLATE',
              message: `Template with name "${data.template_name}" already exists`,
            },
          },
          { status: 409 }
        );
      }
    }

    // 5. If updating A/B variant, validate
    if (data.ab_variant_id !== undefined) {
      if (data.ab_variant_id) {
        const variantTemplate = await prisma.emailTemplate.findUnique({
          where: { id: data.ab_variant_id },
        });

        if (!variantTemplate) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INVALID_AB_VARIANT',
                message: `A/B variant template with ID "${data.ab_variant_id}" not found`,
              },
            },
            { status: 404 }
          );
        }

        // Validate same lead source type
        const leadSourceType = data.lead_source_type || existingTemplate.leadSourceType;
        if (variantTemplate.leadSourceType !== leadSourceType) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'AB_VARIANT_MISMATCH',
                message: 'A/B variant must have the same lead source type',
              },
            },
            { status: 400 }
          );
        }
      }
    }

    // 6. Update template
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id: validatedId },
      data: {
        ...(data.template_name && { templateName: data.template_name }),
        ...(data.template_type && { templateType: data.template_type }),
        ...(data.lead_source_type && { leadSourceType: data.lead_source_type }),
        ...(data.subject && { subject: data.subject }),
        ...(data.html_body && { htmlBody: data.html_body }),
        ...(data.text_body && { textBody: data.text_body }),
        ...(data.variables && { variables: data.variables }),
        ...(data.trigger_type && { triggerType: data.trigger_type }),
        ...(data.trigger_delay_minutes !== undefined && { triggerDelayMinutes: data.trigger_delay_minutes }),
        ...(data.is_ab_test !== undefined && { isAbTest: data.is_ab_test }),
        ...(data.ab_variant_id !== undefined && { abVariantId: data.ab_variant_id }),
        ...(data.ab_traffic_split && { abTrafficSplit: data.ab_traffic_split }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
        version: existingTemplate.version + 1,
      },
    });

    // 7. Return response
    return NextResponse.json({
      success: true,
      data: {
        template_id: updatedTemplate.id,
        template_name: updatedTemplate.templateName,
        version: updatedTemplate.version,
        updated_at: updatedTemplate.updatedAt,
      },
      message: 'Email template updated successfully',
    });
  } catch (error) {
    console.error('[PUT /api/admin/leads/automation/templates/[id]] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body or template ID',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update email template',
        },
      },
      { status: 500 }
    );
  }
}, { requiredRole: 'CONTENT_MANAGER' });

// ============================================================
// DELETE /api/admin/leads/automation/templates/[id]
// ============================================================

export const DELETE = withAuth(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const templateId = params.id;

    // 1. Validate UUID
    const uuidSchema = z.string().uuid();
    const validatedId = uuidSchema.parse(templateId);

    // 2. Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id: validatedId },
      include: {
        automationRules: true,
        emailSends: true,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: `Template with ID "${templateId}" not found`,
          },
        },
        { status: 404 }
      );
    }

    // 3. Check if template has active automation rules
    const activeRulesCount = existingTemplate.automationRules.filter((r) => r.isActive).length;

    if (activeRulesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_IN_USE',
            message: `Cannot delete template with ${activeRulesCount} active automation rule(s). Please deactivate rules first.`,
          },
        },
        { status: 409 }
      );
    }

    // 4. Soft delete: Set is_active to false instead of hard delete
    await prisma.emailTemplate.update({
      where: { id: validatedId },
      data: {
        isActive: false,
        templateName: `${existingTemplate.templateName}_DELETED_${Date.now()}`, // Avoid name conflicts
      },
    });

    // 5. Return response
    return NextResponse.json({
      success: true,
      message: 'Email template deleted successfully',
      data: {
        template_id: validatedId,
        template_name: existingTemplate.templateName,
        deleted_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[DELETE /api/admin/leads/automation/templates/[id]] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid template ID format',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete email template',
        },
      },
      { status: 500 }
    );
  }
}, { requiredRole: 'CONTENT_MANAGER' });
