/**
 * ProblemAwarenessSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-002)
 * Purpose: Display 4 pain points with GIF animations and scroll-based sequential display
 */

'use client';

import React from 'react';
import { ProblemCard } from '@/components/ui/ProblemCard';

const problems = [
  {
    number: 1,
    title: '데이터 수집의 고통',
    description: '화물차주가 DTG 장착을 거부합니다',
    gifSrc: '/images/problems/data-collection-pain.svg',
    staticSrc: '/images/problems/data-collection-pain.svg',
    alt: '화물차주가 DTG 장착을 거부하는 모습',
  },
  {
    number: 2,
    title: '엑셀 지옥',
    description: '주유비 카드 내역 300장을 엑셀에 입력하는 주말',
    gifSrc: '/images/problems/excel-manual-work.svg',
    staticSrc: '/images/problems/excel-manual-work.svg',
    alt: '엑셀에 수작업으로 데이터를 입력하는 모습',
  },
  {
    number: 3,
    title: '화주사의 압박',
    description: '탄소배출 보고서 요청 메일에 답장하지 못하는 밤',
    gifSrc: '/images/problems/customer-pressure.svg',
    staticSrc: '/images/problems/customer-pressure.svg',
    alt: '화주사로부터 탄소배출 보고서 요청 메일을 받은 모습',
  },
  {
    number: 4,
    title: '국제표준 부재',
    description: 'ISO-14083은 있는데, 한국형 WTW 배출계수는 없다는 아이러니',
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
          <p className="text-xl text-gray-600">
            전국 1,200개 물류기업이 매일 마주하는 4가지 고통
          </p>
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

        {/* CTA Section */}
        <div className="mt-20 lg:mt-32 text-center">
          <p className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-8">
            이 문제들을 <span className="text-primary-500">단 하나의 솔루션</span>으로 해결할 수 있다면?
          </p>
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
    </section>
  );
}
