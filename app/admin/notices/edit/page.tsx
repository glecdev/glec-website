/**
 * Admin Notice Edit Page
 *
 * Based on: FR-ADMIN-005 (공지사항 수정), FR-ADMIN-006 (공지사항 삭제)
 * API: GET/PUT/DELETE /api/admin/notices?id=xxx
 * Standards: GLEC-Design-System-Standards.md (Form, Button)
 *
 * Features:
 * - Load existing notice by ID (query parameter)
 * - Edit notice form (same as create page)
 * - Update notice (PUT)
 * - Delete notice (DELETE with confirmation)
 *
 * TODO Phase 7: Replace textarea with TipTap WYSIWYG editor
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface Notice {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: 'GENERAL' | 'PRODUCT' | 'EVENT' | 'PRESS';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  thumbnailUrl: string | null;
}

interface NoticeFormData {
  title: string;
  content: string;
  excerpt: string;
  category: 'GENERAL' | 'PRODUCT' | 'EVENT' | 'PRESS';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  thumbnail_url: string;
}

export default function NoticeEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noticeId = searchParams.get('id');

  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: 'GENERAL',
    status: 'DRAFT',
    thumbnail_url: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch notice data on mount
   */
  useEffect(() => {
    if (!noticeId) {
      setError('공지사항 ID가 필요합니다.');
      setIsLoading(false);
      return;
    }

    fetchNotice();
  }, [noticeId]);

  const fetchNotice = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/notices?id=${noticeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch notice');
      }

      const notice: Notice = result.data;
      setFormData({
        title: notice.title,
        content: notice.content,
        excerpt: notice.excerpt || '',
        category: notice.category,
        status: notice.status,
        thumbnail_url: notice.thumbnailUrl || '',
      });
    } catch (err) {
      console.error('[Notice Edit] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle form field change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submit (update)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    if (formData.title.length > 200) {
      setError('제목은 200자 이하로 입력해주세요.');
      return;
    }
    if (formData.excerpt.length > 300) {
      setError('발췌문은 300자 이하로 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/notices?id=${noticeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || undefined,
          category: formData.category,
          status: formData.status,
          thumbnail_url: formData.thumbnail_url || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update notice');
      }

      alert('공지사항이 수정되었습니다.');
      router.push('/admin/notices');
    } catch (err) {
      console.error('[Notice Update] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async () => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?\n\n(Soft Delete - 복구 가능)')) {
      return;
    }

    try {
      setIsDeleting(true);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/notices?id=${noticeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        alert('공지사항이 삭제되었습니다.');
        router.push('/admin/notices');
      } else {
        const result = await response.json();
        throw new Error(result.error?.message || 'Delete failed');
      }
    } catch (err) {
      console.error('[Notice Delete] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete notice');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
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
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !formData.title) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-700 font-semibold">에러: {error}</p>
          </div>
          <Link
            href="/admin/notices"
            className="inline-block px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/notices"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">공지사항 수정</h1>
            <p className="mt-2 text-gray-600">공지사항 정보를 수정하고 저장하세요</p>
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
            제목 <span className="text-red-500">*</span>
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
            placeholder="공지사항 제목을 입력하세요"
          />
          <p className="mt-1 text-sm text-gray-500">{formData.title.length}/200자</p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="GENERAL">일반</option>
            <option value="PRODUCT">제품</option>
            <option value="EVENT">이벤트</option>
            <option value="PRESS">보도</option>
          </select>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            placeholder="공지사항 내용을 입력하세요..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-2">
            발췌문 (선택)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            maxLength={300}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="목록에 표시될 짧은 요약 (미입력 시 자동 생성)"
          />
          <p className="mt-1 text-sm text-gray-500">{formData.excerpt.length}/300자</p>
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
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-sm text-gray-500">
            이미지 URL을 입력하세요. (TODO Phase 7: 이미지 업로드 기능 추가)
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
              <span className="text-gray-700">작성중</span>
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
              <span className="text-gray-700">발행</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="ARCHIVED"
                checked={formData.status === 'ARCHIVED'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">보관</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          {/* Delete Button (Left) */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
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
                삭제 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                삭제
              </>
            )}
          </button>

          {/* Cancel & Update Buttons (Right) */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/notices"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
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
                  수정 저장
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
