/**
 * Period Comparison Cards Component
 *
 * Purpose: Show metrics comparison between current and previous period
 * Used in: Admin insights tabs
 *
 * Features:
 * - Growth/decline indicators with arrows
 * - Percentage change calculation
 * - Color-coded metrics
 * - Previous period value display
 */

'use client';

import React from 'react';
import type { BaseStats } from '@/lib/admin-insights';

interface PeriodComparisonCardsProps {
  current: BaseStats;
  previous: BaseStats;
  itemLabel?: string;
  periodLabel?: string; // e.g., "지난 7일 vs 이전 7일"
}

export function PeriodComparisonCards({
  current,
  previous,
  itemLabel = '항목',
  periodLabel
}: PeriodComparisonCardsProps) {
  const calculateChange = (currentVal: number, previousVal: number) => {
    if (previousVal === 0) return currentVal > 0 ? 100 : 0;
    return Math.round(((currentVal - previousVal) / previousVal) * 100);
  };

  const metrics = [
    {
      label: `전체 ${itemLabel}`,
      current: current.totalItems,
      previous: previous.totalItems,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      label: '발행됨',
      current: current.publishedCount,
      previous: previous.publishedCount,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      label: '총 조회수',
      current: current.totalViews,
      previous: previous.totalViews,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      label: '평균 조회수',
      current: current.avgViewsPerItem,
      previous: previous.avgViewsPerItem,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      color: 'amber',
    },
  ];

  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  };

  return (
    <div className="space-y-4">
      {periodLabel && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">기간 비교 분석</h3>
          <span className="text-sm text-gray-600 font-medium">{periodLabel}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const change = calculateChange(metric.current, metric.previous);
          const isPositive = change > 0;
          const isNegative = change < 0;
          const colors = colorClasses[metric.color as keyof typeof colorClasses];

          return (
            <div key={metric.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <div className={`p-3 ${colors.bg} rounded-lg ${colors.text}`}>
                  {metric.icon}
                </div>
              </div>

              <div className="space-y-2">
                {/* Current Value */}
                <p className="text-3xl font-bold text-gray-900">
                  {metric.current.toLocaleString()}
                </p>

                {/* Change Indicator */}
                <div className="flex items-center gap-2">
                  {isPositive && (
                    <>
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                      </svg>
                      <span className="text-sm font-semibold text-green-600">
                        +{change}%
                      </span>
                    </>
                  )}
                  {isNegative && (
                    <>
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                      <span className="text-sm font-semibold text-red-600">
                        {change}%
                      </span>
                    </>
                  )}
                  {change === 0 && (
                    <span className="text-sm font-semibold text-gray-500">
                      변화 없음
                    </span>
                  )}
                  <span className="text-xs text-gray-500">vs 이전 기간</span>
                </div>

                {/* Previous Value (small text) */}
                <p className="text-xs text-gray-500">
                  이전 기간: {metric.previous.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">인사이트</h4>
            <p className="text-sm text-blue-800">
              {(() => {
                const viewsChange = calculateChange(current.totalViews, previous.totalViews);
                if (viewsChange > 10) {
                  return `조회수가 ${viewsChange}% 증가했습니다. 긍정적인 트렌드를 유지하고 있습니다.`;
                } else if (viewsChange < -10) {
                  return `조회수가 ${Math.abs(viewsChange)}% 감소했습니다. 콘텐츠 전략 검토가 필요할 수 있습니다.`;
                } else {
                  return `조회수가 안정적입니다. 현재 수준을 유지하고 있습니다.`;
                }
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
