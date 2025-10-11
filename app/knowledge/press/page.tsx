/**
 * Knowledge Press Page (언론보도)
 *
 * Based on: GLEC-Functional-Requirements-Specification.md
 * Purpose: Display press releases and media coverage with category filter and search
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PressItem {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  thumbnailUrl: string;
  mediaOutlet?: string; // Press-specific field (언론사)
  externalUrl?: string; // Press-specific field (기사 원문 URL)
}

const CATEGORIES = {
  ALL: { value: '', label: '전체' },
  LOGISTICS: { value: '물류', label: '물류' },
  TECH: { value: 'Tech', label: '기술' },
  ECONOMY: { value: '경제', label: '경제' },
  OVERSEAS: { value: 'USA', label: '해외' },
} as const;

export default function PressPage() {
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    fetchPressItems();
  }, [selectedCategory, debouncedSearch]);

  async function fetchPressItems() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('per_page', '100'); // Show more items

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(`/api/press?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        // Filter by media outlet if category selected
        let filteredData = data.data;
        if (selectedCategory) {
          filteredData = data.data.filter((item: PressItem) =>
            item.mediaOutlet?.includes(selectedCategory)
          );
        }
        setPressItems(filteredData);
        setError(null);
      } else {
        setError('Failed to load press items');
      }
    } catch (err) {
      console.error('[Press] Fetch error:', err);
      setError('Failed to load press items');
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">언론보도</h1>
            <p className="text-red-500">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-navy-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="mb-4">
            <Link
              href="/knowledge"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              지식센터로 돌아가기
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">언론보도</h1>
          <p className="text-xl text-white/90">
            GLEC의 최신 뉴스와 언론 보도 자료
          </p>
        </div>
      </section>

      {/* Category Filter + Search */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-6">
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

      {/* Press Items Grid */}
      <main className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : pressItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">보도 자료가 없습니다</h3>
            <p className="text-gray-600">
              {searchQuery ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.' : '곧 새로운 보도 자료가 추가될 예정입니다.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressItems.map((item) => {
              // Use external URL if available, otherwise internal link
              const href = item.externalUrl || `/knowledge/press/${item.id}`;
              const isExternal = !!item.externalUrl;

              return (
                <a
                  key={item.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group block"
                >
                  {item.thumbnailUrl && (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary-500 bg-primary-50 px-2 py-1 rounded">
                        언론보도
                      </span>
                      {item.mediaOutlet && (
                        <span className="text-xs text-gray-500">{item.mediaOutlet}</span>
                      )}
                      {isExternal && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-4">{item.excerpt}</p>
                    <time className="text-sm text-gray-400">
                      {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
                    </time>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
