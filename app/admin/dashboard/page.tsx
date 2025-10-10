/**
 * Admin Dashboard Page - World-Class Production Level
 *
 * Based on: GLEC-Admin-Design-Specification.md (Page 3: Dashboard)
 * Data: /api/admin/analytics/dashboard
 * Standards: GLEC-Design-System-Standards.md (Cards, Grid, Charts)
 *
 * Features:
 * - Statistics cards with growth rates (up/down arrows)
 * - Interactive Recharts visualizations (Area, Bar, Pie)
 * - Popup analytics section
 * - Distribution charts (category, status, type)
 * - 30-day trend analysis
 * - Top 5 content performance table
 * - Responsive grid layout
 * - GLEC color palette (#0600f7, #10b981, #f59e0b, #ef4444)
 * - Real-time auto-refresh (60s interval)
 * - Manual refresh button
 * - Last updated timestamp
 * - Toast notifications
 * - Date range filtering (7d/30d/90d)
 * - CSV export functionality
 * - WCAG 2.1 AA accessibility
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import UnifiedInsightsDashboard, { UnifiedInsightsData } from '@/components/admin/UnifiedInsightsDashboard';
import { fetchUnifiedInsights } from '@/lib/admin-unified-insights';
import { PeriodComparisonCards } from '@/components/admin/InsightsCards';
import type { BaseStats } from '@/lib/admin-insights';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface StatWithGrowth {
  current: number;
  previous: number;
  growthRate: number;
}

interface PopupAnalytics {
  total: number;
  active: number;
  inactive: number;
  activationRate: number;
}

interface DistributionItem {
  name: string;
  value: number;
  color?: string;
}

interface DailyTrendData {
  date: string;
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

interface DashboardData {
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
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert StatWithGrowth data to BaseStats format for PeriodComparisonCards
 */
function convertToBaseStats(
  totalContent: StatWithGrowth,
  publishedContent: StatWithGrowth,
  totalViews: StatWithGrowth
): { current: BaseStats; previous: BaseStats } {
  return {
    current: {
      totalItems: totalContent.current,
      publishedCount: publishedContent.current,
      draftCount: 0, // Not available in current dashboard data
      archivedCount: 0, // Not available in current dashboard data
      totalViews: totalViews.current,
      avgViewsPerItem: totalContent.current > 0 ? Math.round(totalViews.current / totalContent.current) : 0,
    },
    previous: {
      totalItems: totalContent.previous,
      publishedCount: publishedContent.previous,
      draftCount: 0,
      archivedCount: 0,
      totalViews: totalViews.previous,
      avgViewsPerItem: totalContent.previous > 0 ? Math.round(totalViews.previous / totalContent.previous) : 0,
    },
  };
}

// ============================================================================
// Main Component
// ============================================================================

type DateRange = '7d' | '30d' | '90d';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [unifiedInsights, setUnifiedInsights] = useState<UnifiedInsightsData | null>(null);
  const [isLoadingUnified, setIsLoadingUnified] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async (showToast = false) => {
    // Don't set isLoading if this is a refresh
    if (data) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch(`/api/admin/analytics/dashboard?range=${dateRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch dashboard data');
      }
      setData(result.data);
      setLastUpdated(new Date());
      setError(null);

      if (showToast) {
        toast.success('대시보드 데이터가 업데이트되었습니다', {
          duration: 3000,
          icon: '✅',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('[Dashboard] Failed to fetch data:', err);

      if (showToast) {
        toast.error('데이터 로드 실패. 다시 시도해주세요.', {
          duration: 5000,
          icon: '❌',
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch and user info
  useEffect(() => {
    // Get user name from localStorage
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      } catch (error) {
        console.error('[Dashboard] Failed to parse user:', error);
      }
    }

    fetchDashboardData();

    // Fetch unified insights
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetchUnifiedInsights(token)
        .then((data) => {
          setUnifiedInsights(data);
          setIsLoadingUnified(false);
        })
        .catch((err) => {
          console.error('[Dashboard] Failed to fetch unified insights:', err);
          setIsLoadingUnified(false);
        });
    }
  }, [dateRange]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!data) return; // Don't auto-refresh if initial load failed

    const interval = setInterval(() => {
      fetchDashboardData(false); // Silent refresh, no toast
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [data, dateRange]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg
              className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600">대시보드 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // CSV Export Function
  const exportToCSV = () => {
    if (!data) return;

    try {
      // Generate CSV header
      const csvHeader = ['카테고리', '값', '날짜'].join(',') + '\n';

      // Generate CSV data
      const csvRows: string[] = [];

      // Statistics
      csvRows.push(`전체 콘텐츠,${data.stats.totalContent.current},${new Date().toISOString()}`);
      csvRows.push(`공지사항,${data.stats.totalNotices.current},${new Date().toISOString()}`);
      csvRows.push(`보도자료,${data.stats.totalPress.current},${new Date().toISOString()}`);
      csvRows.push(`총 조회수,${data.stats.totalViews.current},${new Date().toISOString()}`);

      const csvData = csvHeader + csvRows.join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('CSV 파일이 다운로드되었습니다', {
        duration: 3000,
        icon: '📥',
      });
    } catch (err) {
      console.error('[Dashboard] Failed to export CSV:', err);
      toast.error('CSV 내보내기 실패', {
        duration: 3000,
        icon: '❌',
      });
    }
  };

  // Error state
  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto">
        <Toaster position="top-right" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-1">데이터를 불러올 수 없습니다</h3>
              <p className="text-sm text-red-700 mb-4">
                {error || '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'}
              </p>
              <button
                onClick={() => fetchDashboardData(true)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="다시 시도"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Toast Container */}
      <Toaster position="top-right" />

      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">환영합니다, {userName}님! 👋</h1>
        <p className="text-gray-600">GLEC 관리자 대시보드에서 콘텐츠를 관리하세요.</p>
      </div>

      {/* Control Panel: Refresh, Date Range, Export, Last Updated */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
        role="toolbar"
        aria-label="대시보드 컨트롤"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Refresh Button + Last Updated */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="대시보드 새로고침"
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isRefreshing ? '새로고침 중...' : '새로고침'}</span>
            </button>

            {lastUpdated && (
              <p className="text-sm text-gray-600" aria-live="polite">
                마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
              </p>
            )}
          </div>

          {/* Right: Date Range Selector + Export Button */}
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2" role="group" aria-label="날짜 범위 선택">
              <span className="text-sm text-gray-700 font-medium">기간:</span>
              {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                    dateRange === range
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={dateRange === range}
                >
                  {range === '7d' ? '7일' : range === '30d' ? '30일' : '90일'}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="CSV 다운로드"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>CSV 다운로드</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards with Growth Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" role="region" aria-label="통계 요약">
        <StatCard
          title="전체 콘텐츠"
          value={data.stats.totalContent.current}
          growthRate={data.stats.totalContent.growthRate}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          color="blue"
        />

        <StatCard
          title="공지사항"
          value={data.stats.totalNotices.current}
          growthRate={data.stats.totalNotices.growthRate}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          }
          color="purple"
        />

        <StatCard
          title="보도자료"
          value={data.stats.totalPress.current}
          growthRate={data.stats.totalPress.growthRate}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
            </svg>
          }
          color="indigo"
        />

        <StatCard
          title="총 조회수"
          value={data.stats.totalViews.current}
          growthRate={data.stats.totalViews.growthRate}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="green"
          isLargeNumber
        />
      </div>

      {/* Period Comparison Analysis */}
      <div className="mb-8" role="region" aria-label="기간 비교 분석">
        {(() => {
          const { current, previous } = convertToBaseStats(
            data.stats.totalContent,
            data.stats.publishedContent,
            data.stats.totalViews
          );
          const periodLabel = `지난 ${dateRange === '7d' ? '7일' : dateRange === '30d' ? '30일' : '90일'} vs 이전 기간`;

          return (
            <PeriodComparisonCards
              current={current}
              previous={previous}
              itemLabel="콘텐츠"
              periodLabel={periodLabel}
            />
          );
        })()}
      </div>

      {/* Unified Content Insights */}
      <div className="mb-8" role="region" aria-label="통합 콘텐츠 인사이트">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">통합 콘텐츠 인사이트</h2>
        {unifiedInsights && (
          <UnifiedInsightsDashboard data={unifiedInsights} isLoading={isLoadingUnified} />
        )}
      </div>

      {/* Popup Analytics Section */}
      <div
        className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-sm p-6 mb-8 text-white"
        role="region"
        aria-label="팝업 분석"
      >
        <h2 className="text-xl font-bold mb-4">팝업 분석</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-90 mb-1">전체</p>
            <p className="text-3xl font-bold" aria-label="전체 팝업 수">{data.popupAnalytics.total}</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">활성</p>
            <p className="text-3xl font-bold text-green-300" aria-label="활성 팝업 수">{data.popupAnalytics.active}</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">비활성</p>
            <p className="text-3xl font-bold text-red-300" aria-label="비활성 팝업 수">{data.popupAnalytics.inactive}</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">활성화율</p>
            <p className="text-3xl font-bold" aria-label={`팝업 활성화율 ${data.popupAnalytics.activationRate}퍼센트`}>
              {data.popupAnalytics.activationRate}%
            </p>
          </div>
        </div>
      </div>

      {/* 30-Day Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" role="region" aria-label="30일 추이 분석">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {dateRange === '7d' ? '7일' : dateRange === '30d' ? '30일' : '90일'} 추이 분석
        </h2>
        <div role="img" aria-label={`${dateRange === '7d' ? '7일' : dateRange === '30d' ? '30일' : '90일'} 추이 차트`}>
          <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.trends.dailyData}>
            <defs>
              <linearGradient id="colorNotices" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0600f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0600f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Area type="monotone" dataKey="notices" name="공지사항" stroke="#0600f7" fillOpacity={1} fill="url(#colorNotices)" />
            <Area type="monotone" dataKey="press" name="보도자료" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPress)" />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Notices by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" role="region" aria-label="카테고리별 공지사항">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 공지사항</h3>
          <div role="img" aria-label="카테고리별 공지사항 파이 차트">
            <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.distribution.noticesByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.distribution.noticesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#0600f7'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Content by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" role="region" aria-label="상태별 콘텐츠">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상태별 콘텐츠</h3>
          <div role="img" aria-label="상태별 콘텐츠 막대 차트">
            <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.distribution.contentByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="value" name="개수">
                {data.distribution.contentByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#0600f7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Popups by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" role="region" aria-label="유형별 팝업">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">유형별 팝업</h3>
          <div role="img" aria-label="유형별 팝업 파이 차트">
            <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.distribution.popupsByType}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.distribution.popupsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#0600f7'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" role="region" aria-label="인기 콘텐츠">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top 5 인기 콘텐츠</h2>
        {data.topContent.notices.length === 0 ? (
          <div className="text-center py-8 text-gray-500" role="status">조회수 데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="인기 콘텐츠 목록">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">순위</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">제목</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">카테고리</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">조회수</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">게시일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topContent.notices.map((content) => (
                  <tr key={content.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          content.rank === 1
                            ? 'bg-yellow-100 text-yellow-700'
                            : content.rank === 2
                            ? 'bg-gray-200 text-gray-700'
                            : content.rank === 3
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {content.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/notices/${content.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {content.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {content.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-gray-900">{content.viewCount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(content.publishedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">새 콘텐츠 작성</h2>
            <p className="text-sm opacity-90 mb-4">공지사항, 보도자료, 팝업을 생성하고 관리하세요.</p>
          </div>
          <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/notices/new"
            className="inline-block px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            공지사항 작성
          </Link>
          <Link
            href="/admin/press/new"
            className="inline-block px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/50"
          >
            보도자료 작성
          </Link>
          <Link
            href="/admin/popups/new"
            className="inline-block px-4 py-2 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/50"
          >
            팝업 생성
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card Component with Growth Rate
// ============================================================================

interface StatCardProps {
  title: string;
  value: number;
  growthRate: number;
  icon: React.ReactNode;
  color: 'blue' | 'purple' | 'indigo' | 'green';
  isLargeNumber?: boolean;
}

function StatCard({ title, value, growthRate, icon, color, isLargeNumber = false }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
  };

  const isPositiveGrowth = growthRate >= 0;
  const growthText = isPositiveGrowth ? '증가' : '감소';
  const ariaLabel = `${title}: ${isLargeNumber ? value.toLocaleString() : value}, 성장률 ${growthText} ${Math.abs(growthRate)}퍼센트`;

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-6"
      role="article"
      aria-label={ariaLabel}
    >
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`} aria-hidden="true">{icon}</div>
        {/* Growth Badge */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositiveGrowth ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
          aria-label={`성장률 ${growthText} ${Math.abs(growthRate)}퍼센트`}
        >
          {isPositiveGrowth ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          )}
          <span>{Math.abs(growthRate)}%</span>
        </div>
      </div>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 mb-1" aria-live="polite">
        {isLargeNumber ? value.toLocaleString() : value}
      </p>

      {/* Title */}
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
