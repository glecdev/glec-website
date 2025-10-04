/**
 * LatestNewsSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-006)
 * Security: CLAUDE.md - No hardcoding, dynamic data from mock-data.ts
 * Purpose: Display latest news/announcements in card layout
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { getMockNoticesWithIds } from '@/lib/mock-data';
import type { Notice, NoticeCategory } from '@prisma/client';

// Category configuration
const categoryColors: Record<NoticeCategory, string> = {
  GENERAL: 'bg-gray-100 text-gray-700',
  PRODUCT: 'bg-blue-100 text-blue-700',
  EVENT: 'bg-orange-100 text-orange-700',
  PRESS: 'bg-purple-100 text-purple-700',
};

const categoryLabels: Record<NoticeCategory, string> = {
  GENERAL: '일반',
  PRODUCT: '제품 출시',
  EVENT: '이벤트',
  PRESS: '보도자료',
};

export function LatestNewsSection() {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  // Get latest 3 published notices
  const allNotices = getMockNoticesWithIds();
  const latestNotices = allNotices
    .filter((notice) => notice.status === 'PUBLISHED' && !notice.deletedAt)
    .sort((a, b) => {
      const dateA = a.publishedAt?.getTime() || 0;
      const dateB = b.publishedAt?.getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <section
      ref={elementRef}
      className="py-20 lg:py-32 bg-white"
      aria-label="최신 소식 섹션"
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
            최신 소식
          </h2>
          <p className="text-xl text-gray-600">
            GLEC의 새로운 소식과 성과를 확인하세요
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {latestNotices.map((notice, index) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              isIntersecting={isIntersecting}
              index={index}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div
          className={cn(
            'text-center',
            'transition-all duration-700 ease-out',
            isIntersecting
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
          style={{
            transitionDelay: isIntersecting ? '600ms' : '0ms',
          }}
        >
          <Link
            href="/notices"
            className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 active:bg-primary-100 transition-all duration-200"
          >
            모든 소식 보기
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

interface NoticeCardProps {
  notice: Notice;
  isIntersecting: boolean;
  index: number;
}

function NoticeCard({ notice, isIntersecting, index }: NoticeCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Link
      href={`/notices/${notice.slug}`}
      className={cn(
        'group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300',
        'transition-all duration-700 ease-out',
        isIntersecting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      )}
      style={{
        transitionDelay: isIntersecting ? `${index * 100}ms` : '0ms',
      }}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {notice.thumbnailUrl && !imageError ? (
          <Image
            src={notice.thumbnailUrl}
            alt={notice.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <svg
              className="w-16 h-16 text-primary-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
              />
            </svg>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={cn(
              'px-3 py-1 text-xs font-semibold rounded-full',
              categoryColors[notice.category]
            )}
          >
            {categoryLabels[notice.category]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <p className="text-sm text-gray-500 mb-2">{formatDate(notice.publishedAt)}</p>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-500 transition-colors duration-200">
          {notice.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {notice.excerpt || notice.content.substring(0, 150) + '...'}
        </p>

        {/* Read More */}
        <div className="flex items-center text-primary-500 font-semibold group-hover:gap-2 transition-all duration-200">
          자세히 보기
          <svg
            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
