/**
 * Knowledge Blog Page
 *
 * Purpose: 업계 인사이트 및 트렌드 분석 블로그
 * API: GET /api/knowledge/blog
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  thumbnailUrl: string | null;
  author: string;
  authorAvatar: string | null;
  publishedAt: string;
  readTime: string; // "5분" format
  category: string;
  tags: string[];
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, []);

  const fetchBlog = async () => {
    try {
      const response = await fetch('/api/knowledge/blog');
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('[Blog] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">블로그</h1>
          <p className="text-xl opacity-90">물류 탄소배출 측정 업계의 최신 인사이트와 트렌드</p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse flex gap-6">
                  <div className="w-64 h-40 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✍️</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">블로그 포스트가 없습니다</h3>
              <p className="text-gray-600">곧 새로운 포스트가 추가될 예정입니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/knowledge/blog/${post.slug}`}
                  className="block bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow"
                >
                  <div className="md:flex gap-6 p-6">
                    {/* Thumbnail */}
                    <div className="md:w-64 h-48 md:h-40 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex-shrink-0 mb-4 md:mb-0 flex items-center justify-center overflow-hidden">
                      {post.thumbnailUrl ? (
                        <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-6xl">📝</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full">
                          {post.category}
                        </span>
                        <span className="text-sm text-gray-500">{post.readTime} 읽기</span>
                      </div>

                      <h2 className="text-2xl font-bold mb-3 hover:text-primary-500 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {post.authorAvatar ? (
                              <img src={post.authorAvatar} alt={post.author} className="w-full h-full rounded-full" />
                            ) : (
                              <span className="text-xs font-semibold">{post.author[0]}</span>
                            )}
                          </div>
                          <span>{post.author}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    </div>
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
