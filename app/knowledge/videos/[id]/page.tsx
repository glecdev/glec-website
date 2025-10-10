'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconClock,
  IconEye,
  IconCalendar,
  IconShare,
  IconExternalLink,
} from '@tabler/icons-react';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface RelatedVideo {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  viewCount: number;
  publishedAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    video: Video;
    relatedVideos: RelatedVideo[];
  };
  error?: {
    code: string;
    message: string;
  };
}

const CATEGORIES: Record<string, { label: string; color: string }> = {
  '전체': { label: '전체', color: 'bg-gray-100 text-gray-700' },
  '제품 소개': { label: '제품 소개', color: 'bg-blue-100 text-blue-700' },
  '사용 가이드': { label: '사용 가이드', color: 'bg-green-100 text-green-700' },
  '기술 세미나': { label: '기술 세미나', color: 'bg-purple-100 text-purple-700' },
  '고객 사례': { label: '고객 사례', color: 'bg-yellow-100 text-yellow-700' },
};

export default function VideoDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchVideo() {
      try {
        const response = await fetch(`/api/knowledge/videos/${id}`);
        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          if (response.status === 404) {
            setError('영상을 찾을 수 없습니다.');
          } else {
            setError(result.error?.message || '영상을 불러오는 중 오류가 발생했습니다.');
          }
          setLoading(false);
          return;
        }

        if (result.data) {
          setVideo(result.data.video);
          setRelatedVideos(result.data.relatedVideos || []);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch video:', err);
        setError('영상을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="aspect-video bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || '영상을 찾을 수 없습니다'}</h1>
          <Link
            href="/knowledge/videos"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
          >
            <IconArrowLeft size={20} />
            영상 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/knowledge/videos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 font-medium mb-6 transition-colors"
          >
            <IconArrowLeft size={20} />
            영상 목록
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {video.category && CATEGORIES[video.category] && (
              <span className={`px-3 py-1 text-xs font-semibold rounded ${CATEGORIES[video.category].color}`}>
                {CATEGORIES[video.category].label}
              </span>
            )}

            <div className="flex items-center gap-1">
              <IconCalendar size={16} />
              <time>{formatDate(video.publishedAt)}</time>
            </div>

            <div className="flex items-center gap-1">
              <IconClock size={16} />
              <span>{video.duration}</span>
            </div>

            <div className="flex items-center gap-1">
              <IconEye size={16} />
              <span>{video.viewCount.toLocaleString()} 조회</span>
            </div>

            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              <IconShare size={16} />
              공유
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-900 shadow-xl relative">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeVideoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
          />

          {/* Fallback link if iframe is blocked */}
          <div className="absolute bottom-4 right-4 z-10">
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube에서 열기
            </a>
          </div>
        </div>

        {/* Info: If video doesn't play */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>영상이 재생되지 않나요?</strong>
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline hover:text-blue-600"
            >
              YouTube에서 직접 보기
            </a>
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">영상 소개</h2>
          <div
            className="prose prose-lg max-w-none
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-headings:text-gray-900
              prose-a:text-primary-500 hover:prose-a:underline"
          >
            <p>{video.description}</p>
          </div>

          <div className="mt-6 pt-6 border-t">
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              <IconExternalLink size={20} />
              YouTube에서 보기
            </a>
          </div>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">관련 영상</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedVideos.map((relatedVideo) => (
              <Link
                key={relatedVideo.id}
                href={`/knowledge/videos/${relatedVideo.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={relatedVideo.thumbnailUrl}
                    alt={relatedVideo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {relatedVideo.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {relatedVideo.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <IconEye size={14} />
                    <span>{relatedVideo.viewCount.toLocaleString()} 조회</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
