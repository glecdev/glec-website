/**
 * Press Detail Page (언론보도 상세)
 *
 * Purpose: Display press article details with external link
 * Note: Most news sites block iframe embedding (X-Frame-Options: DENY)
 * Solution: Show article metadata + "View Original" link
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface PressDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  thumbnailUrl: string | null;
  mediaOutlet: string | null;
  externalUrl: string | null;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function PressDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [press, setPress] = useState<PressDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPressDetail();
    }
  }, [slug]);

  async function fetchPressDetail() {
    try {
      setLoading(true);
      const response = await fetch(`/api/press?slug=${slug}`);
      const data = await response.json();

      if (data.success && data.data) {
        setPress(data.data);
        setError(null);

        // If external URL exists and user prefers immediate redirect
        // Uncomment below to redirect immediately:
        // if (data.data.externalUrl) {
        //   window.location.href = data.data.externalUrl;
        // }
      } else {
        setError('보도자료를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('[Press Detail] Fetch error:', err);
      setError('보도자료를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // Try to load external URL in iframe (will fail for most news sites)
  const handleIframeError = () => {
    setIframeError(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !press) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📰</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">보도자료를 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/knowledge/press"
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              언론보도 목록으로
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <Link
            href="/knowledge/press"
            className="inline-flex items-center text-gray-600 hover:text-primary-500 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            언론보도 목록으로
          </Link>
        </div>
      </section>

      {/* Article Content */}
      <main className="container mx-auto px-6 py-12">
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          {/* Meta Info */}
          <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary-50 text-primary-500">
              언론보도
            </span>
            {press.mediaOutlet && (
              <span className="font-medium text-gray-700">{press.mediaOutlet}</span>
            )}
            <span>•</span>
            <time>{new Date(press.publishedAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
            <span>•</span>
            <span>조회 {press.viewCount.toLocaleString()}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {press.title}
          </h1>

          {/* Thumbnail */}
          {press.thumbnailUrl && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={press.thumbnailUrl}
                alt={press.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Excerpt */}
          {press.excerpt && (
            <div className="mb-6 p-4 bg-gray-50 border-l-4 border-primary-500 rounded">
              <p className="text-lg text-gray-700 italic">
                {press.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: press.content }}
          />

          {/* External Link CTA */}
          {press.externalUrl && (
            <div className="mt-12 p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg border border-primary-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    원문 기사 보기
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {press.mediaOutlet}에서 발행한 원문 기사를 확인하세요.
                  </p>
                  <a
                    href={press.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-md hover:shadow-lg"
                  >
                    <span>원문 보기</span>
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Optional: Try iframe embedding (will fail for most news sites) */}
          {press.externalUrl && !iframeError && (
            <div className="mt-8">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 아래는 외부 뉴스 사이트를 임베딩하려는 시도입니다.
                  대부분의 뉴스 사이트는 보안 정책상 임베딩을 차단합니다.
                  표시되지 않을 경우 위의 "원문 보기" 버튼을 이용해주세요.
                </p>
              </div>
              <iframe
                src={press.externalUrl}
                title={press.title}
                className="w-full h-[800px] border border-gray-300 rounded-lg"
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          )}

          {iframeError && (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="font-bold text-red-800">임베딩 불가능</h4>
              </div>
              <p className="text-sm text-red-700">
                해당 뉴스 사이트는 보안 정책상 외부 임베딩을 차단합니다.
                위의 "원문 보기" 버튼을 클릭하여 원문 기사를 확인해주세요.
              </p>
            </div>
          )}
        </article>

        {/* Share & Actions */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
          <Link
            href="/knowledge/press"
            className="text-gray-600 hover:text-primary-500 transition-colors"
          >
            ← 목록으로 돌아가기
          </Link>

          <div className="flex gap-4">
            {/* Share buttons can be added here */}
          </div>
        </div>
      </main>
    </div>
  );
}
