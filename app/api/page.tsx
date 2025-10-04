/**
 * Carbon API Product Page
 *
 * GLEC Carbon API - ISO-14083 국제표준 탄소배출 계산 API
 * Based on: FR-WEB-008
 */

import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GLEC Carbon API - ISO-14083 국제표준 탄소배출 계산 API (0.5초 응답)',
  description:
    '48개 API 엔드포인트로 5가지 운송 모드(육로, 해상, 물류허브, 항공, 철도)의 탄소배출량을 0.5초 이내에 계산. 한국형 WTW 배출계수 적용, 사용량 기반 종량제.',
};

export default function CarbonAPIPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              GLEC Carbon API
            </h1>
            <p className="text-2xl lg:text-3xl mb-4">
              0.5초의 마법
            </p>
            <p className="text-xl text-blue-100 mb-12">
              ISO-14083 국제표준 기반 탄소배출량 계산 API
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-500 bg-white rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                API 키 발급 신청
              </Link>

              <Link
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-500 active:bg-gray-50 transition-all duration-200"
              >
                실시간 데모 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <p className="text-gray-600 mb-2">사용량 기반 종량제</p>
              <p className="text-6xl font-bold text-primary-500 mb-4">건당 1,200원</p>
              <p className="text-gray-600 mb-6">
                볼륨 할인 적용 | 월 5,000건 이상 시 협의
              </p>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">무료 체험:</span> 최초 100건 무료 제공
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              48개 API 엔드포인트
            </h2>
            <p className="text-xl text-gray-600">
              5가지 운송 모드를 커버하는 완전한 탄소배출 계산 API
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {overviewFeatures.map((feature, index) => (
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

      {/* Transport Modes Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              5가지 운송 모드 지원
            </h2>
            <p className="text-xl text-gray-600">
              모든 물류 구간의 탄소배출량을 정확하게 계산
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-8">
            {transportModes.map((mode, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
                      <div className="text-primary-500 text-4xl">{mode.icon}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {mode.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{mode.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {mode.endpoints.map((endpoint, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-mono rounded"
                        >
                          {endpoint}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm text-gray-500 mb-1">API 개수</p>
                    <p className="text-3xl font-bold text-primary-500">
                      {mode.apiCount}개
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              핵심 기능
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-primary-500 text-2xl">{feature.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Documentation Preview */}
      <section className="py-20 lg:py-32 bg-gray-50" id="demo">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              API 문서 미리보기
            </h2>
            <p className="text-xl text-gray-600">
              주요 엔드포인트와 사용 예시
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {apiEndpoints.map((endpoint, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="bg-gray-900 text-white p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`px-3 py-1 rounded font-semibold text-sm ${
                      endpoint.method === 'POST'
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-green-400 font-mono">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-gray-300 text-sm">{endpoint.description}</p>
                </div>

                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">예시 코드</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
                    <pre>{endpoint.example}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/docs/api"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              전체 API 문서 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                왜 GLEC Carbon API인가?
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

            <div className="bg-primary-50 p-8 rounded-lg">
              <p className="text-center text-gray-700 text-lg">
                <span className="font-semibold">국내 유일</span> 한국형 WTW (Well-to-Wheel) 배출계수 적용 |{' '}
                <span className="font-semibold">ISO-14083</span> 국제표준 인증
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              100건 무료 체험
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              지금 API 키를 발급받고 바로 사용해보세요
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                API 키 발급 신청
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

const overviewFeatures = [
  {
    icon: '⚡',
    title: '0.5초 응답',
    description:
      '평균 응답 시간 0.5초 이내. 실시간 서비스에 최적화된 고성능 API.',
  },
  {
    icon: '🌍',
    title: 'ISO-14083 표준',
    description:
      '국제 물류 탄소배출 표준 ISO-14083을 완벽 준수하는 계산 엔진.',
  },
  {
    icon: '🇰🇷',
    title: '한국형 WTW',
    description:
      '국내 유일 한국형 Well-to-Wheel 배출계수를 적용한 정확한 계산.',
  },
  {
    icon: '📦',
    title: '5가지 운송 모드',
    description:
      '육로, 해상, 물류허브, 항공, 철도 등 모든 물류 구간을 커버.',
  },
  {
    icon: '📊',
    title: '상세한 분석',
    description:
      '배출계수, 계산 방법, 불확실성 등 상세한 분석 데이터 제공.',
  },
  {
    icon: '🔒',
    title: '안전한 인증',
    description:
      'API 키 기반 인증, HTTPS 암호화로 데이터 보안 보장.',
  },
];

const transportModes = [
  {
    icon: '🚚',
    name: '육로 운송 (Road)',
    description: '화물차, 배송 차량 등 도로 운송 수단의 탄소배출량 계산',
    apiCount: 15,
    endpoints: [
      '/road/freight',
      '/road/delivery',
      '/road/last-mile',
    ],
  },
  {
    icon: '🚢',
    name: '해상 운송 (Sea)',
    description: '컨테이너선, 벌크선 등 해상 운송 수단의 탄소배출량 계산',
    apiCount: 12,
    endpoints: [
      '/sea/container',
      '/sea/bulk',
      '/sea/tanker',
    ],
  },
  {
    icon: '📦',
    name: '물류허브 (Hub)',
    description: '창고, 물류센터, 크로스도킹 등 거점의 탄소배출량 계산',
    apiCount: 8,
    endpoints: [
      '/hub/warehouse',
      '/hub/cross-dock',
      '/hub/sortation',
    ],
  },
  {
    icon: '✈️',
    name: '항공 운송 (Air)',
    description: '화물기, 특송 등 항공 운송 수단의 탄소배출량 계산',
    apiCount: 7,
    endpoints: [
      '/air/freight',
      '/air/express',
      '/air/charter',
    ],
  },
  {
    icon: '🚄',
    name: '철도 운송 (Rail)',
    description: '컨테이너 철도, 벌크 화물 철도의 탄소배출량 계산',
    apiCount: 6,
    endpoints: [
      '/rail/container',
      '/rail/bulk',
      '/rail/intermodal',
    ],
  },
];

const keyFeatures = [
  {
    icon: '📐',
    title: '정확한 계산',
    description:
      'ISO-14083 표준 수식과 한국형 배출계수를 적용하여 정확한 탄소배출량 계산',
  },
  {
    icon: '🔄',
    title: '실시간 업데이트',
    description:
      '배출계수는 매년 국제 기준에 따라 자동 업데이트. 항상 최신 데이터 사용',
  },
  {
    icon: '📈',
    title: '상세 분석 데이터',
    description:
      '배출량뿐 아니라 배출계수, 계산 방법, 불확실성(uncertainty) 등 상세 정보 제공',
  },
  {
    icon: '🌐',
    title: 'RESTful API',
    description:
      '표준 REST API 설계. JSON 포맷으로 모든 프로그래밍 언어에서 쉽게 연동',
  },
  {
    icon: '📚',
    title: '완벽한 문서',
    description:
      'OpenAPI 3.0 스펙 기반 문서. 예시 코드, Postman Collection 제공',
  },
  {
    icon: '💪',
    title: '확장 가능',
    description:
      '월 수백만 건 처리 가능. Auto-scaling으로 안정적인 서비스 제공',
  },
];

const apiEndpoints = [
  {
    method: 'POST',
    path: '/api/carbon/road/freight',
    description: '육로 화물 운송의 탄소배출량 계산',
    example: `curl -X POST https://api.glec.io/carbon/road/freight \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "distance": 250,
    "weight": 5000,
    "fuelType": "diesel",
    "vehicleType": "large_truck"
  }'

Response:
{
  "co2": 125.5,
  "unit": "kg",
  "emissionFactor": 0.502,
  "calculationMethod": "ISO-14083",
  "uncertainty": 0.15,
  "responseTime": "0.42s"
}`,
  },
  {
    method: 'GET',
    path: '/api/emission-factors',
    description: '배출계수 조회 (연료 타입, 차량 종류별)',
    example: `curl -X GET https://api.glec.io/emission-factors?fuelType=diesel \\
  -H "Authorization: Bearer YOUR_API_KEY"

Response:
{
  "fuelType": "diesel",
  "emissionFactor": 0.2655,
  "unit": "kg CO2 / liter",
  "wtw": true,
  "source": "Korea Ministry of Environment 2024",
  "lastUpdated": "2024-01-15"
}`,
  },
  {
    method: 'POST',
    path: '/api/carbon/sea/container',
    description: '해상 컨테이너 운송의 탄소배출량 계산',
    example: `curl -X POST https://api.glec.io/carbon/sea/container \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "distance": 15000,
    "containerType": "40ft",
    "containerCount": 2,
    "shipType": "container_ship"
  }'

Response:
{
  "co2": 1250.8,
  "unit": "kg",
  "emissionFactor": 0.0417,
  "calculationMethod": "ISO-14083",
  "distance": 15000,
  "responseTime": "0.38s"
}`,
  },
];

const benefits = [
  {
    value: '48',
    title: 'API 엔드포인트',
    description: '모든 물류 시나리오를 커버하는 완전한 API',
  },
  {
    value: '0.5초',
    title: '평균 응답 시간',
    description: '실시간 서비스에 최적화된 고성능',
  },
  {
    value: '99.9%',
    title: 'SLA 보장',
    description: '안정적인 서비스 제공 보장',
  },
];
