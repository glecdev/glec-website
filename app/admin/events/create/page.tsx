/**
 * Admin Event Create Page
 *
 * Based on: FR-ADMIN-011 (이벤트 작성)
 * API: POST /api/admin/events
 * Standards: GLEC-Design-System-Standards.md (Form, Button)
 *
 * Features:
 * - Create new event form
 * - Title, description (TipTap editor), slug (auto-generated)
 * - Start/end date & time
 * - Location, location details
 * - Thumbnail URL, max participants
 * - Status selection (DRAFT, PUBLISHED)
 * - Submit and validation
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  location_details: string;
  thumbnail_url: string;
  max_participants: string;
  meeting_type: 'OFFLINE' | 'WEBINAR';
  status: 'DRAFT' | 'PUBLISHED';
}

export default function EventCreatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    location_details: '',
    thumbnail_url: '',
    max_participants: '',
    meeting_type: 'OFFLINE',
    status: 'DRAFT',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate slug from title
   */
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  /**
   * Handle form field change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug when title changes
    if (name === 'title') {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.title.trim()) {
      setError('이벤트 제목을 입력해주세요.');
      return;
    }
    if (!formData.description.trim()) {
      setError('이벤트 설명을 입력해주세요.');
      return;
    }
    if (!formData.start_date) {
      setError('시작 일시를 입력해주세요.');
      return;
    }
    if (!formData.end_date) {
      setError('종료 일시를 입력해주세요.');
      return;
    }
    if (!formData.location.trim()) {
      setError('장소를 입력해주세요.');
      return;
    }

    // Validate date range
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate < startDate) {
      setError('종료 일시는 시작 일시보다 늦어야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          location: formData.location,
          location_details: formData.location_details || undefined,
          thumbnail_url: formData.thumbnail_url || undefined,
          max_participants: formData.max_participants ? parseInt(formData.max_participants, 10) : undefined,
          meeting_type: formData.meeting_type,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create event');
      }

      alert('이벤트가 생성되었습니다.');
      router.push('/admin/events');
    } catch (err) {
      console.error('[Event Create] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">새 이벤트 작성</h1>
            <p className="mt-2 text-gray-600">이벤트 정보를 입력하고 발행하세요</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            이벤트 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="이벤트 제목을 입력하세요"
          />
          <p className="mt-1 text-sm text-gray-500">{formData.title.length}/200자</p>
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
            URL 슬러그 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            maxLength={200}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="auto-generated-from-title"
          />
          <p className="mt-1 text-sm text-gray-500">자동 생성됨 (수정 가능)</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            이벤트 설명 <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            content={formData.description}
            onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
            placeholder="이벤트 상세 설명을 입력하세요..."
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
              시작 일시 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
              종료 일시 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
            장소 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            maxLength={200}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="예: 서울 강남구 글렉 본사"
          />
        </div>

        {/* Location Details */}
        <div>
          <label htmlFor="location_details" className="block text-sm font-semibold text-gray-700 mb-2">
            장소 상세 정보 (선택)
          </label>
          <textarea
            id="location_details"
            name="location_details"
            value={formData.location_details}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="주소, 교통편, 주차 안내 등 상세 정보를 입력하세요"
          />
        </div>

        {/* Thumbnail URL */}
        <div>
          <label htmlFor="thumbnail_url" className="block text-sm font-semibold text-gray-700 mb-2">
            썸네일 URL (선택)
          </label>
          <input
            type="url"
            id="thumbnail_url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://example.com/event-thumbnail.jpg"
          />
        </div>

        {/* Max Participants */}
        <div>
          <label htmlFor="max_participants" className="block text-sm font-semibold text-gray-700 mb-2">
            최대 참가 인원 (선택)
          </label>
          <input
            type="number"
            id="max_participants"
            name="max_participants"
            value={formData.max_participants}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="제한 없음 (미입력 시)"
          />
          <p className="mt-1 text-sm text-gray-500">미입력 시 인원 제한 없음</p>
        </div>

        {/* Meeting Type */}
        <div>
          <label htmlFor="meeting_type" className="block text-sm font-semibold text-gray-700 mb-2">
            이벤트 유형 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="meeting_type"
                value="OFFLINE"
                checked={formData.meeting_type === 'OFFLINE'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">오프라인 (현장 이벤트)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="meeting_type"
                value="WEBINAR"
                checked={formData.meeting_type === 'WEBINAR'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">웨비나 (온라인 Zoom)</span>
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            ℹ️ 웨비나를 선택하면 Zoom 웨비나가 자동으로 생성되며, 참가자에게 자동으로 초대장이 발송됩니다.
          </p>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
            상태 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="DRAFT"
                checked={formData.status === 'DRAFT'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">작성중 (임시저장)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="PUBLISHED"
                checked={formData.status === 'PUBLISHED'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">모집중 (즉시 공개)</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Link
            href="/admin/events"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
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
                저장 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formData.status === 'PUBLISHED' ? '발행하기' : '임시저장'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
