'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Force dynamic rendering for this page (uses searchParams)
export const dynamic = 'force-dynamic';

// Types (API Spec 기반)
interface Notice {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category: 'GENERAL' | 'PRODUCT' | 'EVENT' | 'PRESS';
  thumbnail_url: string | null;
  view_count: number;
  published_at: string | null;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Notice[];
  meta: PaginationMeta;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Category 상수
const CATEGORIES = {
  ALL: { value: '', label: '전체' },
  GENERAL: { value: 'GENERAL', label: '일반' },
  PRODUCT: { value: 'PRODUCT', label: '제품' },
  EVENT: { value: 'EVENT', label: '이벤트' },
  PRESS: { value: 'PRESS', label: '보도자료' },
} as const;

const CATEGORY_COLORS = {
  GENERAL: 'bg-gray-100 text-gray-700',
  PRODUCT: 'bg-primary-100 text-primary-700',
  EVENT: 'bg-success-100 text-success-700',
  PRESS: 'bg-info-100 text-info-700',
} as const;

const PER_PAGE = 12;

export default function NewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [notices, setNotices] = useState<Notice[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Get initial params from URL
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    setSelectedCategory(category);
    setSearchQuery(search);
    setDebouncedSearch(search);
  }, [searchParams]);

  // Debounce search (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch notices
  const fetchNotices = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: PER_PAGE.toString(),
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(`/api/notices?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (!result.success) {
        throw new Error('Failed to fetch notices');
      }

      setNotices(result.data);
      setMeta(result.meta);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch]);

  // Fetch on mount and when filters change
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    fetchNotices(page);
  }, [fetchNotices, searchParams]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL({ category, page: 1 });
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Update URL with new params
  const updateURL = (newParams: { category?: string; page?: number; search?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (newParams.category !== undefined) {
      if (newParams.category) {
        params.set('category', newParams.category);
      } else {
        params.delete('category');
      }
    }

    if (newParams.page !== undefined) {
      params.set('page', newParams.page.toString());
    }

    if (newParams.search !== undefined) {
      if (newParams.search) {
        params.set('search', newParams.search);
      } else {
        params.delete('search');
      }
    }

    router.push(`/news?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Navigate to notice detail
  const handleNoticeClick = (slug: string) => {
    router.push(`/news/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6 py-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            공지사항
          </h1>
          <nav className="flex items-center text-sm text-gray-600">
            <a href="/" className="hover:text-primary-500 transition-colors">
              홈
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">공지사항</span>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, { value, label }]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      selectedCategory === value
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
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
                onChange={handleSearchChange}
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-6 py-12">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto text-error-500 mb-4">
              <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              오류가 발생했습니다
            </h3>
            <p className="text-base text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchNotices(meta?.page || 1)}
              className="
                px-6 py-3 text-base font-semibold
                bg-primary-500 text-white rounded-lg
                hover:bg-primary-600 active:bg-primary-700
                transition-all duration-200
              "
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && notices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto text-gray-300 mb-4">
              <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              공지사항이 없습니다
            </h3>
            <p className="text-base text-gray-600">
              {searchQuery ? '검색 결과가 없습니다. 다른 키워드로 시도해보세요.' : '아직 등록된 공지사항이 없습니다.'}
            </p>
          </div>
        )}

        {/* Notice Grid */}
        {!loading && !error && notices.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onClick={() => handleNoticeClick(notice.slug)}
                />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={!meta.has_prev}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        meta.has_prev
                          ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    이전
                  </button>

                  {/* Page Numbers */}
                  {[...Array(meta.total_pages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${
                            meta.page === pageNum
                              ? 'bg-primary-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={!meta.has_next}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        meta.has_next
                          ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Notice Card Component (Design System 준수)
interface NoticeCardProps {
  notice: Notice;
  onClick: () => void;
}

function NoticeCard({ notice, onClick }: NoticeCardProps) {
  const categoryColor = CATEGORY_COLORS[notice.category];
  const categoryLabel = CATEGORIES[notice.category].label;

  return (
    <div
      onClick={onClick}
      className="
        bg-white rounded-lg border-2 border-gray-300
        p-6 cursor-pointer
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-1
      "
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColor}`}>
          {categoryLabel}
        </span>

        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {notice.view_count.toLocaleString()}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {notice.title}
      </h3>

      <p className="text-base text-gray-600 mb-4 line-clamp-3">
        {notice.excerpt || notice.content.replace(/<[^>]*>/g, '').substring(0, 150)}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <time dateTime={notice.published_at || notice.created_at}>
          {new Date(notice.published_at || notice.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        <span className="text-primary-500 font-medium flex items-center">
          자세히 보기
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}
