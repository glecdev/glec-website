/**
 * GLEC Cloud Solution Page - World-class Design
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState } from 'react';

export default function CloudPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '클라우드 기반\n완벽한 탄소관리 플랫폼',
    50
  );

  const [activeTab, setActiveTab] = useState<'features' | 'dashboard' | 'pricing'>('features');

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
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              SaaS • Real-time • EU CBAM Ready
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              엑셀은 이제 그만. <span className="font-bold text-white">클릭 한 번</span>으로 모든 탄소배출을 관리하세요.<br />
              실시간 대시보드부터 EU CBAM 보고서까지, 자동화된 완벽한 솔루션.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                14일 무료 체험
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#dashboard"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                데모 영상 보기
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                1,200+ 기업 신뢰
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                99.9% Uptime
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ISO-14083 인증
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
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              대시보드
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
                탄소관리의 모든 것을<br />하나의 플랫폼에서
              </h2>
              <p className="text-xl text-gray-600">
                복잡한 계산, 보고서 작성, 목표 관리까지 완벽 자동화
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 대시보드</h3>
                <p className="text-gray-600 leading-relaxed">
                  모든 차량의 탄소배출량을 한눈에. 직관적인 차트와 그래프로 배출량 추이 실시간 모니터링.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">EU CBAM 보고서</h3>
                <p className="text-gray-600 leading-relaxed">
                  EU 탄소국경조정메커니즘 보고서를 클릭 한 번으로 생성. Excel/PDF 다운로드 지원.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">목표 관리</h3>
                <p className="text-gray-600 leading-relaxed">
                  탄소 감축 목표 설정 및 진행률 추적. 목표 초과 시 자동 알림.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">다중 사용자</h3>
                <p className="text-gray-600 leading-relaxed">
                  팀원별 역할 기반 접근 제어. 관리자/운영자/뷰어 권한 분리.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">API 통합</h3>
                <p className="text-gray-600 leading-relaxed">
                  RESTful API로 ERP, TMS 시스템과 연동. Webhook으로 실시간 데이터 수신.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">데이터 보안</h3>
                <p className="text-gray-600 leading-relaxed">
                  은행급 256bit 암호화. GDPR/ISO27001 준수.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <section id="dashboard" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                직관적인 대시보드
              </h2>
              <p className="text-xl text-gray-600">
                복잡한 데이터도 한눈에 보이는 시각화
              </p>
            </div>

            {/* Dashboard Mockup Description */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Mockup Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">GLEC Cloud Dashboard</h3>
                      <p className="text-sm text-white/80">2025년 1월 실시간 데이터</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-green-400 text-green-900 text-xs font-bold rounded-full">실시간</span>
                  </div>
                </div>
              </div>

              {/* Mockup Body */}
              <div className="p-8 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                    <div className="text-sm text-gray-600 mb-2">이번 달 총 배출량</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">12,847 <span className="text-lg text-gray-600">kgCO₂e</span></div>
                    <div className="text-sm text-green-600 font-semibold">↓ 8.2% vs 지난달</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="text-sm text-gray-600 mb-2">운송 건수</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">1,284 <span className="text-lg text-gray-600">건</span></div>
                    <div className="text-sm text-blue-600 font-semibold">↑ 5.3% vs 지난달</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="text-sm text-gray-600 mb-2">목표 달성률</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">87.4<span className="text-lg text-gray-600">%</span></div>
                    <div className="text-sm text-gray-600 font-semibold">목표: 15,000 kgCO₂e</div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h4 className="text-lg font-bold text-gray-700 mb-2">월별 배출량 추이 그래프</h4>
                    <p className="text-gray-500">실시간 데이터를 기반으로 한 인터랙티브 차트</p>
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">최근 운송 기록</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">서울 → 부산 (450km)</div>
                          <div className="text-sm text-gray-500">디젤 25톤 트럭 • 2025-01-15 14:32</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">142.5 kgCO₂e</div>
                        <div className="text-xs text-gray-500">화물 10,000kg</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">인천 → 대전 (160km)</div>
                          <div className="text-sm text-gray-500">전기 5톤 트럭 • 2025-01-15 12:18</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">28.4 kgCO₂e</div>
                        <div className="text-xs text-gray-500">화물 3,500kg</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">광주 → 목포 (95km)</div>
                          <div className="text-sm text-gray-500">LNG 11톤 트럭 • 2025-01-15 09:45</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">54.2 kgCO₂e</div>
                        <div className="text-xs text-gray-500">화물 7,200kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                실제 대시보드 체험하기
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
                모든 규모의 기업에 최적화된 요금
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Trial */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-primary-300 transition-colors">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Trial</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-5xl font-bold text-gray-900">₩0</span>
                    <span className="text-gray-500">/14일</span>
                  </div>
                  <p className="text-gray-600">무료 체험</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">전체 기능 체험</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">100개 운송 기록</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">이메일 지원</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">신용카드 불필요</span>
                  </li>
                </ul>

                <Link
                  href="/contact"
                  className="block w-full py-3 px-6 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  무료로 시작하기
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
                    <span className="text-5xl font-bold text-white">₩120,000</span>
                    <span className="text-white/80">/월</span>
                  </div>
                  <p className="text-white/90">중소기업 최적</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">무제한 운송 기록</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">사용자 10명</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">EU CBAM 보고서</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">API 통합</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">24시간 이메일 지원</span>
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
                    <span className="text-gray-700">무제한 사용자</span>
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
                    <span className="text-gray-700">맞춤 기능 개발</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">전담 기술지원팀</span>
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
                    무료 체험 후 자동 결제되나요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    아니요. 14일 무료 체험 기간이 끝나도 자동 결제되지 않습니다. 계속 사용하시려면 직접 요금제를 선택하셔야 합니다.
                  </p>
                </details>

                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    기존 TMS 시스템과 연동 가능한가요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    네, RESTful API를 통해 대부분의 TMS, ERP 시스템과 연동 가능합니다. 맞춤 연동이 필요한 경우 기술지원팀이 도와드립니다.
                  </p>
                </details>

                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    데이터는 얼마나 안전한가요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    모든 데이터는 256bit 암호화되어 저장되며, GDPR 및 ISO27001 보안 표준을 준수합니다. 정기적인 백업과 재해복구 시스템을 갖추고 있습니다.
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
            14일 무료 체험으로 GLEC Cloud의 모든 기능을 경험해보세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              14일 무료 체험 시작
            </Link>
            <Link
              href="/knowledge"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
            >
              가이드 보기
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">빠른 설정</h3>
              <p className="text-white/80 text-sm">5분이면 모든 설정 완료. 즉시 사용 가능합니다.</p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">안전한 데이터</h3>
              <p className="text-white/80 text-sm">은행급 보안으로 데이터를 안전하게 보호합니다.</p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">전문 지원</h3>
              <p className="text-white/80 text-sm">언제든지 전문가의 도움을 받을 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
