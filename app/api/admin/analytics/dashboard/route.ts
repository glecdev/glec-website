/**
 * Dashboard Analytics API Endpoint
 *
 * Purpose: Provide comprehensive analytics data for admin dashboard
 * Based on: GLEC-API-Specification.yaml
 * Data Sources:
 *   - getMockNoticesWithIds() from @/lib/mock-data
 *   - getMockPressWithIds() from @/lib/mock-data
 *   - PopupStore.getAll() from @/app/api/_shared/popup-store
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
import { getMockNoticesWithIds, getMockPressWithIds } from '@/lib/mock-data';
import { PopupStore } from '@/app/api/_shared/popup-store';
import type { Notice, Press } from '@prisma/client';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


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
 * Generate mock previous period data (simulate -20% to +30% growth)
 */
function generatePreviousPeriodValue(current: number): number {
  // Random growth between -20% and +30%
  const growthFactor = 0.8 + Math.random() * 0.5;
  return Math.round(current / growthFactor);
}

/**
 * Generate daily trend data for specified number of days
 */
function generateDailyTrends(notices: Notice[], press: Press[], days: number): DailyTrendData[] {
  const trends: DailyTrendData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Simulate daily counts (random distribution)
    const dailyNotices = Math.floor(Math.random() * 5) + 1;
    const dailyPress = Math.floor(Math.random() * 3) + 1;
    const dailyViews = Math.floor(Math.random() * 500) + 100;

    trends.push({
      date: dateStr,
      notices: dailyNotices,
      press: dailyPress,
      views: dailyViews,
    });
  }

  return trends;
}

/**
 * Filter content by date range
 */
function filterByDateRange<T extends { createdAt: Date }>(items: T[], days: number): T[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return items.filter((item) => item.createdAt >= cutoffDate);
}

/**
 * Count notices by category
 */
function countNoticesByCategory(notices: Notice[]): DistributionItem[] {
  const categories: Record<string, { count: number; color: string }> = {
    GENERAL: { count: 0, color: '#6B7280' },
    PRODUCT: { count: 0, color: '#0600f7' },
    EVENT: { count: 0, color: '#10b981' },
    PRESS: { count: 0, color: '#8b5cf6' },
  };

  notices.forEach((notice) => {
    if (categories[notice.category]) {
      categories[notice.category].count++;
    }
  });

  return Object.entries(categories).map(([name, data]) => ({
    name,
    value: data.count,
    color: data.color,
  }));
}

/**
 * Count content by status
 */
function countContentByStatus(notices: Notice[], press: Press[]): DistributionItem[] {
  const statuses: Record<string, { count: number; color: string }> = {
    PUBLISHED: { count: 0, color: '#10b981' },
    DRAFT: { count: 0, color: '#f59e0b' },
    ARCHIVED: { count: 0, color: '#6B7280' },
  };

  [...notices, ...press].forEach((item) => {
    if (statuses[item.status]) {
      statuses[item.status].count++;
    }
  });

  return Object.entries(statuses).map(([name, data]) => ({
    name,
    value: data.count,
    color: data.color,
  }));
}

/**
 * Count popups by display type
 */
function countPopupsByType(popups: any[]): DistributionItem[] {
  const types: Record<string, { count: number; color: string }> = {
    modal: { count: 0, color: '#0600f7' },
    banner: { count: 0, color: '#10b981' },
    corner: { count: 0, color: '#f59e0b' },
  };

  popups.forEach((popup) => {
    if (types[popup.displayType]) {
      types[popup.displayType].count++;
    }
  });

  return Object.entries(types).map(([name, data]) => ({
    name,
    value: data.count,
    color: data.color,
  }));
}

/**
 * Get top 5 notices by view count
 */
function getTopNotices(notices: Notice[]): TopContentItem[] {
  return notices
    .filter((n) => n.status === 'PUBLISHED')
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map((notice, index) => ({
      id: notice.id,
      title: notice.title,
      category: notice.category,
      viewCount: notice.viewCount,
      publishedAt: notice.publishedAt?.toISOString() || notice.createdAt.toISOString(),
      rank: index + 1,
    }));
}

/**
 * GET /api/admin/analytics/dashboard
 * Returns comprehensive dashboard analytics
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

    // Fetch data from all sources
    const allNotices = getMockNoticesWithIds();
    const allPress = getMockPressWithIds();
    const popups = PopupStore.getAll();

    // Filter by date range
    const notices = filterByDateRange(allNotices, days);
    const press = filterByDateRange(allPress, days);

    // Calculate current stats (filtered by date range)
    const totalContent = notices.length + press.length;
    const totalNotices = notices.length;
    const totalPress = press.length;
    const totalViews = notices.reduce((sum, n) => sum + n.viewCount, 0);
    const publishedContent = [...notices, ...press].filter((c) => c.status === 'PUBLISHED').length;

    // Generate previous period values (simulate historical data)
    const previousTotalContent = generatePreviousPeriodValue(totalContent);
    const previousTotalNotices = generatePreviousPeriodValue(totalNotices);
    const previousTotalPress = generatePreviousPeriodValue(totalPress);
    const previousTotalViews = generatePreviousPeriodValue(totalViews);
    const previousPublishedContent = generatePreviousPeriodValue(publishedContent);

    // Calculate popup analytics
    const activePopups = popups.filter((p) => p.isActive).length;
    const inactivePopups = popups.length - activePopups;
    const activationRate = popups.length > 0 ? Math.round((activePopups / popups.length) * 100 * 10) / 10 : 0;

    // Build response
    const response: DashboardAnalyticsResponse = {
      success: true,
      data: {
        stats: {
          totalContent: {
            current: totalContent,
            previous: previousTotalContent,
            growthRate: calculateGrowthRate(totalContent, previousTotalContent),
          },
          totalNotices: {
            current: totalNotices,
            previous: previousTotalNotices,
            growthRate: calculateGrowthRate(totalNotices, previousTotalNotices),
          },
          totalPress: {
            current: totalPress,
            previous: previousTotalPress,
            growthRate: calculateGrowthRate(totalPress, previousTotalPress),
          },
          totalViews: {
            current: totalViews,
            previous: previousTotalViews,
            growthRate: calculateGrowthRate(totalViews, previousTotalViews),
          },
          publishedContent: {
            current: publishedContent,
            previous: previousPublishedContent,
            growthRate: calculateGrowthRate(publishedContent, previousPublishedContent),
          },
        },
        popupAnalytics: {
          total: popups.length,
          active: activePopups,
          inactive: inactivePopups,
          activationRate,
        },
        distribution: {
          noticesByCategory: countNoticesByCategory(notices),
          contentByStatus: countContentByStatus(notices, press),
          popupsByType: countPopupsByType(popups),
        },
        trends: {
          dailyData: generateDailyTrends(notices, press, days),
        },
        topContent: {
          notices: getTopNotices(notices),
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
