/**
 * Knowledge Videos Page
 *
 * Purpose: 제품 소개 및 튜토리얼 영상 목록
 * API: GET /api/knowledge/videos
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
  category: 'PRODUCT' | 'TUTORIAL' | 'WEBINAR' | 'EVENT';
}

const CATEGORY_LABELS = {
  PRODUCT: '제품 소개',
  TUTORIAL: '튜토리얼',
  WEBINAR: '웨비나',
  EVENT: '이벤트',
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/knowledge/videos');
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">영상 자료</h1>
          <p className="text-xl opacity-90">제품 소개, 튜토리얼, 웨비나 영상을 확인하세요</p>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
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
              <p className="text-gray-600">곧 새로운 영상이 추가될 예정입니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                    <img
                      src={video.thumbnailUrl || '/images/video-placeholder.jpg'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-primary-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-primary-500">
                      {CATEGORY_LABELS[video.category]}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {video.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    조회수 {video.viewCount.toLocaleString()}회
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
