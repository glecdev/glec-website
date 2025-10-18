/**
 * Automation Rules API
 * GET /api/admin/leads/automation/rules
 * POST /api/admin/leads/automation/rules
 *
 * Purpose: CRUD operations for automation rules
 * Authentication: Required (CONTENT_MANAGER or higher)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const LeadSourceTypeEnum = z.enum(['LIBRARY_LEAD', 'CONTACT_FORM', 'DEMO_REQUEST', 'EVENT_REGISTRATION']);
const TriggerTypeEnum = z.enum(['LEAD_CREATED', 'EMAIL_OPENED', 'EMAIL_CLICKED', 'TIME_ELAPSED', 'STATUS_CHANGED']);

// GET query parameters validation
const GetRulesQuerySchema = z.object({
  source_type: z.enum(['LIBRARY_LEAD', 'CONTACT_FORM', 'DEMO_REQUEST', 'EVENT_REGISTRATION', 'ALL']).default('ALL'),
  is_active: z.enum(['true', 'false', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

// POST body validation
const CreateRuleSchema = z.object({
  rule_name: z.string().min(1).max(100),
  lead_source_type: LeadSourceTypeEnum,
  trigger_type: TriggerTypeEnum,
  trigger_delay_minutes: z.number().int().min(0).default(0),
  trigger_condition: z.record(z.any()).nullable().optional(),
  template_id: z.string().uuid(),
  max_sends_per_lead: z.number().int().min(1).default(1),
  max_sends_per_day: z.number().int().min(1).default(2),
  cooldown_minutes: z.number().int().min(0).default(1440),
  priority: z.number().int().min(1).max(5).default(3),
  is_active: z.boolean().default(true),
});

// ============================================================
// GET /api/admin/leads/automation/rules
// ============================================================

export const GET = withAuth(async (req: NextRequest) => {
  try {
    // 1. Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      source_type: searchParams.get('source_type') || 'ALL',
      is_active: searchParams.get('is_active') || 'all',
      page: searchParams.get('page') || '1',
      per_page: searchParams.get('per_page') || '20',
    };

    const params = GetRulesQuerySchema.parse(queryParams);

    // 2. Build WHERE clause
    const whereClause: any = {};

    if (params.source_type !== 'ALL') {
      whereClause.leadSourceType = params.source_type;
    }

    if (params.is_active === 'true') {
      whereClause.isActive = true;
    } else if (params.is_active === 'false') {
      whereClause.isActive = false;
    }

    // 3. Count total
    const total = await prisma.automationRule.count({
      where: whereClause,
    });

    // 4. Fetch rules with pagination
    const rules = await prisma.automationRule.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            id: true,
            templateName: true,
            templateType: true,
            subject: true,
            isActive: true,
          },
        },
        emailSends: {
          select: {
            status: true,
            sentAt: true,
            openedAt: true,
            clickedAt: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: (params.page - 1) * params.per_page,
      take: params.per_page,
    });

    // 5. Calculate stats for each rule
    const rulesWithStats = rules.map((rule) => {
      const triggeredCount = rule.emailSends.length;
      const sentCount = rule.emailSends.filter((s) => s.sentAt).length;
      const openedCount = rule.emailSends.filter((s) => s.openedAt).length;
      const clickedCount = rule.emailSends.filter((s) => s.clickedAt).length;

      const sendRate = triggeredCount > 0 ? (sentCount / triggeredCount) * 100 : 0;
      const openRate = sentCount > 0 ? (openedCount / sentCount) * 100 : 0;
      const clickRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;

      return {
        rule_id: rule.id,
        rule_name: rule.ruleName,
        lead_source_type: rule.leadSourceType,
        trigger_type: rule.triggerType,
        trigger_delay_minutes: rule.triggerDelayMinutes,
        trigger_condition: rule.triggerCondition,
        template: {
          template_id: rule.template.id,
          template_name: rule.template.templateName,
          template_type: rule.template.templateType,
          subject: rule.template.subject,
          is_active: rule.template.isActive,
        },
        max_sends_per_lead: rule.maxSendsPerLead,
        max_sends_per_day: rule.maxSendsPerDay,
        cooldown_minutes: rule.cooldownMinutes,
        priority: rule.priority,
        is_active: rule.isActive,
        created_at: rule.createdAt,
        updated_at: rule.updatedAt,
        stats: {
          triggered_count: triggeredCount,
          sent_count: sentCount,
          send_rate: parseFloat(sendRate.toFixed(1)),
          open_rate: parseFloat(openRate.toFixed(1)),
          click_rate: parseFloat(clickRate.toFixed(1)),
        },
      };
    });

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: rulesWithStats,
      meta: {
        page: params.page,
        per_page: params.per_page,
        total,
        total_pages: Math.ceil(total / params.per_page),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/leads/automation/rules] Error:', error);

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
          message: 'Failed to fetch automation rules',
        },
      },
      { status: 500 }
    );
  }
}, { requiredRole: 'CONTENT_MANAGER' });

// ============================================================
// POST /api/admin/leads/automation/rules
// ============================================================

export const POST = withAuth(async (req: NextRequest) => {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const data = CreateRuleSchema.parse(body);

    // 2. Check if rule name already exists
    const existingRule = await prisma.automationRule.findUnique({
      where: { ruleName: data.rule_name },
    });

    if (existingRule) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_RULE',
            message: `Rule with name "${data.rule_name}" already exists`,
          },
        },
        { status: 409 }
      );
    }

    // 3. Validate template exists
    const template = await prisma.emailTemplate.findUnique({
      where: { id: data.template_id },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: `Template with ID "${data.template_id}" not found`,
          },
        },
        { status: 404 }
      );
    }

    // 4. Validate template and rule lead source types match
    if (template.leadSourceType !== data.lead_source_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SOURCE_TYPE_MISMATCH',
            message: `Template lead source type (${template.leadSourceType}) does not match rule lead source type (${data.lead_source_type})`,
          },
        },
        { status: 400 }
      );
    }

    // 5. Validate trigger type matches template trigger type
    if (template.triggerType !== data.trigger_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRIGGER_TYPE_MISMATCH',
            message: `Template trigger type (${template.triggerType}) does not match rule trigger type (${data.trigger_type})`,
          },
        },
        { status: 400 }
      );
    }

    // 6. Create automation rule
    const rule = await prisma.automationRule.create({
      data: {
        ruleName: data.rule_name,
        leadSourceType: data.lead_source_type,
        triggerType: data.trigger_type,
        triggerDelayMinutes: data.trigger_delay_minutes,
        triggerCondition: data.trigger_condition || null,
        templateId: data.template_id,
        maxSendsPerLead: data.max_sends_per_lead,
        maxSendsPerDay: data.max_sends_per_day,
        cooldownMinutes: data.cooldown_minutes,
        priority: data.priority,
        isActive: data.is_active,
      },
      include: {
        template: {
          select: {
            templateName: true,
            subject: true,
          },
        },
      },
    });

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          rule_id: rule.id,
          rule_name: rule.ruleName,
          lead_source_type: rule.leadSourceType,
          trigger_type: rule.triggerType,
          template: {
            template_id: rule.templateId,
            template_name: rule.template.templateName,
            subject: rule.template.subject,
          },
          created_at: rule.createdAt,
        },
        message: 'Automation rule created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/admin/leads/automation/rules] Error:', error);

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
          message: 'Failed to create automation rule',
        },
      },
      { status: 500 }
    );
  }
}, { requiredRole: 'CONTENT_MANAGER' });
