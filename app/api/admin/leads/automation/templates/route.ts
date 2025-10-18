/**
 * Email Templates API
 * GET /api/admin/leads/automation/templates
 * POST /api/admin/leads/automation/templates
 *
 * Purpose: CRUD operations for email templates
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

// GET query parameters validation
const GetTemplatesQuerySchema = z.object({
  source_type: z.enum(['LIBRARY_LEAD', 'CONTACT_FORM', 'DEMO_REQUEST', 'EVENT_REGISTRATION', 'ALL']).default('ALL'),
  template_type: z.enum(['WELCOME', 'CONFIRMATION', 'FOLLOW_UP', 'NURTURE', 'RE_ENGAGEMENT', 'ALL']).default('ALL'),
  is_active: z.enum(['true', 'false', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

// POST body validation
const CreateTemplateSchema = z.object({
  template_name: z.string().min(1).max(100),
  template_type: EmailTemplateTypeEnum,
  lead_source_type: LeadSourceTypeEnum,
  subject: z.string().min(1).max(200),
  html_body: z.string().min(1),
  text_body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  trigger_type: TriggerTypeEnum,
  trigger_delay_minutes: z.number().int().min(0).default(0),
  is_ab_test: z.boolean().default(false),
  ab_variant_id: z.string().uuid().nullable().optional(),
  ab_traffic_split: z.number().int().min(1).max(100).default(50),
  is_active: z.boolean().default(true),
});

// ============================================================
// GET /api/admin/leads/automation/templates
// ============================================================

export const GET = withAuth(async (req: NextRequest) => {
  try {
    // 1. Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      source_type: searchParams.get('source_type') || 'ALL',
      template_type: searchParams.get('template_type') || 'ALL',
      is_active: searchParams.get('is_active') || 'all',
      page: searchParams.get('page') || '1',
      per_page: searchParams.get('per_page') || '20',
    };

    const params = GetTemplatesQuerySchema.parse(queryParams);

    // 2. Build WHERE clause
    const whereClause: any = {};

    if (params.source_type !== 'ALL') {
      whereClause.leadSourceType = params.source_type;
    }

    if (params.template_type !== 'ALL') {
      whereClause.templateType = params.template_type;
    }

    if (params.is_active === 'true') {
      whereClause.isActive = true;
    } else if (params.is_active === 'false') {
      whereClause.isActive = false;
    }

    // 3. Count total
    const total = await prisma.emailTemplate.count({
      where: whereClause,
    });

    // 4. Fetch templates with pagination
    const templates = await prisma.emailTemplate.findMany({
      where: whereClause,
      include: {
        automationRules: {
          select: {
            id: true,
            ruleName: true,
            isActive: true,
          },
        },
        emailSends: {
          select: {
            status: true,
          },
        },
        emailMetrics: {
          select: {
            sentCount: true,
            openedCount: true,
            clickedCount: true,
            convertedCount: true,
          },
        },
        abVariant: {
          select: {
            id: true,
            templateName: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      skip: (params.page - 1) * params.per_page,
      take: params.per_page,
    });

    // 5. Calculate stats for each template
    const templatesWithStats = templates.map((template) => {
      // Sum metrics across all periods
      const totalSent = template.emailMetrics.reduce((sum, m) => sum + m.sentCount, 0);
      const totalOpened = template.emailMetrics.reduce((sum, m) => sum + m.openedCount, 0);
      const totalClicked = template.emailMetrics.reduce((sum, m) => sum + m.clickedCount, 0);
      const totalConverted = template.emailMetrics.reduce((sum, m) => sum + m.convertedCount, 0);

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
      const conversionRate = totalClicked > 0 ? (totalConverted / totalClicked) * 100 : 0;

      return {
        template_id: template.id,
        template_name: template.templateName,
        template_type: template.templateType,
        lead_source_type: template.leadSourceType,
        subject: template.subject,
        trigger_type: template.triggerType,
        trigger_delay_minutes: template.triggerDelayMinutes,
        variables: template.variables,
        is_active: template.isActive,
        is_ab_test: template.isAbTest,
        ab_variant: template.abVariant
          ? {
              template_id: template.abVariant.id,
              template_name: template.abVariant.templateName,
            }
          : null,
        version: template.version,
        created_at: template.createdAt,
        updated_at: template.updatedAt,
        stats: {
          sent_count: totalSent,
          open_rate: parseFloat(openRate.toFixed(1)),
          click_rate: parseFloat(clickRate.toFixed(1)),
          conversion_rate: parseFloat(conversionRate.toFixed(1)),
          automation_rules_count: template.automationRules.length,
          active_rules_count: template.automationRules.filter((r) => r.isActive).length,
        },
      };
    });

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: templatesWithStats,
      meta: {
        page: params.page,
        per_page: params.per_page,
        total,
        total_pages: Math.ceil(total / params.per_page),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/leads/automation/templates] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
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
          message: 'Failed to fetch email templates',
        },
      },
      { status: 500 }
    );
  }
}, { requiredRole: 'CONTENT_MANAGER' });

// ============================================================
// POST /api/admin/leads/automation/templates
// ============================================================

export const POST = withAuth(async (req: NextRequest) => {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const data = CreateTemplateSchema.parse(body);

    // 2. Check if template name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { templateName: data.template_name },
    });

    if (existingTemplate) {
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

    // 3. If A/B test, validate ab_variant_id
    if (data.is_ab_test && data.ab_variant_id) {
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
      if (variantTemplate.leadSourceType !== data.lead_source_type) {
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

    // 4. Create template
    const template = await prisma.emailTemplate.create({
      data: {
        templateName: data.template_name,
        templateType: data.template_type,
        leadSourceType: data.lead_source_type,
        subject: data.subject,
        htmlBody: data.html_body,
        textBody: data.text_body,
        variables: data.variables,
        triggerType: data.trigger_type,
        triggerDelayMinutes: data.trigger_delay_minutes,
        isAbTest: data.is_ab_test,
        abVariantId: data.ab_variant_id || null,
        abTrafficSplit: data.ab_traffic_split,
        isActive: data.is_active,
      },
    });

    // 5. Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          template_id: template.id,
          template_name: template.templateName,
          template_type: template.templateType,
          lead_source_type: template.leadSourceType,
          created_at: template.createdAt,
        },
        message: 'Email template created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/leads/automation/templates] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
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
          message: 'Failed to create email template',
        },
      },
      { status: 500 }
    );
  }
}, { requiredRole: 'CONTENT_MANAGER' });
