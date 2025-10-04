/**
 * Popup Manager Component
 *
 * Purpose: 웹사이트 전역 팝업 관리 및 표시
 * Features: Modal, Banner, Corner 팝업, "오늘 하루 보지 않기"
 */

'use client';

import React, { useState, useEffect } from 'react';

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  zIndex: number;
  displayType: 'modal' | 'banner' | 'corner';
  position: string;
  width: number;
  height: number;
  showOnce: boolean;
}

export function PopupManager() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Don't load popups if running in test mode
    if (typeof window !== 'undefined' && localStorage.getItem('disable_popups_for_tests') === 'true') {
      console.log('[PopupManager] Popups disabled for tests');
      return;
    }

    fetchPopups();
    loadClosedPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const response = await fetch('/api/popups');
      const data = await response.json();
      if (data.success) {
        // Exclude banner popups (handled by BannerPopupManager)
        setPopups(data.data.filter((p: Popup) => p.displayType !== 'banner'));
      }
    } catch (error) {
      console.error('[PopupManager] Fetch error:', error);
    }
  };

  const loadClosedPopups = () => {
    const stored = localStorage.getItem('closed_popups');
    if (stored) {
      const closedData = JSON.parse(stored);
      const today = new Date().toDateString();

      // 오늘 날짜의 닫은 팝업만 로드
      const todaysClosed = closedData.filter((item: any) => item.date === today);
      setClosedIds(new Set(todaysClosed.map((item: any) => item.id)));
    }
  };

  const closePopup = (id: string, showOnce: boolean) => {
    setClosedIds((prev) => new Set([...prev, id]));

    if (showOnce) {
      const stored = localStorage.getItem('closed_popups');
      const closedData = stored ? JSON.parse(stored) : [];
      const today = new Date().toDateString();

      closedData.push({ id, date: today });
      localStorage.setItem('closed_popups', JSON.stringify(closedData));
    }
  };

  const visiblePopups = popups.filter((popup) => !closedIds.has(popup.id));

  return (
    <>
      {visiblePopups.map((popup) => {
        if (popup.displayType === 'modal') {
          return (
            <div
              key={popup.id}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
              style={{ zIndex: 40 }}
            >
              <div
                className="bg-white rounded-lg shadow-2xl relative max-w-full"
                style={{ width: popup.width, maxHeight: popup.height }}
              >
                {/* Close Button */}
                <button
                  onClick={() => closePopup(popup.id, popup.showOnce)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                  aria-label="팝업 닫기"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Image */}
                {popup.imageUrl && (
                  <div className="w-full h-64 rounded-t-lg overflow-hidden">
                    <img src={popup.imageUrl} alt={popup.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{popup.title}</h3>
                  <div className="prose prose-sm mb-6" dangerouslySetInnerHTML={{ __html: popup.content }} />

                  {popup.linkUrl && (
                    <a
                      href={popup.linkUrl}
                      className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                      onClick={() => closePopup(popup.id, popup.showOnce)}
                    >
                      {popup.linkText || '자세히 보기'}
                    </a>
                  )}
                </div>

                {/* Show Once */}
                {popup.showOnce && (
                  <div className="border-t px-8 py-4 bg-gray-50 rounded-b-lg">
                    <button
                      onClick={() => closePopup(popup.id, true)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      오늘 하루 보지 않기
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Banner popups are handled by BannerPopupManager in layout.tsx
        if (popup.displayType === 'corner') {
          const positionClasses = {
            'top-left': 'top-4 left-4',
            'top-right': 'top-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'bottom-right': 'bottom-4 right-4',
          }[popup.position] || 'bottom-4 right-4';

          return (
            <div
              key={popup.id}
              className={`fixed ${positionClasses} bg-white rounded-lg shadow-2xl p-4`}
              style={{ zIndex: 40, width: popup.width, maxHeight: popup.height }}
            >
              <button
                onClick={() => closePopup(popup.id, popup.showOnce)}
                className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                aria-label="알림 닫기"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h4 className="font-bold mb-2">{popup.title}</h4>
              <div className="text-sm mb-3" dangerouslySetInnerHTML={{ __html: popup.content }} />

              {popup.linkUrl && (
                <a
                  href={popup.linkUrl}
                  className="inline-block px-3 py-1 bg-primary-500 text-white text-sm font-semibold rounded hover:bg-primary-600 transition-colors"
                  onClick={() => closePopup(popup.id, popup.showOnce)}
                >
                  {popup.linkText || '보기'}
                </a>
              )}
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
