/**
 * SolutionOverviewSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-003)
 * Purpose: Interactive 3-tab solution overview (DTG, API, Cloud)
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { useCodeTyping } from '@/hooks/useCodeTyping';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { cn } from '@/lib/utils';

type SolutionTab = 'dtg' | 'api' | 'cloud';

const API_REQUEST_CODE = `fetch('/api/carbon/calculate', {
  method: 'POST',
  body: JSON.stringify({
    distance: 100,
    fuelType: 'diesel'
  })
})`;

const API_RESPONSE_CODE = `{
  "co2": 24.5,
  "unit": "kg"
}`;

export function SolutionOverviewSection() {
  const [activeTab, setActiveTab] = useState<SolutionTab>('dtg');
  const [showResponse, setShowResponse] = useState(false);

  const { displayedText: headerText } = useTypingAnimation(
    'DTG 하드웨어부터 API, 클라우드까지\n완벽한 탄소배출 측정 생태계를\n단 하나의 플랫폼으로',
    50
  );

  const { displayedCode: requestCode, isComplete: requestComplete } = useCodeTyping(
    API_REQUEST_CODE,
    30,
    activeTab === 'api'
  );

  const { displayedCode: responseCode } = useCodeTyping(
    API_RESPONSE_CODE,
    30,
    activeTab === 'api' && showResponse
  );

  React.useEffect(() => {
    if (requestComplete && activeTab === 'api') {
      const timer = setTimeout(() => {
        setShowResponse(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowResponse(false);
    }
  }, [requestComplete, activeTab]);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 whitespace-pre-line">
            {headerText}
          </h2>
          <p className="text-xl text-gray-600">
            지입차 데이터 수집부터 국제표준 보고서 생성까지, 모든 과정을 자동화합니다
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('dtg')}
              className={cn(
                'px-6 py-3 rounded-md font-semibold transition-all',
                activeTab === 'dtg'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              GLEC DTG
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={cn(
                'px-6 py-3 rounded-md font-semibold transition-all',
                activeTab === 'api'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Carbon API
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={cn(
                'px-6 py-3 rounded-md font-semibold transition-all',
                activeTab === 'cloud'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              GLEC Cloud
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto">
          {/* DTG Tab */}
          {activeTab === 'dtg' && (
            <div className="animate-fade-in">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Image Side */}
                <div className="relative aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
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
                        d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    <p className="text-sm">CPU 기판 3D 모델 (Three.js 예정)</p>
                  </div>
                </div>

                {/* Text Side */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    세계 최초 스마트폰 CPU 탑재 DTG
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    물류기업 화물차의 90%를 차지하는 지입차량의 데이터 수집 문제를 해결하는 혁신적인 장치
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">지입차 데이터 자동 수집</p>
                        <p className="text-gray-600">차주 설득 없이 OBD-II 포트 연결만으로 즉시 데이터 수집</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">세계 최초 스마트폰 CPU 탑재</p>
                        <p className="text-gray-600">Snapdragon 기반 고성능 연산</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">실시간 데이터 전송</p>
                        <p className="text-gray-600">LTE/5G 네트워크 지원</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">ISO-14083 엔진 내장</p>
                        <p className="text-gray-600">국제표준 자동 계산</p>
                      </div>
                    </li>
                  </ul>
                  <Link href="/dtg">
                    <Button variant="primary" size="lg">
                      DTG 상세보기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="animate-fade-in">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Code Side */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">REQUEST</h4>
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto mb-6">
                    <code className="text-sm font-mono">{requestCode}</code>
                  </pre>

                  {showResponse && (
                    <div className="animate-slide-up">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">RESPONSE</h4>
                      <pre className="bg-green-900 text-green-100 p-6 rounded-lg overflow-x-auto">
                        <code className="text-sm font-mono">{responseCode}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Text Side */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    Carbon API - 48개 엔드포인트
                  </h3>
                  <p className="text-lg text-gray-600 mb-8">
                    5개 운송모드(육로, 해상, 물류허브, 항공, 철도)를 지원하는 RESTful API.
                    ISO-14083 표준 기반 탄소배출량 실시간 계산.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      5개 운송모드 48개 API
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      물류기업 & 화주사 PDF 자동 생성
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      ISO-14083 국제표준 기반
                    </li>
                  </ul>
                  <Link href="/api">
                    <Button variant="primary" size="lg">
                      API 문서 보기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Cloud Tab */}
          {activeTab === 'cloud' && (
            <div className="animate-fade-in">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Image Side */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
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
                        d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
                      />
                    </svg>
                    <p className="text-sm">대시보드 스크린샷 슬라이더 (예정)</p>
                  </div>
                </div>

                {/* Text Side */}
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    GLEC Cloud - 탄소관리 플랫폼
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    월 12만원으로 시작하는 클라우드 탄소배출 관리 시스템
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">실시간 DTG 데이터 수집</p>
                        <p className="text-gray-600">GLEC DTG 연동 자동 수집</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">화주기업용 모니터링</p>
                        <p className="text-gray-600">물류 탄소배출량 실시간 대시보드</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-primary-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">물류기업 Scope3 모니터링</p>
                        <p className="text-gray-600">배출량 추적 및 보고서 자동 생성</p>
                      </div>
                    </li>
                  </ul>
                  <Link href="/cloud">
                    <Button variant="primary" size="lg">
                      Cloud 둘러보기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
