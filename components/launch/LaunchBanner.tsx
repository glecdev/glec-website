/**
 * Launch Banner Component
 *
 * GLEC Carbon API 런칭 이벤트 배너
 * - 홈페이지 상단에 고정 표시
 * - 카운트다운 타이머
 * - Early Access 신청 버튼
 * - 닫기 기능 (로컬 스토리지 저장)
 *
 * Based on: Design System (Banner pattern)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LaunchBannerProps {
  eventId: string;
  eventSlug: string;
  launchDate: string; // ISO string
  maxParticipants: number;
}

export function LaunchBanner({ eventId, eventSlug, launchDate, maxParticipants }: LaunchBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Check if banner was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem(`launch-banner-dismissed-${eventId}`);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [eventId]);

  // Countdown timer
  useEffect(() => {
    if (!isVisible) return;

    const targetDate = new Date(launchDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [launchDate, isVisible]);

  const handleDismiss = () => {
    localStorage.setItem(`launch-banner-dismissed-${eventId}`, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 text-white shadow-lg">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Event Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Rocket Icon */}
            <div className="flex-shrink-0 p-2 bg-white/20 backdrop-blur-sm rounded-lg animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block px-2 py-0.5 bg-yellow-400 text-primary-900 text-xs font-bold rounded-full uppercase animate-pulse">
                  New Launch
                </span>
                <span className="text-sm font-semibold">GLEC Carbon API 공식 런칭</span>
              </div>
              <p className="text-xs text-gray-100 truncate">
                선착순 {maxParticipants}명 한정 · Early Access 특전 $100 크레딧 제공
              </p>
            </div>
          </div>

          {/* Center: Countdown Timer (Hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs text-gray-200">Days</div>
            </div>
            <div className="text-xl">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs text-gray-200">Hours</div>
            </div>
            <div className="text-xl">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs text-gray-200">Min</div>
            </div>
            <div className="text-xl">:</div>
            <div className="text-center">
              <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs text-gray-200">Sec</div>
            </div>
          </div>

          {/* Right: CTA Button + Close */}
          <div className="flex items-center gap-2">
            <Link
              href={`/events/${eventSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <span className="text-sm whitespace-nowrap">지금 신청</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="배너 닫기"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Countdown (Hidden on desktop) */}
        <div className="lg:hidden flex items-center justify-center gap-2 mt-2 pt-2 border-t border-white/20">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span>{timeLeft.days}일</span>
            <span>{String(timeLeft.hours).padStart(2, '0')}시간</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}분</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}초 남음</span>
          </div>
        </div>
      </div>
    </div>
  );
}
