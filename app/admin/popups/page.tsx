/**
 * Admin Popups Management Page
 *
 * Purpose: 팝업 관리 (생성, 수정, 삭제, 순서 변경)
 * Features: Drag & Drop 레이어 순서 변경
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  isActive: boolean;
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
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">팝업 관리</h1>
          <p className="text-gray-600">웹사이트 팝업을 생성하고 관리합니다</p>
        </div>
        <Link
          href="/admin/popups/new"
          className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
        >
          + 새 팝업 만들기
        </Link>
      </div>

      {/* Drag & Drop Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
          <Link
            href="/admin/popups/new"
            className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
          >
            팝업 만들기
          </Link>
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
                  <Link
                    href={`/admin/popups/edit?id=${popup.id}`}
                    className="px-4 py-2 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    수정
                  </Link>
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
}
