/**
 * DTG Product Page - World-class Design
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState } from 'react';

export default function DTGPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '90% 지입차 데이터를\n자동으로 수집하는 혁신',
    50
  );

  const [activeTab, setActiveTab] = useState<'features' | 'specs' | 'installation' | 'pricing'>('features');

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
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Digital Tachograph • Series5 • ISO-14083
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              세계 최초 <span className="font-bold text-white">스마트폰 CPU</span> 탑재 차량용 탄소배출 측정 장치.<br />
              OBD-II 포트에 꽂으면 끝. 운전자는 아무것도 하지 않습니다.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                무료 체험 신청 (5대 제공)
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                제품 데모 보기
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                1,200+ 차량 운영 중
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                99.9% 가동률
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
              핵심 기능
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              기술 사양
            </button>
            <button
              onClick={() => setActiveTab('installation')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'installation'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              설치 방법
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'pricing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              가격 및 체험
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
                운전자는 아무것도 하지 않습니다.<br />모든 데이터를 자동으로 수집합니다.
              </h2>
              <p className="text-xl text-gray-600">
                플러그 앤 플레이. 설치 5분, 이후 완전 자동.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: 스마트폰 CPU */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">스마트폰 CPU</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  세계 최초로 스마트폰 CPU를 탑재하여 강력한 연산 능력과 안정성을 제공합니다. ARM Cortex-A53 Quad-core 프로세서.
                </p>
                <div className="flex items-center text-primary-600 font-semibold text-sm">
                  <code className="bg-primary-50 px-2 py-1 rounded">ARM Cortex-A53</code>
                </div>
              </div>

              {/* Feature 2: ISO-14083 엔진 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">ISO-14083 엔진 내장</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  국제표준 ISO-14083 엔진이 내장되어 실시간으로 정확한 탄소배출량을 계산합니다. EU CBAM, CDP 보고서 자동 생성.
                </p>
                <div className="flex items-center text-green-600 font-semibold text-sm">
                  <code className="bg-green-50 px-2 py-1 rounded">ISO-14083 Certified</code>
                </div>
              </div>

              {/* Feature 3: 실시간 데이터 전송 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">실시간 데이터 전송</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  GPS, 속도, 연료 소비량 등의 데이터를 5분마다 자동으로 서버에 전송합니다. 4G LTE + Wi-Fi 듀얼 네트워크.
                </p>
                <div className="flex items-center text-purple-600 font-semibold text-sm">
                  <code className="bg-purple-50 px-2 py-1 rounded">4G LTE Cat.4</code>
                </div>
              </div>

              {/* Feature 4: 72시간 오프라인 저장 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">72시간 오프라인 저장</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  네트워크 연결이 끊겨도 최대 72시간 분량의 데이터를 내부 메모리에 저장합니다. 연결 복구 시 자동 동기화.
                </p>
                <div className="flex items-center text-orange-600 font-semibold text-sm">
                  <code className="bg-orange-50 px-2 py-1 rounded">16GB eMMC</code>
                </div>
              </div>

              {/* Feature 5: 플러그 앤 플레이 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">플러그 앤 플레이</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  OBD-II 포트에 연결하면 즉시 사용 가능. 별도의 배선 작업이 필요 없습니다. 설치 시간 차량당 5분.
                </p>
                <div className="flex items-center text-blue-600 font-semibold text-sm">
                  <code className="bg-blue-50 px-2 py-1 rounded">OBD-II Standard</code>
                </div>
              </div>

              {/* Feature 6: 저전력 설계 */}
              <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">저전력 설계</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  차량 배터리에 부담을 주지 않는 저전력 설계로 24시간 안전하게 작동합니다. 평균 2.5W, 대기 시 0.5W.
                </p>
                <div className="flex items-center text-red-600 font-semibold text-sm">
                  <code className="bg-red-50 px-2 py-1 rounded">2.5W Average</code>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Specs Tab */}
      {activeTab === 'specs' && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                기술 사양
              </h2>
              <p className="text-xl text-gray-600">
                산업용 등급의 안정성과 성능
              </p>
            </div>

            {/* Specs Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <table className="w-full">
                <tbody>
                  <tr className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                    <td className="px-6 py-4 font-bold text-gray-900 w-1/3">CPU</td>
                    <td className="px-6 py-4 text-gray-700">스마트폰급 ARM Cortex-A53 (Quad-core)</td>
                  </tr>
                  <tr className="bg-white border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">RAM</td>
                    <td className="px-6 py-4 text-gray-700">2GB LPDDR4</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">저장 공간</td>
                    <td className="px-6 py-4 text-gray-700">16GB eMMC (72시간 데이터 저장)</td>
                  </tr>
                  <tr className="bg-white border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">GPS</td>
                    <td className="px-6 py-4 text-gray-700">Multi-GNSS (GPS, GLONASS, Galileo, BeiDou)</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">통신</td>
                    <td className="px-6 py-4 text-gray-700">4G LTE Cat.4 / Wi-Fi 802.11ac</td>
                  </tr>
                  <tr className="bg-white border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">OBD-II 프로토콜</td>
                    <td className="px-6 py-4 text-gray-700">ISO 15765, ISO 14230, ISO 9141, J1850</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">데이터 수집 주기</td>
                    <td className="px-6 py-4 text-gray-700">1초 (서버 전송: 5분마다)</td>
                  </tr>
                  <tr className="bg-white border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">전원</td>
                    <td className="px-6 py-4 text-gray-700">차량 배터리 (12V/24V 자동 감지)</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">소비 전력</td>
                    <td className="px-6 py-4 text-gray-700">평균 2.5W (대기 시 0.5W)</td>
                  </tr>
                  <tr className="bg-white border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">동작 온도</td>
                    <td className="px-6 py-4 text-gray-700">-20°C ~ 70°C</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">크기</td>
                    <td className="px-6 py-4 text-gray-700">85mm × 55mm × 25mm</td>
                  </tr>
                  <tr className="bg-white border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">무게</td>
                    <td className="px-6 py-4 text-gray-700">120g</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <td className="px-6 py-4 font-semibold text-gray-900">인증</td>
                    <td className="px-6 py-4 text-gray-700">ISO-14083, CE, FCC, KC</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-6 py-4 font-semibold text-gray-900">보증 기간</td>
                    <td className="px-6 py-4 text-gray-700">3년</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comparison Table */}
            <div className="mt-16">
              <h3 className="text-3xl font-bold text-center mb-8">기존 DTG vs GLEC DTG Series5</h3>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
                      <th className="px-6 py-4 text-left font-bold text-gray-900">항목</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-600">기존 DTG</th>
                      <th className="px-6 py-4 text-center font-bold text-primary-600">GLEC DTG Series5</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b border-gray-100">
                      <td className="px-6 py-4 font-semibold text-gray-900">CPU</td>
                      <td className="px-6 py-4 text-center text-gray-600">일반 MCU</td>
                      <td className="px-6 py-4 text-center text-primary-600 font-semibold">스마트폰 CPU (ARM Cortex-A53)</td>
                    </tr>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td className="px-6 py-4 font-semibold text-gray-900">탄소배출 계산</td>
                      <td className="px-6 py-4 text-center text-gray-600">서버에서 계산</td>
                      <td className="px-6 py-4 text-center text-primary-600 font-semibold">장치 내 실시간 계산</td>
                    </tr>
                    <tr className="bg-white border-b border-gray-100">
                      <td className="px-6 py-4 font-semibold text-gray-900">설치 시간</td>
                      <td className="px-6 py-4 text-center text-gray-600">30분~1시간 (배선 필요)</td>
                      <td className="px-6 py-4 text-center text-primary-600 font-semibold">5분 (플러그 앤 플레이)</td>
                    </tr>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <td className="px-6 py-4 font-semibold text-gray-900">오프라인 저장</td>
                      <td className="px-6 py-4 text-center text-gray-600">12시간</td>
                      <td className="px-6 py-4 text-center text-primary-600 font-semibold">72시간</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 font-semibold text-gray-900">ISO-14083 인증</td>
                      <td className="px-6 py-4 text-center text-gray-600">❌</td>
                      <td className="px-6 py-4 text-center text-primary-600 font-semibold">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Installation Tab */}
      {activeTab === 'installation' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                5분이면 끝나는 간편한 설치
              </h2>
              <p className="text-xl text-gray-600">
                OBD-II 포트에 플러그인하면 즉시 사용 가능
              </p>
            </div>

            {/* Installation Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 mx-auto shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  OBD-II 포트 위치 확인
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  운전석 하단에 위치한 OBD-II 포트를 찾습니다. 대부분 차량은 운전석 무릎 아래나 핸들 왼쪽에 있습니다.
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 mx-auto shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  DTG 장치 연결
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  포트에 GLEC DTG를 플러그인합니다. "딸깍" 소리가 나면 정상 연결. LED가 파란색으로 점등되면 준비 완료.
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6 mx-auto shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  자동 활성화
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  차량 시동을 걸면 자동으로 작동 시작. 데이터 수집과 서버 전송이 자동으로 진행됩니다. 설정 필요 없음.
                </p>
              </div>
            </div>

            {/* Installation Info Box */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-8 rounded-2xl border border-primary-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">5분</div>
                  <p className="text-gray-700 font-semibold">설치 시간 (차량 1대당)</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">전국</div>
                  <p className="text-gray-700 font-semibold">방문 설치 서비스 지원</p>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="mt-16 text-center">
              <h3 className="text-3xl font-bold mb-8">설치 영상 가이드</h3>
              <div className="bg-gray-200 rounded-2xl aspect-video max-w-3xl mx-auto flex items-center justify-center">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  영상 재생
                </Link>
              </div>
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
                투명하고 합리적인 가격
              </h2>
              <p className="text-xl text-gray-600">
                월 구독료 없음. 80만원 일회성 구매로 영구 사용.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>

                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className="inline-block px-4 py-2 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full mb-4">
                      베스트셀러
                    </div>
                    <h3 className="text-3xl font-bold mb-4">GLEC DTG Series5</h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-6xl font-bold">₩800,000</span>
                    </div>
                    <p className="text-white/90 text-lg">일회성 구매 (VAT 별도)</p>
                  </div>

                  {/* What's Included */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-white mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg">GLEC DTG Series5 본체 1대</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-white mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg">ISO-14083 탄소배출 측정 엔진</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-white mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg">GLEC Cloud 연동 (월 구독료 별도)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-white mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg">3년 무상 A/S 보증</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-white mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg">방문 설치 서비스 (전국)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-white mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-lg">전화/이메일 기술 지원</span>
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="block w-full py-4 px-8 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 text-center text-lg shadow-xl"
                  >
                    지금 구매하기
                  </Link>
                </div>
              </div>
            </div>

            {/* Free Trial Section */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-300">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    1개월 무료 체험
                  </h3>
                  <p className="text-xl text-gray-700">
                    GLEC DTG 5대를 무료로 제공하여 실제 운영 환경에서 테스트하세요
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 text-center shadow-md">
                    <div className="text-4xl font-bold text-green-600 mb-2">5대</div>
                    <p className="text-gray-700">무료 제공</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-md">
                    <div className="text-4xl font-bold text-green-600 mb-2">30일</div>
                    <p className="text-gray-700">체험 기간</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-md">
                    <div className="text-4xl font-bold text-green-600 mb-2">₩0</div>
                    <p className="text-gray-700">비용 없음</p>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    무료 체험 신청하기
                  </Link>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20">
              <h3 className="text-3xl font-bold text-center mb-12">자주 묻는 질문</h3>
              <div className="max-w-3xl mx-auto space-y-6">
                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    GLEC Cloud 구독료는 얼마인가요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    GLEC Cloud는 차량당 월 12만원입니다. DTG 구매 비용(80만원)과 별도로 부과되며, 대시보드, 보고서 생성, API 접근 등의 서비스를 제공합니다.
                  </p>
                </details>

                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    기존 DTG와 호환되나요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    GLEC DTG Series5는 독립형 장치로, 기존 DTG와 별도로 설치됩니다. OBD-II 포트가 하나만 있어도 멀티플렉서를 사용하여 여러 장치를 동시에 연결할 수 있습니다.
                  </p>
                </details>

                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    설치는 어떻게 진행되나요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    전국 방문 설치 서비스를 제공합니다. 기사님께서 직접 설치하는 것도 가능하며, 설치 영상 가이드를 제공합니다. 설치 시간은 차량당 약 5분입니다.
                  </p>
                </details>

                <details className="group bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                    A/S는 어떻게 받나요?
                    <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="text-gray-600 mt-4">
                    3년 무상 A/S 보증을 제공합니다. 고장 시 새 제품으로 교환해드리며, 택배 왕복 배송비는 당사가 부담합니다. 전화/이메일로 기술 지원도 가능합니다.
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
            1개월 무료 체험으로 GLEC DTG의 성능을 직접 확인하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              무료 체험 신청
            </Link>

            <a
              href="tel:010-4481-5189"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
            >
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              전화 상담: 010-4481-5189
            </a>
          </div>

          {/* Product Summary */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">₩800,000</div>
              <p className="text-white/80">일회성 구매</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">5분</div>
              <p className="text-white/80">설치 시간</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold mb-2">3년</div>
              <p className="text-white/80">무상 A/S</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
