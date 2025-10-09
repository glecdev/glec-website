/**
 * Admin Insights UI Components
 *
 * Reusable components for displaying statistics and insights
 */

'use client';

import React from 'react';
import type { BaseStats, ContentItem } from '@/lib/admin-insights';
import { formatDate } from '@/lib/admin-insights';

interface OverviewCardsProps {
  stats: BaseStats;
  itemLabel?: string; // e.g., "공지사항", "보도자료", "이벤트"
}

export function OverviewCards({ stats, itemLabel = '항목' }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">전체 {itemLabel}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Published */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">발행된 {itemLabel}</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.publishedCount}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Views */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">총 조회수</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Average Views */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">평균 조회수</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.avgViewsPerItem.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusDistributionProps {
  stats: BaseStats;
}

export function StatusDistribution({ stats }: StatusDistributionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">상태별 분포</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">작성중</span>
          <div className="flex items-center gap-3">
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-500 transition-all"
                style={{ width: `${stats.totalItems > 0 ? (stats.draftCount / stats.totalItems) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.draftCount}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">발행</span>
          <div className="flex items-center gap-3">
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${stats.totalItems > 0 ? (stats.publishedCount / stats.totalItems) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.publishedCount}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">보관</span>
          <div className="flex items-center gap-3">
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${stats.totalItems > 0 ? (stats.archivedCount / stats.totalItems) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.archivedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryDistributionProps {
  distribution: Record<string, number>;
  categories: Array<{ key: string; label: string; color: string }>;
  totalItems: number;
}

export function CategoryDistribution({ distribution, categories, totalItems }: CategoryDistributionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 분포</h3>
      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.key} className="flex items-center justify-between">
            <span className="text-gray-700">{cat.label}</span>
            <div className="flex items-center gap-3">
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cat.color} transition-all`}
                  style={{ width: `${totalItems > 0 ? ((distribution[cat.key] || 0) / totalItems) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-12 text-right">{distribution[cat.key] || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TopViewedListProps<T extends ContentItem> {
  items: T[];
  title?: string;
  emptyMessage?: string;
}

export function TopViewedList<T extends ContentItem>({ items, title = '조회수 상위 5개', emptyMessage = '데이터 없음' }: TopViewedListProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                <p className="text-sm text-gray-900 truncate">{item.title}</p>
              </div>
              <span className="text-sm font-semibold text-purple-600 ml-3">{item.viewCount.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface RecentPublishedListProps<T extends ContentItem> {
  items: T[];
  title?: string;
  emptyMessage?: string;
  renderBadge?: (item: T) => React.ReactNode;
}

export function RecentPublishedList<T extends ContentItem>({
  items,
  title = '최근 발행 5개',
  emptyMessage = '데이터 없음',
  renderBadge,
}: RecentPublishedListProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(item.publishedAt)}</p>
              </div>
              {renderBadge && renderBadge(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
