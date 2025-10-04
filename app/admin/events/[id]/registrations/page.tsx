/**
 * Admin Event Registrations Page
 *
 * Based on: FR-ADMIN-014 (이벤트 참가 신청 관리)
 * API: GET/PATCH /api/admin/events/[id]/registrations
 * Standards: GLEC-Design-System-Standards.md (Table, Filter)
 *
 * Features:
 * - View all registrations for an event
 * - Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
 * - Search by name or email
 * - Approve/Reject/Cancel actions
 * - Show event title and details at top
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number | null;
}

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  jobTitle: string | null;
  message: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  privacyConsent: boolean;
  marketingConsent: boolean;
  adminNotes: string | null;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    event: Event;
    registrations: Registration[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function EventRegistrationsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  /**
   * Fetch registrations
   */
  useEffect(() => {
    if (!eventId) return;
    fetchRegistrations();
  }, [eventId, status, search]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/events/${eventId}/registrations?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch registrations');
      }

      setEvent(result.data.event);
      setRegistrations(result.data.registrations);
    } catch (err) {
      console.error('[Registrations] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update filters
   */
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/events/${eventId}/registrations?${params.toString()}`);
  };

  /**
   * Update registration status
   */
  const updateStatus = async (registrationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/events/${eventId}/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update status');
      }

      alert('상태가 업데이트되었습니다.');
      fetchRegistrations(); // Refresh list
    } catch (err) {
      console.error('[Update Status] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  /**
   * Status badge
   */
  const getStatusBadge = (status: Registration['status']) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
    };
    const labels = {
      PENDING: '대기',
      APPROVED: '승인',
      REJECTED: '거부',
      CANCELLED: '취소',
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
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/events"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">참가 신청 관리</h1>
            {event && (
              <div className="mt-2 text-gray-600">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm">
                  {new Date(event.startDate).toLocaleDateString('ko-KR')} ~ {new Date(event.endDate).toLocaleDateString('ko-KR')} | {event.location}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {event && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">전체 신청</p>
            <p className="text-2xl font-bold text-gray-900">{registrations.length}명</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">승인</p>
            <p className="text-2xl font-bold text-green-600">
              {registrations.filter((r) => r.status === 'APPROVED').length}명
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">대기</p>
            <p className="text-2xl font-bold text-yellow-600">
              {registrations.filter((r) => r.status === 'PENDING').length}명
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">최대 인원</p>
            <p className="text-2xl font-bold text-gray-900">{event.maxParticipants || '제한 없음'}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => updateFilters('search', e.target.value)}
              placeholder="이름 또는 이메일로 검색..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

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
              <option value="PENDING">대기</option>
              <option value="APPROVED">승인</option>
              <option value="REJECTED">거부</option>
              <option value="CANCELLED">취소</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
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
          <p className="text-red-700 font-medium">에러: {error}</p>
        </div>
      )}

      {/* Registrations Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">이름</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">연락처</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">회사/직책</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">신청일</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      참가 신청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{reg.name}</p>
                        {reg.message && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{reg.message}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="text-gray-900">{reg.email}</p>
                        <p className="text-gray-500">{reg.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reg.company && <p>{reg.company}</p>}
                        {reg.jobTitle && <p className="text-gray-500">{reg.jobTitle}</p>}
                        {!reg.company && !reg.jobTitle && '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(reg.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(reg.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {reg.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateStatus(reg.id, 'APPROVED')}
                                className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded transition-colors"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => updateStatus(reg.id, 'REJECTED')}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded transition-colors"
                              >
                                거부
                              </button>
                            </>
                          )}
                          {reg.status === 'APPROVED' && (
                            <button
                              onClick={() => updateStatus(reg.id, 'CANCELLED')}
                              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded transition-colors"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
