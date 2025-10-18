/**
 * GET /api/admin/leads/analytics (SIMPLIFIED VERSION)
 *
 * Temporary simplified version using Neon Serverless Driver
 * Full Prisma version in route_backup.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import { subDays, format } from 'date-fns';

const sql = neon(process.env.DATABASE_URL!);

export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);

      const dateFrom = searchParams.get('date_from')
        ? new Date(searchParams.get('date_from')!)
        : subDays(new Date(), 30);
      const dateTo = searchParams.get('date_to')
        ? new Date(searchParams.get('date_to')!)
        : new Date();
      const granularity = searchParams.get('granularity') || 'day';

      // Simplified queries using Neon SQL
      const contacts = await sql`
        SELECT COUNT(*) as count, DATE(created_at) as date
        FROM contacts
        WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      const demoRequests = await sql`
        SELECT COUNT(*) as count, DATE(created_at) as date
        FROM demo_requests
        WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      const eventRegs = await sql`
        SELECT COUNT(*) as count, DATE(created_at) as date
        FROM event_registrations
        WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      // Simple aggregations
      const [contactTotal] = await sql`SELECT COUNT(*) as total FROM contacts WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}`;
      const [demoTotal] = await sql`SELECT COUNT(*) as total FROM demo_requests WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}`;
      const [eventTotal] = await sql`SELECT COUNT(*) as total FROM event_registrations WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}`;

      return NextResponse.json({
        success: true,
        data: {
          date_range: {
            from: dateFrom.toISOString(),
            to: dateTo.toISOString(),
            granularity,
          },
          time_series: [{
            date: format(new Date(), 'yyyy-MM-dd'),
            contact_form: 0,
            demo_request: 0,
            event_registration: 0,
            total: 0,
          }],
          score_distribution: [],
          status_distribution: [],
          source_distribution: [
            { source: 'CONTACT_FORM', count: Number(contactTotal.total) },
            { source: 'DEMO_REQUEST', count: Number(demoTotal.total) },
            { source: 'EVENT_REGISTRATION', count: Number(eventTotal.total) },
          ],
          conversion_funnel: [
            { stage: 'Created', count: Number(contactTotal.total) + Number(demoTotal.total) + Number(eventTotal.total), percentage: 100 },
            { stage: 'Qualified', count: 0, percentage: 0 },
            { stage: 'Converted', count: 0, percentage: 0 },
          ],
          email_engagement: [],
          top_performers: {
            top_templates: [],
            top_rules: [],
          },
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ANALYTICS_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch analytics',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
