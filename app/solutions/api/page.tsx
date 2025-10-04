/**
 * Carbon API Solution Page - World-class Design
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState } from 'react';

export default function APIPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '개발자를 위한\n완벽한 Carbon API',
    50
  );

  const [activeTab, setActiveTab] = useState<'features' | 'endpoints' | 'pricing'>('features');

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
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              RESTful API • 48 Endpoints • ISO-14083
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              물류 탄소배출 데이터의 모든 것을 <span className="font-bold text-white">48개 API</span>로 통합하세요.<br />
              복잡한 계산은 우리가, 핵심 비즈니스는 당신이.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                무료 API 키 발급
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#endpoints"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                API 문서 보기
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                99.9% Uptime SLA
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                &lt;100ms Response Time
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ISO-14083 Certified
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
              onClick={() => setActiveTab('features')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'features'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              주요 기능
            </button>
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'endpoints'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              API 엔드포인트
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'pricing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              요금제
            </button>
          </div>
        </div>
      </section>

      {/* Features Tab */}
      {activeTab === 'features' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                모든 물류 탄소배출 데이터를<br />하나의 API로
              </h2>
              <p className="text-xl text-gray-600">
                복잡한 표준, 계산식, 배출계수를 신경 쓸 필요 없습니다
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 계산 API</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  운송 거리, 화물 중량, 차량 종류만 입력하면 즉시 탄소배출량을 계산합니다. ISO-14083 기준 준수.
                </p>
                <div className="flex items-center text-primary-600 font-semibold text-sm">
                  <code className="bg-primary-50 px-2 py-1 rounded">POST /api/calculate</code>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">배출계수 데이터베이스</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  전 세계 200개국, 50개 차량 유형별 최신 배출계수를 API로 제공합니다. 월 단위 자동 업데이트.
                </p>
                <div className="flex items-center text-green-600 font-semibold text-sm">
                  <code className="bg-green-50 px-2 py-1 rounded">GET /api/emission-factors</code>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">보고서 생성 API</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  EU CBAM, CDP, GHG Protocol 형식의 보고서를 JSON/PDF/Excel로 자동 생성합니다.
                </p>
                <div className="flex items-center text-purple-600 font-semibold text-sm">
                  <code className="bg-purple-50 px-2 py-1 rounded">POST /api/reports/generate</code>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">OAuth 2.0 인증</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  표준 OAuth 2.0 프로토콜로 안전하게 API에 접근하세요. API 키 + JWT 토큰 지원.
                </p>
                <div className="flex items-center text-orange-600 font-semibold text-sm">
                  <code className="bg-orange-50 px-2 py-1 rounded">POST /api/auth/token</code>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">벌크 데이터 업로드</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  CSV/Excel 파일로 수천 건의 운송 데이터를 한 번에 업로드하고 배출량을 계산합니다.
                </p>
                <div className="flex items-center text-blue-600 font-semibold text-sm">
                  <code className="bg-blue-50 px-2 py-1 rounded">POST /api/bulk-upload</code>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Webhook 알림</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  데이터 처리 완료, 임계값 초과, 보고서 생성 시 실시간 알림을 받으세요.
                </p>
                <div className="flex items-center text-red-600 font-semibold text-sm">
                  <code className="bg-red-50 px-2 py-1 rounded">POST /api/webhooks</code>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <section id="endpoints" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                48개 API 엔드포인트
              </h2>
              <p className="text-xl text-gray-600">
                RESTful API로 모든 탄소배출 데이터에 접근하세요
              </p>
            </div>

            {/* API Categories */}
            <div className="space-y-6">
              {/* Category 1: Calculation APIs */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">12</span>
                    탄소배출 계산 API
                  </h3>
                  <p className="text-gray-600 mt-2">실시간 탄소배출량 계산 및 시뮬레이션</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                    <div className="flex-1">
                      <code className="text-primary-600 font-mono text-sm">/api/v1/calculate/transport</code>
                      <p className="text-gray-600 text-sm mt-1">운송 탄소배출량 계산</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded">GET</span>
                    <div className="flex-1">
                      <code className="text-primary-600 font-mono text-sm">/api/v1/calculate/route</code>
                      <p className="text-gray-600 text-sm mt-1">경로별 배출량 비교</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                    <div className="flex-1">
                      <code className="text-primary-600 font-mono text-sm">/api/v1/calculate/multimodal</code>
                      <p className="text-gray-600 text-sm mt-1">복합 운송 배출량 계산</p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                    + 9개 더보기
                  </button>
                </div>
              </div>

              {/* Category 2: Data APIs */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b border-green-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">16</span>
                    데이터 조회 API
                  </h3>
                  <p className="text-gray-600 mt-2">배출계수, 차량 정보, 통계 데이터</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded">GET</span>
                    <div className="flex-1">
                      <code className="text-green-600 font-mono text-sm">/api/v1/emission-factors</code>
                      <p className="text-gray-600 text-sm mt-1">배출계수 데이터베이스 조회</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded">GET</span>
                    <div className="flex-1">
                      <code className="text-green-600 font-mono text-sm">/api/v1/vehicles</code>
                      <p className="text-gray-600 text-sm mt-1">차량 종류별 배출 정보</p>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-700 font-semibold text-sm">
                    + 14개 더보기
                  </button>
                </div>
              </div>

              {/* Category 3: Report APIs */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 border-b border-purple-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">10</span>
                    보고서 생성 API
                  </h3>
                  <p className="text-gray-600 mt-2">EU CBAM, CDP, GHG Protocol 보고서</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                    <div className="flex-1">
                      <code className="text-purple-600 font-mono text-sm">/api/v1/reports/cbam</code>
                      <p className="text-gray-600 text-sm mt-1">EU CBAM 보고서 생성</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                    <div className="flex-1">
                      <code className="text-purple-600 font-mono text-sm">/api/v1/reports/cdp</code>
                      <p className="text-gray-600 text-sm mt-1">CDP 포맷 보고서</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                    + 8개 더보기
                  </button>
                </div>
              </div>

              {/* Category 4: Integration APIs */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 border-b border-orange-200">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">10</span>
                    통합 및 관리 API
                  </h3>
                  <p className="text-gray-600 mt-2">인증, Webhook, 벌크 업로드</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                    <div className="flex-1">
                      <code className="text-orange-600 font-mono text-sm">/api/v1/auth/token</code>
                      <p className="text-gray-600 text-sm mt-1">OAuth 2.0 토큰 발급</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">POST</span>
                    <div className="flex-1">
                      <code className="text-orange-600 font-mono text-sm">/api/v1/bulk-upload</code>
                      <p className="text-gray-600 text-sm mt-1">CSV/Excel 벌크 업로드</p>
                    </div>
                  </div>
                  <button className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
                    + 8개 더보기
                  </button>
                </div>
              </div>
            </div>

            {/* API Documentation CTA */}
            <div className="mt-12 p-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white text-center">
              <h3 className="text-2xl font-bold mb-4">전체 API 문서 보기</h3>
              <p className="text-white/90 mb-6">
                상세한 파라미터, 응답 형식, 코드 예제를 확인하세요
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                API 문서 다운로드
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                투명하고 합리적인 요금제
              </h2>
              <p className="text-xl text-gray-600">
                스타트업부터 엔터프라이즈까지, 모든 규모에 최적화된 요금
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-primary-300 transition-colors">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-gray-900">₩0</span>
                    <span className="text-gray-500">/월</span>
                  </div>
                  <p className="text-gray-600">개발 및 테스트용</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">월 1,000 API 호출</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">기본 API 12개</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">커뮤니티 지원</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">API 문서 접근</span>
                  </li>
                </ul>

                <Link
                  href="/contact"
                  className="block w-full py-3 px-6 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  무료 시작하기
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl p-8 border-2 border-primary-400 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                  인기
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-white">₩99,000</span>
                    <span className="text-white/80">/월</span>
                  </div>
                  <p className="text-white/90">중소기업 최적</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">월 100,000 API 호출</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">전체 API 48개</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">이메일 지원 24시간</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">Webhook 알림</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">보고서 자동 생성</span>
                  </li>
                </ul>

                <Link
                  href="/contact"
                  className="block w-full py-3 px-6 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  Pro 시작하기
                </Link>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-primary-300 transition-colors">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-gray-900">맞춤</span>
                  </div>
                  <p className="text-gray-600">대기업 및 그룹사</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">무제한 API 호출</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">전용 서버</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">전화/화상 지원</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">맞춤 API 개발</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">99.99% SLA 보장</span>
                  </li>
                </ul>

                <Link
                  href="/contact"
                  className="block w-full py-3 px-6 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors text-center"
                >
                  견적 문의하기
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20">
              <h3 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h3>
              <div className="max-w-3xl mx-auto space-y-6">
                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    API 호출 한도를 초과하면 어떻게 되나요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    API 호출 한도를 초과하면 해당 월 추가 호출당 ₩1의 종량제 요금이 부과됩니다. 사전 알림을 받으실 수 있습니다.
                  </p>
                </details>

                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    API 키는 어떻게 발급받나요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    회원 가입 후 대시보드에서 즉시 API 키를 발급받을 수 있습니다. Free 플랜은 1개, Pro 플랜은 5개, Enterprise는 무제한 키 생성이 가능합니다.
                  </p>
                </details>

                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    배출계수는 얼마나 자주 업데이트되나요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    배출계수는 월 1회 자동 업데이트됩니다. IPCC, EPA, DEFRA 등 공식 기관의 최신 데이터를 반영합니다.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-white/90 mb-12">
            5분이면 API를 통합하고 탄소배출량을 계산할 수 있습니다
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              무료 API 키 발급
            </Link>
            <Link
              href="/knowledge"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
            >
              개발 가이드 보기
            </Link>
          </div>

          {/* Quick Start Code Example */}
          <div className="mt-16 text-left bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 font-mono">Quick Start</span>
              <button className="px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded hover:bg-primary-600 transition-colors">
                Copy
              </button>
            </div>
            <pre className="text-sm text-green-400 font-mono overflow-x-auto">
              <code>{`curl -X POST https://api.glec.io/v1/calculate/transport \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "distance_km": 500,
    "weight_kg": 10000,
    "vehicle_type": "truck_diesel_40t"
  }'

# Response
{
  "success": true,
  "data": {
    "co2_kg": 142.5,
    "emission_factor": 0.285,
    "unit": "kgCO2e"
  }
}`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
