/**
 * Analytics Type Definitions
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-ADMIN-009)
 * Purpose: Track website visitor data and CTA button clicks
 * Standards: GLEC-API-Specification.yaml (Analytics schemas)
 *
 * Data Models:
 * - PageView: Individual page visit record
 * - CTAClick: CTA button click record
 * - PageStats: Aggregated page statistics
 * - CTAStats: Aggregated CTA statistics
 * - AnalyticsDashboardData: Complete dashboard data
 */

/**
 * Individual page view record
 */
export interface PageView {
  id: string;
  page: string; // Page name (e.g., "Homepage", "Products", "Contact")
  path: string; // URL path (e.g., "/", "/products", "/contact")
  visitorId: string; // Unique visitor identifier (UUID or fingerprint)
  timestamp: Date;
  userAgent: string;
  referrer: string | null; // Referrer URL (null if direct)
  sessionId: string; // Session identifier
  timeOnPage?: number; // Time spent on page in seconds (optional)
}

/**
 * Individual CTA button click record
 */
export interface CTAClick {
  id: string;
  buttonId: string; // Button identifier (e.g., "hero-cta-primary", "nav-contact")
  buttonText: string; // Button text (e.g., "무료 상담 신청", "제품 둘러보기")
  page: string; // Page where button was clicked
  path: string; // URL path
  targetUrl: string; // Where button leads to
  visitorId: string; // Unique visitor identifier
  timestamp: Date;
  sessionId: string; // Session identifier
}

/**
 * Aggregated page statistics
 */
export interface PageStats {
  page: string; // Page name
  path: string; // URL path
  views: number; // Total page views
  uniqueVisitors: number; // Unique visitors count
  avgTimeOnPage: number; // Average time on page in seconds
  bounceRate?: number; // Bounce rate percentage (optional)
}

/**
 * Aggregated CTA button statistics
 */
export interface CTAStats {
  buttonId: string; // Button identifier
  buttonText: string; // Button text
  clicks: number; // Total clicks
  uniqueClickers: number; // Unique clickers count
  conversionRate: number; // Conversion rate percentage (clicks / unique visitors)
  topPages: Array<{
    // Top pages where button was clicked
    page: string;
    clicks: number;
  }>;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  pageViews: number;
  ctaClicks: number;
  uniqueVisitors: number;
}

/**
 * Complete analytics dashboard data
 */
export interface AnalyticsDashboardData {
  pageViews: PageStats[]; // Top pages by views
  ctaClicks: CTAStats[]; // Top CTAs by clicks
  totalPageViews: number; // Total page views in time range
  totalCTAClicks: number; // Total CTA clicks in time range
  uniqueVisitors: number; // Total unique visitors in time range
  avgSessionDuration: number; // Average session duration in seconds
  timeRange: {
    start: Date; // Time range start
    end: Date; // Time range end
  };
  timeSeriesData?: TimeSeriesDataPoint[]; // Optional time series data for charts
}

/**
 * Analytics API response
 */
export interface AnalyticsApiResponse {
  success: true;
  data: AnalyticsDashboardData;
}

/**
 * Time range filter options
 */
export type TimeRangeFilter = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';

/**
 * Analytics query parameters
 */
export interface AnalyticsQueryParams {
  timeRange?: TimeRangeFilter;
  startDate?: string; // ISO 8601 date string (for custom range)
  endDate?: string; // ISO 8601 date string (for custom range)
  page?: string; // Filter by specific page
  buttonId?: string; // Filter by specific button
}
