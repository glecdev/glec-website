/**
 * Admin Meeting Bookings Page
 * Route: /admin/meetings/bookings
 *
 * Purpose: 어드민이 모든 미팅 예약을 조회하고 관리
 * Features:
 * - 예약 목록 조회 (페이지네이션)
 * - 상태별 필터링 (PENDING/CONFIRMED/CANCELLED/COMPLETED)
 * - 고객 정보 표시
 * - 예약 상세 보기
 * - 예약 상태 변경 (확정/취소)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface MeetingBooking {
  id: string;
  booking_status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  requested_agenda: string | null;
  created_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  meeting: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    meeting_location: string;
    meeting_type: string;
    meeting_url: string | null;
  };
  customer: {
    lead_type: string;
    lead_id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: MeetingBooking[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function AdminMeetingBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<MeetingBooking[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings
  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: '20',
        });

        if (statusFilter) {
          params.set('status', statusFilter);
        }

        if (searchQuery) {
          params.set('search', searchQuery);
        }

        const response = await fetch(`/api/admin/meetings/bookings?${params.toString()}`);
        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || 'Failed to fetch bookings');
        }

        setBookings(result.data);
        setTotalPages(result.meta.total_pages);
        setTotalCount(result.meta.total);
      } catch (err: any) {
        console.error('Failed to fetch bookings:', err);
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [page, statusFilter, searchQuery]);

  // Status badge color
  function getStatusColor(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  // Status label
  function getStatusLabel(status: string) {
    switch (status) {
      case 'PENDING':
        return '대기중';
      case 'CONFIRMED':
        return '확정';
      case 'CANCELLED':
        return '취소됨';
      case 'COMPLETED':
        return '완료';
      default:
        return status;
    }
  }

  // Meeting location label
  function getLocationLabel(location: string) {
    switch (location) {
      case 'ONLINE':
        return '온라인';
      case 'OFFICE':
        return '오피스';
      case 'CLIENT_OFFICE':
        return '고객 사무실';
      default:
        return location;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">미팅 예약 관리</h1>
        <p className="text-gray-600 mt-2">고객들의 미팅 예약을 확인하고 관리합니다.</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">전체</option>
              <option value="PENDING">대기중</option>
              <option value="CONFIRMED">확정</option>
              <option value="CANCELLED">취소됨</option>
              <option value="COMPLETED">완료</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <Input
              type="text"
              placeholder="회사명 또는 담당자명으로 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-600">
          총 <strong className="text-gray-900">{totalCount}개</strong>의 예약
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
        </div>
      )}

      {/* Bookings List */}
      {!loading && bookings.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">예약이 없습니다</h2>
          <p className="text-gray-600">조건에 맞는 미팅 예약이 없습니다.</p>
        </Card>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const startTime = new Date(booking.meeting.start_time);
            const formattedDate = startTime.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            });
            const formattedTime = startTime.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const createdDate = new Date(booking.created_at).toLocaleDateString('ko-KR');

            return (
              <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          booking.booking_status
                        )}`}
                      >
                        {getStatusLabel(booking.booking_status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        예약일: {createdDate}
                      </span>
                    </div>

                    {/* Meeting Info */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {booking.meeting.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">📅 일시:</span>
                        <span>{formattedDate} {formattedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">⏱️ 소요시간:</span>
                        <span>{booking.meeting.duration_minutes}분</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">📍 장소:</span>
                        <span>{getLocationLabel(booking.meeting.meeting_location)}</span>
                      </div>
                      {booking.meeting.meeting_url && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">🔗 링크:</span>
                          <a
                            href={booking.meeting.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            {booking.meeting.meeting_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">고객 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">회사:</span>{' '}
                      <span className="text-gray-900">{booking.customer.company_name}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">담당자:</span>{' '}
                      <span className="text-gray-900">{booking.customer.contact_name}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">이메일:</span>{' '}
                      <a
                        href={`mailto:${booking.customer.email}`}
                        className="text-primary-600 hover:underline"
                      >
                        {booking.customer.email}
                      </a>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">전화:</span>{' '}
                      <a
                        href={`tel:${booking.customer.phone}`}
                        className="text-primary-600 hover:underline"
                      >
                        {booking.customer.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Requested Agenda */}
                {booking.requested_agenda && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">요청 안건</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {booking.requested_agenda}
                    </p>
                  </div>
                )}

                {/* Cancellation Info */}
                {booking.booking_status === 'CANCELLED' && booking.cancellation_reason && (
                  <div className="border-t border-gray-200 pt-4 mt-4 bg-red-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">취소 사유</h4>
                    <p className="text-sm text-red-600">{booking.cancellation_reason}</p>
                    <p className="text-xs text-red-500 mt-1">
                      취소일: {new Date(booking.cancelled_at!).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4 mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Navigate to booking detail page
                      alert('상세보기 기능은 향후 구현 예정입니다.');
                    }}
                  >
                    상세보기
                  </Button>

                  {booking.booking_status === 'PENDING' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          // TODO: Confirm booking API
                          alert('확정 기능은 향후 구현 예정입니다.');
                        }}
                      >
                        확정하기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Cancel booking API
                          if (confirm('정말 이 예약을 취소하시겠습니까?')) {
                            alert('취소 기능은 향후 구현 예정입니다.');
                          }
                        }}
                      >
                        취소하기
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && bookings.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            이전
          </Button>

          <span className="text-sm text-gray-600 mx-4">
            페이지 <strong>{page}</strong> / <strong>{totalPages}</strong>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
