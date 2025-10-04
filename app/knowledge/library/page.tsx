/**
 * Knowledge Library Page
 *
 * Purpose: 백서, 가이드, 보고서 등 전문 자료 목록
 * API: GET /api/knowledge/library
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  category: 'WHITEPAPER' | 'GUIDE' | 'REPORT' | 'RESEARCH';
  fileUrl: string;
  fileSize: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  thumbnailUrl: string | null;
  downloadCount: number;
  publishedAt: string;
}

const CATEGORY_LABELS = {
  WHITEPAPER: '백서',
  GUIDE: '가이드',
  REPORT: '보고서',
  RESEARCH: '연구 자료',
};

const CATEGORY_COLORS = {
  WHITEPAPER: 'bg-blue-100 text-blue-800',
  GUIDE: 'bg-green-100 text-green-800',
  REPORT: 'bg-purple-100 text-purple-800',
  RESEARCH: 'bg-orange-100 text-orange-800',
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
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
    fetchLibrary();
  }, [selectedCategory, debouncedSearch]);

  const fetchLibrary = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(`/api/knowledge/library?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('[Library] Fetch error:', error);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">라이브러리</h1>
          <p className="text-xl opacity-90">백서, 가이드, 보고서 등 전문 자료를 제공합니다</p>
        </div>
      </section>

      {/* Category Filter + Search */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <button
                  key={value}
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

      {/* Library Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">자료가 없습니다</h3>
              <p className="text-gray-600">
                {searchQuery ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.' : '곧 새로운 자료가 추가될 예정입니다.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 rounded-t-lg flex items-center justify-center">
                    <div className="text-6xl">📄</div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[item.category]}`}>
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span className="text-xs text-gray-500">{item.fileType}</span>
                    </div>

                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{item.fileSize}</span>
                      <span>{item.downloadCount.toLocaleString()} 다운로드</span>
                    </div>

                    <a
                      href={item.fileUrl}
                      download
                      className="block w-full text-center px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      다운로드
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
