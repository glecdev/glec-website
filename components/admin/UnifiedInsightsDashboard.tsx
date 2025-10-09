/**
 * Unified Insights Dashboard Component
 *
 * Purpose: Display aggregated insights from all content types in one view
 * Used in: /admin/dashboard
 *
 * Features:
 * - All content types overview cards
 * - Cross-content comparison charts
 * - Global trends analysis
 * - Content performance matrix
 */

'use client';

import React from 'react';
import {
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

// ============================================================================
// Types
// ============================================================================

export interface ContentTypeStats {
  type: string;
  label: string;
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  avgViews: number;
  color: string;
}

export interface UnifiedInsightsData {
  contentTypes: ContentTypeStats[];
  totalContent: number;
  totalViews: number;
  totalPublished: number;
  mostActiveType: string;
  mostViewedType: string;
}

// ============================================================================
// Main Component
// ============================================================================

interface UnifiedInsightsDashboardProps {
  data: UnifiedInsightsData;
  isLoading?: boolean;
}

export default function UnifiedInsightsDashboard({ data, isLoading }: UnifiedInsightsDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Prepare chart data
  const contentTypeChartData = data.contentTypes.map(ct => ({
    name: ct.label,
    총항목: ct.total,
    발행됨: ct.published,
    color: ct.color,
  }));

  const viewsChartData = data.contentTypes.map(ct => ({
    name: ct.label,
    조회수: ct.totalViews,
    평균조회수: ct.avgViews,
    color: ct.color,
  }));

  const statusDistribution = data.contentTypes.reduce(
    (acc, ct) => {
      acc[0].value += ct.published;
      acc[1].value += ct.draft;
      acc[2].value += ct.archived;
      return acc;
    },
    [
      { name: '발행됨', value: 0, color: '#10b981' },
      { name: '임시저장', value: 0, color: '#f59e0b' },
      { name: '보관됨', value: 0, color: '#6b7280' },
    ]
  );

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{data.totalContent}</p>
          <p className="text-sm text-gray-600">전체 콘텐츠</p>
        </div>

        {/* Total Published */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{data.totalPublished}</p>
          <p className="text-sm text-gray-600">발행된 콘텐츠</p>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{data.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-600">총 조회수</p>
        </div>

        {/* Most Active Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1">{data.mostActiveType}</p>
          <p className="text-sm text-gray-600">가장 활발한 유형</p>
        </div>
      </div>

      {/* Content Type Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Type Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">콘텐츠 유형별 현황</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentTypeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="총항목" fill="#0600f7" />
              <Bar dataKey="발행됨" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Global Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 상태별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.name} (${entry.value})`}
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Views Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">유형별 조회수 비교</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viewsChartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="조회수" fill="#8b5cf6" />
            <Bar dataKey="평균조회수" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Content Performance Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">콘텐츠 성과 매트릭스</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">유형</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">총 항목</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">발행됨</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">임시저장</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">보관됨</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">총 조회수</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">평균 조회수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.contentTypes.map((ct) => (
                <tr key={ct.type} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ct.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{ct.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900">{ct.total}</td>
                  <td className="px-4 py-3 text-right text-sm text-green-600 font-medium">{ct.published}</td>
                  <td className="px-4 py-3 text-right text-sm text-amber-600">{ct.draft}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">{ct.archived}</td>
                  <td className="px-4 py-3 text-right text-sm text-purple-600 font-medium">
                    {ct.totalViews.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-blue-600">{ct.avgViews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
