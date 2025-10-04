/**
 * PartnersSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-005 estimated)
 * Purpose: Display partner company logos with auto-rotating slider
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

const partners = [
  {
    name: 'DHL GoGreen',
    logo: '/images/logos/dhl.png',
    category: 'Global Logistics Partner',
  },
  {
    name: 'CJ대한통운',
    logo: '/images/logos/cj-logistics.png',
    category: 'Major Customer',
  },
  {
    name: '한진',
    logo: '/images/logos/hanjin.png',
    category: 'Major Customer',
  },
  {
    name: '롯데글로벌로지스',
    logo: '/images/logos/lotte-logistics.png',
    category: 'Major Customer',
  },
];

export function PartnersSection() {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (!isIntersecting) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isIntersecting]);

  return (
    <section
      ref={elementRef}
      className="py-20 lg:py-32 bg-gray-50"
      aria-label="파트너사 섹션"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={cn(
            'text-center max-w-3xl mx-auto mb-16',
            'transition-all duration-700 ease-out',
            isIntersecting
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            함께하는 파트너
          </h2>
          <p className="text-xl text-gray-600">
            글로벌 물류 리더부터 국내 주요 물류기업까지
          </p>
        </div>

        {/* Partner Logos Grid (Desktop) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
              className={cn(
                'bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-300',
                'flex flex-col items-center justify-center',
                'transition-all duration-700 ease-out',
                isIntersecting
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              )}
              style={{
                transitionDelay: isIntersecting ? `${index * 100}ms` : '0ms',
              }}
            >
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} 로고`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 128px, 128px"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">{partner.category}</p>
            </div>
          ))}
        </div>

        {/* Partner Logos Slider (Mobile) */}
        <div className="md:hidden relative">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <Image
                src={partners[currentIndex].logo}
                alt={`${partners[currentIndex].name} 로고`}
                fill
                className="object-contain transition-opacity duration-500"
                sizes="192px"
              />
            </div>
            <p className="text-center text-lg font-semibold text-gray-900 mb-2">
              {partners[currentIndex].name}
            </p>
            <p className="text-center text-sm text-gray-500">
              {partners[currentIndex].category}
            </p>
          </div>

          {/* Slider Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {partners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  currentIndex === index
                    ? 'bg-primary-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`파트너 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>

        {/* Partnership Stats */}
        <div
          className={cn(
            'mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center',
            'transition-all duration-700 ease-out',
            isIntersecting
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
          style={{
            transitionDelay: isIntersecting ? '400ms' : '0ms',
          }}
        >
          <div>
            <p className="text-4xl lg:text-5xl font-bold text-primary-500 mb-2">1,200+</p>
            <p className="text-gray-600">국내 물류기업 도입</p>
          </div>
          <div>
            <p className="text-4xl lg:text-5xl font-bold text-primary-500 mb-2">158만 톤</p>
            <p className="text-gray-600">연간 탄소배출량 측정</p>
          </div>
          <div>
            <p className="text-4xl lg:text-5xl font-bold text-primary-500 mb-2">ISO-14083</p>
            <p className="text-gray-600">국제표준 인증</p>
          </div>
        </div>
      </div>
    </section>
  );
}
