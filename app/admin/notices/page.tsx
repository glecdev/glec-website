/**
 * Admin Notices Management Page - Tab Structure
 *
 * Based on: FR-ADMIN-003 (공지사항 목록 조회)
 * API: GET/POST/PUT/DELETE /api/admin/notices
 * Standards: GLEC-Design-System-Standards.md (Tabs, Table, Pagination, Modal)
 *
 * Structure:
 * - Tab 1: 인사이트 (통계 분석)
 * - Tab 2: 관리 (CRUD 기능)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import TabLayout, { TabType } from '@/components/admin/TabLayout';
import {
  OverviewCards,
  StatusDistribution,
  CategoryDistribution,
  TopViewedList,
  RecentPublishedList,
} from '@/components/admin/InsightsCards';
import {
  calculateBaseStats,
  getTopViewed,
  getRecentPublished,
  calculateCategoryDistribution,
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
  viewCount?: number; // Optional - may be undefined from API
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

interface NoticeStats extends BaseStats {
  categoryDistribution: Record<string, number>;
  recentPublished: Notice[];
  topViewed: Notice[];
}

export default function AdminNoticesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('management');

  // Data states
  const [notices, setNotices] = useState<Notice[]>([]);
  const [allNotices, setAllNotices] = useState<Notice[]>([]); // For insights
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<NoticeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter states (from URL query params)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'DRAFT' as Notice['status'],
    category: 'GENERAL' as Notice['category'],
    thumbnailUrl: '',
  });

  /**
   * Fetch notices from API
   */
  useEffect(() => {
    if (activeTab === 'management') {
      fetchNotices();
    } else if (activeTab === 'insights') {
      fetchAllNoticesForInsights();
    }
  }, [activeTab, page, status, category, search]);

  const fetchNotices = async () => {
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
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/notices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        if (result.error?.code === 'INVALID_TOKEN' || result.error?.code === 'UNAUTHORIZED') {
          localStorage.removeItem('admin_token');
          router.push('/admin/login?expired=true');
          return;
        }
        throw new Error(result.error?.message || 'Failed to fetch notices');
      }

      setNotices(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('[Notices List] Fetch error:', err);

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
   * Fetch all notices for insights (no pagination)
   */
  const fetchAllNoticesForInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Fetch all notices (max 1000)
      const response = await fetch('/api/admin/notices?per_page=1000', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch notices');
      }

      setAllNotices(result.data);
      calculateStats(result.data);
    } catch (err) {
      console.error('[Notices Insights] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate statistics for insights using utility functions
   */
  const calculateStats = (noticesList: Notice[]) => {
    const baseStats = calculateBaseStats(noticesList);
    const categoryDistribution = calculateCategoryDistribution(noticesList, ['GENERAL', 'PRODUCT', 'EVENT', 'PRESS']);
    const topViewed = getTopViewed(noticesList, 5);
    const recentPublished = getRecentPublished(noticesList, 5);

    setStats({
      ...baseStats,
      categoryDistribution,
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
    router.push(`/admin/notices?${params.toString()}`);
  };

  /**
   * Handle pagination
   */
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/notices?${params.toString()}`);
  };

  /**
   * Open create modal
   */
  const openCreateModal = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'DRAFT',
      category: 'GENERAL',
      thumbnailUrl: '',
    });
    setIsModalOpen(true);
  };

  /**
   * Open edit modal
   */
  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      slug: notice.slug,
      content: notice.content,
      excerpt: notice.excerpt || '',
      status: notice.status,
      category: notice.category,
      thumbnailUrl: notice.thumbnailUrl || '',
    });
    setIsModalOpen(true);
  };

  /**
   * Handle form submit (create or update)
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
        category: formData.category,
        thumbnail_url: formData.thumbnailUrl || undefined,
      };

      let response;
      if (editingNotice) {
        // Update
        response = await fetch(`/api/admin/notices?id=${editingNotice.id}`, {
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

      alert(editingNotice ? '공지사항이 수정되었습니다.' : '공지사항이 추가되었습니다.');
      setIsModalOpen(false);
      fetchNotices(); // Refresh list
    } catch (err) {
      console.error('[Save Notice] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to save notice');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle delete (confirmation)
   */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 공지사항을 삭제하시겠습니까?\n\n(Soft Delete - 복구 가능)`)) {
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

      if (response.status === 204 || response.ok) {
        alert('공지사항이 삭제되었습니다.');
        fetchNotices(); // Refresh list
      } else {
        const result = await response.json();
        throw new Error(result.error?.message || 'Delete failed');
      }
    } catch (err) {
      console.error('[Delete Notice] Error:', err);
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
   * Category badge color
   */
  const getCategoryBadge = (category: Notice['category']) => {
    const styles = {
      GENERAL: 'bg-blue-100 text-blue-700',
      PRODUCT: 'bg-purple-100 text-purple-700',
      EVENT: 'bg-pink-100 text-pink-700',
      PRESS: 'bg-indigo-100 text-indigo-700',
    };
    const labels = {
      GENERAL: '일반',
      PRODUCT: '제품',
      EVENT: '이벤트',
      PRESS: '보도',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${styles[category]}`}>
        {labels[category]}
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

  /**
   * Enhanced CSV Export Function
   */
  const exportToCSV = () => {
    if (!stats || !allNotices) return;

    try {
      const sections: string[] = [];
      const categoryLabels = {
        GENERAL: '일반',
        PRODUCT: '제품',
        EVENT: '이벤트',
        PRESS: '보도'
      };

      // ============================================================
      // 1. 메타 정보
      // ============================================================
      sections.push('=== GLEC 공지사항 통계 리포트 ===');
      sections.push(`생성일시,${new Date().toLocaleString('ko-KR')}`);
      sections.push(`총 공지사항 수,${stats.totalItems}`);
      sections.push('');

      // ============================================================
      // 2. 주요 통계
      // ============================================================
      sections.push('=== 주요 통계 ===');
      sections.push('지표,값');
      sections.push(`전체 공지사항,${stats.totalItems}`);
      sections.push(`작성중,${stats.draftCount}`);
      sections.push(`발행됨,${stats.publishedCount}`);
      sections.push(`보관됨,${stats.archivedCount}`);
      sections.push(`총 조회수,${stats.totalViews}`);
      sections.push(`평균 조회수,${stats.avgViewsPerItem.toLocaleString()}`);
      sections.push('');

      // ============================================================
      // 3. 카테고리별 분포
      // ============================================================
      sections.push('=== 카테고리별 분포 ===');
      sections.push('카테고리,개수,비율(%)');
      Object.entries(stats.categoryDistribution).forEach(([category, count]) => {
        const percentage = stats.totalItems > 0 ? Math.round((count / stats.totalItems) * 100) : 0;
        sections.push(`${categoryLabels[category as Notice['category']]},${count},${percentage}`);
      });
      sections.push('');

      // ============================================================
      // 4. 조회수 상위 5개
      // ============================================================
      sections.push('=== 조회수 상위 5개 ===');
      sections.push('순위,제목,카테고리,조회수,게시일');
      stats.topViewed.forEach((notice, index) => {
        const publishedDate = notice.publishedAt ? formatDate(notice.publishedAt) : 'N/A';
        sections.push(`${index + 1},"${notice.title.replace(/"/g, '""')}",${categoryLabels[notice.category]},${notice.viewCount ?? 0},${publishedDate}`);
      });
      sections.push('');

      // ============================================================
      // 5. 최근 발행 5개
      // ============================================================
      sections.push('=== 최근 발행 5개 ===');
      sections.push('제목,카테고리,게시일');
      stats.recentPublished.forEach((notice) => {
        const publishedDate = notice.publishedAt ? formatDate(notice.publishedAt) : 'N/A';
        sections.push(`"${notice.title.replace(/"/g, '""')}",${categoryLabels[notice.category]},${publishedDate}`);
      });
      sections.push('');

      // ============================================================
      // 6. 전체 공지사항 목록
      // ============================================================
      sections.push('=== 전체 공지사항 목록 ===');
      sections.push('ID,제목,카테고리,상태,조회수,게시일');
      allNotices.forEach((notice) => {
        const publishedDate = notice.publishedAt ? formatDate(notice.publishedAt) : 'N/A';
        sections.push(`${notice.id},"${notice.title.replace(/"/g, '""')}",${categoryLabels[notice.category]},${notice.status},${notice.viewCount ?? 0},${publishedDate}`);
      });
      sections.push('');

      // ============================================================
      // 7. 리포트 끝
      // ============================================================
      sections.push('=== 리포트 끝 ===');
      sections.push(`생성 시스템,GLEC Admin - Notices`);
      sections.push(`데이터 소스,Neon PostgreSQL`);

      const csvData = sections.join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `glec-notices-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('공지사항 종합 리포트가 다운로드되었습니다', {
        duration: 3000,
        icon: '📥',
      });
    } catch (err) {
      console.error('[Notices] Failed to export CSV:', err);
      toast.error('CSV 내보내기 실패', {
        duration: 3000,
        icon: '❌',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Toast Container */}
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">공지사항 관리</h1>
        <p className="mt-2 text-gray-600">공지사항 통계 분석 및 콘텐츠 관리</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('insights')}
            className={`${
              activeTab === 'insights'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              인사이트
            </div>
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`${
              activeTab === 'management'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              관리
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content: Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* CSV Export Button */}
          {stats && !isLoading && (
            <div className="flex justify-end">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="CSV 다운로드"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>CSV 다운로드</span>
              </button>
            </div>
          )}

          {isLoading ? (
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
              <p className="text-gray-600">통계 분석 중...</p>
            </div>
          ) : stats ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">전체 공지사항</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">발행된 공지</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{stats.publishedCount}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 조회수</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalViews.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">평균 조회수</p>
                      <p className="text-3xl font-bold text-amber-600 mt-2">{stats.avgViewsPerItem.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Category Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">상태별 분포</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">작성중</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gray-500 transition-all"
                            style={{ width: `${stats.totalNotices > 0 ? (stats.draftCount / stats.totalNotices) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.draftCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">발행</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${stats.totalNotices > 0 ? (stats.publishedCount / stats.totalNotices) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.publishedCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">보관</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all"
                            style={{ width: `${stats.totalNotices > 0 ? (stats.archivedCount / stats.totalNotices) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.archivedCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 분포</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">일반</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${stats.totalNotices > 0 ? (stats.categoryDistribution.GENERAL / stats.totalNotices) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.categoryDistribution.GENERAL}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">제품</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 transition-all"
                            style={{ width: `${stats.totalNotices > 0 ? (stats.categoryDistribution.PRODUCT / stats.totalNotices) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.categoryDistribution.PRODUCT}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">이벤트</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-500 transition-all"
                            style={{ width: `${stats.totalNotices > 0 ? (stats.categoryDistribution.EVENT / stats.totalNotices) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.categoryDistribution.EVENT}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">보도</span>
                      <div className="flex items-center gap-3">
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all"
                            style={{ width: `${stats.totalNotices > 0 ? (stats.categoryDistribution.PRESS / stats.totalNotices) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{stats.categoryDistribution.PRESS}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Viewed & Recent Published */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">조회수 상위 5개</h3>
                  <div className="space-y-3">
                    {stats.topViewed.length === 0 ? (
                      <p className="text-gray-500 text-sm">데이터 없음</p>
                    ) : (
                      stats.topViewed.map((notice, index) => (
                        <div key={notice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                            <p className="text-sm text-gray-900 truncate">{notice.title}</p>
                          </div>
                          <span className="text-sm font-semibold text-purple-600 ml-3">{notice.viewCount.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 발행 5개</h3>
                  <div className="space-y-3">
                    {stats.recentPublished.length === 0 ? (
                      <p className="text-gray-500 text-sm">데이터 없음</p>
                    ) : (
                      stats.recentPublished.map((notice) => (
                        <div key={notice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">{notice.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(notice.publishedAt)}</p>
                          </div>
                          {getCategoryBadge(notice.category)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Tab Content: Management */}
      {activeTab === 'management' && (
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
              새 공지 작성
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

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => updateFilters('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">전체</option>
                  <option value="GENERAL">일반</option>
                  <option value="PRODUCT">제품</option>
                  <option value="EVENT">이벤트</option>
                  <option value="PRESS">보도</option>
                </select>
              </div>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                          카테고리
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
                      {notices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            공지사항이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        notices.map((notice) => (
                          <tr key={notice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="text-gray-900 font-medium">{notice.title}</p>
                              {notice.excerpt && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{notice.excerpt}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">{getCategoryBadge(notice.category)}</td>
                            <td className="px-6 py-4">{getStatusBadge(notice.status)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(notice.publishedAt)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{notice.viewCount.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(notice)}
                                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="수정"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(notice.id, notice.title)}
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
                    {Array.from({ length: Math.min(meta.total_pages, 5) }, (_, i) => i + 1).map((pageNum) => (
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
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
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

              {/* Category */}
              <div>
                <label htmlFor="modal-category" className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="modal-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Notice['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="GENERAL">일반</option>
                  <option value="PRODUCT">제품</option>
                  <option value="EVENT">이벤트</option>
                  <option value="PRESS">보도</option>
                </select>
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
                    editingNotice ? '수정' : '추가'
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
