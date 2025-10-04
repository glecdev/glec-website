/**
 * FooterCTASection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-007 estimated)
 * Purpose: Final CTA section before footer with free consultation request
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

export function FooterCTASection() {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    triggerOnce: true,
  });

  return (
    <section
      ref={elementRef}
      className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 relative overflow-hidden"
      aria-label="무료 상담 신청 섹션"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div
            className={cn(
              'transition-all duration-700 ease-out',
              isIntersecting
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
          >
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
              탄소배출 측정,<br />
              이제 시작하세요
            </h2>
            <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed">
              1,200개 물류기업이 선택한 GLEC과 함께<br />
              탄소중립 목표를 달성하세요
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={cn(
              'flex flex-col sm:flex-row gap-4 justify-center items-center mb-12',
              'transition-all duration-700 ease-out',
              isIntersecting
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
            style={{
              transitionDelay: isIntersecting ? '300ms' : '0ms',
            }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-500 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              무료 상담 신청
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-500 active:bg-gray-50 transition-all duration-200 w-full sm:w-auto"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              제품 데모 보기
            </Link>
          </div>

          {/* Trust Signals */}
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-3 gap-8 mt-16',
              'transition-all duration-700 ease-out',
              isIntersecting
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
            style={{
              transitionDelay: isIntersecting ? '600ms' : '0ms',
            }}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">ISO-14083 인증</p>
              <p className="text-blue-200 text-sm mt-1">국제표준 기반</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">24시간 지원</p>
              <p className="text-blue-200 text-sm mt-1">연중무휴 기술지원</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">투명한 가격</p>
              <p className="text-blue-200 text-sm mt-1">숨겨진 비용 없음</p>
            </div>
          </div>

          {/* Contact Info */}
          <div
            className={cn(
              'mt-16 pt-8 border-t border-white border-opacity-20',
              'transition-all duration-700 ease-out',
              isIntersecting
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
            style={{
              transitionDelay: isIntersecting ? '900ms' : '0ms',
            }}
          >
            <p className="text-blue-100 mb-4">
              궁금한 점이 있으신가요? 언제든지 문의해주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-white">
              <a
                href="tel:010-4481-5189"
                className="flex items-center hover:text-blue-200 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                010-4481-5189
              </a>

              <span className="hidden sm:inline text-blue-300">|</span>

              <a
                href="mailto:contact@glec.io"
                className="flex items-center hover:text-blue-200 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                contact@glec.io
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
