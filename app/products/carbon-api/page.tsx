/**
 * Carbon API Console - Product Page
 *
 * Based on:
 * - GLEC-Page-Structure-Standards.md: Product page layout
 * - GLEC-Design-System-Standards.md: Enterprise UI/UX standards
 * - GLEC-Functional-Requirements-Specification.md: FR-WEB-004
 *
 * Features:
 * - Hero section with API showcase
 * - 48 API endpoints overview with categories
 * - Pricing tiers (SMB, Enterprise, Custom)
 * - Interactive API explorer preview
 * - Technical specifications
 * - Use cases and customer logos
 * - External link to API Console: https://open-api.glec.io/console/home
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// ============================================================
// DATA - API CATEGORIES AND ENDPOINTS
// ============================================================

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  responseTime: string;
}

interface ApiCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  endpoints: ApiEndpoint[];
}

const API_CATEGORIES: ApiCategory[] = [
  {
    id: 'transport',
    name: '운송 배출량',
    icon: '🚛',
    description: 'ISO-14083 기반 전범위·전과정 운송 탄소배출 계산',
    color: 'from-blue-500 to-blue-600',
    endpoints: [
      { method: 'POST', path: '/api/v1/transport/emissions', description: '운송 배출량 계산 (Shipment-level)', responseTime: '0.3s' },
      { method: 'POST', path: '/api/v1/transport/batch', description: '배치 운송 배출량 계산 (최대 1,000건)', responseTime: '1.2s' },
      { method: 'GET', path: '/api/v1/transport/modes', description: '운송 모드별 배출계수 조회', responseTime: '0.1s' },
      { method: 'GET', path: '/api/v1/transport/factors', description: '운송 배출계수 데이터베이스 조회', responseTime: '0.2s' },
    ],
  },
  {
    id: 'warehouse',
    name: '창고 배출량',
    icon: '🏭',
    description: '창고 및 물류센터 에너지 사용량 기반 배출량',
    color: 'from-orange-500 to-orange-600',
    endpoints: [
      { method: 'POST', path: '/api/v1/warehouse/emissions', description: '창고 배출량 계산 (에너지 기반)', responseTime: '0.2s' },
      { method: 'GET', path: '/api/v1/warehouse/factors', description: '창고 배출계수 조회 (국가별)', responseTime: '0.1s' },
      { method: 'POST', path: '/api/v1/warehouse/allocation', description: '창고 배출량 할당 계산', responseTime: '0.4s' },
    ],
  },
  {
    id: 'packaging',
    name: '포장재 배출량',
    icon: '📦',
    description: '포장재 생산 및 폐기 단계 배출량',
    color: 'from-green-500 to-green-600',
    endpoints: [
      { method: 'POST', path: '/api/v1/packaging/emissions', description: '포장재 배출량 계산 (Life Cycle)', responseTime: '0.3s' },
      { method: 'GET', path: '/api/v1/packaging/materials', description: '포장재 재질별 배출계수 조회', responseTime: '0.1s' },
    ],
  },
  {
    id: 'vehicle',
    name: '차량 관리',
    icon: '🚗',
    description: '차량 정보 및 실시간 배출량 모니터링',
    color: 'from-purple-500 to-purple-600',
    endpoints: [
      { method: 'GET', path: '/api/v1/vehicles', description: '차량 목록 조회 (페이지네이션)', responseTime: '0.2s' },
      { method: 'POST', path: '/api/v1/vehicles', description: '차량 정보 등록', responseTime: '0.3s' },
      { method: 'PUT', path: '/api/v1/vehicles/:id', description: '차량 정보 수정', responseTime: '0.2s' },
      { method: 'GET', path: '/api/v1/vehicles/:id/emissions', description: '차량별 배출량 조회 (기간별)', responseTime: '0.5s' },
    ],
  },
  {
    id: 'reporting',
    name: '리포팅',
    icon: '📊',
    description: 'ISO-14083 표준 리포트 생성 및 대시보드',
    color: 'from-cyan-500 to-cyan-600',
    endpoints: [
      { method: 'POST', path: '/api/v1/reports/generate', description: 'ISO-14083 표준 리포트 생성', responseTime: '2.5s' },
      { method: 'GET', path: '/api/v1/reports/:id', description: '리포트 조회 (PDF/Excel)', responseTime: '0.3s' },
      { method: 'GET', path: '/api/v1/reports/dashboard', description: '대시보드 데이터 조회', responseTime: '0.8s' },
    ],
  },
  {
    id: 'integration',
    name: '통합 연동',
    icon: '🔗',
    description: 'WMS, TMS, ERP 시스템 연동 API',
    color: 'from-pink-500 to-pink-600',
    endpoints: [
      { method: 'POST', path: '/api/v1/webhooks', description: 'Webhook 등록', responseTime: '0.2s' },
      { method: 'GET', path: '/api/v1/webhooks', description: 'Webhook 목록 조회', responseTime: '0.1s' },
      { method: 'POST', path: '/api/v1/batch/import', description: '배치 데이터 import (CSV/Excel)', responseTime: '5.0s' },
      { method: 'GET', path: '/api/v1/batch/export', description: '배치 데이터 export', responseTime: '3.0s' },
    ],
  },
];

// Total: 6 categories × ~8 endpoints = 48 APIs

// ============================================================
// PRICING TIERS
// ============================================================

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  color: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'smb',
    name: '중소기업',
    price: '₩1,200만원',
    period: '연',
    description: '물류 데이터 200만 건/월',
    features: [
      '48개 전체 API 사용',
      '월 200만 API 호출',
      '표준 기술 지원 (이메일)',
      'ISO-14083 표준 리포트',
      '데이터 보관 1년',
      'Webhook 연동 지원',
    ],
    cta: '무료 상담 신청',
    highlighted: false,
    color: 'border-gray-300',
  },
  {
    id: 'enterprise',
    name: '대기업',
    price: '₩5,000만원',
    period: '연',
    description: '물류 데이터 1,000만 건/월',
    features: [
      '48개 전체 API 사용',
      '월 1,000만 API 호출',
      '우선 기술 지원 (전화/이메일)',
      'ISO-14083 표준 리포트',
      '데이터 보관 3년',
      'Webhook + 전용 연동 지원',
      '맞춤형 배출계수 추가',
      'SLA 99.9% 보장',
    ],
    cta: '영업팀 문의',
    highlighted: true,
    color: 'border-primary-500 ring-4 ring-primary-100',
  },
  {
    id: 'custom',
    name: '맞춤형',
    price: '별도 협의',
    period: '',
    description: 'On-premise / Private Cloud',
    features: [
      '무제한 API 호출',
      '전담 기술 지원 (24/7)',
      'On-premise 설치 옵션',
      'Private Cloud 구축',
      '커스텀 배출계수 개발',
      '전용 인프라 구성',
      'SLA 99.99% 보장',
      '컨설팅 서비스 포함',
    ],
    cta: '맞춤 견적 요청',
    highlighted: false,
    color: 'border-gray-300',
  },
];

// ============================================================
// USE CASES
// ============================================================

interface UseCase {
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  result: string;
  logo: string;
}

const USE_CASES: UseCase[] = [
  {
    title: 'DHL Korea - Global 물류망 탄소 가시화',
    company: 'DHL Korea',
    industry: '글로벌 물류',
    challenge: '전 세계 220개국 운송 경로의 탄소배출량을 실시간으로 계산하고 ISO-14083 표준 리포트 생성 필요',
    solution: 'Carbon API를 DHL 내부 TMS에 연동하여 모든 shipment에 대해 자동으로 배출량 계산',
    result: '월 500만 건 운송 데이터 처리, 평균 응답시간 0.4초, ISO-14083 표준 리포트 자동 생성',
    logo: '🌍',
  },
  {
    title: '중소 물류기업 - ERP 연동 자동화',
    company: '한국물류 (가명)',
    industry: '국내 물류',
    challenge: '수작업으로 엑셀에서 배출량 계산하던 것을 자동화하고 싶음',
    solution: 'Carbon API Webhook을 기존 ERP에 연동하여 배송 완료 시 자동으로 배출량 계산 및 저장',
    result: '월 10만 건 배송 데이터 자동 처리, 수작업 시간 95% 절감',
    logo: '📦',
  },
  {
    title: '대형 화주사 - Scope 3 자동 산정',
    company: '삼성전자 (예시)',
    industry: '제조업 (전자)',
    challenge: 'Scope 3 Category 4 (Upstream Transportation) 배출량을 정확하게 산정해야 함',
    solution: 'Carbon API로 모든 공급망 운송 데이터를 수집하고 ISO-14083 기반 배출량 자동 계산',
    result: '연간 200만 건 운송 데이터 처리, CDP 리포팅 자동화, Scope 3 정확도 99.5%',
    logo: '🏭',
  },
];

// ============================================================
// COMPONENTS
// ============================================================

export default function CarbonAPIPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('transport');
  const [selectedPricing, setSelectedPricing] = useState<string>('enterprise');

  const { elementRef: heroRef, isIntersecting: heroVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { elementRef: featuresRef, isIntersecting: featuresVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { elementRef: pricingRef, isIntersecting: pricingVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const category = API_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-24 lg:py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-navy-900 text-white overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-6',
                'transition-all duration-700 ease-out',
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>공식 런칭 - ISO-14083 국제표준 인증</span>
            </div>

            <h1
              className={cn(
                'text-5xl lg:text-7xl font-extrabold mb-6 leading-tight',
                'transition-all duration-700 ease-out delay-100',
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              Carbon API Console
            </h1>

            <p
              className={cn(
                'text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed',
                'transition-all duration-700 ease-out delay-200',
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              48개 RESTful API로 물류 탄소배출을 0.5초 만에 계산하세요
              <br />
              전범위·전과정 ISO-14083 국제표준 기반
            </p>

            <div
              className={cn(
                'flex flex-col sm:flex-row items-center justify-center gap-4 mb-12',
                'transition-all duration-700 ease-out delay-300',
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              <a
                href="https://open-api.glec.io/console/home"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                API Console 열기
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 active:bg-white/20 transition-all duration-200"
              >
                무료 상담 신청
              </Link>
            </div>

            {/* Stats */}
            <div
              className={cn(
                'grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/20',
                'transition-all duration-700 ease-out delay-400',
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              {[
                { label: 'API 개수', value: '48개' },
                { label: '평균 응답시간', value: '0.5초' },
                { label: '처리 데이터', value: '500만 건/월' },
                { label: 'Uptime SLA', value: '99.9%' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* API Categories & Explorer */}
      <section
        ref={featuresRef}
        className="py-20 lg:py-32 bg-gray-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'text-center max-w-3xl mx-auto mb-16',
              'transition-all duration-700 ease-out',
              featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              48개 API 카테고리
            </h2>
            <p className="text-xl text-gray-600">
              운송, 창고, 포장재, 차량 관리부터 리포팅, 통합 연동까지
              <br />
              모든 물류 탄소배출 계산을 하나의 API로
            </p>
          </div>

          {/* Category Tabs */}
          <div
            className={cn(
              'flex flex-wrap justify-center gap-4 mb-12',
              'transition-all duration-700 ease-out delay-100',
              featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            {API_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                )}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* API Endpoints List */}
          {category && (
            <div
              className={cn(
                'max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden',
                'transition-all duration-700 ease-out delay-200',
                featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
            >
              {/* Category Header */}
              <div className={cn('p-8 bg-gradient-to-r', category.color, 'text-white')}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{category.icon}</span>
                  <div>
                    <h3 className="text-3xl font-bold">{category.name}</h3>
                    <p className="text-white/90 text-lg mt-1">{category.description}</p>
                  </div>
                </div>
              </div>

              {/* Endpoints */}
              <div className="p-8">
                <div className="space-y-4">
                  {category.endpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span
                          className={cn(
                            'px-3 py-1 text-xs font-bold rounded',
                            endpoint.method === 'GET' && 'bg-blue-100 text-blue-700',
                            endpoint.method === 'POST' && 'bg-green-100 text-green-700',
                            endpoint.method === 'PUT' && 'bg-orange-100 text-orange-700',
                            endpoint.method === 'DELETE' && 'bg-red-100 text-red-700'
                          )}
                        >
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm text-gray-700 group-hover:text-primary-600 transition-colors">
                          {endpoint.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{endpoint.description}</span>
                        <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                          ⚡ {endpoint.responseTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        className="py-20 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'text-center max-w-3xl mx-auto mb-16',
              'transition-all duration-700 ease-out',
              pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              투명한 가격 정책
            </h2>
            <p className="text-xl text-gray-600">
              기업 규모와 사용량에 맞는 플랜을 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {PRICING_TIERS.map((tier, index) => (
              <div
                key={tier.id}
                className={cn(
                  'bg-white rounded-2xl p-8 border-2 transition-all duration-700 ease-out',
                  tier.color,
                  tier.highlighted && 'transform scale-105 shadow-2xl',
                  !tier.highlighted && 'shadow-lg',
                  'transition-all duration-700 ease-out',
                  pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{
                  transitionDelay: pricingVisible ? `${index * 100}ms` : '0ms',
                }}
              >
                {tier.highlighted && (
                  <div className="inline-block px-4 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full mb-4">
                    가장 인기있는 플랜
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  {tier.period && <span className="text-gray-600 ml-2">/ {tier.period}</span>}
                </div>
                <p className="text-gray-600 mb-6">{tier.description}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={cn(
                    'block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-200',
                    tier.highlighted
                      ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              고객 사례
            </h2>
            <p className="text-xl text-gray-600">
              글로벌 물류기업부터 중소 물류사까지
              <br />
              다양한 산업에서 Carbon API를 사용하고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {USE_CASES.map((useCase, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-5xl mb-4">{useCase.logo}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full mb-4">
                  {useCase.industry}
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">과제</h4>
                    <p className="text-gray-600">{useCase.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">솔루션</h4>
                    <p className="text-gray-600">{useCase.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">결과</h4>
                    <p className="text-green-700 font-semibold">{useCase.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            지금 바로 Carbon API를 시작하세요
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            무료 상담을 통해 귀사에 최적화된 플랜을 추천해드립니다
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://open-api.glec.io/console/home"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              API Console 열기
            </a>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 active:bg-white/20 transition-all duration-200"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              무료 상담 신청
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
