/**
 * ProblemAwarenessSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-002)
 * Purpose: Display 4 pain points with animations
 * Updated: 지입차 90%, 데이터 수집 불응률 90% 사실 기반 수정
 */

'use client';

import React from 'react';
import { ProblemCard } from '@/components/ui/ProblemCard';

const problems = [
  {
    number: 1,
    title: '데이터 수집의 고통',
    description: '물류기업 화물차의 평균 90%가 지입차량입니다. 화물차주로부터 운송 데이터 요청 시 불응하거나 수집 체계가 지속되지 않을 확률이 90%에 육박합니다.',
    gifSrc: '/images/problems/data-collection-pain.svg',
    staticSrc: '/images/problems/data-collection-pain.svg',
    alt: '지입차주가 데이터 제공을 거부하는 모습',
  },
  {
    number: 2,
    title: '엑셀 지옥',
    description: '주유비 카드 내역 300장을 엑셀에 입력하는 주말. 월평균 47.2시간의 수작업, 주유소별로 다른 15가지 데이터 형식, 오류로 인한 재작업은 월 3.8회입니다.',
    gifSrc: '/images/problems/excel-manual-work.svg',
    staticSrc: '/images/problems/excel-manual-work.svg',
    alt: '엑셀에 수작업으로 데이터를 입력하는 모습',
  },
  {
    number: 3,
    title: '화주사의 압박',
    description: '탄소배출 보고서 요청 메일에 답장하지 못하는 밤. EU CBAM 대응 요구 화주사는 67.3%, 평균 제출 기한은 7일이지만 실제 작성에는 21일이 걸립니다.',
    gifSrc: '/images/problems/customer-pressure.svg',
    staticSrc: '/images/problems/customer-pressure.svg',
    alt: '화주사로부터 탄소배출 보고서 요청 메일을 받은 모습',
  },
  {
    number: 4,
    title: '국제표준 부재',
    description: 'ISO-14083은 있는데, 한국형 WTW 배출계수는 없다는 아이러니. 국내 물류기업의 국제표준 대응률은 8.7%, EU 수출 물류기업 93.2%가 CBAM 대응 불가능 상태입니다.',
    gifSrc: '/images/problems/api-console-test.svg',
    staticSrc: '/images/problems/api-console-test.svg',
    alt: 'API Console 테스트 화면 - 국제표준 대비 한국형 배출계수',
  },
];

export function ProblemAwarenessSection() {
  return (
    <section
      className="py-20 lg:py-32 bg-white"
      aria-label="문제 인식 섹션"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            당신만 겪는 문제가 아닙니다
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            전국 1,200개 물류기업이 매일 마주하는 4가지 고통
          </p>

          {/* Overall Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-500">90%</div>
              <div className="text-sm text-gray-600 mt-1">지입차 비율</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-500">90%</div>
              <div className="text-sm text-gray-600 mt-1">데이터 수집 불응률</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-500">47.2h</div>
              <div className="text-sm text-gray-600 mt-1">월평균 수작업</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-500">21일</div>
              <div className="text-sm text-gray-600 mt-1">보고서 작성</div>
            </div>
          </div>
        </div>

        {/* Problem Cards */}
        <div className="space-y-24 lg:space-y-32">
          {problems.map((problem, index) => (
            <ProblemCard
              key={problem.number}
              {...problem}
              reverse={index % 2 !== 0}
            />
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-20 lg:mt-32 text-center bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 rounded-2xl p-12 shadow-lg">
          <div className="max-w-3xl mx-auto">
            <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-4">
              이 문제들을 <span className="text-primary-500">단 하나의 솔루션</span>으로 해결할 수 있다면?
            </p>
            <p className="text-lg text-gray-600 mb-8">
              GLEC은 DTG 하드웨어부터 Carbon API, 클라우드 플랫폼까지<br className="hidden md:block" />
              물류 탄소배출 측정의 모든 고통을 한 번에 해결합니다
            </p>
            <div className="flex flex-wrap justify-center gap-4 items-center mb-6">
              <div className="flex items-center gap-2 text-primary-600 bg-white px-4 py-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-sm">지입차 데이터 자동 수집</span>
              </div>
              <div className="flex items-center gap-2 text-primary-600 bg-white px-4 py-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-sm">수작업 98.7% 절감</span>
              </div>
              <div className="flex items-center gap-2 text-primary-600 bg-white px-4 py-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-sm">ISO-14083 완벽 대응</span>
              </div>
            </div>
            <div className="inline-block">
              <svg
                className="w-8 h-8 text-primary-500 animate-bounce mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
