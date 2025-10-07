/**
 * Admin Events List Page
 *
 * Based on: FR-ADMIN-010 (이벤트 목록 조회)
 * API: GET /api/admin/events
 * Standards: GLEC-Design-System-Standards.md (Table, Pagination, Filter)
 *
 * Features:
 * - Paginated event list (20 items/page)
 * - Status filter (DRAFT, PUBLISHED, CLOSED)
 * - Search by title
 * - Create event button
 * - View/Edit/Delete actions
 * - View registrations button
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  startDate: string;
  endDate: string;
  location: string;
  locationDetails: string | null;
  thumbnailUrl: string | null;
  maxParticipants: number | null;
  viewCount: number;
  publishedAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    registrations: number;
  };
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

interface ApiResponse {
  success: boolean;
  data: Event[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

export default function AdminEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states (from URL query params)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  /**
   * Fetch events from API
   */
  useEffect(() => {
    fetchEvents();
  }, [page, status, search]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/events?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        // Check for authentication errors
        if (result.error?.code === 'INVALID_TOKEN' || result.error?.code === 'UNAUTHORIZED') {
          localStorage.removeItem('admin_token');
          router.push('/admin/login?expired=true');
          return;
        }
        throw new Error(result.error?.message || 'Failed to fetch events');
      }

      setEvents(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('[Events List] Fetch error:', err);

      // Check if error message contains token-related keywords
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login?expired=true');
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update URL with filter params
   */
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/events?${params.toString()}`);
  };

  /**
   * Handle pagination
   */
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/events?${params.toString()}`);
  };

  /**
   * Handle delete (confirmation)
   */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 이벤트를 삭제하시겠습니까?\n\n모든 참가 신청도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        alert('이벤트가 삭제되었습니다.');
        fetchEvents(); // Refresh list
      } else {
        const result = await response.json();
        throw new Error(result.error?.message || 'Delete failed');
      }
    } catch (err) {
      console.error('[Delete Event] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  /**
   * Status badge color
   */
  const getStatusBadge = (status: Event['status']) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      CLOSED: 'bg-red-100 text-red-700',
    };
    const labels = {
      DRAFT: '작성중',
      PUBLISHED: '모집중',
      CLOSED: '마감',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  /**
   * Format date
   */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  /**
   * Format date range
   */
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
    });
    const endStr = end.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
    });
    return `${startStr} ~ ${endStr}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">이벤트 관리</h1>
            <p className="mt-2 text-gray-600">이벤트 목록을 조회하고 참가 신청을 관리합니다</p>
          </div>
          <Link
            href="/admin/events/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            새 이벤트 작성
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => updateFilters('search', e.target.value)}
              placeholder="이벤트 제목으로 검색..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => updateFilters('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="DRAFT">작성중</option>
              <option value="PUBLISHED">모집중</option>
              <option value="CLOSED">마감</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
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
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-700 font-medium">에러: {error}</p>
          </div>
        </div>
      )}

      {/* Event Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      이벤트 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      일정
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      장소
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      참가 신청
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        이벤트가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {event.thumbnailUrl && (
                              <img
                                src={event.thumbnailUrl}
                                alt={event.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <Link
                                href={`/admin/events/${event.id}/edit`}
                                className="text-gray-900 font-medium hover:text-primary-600 hover:underline"
                              >
                                {event.title}
                              </Link>
                              <p className="text-sm text-gray-500 mt-1">조회 {event.viewCount}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDateRange(event.startDate, event.endDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{event.location}</td>
                        <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/events/${event.id}/registrations`}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline"
                          >
                            {event._count?.registrations || 0}명
                            {event.maxParticipants && ` / ${event.maxParticipants}명`}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/events/${event.id}/registrations`}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="참가 신청 관리"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                              </svg>
                            </Link>
                            <Link
                              href={`/admin/events/${event.id}/edit`}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="수정"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(event.id, event.title)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold">{meta.total}</span>개 중{' '}
                <span className="font-semibold">{(meta.page - 1) * meta.per_page + 1}</span>-
                <span className="font-semibold">{Math.min(meta.page * meta.per_page, meta.total)}</span>개 표시
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>

                {/* Page Numbers */}
                {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      pageNum === meta.page
                        ? 'bg-primary-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(meta.page + 1)}
                  disabled={meta.page === meta.total_pages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
