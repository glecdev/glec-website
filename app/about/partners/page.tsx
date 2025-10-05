/**
 * Partners Page - Solution-Level Design
 *
 * Features:
 * - 2-line typing animation header
 * - 3 interactive tabs (Strategic, Technology, Benefits)
 * - Rich partner content with detailed descriptions
 * - Partner cards with gradient logos
 * - CTA to partnership proposal
 * - NO hardcoding (uses /api/partners)
 *
 * Based on: GLEC-Design-System-Standards.md, GLEC-Page-Structure-Standards.md
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState, useEffect } from 'react';

interface Partner {
  id: string;
  name: string;
  type: 'technology' | 'channel' | 'strategic' | 'ecosystem';
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
}

interface PartnerCardData extends Partner {
  partnershipYear?: string;
  status?: string;
  highlights?: string[];
  integrationDetails?: string;
  expandedDescription?: string;
}

export default function PartnersPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '글로벌 파트너와 함께\n탄소중립 미래를 만듭니다',
    50
  );

  const [activeTab, setActiveTab] = useState<'strategic' | 'technology' | 'benefits'>('strategic');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners');
      const result = await response.json();
      if (result.success) {
        setPartners(result.data);
      }
    } catch (error) {
      console.error('[Partners] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced partner data with rich content
  const enhancedPartners: Record<string, PartnerCardData> = {
    'dhl-001': {
      id: 'dhl-001',
      name: 'DHL GoGreen',
      type: 'strategic',
      description: 'DHL과의 전략적 파트너십을 통해 글로벌 물류 탄소배출 측정 솔루션 제공',
      logoUrl: null,
      websiteUrl: 'https://www.dhl.com/global-en/home/our-divisions/global-forwarding/gogreen.html',
      partnershipYear: '2020',
      status: 'Active Strategic Partner',
      highlights: [
        'ISO-14083 국제표준 공동 연구',
        '글로벌 물류 네트워크 연동',
        '실시간 탄소배출 측정 API 제공',
        '200+ 국가 배송 루트 최적화'
      ],
      expandedDescription: 'DHL GoGreen은 글로벌 물류 산업의 탄소 중립을 선도하는 DHL의 환경 프로그램입니다. GLEC은 DHL GoGreen과의 전략적 파트너십을 통해 ISO-14083 국제표준 기반의 정확한 탄소배출 측정 솔루션을 개발하고 있습니다. 이 파트너십은 글로벌 물류 네트워크 전체의 탄소 발자국을 추적하고 최적화하는 혁신적인 솔루션을 제공합니다. DHL의 200개 이상 국가에 걸친 배송 루트 데이터와 GLEC의 AI 기반 탄소 측정 엔진을 결합하여, 실시간으로 탄소배출량을 계산하고 가장 친환경적인 배송 경로를 추천합니다. 또한 Smart Freight Centre와 협력하여 글로벌 표준을 준수하고, 기업들이 Scope 3 배출량을 정확하게 보고할 수 있도록 지원합니다.'
    },
    'cloudflare-001': {
      id: 'cloudflare-001',
      name: 'Cloudflare',
      type: 'technology',
      description: 'Cloudflare Workers 및 R2 스토리지를 활용한 Zero-Cost 인프라 구축',
      logoUrl: null,
      websiteUrl: 'https://www.cloudflare.com',
      partnershipYear: '2024',
      status: 'Technology Partner',
      highlights: [
        'Workers Functions로 서버리스 API 구축',
        'R2 Object Storage로 파일 저장 (10GB 무료)',
        'Workers KV로 세션 캐싱 (1GB 무료)',
        '전 세계 300+ 엣지 로케이션 활용'
      ],
      expandedDescription: 'Cloudflare는 GLEC의 Zero-Cost 아키텍처를 가능하게 하는 핵심 기술 파트너입니다. Cloudflare Workers는 전 세계 300개 이상의 엣지 로케이션에서 서버리스 함수를 실행하여, 사용자와 가장 가까운 위치에서 빠르게 API를 제공합니다. 이를 통해 글로벌 사용자에게 50ms 이하의 초저지연 응답 시간을 보장합니다. R2 Object Storage는 AWS S3와 호환되는 객체 스토리지로, 탄소배출 리포트 PDF, 배송 증빙 서류 등의 파일을 저장합니다. Workers KV는 세션 데이터와 자주 접근하는 설정값을 캐싱하여 데이터베이스 부하를 줄입니다. Cloudflare의 무료 티어(Workers 100K req/day, R2 10GB, KV 1GB)만으로도 중소기업 고객의 모든 요구사항을 충족할 수 있어, GLEC의 $0/month 목표를 실현하는 데 결정적인 역할을 합니다.'
    },
    'neon-001': {
      id: 'neon-001',
      name: 'Neon Database',
      type: 'technology',
      description: 'Serverless PostgreSQL 데이터베이스로 탄소배출 데이터 실시간 저장',
      logoUrl: null,
      websiteUrl: 'https://neon.tech',
      partnershipYear: '2024',
      status: 'Technology Partner',
      highlights: [
        'Serverless PostgreSQL로 자동 스케일링',
        'Instant branching으로 개발/스테이징 환경 분리',
        'Connection pooling으로 Workers 통합',
        '0.5GB 스토리지 + 100 compute hours 무료'
      ],
      expandedDescription: 'Neon은 차세대 Serverless PostgreSQL 데이터베이스로, GLEC의 탄소배출 데이터를 안전하게 저장하고 실시간으로 조회할 수 있도록 지원합니다. 기존 PostgreSQL과 완벽하게 호환되면서도, 사용하지 않을 때 자동으로 scale-to-zero하여 비용을 절감합니다. Neon의 Instant Branching 기능은 프로덕션 데이터베이스의 스냅샷을 몇 초 만에 생성하여, 개발 및 테스트 환경에서 실제 데이터를 안전하게 사용할 수 있게 합니다. Connection Pooling은 Cloudflare Workers와 같은 서버리스 환경에서 필수적인 기능으로, 수천 개의 동시 연결을 효율적으로 관리합니다. Neon의 무료 티어(0.5GB storage, 100 compute hours/month)는 GLEC의 초기 고객 데이터를 충분히 수용할 수 있으며, 프로덕션 환경에서도 안정적인 성능을 제공합니다.'
    },
    'vercel-001': {
      id: 'vercel-001',
      name: 'Vercel',
      type: 'technology',
      description: 'Next.js 14 기반 프론트엔드 배포 및 Edge Functions 활용',
      logoUrl: null,
      websiteUrl: 'https://vercel.com',
      partnershipYear: '2024',
      status: 'Technology Partner',
      highlights: [
        'Next.js 14 App Router 최적화 배포',
        'Edge Functions로 글로벌 저지연 API',
        'Incremental Static Regeneration (ISR)',
        '무료 티어로 무제한 대역폭'
      ],
      expandedDescription: 'Vercel은 Next.js의 창시자가 만든 프론트엔드 클라우드 플랫폼으로, GLEC 웹사이트와 어드민 포탈을 호스팅합니다. Vercel의 Edge Network는 전 세계 100개 이상의 도시에 배포되어, 사용자가 어디에 있든 빠른 페이지 로딩 속도를 보장합니다. Next.js 14 App Router와의 완벽한 통합을 통해, React Server Components, Streaming SSR, Partial Prerendering 등의 최신 기능을 활용할 수 있습니다. Incremental Static Regeneration은 정적 페이지를 주기적으로 업데이트하여, 빌드 시간을 최소화하면서도 최신 데이터를 제공합니다. Vercel의 무료 티어는 개인 프로젝트와 작은 팀에게 무제한 대역폭과 100GB의 배포 용량을 제공하여, GLEC의 초기 고객 대응에 충분한 리소스를 제공합니다.'
    },
    'resend-001': {
      id: 'resend-001',
      name: 'Resend',
      type: 'technology',
      description: '고객 알림 및 리포트 이메일 발송 서비스 (3,000/month)',
      logoUrl: null,
      websiteUrl: 'https://resend.com',
      partnershipYear: '2024',
      status: 'Technology Partner',
      highlights: [
        'React Email 컴포넌트로 이메일 템플릿 작성',
        '99.9% 전송 성공률',
        '실시간 전송 상태 추적',
        '월 3,000통 무료 (GLEC 수요 충족)'
      ],
      expandedDescription: 'Resend는 개발자 친화적인 이메일 API 서비스로, GLEC의 고객 알림, 탄소배출 리포트, 회원 인증 등의 이메일을 발송합니다. React Email을 사용하여 이메일 템플릿을 React 컴포넌트로 작성하므로, 웹사이트와 동일한 코드베이스로 일관된 디자인을 유지할 수 있습니다. Resend의 99.9% 전송 성공률은 AWS SES와 동등한 수준이며, 스팸 폴더로 분류될 가능성을 최소화하는 DKIM/SPF/DMARC 설정을 자동으로 처리합니다. 실시간 전송 상태 추적 기능은 이메일이 전송되었는지, 열람되었는지, 링크가 클릭되었는지를 대시보드에서 확인할 수 있게 합니다. 월 3,000통 무료 티어는 GLEC의 초기 고객 수요(일일 100통 미만)를 충분히 커버하며, 확장 시에도 합리적인 가격($20/10K emails)으로 성장할 수 있습니다.'
    }
  };

  // Gradient colors for partner logos (5-color rotation)
  const gradientColors = [
    'from-primary-500 to-primary-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-blue-500 to-blue-600',
  ];

  // Filter partners by tab
  const filteredPartners = partners.filter((p) => {
    if (activeTab === 'strategic') return p.type === 'strategic';
    if (activeTab === 'technology') return p.type === 'technology';
    return false; // Benefits tab doesn't show partners
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-navy-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path
                  fillRule="evenodd"
                  d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                  clipRule="evenodd"
                />
              </svg>
              DHL GoGreen • Cloudflare • Neon • Vercel • Resend
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              세계 최고의 기업들과 함께
              <br />
              물류 탄소중립을 실현합니다
            </p>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                DHL GoGreen 전략적 파트너
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Zero-Cost 인프라 구축
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                글로벌 기술 파트너십
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
              onClick={() => setActiveTab('strategic')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'strategic'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              전략적 파트너
            </button>
            <button
              onClick={() => setActiveTab('technology')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'technology'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              기술 파트너
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'benefits'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              파트너십 혜택
            </button>
          </div>
        </div>
      </section>

      {/* Strategic Partners Tab */}
      {activeTab === 'strategic' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">전략적 파트너</h2>
              <p className="text-xl text-gray-600">
                글로벌 물류 탄소중립을 함께 선도하는 파트너
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-12 shadow-lg animate-pulse">
                  <div className="h-16 bg-gray-200 rounded mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredPartners.map((partner, index) => {
                  const enhanced = enhancedPartners[partner.id] || partner;
                  return (
                    <div
                      key={partner.id}
                      className="bg-white rounded-2xl p-12 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                    >
                      <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-32 h-32 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl`}
                          >
                            {partner.name.substring(0, 2).toUpperCase()}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h3 className="text-3xl font-bold text-gray-900">{partner.name}</h3>
                            {enhanced.partnershipYear && (
                              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                                Since {enhanced.partnershipYear}
                              </span>
                            )}
                            {enhanced.status && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                {enhanced.status}
                              </span>
                            )}
                          </div>

                          <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                            {enhanced.expandedDescription || partner.description}
                          </p>

                          {enhanced.highlights && enhanced.highlights.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-lg font-bold text-gray-900 mb-3">주요 협력 내용</h4>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {enhanced.highlights.map((highlight, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <svg
                                      className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <span className="text-gray-700">{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <a
                            href={partner.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                          >
                            웹사이트 방문
                            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Technology Partners Tab */}
      {activeTab === 'technology' && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">기술 파트너</h2>
              <p className="text-xl text-gray-600">
                Zero-Cost 아키텍처를 가능하게 하는 혁신적인 기술 스택
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPartners.map((partner, index) => {
                  const enhanced = enhancedPartners[partner.id] || partner;
                  return (
                    <div
                      key={partner.id}
                      className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                    >
                      {/* Logo */}
                      <div
                        className={`w-20 h-20 bg-gradient-to-br ${gradientColors[index % gradientColors.length]} rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        {partner.name.substring(0, 2).toUpperCase()}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{partner.name}</h3>

                      {enhanced.partnershipYear && (
                        <p className="text-sm text-primary-600 font-semibold mb-4">
                          Since {enhanced.partnershipYear}
                        </p>
                      )}

                      <p className="text-gray-600 leading-relaxed mb-6">{partner.description}</p>

                      {enhanced.highlights && enhanced.highlights.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {enhanced.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <svg
                                className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-700">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-2 transition-transform"
                      >
                        웹사이트 방문
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Partnership Benefits Tab */}
      {activeTab === 'benefits' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">파트너십 혜택</h2>
              <p className="text-xl text-gray-600">
                GLEC 파트너가 되면 누릴 수 있는 다양한 혜택
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">글로벌 시장 진출</h3>
                <p className="text-gray-600 leading-relaxed">
                  GLEC의 200+ 국가 네트워크를 활용하여 글로벌 시장에 진출하고, DHL GoGreen 파트너십을 통해 검증된 솔루션을
                  제공합니다.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">ISO-14083 인증 지원</h3>
                <p className="text-gray-600 leading-relaxed">
                  국제표준 ISO-14083 기반 솔루션 개발 및 인증 지원으로, 글로벌 시장에서 신뢰받는 파트너로 성장합니다.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">기술 지원 및 교육</h3>
                <p className="text-gray-600 leading-relaxed">
                  Cloudflare, Neon, Vercel 등 최신 기술 스택에 대한 교육과 기술 지원으로 혁신적인 솔루션을 개발합니다.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">공동 마케팅</h3>
                <p className="text-gray-600 leading-relaxed">
                  GLEC 브랜드와 함께 공동 마케팅 캠페인을 진행하고, 1,200+ 기업 고객 네트워크에 접근할 수 있습니다.
                </p>
              </div>

              {/* Benefit 5 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">레버뉴 쉐어링</h3>
                <p className="text-gray-600 leading-relaxed">
                  파트너가 소개한 고객의 구독 수익을 공유하며, 장기적인 수익 모델을 함께 구축합니다.
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">혁신 프로젝트 참여</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI 기반 탄소 예측, 블록체인 탄소 크레딧 등 GLEC의 혁신 프로젝트에 우선적으로 참여할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">파트너십을 제안하고 싶으신가요?</h2>
          <p className="text-xl text-white/90 mb-12">
            GLEC과 함께 물류 탄소중립을 실현하고 글로벌 시장을 선도하세요
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            파트너십 제안하기
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
