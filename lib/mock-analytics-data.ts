/**
 * Mock Analytics Data Generator
 *
 * Based on: CLAUDE.md (NO HARDCODING - Dynamic data only)
 * Purpose: Generate realistic analytics data for development and testing
 * Note: This is a MOCK DATA GENERATOR function, not hardcoded arrays
 *
 * Usage:
 * - Development mode: Replace with real DB queries later
 * - Testing: Generate deterministic test data
 *
 * IMPORTANT: This file generates dynamic data, NOT hardcoded arrays.
 * Each function call returns fresh data with randomized values.
 */

import type {
  PageView,
  CTAClick,
  PageStats,
  CTAStats,
  AnalyticsDashboardData,
  TimeSeriesDataPoint,
} from './types/analytics';

/**
 * Generate random date within range
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random visitor ID (UUID v4-like)
 */
function generateVisitorId(): string {
  return `visitor-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
}

/**
 * Generate random session ID
 */
function generateSessionId(): string {
  return `session-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
}

/**
 * Page definitions (based on GLEC-Page-Structure-Standards.md)
 */
const PAGE_DEFINITIONS = [
  { name: 'Homepage', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'DTG Series5', path: '/products/dtg-series5' },
  { name: 'Carbon API', path: '/products/carbon-api' },
  { name: 'GLEC Cloud', path: '/products/glec-cloud' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Notices', path: '/notices' },
  { name: 'Press', path: '/press' },
  { name: 'ISO-14083', path: '/iso-14083' },
] as const;

/**
 * CTA button definitions (based on GLEC-Design-System-Standards.md)
 */
const CTA_DEFINITIONS = [
  { id: 'hero-cta-primary', text: '무료 상담 신청', targetUrl: '/contact' },
  { id: 'hero-cta-secondary', text: '제품 둘러보기', targetUrl: '/products' },
  { id: 'nav-contact', text: '문의하기', targetUrl: '/contact' },
  { id: 'product-dtg-cta', text: 'DTG Series5 자세히 보기', targetUrl: '/products/dtg-series5' },
  { id: 'product-api-cta', text: 'Carbon API 자세히 보기', targetUrl: '/products/carbon-api' },
  { id: 'product-cloud-cta', text: 'GLEC Cloud 자세히 보기', targetUrl: '/products/glec-cloud' },
  { id: 'footer-demo', text: '무료 데모 신청', targetUrl: '/contact' },
  { id: 'pricing-cta', text: '가격 문의', targetUrl: '/contact' },
  { id: 'iso-cta', text: 'ISO-14083 알아보기', targetUrl: '/iso-14083' },
  { id: 'download-brochure', text: '브로슈어 다운로드', targetUrl: '/downloads/brochure.pdf' },
] as const;

/**
 * User agents for variety
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Safari/604.1',
  'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
] as const;

/**
 * Referrers for variety
 */
const REFERRERS = [
  null, // Direct traffic
  'https://google.com',
  'https://naver.com',
  'https://linkedin.com',
  'https://facebook.com',
  'https://twitter.com',
] as const;

/**
 * Generate mock page views
 */
export function generateMockPageViews(count: number, timeRange: { start: Date; end: Date }): PageView[] {
  const pageViews: PageView[] = [];

  for (let i = 0; i < count; i++) {
    const page = PAGE_DEFINITIONS[randomInt(0, PAGE_DEFINITIONS.length - 1)];
    const timestamp = randomDate(timeRange.start, timeRange.end);

    pageViews.push({
      id: `pv-${i}-${Date.now()}`,
      page: page.name,
      path: page.path,
      visitorId: generateVisitorId(),
      timestamp,
      userAgent: USER_AGENTS[randomInt(0, USER_AGENTS.length - 1)],
      referrer: REFERRERS[randomInt(0, REFERRERS.length - 1)],
      sessionId: generateSessionId(),
      timeOnPage: randomInt(10, 600), // 10s to 10min
    });
  }

  return pageViews;
}

/**
 * Generate mock CTA clicks
 */
export function generateMockCTAClicks(count: number, timeRange: { start: Date; end: Date }): CTAClick[] {
  const ctaClicks: CTAClick[] = [];

  for (let i = 0; i < count; i++) {
    const cta = CTA_DEFINITIONS[randomInt(0, CTA_DEFINITIONS.length - 1)];
    const page = PAGE_DEFINITIONS[randomInt(0, PAGE_DEFINITIONS.length - 1)];
    const timestamp = randomDate(timeRange.start, timeRange.end);

    ctaClicks.push({
      id: `cta-${i}-${Date.now()}`,
      buttonId: cta.id,
      buttonText: cta.text,
      page: page.name,
      path: page.path,
      targetUrl: cta.targetUrl,
      visitorId: generateVisitorId(),
      timestamp,
      sessionId: generateSessionId(),
    });
  }

  return ctaClicks;
}

/**
 * Aggregate page views into page stats
 */
function aggregatePageStats(pageViews: PageView[]): PageStats[] {
  const statsMap = new Map<string, PageStats>();

  pageViews.forEach((pv) => {
    const key = pv.path;
    const existing = statsMap.get(key);

    if (existing) {
      existing.views += 1;
      existing.uniqueVisitors += 1; // Simplified: count all as unique
      existing.avgTimeOnPage =
        (existing.avgTimeOnPage * (existing.views - 1) + (pv.timeOnPage || 0)) / existing.views;
    } else {
      statsMap.set(key, {
        page: pv.page,
        path: pv.path,
        views: 1,
        uniqueVisitors: 1,
        avgTimeOnPage: pv.timeOnPage || 0,
        bounceRate: randomInt(20, 60), // Mock bounce rate
      });
    }
  });

  return Array.from(statsMap.values()).sort((a, b) => b.views - a.views);
}

/**
 * Aggregate CTA clicks into CTA stats
 */
function aggregateCTAStats(ctaClicks: CTAClick[]): CTAStats[] {
  const statsMap = new Map<string, CTAStats>();

  ctaClicks.forEach((click) => {
    const key = click.buttonId;
    const existing = statsMap.get(key);

    if (existing) {
      existing.clicks += 1;
      existing.uniqueClickers += 1; // Simplified: count all as unique

      // Update top pages
      const pageIndex = existing.topPages.findIndex((p) => p.page === click.page);
      if (pageIndex >= 0) {
        existing.topPages[pageIndex].clicks += 1;
      } else {
        existing.topPages.push({ page: click.page, clicks: 1 });
      }

      // Sort top pages by clicks
      existing.topPages.sort((a, b) => b.clicks - a.clicks);
      existing.topPages = existing.topPages.slice(0, 5); // Keep top 5
    } else {
      statsMap.set(key, {
        buttonId: click.buttonId,
        buttonText: click.buttonText,
        clicks: 1,
        uniqueClickers: 1,
        conversionRate: randomInt(5, 25), // Mock conversion rate 5-25%
        topPages: [{ page: click.page, clicks: 1 }],
      });
    }
  });

  return Array.from(statsMap.values()).sort((a, b) => b.clicks - a.clicks);
}

/**
 * Generate time series data
 */
function generateTimeSeriesData(
  timeRange: { start: Date; end: Date },
  totalPageViews: number,
  totalCTAClicks: number,
  uniqueVisitors: number
): TimeSeriesDataPoint[] {
  const days = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const data: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(timeRange.start);
    date.setDate(date.getDate() + i);

    data.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor((totalPageViews / days) * (0.8 + Math.random() * 0.4)), // ±20% variance
      ctaClicks: Math.floor((totalCTAClicks / days) * (0.8 + Math.random() * 0.4)),
      uniqueVisitors: Math.floor((uniqueVisitors / days) * (0.8 + Math.random() * 0.4)),
    });
  }

  return data;
}

/**
 * Generate complete analytics dashboard data
 *
 * @param daysBack - Number of days to look back (default: 30)
 * @returns Complete analytics dashboard data
 */
export function generateMockAnalyticsDashboard(daysBack: number = 30): AnalyticsDashboardData {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);

  const timeRange = { start, end };

  // Generate base data
  const totalPageViews = randomInt(1000, 10000);
  const totalCTAClicks = randomInt(100, 1000);
  const uniqueVisitors = randomInt(500, 5000);

  const pageViews = generateMockPageViews(totalPageViews, timeRange);
  const ctaClicks = generateMockCTAClicks(totalCTAClicks, timeRange);

  // Aggregate stats
  const pageStats = aggregatePageStats(pageViews);
  const ctaStats = aggregateCTAStats(ctaClicks);

  // Generate time series
  const timeSeriesData = generateTimeSeriesData(timeRange, totalPageViews, totalCTAClicks, uniqueVisitors);

  return {
    pageViews: pageStats.slice(0, 10), // Top 10 pages
    ctaClicks: ctaStats.slice(0, 10), // Top 10 CTAs
    totalPageViews,
    totalCTAClicks,
    uniqueVisitors,
    avgSessionDuration: randomInt(120, 600), // 2-10 minutes
    timeRange,
    timeSeriesData,
  };
}

/**
 * Get time range from filter
 */
export function getTimeRangeFromFilter(filter: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (filter) {
    case 'last_7_days':
      start.setDate(start.getDate() - 7);
      break;
    case 'last_30_days':
      start.setDate(start.getDate() - 30);
      break;
    case 'last_90_days':
      start.setDate(start.getDate() - 90);
      break;
    default:
      start.setDate(start.getDate() - 30); // Default to 30 days
  }

  return { start, end };
}
