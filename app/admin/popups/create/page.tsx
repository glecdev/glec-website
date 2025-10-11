/**
 * Admin Popup Create Page (New Premium Version)
 *
 * Purpose: 새 팝업 생성 with Premium Modal Design
 * Features:
 * - 실시간 미리보기
 * - 커스텀 배경색 선택
 * - 웹사이트 LaunchModal 스타일 지원
 * - Toast 알림
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Modal } from '@/components/admin/ui/Modal';
import { useToast } from '@/components/admin/ui/Toast';

interface PopupFormData {
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  isActive: boolean;
  displayType: 'modal' | 'banner' | 'corner';
  // Custom styling
  headerClassName: string;
  bodyClassName: string;
  backdropClassName: string;
  // Positioning
  position: string;
  size: string; // JSON: {width, height}
  zIndex: number;
  // Behavior
  showOncePerDay: boolean;
  startDate: string;
  endDate: string;
  backgroundColor: string;
}

export default function CreatePopupPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState<PopupFormData>({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '자세히 보기',
    isActive: false,
    displayType: 'modal',
    // Custom styling (based on LaunchModal)
    headerClassName: 'relative bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 text-white p-8 rounded-t-2xl overflow-hidden',
    bodyClassName: 'p-8',
    backdropClassName: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in',
    // Positioning
    position: JSON.stringify({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
    size: JSON.stringify({ width: '600px', height: 'auto' }),
    zIndex: 1000,
    // Behavior
    showOncePerDay: true,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    backgroundColor: '#ffffff',
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
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          imageUrl: formData.imageUrl || null,
          linkUrl: formData.linkUrl || null,
          displayType: formData.displayType,
          isActive: formData.isActive,
          startDate: formData.startDate,
          endDate: formData.endDate,
          zIndex: formData.zIndex,
          showOncePerDay: formData.showOncePerDay,
          position: formData.position,
          size: formData.size,
          backgroundColor: formData.backgroundColor,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.showSuccess('팝업 생성 완료', '팝업이 성공적으로 생성되었습니다.');
        router.push('/admin/popups');
      } else {
        toast.showError('생성 실패', data.error?.message || '생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('[Popup Create] Error:', error);
      toast.showError('생성 실패', '서버 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset color schemes
  const colorPresets = [
    {
      name: 'Primary (기본)',
      headerClassName: 'relative bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 text-white p-8 rounded-t-2xl overflow-hidden',
      bodyClassName: 'p-8',
      backdropClassName: 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in',
    },
    {
      name: 'Success (성공)',
      headerClassName: 'relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white p-8 rounded-t-2xl overflow-hidden',
      bodyClassName: 'p-8 bg-green-50',
      backdropClassName: 'fixed inset-0 bg-green-900/50 backdrop-blur-sm z-50 animate-fade-in',
    },
    {
      name: 'Warning (주의)',
      headerClassName: 'relative bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white p-8 rounded-t-2xl overflow-hidden',
      bodyClassName: 'p-8 bg-amber-50',
      backdropClassName: 'fixed inset-0 bg-orange-900/50 backdrop-blur-sm z-50 animate-fade-in',
    },
    {
      name: 'Danger (위험)',
      headerClassName: 'relative bg-gradient-to-br from-red-500 via-red-600 to-rose-600 text-white p-8 rounded-t-2xl overflow-hidden',
      bodyClassName: 'p-8 bg-red-50',
      backdropClassName: 'fixed inset-0 bg-red-900/50 backdrop-blur-sm z-50 animate-fade-in',
    },
    {
      name: 'Pink-Purple (핑크)',
      headerClassName: 'relative bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white p-8 rounded-t-2xl overflow-hidden',
      bodyClassName: 'p-8 bg-pink-50',
      backdropClassName: 'fixed inset-0 bg-purple-900/60 backdrop-blur-md z-50 animate-fade-in',
    },
    {
      name: 'Teal-Cyan (청록)',
      headerClassName: 'relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-8 rounded-t-2xl overflow-hidden',
      bodyClassName: 'p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50',
      backdropClassName: 'fixed inset-0 bg-teal-900/50 backdrop-blur-sm z-50 animate-fade-in',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/popups" className="text-primary-500 hover:underline mb-4 inline-block flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          팝업 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">새 팝업 만들기</h1>
        <p className="text-gray-600 mt-2">웹사이트에 표시할 팝업을 생성합니다. 실시간 미리보기로 디자인을 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팝업 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="예: GLEC Carbon API 런칭 이벤트"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팝업 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    placeholder="HTML 또는 텍스트를 입력하세요.&#10;&#10;<p>ISO-14083 국제표준 기반 탄소배출 측정 API</p>&#10;<ul>&#10;  <li>무료 API 크레딧 제공</li>&#10;  <li>선착순 100명 한정</li>&#10;</ul>"
                  />
                  <p className="text-xs text-gray-500 mt-1">HTML 태그 사용 가능</p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 URL (선택)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      링크 URL (선택)
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="자세히 보기"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Design */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">디자인</h2>

              <div className="space-y-4">
                {/* Color Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    색상 테마 선택
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          headerClassName: preset.headerClassName,
                          bodyClassName: preset.bodyClassName,
                          backdropClassName: preset.backdropClassName,
                        })}
                        className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                          formData.headerClassName === preset.headerClassName
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{preset.name}</span>
                          {formData.headerClassName === preset.headerClassName && (
                            <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="h-6 rounded" style={{
                          background: preset.headerClassName.includes('pink') ? 'linear-gradient(to right, #ec4899, #a855f7)' :
                                      preset.headerClassName.includes('teal') ? 'linear-gradient(to right, #14b8a6, #06b6d4)' :
                                      preset.headerClassName.includes('green') ? 'linear-gradient(to bottom right, #10b981, #059669)' :
                                      preset.headerClassName.includes('yellow') ? 'linear-gradient(to bottom right, #eab308, #f97316)' :
                                      preset.headerClassName.includes('red') ? 'linear-gradient(to bottom right, #ef4444, #f43f5e)' :
                                      'linear-gradient(to bottom right, #0600f7, #9333ea)'
                        }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    표시 유형
                  </label>
                  <select
                    value={formData.displayType}
                    onChange={(e) => setFormData({ ...formData, displayType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="modal">모달 (중앙 팝업)</option>
                    <option value="banner">배너 (상단/하단)</option>
                    <option value="corner">코너 (작은 팝업)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">노출 기간</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일시 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일시 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">옵션</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">즉시 활성화</span>
                    <p className="text-xs text-gray-500">체크 시 저장 즉시 웹사이트에 표시됩니다</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOncePerDay}
                    onChange={(e) => setFormData({ ...formData, showOncePerDay: e.target.checked })}
                    className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">오늘 하루 보지 않기 기능</span>
                    <p className="text-xs text-gray-500">사용자가 닫으면 하루 동안 다시 표시하지 않습니다</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '생성 중...' : '팝업 생성'}
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                미리보기
              </button>
              <Link
                href="/admin/popups"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors inline-flex items-center"
              >
                취소
              </Link>
            </div>
          </form>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              팁
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>제목은 간결하고 명확하게 작성하세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>HTML 태그를 사용하여 내용을 꾸밀 수 있습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>색상 테마를 선택하여 팝업 분위기를 설정하세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>미리보기로 실제 화면을 확인하세요</span>
              </li>
            </ul>
          </div>

          {/* HTML Examples */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">HTML 예시</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">제목 + 리스트</p>
                <pre className="text-xs bg-gray-800 text-gray-300 p-3 rounded overflow-x-auto">
{`<h3>이벤트 특전</h3>
<ul>
  <li>무료 크레딧 제공</li>
  <li>30% 할인</li>
</ul>`}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">강조 텍스트</p>
                <pre className="text-xs bg-gray-800 text-gray-300 p-3 rounded overflow-x-auto">
{`<p><strong>선착순 100명</strong> 한정!</p>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={formData.title || '팝업 미리보기'}
        headerClassName={formData.headerClassName}
        bodyClassName={formData.bodyClassName}
        backdropClassName={formData.backdropClassName}
        size="md"
        footer={
          formData.linkUrl ? (
            <div className="flex justify-center">
              <a
                href={formData.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {formData.linkText || '자세히 보기'}
              </a>
            </div>
          ) : undefined
        }
      >
        <div dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-gray-500 text-center">내용을 입력하세요</p>' }} />
        {formData.imageUrl && (
          <img src={formData.imageUrl} alt={formData.title} className="w-full rounded-lg mt-4" />
        )}
      </Modal>
    </div>
  );
}
