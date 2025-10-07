/**
 * Dashboard Analytics API Endpoint - Neon PostgreSQL Implementation
 *
 * Purpose: Provide comprehensive analytics data for admin dashboard
 * Based on: GLEC-API-Specification.yaml
 * Data Sources:
 *   - Neon PostgreSQL (notices, press, popups, blogs, videos, library)
 *
 * Response Structure:
 * {
 *   success: true,
 *   data: {
 *     stats: { current, previous, growthRate }
 *     popupAnalytics: { total, active, inactive, activationRate }
 *     distribution: { noticesByCategory, contentByStatus, popupsByType }
 *     trends: { dailyData[] }
 *     topContent: { notices[] }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

interface StatWithGrowth {
  current: number;
  previous: number;
  growthRate: number; // Percentage: ((current - previous) / previous) * 100
}

interface PopupAnalytics {
  total: number;
  active: number;
  inactive: number;
  activationRate: number; // Percentage: (active / total) * 100
}

interface DistributionItem {
  name: string;
  value: number;
  color?: string;
}

interface DailyTrendData {
  date: string; // YYYY-MM-DD
  notices: number;
  press: number;
  views: number;
}

interface TopContentItem {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  publishedAt: string;
  rank: number;
}

interface DashboardAnalyticsResponse {
  success: boolean;
  data: {
    stats: {
      totalContent: StatWithGrowth;
      totalNotices: StatWithGrowth;
      totalPress: StatWithGrowth;
      totalViews: StatWithGrowth;
      publishedContent: StatWithGrowth;
    };
    popupAnalytics: PopupAnalytics;
    distribution: {
      noticesByCategory: DistributionItem[];
      contentByStatus: DistributionItem[];
      popupsByType: DistributionItem[];
    };
    trends: {
      dailyData: DailyTrendData[];
    };
    topContent: {
      notices: TopContentItem[];
    };
  };
}

/**
 * Calculate growth rate
 */
function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

/**
 * GET /api/admin/analytics/dashboard
 * Returns comprehensive dashboard analytics from real database
 *
 * Query Parameters:
 *   - range: '7d' | '30d' | '90d' (default: '30d')
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Validate and parse date range
    const validRanges = ['7d', '30d', '90d'];
    if (!validRanges.includes(range)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_RANGE',
            message: `Invalid range parameter. Must be one of: ${validRanges.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

    // Calculate date ranges
    const currentStartDate = new Date();
    currentStartDate.setDate(currentStartDate.getDate() - days);

    const previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // ============================================================
    // 1. Fetch Current Period Stats
    // ============================================================

    // Notices count (current period)
    const noticesCountResult = await sql`
      SELECT COUNT(*) as count
      FROM notices
      WHERE created_at >= ${currentStartDate.toISOString()}
        AND deleted_at IS NULL
    `;
    const totalNoticesCurrent = Number(noticesCountResult[0]?.count || 0);

    // Press count (current period)
    const pressCountResult = await sql`
      SELECT COUNT(*) as count
      FROM press
      WHERE created_at >= ${currentStartDate.toISOString()}
        AND deleted_at IS NULL
    `;
    const totalPressCurrent = Number(pressCountResult[0]?.count || 0);

    // Total content (current)
    const totalContentCurrent = totalNoticesCurrent + totalPressCurrent;

    // Total views (current period)
    const viewsResult = await sql`
      SELECT
        COALESCE(SUM(view_count), 0) as total_views
      FROM (
        SELECT view_count FROM notices WHERE created_at >= ${currentStartDate.toISOString()} AND deleted_at IS NULL
        UNION ALL
        SELECT view_count FROM press WHERE created_at >= ${currentStartDate.toISOString()} AND deleted_at IS NULL
      ) as all_content
    `;
    const totalViewsCurrent = Number(viewsResult[0]?.total_views || 0);

    // Published content count (current)
    const publishedResult = await sql`
      SELECT COUNT(*) as count
      FROM (
        SELECT id FROM notices WHERE created_at >= ${currentStartDate.toISOString()} AND status = 'PUBLISHED' AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM press WHERE created_at >= ${currentStartDate.toISOString()} AND status = 'PUBLISHED' AND deleted_at IS NULL
      ) as published_content
    `;
    const publishedContentCurrent = Number(publishedResult[0]?.count || 0);

    // ============================================================
    // 2. Fetch Previous Period Stats (for growth calculation)
    // ============================================================

    // Notices count (previous period)
    const noticesPrevResult = await sql`
      SELECT COUNT(*) as count
      FROM notices
      WHERE created_at >= ${previousStartDate.toISOString()}
        AND created_at < ${currentStartDate.toISOString()}
        AND deleted_at IS NULL
    `;
    const totalNoticesPrevious = Number(noticesPrevResult[0]?.count || 0);

    // Press count (previous period)
    const pressPrevResult = await sql`
      SELECT COUNT(*) as count
      FROM press
      WHERE created_at >= ${previousStartDate.toISOString()}
        AND created_at < ${currentStartDate.toISOString()}
        AND deleted_at IS NULL
    `;
    const totalPressPrevious = Number(pressPrevResult[0]?.count || 0);

    // Total content (previous)
    const totalContentPrevious = totalNoticesPrevious + totalPressPrevious;

    // Total views (previous period)
    const viewsPrevResult = await sql`
      SELECT
        COALESCE(SUM(view_count), 0) as total_views
      FROM (
        SELECT view_count FROM notices WHERE created_at >= ${previousStartDate.toISOString()} AND created_at < ${currentStartDate.toISOString()} AND deleted_at IS NULL
        UNION ALL
        SELECT view_count FROM press WHERE created_at >= ${previousStartDate.toISOString()} AND created_at < ${currentStartDate.toISOString()} AND deleted_at IS NULL
      ) as all_content
    `;
    const totalViewsPrevious = Number(viewsPrevResult[0]?.total_views || 0);

    // Published content count (previous)
    const publishedPrevResult = await sql`
      SELECT COUNT(*) as count
      FROM (
        SELECT id FROM notices WHERE created_at >= ${previousStartDate.toISOString()} AND created_at < ${currentStartDate.toISOString()} AND status = 'PUBLISHED' AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM press WHERE created_at >= ${previousStartDate.toISOString()} AND created_at < ${currentStartDate.toISOString()} AND status = 'PUBLISHED' AND deleted_at IS NULL
      ) as published_content
    `;
    const publishedContentPrevious = Number(publishedPrevResult[0]?.count || 0);

    // ============================================================
    // 3. Popup Analytics
    // ============================================================

    const popupsResult = await sql`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active
      FROM popups
      WHERE deleted_at IS NULL
    `;
    const totalPopups = Number(popupsResult[0]?.total || 0);
    const activePopups = Number(popupsResult[0]?.active || 0);
    const inactivePopups = totalPopups - activePopups;
    const activationRate = totalPopups > 0 ? Math.round((activePopups / totalPopups) * 100 * 10) / 10 : 0;

    // ============================================================
    // 4. Distribution Analysis
    // ============================================================

    // Notices by category
    const noticesByCategoryResult = await sql`
      SELECT
        category,
        COUNT(*) as count
      FROM notices
      WHERE created_at >= ${currentStartDate.toISOString()}
        AND deleted_at IS NULL
      GROUP BY category
    `;

    const categoryColors: Record<string, string> = {
      GENERAL: '#6B7280',
      PRODUCT: '#0600f7',
      EVENT: '#10b981',
      PRESS: '#8b5cf6',
    };

    const noticesByCategory = noticesByCategoryResult.map((row: any) => ({
      name: row.category,
      value: Number(row.count),
      color: categoryColors[row.category] || '#6B7280',
    }));

    // Content by status
    const contentByStatusResult = await sql`
      SELECT
        status,
        COUNT(*) as count
      FROM (
        SELECT status FROM notices WHERE created_at >= ${currentStartDate.toISOString()} AND deleted_at IS NULL
        UNION ALL
        SELECT status FROM press WHERE created_at >= ${currentStartDate.toISOString()} AND deleted_at IS NULL
      ) as all_content
      GROUP BY status
    `;

    const statusColors: Record<string, string> = {
      PUBLISHED: '#10b981',
      DRAFT: '#f59e0b',
      ARCHIVED: '#6B7280',
    };

    const contentByStatus = contentByStatusResult.map((row: any) => ({
      name: row.status,
      value: Number(row.count),
      color: statusColors[row.status] || '#6B7280',
    }));

    // Popups by display type
    const popupsByTypeResult = await sql`
      SELECT
        display_type,
        COUNT(*) as count
      FROM popups
      WHERE deleted_at IS NULL
      GROUP BY display_type
    `;

    const typeColors: Record<string, string> = {
      modal: '#0600f7',
      banner: '#10b981',
      corner: '#f59e0b',
    };

    const popupsByType = popupsByTypeResult.map((row: any) => ({
      name: row.display_type,
      value: Number(row.count),
      color: typeColors[row.display_type] || '#6B7280',
    }));

    // ============================================================
    // 5. Daily Trends (last N days)
    // ============================================================

    const dailyTrendsResult = await sql`
      WITH date_series AS (
        SELECT generate_series(
          ${currentStartDate.toISOString()}::date,
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      )
      SELECT
        ds.date::text,
        COALESCE(n.notice_count, 0) as notices,
        COALESCE(p.press_count, 0) as press,
        COALESCE(n.notice_views, 0) + COALESCE(p.press_views, 0) as views
      FROM date_series ds
      LEFT JOIN (
        SELECT
          created_at::date as date,
          COUNT(*) as notice_count,
          SUM(view_count) as notice_views
        FROM notices
        WHERE created_at >= ${currentStartDate.toISOString()}
          AND deleted_at IS NULL
        GROUP BY created_at::date
      ) n ON ds.date = n.date
      LEFT JOIN (
        SELECT
          created_at::date as date,
          COUNT(*) as press_count,
          SUM(view_count) as press_views
        FROM press
        WHERE created_at >= ${currentStartDate.toISOString()}
          AND deleted_at IS NULL
        GROUP BY created_at::date
      ) p ON ds.date = p.date
      ORDER BY ds.date ASC
    `;

    const dailyData = dailyTrendsResult.map((row: any) => ({
      date: row.date,
      notices: Number(row.notices),
      press: Number(row.press),
      views: Number(row.views),
    }));

    // ============================================================
    // 6. Top 5 Notices by View Count
    // ============================================================

    const topNoticesResult = await sql`
      SELECT
        id, title, category, view_count, published_at
      FROM notices
      WHERE status = 'PUBLISHED'
        AND deleted_at IS NULL
      ORDER BY view_count DESC
      LIMIT 5
    `;

    const topNotices = topNoticesResult.map((row: any, index: number) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      viewCount: Number(row.view_count),
      publishedAt: row.published_at || row.created_at,
      rank: index + 1,
    }));

    // ============================================================
    // 7. Build Response
    // ============================================================

    const response: DashboardAnalyticsResponse = {
      success: true,
      data: {
        stats: {
          totalContent: {
            current: totalContentCurrent,
            previous: totalContentPrevious,
            growthRate: calculateGrowthRate(totalContentCurrent, totalContentPrevious),
          },
          totalNotices: {
            current: totalNoticesCurrent,
            previous: totalNoticesPrevious,
            growthRate: calculateGrowthRate(totalNoticesCurrent, totalNoticesPrevious),
          },
          totalPress: {
            current: totalPressCurrent,
            previous: totalPressPrevious,
            growthRate: calculateGrowthRate(totalPressCurrent, totalPressPrevious),
          },
          totalViews: {
            current: totalViewsCurrent,
            previous: totalViewsPrevious,
            growthRate: calculateGrowthRate(totalViewsCurrent, totalViewsPrevious),
          },
          publishedContent: {
            current: publishedContentCurrent,
            previous: publishedContentPrevious,
            growthRate: calculateGrowthRate(publishedContentCurrent, publishedContentPrevious),
          },
        },
        popupAnalytics: {
          total: totalPopups,
          active: activePopups,
          inactive: inactivePopups,
          activationRate,
        },
        distribution: {
          noticesByCategory,
          contentByStatus,
          popupsByType,
        },
        trends: {
          dailyData,
        },
        topContent: {
          notices: topNotices,
        },
      },
    };

    return NextResponse.json(response, {
      headers: {
        // Cache for 1 minute to reduce server load
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[Dashboard Analytics API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch dashboard analytics',
        },
      },
      { status: 500 }
    );
  }
}
