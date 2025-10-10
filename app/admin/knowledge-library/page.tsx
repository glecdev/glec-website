/**
 * Admin Knowledge Library Page
 *
 * Purpose: Manage Knowledge Library Items (CRUD)
 * API: /api/admin/knowledge/library
 * Standards: GLEC-Design-System-Standards.md (Table, Pagination, Filter)
 *
 * Features:
 * - Paginated library list (20 items/page)
 * - Category filter (8 categories)
 * - File type filter (PDF, DOCX, XLSX, PPTX)
 * - Search by title
 * - Create/Edit/Delete operations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  KnowledgeLibraryItem,
  KnowledgeCategory,
  KNOWLEDGE_CATEGORY_LABELS,
} from '@/lib/types/knowledge';
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

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  data: KnowledgeLibraryItem[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

interface LibraryStats extends BaseStats {
  categoryDistribution: Record<string, number>;
  fileTypeDistribution: Record<string, number>;
  recentPublished: KnowledgeLibraryItem[];
  topViewed: KnowledgeLibraryItem[];
}

export default function AdminKnowledgeLibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('management');

  // Data states
  const [items, setItems] = useState<KnowledgeLibraryItem[]>([]);
  const [allItems, setAllItems] = useState<KnowledgeLibraryItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeLibraryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter states (from URL query params)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const category = searchParams.get('category') || '';
  const fileType = searchParams.get('fileType') || '';
  const search = searchParams.get('search') || '';

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL' as KnowledgeCategory,
    fileType: 'PDF' as KnowledgeLibraryItem['fileType'],
    fileSize: '',
    fileUrl: '',
    thumbnailUrl: '',
    tags: '',
  });

  /**
   * Fetch data based on active tab
   */
  useEffect(() => {
    if (activeTab === 'management') {
      fetchItems();
    } else if (activeTab === 'insights') {
      fetchAllItemsForInsights();
    }
  }, [activeTab, page, category, fileType, search]);

  const fetchItems = async () => {
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
      if (category) params.append('category', category);
      if (fileType) params.append('fileType', fileType);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/knowledge/library?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch library items');
      }

      setItems(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('[Knowledge Library] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch all items for insights
   */
  const fetchAllItemsForInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/knowledge/library?per_page=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch items');
      }

      // Convert to compatible format
      const itemsWithStats = result.data.map(item => ({
        ...item,
        status: 'PUBLISHED' as const,
        viewCount: item.downloadCount,
      }));

      setAllItems(result.data);
      calculateStats(itemsWithStats);
    } catch (err) {
      console.error('[Library Insights] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate statistics
   */
  const calculateStats = (itemsList: any[]) => {
    const baseStats = calculateBaseStats(itemsList);
    const categories = Object.keys(KNOWLEDGE_CATEGORY_LABELS);
    const categoryDistribution = calculateCategoryDistribution(itemsList, categories);

    const fileTypeDistribution = {
      PDF: itemsList.filter(i => i.fileType === 'PDF').length,
      DOCX: itemsList.filter(i => i.fileType === 'DOCX').length,
      XLSX: itemsList.filter(i => i.fileType === 'XLSX').length,
      PPTX: itemsList.filter(i => i.fileType === 'PPTX').length,
    };

    const topViewed = getTopViewed(itemsList, 5);
    const recentPublished = getRecentPublished(itemsList, 5);

    setStats({
      ...baseStats,
      categoryDistribution,
      fileTypeDistribution,
      topViewed: topViewed as KnowledgeLibraryItem[],
      recentPublished: recentPublished as KnowledgeLibraryItem[],
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
    router.push(`/admin/knowledge-library?${params.toString()}`);
  };

  /**
   * Handle pagination
   */
  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/knowledge-library?${params.toString()}`);
  };

  /**
   * Open create modal
   */
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'TECHNICAL',
      fileType: 'PDF',
      fileSize: '',
      fileUrl: '',
      thumbnailUrl: '',
      tags: '',
    });
    setIsModalOpen(true);
  };

  /**
   * Open edit modal
   */
  const openEditModal = (item: KnowledgeLibraryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      fileType: item.fileType,
      fileSize: item.fileSize,
      fileUrl: item.fileUrl,
      thumbnailUrl: item.thumbnailUrl || '',
      tags: item.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  /**
   * Handle form submit (create or update)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.fileUrl || !formData.fileSize) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      const token = localStorage.getItem('admin_token');
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (tagsArray.length === 0) {
        alert('최소 1개의 태그를 입력해주세요.');
        setIsSaving(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        fileType: formData.fileType,
        fileSize: formData.fileSize,
        fileUrl: formData.fileUrl,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        tags: tagsArray,
      };

      let response;
      if (editingItem) {
        // Update
        response = await fetch(`/api/admin/knowledge/library?id=${editingItem.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        response = await fetch('/api/admin/knowledge/library', {
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
        throw new Error(result.error?.message || 'Failed to save library item');
      }

      alert(editingItem ? '자료가 수정되었습니다.' : '자료가 추가되었습니다.');
      setIsModalOpen(false);
      fetchItems(); // Refresh list
    } catch (err) {
      console.error('[Save Library Item] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to save library item');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle delete (confirmation)
   */
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 자료를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/knowledge/library?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        alert('자료가 삭제되었습니다.');
        fetchItems(); // Refresh list
      } else {
        const result = await response.json();
        throw new Error(result.error?.message || 'Delete failed');
      }
    } catch (err) {
      console.error('[Delete Library Item] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete library item');
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  /**
   * Category badge
   */
  const getCategoryBadge = (cat: KnowledgeCategory) => {
    const colors: Record<string, string> = {
      TECHNICAL: 'bg-blue-100 text-blue-700',
      GUIDE: 'bg-green-100 text-green-700',
      NEWS: 'bg-purple-100 text-purple-700',
      CASE_STUDY: 'bg-pink-100 text-pink-700',
      TUTORIAL: 'bg-indigo-100 text-indigo-700',
      WHITEPAPER: 'bg-amber-100 text-amber-700',
      REPORT: 'bg-teal-100 text-teal-700',
      RESEARCH: 'bg-cyan-100 text-cyan-700',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${colors[cat]}`}>
        {KNOWLEDGE_CATEGORY_LABELS[cat]}
      </span>
    );
  };

  /**
   * File type badge
   */
  const getFileTypeBadge = (type: KnowledgeLibraryItem['fileType']) => {
    const colors: Record<string, string> = {
      PDF: 'bg-red-100 text-red-700',
      DOCX: 'bg-blue-100 text-blue-700',
      XLSX: 'bg-green-100 text-green-700',
      PPTX: 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${colors[type]}`}>
        {type}
      </span>
    );
  };

  /**
   * Enhanced CSV Export Function
   */
  const exportToCSV = () => {
    if (!stats || !allItems) return;

    try {
      const exportDate = new Date().toISOString();
      const sections: string[] = [];

      // ============================================================
      // 1. 메타 정보
      // ============================================================
      sections.push('=== GLEC 자료실 통계 리포트 ===');
      sections.push(`생성일시,${new Date().toLocaleString('ko-KR')}`);
      sections.push(`총 자료 수,${stats.totalItems}`);
      sections.push('');

      // ============================================================
      // 2. 주요 통계
      // ============================================================
      sections.push('=== 주요 통계 ===');
      sections.push('지표,값');
      sections.push(`전체 자료,${stats.totalItems}`);
      sections.push(`작성중,${stats.draftCount}`);
      sections.push(`발행됨,${stats.publishedCount}`);
      sections.push(`보관됨,${stats.archivedCount}`);
      sections.push(`총 다운로드 수,${stats.totalViews}`);
      sections.push(`평균 다운로드 수,${stats.avgViewsPerItem.toLocaleString()}`);
      sections.push('');

      // ============================================================
      // 3. 파일 유형별 분포
      // ============================================================
      sections.push('=== 파일 유형별 분포 ===');
      sections.push('유형,개수,비율(%)');
      Object.entries(stats.fileTypeDistribution).forEach(([type, count]) => {
        const percentage = stats.totalItems > 0 ? Math.round((count / stats.totalItems) * 100) : 0;
        sections.push(`${type},${count},${percentage}`);
      });
      sections.push('');

      // ============================================================
      // 4. 카테고리별 분포
      // ============================================================
      sections.push('=== 카테고리별 분포 ===');
      sections.push('카테고리,개수');
      Object.entries(stats.categoryDistribution).forEach(([category, count]) => {
        sections.push(`${KNOWLEDGE_CATEGORY_LABELS[category as KnowledgeCategory]},${count}`);
      });
      sections.push('');

      // ============================================================
      // 5. 다운로드 상위 5개
      // ============================================================
      sections.push('=== 다운로드 상위 5개 ===');
      sections.push('순위,제목,카테고리,파일유형,다운로드수,게시일');
      stats.topViewed.forEach((item, index) => {
        const publishedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ko-KR') : 'N/A';
        sections.push(`${index + 1},"${item.title.replace(/"/g, '""')}",${KNOWLEDGE_CATEGORY_LABELS[item.category]},${item.fileType},${item.downloadCount ?? 0},${publishedDate}`);
      });
      sections.push('');

      // ============================================================
      // 6. 최근 발행 5개
      // ============================================================
      sections.push('=== 최근 발행 5개 ===');
      sections.push('제목,카테고리,파일유형,게시일');
      stats.recentPublished.forEach((item) => {
        const publishedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ko-KR') : 'N/A';
        sections.push(`"${item.title.replace(/"/g, '""')}",${KNOWLEDGE_CATEGORY_LABELS[item.category]},${item.fileType},${publishedDate}`);
      });
      sections.push('');

      // ============================================================
      // 7. 전체 자료 목록
      // ============================================================
      sections.push('=== 전체 자료 목록 ===');
      sections.push('ID,제목,카테고리,파일유형,상태,다운로드수,파일크기,게시일');
      allItems.forEach((item) => {
        const publishedDate = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ko-KR') : 'N/A';
        sections.push(`${item.id},"${item.title.replace(/"/g, '""')}",${KNOWLEDGE_CATEGORY_LABELS[item.category]},${item.fileType},${item.status},${item.downloadCount ?? 0},${item.fileSize ?? 'N/A'},${publishedDate}`);
      });
      sections.push('');

      // ============================================================
      // 8. 리포트 끝
      // ============================================================
      sections.push('=== 리포트 끝 ===');
      sections.push(`생성 시스템,GLEC Admin - Knowledge Library`);
      sections.push(`데이터 소스,Neon PostgreSQL`);

      const csvData = sections.join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `glec-knowledge-library-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('자료실 종합 리포트가 다운로드되었습니다', {
        duration: 3000,
        icon: '📥',
      });
    } catch (err) {
      console.error('[Knowledge Library] Failed to export CSV:', err);
      toast.error('CSV 내보내기 실패', {
        duration: 3000,
        icon: '❌',
      });
    }
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
          {/* CSV Export Button */}
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

          <OverviewCards stats={stats} itemLabel="자료" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusDistribution stats={stats} />
            <CategoryDistribution
              distribution={stats.fileTypeDistribution}
              categories={[
                { key: 'PDF', label: 'PDF', color: 'bg-red-500' },
                { key: 'DOCX', label: 'DOCX', color: 'bg-blue-500' },
                { key: 'XLSX', label: 'XLSX', color: 'bg-green-500' },
                { key: 'PPTX', label: 'PPTX', color: 'bg-orange-500' },
              ]}
              totalItems={stats.totalItems}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopViewedList items={stats.topViewed} title="다운로드 상위 5개" emptyMessage="데이터 없음" />
            <RecentPublishedList
              items={stats.recentPublished}
              title="최근 발행 5개"
              emptyMessage="데이터 없음"
              renderBadge={(item) => getCategoryBadge(item.category)}
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
          자료 추가
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
              {Object.entries(KNOWLEDGE_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* File Type Filter */}
          <div>
            <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-1">
              파일 타입
            </label>
            <select
              id="fileType"
              value={fileType}
              onChange={(e) => updateFilters('fileType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="XLSX">XLSX</option>
              <option value="PPTX">PPTX</option>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-700 font-medium">에러: {error}</p>
          </div>
        </div>
      )}

      {/* Library Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      썸네일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      파일 타입
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      다운로드
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      발행일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        자료가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.fileSize}</p>
                        </td>
                        <td className="px-6 py-4">{getCategoryBadge(item.category)}</td>
                        <td className="px-6 py-4">{getFileTypeBadge(item.fileType)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.downloadCount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.publishedAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="수정"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.title)}
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
          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                총 <span className="font-semibold">{meta.total}</span>개 중{' '}
                <span className="font-semibold">{(meta.page - 1) * meta.perPage + 1}</span>-
                <span className="font-semibold">{Math.min(meta.page * meta.perPage, meta.total)}</span>개 표시
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
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                  disabled={meta.page === meta.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? '자료 수정' : '자료 추가'}
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

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="modal-category" className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="modal-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as KnowledgeCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(KNOWLEDGE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Type */}
              <div>
                <label htmlFor="modal-fileType" className="block text-sm font-medium text-gray-700 mb-1">
                  파일 타입 <span className="text-red-500">*</span>
                </label>
                <select
                  id="modal-fileType"
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value as KnowledgeLibraryItem['fileType'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="XLSX">XLSX</option>
                  <option value="PPTX">PPTX</option>
                </select>
              </div>

              {/* File Size */}
              <div>
                <label htmlFor="fileSize" className="block text-sm font-medium text-gray-700 mb-1">
                  파일 크기 <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(예: "2.5 MB")</span>
                </label>
                <input
                  type="text"
                  id="fileSize"
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  required
                  placeholder="2.5 MB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* File URL */}
              <div>
                <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  파일 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  required
                  placeholder="https://example.com/file.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
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
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  태그 <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(쉼표로 구분)</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  required
                  placeholder="ISO, 표준, 탄소배출"
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
                    editingItem ? '수정' : '추가'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Toast Container */}
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">자료실 관리</h1>
        <p className="mt-2 text-gray-600">자료실 통계 분석 및 콘텐츠 관리</p>
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? '자료 수정' : '자료 추가'}
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

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="modal-category" className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="modal-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as KnowledgeCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.entries(KNOWLEDGE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Type */}
              <div>
                <label htmlFor="modal-fileType" className="block text-sm font-medium text-gray-700 mb-1">
                  파일 타입 <span className="text-red-500">*</span>
                </label>
                <select
                  id="modal-fileType"
                  value={formData.fileType}
                  onChange={(e) => setFormData({ ...formData, fileType: e.target.value as KnowledgeLibraryItem['fileType'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="XLSX">XLSX</option>
                  <option value="PPTX">PPTX</option>
                </select>
              </div>

              {/* File Size */}
              <div>
                <label htmlFor="fileSize" className="block text-sm font-medium text-gray-700 mb-1">
                  파일 크기 <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(예: "2.5 MB")</span>
                </label>
                <input
                  type="text"
                  id="fileSize"
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  required
                  placeholder="2.5 MB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* File URL */}
              <div>
                <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  파일 URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  required
                  placeholder="https://example.com/file.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
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
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  태그 <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(쉼표로 구분)</span>
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  required
                  placeholder="ISO, 표준, 탄소배출"
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
                    editingItem ? '수정' : '추가'
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
