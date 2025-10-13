/**
 * Admin Meeting Bookings Page
 * Route: /admin/meetings/bookings
 *
 * Purpose: 어드민이 모든 미팅 예약을 조회하고 관리
 * Features:
 * - 탭 1: 리스트 뷰 (기존 카드 리스트)
 * - 탭 2: 캘린더 뷰 (월간 캘린더에 예약 시각화)
 * - 상태별 색상: 대기중(노랑), 확정(초록), 취소(빨강), 완료(회색)
 * - 필터링, 검색, 페이지네이션
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

type ViewMode = 'list' | 'calendar';

export default function AdminMeetingBookingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<MeetingBooking[]>([]);
  const [allBookings, setAllBookings] = useState<MeetingBooking[]>([]); // For calendar view
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch bookings for list view (paginated)
  useEffect(() => {
    if (viewMode !== 'list') return;

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
  }, [page, statusFilter, searchQuery, viewMode]);

  // Fetch all bookings for calendar view (no pagination)
  useEffect(() => {
    if (viewMode !== 'calendar') return;

    async function fetchAllBookings() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: '1',
          per_page: '1000', // Fetch all
        });

        if (statusFilter) {
          params.set('status', statusFilter);
        }

        const response = await fetch(`/api/admin/meetings/bookings?${params.toString()}`);
        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || 'Failed to fetch bookings');
        }

        setAllBookings(result.data);
        setTotalCount(result.meta.total);
      } catch (err: any) {
        console.error('Failed to fetch bookings:', err);
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    }

    fetchAllBookings();
  }, [statusFilter, viewMode]);

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
        return 'bg-gray-300 text-gray-700 border-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  // Status dot color for calendar
  function getStatusDotColor(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CONFIRMED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      case 'COMPLETED':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
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

  // Generate calendar
  function generateCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  // Get bookings for a specific date
  function getBookingsForDate(date: Date): MeetingBooking[] {
    const dateStr = date.toISOString().split('T')[0];
    return allBookings.filter((booking) => {
      const meetingDateStr = new Date(booking.meeting.start_time).toISOString().split('T')[0];
      return meetingDateStr === dateStr;
    });
  }

  const calendarDays = generateCalendar();
  const monthName = calendarMonth.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">미팅 예약 관리</h1>
        <p className="text-gray-600 mt-2">고객들의 미팅 예약을 확인하고 관리합니다.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
              viewMode === 'list'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 리스트 뷰
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
              viewMode === 'calendar'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📅 캘린더 뷰
          </button>
        </nav>
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

          {/* Search (List view only) */}
          {viewMode === 'list' && (
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
          )}
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

      {/* LIST VIEW */}
      {!loading && viewMode === 'list' && (
        <>
          {bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">예약이 없습니다</h2>
              <p className="text-gray-600">조건에 맞는 미팅 예약이 없습니다.</p>
            </Card>
          ) : (
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
                          <span className="text-sm text-gray-500">예약일: {createdDate}</span>
                        </div>

                        {/* Meeting Info */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {booking.meeting.title}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">📅 일시:</span>
                            <span>
                              {formattedDate} {formattedTime}
                            </span>
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
                              alert('확정 기능은 향후 구현 예정입니다.');
                            }}
                          >
                            확정하기
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
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
          {bookings.length > 0 && totalPages > 1 && (
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
        </>
      )}

      {/* CALENDAR VIEW */}
      {!loading && viewMode === 'calendar' && (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Calendar (7 columns on lg+) */}
          <div className="lg:col-span-7 mb-8 lg:mb-0">
            <div className="space-y-6">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newMonth = new Date(calendarMonth);
                    newMonth.setMonth(newMonth.getMonth() - 1);
                    setCalendarMonth(newMonth);
                  }}
                >
                  ← 이전 달
                </Button>

                <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newMonth = new Date(calendarMonth);
                    newMonth.setMonth(newMonth.getMonth() + 1);
                    setCalendarMonth(newMonth);
                  }}
                >
                  다음 달 →
                </Button>
              </div>

              {/* Legend */}
              <Card className="p-4 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-700">범례:</span>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span>대기중</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>확정</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>취소됨</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                    <span>완료</span>
                  </div>
                </div>
              </Card>

              {/* Calendar Grid */}
              <Card className="p-6 bg-white shadow-sm">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                <div
                  key={day}
                  className={`text-center font-semibold py-2 ${
                    idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dayBookings = getBookingsForDate(day);
                const dayOfWeek = day.getDay();
                const isToday =
                  day.toDateString() === new Date().toDateString();
                const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square border-2 rounded-lg p-2 flex flex-col transition-all duration-200
                      ${isSelected ? 'border-primary-600 bg-primary-100 shadow-lg transform scale-105' : isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}
                      ${dayOfWeek === 0 ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : 'text-gray-900'}
                      ${dayBookings.length > 0 ? 'hover:border-primary-400 hover:shadow-md cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <div className="font-semibold text-sm mb-1">{day.getDate()}</div>

                    {/* Booking dots */}
                    {dayBookings.length > 0 && (
                      <div className="flex-1 overflow-y-auto">
                        <div className="space-y-1">
                          {dayBookings.slice(0, 3).map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center gap-1"
                              title={`${booking.meeting.title} - ${getStatusLabel(
                                booking.booking_status
                              )}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDotColor(
                                  booking.booking_status
                                )}`}
                              ></span>
                              <span className="text-xs truncate">
                                {new Date(booking.meeting.start_time).toLocaleTimeString('ko-KR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                })}
                              </span>
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="text-xs text-gray-500">+{dayBookings.length - 3}개</div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Selected Date Bookings (5 columns on lg+) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              {!selectedDate ? (
                <Card className="p-8 text-center bg-white shadow-sm">
                  <div className="text-6xl mb-4">📅</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">날짜를 선택하세요</h2>
                  <p className="text-gray-600">캘린더에서 날짜를 클릭하면 예약 정보가 표시됩니다.</p>
                </Card>
              ) : (
                <>
                  {/* Selected Date Header */}
                  <Card className="p-6 bg-white shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedDate.toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </h3>
                    <p className="text-sm text-gray-600">
                      총 <strong>{getBookingsForDate(selectedDate).length}개</strong>의 예약
                    </p>
                  </Card>

                  {/* Bookings List for Selected Date */}
                  {getBookingsForDate(selectedDate).length === 0 ? (
                    <Card className="p-8 text-center bg-white shadow-sm">
                      <div className="text-6xl mb-4">📭</div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">예약이 없습니다</h2>
                      <p className="text-gray-600">이 날짜에는 미팅 예약이 없습니다.</p>
                    </Card>
                  ) : (
                    <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                      {getBookingsForDate(selectedDate).map((booking) => {
                        const startTime = new Date(booking.meeting.start_time);
                        const formattedTime = startTime.toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        });

                        return (
                          <Card key={booking.id} className="p-5 hover:shadow-lg transition-shadow bg-white">
                            {/* Status Badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                                  booking.booking_status
                                )}`}
                              >
                                {getStatusLabel(booking.booking_status)}
                              </span>
                              <span className="text-sm font-bold text-gray-900">{formattedTime}</span>
                            </div>

                            {/* Meeting Title */}
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                              {booking.meeting.title}
                            </h4>

                            {/* Meeting Info */}
                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">⏱️</span>
                                <span>{booking.meeting.duration_minutes}분</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">📍</span>
                                <span>{getLocationLabel(booking.meeting.meeting_location)}</span>
                              </div>
                            </div>

                            {/* Customer Info */}
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <h5 className="text-sm font-semibold text-gray-700 mb-2">고객 정보</h5>
                              <div className="space-y-1 text-sm">
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
                              <div className="border-t border-gray-200 pt-3 mt-3">
                                <h5 className="text-sm font-semibold text-gray-700 mb-1">요청 안건</h5>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                                  {booking.requested_agenda}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="border-t border-gray-200 pt-3 mt-3 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  alert('상세보기 기능은 향후 구현 예정입니다.');
                                }}
                              >
                                상세보기
                              </Button>

                              {booking.booking_status === 'PENDING' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    alert('확정 기능은 향후 구현 예정입니다.');
                                  }}
                                >
                                  확정
                                </Button>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
