/**
 * Admin Popups Management Page - Tab Structure with Insights
 *
 * Purpose: 팝업 관리 (생성, 수정, 삭제, 순서 변경)
 * Pattern: Tab Structure Standard (Insights + Management)
 * Features: Drag & Drop 레이어 순서 변경, 통계 분석
 *
 * Structure:
 * - Tab 1: 인사이트 (통계 분석)
 * - Tab 2: 관리 (CRUD 기능)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TabLayout, { TabType } from '@/components/admin/TabLayout';
import {
  OverviewCards,
  StatusDistribution,
  CategoryDistribution,
  TopViewedList,
} from '@/components/admin/InsightsCards';
import {
  calculateBaseStats,
  getTopViewed,
  type BaseStats,
} from '@/lib/admin-insights';

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  isActive: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // For stats compatibility
  viewCount: number; // For stats compatibility
  publishedAt: string | null; // For stats compatibility
  zIndex: number;
  displayType: 'modal' | 'banner' | 'corner';
  position: string;
  width: number;
  height: number;
  showOnce: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface PopupStats extends BaseStats {
  displayTypeDistribution: Record<string, number>;
  topViewed: Popup[];
}

const DISPLAY_TYPE_LABELS = {
  modal: '모달',
  banner: '배너',
  corner: '코너',
};

const DISPLAY_TYPE_COLORS = {
  modal: 'bg-blue-100 text-blue-800',
  banner: 'bg-green-100 text-green-800',
  corner: 'bg-purple-100 text-purple-800',
};

export default function AdminPopupsPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('management');

  // Data states
  const [popups, setPopups] = useState<Popup[]>([]);
  const [allPopups, setAllPopups] = useState<Popup[]>([]); // For insights
  const [stats, setStats] = useState<PopupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states (지식센터 패턴 적용)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    isActive: true,
    displayType: 'modal' as Popup['displayType'],
    position: 'center',
    width: 600,
    height: 400,
    showOnce: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (activeTab === 'management') {
      fetchPopups();
    } else if (activeTab === 'insights') {
      fetchAllPopupsForInsights();
    }
  }, [activeTab]);

  const fetchPopups = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/popups', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setPopups(data.data);
      }
    } catch (error) {
      console.error('[Popups] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch all popups for insights
   */
  const fetchAllPopupsForInsights = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/popups', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        // Convert popup data to match stats interface
        const popupsWithStats = data.data.map((popup: any) => ({
          ...popup,
          status: popup.isActive ? 'PUBLISHED' : 'DRAFT',
          viewCount: 0, // Popups don't track views yet
          publishedAt: popup.isActive ? popup.startDate : null,
        }));
        setAllPopups(popupsWithStats);
        calculateStats(popupsWithStats);
      }
    } catch (error) {
      console.error('[Popups Insights] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Calculate statistics for insights
   */
  const calculateStats = (popupsList: Popup[]) => {
    const baseStats = calculateBaseStats(popupsList);

    // Display type distribution
    const displayTypeDistribution: Record<string, number> = {
      modal: popupsList.filter(p => p.displayType === 'modal').length,
      banner: popupsList.filter(p => p.displayType === 'banner').length,
      corner: popupsList.filter(p => p.displayType === 'corner').length,
    };

    const topViewed = getTopViewed(popupsList, 5);

    setStats({
      ...baseStats,
      displayTypeDistribution,
      topViewed,
    });
  };

  /**
   * Open create modal (지식센터 패턴)
   */
  const openCreateModal = () => {
    setEditingPopup(null);
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      linkText: '',
      isActive: true,
      displayType: 'modal',
      position: 'center',
      width: 600,
      height: 400,
      showOnce: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  /**
   * Open edit modal (지식센터 패턴)
   */
  const openEditModal = (popup: Popup) => {
    setEditingPopup(popup);
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
      startDate: popup.startDate.split('T')[0],
      endDate: popup.endDate.split('T')[0],
    });
    setIsModalOpen(true);
  };

  /**
   * Handle form submit (지식센터 패턴)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('제목과 내용은 필수 항목입니다.');
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('admin_token');
      const payload = {
        ...formData,
        imageUrl: formData.imageUrl || null,
        linkUrl: formData.linkUrl || null,
        linkText: formData.linkText || null,
      };

      let response;
      if (editingPopup) {
        // Update
        response = await fetch(`/api/admin/popups?id=${editingPopup.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...payload, id: editingPopup.id }),
        });
      } else {
        // Create
        response = await fetch('/api/admin/popups', {
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
        throw new Error(result.error?.message || 'Failed to save popup');
      }

      alert(editingPopup ? '팝업이 수정되었습니다.' : '팝업이 추가되었습니다.');
      setIsModalOpen(false);
      fetchPopups(); // Refresh list (지식센터 패턴) - CRITICAL AUTO-REFRESH
    } catch (err) {
      console.error('[Save Popup] Error:', err);
      alert(err instanceof Error ? err.message : 'Failed to save popup');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 팝업을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/popups?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        alert('팝업이 삭제되었습니다.');
        fetchPopups();
      }
    } catch (error) {
      console.error('[Popups] Delete error:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const toggleActive = async (popup: Popup) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/popups', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...popup, isActive: !popup.isActive }),
      });

      const data = await response.json();
      if (data.success) {
        fetchPopups();
      }
    } catch (error) {
      console.error('[Popups] Toggle error:', error);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = popups.findIndex((p) => p.id === draggedId);
    const targetIndex = popups.findIndex((p) => p.id === targetId);

    const newPopups = [...popups];
    const [removed] = newPopups.splice(draggedIndex, 1);
    newPopups.splice(targetIndex, 0, removed);

    // z-index 재계산 (높은 순서부터)
    const updatedPopups = newPopups.map((popup, index) => ({
      ...popup,
      zIndex: 1000 - index,
    }));

    setPopups(updatedPopups);
    setDraggedId(null);

    // API로 순서 업데이트
    try {
      const token = localStorage.getItem('admin_token');
      await fetch('/api/admin/popups/reorder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          popups: updatedPopups.map((p) => ({ id: p.id, zIndex: p.zIndex })),
        }),
      });
    } catch (error) {
      console.error('[Popups] Reorder error:', error);
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
          <OverviewCards stats={stats} itemLabel="팝업" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusDistribution stats={stats} />
            <CategoryDistribution
              distribution={stats.displayTypeDistribution}
              categories={[
                { key: 'modal', label: '모달', color: 'bg-blue-500' },
                { key: 'banner', label: '배너', color: 'bg-green-500' },
                { key: 'corner', label: '코너', color: 'bg-purple-500' },
              ]}
              totalItems={stats.totalItems}
            />
          </div>

          {stats.topViewed.length > 0 && (
            <TopViewedList items={stats.topViewed} title="조회수 상위 5개" emptyMessage="데이터 없음" />
          )}
        </>
      ) : null}
    </div>
  );

  // Management Content
  const managementContent = (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <Link
          href="/admin/popups/create"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          새 팝업 만들기
        </Link>
      </div>

      {/* Drag & Drop Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <strong>드래그앤드롭으로 레이어 순서 변경:</strong> 위에 있을수록 먼저 표시됩니다 (z-index가 높음)
          </div>
        </div>
      </div>

      {/* Popups List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : popups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">팝업이 없습니다</h3>
          <p className="text-gray-600 mb-6">첫 팝업을 만들어보세요!</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            팝업 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {popups.map((popup) => (
            <div
              key={popup.id}
              draggable
              onDragStart={(e) => handleDragStart(e, popup.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, popup.id)}
              className={`bg-white rounded-lg shadow-sm border p-6 cursor-move hover:shadow-md transition-shadow ${
                draggedId === popup.id ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Drag Handle */}
                <div className="text-gray-400 mt-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{popup.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${DISPLAY_TYPE_COLORS[popup.displayType]}`}>
                      {DISPLAY_TYPE_LABELS[popup.displayType]}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      z-index: {popup.zIndex}
                    </span>
                    <button
                      onClick={() => toggleActive(popup)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        popup.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {popup.isActive ? '활성화' : '비활성화'}
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: popup.content }} />

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>위치: {popup.position}</span>
                    <span>크기: {popup.width}x{popup.height}px</span>
                    <span>{new Date(popup.startDate).toLocaleDateString()} ~ {new Date(popup.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(popup)}
                    className="px-4 py-2 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(popup.id)}
                    className="px-4 py-2 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">팝업 관리</h1>
        <p className="mt-2 text-gray-600">팝업 통계 분석 및 콘텐츠 관리</p>
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
              <h2 className="text-2xl font-bold">
                {editingPopup ? '팝업 수정' : '새 팝업 만들기'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 표시 유형 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  표시 유형 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.displayType}
                  onChange={(e) => setFormData({ ...formData, displayType: e.target.value as Popup['displayType'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="modal">모달</option>
                  <option value="banner">배너</option>
                  <option value="corner">코너</option>
                </select>
              </div>

              {/* 위치 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  위치
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="center">중앙</option>
                  <option value="top">상단</option>
                  <option value="bottom">하단</option>
                  <option value="top-left">좌상단</option>
                  <option value="top-right">우상단</option>
                  <option value="bottom-left">좌하단</option>
                  <option value="bottom-right">우하단</option>
                </select>
              </div>

              {/* 크기 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    너비 (px)
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="200"
                    max="1200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    높이 (px)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="200"
                    max="800"
                  />
                </div>
              </div>

              {/* 이미지 URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* 링크 URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  링크 URL
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* 링크 텍스트 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  링크 텍스트
                </label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="자세히 보기"
                />
              </div>

              {/* 날짜 범위 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* 체크박스 옵션 */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">활성화</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnce}
                    onChange={(e) => setFormData({ ...formData, showOnce: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">하루 한 번만 표시 (쿠키)</span>
                </label>
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={isSaving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? '저장 중...' : editingPopup ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
