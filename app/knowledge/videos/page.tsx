/**
 * Knowledge Videos Page (영상자료)
 *
 * Based on: GLEC-Functional-Requirements-Specification.md
 * Purpose: Display video tutorials and product demos with category filter and search
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube URL
  thumbnailUrl: string;
  duration: string; // "5:30" format
  viewCount: number;
  publishedAt: string;
  category: 'PRODUCT' | 'TUTORIAL' | 'WEBINAR' | 'INTERVIEW';
}

const CATEGORIES = {
  ALL: { value: '', label: '전체' },
  PRODUCT: { value: 'PRODUCT', label: '제품 소개' },
  TUTORIAL: { value: 'TUTORIAL', label: '사용 가이드' },
  WEBINAR: { value: 'WEBINAR', label: '웨비나' },
  INTERVIEW: { value: 'INTERVIEW', label: '고객 인터뷰' },
} as const;

const CATEGORY_COLORS = {
  PRODUCT: 'bg-blue-100 text-blue-800',
  TUTORIAL: 'bg-green-100 text-green-800',
  WEBINAR: 'bg-purple-100 text-purple-800',
  INTERVIEW: 'bg-orange-100 text-orange-800',
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, debouncedSearch]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('per_page', '20');

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(`/api/knowledge/videos?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('[Videos] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4">
          <Link href="/knowledge" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            지식센터로 돌아가기
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">영상자료</h1>
          <p className="text-xl opacity-90">제품 소개, 튜토리얼, 웨비나 영상을 확인하세요</p>
        </div>
      </section>

      {/* Category Filter + Search */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(CATEGORIES).map(([key, { value, label }]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    selectedCategory === value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex-1 lg:max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목/내용 검색..."
                className="
                  w-full px-4 py-2
                  text-base text-gray-900
                  border border-gray-300 rounded-lg
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                "
              />
            </div>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">영상이 없습니다</h3>
              <p className="text-gray-600">
                {searchQuery ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.' : '곧 새로운 영상이 추가될 예정입니다.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/knowledge/videos/${video.id}`}
                  className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {video.category && CATEGORIES[video.category as keyof typeof CATEGORIES] && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${CATEGORY_COLORS[video.category as keyof typeof CATEGORY_COLORS]}`}>
                          {CATEGORIES[video.category as keyof typeof CATEGORIES].label}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{video.viewCount.toLocaleString()} 조회</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.description}</p>
                    <time className="text-xs text-gray-400">
                      {new Date(video.publishedAt).toLocaleDateString('ko-KR')}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
