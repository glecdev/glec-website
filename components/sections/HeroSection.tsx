/**
 * Hero Section Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-001)
 * Features:
 * - Typing animation (50ms/char)
 * - Background blur + gradient
 * - Pulse animation on CTA (1.5s)
 * - Video modal
 * - Enhanced statistics cards
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { VideoModal } from '@/components/ui/VideoModal';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';

export function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const { displayedText, isComplete } = useTypingAnimation(
    '매일 밤 11시,\n탄소배출 보고서 때문에\n엑셀과 싸우는 당신에게',
    50
  );

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero Section"
    >
      {/* Optimized Background (CSS Gradient for better LCP) */}
      <div className="absolute inset-0 z-0">
        {/* Primary gradient background (instant load, no HTTP request) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#000a42] via-[#0600f7]/80 to-[#1a1a2e]" />

        {/* Grid pattern overlay (CSS-only, no image) */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(180deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Radial spotlight effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Typing Animation Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight whitespace-pre-line">
            {displayedText}
            {isComplete && (
              <span className="inline-block w-1 h-12 ml-2 bg-primary-500 animate-pulse" />
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto">
            ISO-14083 국제표준 기반<br />
            클릭 한 번으로 완성되는 물류 탄소배출 보고서
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/contact?source=hero">
              <Button
                variant="primary"
                size="lg"
                className="min-w-[200px] animate-pulse-slow shadow-xl"
              >
                무료 데모 신청
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] text-white border-white hover:bg-white/10"
              onClick={() => setIsVideoOpen(true)}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              2분 소개 영상 보기
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12 flex flex-wrap justify-center items-center gap-6 md:gap-8 text-gray-400">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">ISO-14083 국제표준 인증</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm">DHL GoGreen 공식 파트너</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm">1,200+ 기업 사용 중</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoId="dQw4w9WgXcQ" // TODO: Replace with actual GLEC intro video ID
        title="GLEC 2분 소개 영상"
      />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
