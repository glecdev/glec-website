/**
 * LatestNewsSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-006)
 * Security: CLAUDE.md - No hardcoding, dynamic data from API
 * Purpose: Display latest news/announcements in card layout
 *
 * Changes (Iteration 12):
 * - ✅ Removed getMockNoticesWithIds() (hardcoding violation)
 * - ✅ Migrated to /api/notices endpoint (dynamic data)
 * - ✅ Added loading/error states
 * - ✅ Added skeleton loader for better UX
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
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

// API Response type (from GLEC-API-Specification.yaml)
interface NoticesApiResponse {
  success: boolean;
  data: Notice[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export function LatestNewsSection() {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  // State for API data
  const [latestNotices, setLatestNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest 3 published notices from API
  useEffect(() => {
    let mounted = true;

    async function fetchLatestNotices() {
      try {
        // Call /api/notices with query params: per_page=3, sort by published_at DESC
        const response = await fetch('/api/notices?per_page=3&page=1', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch notices: ${response.status}`);
        }

        const result: NoticesApiResponse = await response.json();

        if (!result.success) {
          throw new Error('API returned error');
        }

        if (mounted) {
          setLatestNotices(result.data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          console.error('[LatestNewsSection] Failed to fetch notices:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchLatestNotices();

    return () => {
      mounted = false;
    };
  }, []);

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

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[0, 1, 2].map((index) => (
              <SkeletonCard key={index} index={index} isIntersecting={isIntersecting} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {latestNotices.length > 0 ? (
              latestNotices.map((notice, index) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  isIntersecting={isIntersecting}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                최신 소식이 없습니다.
              </div>
            )}
          </div>
        )}

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

// Skeleton Card Component (Loading state)
interface SkeletonCardProps {
  index: number;
  isIntersecting: boolean;
}

function SkeletonCard({ index, isIntersecting }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'block bg-white rounded-lg overflow-hidden shadow-sm',
        'transition-all duration-700 ease-out',
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{
        transitionDelay: isIntersecting ? `${index * 100}ms` : '0ms',
      }}
    >
      {/* Image Skeleton */}
      <div className="relative aspect-video bg-gray-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Date */}
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />

        {/* Title */}
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />

        {/* Excerpt */}
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-4" />

        {/* Read More */}
        <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

interface NoticeCardProps {
  notice: Notice;
  isIntersecting: boolean;
  index: number;
}

function NoticeCard({ notice, isIntersecting, index }: NoticeCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const formatDate = (date: Date | string | null) => {
    if (!date) return '';

    // Convert string to Date if necessary
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('[LatestNewsSection] Invalid date:', date);
      return '';
    }

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
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
