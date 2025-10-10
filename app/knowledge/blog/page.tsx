/**
 * Knowledge Blog Page
 *
 * Based on: GLEC-Functional-Requirements-Specification.md
 * Purpose: Display industry insights and trend analysis with category filter and search
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

const CATEGORIES = {
  ALL: { value: '', label: '전체' },
  TECHNOLOGY: { value: 'TECHNOLOGY', label: '기술' },
  INDUSTRY: { value: 'INDUSTRY', label: '산업 동향' },
  CASE_STUDY: { value: 'CASE_STUDY', label: '사례 연구' },
  INSIGHT: { value: 'INSIGHT', label: '인사이트' },
} as const;

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
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
    fetchBlog();
  }, [selectedCategory, debouncedSearch]);

  const fetchBlog = async () => {
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

      const response = await fetch(`/api/knowledge/blog?${params.toString()}`);
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

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <p className="text-gray-600">
                {searchQuery ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.' : '곧 새로운 포스트가 추가될 예정입니다.'}
              </p>
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
                    {post.thumbnailUrl && (
                      <div className="md:w-64 h-40 bg-gray-200 rounded-lg flex-shrink-0 mb-4 md:mb-0 overflow-hidden">
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-primary-500 bg-primary-50 px-2 py-1 rounded">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-500">{post.readTime} 읽기</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary-500 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt={post.author || 'Author'} className="w-8 h-8 rounded-full" />
                        ) : post.author ? (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                            {post.author.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                            G
                          </div>
                        )}
                        <span className="font-medium">{post.author || 'GLEC'}</span>
                        <span>•</span>
                        <time>{formatDate(post.publishedAt)}</time>
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
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
