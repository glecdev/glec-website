/**
 * GET /api/admin/leads/automation/sends
 *
 * Email Automation: Email Sends History
 *
 * Purpose:
 * - Retrieve email send history with filters
 * - Show sent, opened, clicked status
 * - Support pagination
 *
 * Query Parameters:
 * - rule_id (optional): Filter by automation rule
 * - template_id (optional): Filter by email template
 * - status (optional): Filter by send status (sent, failed, pending)
 * - page (optional): Page number (default: 1)
 * - per_page (optional): Items per page (default: 50)
 *
 * Response:
 * {
 *   success: true,
 *   data: EmailSend[],
 *   meta: { page, per_page, total, total_pages }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = req.nextUrl;

      // Parse query parameters
      const ruleId = searchParams.get('rule_id');
      const templateId = searchParams.get('template_id');
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1');
      const perPage = parseInt(searchParams.get('per_page') || '50');

      // Build where clause
      const whereClause: any = {};

      if (ruleId) {
        whereClause.ruleId = ruleId;
      }

      if (templateId) {
        whereClause.templateId = templateId;
      }

      if (status) {
        whereClause.status = status;
      }

      // Count total
      const total = await prisma.emailSend.count({
        where: whereClause,
      });

      // Fetch sends with related data
      const sends = await prisma.emailSend.findMany({
        where: whereClause,
        include: {
          rule: {
            select: {
              ruleName: true,
            },
          },
          template: {
            select: {
              templateName: true,
            },
          },
        },
        orderBy: {
          sentAt: 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      });

      // Transform data
      const transformedSends = sends.map((send) => ({
        send_id: send.sendId,
        rule_id: send.ruleId,
        rule_name: send.rule?.ruleName || 'Unknown',
        template_id: send.templateId,
        template_name: send.template?.templateName || 'Unknown',
        lead_id: send.leadId,
        to_email: send.toEmail,
        resend_email_id: send.resendEmailId,
        status: send.status,
        sent_at: send.sentAt?.toISOString() || null,
        opened_at: send.openedAt?.toISOString() || null,
        clicked_at: send.clickedAt?.toISOString() || null,
        failure_reason: send.failureReason,
      }));

      return NextResponse.json({
        success: true,
        data: transformedSends,
        meta: {
          page,
          per_page: perPage,
          total,
          total_pages: Math.ceil(total / perPage),
        },
      });
    } catch (error: any) {
      console.error('[Email Sends API] Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error.message || 'Failed to fetch email sends',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
