/**
 * Admin Analytics Dashboard Page
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-ADMIN-009)
 * Route: /admin/analytics
 * Purpose: Display website analytics and CTA performance metrics
 *
 * Features:
 * - Summary cards (Total Page Views, Total CTA Clicks, Unique Visitors, Avg Session Duration)
 * - Top Pages table (Page, Views, Unique Visitors, Avg Time, Bounce Rate)
 * - Top CTAs table (Button, Clicks, Click Rate, Top Page)
 * - Time range selector (Last 7 days, Last 30 days, Last 90 days)
 * - Real-time data fetching with loading/error states
 *
 * Design Standards:
 * - GLEC-Design-System-Standards.md (Card, Table, Select components)
 * - Responsive design (mobile-first)
 * - WCAG 2.1 AA accessibility
 *
 * Data Flow:
 * - NO hardcoded data arrays
 * - All data from API endpoint: GET /api/admin/analytics
 * - Loading states during fetch
 * - Error handling with retry
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { AnalyticsDashboardData, TimeRangeFilter } from '@/lib/types/analytics';

/**
 * Format number with thousands separator
 */
function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}초`;
  }

  return `${minutes}분 ${remainingSeconds}초`;
}

/**
 * Summary Card Component
 */
interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function SummaryCard({ title, value, icon, trend }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={`text-sm font-medium mt-2 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs 지난주
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-32">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Error Message Component
 */
interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
      <svg
        className="w-16 h-16 text-red-500 mx-auto mb-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <p className="text-lg font-semibold text-gray-900 mb-2">데이터를 불러오지 못했습니다</p>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        다시 시도
      </button>
    </div>
  );
}

/**
 * Main Analytics Dashboard Page Component
 */
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('last_30_days');

  /**
   * Fetch analytics data from API
   */
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header when auth is implemented
          // 'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || '알 수 없는 오류가 발생했습니다');
      }

      setData(result.data);
    } catch (err) {
      console.error('[Analytics Page] Fetch error:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch data on mount and when time range changes
   */
  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(event.target.value as TimeRangeFilter);
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">분석</h1>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">분석</h1>
        </div>
        <ErrorMessage message={error} onRetry={fetchAnalytics} />
      </div>
    );
  }

  /**
   * Render empty state (no data)
   */
  if (!data) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">분석</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  /**
   * Render analytics dashboard
   */
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">분석</h1>

        {/* Time Range Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
            기간
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          >
            <option value="last_7_days">최근 7일</option>
            <option value="last_30_days">최근 30일</option>
            <option value="last_90_days">최근 90일</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="총 페이지 뷰"
          value={formatNumber(data.totalPageViews)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <SummaryCard
          title="총 CTA 클릭"
          value={formatNumber(data.totalCTAClicks)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
              />
            </svg>
          }
        />

        <SummaryCard
          title="고유 방문자"
          value={formatNumber(data.uniqueVisitors)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
        />

        <SummaryCard
          title="평균 세션 시간"
          value={formatDuration(data.avgSessionDuration)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">인기 페이지</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">페이지</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">조회수</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                    고유 방문자
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 hidden md:table-cell">
                    평균 시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.pageViews.map((page, index) => (
                  <tr key={page.path} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{page.page}</p>
                        <p className="text-xs text-gray-500">{page.path}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatNumber(page.views)}</span>
                    </td>
                    <td className="py-3 px-2 text-right hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{formatNumber(page.uniqueVisitors)}</span>
                    </td>
                    <td className="py-3 px-2 text-right hidden md:table-cell">
                      <span className="text-sm text-gray-600">{formatDuration(Math.floor(page.avgTimeOnPage))}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top CTAs Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">인기 CTA 버튼</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">버튼</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">클릭수</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 hidden sm:table-cell">
                    전환율
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 hidden md:table-cell">
                    주요 페이지
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.ctaClicks.map((cta, index) => (
                  <tr key={cta.buttonId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cta.buttonText}</p>
                        <p className="text-xs text-gray-500">{cta.buttonId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatNumber(cta.clicks)}</span>
                    </td>
                    <td className="py-3 px-2 text-right hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{cta.conversionRate.toFixed(1)}%</span>
                    </td>
                    <td className="py-3 px-2 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {cta.topPages[0]?.page || '-'} ({formatNumber(cta.topPages[0]?.clicks || 0)})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
