'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

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

interface ApiResponse {
  success: boolean;
  data: Notice;
}

// Category labels and colors (Design System)
const CATEGORY_COLORS = {
  GENERAL: 'bg-gray-100 text-gray-700',
  PRODUCT: 'bg-primary-100 text-primary-700',
  EVENT: 'bg-success-100 text-success-700',
  PRESS: 'bg-info-100 text-info-700',
} as const;

const CATEGORY_LABELS = {
  GENERAL: '일반',
  PRODUCT: '제품',
  EVENT: '이벤트',
  PRESS: '보도자료',
} as const;

interface NoticeClientProps {
  slug: string;
}

export default function NoticeClient({ slug }: NoticeClientProps) {
  const router = useRouter();

  // State
  const [notice, setNotice] = useState<Notice | null>(null);
  const [relatedNotices, setRelatedNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notice detail
  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch notice by slug
        const response = await fetch(`/api/notices?slug=${slug}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 404) {
          notFound();
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error('Failed to fetch notice');
        }

        setNotice(result.data);

        // Fetch related notices (3 latest from same category)
        if (result.data.category) {
          const relatedResponse = await fetch(
            `/api/notices?category=${result.data.category}&per_page=4`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (relatedResponse.ok) {
            const relatedResult = await relatedResponse.json();
            if (relatedResult.success) {
              // Filter out current notice
              const filtered = relatedResult.data.filter(
                (n: Notice) => n.id !== result.data.id
              );
              setRelatedNotices(filtered.slice(0, 3));
            }
          }
        }

        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unknown error occurred'
        );
        console.error('Failed to fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [slug]);

  // Navigate to related notice
  const handleRelatedNoticeClick = (noticeSlug: string) => {
    router.push(`/notices/${noticeSlug}`);
  };

  // Navigate back to list
  const handleBackToList = () => {
    router.push('/notices');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto text-error-500 mb-4">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            오류가 발생했습니다
          </h3>
          <p className="text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToList}
            className="
              px-6 py-3 text-base font-semibold
              bg-primary-500 text-white rounded-lg
              hover:bg-primary-600 active:bg-primary-700
              transition-all duration-200
            "
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Not found (handled by notFound())
  if (!loading && !notice) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <nav className="flex items-center text-sm text-gray-600" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="hover:text-primary-500 transition-colors">
                  홈
                </a>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <a
                  href="/notices"
                  className="hover:text-primary-500 transition-colors"
                >
                  공지사항
                </a>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-900 font-medium line-clamp-1">
                {notice?.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Article Content */}
      {notice && (
        <article className="container mx-auto px-4 lg:px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="mb-8">
              {/* Category Badge */}
              <div className="mb-4">
                <span
                  className={`
                    inline-block px-3 py-1 text-sm font-semibold rounded
                    ${CATEGORY_COLORS[notice.category]}
                  `}
                >
                  {CATEGORY_LABELS[notice.category]}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {notice.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <time dateTime={notice.published_at || notice.created_at}>
                    {new Date(
                      notice.published_at || notice.created_at
                    ).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{notice.view_count.toLocaleString()}</span>
                </div>

                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{notice.author_name}</span>
                </div>
              </div>
            </header>

            {/* Article Content (Prose - Tailwind Typography) */}
            <section
              className="
                prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:list-disc prose-ol:list-decimal
                prose-img:rounded-lg
                mb-12
              "
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />

            {/* Back to List Button */}
            <div className="border-t border-gray-200 pt-8">
              <button
                onClick={handleBackToList}
                className="
                  inline-flex items-center
                  px-6 py-3 text-base font-semibold
                  bg-gray-100 text-gray-700 rounded-lg
                  hover:bg-gray-200 active:bg-gray-300
                  transition-all duration-200
                "
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                목록으로 돌아가기
              </button>
            </div>
          </div>

          {/* Related Notices */}
          {relatedNotices.length > 0 && (
            <div className="max-w-6xl mx-auto mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                관련 공지사항
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedNotices.map((relatedNotice) => (
                  <RelatedNoticeCard
                    key={relatedNotice.id}
                    notice={relatedNotice}
                    onClick={() => handleRelatedNoticeClick(relatedNotice.slug)}
                  />
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
}

// Related Notice Card Component
interface RelatedNoticeCardProps {
  notice: Notice;
  onClick: () => void;
}

function RelatedNoticeCard({ notice, onClick }: RelatedNoticeCardProps) {
  const categoryColor = CATEGORY_COLORS[notice.category];
  const categoryLabel = CATEGORY_LABELS[notice.category];

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
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${categoryColor}`}
        >
          {categoryLabel}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {notice.title}
      </h3>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {notice.excerpt ||
          notice.content.replace(/<[^>]*>/g, '').substring(0, 100)}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <time dateTime={notice.published_at || notice.created_at}>
          {new Date(
            notice.published_at || notice.created_at
          ).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>

        <span className="text-primary-500 font-medium">자세히 보기</span>
      </div>
    </div>
  );
}
