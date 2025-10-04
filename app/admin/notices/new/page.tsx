/**
 * Admin Notice Create Page
 *
 * Based on: FR-ADMIN-004 (공지사항 작성)
 * API: POST /api/admin/notices
 * Standards: GLEC-Design-System-Standards.md (Form, Button)
 *
 * Features:
 * - Create new notice form
 * - Title, content (textarea for MVP), excerpt
 * - Category, status selection
 * - Thumbnail URL input
 * - Submit and validation
 *
 * TODO Phase 7: Replace textarea with TipTap WYSIWYG editor
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface NoticeFormData {
  title: string;
  content: string;
  excerpt: string;
  category: 'GENERAL' | 'PRODUCT' | 'EVENT' | 'PRESS';
  status: 'DRAFT' | 'PUBLISHED';
  thumbnail_url: string;
}

export default function NoticeCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get category from query param (e.g., ?category=PRESS)
  const categoryParam = searchParams.get('category');
  const initialCategory =
    categoryParam === 'PRESS' ||
    categoryParam === 'PRODUCT' ||
    categoryParam === 'EVENT' ||
    categoryParam === 'GENERAL'
      ? categoryParam
      : 'GENERAL';

  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    excerpt: '',
    category: initialCategory,
    status: 'DRAFT',
    thumbnail_url: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
   * Handle form submit
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

      const response = await fetch('/api/admin/notices', {
        method: 'POST',
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
        throw new Error(result.error?.message || 'Failed to create notice');
      }

      alert('공지사항이 생성되었습니다.');

      // Redirect based on category
      if (formData.category === 'PRESS') {
        router.push('/admin/press');
      } else {
        router.push('/admin/notices');
      }
    } catch (err) {
      console.error('[Notice Create] Error:', err);
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
            href={formData.category === 'PRESS' ? '/admin/press' : '/admin/notices'}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {formData.category === 'PRESS' ? '새 보도자료 작성' : '새 공지사항 작성'}
            </h1>
            <p className="mt-2 text-gray-600">
              {formData.category === 'PRESS' ? '보도자료 정보를 입력하고 발행하세요' : '공지사항 정보를 입력하고 발행하세요'}
            </p>
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
              <span className="text-gray-700">발행 (즉시 공개)</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Link
            href={formData.category === 'PRESS' ? '/admin/press' : '/admin/notices'}
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
