/**
 * Admin Analytics API Endpoint
 *
 * Based on: GLEC-API-Specification.yaml (Admin - Analytics)
 * Route: GET /api/admin/analytics
 * Purpose: Retrieve analytics dashboard data for admin portal
 *
 * Query Parameters:
 * - timeRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom'
 * - startDate: ISO 8601 date string (for custom range)
 * - endDate: ISO 8601 date string (for custom range)
 *
 * Response Format:
 * {
 *   success: true,
 *   data: {
 *     pageViews: PageStats[],
 *     ctaClicks: CTAStats[],
 *     totalPageViews: number,
 *     totalCTAClicks: number,
 *     uniqueVisitors: number,
 *     avgSessionDuration: number,
 *     timeRange: { start: Date, end: Date },
 *     timeSeriesData: TimeSeriesDataPoint[]
 *   }
 * }
 *
 * Security:
 * - Requires admin authentication (JWT token)
 * - RBAC: All admin roles can access
 *
 * IMPORTANT: Currently using mock data generator.
 * TODO: Replace with real database queries after analytics tracking is implemented.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMockAnalyticsDashboard, getTimeRangeFromFilter } from '@/lib/mock-analytics-data';
import type { AnalyticsApiResponse } from '@/lib/types/analytics';

/**
 * GET /api/admin/analytics
 *
 * Retrieve analytics dashboard data
 */

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication middleware check
    // const user = await verifyAdminAuth(request);
    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
    //     { status: 401 }
    //   );
    // }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeRangeParam = searchParams.get('timeRange') || 'last_30_days';

    // Validate time range parameter
    const validTimeRanges = ['last_7_days', 'last_30_days', 'last_90_days', 'custom'];
    if (!validTimeRanges.includes(timeRangeParam)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TIME_RANGE',
            message: `유효하지 않은 시간 범위입니다. 다음 중 하나를 선택하세요: ${validTimeRanges.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Get time range
    const timeRange = getTimeRangeFromFilter(timeRangeParam);

    // Calculate days for mock data generation
    const daysBack = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));

    // Generate mock analytics data
    // TODO: Replace with real database queries:
    // const data = await getAnalyticsDashboard(timeRange.start, timeRange.end);
    const data = generateMockAnalyticsDashboard(daysBack);

    // Format response
    const response: AnalyticsApiResponse = {
      success: true,
      data,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Don't cache analytics data
      },
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '분석 데이터를 불러오는 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/admin/analytics
 *
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
