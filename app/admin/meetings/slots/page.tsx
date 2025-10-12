/**
 * Admin Meeting Slots Management Page
 *
 * /admin/meetings/slots
 *
 * Features:
 * - List all meeting slots
 * - Filters: meeting_type, is_available, date range
 * - Create new slots
 * - Edit/Delete slots
 * - View bookings for each slot
 *
 * Based on: GLEC-API-Specification.yaml
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';

// ====================================================================
// Types
// ====================================================================

interface MeetingSlot {
  id: string;
  title: string;
  meeting_type: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  current_bookings: number;
  max_bookings: number;
  meeting_url: string | null;
  meeting_location: string | null;
  office_address: string | null;
  assigned_to: string | null;
  created_at: string;
}

interface CreateSlotFormData {
  title: string;
  meeting_type: string;
  duration_minutes: number;
  start_time: string; // ISO 8601 datetime-local format
  is_available: boolean;
  max_bookings: number;
  meeting_url: string;
  meeting_location: string;
  office_address: string;
}

// ====================================================================
// Component
// ====================================================================

export default function MeetingSlotsPage() {
  // State
  const [slots, setSlots] = useState<MeetingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [meetingType, setMeetingType] = useState('ALL');
  const [isAvailable, setIsAvailable] = useState('ALL');

  // Create slot modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateSlotFormData>({
    title: '',
    meeting_type: 'DEMO',
    duration_minutes: 60,
    start_time: '',
    is_available: true,
    max_bookings: 1,
    meeting_url: '',
    meeting_location: 'ONLINE',
    office_address: '',
  });

  const { showToast } = useToast();

  // ====================================================================
  // Data Fetching
  // ====================================================================

  useEffect(() => {
    fetchSlots();
  }, [meetingType, isAvailable]);

  async function fetchSlots() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (meetingType !== 'ALL') params.append('meeting_type', meetingType);
      if (isAvailable !== 'ALL') params.append('is_available', isAvailable);

      const response = await fetch(`/api/admin/meetings/slots?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch slots');
      }

      setSlots(result.data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch slots:', err);
      setError(err.message || 'Failed to load meeting slots');
      setLoading(false);
      showToast('미팅 슬롯 목록을 불러오는데 실패했습니다.', 'error');
    }
  }

  // ====================================================================
  // Create Slot
  // ====================================================================

  async function handleCreateSlot(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('미팅 제목을 입력해주세요.', 'error');
      return;
    }

    if (!formData.start_time) {
      showToast('미팅 시작 시간을 선택해주세요.', 'error');
      return;
    }

    setCreating(true);

    try {
      // Calculate end_time from start_time + duration_minutes
      const startDate = new Date(formData.start_time);
      const endDate = new Date(startDate.getTime() + formData.duration_minutes * 60000);

      const requestBody = {
        title: formData.title,
        meeting_type: formData.meeting_type,
        duration_minutes: formData.duration_minutes,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        is_available: formData.is_available,
        max_bookings: formData.max_bookings,
        meeting_url: formData.meeting_url || null,
        meeting_location: formData.meeting_location || 'ONLINE',
        office_address: formData.office_address || null,
      };

      const response = await fetch('/api/admin/meetings/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create slot');
      }

      showToast('미팅 슬롯이 생성되었습니다.', 'success');
      setShowCreateModal(false);
      setFormData({
        title: '',
        meeting_type: 'DEMO',
        duration_minutes: 60,
        start_time: '',
        is_available: true,
        max_bookings: 1,
        meeting_url: '',
        meeting_location: 'ONLINE',
        office_address: '',
      });
      fetchSlots();
    } catch (err: any) {
      console.error('Failed to create slot:', err);
      showToast(err.message || '미팅 슬롯 생성에 실패했습니다.', 'error');
    } finally {
      setCreating(false);
    }
  }

  // ====================================================================
  // Delete Slot
  // ====================================================================

  async function handleDeleteSlot(slotId: string) {
    if (!confirm('정말로 이 미팅 슬롯을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/meetings/slots/${slotId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to delete slot');
      }

      showToast('미팅 슬롯이 삭제되었습니다.', 'success');
      fetchSlots();
    } catch (err: any) {
      console.error('Failed to delete slot:', err);
      showToast(err.message || '미팅 슬롯 삭제에 실패했습니다.', 'error');
    }
  }

  // ====================================================================
  // Toggle Availability
  // ====================================================================

  async function handleToggleAvailability(slot: MeetingSlot) {
    try {
      const response = await fetch(`/api/admin/meetings/slots/${slot.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_available: !slot.is_available,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update slot');
      }

      showToast('슬롯 가용성이 업데이트되었습니다.', 'success');
      fetchSlots();
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
      showToast(err.message || '슬롯 업데이트에 실패했습니다.', 'error');
    }
  }

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 미팅 슬롯 관리</h1>
        <p className="text-gray-600">미팅 가능한 시간을 생성하고 관리합니다.</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">미팅 타입</label>
            <Select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="w-full"
            >
              <option value="ALL">전체</option>
              <option value="DEMO">제품 데모</option>
              <option value="CONSULTATION">상담</option>
              <option value="ONBOARDING">온보딩</option>
              <option value="FOLLOWUP">후속 미팅</option>
              <option value="OTHER">기타</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">가용 여부</label>
            <Select
              value={isAvailable}
              onChange={(e) => setIsAvailable(e.target.value)}
              className="w-full"
            >
              <option value="ALL">전체</option>
              <option value="TRUE">예약 가능</option>
              <option value="FALSE">예약 불가</option>
            </Select>
          </div>

          <div>
            <Button onClick={() => setShowCreateModal(true)} className="w-full">
              ➕ 새 슬롯 생성
            </Button>
          </div>
        </div>
      </Card>

      {/* Slots List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-error-50 border border-error-300 text-error-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : slots.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">미팅 슬롯이 없습니다</h2>
          <p className="text-gray-600 mb-6">새 슬롯을 생성하여 고객과의 미팅을 시작하세요.</p>
          <Button onClick={() => setShowCreateModal(true)}>➕ 첫 슬롯 생성하기</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => {
            const startTime = new Date(slot.start_time);
            const endTime = new Date(slot.end_time);
            const formattedDate = startTime.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            });
            const formattedTime = `${startTime.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })} - ${endTime.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}`;

            const meetingTypeLabels: Record<string, string> = {
              DEMO: '제품 데모',
              CONSULTATION: '상담',
              ONBOARDING: '온보딩',
              FOLLOWUP: '후속 미팅',
              OTHER: '기타',
            };

            const isPast = new Date() > endTime;
            const isFull = slot.current_bookings >= slot.max_bookings;

            return (
              <Card
                key={slot.id}
                className={`p-6 ${
                  isPast ? 'opacity-60 bg-gray-50' : slot.is_available ? '' : 'bg-yellow-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{slot.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          slot.is_available
                            ? 'bg-success-100 text-success-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {slot.is_available ? '예약 가능' : '예약 불가'}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                        {meetingTypeLabels[slot.meeting_type] || slot.meeting_type}
                      </span>
                      {isPast && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                          종료됨
                        </span>
                      )}
                      {isFull && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-error-100 text-error-700">
                          예약 마감
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">📅 날짜:</span>
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">🕒 시간:</span>
                        <span>
                          {formattedTime} ({slot.duration_minutes}분)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">👥 예약:</span>
                        <span>
                          {slot.current_bookings} / {slot.max_bookings}
                        </span>
                      </div>
                      {slot.meeting_url && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">🔗 링크:</span>
                          <a
                            href={slot.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            {slot.meeting_url}
                          </a>
                        </div>
                      )}
                      {slot.office_address && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">📍 장소:</span>
                          <span>{slot.office_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => handleToggleAvailability(slot)}
                      variant="outline"
                      size="sm"
                    >
                      {slot.is_available ? '비활성화' : '활성화'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteSlot(slot.id)}
                      variant="outline"
                      size="sm"
                      className="text-error-600 border-error-300 hover:bg-error-50"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ 새 미팅 슬롯 생성</h2>

            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  미팅 제목 <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: GLEC 제품 데모 미팅"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    미팅 타입 <span className="text-error-500">*</span>
                  </label>
                  <Select
                    value={formData.meeting_type}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                    required
                  >
                    <option value="DEMO">제품 데모</option>
                    <option value="CONSULTATION">상담</option>
                    <option value="ONBOARDING">온보딩</option>
                    <option value="FOLLOWUP">후속 미팅</option>
                    <option value="OTHER">기타</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    소요 시간 (분) <span className="text-error-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })
                    }
                    min={15}
                    max={480}
                    step={15}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  시작 시간 <span className="text-error-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  최대 예약 수 <span className="text-error-500">*</span>
                </label>
                <Input
                  type="number"
                  value={formData.max_bookings}
                  onChange={(e) =>
                    setFormData({ ...formData, max_bookings: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                  max={100}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  미팅 링크 (Google Meet, Zoom 등)
                </label>
                <Input
                  type="url"
                  value={formData.meeting_url}
                  onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    미팅 장소
                  </label>
                  <Select
                    value={formData.meeting_location}
                    onChange={(e) =>
                      setFormData({ ...formData, meeting_location: e.target.value })
                    }
                  >
                    <option value="ONLINE">온라인</option>
                    <option value="OFFICE">GLEC 사무실</option>
                    <option value="CLIENT_OFFICE">고객사 사무실</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    예약 가능 여부
                  </label>
                  <Select
                    value={formData.is_available ? 'TRUE' : 'FALSE'}
                    onChange={(e) =>
                      setFormData({ ...formData, is_available: e.target.value === 'TRUE' })
                    }
                  >
                    <option value="TRUE">예약 가능</option>
                    <option value="FALSE">예약 불가</option>
                  </Select>
                </div>
              </div>

              {formData.meeting_location !== 'ONLINE' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    사무실 주소
                  </label>
                  <Input
                    type="text"
                    value={formData.office_address}
                    onChange={(e) => setFormData({ ...formData, office_address: e.target.value })}
                    placeholder="서울특별시 강남구 테헤란로 123"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? '생성 중...' : '✅ 생성하기'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
