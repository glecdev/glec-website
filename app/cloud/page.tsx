/**
 * GLEC Cloud Product Page
 *
 * GLEC Cloud - 실시간 모니터링 및 자동 보고서 생성 SaaS
 * Based on: FR-WEB-005 (Pricing Section), FR-WEB-003 (Solution Overview)
 */

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC Cloud - 실시간 모니터링 및 자동 보고서 생성 SaaS (월 12만원부터)',
  description:
    '차량 10대부터 시작하는 클라우드 기반 탄소배출 관리 솔루션. 실시간 모니터링, 자동 보고서 생성, 데이터 내보내기. 14일 무료 체험.',
};

export default function CloudPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              GLEC Cloud
            </h1>
            <p className="text-2xl lg:text-3xl mb-4">
              매일 밤 11시, 엑셀과의 전쟁을 끝내세요
            </p>
            <p className="text-xl text-blue-100 mb-12">
              실시간 모니터링 · 자동 보고서 생성 · 데이터 내보내기
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-500 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                14일 무료 체험
              </Link>

              <Link
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-500 active:bg-gray-50 transition-all duration-200"
              >
                가격 확인하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Overview Section */}
      <section className="py-16 bg-primary-50" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-lg p-8 ${
                    tier.featured
                      ? 'ring-2 ring-primary-500 relative'
                      : ''
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        인기
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-gray-600 mb-6">{tier.description}</p>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-primary-500">
                      {tier.price}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{tier.unit}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-primary-500 mr-2 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      tier.featured
                        ? 'bg-primary-500 text-white hover:bg-primary-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              핵심 기능
            </h2>
            <p className="text-xl text-gray-600">
              엑셀 수작업을 자동화하고 실시간으로 모니터링하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-primary-500 text-3xl">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              직관적인 대시보드
            </h2>
            <p className="text-xl text-gray-600">
              복잡한 데이터를 한눈에 파악하세요
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-12">
            {dashboardFeatures.map((item, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Screenshot Placeholder */}
                <div
                  className={`relative aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center ${
                    index % 2 === 1 ? 'lg:order-2' : ''
                  }`}
                >
                  <div className="text-center text-gray-500">
                    <svg
                      className="w-24 h-24 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                    <p className="text-sm">{item.screenshot}</p>
                  </div>
                </div>

                {/* Description */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">{item.description}</p>
                  <ul className="space-y-3">
                    {item.points.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="w-6 h-6 text-primary-500 mr-3 mt-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              완벽한 통합 생태계
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              GLEC DTG + Carbon API + GLEC Cloud로 완성되는 탄소배출 관리
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {integrations.map((integration, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-lg">
                  <div className="text-4xl mb-4">{integration.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {integration.name}
                  </h3>
                  <p className="text-gray-600">{integration.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary-50 p-8 rounded-lg">
              <p className="text-gray-700 text-lg">
                <span className="font-semibold">DTG 하드웨어</span>로 데이터 수집 →{' '}
                <span className="font-semibold">Carbon API</span>로 배출량 계산 →{' '}
                <span className="font-semibold">GLEC Cloud</span>로 보고서 자동 생성
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                왜 GLEC Cloud인가?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 mx-auto">
                    {benefit.value}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                고객사 성과
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {customerResults.map((result, index) => (
                  <div key={index} className="text-center p-6 bg-primary-50 rounded-lg">
                    <p className="text-3xl font-bold text-primary-500 mb-2">
                      {result.metric}
                    </p>
                    <p className="text-gray-700">{result.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              14일 무료 체험
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              신용카드 등록 없이 바로 시작하세요. 언제든 취소 가능합니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-500 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                무료 체험 시작
              </Link>

              <a
                href="tel:010-4481-5189"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-500 active:bg-gray-50 transition-all duration-200"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                전화 상담: 010-4481-5189
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const pricingTiers = [
  {
    name: 'Basic',
    description: '중소형 물류기업',
    price: '월 12만원',
    unit: '차량 10대까지',
    features: [
      '차량 10대 모니터링',
      '실시간 대시보드',
      '월간 자동 보고서',
      '이메일 지원',
      '데이터 내보내기 (CSV)',
    ],
    cta: '무료 체험 시작',
    featured: false,
  },
  {
    name: 'Pro',
    description: '성장하는 물류기업',
    price: '월 35만원',
    unit: '차량 50대까지',
    features: [
      '차량 50대 모니터링',
      '실시간 대시보드',
      '주간/월간 자동 보고서',
      '전화 + 이메일 지원',
      '데이터 내보내기 (CSV, Excel)',
      'API 연동',
      '맞춤형 리포트',
    ],
    cta: '무료 체험 시작',
    featured: true,
  },
  {
    name: 'Enterprise',
    description: '대형 물류기업',
    price: '별도 협의',
    unit: '차량 100대 이상',
    features: [
      '무제한 차량 모니터링',
      '실시간 대시보드',
      '커스텀 보고서',
      '전담 매니저',
      '모든 형식 데이터 내보내기',
      'API 연동',
      '온프레미스 설치 옵션',
      'SLA 99.9% 보장',
    ],
    cta: '상담 신청',
    featured: false,
  },
];

const features = [
  {
    icon: '📊',
    title: '실시간 모니터링',
    description:
      '모든 차량의 운행 상태와 탄소배출량을 실시간으로 확인하세요. 지도 위에서 직관적으로 표시됩니다.',
  },
  {
    icon: '📄',
    title: '자동 보고서 생성',
    description:
      '매월 1일 00시에 ISO-14083 표준 보고서가 자동 생성되어 이메일로 전송됩니다. 더 이상 엑셀 작업은 필요 없습니다.',
  },
  {
    icon: '📤',
    title: '데이터 내보내기',
    description:
      'CSV, Excel, PDF 형식으로 언제든 데이터를 내보낼 수 있습니다. 화주사 요청에 즉시 대응하세요.',
  },
  {
    icon: '📧',
    title: '이메일 알림',
    description:
      '설정한 임계값을 초과하면 즉시 이메일 알림을 받습니다. 이상 상황을 놓치지 마세요.',
  },
  {
    icon: '🔗',
    title: 'API 연동',
    description:
      '기존 ERP, TMS와 쉽게 연동할 수 있습니다. RESTful API로 모든 데이터에 접근하세요.',
  },
  {
    icon: '🔐',
    title: '안전한 보안',
    description:
      'ISO 27001 인증 데이터센터에서 운영됩니다. 모든 통신은 TLS 1.3 암호화로 보호됩니다.',
  },
];

const dashboardFeatures = [
  {
    title: '한눈에 보는 전체 현황',
    description:
      '모든 차량의 운행 상태, 금주/금월 탄소배출량, 전월 대비 증감률을 한 화면에서 확인하세요.',
    points: [
      '실시간 차량 위치 지도',
      '금주/금월 배출량 트렌드 그래프',
      '상위 5대 배출 차량 순위',
    ],
    screenshot: '대시보드 메인 화면',
  },
  {
    title: '상세 차량별 분석',
    description:
      '각 차량의 운행 이력, 연료 소비량, 배출량을 일/주/월 단위로 분석하세요.',
    points: [
      '차량별 일일 운행 기록',
      '연료 효율 분석',
      '배출량 변화 추이',
    ],
    screenshot: '차량 상세 분석 화면',
  },
  {
    title: '자동 생성 보고서',
    description:
      'ISO-14083 표준 포맷의 PDF 보고서가 매월 자동 생성됩니다.',
    points: [
      '월간/연간 배출량 요약',
      '화주사별 배출량 집계',
      '감축 목표 대비 달성률',
    ],
    screenshot: '보고서 미리보기',
  },
];

const integrations = [
  {
    icon: '🔌',
    name: 'GLEC DTG',
    description: '차량 데이터 자동 수집',
  },
  {
    icon: '⚡',
    name: 'Carbon API',
    description: '실시간 배출량 계산',
  },
  {
    icon: '☁️',
    name: 'GLEC Cloud',
    description: '보고서 자동 생성',
  },
];

const benefits = [
  {
    value: '80%',
    title: '업무 자동화',
    description: '수작업 데이터 입력 시간 80% 절감',
  },
  {
    value: '5분',
    title: '보고서 생성',
    description: '엑셀 3시간 → 클릭 5분으로 단축',
  },
  {
    value: '24/7',
    title: '실시간 모니터링',
    description: '언제 어디서나 접속 가능',
  },
];

const customerResults = [
  {
    metric: '158만 톤',
    description: 'DHL 연간 CO₂ 감축량',
  },
  {
    metric: '92%',
    description: '고객 만족도 (NPS)',
  },
  {
    metric: '3개월',
    description: '평균 ROI 달성 기간',
  },
];
