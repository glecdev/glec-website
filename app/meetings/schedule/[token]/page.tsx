/**
 * Customer Meeting Selection Page
 * Route: /meetings/schedule/[token]
 *
 * Purpose: 고객이 미팅 제안 이메일의 링크를 클릭하여 미팅 시간 선택
 * Workflow:
 * 1. URL token 파라미터 추출
 * 2. GET /api/meetings/availability?token={token} 호출
 * 3. 가능한 슬롯 목록 표시 (날짜별 그룹화)
 * 4. 고객이 슬롯 선택 + 안건 입력
 * 5. POST /api/meetings/book 호출
 * 6. 예약 확인 페이지 표시
 */

'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';

interface LeadInfo {
  company_name: string;
  contact_name: string;
  email: string;
}

interface MeetingSlot {
  id: string;
  start_time: string;
  available_spots: number;
}

interface SlotsByDate {
  [date: string]: MeetingSlot[];
}

interface AvailabilityResponse {
  success: boolean;
  data?: {
    token_valid: boolean;
    lead_info: LeadInfo;
    slots_by_date: SlotsByDate;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface BookingResponse {
  success: boolean;
  data?: {
    booking_id: string;
    meeting_slot: {
      title: string;
      start_time: string;
      end_time: string;
      meeting_url?: string;
    };
    booking_status: string;
    confirmation_sent: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function MeetingSchedulePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({});
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [requestedAgenda, setRequestedAgenda] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState<BookingResponse['data'] | null>(null);

  // Fetch available slots
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch(`/api/meetings/availability?token=${resolvedParams.token}`);
        const result: AvailabilityResponse = await response.json();

        if (!response.ok || !result.success) {
          const errorCode = result.error?.code || 'UNKNOWN_ERROR';
          const errorMessages: Record<string, string> = {
            INVALID_TOKEN: '유효하지 않은 예약 링크입니다.',
            TOKEN_NOT_FOUND: '예약 링크를 찾을 수 없습니다.',
            TOKEN_EXPIRED: '예약 링크가 만료되었습니다. 담당자에게 새로운 링크를 요청해 주세요.',
            TOKEN_ALREADY_USED: '이미 사용된 예약 링크입니다.',
            UNKNOWN_ERROR: '예약 정보를 불러오는 중 오류가 발생했습니다.',
          };
          setError(errorMessages[errorCode] || errorMessages.UNKNOWN_ERROR);
          setLoading(false);
          return;
        }

        if (result.data) {
          setLeadInfo(result.data.lead_info);
          setSlotsByDate(result.data.slots_by_date);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        setError('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [resolvedParams.token]);

  // Handle booking submission
  async function handleBooking() {
    if (!selectedSlotId) {
      setError('미팅 시간을 선택해 주세요.');
      return;
    }

    setBooking(true);
    setError(null);

    try {
      const response = await fetch('/api/meetings/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resolvedParams.token,
          meeting_slot_id: selectedSlotId,
          requested_agenda: requestedAgenda || undefined,
        }),
      });

      const result: BookingResponse = await response.json();

      if (!response.ok || !result.success) {
        const errorCode = result.error?.code || 'UNKNOWN_ERROR';
        const errorMessages: Record<string, string> = {
          SLOT_NOT_AVAILABLE: '선택하신 시간이 더 이상 예약 가능하지 않습니다. 다른 시간을 선택해 주세요.',
          TOKEN_EXPIRED: '예약 링크가 만료되었습니다.',
          TOKEN_ALREADY_USED: '이미 사용된 예약 링크입니다.',
          UNKNOWN_ERROR: '예약 중 오류가 발생했습니다.',
        };
        setError(errorMessages[errorCode] || errorMessages.UNKNOWN_ERROR);
        setBooking(false);
        return;
      }

      // Success!
      setBookingSuccess(true);
      setBookingData(result.data || null);
      setBooking(false);
    } catch (err) {
      console.error('Failed to book meeting:', err);
      setError('예약 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      setBooking(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-error-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  // Success state
  if (bookingSuccess && bookingData) {
    const startTime = new Date(bookingData.meeting_slot.start_time);
    const formattedDate = startTime.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    const formattedTime = startTime.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-success-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">미팅 예약이 확정되었습니다!</h1>

          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-bold text-primary-700 mb-4">📅 예약 정보</h2>

            <div className="space-y-3 text-gray-700">
              <div>
                <span className="font-semibold">미팅 제목:</span>{' '}
                <span>{bookingData.meeting_slot.title}</span>
              </div>
              <div>
                <span className="font-semibold">날짜:</span> <span>{formattedDate}</span>
              </div>
              <div>
                <span className="font-semibold">시간:</span> <span>{formattedTime}</span>
              </div>
              {bookingData.meeting_slot.meeting_url && (
                <div>
                  <span className="font-semibold">참여 링크:</span>{' '}
                  <a
                    href={bookingData.meeting_slot.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    {bookingData.meeting_slot.meeting_url}
                  </a>
                </div>
              )}
              <div>
                <span className="font-semibold">예약 번호:</span>{' '}
                <span className="font-mono text-sm">{bookingData.booking_id}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm leading-relaxed">
              {bookingData.confirmation_sent
                ? '✉️ 예약 확인 이메일이 발송되었습니다. 이메일에서 상세 정보를 확인하세요.'
                : '⚠️ 예약은 완료되었으나 확인 이메일 발송에 실패했습니다. 담당자에게 문의해 주세요.'}
            </p>
          </div>

          <Button onClick={() => router.push('/')} size="lg" className="w-full sm:w-auto">
            홈으로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  // Main booking form
  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">📅 미팅 일정 선택</h1>
          <p className="text-lg text-gray-600">
            안녕하세요, <strong className="text-primary-600">{leadInfo?.company_name}</strong>{' '}
            <strong className="text-primary-600">{leadInfo?.contact_name}</strong>님
          </p>
          <p className="text-sm text-gray-500 mt-2">
            GLEC 미팅 일정을 선택해 주세요. 편하신 시간을 선택하시면 예약이 확정됩니다.
          </p>
        </div>

        {/* Available Slots */}
        {sortedDates.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">예약 가능한 시간이 없습니다</h2>
            <p className="text-gray-600">담당자에게 연락하여 새로운 미팅 시간을 요청해 주세요.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dateObj = new Date(date);
              const formattedDate = dateObj.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              });

              return (
                <Card key={date} className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{formattedDate}</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {slotsByDate[date].map((slot) => {
                      const slotTime = new Date(slot.start_time);
                      const formattedTime = slotTime.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      });
                      const isSelected = selectedSlotId === slot.id;

                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`
                            px-4 py-3 rounded-lg border-2 text-center transition-all
                            ${
                              isSelected
                                ? 'bg-primary-500 border-primary-600 text-white shadow-lg scale-105'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                            }
                          `}
                        >
                          <div className="font-bold">{formattedTime}</div>
                          <div className="text-xs mt-1 opacity-80">
                            {slot.available_spots}자리 남음
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })}

            {/* Requested Agenda */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📝 미팅 안건 (선택사항)</h2>
              <Textarea
                value={requestedAgenda}
                onChange={(e) => setRequestedAgenda(e.target.value)}
                placeholder="논의하고 싶은 주제나 질문사항을 자유롭게 작성해 주세요. (예: GLEC Cloud 도입 상담, 탄소배출 측정 방법론 문의 등)"
                rows={4}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                사전에 안건을 공유해 주시면 더 효율적인 미팅이 가능합니다.
              </p>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleBooking}
                disabled={!selectedSlotId || booking}
                size="lg"
                className="w-full sm:w-auto px-12"
              >
                {booking ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    예약 중...
                  </span>
                ) : (
                  '✅ 미팅 예약하기'
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-error-50 border border-error-300 text-error-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
