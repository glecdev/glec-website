/**
 * Popup Manager Component (Premium Design)
 *
 * Purpose: 웹사이트 전역 팝업 관리 및 표시
 * Features: Modal, Corner 팝업, "오늘 하루 보지 않기"
 * Design: Premium gradient design matching LaunchModal
 *
 * Based on: LaunchModal.tsx design, admin Modal component
 */

'use client';

import React, { useState, useEffect } from 'react';

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  zIndex: number;
  displayType: 'modal' | 'banner' | 'corner';
  position: string | null;
  size: string | null;
  showOncePerDay: boolean;
  backgroundColor: string | null;
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

  const closePopup = (id: string, showOncePerDay: boolean) => {
    setClosedIds((prev) => new Set([...prev, id]));

    if (showOncePerDay) {
      const stored = localStorage.getItem('closed_popups');
      const closedData = stored ? JSON.parse(stored) : [];
      const today = new Date().toDateString();

      closedData.push({ id, date: today });
      localStorage.setItem('closed_popups', JSON.stringify(closedData));
    }
  };

  // ESC key to close all modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modalPopups = visiblePopups.filter((p) => p.displayType === 'modal');
        if (modalPopups.length > 0) {
          closePopup(modalPopups[0].id, modalPopups[0].showOncePerDay);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [popups, closedIds]);

  // Prevent body scroll when modal is open
  const visiblePopups = popups.filter((popup) => !closedIds.has(popup.id));
  const hasModalOpen = visiblePopups.some((p) => p.displayType === 'modal');

  useEffect(() => {
    if (hasModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [hasModalOpen]);

  return (
    <>
      {visiblePopups.map((popup) => {
        if (popup.displayType === 'modal') {
          // Parse size (default: 600px x auto)
          let width = '600px';
          let maxHeight = 'auto';
          if (popup.size) {
            try {
              const sizeObj = JSON.parse(popup.size);
              width = sizeObj.width || '600px';
              maxHeight = sizeObj.height || 'auto';
            } catch (e) {
              console.warn('[PopupManager] Invalid size JSON:', popup.size);
            }
          }

          // Premium Modal (LaunchModal design)
          return (
            <div key={popup.id}>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
                onClick={() => closePopup(popup.id, popup.showOncePerDay)}
                aria-hidden="true"
              />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in-up"
                  style={{ maxWidth: width }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => closePopup(popup.id, popup.showOncePerDay)}
                    className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors z-10"
                    aria-label="팝업 닫기"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Header with Gradient (LaunchModal style) */}
                  <div
                    className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 text-white p-8 rounded-t-2xl overflow-hidden"
                    style={{
                      backgroundColor: popup.backgroundColor || undefined,
                    }}
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
                    </div>

                    <div className="relative">
                      <h2 className="text-2xl lg:text-3xl font-bold mb-2">{popup.title}</h2>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-8">
                    {/* Image */}
                    {popup.imageUrl && (
                      <div className="mb-6">
                        <img
                          src={popup.imageUrl}
                          alt={popup.title}
                          className="w-full rounded-lg object-cover"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    )}

                    {/* Content (HTML) */}
                    <div
                      className="prose prose-lg max-w-none mb-6"
                      dangerouslySetInnerHTML={{ __html: popup.content }}
                    />

                    {/* Link Button */}
                    {popup.linkUrl && (
                      <div className="flex justify-center pt-4">
                        <a
                          href={popup.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                          onClick={() => closePopup(popup.id, popup.showOncePerDay)}
                        >
                          자세히 보기
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    )}

                    {/* Show Once Button */}
                    {popup.showOncePerDay && (
                      <div className="mt-6 pt-6 border-t">
                        <button
                          onClick={() => closePopup(popup.id, true)}
                          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          오늘 하루 보지 않기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Corner popups (small notifications)
        if (popup.displayType === 'corner') {
          // Parse position (default: bottom-right)
          let positionClasses = 'bottom-4 right-4';
          if (popup.position) {
            try {
              const posObj = JSON.parse(popup.position);
              if (posObj.top && posObj.right) positionClasses = 'top-4 right-4';
              else if (posObj.top && posObj.left) positionClasses = 'top-4 left-4';
              else if (posObj.bottom && posObj.left) positionClasses = 'bottom-4 left-4';
              else positionClasses = 'bottom-4 right-4';
            } catch (e) {
              console.warn('[PopupManager] Invalid position JSON:', popup.position);
            }
          }

          // Parse size (default: 320px x auto)
          let width = '320px';
          if (popup.size) {
            try {
              const sizeObj = JSON.parse(popup.size);
              width = sizeObj.width || '320px';
            } catch (e) {
              console.warn('[PopupManager] Invalid size JSON:', popup.size);
            }
          }

          return (
            <div
              key={popup.id}
              className={`fixed ${positionClasses} bg-white rounded-xl shadow-2xl p-4 z-50 animate-fade-in-up border border-gray-200`}
              style={{ maxWidth: width }}
            >
              {/* Close Button */}
              <button
                onClick={() => closePopup(popup.id, popup.showOncePerDay)}
                className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                aria-label="알림 닫기"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <h4 className="font-bold text-gray-900 mb-2 pr-6">{popup.title}</h4>
              <div className="text-sm text-gray-700 mb-3" dangerouslySetInnerHTML={{ __html: popup.content }} />

              {/* Image */}
              {popup.imageUrl && (
                <div className="mb-3">
                  <img src={popup.imageUrl} alt={popup.title} className="w-full rounded-lg object-cover" />
                </div>
              )}

              {/* Link Button */}
              {popup.linkUrl && (
                <a
                  href={popup.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-sm font-semibold rounded hover:bg-primary-600 transition-colors"
                  onClick={() => closePopup(popup.id, popup.showOncePerDay)}
                >
                  보기
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
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
