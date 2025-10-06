'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconClock,
  IconEye,
  IconCalendar,
  IconUser,
  IconTag,
  IconShare,
} from '@tabler/icons-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnailUrl: string | null;
  tags: string[];
  author: string;
  authorAvatar: string | null;
  readTime: string;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string | null;
  tags: string[];
  author: string;
  authorAvatar: string | null;
  readTime: string;
  viewCount: number;
  publishedAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    post: BlogPost;
    relatedPosts: RelatedPost[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      try {
        const response = await fetch(`/api/knowledge/blog/${slug}`);
        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          if (response.status === 404) {
            setError('블로그 포스트를 찾을 수 없습니다.');
          } else {
            setError(result.error?.message || '포스트를 불러오는 중 오류가 발생했습니다.');
          }
          setLoading(false);
          return;
        }

        if (result.data) {
          setPost(result.data.post);
          setRelatedPosts(result.data.relatedPosts || []);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setError('포스트를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || '포스트를 찾을 수 없습니다'}</h1>
          <Link
            href="/knowledge/blog"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
          >
            <IconArrowLeft size={20} />
            블로그 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/knowledge/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 font-medium mb-6 transition-colors"
          >
            <IconArrowLeft size={20} />
            블로그 목록
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {post.authorAvatar ? (
                <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                  {post.author.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-gray-900">{post.author}</span>
            </div>

            <div className="flex items-center gap-1">
              <IconCalendar size={16} />
              <time>{formatDate(post.publishedAt)}</time>
            </div>

            <div className="flex items-center gap-1">
              <IconClock size={16} />
              <span>{post.readTime} 읽기</span>
            </div>

            <div className="flex items-center gap-1">
              <IconEye size={16} />
              <span>{post.viewCount.toLocaleString()} 조회</span>
            </div>

            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1 text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              <IconShare size={16} />
              공유
            </button>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full"
                >
                  <IconTag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      {post.thumbnailUrl && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm border p-8 lg:p-12">
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-code:text-primary-600 prose-code:bg-primary-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100
              prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-4 prose-blockquote:italic
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-gray-700
              prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">관련 포스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/knowledge/blog/${relatedPost.slug}`}
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {relatedPost.thumbnailUrl && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={relatedPost.thumbnailUrl}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{relatedPost.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <IconClock size={14} />
                    <span>{relatedPost.readTime}</span>
                    <span>•</span>
                    <IconEye size={14} />
                    <span>{relatedPost.viewCount.toLocaleString()}</span>
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
