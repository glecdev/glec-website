/**
 * Edit Popup Page
 *
 * Purpose: Update existing popup configuration in admin
 * Features:
 * - Pre-fill form with existing popup data
 * - All popup fields editable
 * - PUT request to /api/admin/popups
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PopupFormData {
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  isActive: boolean;
  displayType: 'modal' | 'banner' | 'corner';
  position: string;
  width: number;
  height: number;
  showOnce: boolean;
  startDate: string;
  endDate: string;
}

function EditPopupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const popupId = searchParams.get('id');

  const [formData, setFormData] = useState<PopupFormData>({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    isActive: true,
    displayType: 'modal',
    position: 'center',
    width: 500,
    height: 600,
    showOnce: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!popupId) {
      setError('팝업 ID가 없습니다');
      setFetching(false);
      return;
    }

    // Fetch existing popup data
    fetch(`/api/admin/popups?id=${popupId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          const popup = Array.isArray(result.data)
            ? result.data.find((p: any) => p.id === popupId)
            : result.data;

          if (popup) {
            setFormData({
              title: popup.title,
              content: popup.content,
              imageUrl: popup.imageUrl || '',
              linkUrl: popup.linkUrl || '',
              linkText: popup.linkText || '',
              isActive: popup.isActive,
              displayType: popup.displayType,
              position: popup.position,
              width: popup.width,
              height: popup.height,
              showOnce: popup.showOnce,
              startDate: new Date(popup.startDate).toISOString().slice(0, 16),
              endDate: new Date(popup.endDate).toISOString().slice(0, 16),
            });
          } else {
            setError('팝업을 찾을 수 없습니다');
          }
        } else {
          setError('팝업 데이터를 불러올 수 없습니다');
        }
        setFetching(false);
      })
      .catch((err) => {
        console.error('[Edit Popup] Fetch error:', err);
        setError('팝업 데이터 로드 실패');
        setFetching(false);
      });
  }, [popupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/popups?id=${popupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrl || null,
          linkUrl: formData.linkUrl || null,
          linkText: formData.linkText || null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('팝업이 수정되었습니다');
        router.push('/admin/popups');
      } else {
        setError(result.error?.message || '팝업 수정 실패');
      }
    } catch (err) {
      console.error('[Edit Popup] Submit error:', err);
      setError('팝업 수정 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
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
            <p className="text-gray-600">팝업 데이터 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href="/admin/popups"
              className="inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/admin/popups"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="뒤로 가기"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">팝업 수정</h1>
        </div>
        <p className="text-gray-600">팝업 정보를 수정합니다</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="팝업 제목"
          />
        </div>

        {/* Content (HTML) */}
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            내용 (HTML) <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            required
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            placeholder="<p>팝업 내용을 HTML로 작성하세요</p>"
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-700 mb-2">
            이미지 URL (선택)
          </label>
          <input
            type="url"
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://example.com/image.png"
          />
        </div>

        {/* Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="linkUrl" className="block text-sm font-semibold text-gray-700 mb-2">
              링크 URL (선택)
            </label>
            <input
              type="url"
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label htmlFor="linkText" className="block text-sm font-semibold text-gray-700 mb-2">
              링크 텍스트 (선택)
            </label>
            <input
              type="text"
              id="linkText"
              value={formData.linkText}
              onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="자세히 보기"
            />
          </div>
        </div>

        {/* Display Type */}
        <div>
          <label htmlFor="displayType" className="block text-sm font-semibold text-gray-700 mb-2">
            표시 유형 <span className="text-red-500">*</span>
          </label>
          <select
            id="displayType"
            required
            value={formData.displayType}
            onChange={(e) =>
              setFormData({ ...formData, displayType: e.target.value as 'modal' | 'banner' | 'corner' })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="modal">Modal (중앙 오버레이)</option>
            <option value="banner">Banner (상단/하단 배너)</option>
            <option value="corner">Corner (코너 팝업)</option>
          </select>
        </div>

        {/* Position */}
        <div>
          <label htmlFor="position" className="block text-sm font-semibold text-gray-700 mb-2">
            위치 <span className="text-red-500">*</span>
          </label>
          <select
            id="position"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="center">Center (중앙)</option>
            <option value="top">Top (상단)</option>
            <option value="bottom">Bottom (하단)</option>
            <option value="left">Left (왼쪽)</option>
            <option value="right">Right (오른쪽)</option>
            <option value="top-left">Top Left (왼쪽 상단)</option>
            <option value="top-right">Top Right (오른쪽 상단)</option>
            <option value="bottom-left">Bottom Left (왼쪽 하단)</option>
            <option value="bottom-right">Bottom Right (오른쪽 하단)</option>
          </select>
        </div>

        {/* Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="width" className="block text-sm font-semibold text-gray-700 mb-2">
              너비 (px)
            </label>
            <input
              type="number"
              id="width"
              required
              min={100}
              max={1920}
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-sm font-semibold text-gray-700 mb-2">
              높이 (px)
            </label>
            <input
              type="number"
              id="height"
              required
              min={100}
              max={1080}
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
              시작일 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="startDate"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
              종료일 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="endDate"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">활성화</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.showOnce}
              onChange={(e) => setFormData({ ...formData, showOnce: e.target.checked })}
              className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">오늘 하루 보지 않기 활성화</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href="/admin/popups"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '저장 중...' : '수정'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditPopupPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center">
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
              <p className="text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <EditPopupForm />
    </Suspense>
  );
}
