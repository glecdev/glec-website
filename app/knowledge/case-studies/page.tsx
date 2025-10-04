/**
 * Case Studies Page - World-class Design
 *
 * Based on: GLEC-Design-System-Standards.md
 * Features: 2-line typing animation, interactive tabs, gradient SVG icons, filtering
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState, useEffect, useMemo } from 'react';

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  industry: 'LOGISTICS' | 'MANUFACTURING' | 'RETAIL' | 'GLOBAL';
  challenge: string;
  solution: string;
  results: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  pdfUrl: string;
  publishedAt: string;
}

const CATEGORY_LABELS = {
  ALL: '전체',
  LOGISTICS: '물류',
  MANUFACTURING: '제조',
  RETAIL: '유통',
  GLOBAL: '글로벌',
};

export default function CaseStudiesPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '실제 성공 사례로 증명합니다\n고객사의 탄소배출 혁신 스토리',
    50
  );

  const [activeTab, setActiveTab] = useState<'all' | 'industry' | 'results'>('all');
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<keyof typeof CATEGORY_LABELS>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/knowledge/case-studies');
      const data = await response.json();

      if (data.success) {
        setCaseStudies(data.data || []);
      }
    } catch (error) {
      console.error('[CaseStudies] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter case studies based on industry and search
  const filteredCaseStudies = useMemo(() => {
    let filtered = caseStudies;

    if (selectedIndustry !== 'ALL') {
      filtered = filtered.filter((cs) => cs.industry === selectedIndustry);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cs) =>
          cs.title.toLowerCase().includes(query) ||
          cs.company.toLowerCase().includes(query) ||
          cs.challenge.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [caseStudies, selectedIndustry, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-navy-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Case Studies • 고객 성공 사례 • 무료 다운로드
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              DHL부터 중소 물류사까지, 실제 탄소배출 감축 사례를 확인하세요
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="사례 검색 (회사명, 산업)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 shadow-xl"
                />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                20+ 성공 사례
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                평균 25% 감축
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ROI 6개월
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              전체 사례
            </button>
            <button
              onClick={() => setActiveTab('industry')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'industry'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              산업별
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'results'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              성과별
            </button>
          </div>
        </div>
      </section>

      {/* Industry Filter */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedIndustry(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  selectedIndustry === key
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[16/9] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredCaseStudies.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">사례가 없습니다</h3>
              <p className="text-gray-600">다른 산업을 선택하거나 검색어를 변경해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredCaseStudies.map((cs, index) => {
                const gradients = [
                  'from-primary-500 to-primary-600',
                  'from-green-500 to-green-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600',
                  'from-blue-500 to-blue-600',
                  'from-red-500 to-red-600',
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <div
                    key={cs.id}
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
                  >
                    {/* Company Header */}
                    <div className={`p-8 bg-gradient-to-br ${gradient} text-white`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold opacity-80 mb-2">
                            {CATEGORY_LABELS[cs.industry]}
                          </div>
                          <h3 className="text-2xl font-bold">{cs.company}</h3>
                        </div>
                        <svg className="w-12 h-12 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                        {cs.title}
                      </h4>

                      <div className="space-y-4 mb-6">
                        <div>
                          <div className="text-sm font-semibold text-gray-500 mb-1">과제</div>
                          <p className="text-gray-700 text-sm line-clamp-2">{cs.challenge}</p>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-500 mb-1">해결</div>
                          <p className="text-gray-700 text-sm line-clamp-2">{cs.solution}</p>
                        </div>
                      </div>

                      {/* Metrics */}
                      {cs.metrics && cs.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {cs.metrics.slice(0, 2).map((metric, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-primary-600">{metric.value}</div>
                              <div className="text-xs text-gray-600">{metric.label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
                        전체 사례 다운로드
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            우리 회사 사례도 만들고 싶으신가요?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            무료 데모로 탄소배출 감축 가능성을 확인해보세요
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            무료 데모 신청
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
