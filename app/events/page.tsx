/**
 * Events Page (/events)
 *
 * Based on:
 * - GLEC-Page-Structure-Standards.md
 * - GLEC-Design-System-Standards.md
 * - GLEC-Functional-Requirements-Specification.md
 *
 * Purpose: Display upcoming and ongoing events with filtering
 * Design: Grid layout (3-col desktop, 1-col mobile), responsive, accessible
 * Security: CLAUDE.md - Dynamic data only, no hardcoding
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventCard } from '@/components/events/EventCard';
import type { Event, EventsApiResponse, EventStatus } from '@/types/event';

// Loading skeleton component
function EventCardSkeleton() {
  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-pulse"
      role="status"
      aria-label="이벤트 로딩중"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="h-6 w-16 bg-gray-300 rounded-full" />
        <div className="h-6 w-20 bg-gray-300 rounded" />
      </div>
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-300 rounded w-full mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-2/3" />
      </div>
      <div className="mt-6 h-10 bg-gray-300 rounded" />
    </div>
  );
}

// Error message component
function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      className="bg-error-50 border-2 border-error-200 rounded-lg p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <svg
        className="w-12 h-12 text-error-500 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-xl font-bold text-error-700 mb-2">이벤트를 불러올 수 없습니다</h3>
      <p className="text-error-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
        aria-label="다시 시도"
      >
        다시 시도
      </button>
    </div>
  );
}

// Empty state component
function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="col-span-full text-center py-16" role="status">
      <svg
        className="w-16 h-16 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {filter === 'all' ? '등록된 이벤트가 없습니다' : `${filter} 이벤트가 없습니다`}
      </h3>
      <p className="text-gray-500">나중에 다시 확인해주세요.</p>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');

  // Fetch events from API
  async function fetchEvents(status?: EventStatus | 'all') {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('per_page', '12');
      if (status && status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/events?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EventsApiResponse = await response.json();

      if (!result.success) {
        throw new Error('Failed to fetch events');
      }

      setEvents(result.data);
      setError(null);
    } catch (err) {
      console.error('[EventsPage] Failed to fetch events:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      fetchEvents();
    } else {
      fetchEvents(statusFilter);
    }
  }, [statusFilter]);

  // Handle filter button click
  function handleFilterChange(filter: EventStatus | 'all') {
    setStatusFilter(filter);
  }

  // Handle retry on error
  function handleRetry() {
    if (statusFilter === 'all') {
      fetchEvents();
    } else {
      fetchEvents(statusFilter);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-navy-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              GLEC 이벤트
            </h1>
            <p className="text-lg sm:text-xl text-gray-100">
              ISO-14083 국제표준 세미나, 제품 론칭, 워크샵 등 다양한 이벤트에 참여하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex gap-2 sm:gap-4 overflow-x-auto py-4"
            role="tablist"
            aria-label="이벤트 상태 필터"
          >
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={statusFilter === 'all'}
              aria-controls="events-list"
            >
              전체
            </button>
            <button
              onClick={() => handleFilterChange('UPCOMING')}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === 'UPCOMING'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={statusFilter === 'UPCOMING'}
              aria-controls="events-list"
            >
              예정
            </button>
            <button
              onClick={() => handleFilterChange('ONGOING')}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === 'ONGOING'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={statusFilter === 'ONGOING'}
              aria-controls="events-list"
            >
              진행중
            </button>
            <button
              onClick={() => handleFilterChange('COMPLETED')}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === 'COMPLETED'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={statusFilter === 'COMPLETED'}
              aria-controls="events-list"
            >
              종료
            </button>
          </nav>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <ErrorMessage error={error} onRetry={handleRetry} />
          ) : (
            <div
              id="events-list"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              role="tabpanel"
            >
              {loading ? (
                // Loading skeletons
                <>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                  ))}
                </>
              ) : events.length === 0 ? (
                // Empty state
                <EmptyState filter={statusFilter === 'all' ? 'all' : statusFilter} />
              ) : (
                // Event cards
                events.map((event) => <EventCard key={event.id} event={event} />)
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
