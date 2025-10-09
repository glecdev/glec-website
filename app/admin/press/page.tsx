/**
 * Admin Press List Page - Tab Structure with Insights
 *
 * Based on: FR-ADMIN-003 (공지사항 목록 조회 - PRESS 카테고리 전용)
 * API: GET/POST/PUT/DELETE /api/admin/notices
 * Pattern: Tab Structure Standard (Insights + Management)
 * Standards: GLEC-Design-System-Standards.md (Tabs, Table, Pagination, Filter, Modal)
 *
 * Structure:
 * - Tab 1: 인사이트 (통계 분석)
 * - Tab 2: 관리 (CRUD 기능)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TabLayout, { TabType } from '@/components/admin/TabLayout';
import {
  OverviewCards,
  StatusDistribution,
  TopViewedList,
  RecentPublishedList,
} from '@/components/admin/InsightsCards';
import {
  calculateBaseStats,
  getTopViewed,
  getRecentPublished,
  type BaseStats,
} from '@/lib/admin-insights';

interface Notice {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category: 'GENERAL' | 'PRODUCT' | 'EVENT' | 'PRESS';
  thumbnailUrl: string | null;
  viewCount: number;
  publishedAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

interface ApiResponse {
  success: boolean;
  data: Notice[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

interface PressStats extends BaseStats {
  recentPublished: Notice[];
  topViewed: Notice[];
}

export default function AdminPressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('management');

  // Data states
  const [pressReleases, setPressReleases] = useState<Notice[]>([]);
  const [allPressReleases, setAllPressReleases] = useState<Notice[]>([]); // For insights
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<PressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPress, setEditingPress] = useState<Notice | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter states (from URL query params)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  // Form states (지식센터 패턴 적용)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'DRAFT' as Notice['status'],
    thumbnailUrl: '',
  });

  /**
   * Fetch data based on active tab
   */
  useEffect(() => {
    if (activeTab === 'management') {
      fetchPressReleases();
    } else if (activeTab === 'insights') {
      fetchAllPressReleasesForInsights();
    }
  }, [activeTab, page, status, search]);

  const fetchPressReleases = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (status) params.append('status', status);
      params.append('category', 'PRESS'); // Fixed filter
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/notices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        // Check for authentication errors
        if (result.error?.code === 'INVALID_TOKEN' || result.error?.code === 'UNAUTHORIZED') {
          localStorage.removeItem('admin_token');
          router.push('/admin/login?expired=true');
          return;
        }
        throw new Error(result.error?.message || 'Failed to fetch notices');
      }

      setPressReleases(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('[Press List] Fetch error:', err);

      // Check if error message contains token-related keywords
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login?expired=true');
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch all press releases for insights (no pagination)
   */
  const fetchAllPressReleasesForInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Fetch all press releases (max 1000)
      const response = await fetch('/api/admin/notices?per_page=1000&category=PRESS', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch press releases');
      }

      setAllPressReleases(result.data);
      calculateStats(result.data);
    } catch (err) {
      console.error('[Press Insights] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate statistics for insights
   */
  const calculateStats = (pressList: Notice[]) => {
    const baseStats = calculateBaseStats(pressList);
    const topViewed = getTopViewed(pressList, 5);
    const recentPublished = getRecentPublished(pressList, 5);

    setStats({
      ...baseStats,
      recentPublished,
      topViewed,
    });
  };

  /**
   * Update URL with filter params
   */
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/press?${params.toString()}`);
  };

  /**
   * Handle pagination
   */
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/press?${params.toString()}`);
  };

  /**
   * Open create modal (지식센터 패턴)
   */
  const openCreateModal = () => {
    setEditingPress(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'DRAFT',
      thumbnailUrl: '',
    });
    setIsModalOpen(true);
  };

  /**
   * Open edit modal (지식센터 패턴)
   */
  const openEditModal = (press: Notice) => {
    setEditingPress(press);
    setFormData({
      title: press.title,
      slug: press.slug,
      content: press.content,
      excerpt: press.excerpt || '',
      status: press.status,
      thumbnailUrl: press.thumbnailUrl || '',
    });
    setIsModalOpen(true);
  };

  /**
   * Handle form submit (create or update) - 지식센터 패턴
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      const token = localStorage.getItem('admin_token');
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        status: formData.status,
        category: 'PRESS' as const, // Always PRESS category
        thumbnail_url: formData.thumbnailUrl || undefined,
      };

      let response;
      if (editingPress) {
        // Update
        response = await fetch(`/api/admin/notices?id=${editingPress.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        response = await fetch('/api/admin/notices', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to save notice');
      }

      alert(editingPress ? '보도자료가 수정되었습니다.' : '보도자료가 추가되었습니다.');
      setIsModalOpen(false);
      fetchPressReleases(); // Refresh list (지식센터 패턴)
    } catch (err) {
      console.error('[Save Press] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to save notice');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle delete (confirmation)
   */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 보도자료를 삭제하시겠습니까?\n\n(Soft Delete - 복구 가능)`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/notices?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        alert('보도자료가 삭제되었습니다.');
        fetchPressReleases(); // Refresh list
      } else {
        const result = await response.json();
        throw new Error(result.error?.message || 'Delete failed');
      }
    } catch (err) {
      console.error('[Delete Press] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete notice');
    }
  };

  /**
   * Status badge color
   */
  const getStatusBadge = (status: Notice['status']) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      PUBLISHED: 'bg-green-100 text-green-700',
      ARCHIVED: 'bg-amber-100 text-amber-700',
    };
    const labels = {
      DRAFT: '작성중',
      PUBLISHED: '발행',
      ARCHIVED: '보관',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  /**
   * Format date
   */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Insights Content
  const insightsContent = (
    <div className="space-y-6">
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">통계 분석 중...</p>
        </div>
      ) : stats ? (
        <>
          <OverviewCards stats={stats} itemLabel="보도자료" />

          <StatusDistribution stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopViewedList items={stats.topViewed} title="조회수 상위 5개" emptyMessage="데이터 없음" />
            <RecentPublishedList
              items={stats.recentPublished}
              title="최근 발행 5개"
              emptyMessage="데이터 없음"
            />
          </div>
        </>
      ) : null}
    </div>
  );

  // Management Content
  const managementContent = (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          새 보도자료 작성
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => updateFilters('search', e.target.value)}
              placeholder="제목으로 검색..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => updateFilters('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="DRAFT">작성중</option>
              <option value="PUBLISHED">발행</option>
              <option value="ARCHIVED">보관</option>
            </select>
          </div>

        </div>

        {/* Category Info Badge */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">필터:</span>
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
            보도자료 (PRESS)
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
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
      )}

      {/* Error State */}
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

      {/* Notice Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      발행일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      조회수
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pressReleases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        보도자료가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pressReleases.map((press) => (
                      <tr key={press.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium">{press.title}</p>
                          {press.excerpt && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{press.excerpt}</p>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">{getStatusBadge(press.status)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(press.publishedAt)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{press.viewCount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* 지식센터 패턴: 버튼 onClick */}
                            <button
                              onClick={() => openEditModal(press)}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="수정"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(press.id, press.title)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold">{meta.total}</span>개 중{' '}
                <span className="font-semibold">{(meta.page - 1) * meta.per_page + 1}</span>-
                <span className="font-semibold">{Math.min(meta.page * meta.per_page, meta.total)}</span>개 표시
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(meta.page - 1)}
                  disabled={meta.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>

                {/* Page Numbers */}
                {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      pageNum === meta.page
                        ? 'bg-primary-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(meta.page + 1)}
                  disabled={meta.page === meta.total_pages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">보도자료 관리</h1>
        <p className="mt-2 text-gray-600">보도자료 통계 분석 및 콘텐츠 관리</p>
      </div>

      {/* Tabs */}
      <TabLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        insightsContent={insightsContent}
        managementContent={managementContent}
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPress ? '보도자료 수정' : '새 보도자료 작성'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  슬러그 (URL 경로) <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(예: "glec-website-open")</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  maxLength={200}
                  pattern="[a-z0-9-]+"
                  placeholder="glec-website-open"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  요약
                  <span className="text-xs text-gray-500 ml-2">(선택사항)</span>
                </label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  본문 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="modal-status" className="block text-sm font-medium text-gray-700 mb-1">
                  상태 <span className="text-red-500">*</span>
                </label>
                <select
                  id="modal-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Notice['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="DRAFT">작성중</option>
                  <option value="PUBLISHED">발행</option>
                  <option value="ARCHIVED">보관</option>
                </select>
              </div>

              {/* Category (PRESS - Fixed, Display Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                    보도자료 (PRESS)
                  </span>
                  <p className="text-xs text-gray-500 mt-1">카테고리는 자동으로 PRESS로 설정됩니다.</p>
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  썸네일 URL
                  <span className="text-xs text-gray-500 ml-2">(선택사항)</span>
                </label>
                <input
                  type="url"
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      저장 중...
                    </>
                  ) : (
                    editingPress ? '수정' : '추가'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
