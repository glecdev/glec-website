/**
 * ProblemCard Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-002)
 * Purpose: Display problem with GIF/image animation
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface ProblemCardProps {
  number: number;
  title: string;
  description: string;
  gifSrc: string;
  staticSrc: string;
  alt: string;
  reverse?: boolean;
}

export function ProblemCard({
  number,
  title,
  description,
  gifSrc,
  staticSrc,
  alt,
  reverse = false,
}: ProblemCardProps) {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.7,
    triggerOnce: true,
  });

  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    // Detect mobile (save bandwidth by using static images)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use static image on mobile or if GIF fails to load
  // If both fail, show placeholder with gradient
  const imageSrc = isMobile || imageError ? staticSrc : gifSrc;
  const showPlaceholder = imageError;

  return (
    <div
      ref={elementRef}
      className={cn(
        'flex flex-col gap-8 items-center',
        'lg:flex-row lg:gap-16',
        reverse && 'lg:flex-row-reverse'
      )}
    >
      {/* Image Side */}
      <div className="flex-1 w-full">
        <div
          className={cn(
            'relative aspect-video rounded-lg overflow-hidden',
            'transition-all duration-700 ease-out',
            isIntersecting
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8',
            showPlaceholder
              ? 'bg-gradient-to-br from-primary-100 to-primary-200'
              : 'bg-gray-100'
          )}
        >
          {!showPlaceholder && (
            <Image
              src={imageSrc}
              alt={alt}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              priority={number === 1}
              unoptimized
            />
          )}

          {showPlaceholder && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <p className="text-sm">이미지 준비 중</p>
              </div>
            </div>
          )}

          {/* Problem Number Badge */}
          <div className="absolute top-4 left-4 w-12 h-12 flex items-center justify-center bg-primary-500 text-white font-bold text-xl rounded-full shadow-lg">
            {number}
          </div>
        </div>
      </div>

      {/* Text Side */}
      <div className="flex-1 w-full">
        <div
          className={cn(
            'transition-all duration-700 ease-out',
            isIntersecting
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
          style={{
            transitionDelay: isIntersecting ? '500ms' : '0ms',
          }}
        >
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h3>

          <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
