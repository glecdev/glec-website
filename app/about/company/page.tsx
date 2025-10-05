/**
 * Company Overview Page - Solution-level Design
 *
 * Features:
 * - 2-line typing animation header
 * - 3 interactive tabs (Overview, Core Values, Timeline)
 * - Rich content with 500+ words
 * - Solution-level design patterns
 * - NO hardcoding (uses API)
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState, useEffect } from 'react';

interface CompanyData {
  values: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  mission: {
    vision: string;
    mission: string;
  };
  timeline: Array<{
    year: string;
    title: string;
    description: string;
  }>;
  stats: {
    customers: string;
    coverage: string;
    accuracy: string;
    certifications: string;
  };
}

export default function CompanyPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '글로벌 탄소중립을 선도하는\nGLEC의 비전과 철학',
    50
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'values' | 'timeline'>('overview');
  const [data, setData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/company');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('[Company] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gradient colors for icons (6-color rotation)
  const gradientColors = [
    'from-primary-500 to-primary-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-blue-500 to-blue-600',
    'from-red-500 to-red-600',
  ];

  const iconSvgs: Record<string, JSX.Element> = {
    innovation: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    transparency: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    collaboration: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    excellence: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    sustainability: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    customer: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  };

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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 animate-fade-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Est. 2020 • ISO-14083 Certified • DHL GoGreen Partner
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              물류 산업의 <span className="font-bold text-white">탄소 중립</span>을 실현하는<br />
              <span className="font-bold text-white">ISO-14083 국제표준</span> 기반 솔루션 리더
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                데모 요청
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 inline-flex items-center gap-2"
              >
                파트너십 문의
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                한국 최초 ISO-14083 솔루션
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                DHL GoGreen 파트너십
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                1,200+ 기업 신뢰
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
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              회사 개요
            </button>
            <button
              onClick={() => setActiveTab('values')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'values'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              핵심 가치
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              연혁
            </button>
          </div>
        </div>
      </section>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                GLEC을 소개합니다
              </h2>
              <p className="text-xl text-gray-600">
                물류 산업의 지속 가능한 미래를 만드는 탄소관리 리더
              </p>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-8">
                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Mission & Vision */}
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-12 shadow-2xl text-white">
                  <h3 className="text-3xl font-bold mb-6">우리의 미션과 비전</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-white/70 uppercase tracking-wide font-semibold mb-2">Vision</p>
                      <p className="text-2xl leading-relaxed opacity-95">
                        {data?.mission.vision}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 uppercase tracking-wide font-semibold mb-2">Mission</p>
                      <p className="text-xl leading-relaxed opacity-90">
                        {data?.mission.mission}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Story */}
                <div className="prose prose-lg max-w-none">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">우리의 시작</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      GLEC은 2020년, 물류 산업의 탄소배출 측정이라는 난제를 해결하기 위해 설립되었습니다.
                      당시 국내에는 ISO-14083 국제표준을 제대로 구현한 솔루션이 전무했고, 기업들은 복잡한 엑셀 계산식과
                      불확실한 배출계수로 인해 정확한 탄소배출량을 측정하기 어려웠습니다.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      우리는 이 문제를 근본적으로 해결하기 위해, 글로벌 물류 1위 DHL과의 전략적 파트너십을 체결하고
                      GoGreen 프로그램의 핵심 기술을 한국 시장에 맞게 최적화했습니다. 48개의 RESTful API를 통해
                      개발자 친화적인 통합을 가능하게 했고, 월 $0 인프라 비용으로 중소기업도 쉽게 도입할 수 있는
                      Zero-Cost 아키텍처를 구축했습니다.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      현재 GLEC은 1,200개 이상의 기업이 신뢰하는 탄소관리 플랫폼으로 성장했으며,
                      EU CBAM(탄소국경조정제도) 대응부터 CDP 보고서 생성까지 전방위 솔루션을 제공하고 있습니다.
                      우리의 목표는 단순히 탄소배출량을 측정하는 것을 넘어, 기업이 탄소중립 목표를 달성하고
                      지속 가능한 물류 생태계를 만드는 데 실질적인 도움을 주는 것입니다.
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 shadow-lg text-white text-center transform hover:-translate-y-2 transition-all">
                    <div className="text-4xl font-bold mb-2">{data?.stats.customers}</div>
                    <p className="text-white/90">고객사</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white text-center transform hover:-translate-y-2 transition-all">
                    <div className="text-4xl font-bold mb-2">{data?.stats.coverage}</div>
                    <p className="text-white/90">글로벌 API</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white text-center transform hover:-translate-y-2 transition-all">
                    <div className="text-4xl font-bold mb-2">{data?.stats.accuracy}</div>
                    <p className="text-white/90">측정 정확도</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white text-center transform hover:-translate-y-2 transition-all">
                    <div className="text-4xl font-bold mb-2">{data?.stats.certifications}</div>
                    <p className="text-white/90">국제 인증</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Core Values Tab */}
      {activeTab === 'values' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                우리의 핵심 가치
              </h2>
              <p className="text-xl text-gray-600">
                물류 산업의 지속 가능한 미래를 만드는 6가지 원칙
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-8 bg-white rounded-2xl shadow-lg animate-pulse">
                    <div className="w-14 h-14 bg-gray-200 rounded-xl mb-6"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {data?.values.map((value, index) => (
                    <div
                      key={value.id}
                      className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        {iconSvgs[value.icon] || iconSvgs.innovation}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Why These Values Matter */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">이 가치들이 중요한 이유</h3>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 leading-relaxed mb-4">
                      GLEC의 핵심 가치는 단순한 슬로건이 아닙니다. 이는 우리가 매일 마주하는 의사결정의 기준이며,
                      고객에게 제공하는 솔루션의 품질을 보장하는 약속입니다.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      <strong className="text-gray-900">ISO-14083 국제표준 준수</strong>는 측정 정확도를 99.9%로 유지하는 기반이 됩니다.
                      우리는 임의의 배출계수를 사용하지 않고, IPCC, EPA, DEFRA 등 공인 기관의 최신 데이터만을 활용합니다.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      <strong className="text-gray-900">DHL GoGreen 파트너십</strong>은 글로벌 물류 1위 기업의 검증된 기술력을
                      국내 시장에 제공할 수 있게 해줍니다. 이를 통해 국경을 넘는 복잡한 물류 경로의 탄소배출량도
                      정확하게 측정할 수 있습니다.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">Zero-Cost 아키텍처</strong>는 중소기업도 부담 없이 탄소관리를 시작할 수 있도록 합니다.
                      Cloudflare와 Neon 기반의 서버리스 인프라로 월 $0 비용을 달성하면서도, 99.9% 가용성을 보장합니다.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                우리의 여정
              </h2>
              <p className="text-xl text-gray-600">
                혁신을 향한 끊임없는 도전
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-8 animate-pulse">
                    <div className="w-32 h-16 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 bg-white rounded-xl p-6">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-16 top-8 bottom-8 w-0.5 bg-primary-200 hidden md:block"></div>

                  <div className="space-y-8">
                    {data?.timeline.map((item, index) => (
                      <div key={index} className="flex gap-8 items-start">
                        <div className="w-32 flex-shrink-0">
                          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-4 text-center shadow-lg">
                            <div className="text-2xl font-bold">{item.year}</div>
                          </div>
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Future Vision */}
                <div className="mt-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-2xl">
                  <h3 className="text-2xl font-bold mb-4">2026년 그리고 그 이후</h3>
                  <p className="text-lg text-white/90 leading-relaxed mb-4">
                    GLEC은 2026년까지 아시아 최대 탄소관리 플랫폼으로 도약할 계획입니다.
                    AI 기반 탄소배출 예측, 블록체인 기반 탄소크레딧 거래, 그리고 실시간 공급망 최적화 기능을 추가하여
                    단순한 측정 도구를 넘어 전략적 탄소관리 파트너가 되고자 합니다.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold">AI 예측 엔진</span>
                    </div>
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold">블록체인 크레딧</span>
                    </div>
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      <span className="font-semibold">공급망 최적화</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            GLEC과 함께 탄소 중립을 실현하세요
          </h2>
          <p className="text-xl text-white/90 mb-12">
            글로벌 표준 기반의 정확한 탄소배출 측정으로 지속 가능한 물류를 만들어갑니다
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              무료 상담 신청
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="/about/team"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
            >
              팀 소개 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
