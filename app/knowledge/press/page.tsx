/**
 * Knowledge Press Page
 *
 * Purpose: Display press releases and media coverage
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PressItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  thumbnailUrl: string;
  source?: string;
}

export default function PressPage() {
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPressItems() {
      try {
        const response = await fetch('/api/notices?category=PRESS&per_page=20');
        const data = await response.json();

        if (data.success) {
          setPressItems(data.data);
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

    fetchPressItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">언론 보도</h1>
            <p className="text-red-500">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">언론 보도</h1>
          <p className="text-xl text-white/90">
            GLEC의 최신 뉴스와 언론 보도 자료
          </p>
        </div>
      </section>

      {/* Press Items Grid */}
      <main className="container mx-auto px-6 py-12">
        {pressItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">보도 자료가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressItems.map((item) => (
              <Link
                key={item.id}
                href={`/notices/${item.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
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
                      언론 보도
                    </span>
                    {item.source && (
                      <span className="text-xs text-gray-500">{item.source}</span>
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
