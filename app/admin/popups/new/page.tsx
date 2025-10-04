/**
 * Admin Popup Create Page
 *
 * Purpose: 새 팝업 생성
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPopupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    isActive: true,
    displayType: 'modal' as 'modal' | 'banner' | 'corner',
    position: 'center',
    width: 500,
    height: 600,
    showOnce: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/popups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert('팝업이 생성되었습니다.');
        router.push('/admin/popups');
      } else {
        alert(data.error?.message || '생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('[Popup Create] Error:', error);
      alert('생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/popups" className="text-primary-500 hover:underline mb-4 inline-block">
          ← 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold">새 팝업 만들기</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="팝업 제목"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 (HTML) *
          </label>
          <textarea
            required
            rows={6}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="<p>팝업 내용</p>"
          />
        </div>

        {/* Display Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            표시 유형 *
          </label>
          <select
            value={formData.displayType}
            onChange={(e) => setFormData({ ...formData, displayType: e.target.value as any })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="modal">모달 (중앙 팝업)</option>
            <option value="banner">배너 (상단/하단)</option>
            <option value="corner">코너 (작은 팝업)</option>
          </select>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            위치
          </label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="center">중앙</option>
            <option value="top">상단</option>
            <option value="bottom">하단</option>
            <option value="top-right">우측 상단</option>
            <option value="bottom-right">우측 하단</option>
          </select>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              너비 (px)
            </label>
            <input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              높이 (px)
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Link */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              링크 URL
            </label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              링크 텍스트
            </label>
            <input
              type="text"
              value={formData.linkText}
              onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="자세히 보기"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작일시 *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료일시 *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">즉시 활성화</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.showOnce}
              onChange={(e) => setFormData({ ...formData, showOnce: e.target.checked })}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">오늘 하루 보지 않기 기능 활성화</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '생성 중...' : '팝업 생성'}
          </button>
          <Link
            href="/admin/popups"
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
