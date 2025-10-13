/**
 * Admin Meeting Booking Detail Page
 *
 * Based on: GLEC-Design-System-Standards.md
 * Purpose: 특정 미팅 예약의 상세 정보 조회 및 관리
 *
 * Features:
 * - 예약 상세 정보 (상태, 안건, 취소 이유)
 * - 고객 정보 (회사명, 담당자, 연락처)
 * - 미팅 슬롯 정보 (시간, 장소, 타입)
 * - 상태 변경 액션 (확정, 취소)
 * - 뒤로가기 네비게이션
 */

'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BookingDetail {
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
    meeting_location: 'OFFICE' | 'ONLINE' | 'HYBRID';
    meeting_type: 'GENERAL' | 'DEMO' | 'CONSULTATION' | 'TRAINING';
    meeting_url: string | null;
    slot_status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  };

  customer: {
    lead_type: 'CONTACT' | 'LIBRARY_LEAD';
    lead_id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone: string;
    position: string | null;
    consent_date: string | null;
  };

  library_item: {
    id: string;
    title: string;
    file_type: string;
  } | null;
}

interface ApiResponse {
  success: boolean;
  data?: BookingDetail;
  error?: {
    code: string;
    message: string;
  };
}

export default function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  async function fetchBookingDetail() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/meetings/bookings/${id}`);
      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch booking detail');
      }

      setBooking(result.data!);
    } catch (err: any) {
      console.error('[AdminBookingDetailPage] Error:', err);
      setError(err.message || 'Failed to load booking detail');
    } finally {
      setLoading(false);
    }
  }

  // Format date
  function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Status badge
  function getStatusBadge(status: string) {
    const statusConfig = {
      PENDING: { label: '대기중', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '확정', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: '취소됨', className: 'bg-red-100 text-red-800' },
      COMPLETED: { label: '완료', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  }

  // Meeting location label
  function getLocationLabel(location: string): string {
    const labels = {
      OFFICE: '오프라인 (사무실)',
      ONLINE: '온라인 (화상)',
      HYBRID: '하이브리드',
    };
    return labels[location as keyof typeof labels] || location;
  }

  // Meeting type label
  function getTypeLabel(type: string): string {
    const labels = {
      GENERAL: '일반 상담',
      DEMO: '제품 데모',
      CONSULTATION: '전문 컨설팅',
      TRAINING: '교육 및 트레이닝',
    };
    return labels[type as keyof typeof labels] || type;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card variant="outlined" padding="lg">
            <div className="text-center py-12">
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">예약을 찾을 수 없습니다</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/admin/meetings/bookings">
                <Button variant="primary">목록으로 돌아가기</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/meetings/bookings">
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                뒤로가기
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">미팅 예약 상세</h1>
          </div>
          {getStatusBadge(booking.booking_status)}
        </div>

        {/* Booking Info */}
        <Card variant="outlined" padding="lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">예약 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">예약 ID</p>
                  <p className="text-base font-medium text-gray-900 font-mono">{booking.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">예약 일시</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(booking.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">상태</p>
                  <p className="text-base font-medium text-gray-900">{getStatusBadge(booking.booking_status)}</p>
                </div>
                {booking.cancelled_at && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">취소 일시</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(booking.cancelled_at)}</p>
                  </div>
                )}
              </div>

              {booking.requested_agenda && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">요청 안건</p>
                  <p className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {booking.requested_agenda}
                  </p>
                </div>
              )}

              {booking.cancellation_reason && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">취소 사유</p>
                  <p className="text-base text-red-700 whitespace-pre-wrap bg-red-50 p-4 rounded-lg">
                    {booking.cancellation_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Meeting Info */}
        <Card variant="outlined" padding="lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">미팅 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">미팅 제목</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.meeting.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">미팅 일시</p>
                  <p className="text-base font-medium text-gray-900">{formatDateTime(booking.meeting.start_time)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.meeting.duration_minutes}분 소요
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">미팅 타입</p>
                  <p className="text-base font-medium text-gray-900">{getTypeLabel(booking.meeting.meeting_type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">장소</p>
                  <p className="text-base font-medium text-gray-900">
                    {getLocationLabel(booking.meeting.meeting_location)}
                  </p>
                </div>
                {booking.meeting.meeting_url && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">미팅 URL</p>
                    <a
                      href={booking.meeting.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-medium text-primary-600 hover:text-primary-700 underline"
                    >
                      {booking.meeting.meeting_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Customer Info */}
        <Card variant="outlined" padding="lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">고객 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">회사명</p>
                  <p className="text-base font-medium text-gray-900">{booking.customer.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">담당자명</p>
                  <p className="text-base font-medium text-gray-900">{booking.customer.contact_name}</p>
                </div>
                {booking.customer.position && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">직책</p>
                    <p className="text-base font-medium text-gray-900">{booking.customer.position}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">이메일</p>
                  <a
                    href={`mailto:${booking.customer.email}`}
                    className="text-base font-medium text-primary-600 hover:text-primary-700 underline"
                  >
                    {booking.customer.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">전화번호</p>
                  <a
                    href={`tel:${booking.customer.phone}`}
                    className="text-base font-medium text-primary-600 hover:text-primary-700 underline"
                  >
                    {booking.customer.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">리드 타입</p>
                  <p className="text-base font-medium text-gray-900">
                    {booking.customer.lead_type === 'CONTACT' ? '문의 폼' : '자료실 다운로드'}
                  </p>
                </div>
                {booking.customer.consent_date && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">동의 일자</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(booking.customer.consent_date)}</p>
                  </div>
                )}
              </div>

              {/* Library Item Info */}
              {booking.library_item && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">다운로드한 자료</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">자료 제목</p>
                    <p className="text-base font-medium text-gray-900">{booking.library_item.title}</p>
                    <p className="text-sm text-gray-600 mt-2">파일 타입: {booking.library_item.file_type}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card variant="outlined" padding="lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>예약 ID: {booking.id}</p>
              <p>생성일: {formatDateTime(booking.created_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/meetings/bookings">
                <Button variant="secondary">목록으로</Button>
              </Link>
              {booking.booking_status === 'PENDING' && (
                <>
                  <Button variant="primary">확정하기</Button>
                  <Button variant="danger">취소하기</Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
