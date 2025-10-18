/**
 * GET /api/admin/leads/analytics
 *
 * Enhanced analytics endpoint for unified lead management
 * Provides time-series, distribution, and funnel data for commercial-grade visualizations
 *
 * Query Parameters:
 * - date_from: ISO 8601 date string (default: 30 days ago)
 * - date_to: ISO 8601 date string (default: now)
 * - granularity: 'day' | 'week' | 'month' (default: 'day')
 *
 * Returns:
 * - time_series: Lead acquisition over time by source
 * - score_distribution: Histogram of lead scores
 * - status_distribution: Count by status
 * - source_distribution: Count by lead source
 * - conversion_funnel: Funnel stages (created → qualified → converted)
 * - email_engagement: Email open/click rates over time
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, eachDayOfInterval, format, startOfWeek, startOfMonth, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);

      // Parse query parameters
      const dateFrom = searchParams.get('date_from')
        ? new Date(searchParams.get('date_from')!)
        : subDays(new Date(), 30);
      const dateTo = searchParams.get('date_to')
        ? new Date(searchParams.get('date_to')!)
        : new Date();
      const granularity = (searchParams.get('granularity') || 'day') as 'day' | 'week' | 'month';

      // 1. TIME-SERIES DATA: Lead acquisition over time by source
      const timeSeries = await generateTimeSeries(prisma, dateFrom, dateTo, granularity);

      // 2. SCORE DISTRIBUTION: Histogram of lead scores (0-100 in buckets of 10)
      const scoreDistribution = await generateScoreDistribution(prisma, dateFrom, dateTo);

      // 3. STATUS DISTRIBUTION: Count by status
      const statusDistribution = await generateStatusDistribution(prisma, dateFrom, dateTo);

      // 4. SOURCE DISTRIBUTION: Count by lead source type
      const sourceDistribution = await generateSourceDistribution(prisma, dateFrom, dateTo);

      // 5. CONVERSION FUNNEL: Stages from created → qualified → converted
      const conversionFunnel = await generateConversionFunnel(prisma, dateFrom, dateTo);

      // 6. EMAIL ENGAGEMENT: Open/click rates over time
      const emailEngagement = await generateEmailEngagement(prisma, dateFrom, dateTo, granularity);

      // 7. TOP PERFORMERS: Best performing templates and rules
      const topPerformers = await generateTopPerformers(prisma, dateFrom, dateTo);

      return NextResponse.json({
        success: true,
        data: {
          date_range: {
            from: dateFrom.toISOString(),
            to: dateTo.toISOString(),
            granularity,
          },
          time_series: timeSeries,
          score_distribution: scoreDistribution,
          status_distribution: statusDistribution,
          source_distribution: sourceDistribution,
          conversion_funnel: conversionFunnel,
          email_engagement: emailEngagement,
          top_performers: topPerformers,
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

/**
 * Generate time-series data for lead acquisition
 */
async function generateTimeSeries(
  prisma: any,
  dateFrom: Date,
  dateTo: Date,
  granularity: 'day' | 'week' | 'month'
): Promise<any[]> {
  // Generate date intervals based on granularity
  let intervals: Date[] = [];
  if (granularity === 'day') {
    intervals = eachDayOfInterval({ start: dateFrom, end: dateTo });
  } else if (granularity === 'week') {
    intervals = eachWeekOfInterval({ start: dateFrom, end: dateTo }, { weekStartsOn: 1 });
  } else {
    intervals = eachMonthOfInterval({ start: dateFrom, end: dateTo });
  }

  // Query all sources
  const [contacts, demoRequests, eventRegs] = await Promise.all([
    prisma.contact.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { createdAt: true },
    }),
    prisma.demoRequest.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { createdAt: true },
    }),
    prisma.eventRegistration.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { createdAt: true },
    }),
  ]);

  // Build time-series data
  const series = intervals.map((interval) => {
    const nextInterval = granularity === 'day'
      ? new Date(interval.getTime() + 24 * 60 * 60 * 1000)
      : granularity === 'week'
      ? new Date(interval.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(interval.getFullYear(), interval.getMonth() + 1, 1);

    const contactCount = contacts.filter((c) => c.createdAt >= interval && c.createdAt < nextInterval).length;
    const demoCount = demoRequests.filter((d) => d.createdAt >= interval && d.createdAt < nextInterval).length;
    const eventCount = eventRegs.filter((e) => e.createdAt >= interval && e.createdAt < nextInterval).length;

    return {
      date: format(interval, granularity === 'day' ? 'yyyy-MM-dd' : granularity === 'week' ? 'yyyy-MM-dd' : 'yyyy-MM'),
      contact_form: contactCount,
      demo_request: demoCount,
      event_registration: eventCount,
      total: contactCount + demoCount + eventCount,
    };
  });

  return series;
}

/**
 * Generate score distribution histogram (buckets of 10)
 */
async function generateScoreDistribution(
  prisma: any,
  dateFrom: Date,
  dateTo: Date
): Promise<any[]> {
  // Query all leads with scores
  const [contacts, demoRequests, eventRegs] = await Promise.all([
    prisma.contact.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadScore: true },
    }),
    prisma.demoRequest.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadScore: true },
    }),
    prisma.eventRegistration.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadScore: true },
    }),
  ]);

  // Combine all scores
  const allScores = [
    ...contacts.map((c) => c.leadScore || 0),
    ...demoRequests.map((d) => d.leadScore || 0),
    ...eventRegs.map((e) => e.leadScore || 0),
  ];

  // Create buckets: 0-10, 10-20, 20-30, ..., 90-100
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    count: 0,
  }));

  allScores.forEach((score) => {
    const bucketIndex = Math.min(Math.floor(score / 10), 9); // Max index 9 for 90-100
    buckets[bucketIndex].count++;
  });

  return buckets;
}

/**
 * Generate status distribution
 */
async function generateStatusDistribution(
  prisma: any,
  dateFrom: Date,
  dateTo: Date
): Promise<any[]> {
  const [contacts, demoRequests, eventRegs] = await Promise.all([
    prisma.contact.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadStatus: true },
    }),
    prisma.demoRequest.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadStatus: true },
    }),
    prisma.eventRegistration.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadStatus: true },
    }),
  ]);

  const allStatuses = [
    ...contacts.map((c) => c.leadStatus || 'NEW'),
    ...demoRequests.map((d) => d.leadStatus || 'NEW'),
    ...eventRegs.map((e) => e.leadStatus || 'NEW'),
  ];

  const distribution: Record<string, number> = {};
  allStatuses.forEach((status) => {
    distribution[status] = (distribution[status] || 0) + 1;
  });

  return Object.entries(distribution).map(([status, count]) => ({ status, count }));
}

/**
 * Generate source distribution
 */
async function generateSourceDistribution(
  prisma: any,
  dateFrom: Date,
  dateTo: Date
): Promise<any[]> {
  const [contactCount, demoCount, eventCount] = await Promise.all([
    prisma.contact.count({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.demoRequest.count({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
    }),
    prisma.eventRegistration.count({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
    }),
  ]);

  return [
    { source: 'CONTACT_FORM', count: contactCount },
    { source: 'DEMO_REQUEST', count: demoCount },
    { source: 'EVENT_REGISTRATION', count: eventCount },
  ];
}

/**
 * Generate conversion funnel
 */
async function generateConversionFunnel(
  prisma: any,
  dateFrom: Date,
  dateTo: Date
): Promise<any[]> {
  const [contacts, demoRequests, eventRegs] = await Promise.all([
    prisma.contact.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadStatus: true },
    }),
    prisma.demoRequest.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadStatus: true },
    }),
    prisma.eventRegistration.findMany({
      where: { createdAt: { gte: dateFrom, lte: dateTo } },
      select: { leadStatus: true },
    }),
  ]);

  const allLeads = [
    ...contacts.map((c) => c.leadStatus || 'NEW'),
    ...demoRequests.map((d) => d.leadStatus || 'NEW'),
    ...eventRegs.map((e) => e.leadStatus || 'NEW'),
  ];

  const total = allLeads.length;
  const qualified = allLeads.filter((s) => ['QUALIFIED', 'CONVERTED'].includes(s)).length;
  const converted = allLeads.filter((s) => s === 'CONVERTED').length;

  return [
    { stage: 'Created', count: total, percentage: 100 },
    { stage: 'Qualified', count: qualified, percentage: total > 0 ? Math.round((qualified / total) * 100) : 0 },
    { stage: 'Converted', count: converted, percentage: total > 0 ? Math.round((converted / total) * 100) : 0 },
  ];
}

/**
 * Generate email engagement timeline
 */
async function generateEmailEngagement(
  prisma: any,
  dateFrom: Date,
  dateTo: Date,
  granularity: 'day' | 'week' | 'month'
): Promise<any[]> {
  // Generate intervals
  let intervals: Date[] = [];
  if (granularity === 'day') {
    intervals = eachDayOfInterval({ start: dateFrom, end: dateTo });
  } else if (granularity === 'week') {
    intervals = eachWeekOfInterval({ start: dateFrom, end: dateTo }, { weekStartsOn: 1 });
  } else {
    intervals = eachMonthOfInterval({ start: dateFrom, end: dateTo });
  }

  // Query email sends
  const emailSends = await prisma.emailSend.findMany({
    where: { sentAt: { gte: dateFrom, lte: dateTo } },
    select: { sentAt: true, status: true },
  });

  // Query email events (opens, clicks)
  const emailEvents = await prisma.emailEvent.findMany({
    where: { eventTime: { gte: dateFrom, lte: dateTo } },
    select: { eventTime: true, eventType: true },
  });

  // Build engagement data
  const engagement = intervals.map((interval) => {
    const nextInterval = granularity === 'day'
      ? new Date(interval.getTime() + 24 * 60 * 60 * 1000)
      : granularity === 'week'
      ? new Date(interval.getTime() + 7 * 24 * 60 * 60 * 1000)
      : new Date(interval.getFullYear(), interval.getMonth() + 1, 1);

    const sent = emailSends.filter((e) => e.sentAt >= interval && e.sentAt < nextInterval && e.status === 'SENT').length;
    const opened = emailEvents.filter((e) => e.eventTime >= interval && e.eventTime < nextInterval && e.eventType === 'OPENED').length;
    const clicked = emailEvents.filter((e) => e.eventTime >= interval && e.eventTime < nextInterval && e.eventType === 'CLICKED').length;

    return {
      date: format(interval, granularity === 'day' ? 'yyyy-MM-dd' : granularity === 'week' ? 'yyyy-MM-dd' : 'yyyy-MM'),
      sent,
      opened,
      clicked,
      open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      click_rate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
    };
  });

  return engagement;
}

/**
 * Generate top performers (best templates and rules)
 */
async function generateTopPerformers(
  prisma: any,
  dateFrom: Date,
  dateTo: Date
): Promise<any> {
  // Top templates by open rate
  const templateStats = await prisma.emailSend.groupBy({
    by: ['templateId'],
    where: { sentAt: { gte: dateFrom, lte: dateTo } },
    _count: { id: true },
  });

  const topTemplatesData = await Promise.all(
    templateStats.slice(0, 5).map(async (stat) => {
      const template = await prisma.emailTemplate.findUnique({
        where: { templateId: stat.templateId },
        select: { templateName: true },
      });

      const opens = await prisma.emailEvent.count({
        where: {
          send: { templateId: stat.templateId, sentAt: { gte: dateFrom, lte: dateTo } },
          eventType: 'OPENED',
        },
      });

      return {
        template_name: template?.templateName || 'Unknown',
        sent_count: stat._count.id,
        open_count: opens,
        open_rate: stat._count.id > 0 ? Math.round((opens / stat._count.id) * 100) : 0,
      };
    })
  );

  // Top rules by send count
  const ruleStats = await prisma.emailSend.groupBy({
    by: ['ruleId'],
    where: { sentAt: { gte: dateFrom, lte: dateTo } },
    _count: { id: true },
  });

  const topRulesData = await Promise.all(
    ruleStats.slice(0, 5).map(async (stat) => {
      const rule = await prisma.emailAutomationRule.findUnique({
        where: { ruleId: stat.ruleId },
        select: { ruleName: true },
      });

      return {
        rule_name: rule?.ruleName || 'Unknown',
        sent_count: stat._count.id,
      };
    })
  );

  return {
    top_templates: topTemplatesData.sort((a, b) => b.open_rate - a.open_rate),
    top_rules: topRulesData.sort((a, b) => b.sent_count - a.sent_count),
  };
}
