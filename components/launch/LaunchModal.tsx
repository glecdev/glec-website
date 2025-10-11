/**
 * Launch Modal Component
 *
 * GLEC Carbon API 런칭 이벤트 모달 팝업
 * - 첫 방문 시 자동 표시
 * - Early Access 신청 폼
 * - 참가 특전 강조
 * - "오늘 하루 보지 않기" 옵션
 *
 * Based on: Design System (Modal pattern)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LaunchModalProps {
  eventId: string;
  eventSlug: string;
  launchDate: string; // ISO string
  maxParticipants: number;
}

export function LaunchModal({ eventId, eventSlug, launchDate, maxParticipants }: LaunchModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if modal was dismissed or shown today
    const dismissed = localStorage.getItem(`launch-modal-dismissed-${eventId}`);
    const lastShown = localStorage.getItem(`launch-modal-last-shown-${eventId}`);
    const today = new Date().toDateString();

    if (!dismissed && lastShown !== today) {
      // Show modal after 2 seconds delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(`launch-modal-last-shown-${eventId}`, today);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [eventId]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    localStorage.setItem(`launch-modal-last-shown-${eventId}`, new Date().toDateString());
    setIsOpen(false);
  };

  const handleDismissForever = () => {
    localStorage.setItem(`launch-modal-dismissed-${eventId}`, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 text-white p-8 rounded-t-2xl overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-primary-900 rounded-full text-sm font-bold mb-4 animate-bounce">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Early Access 특전</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                GLEC Carbon API
                <br />
                공식 런칭 이벤트
              </h2>

              <p className="text-lg text-gray-100">
                ISO-14083 국제표준 기반
                <br />
                물류 탄소배출 측정 API
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎁 Early Access 참가자 특전</h3>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">무료 API 크레딧 $100 제공</h4>
                  <p className="text-sm text-gray-600">정식 출시 후 6개월간 사용 가능</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">연간 구독 30% 할인</h4>
                  <p className="text-sm text-gray-600">Early Adopter 전용 특별 할인</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">1:1 기술 지원</h4>
                  <p className="text-sm text-gray-600">3개월 무료 프리미엄 지원</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">파트너십 우선 협상권</h4>
                  <p className="text-sm text-gray-600">대량 사용 고객 대상</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📅 이벤트 일정</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                  <span>
                    <strong>날짜:</strong> {new Date(launchDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>
                    <strong>장소:</strong> 온라인 (Zoom Webinar)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <span>
                    <strong>정원:</strong> 선착순 {maxParticipants}명 한정
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link
                href={`/events/${eventSlug}`}
                className="block w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-center rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                onClick={handleClose}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                  </svg>
                  지금 바로 신청하기
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <button
                onClick={handleDismissToday}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                오늘 하루 보지 않기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
