/**
 * Banner Popup Manager Component
 *
 * Purpose: 상단 배너 팝업 전용 관리 (Header 위에 배치)
 * Features: 헤더를 가리지 않고 DOM 구조 상 위에 렌더링
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

export function BannerPopupManager() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Don't load popups if running in test mode
    if (typeof window !== 'undefined' && localStorage.getItem('disable_popups_for_tests') === 'true') {
      console.log('[BannerPopupManager] Popups disabled for tests');
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
        // Filter only banner popups
        setPopups(data.data.filter((p: Popup) => p.displayType === 'banner'));
      }
    } catch (error) {
      console.error('[BannerPopupManager] Fetch error:', error);
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
        const positionClasses = popup.position === 'top' ? '' : 'order-last';
        return (
          <div
            key={popup.id}
            className={`w-full bg-primary-700 text-white px-4 py-3 shadow-lg ${positionClasses}`}
            style={{ height: popup.height }}
          >
            <div className="container mx-auto flex items-center justify-center gap-4 relative">
              <div className="flex items-center gap-4">
                <div dangerouslySetInnerHTML={{ __html: popup.content }} />
                {popup.linkUrl && (
                  <a
                    href={popup.linkUrl}
                    className="px-4 py-2 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => closePopup(popup.id, popup.showOnce)}
                  >
                    {popup.linkText || '자세히 보기'}
                  </a>
                )}
              </div>
              <button
                onClick={() => closePopup(popup.id, popup.showOnce)}
                className="absolute right-0 text-white hover:text-gray-200 transition-colors"
                aria-label="배너 닫기"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
