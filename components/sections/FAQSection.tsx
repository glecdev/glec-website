/**
 * FAQSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-009 estimated)
 * Purpose: Frequently Asked Questions with accordion UI
 */

'use client';

import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface FAQ {
  id: string;
  category: 'GENERAL' | 'PRODUCT' | 'PRICING' | 'TECHNICAL';
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'GENERAL',
    question: 'GLEC은 어떤 서비스인가요?',
    answer:
      'GLEC은 물류 탄소배출량을 ISO-14083 국제표준에 따라 측정하고 관리하는 통합 솔루션입니다. DTG 하드웨어, Carbon API, GLEC Cloud 3가지 제품을 통해 데이터 수집부터 보고서 생성까지 전 과정을 자동화합니다.',
  },
  {
    id: '2',
    category: 'GENERAL',
    question: 'ISO-14083 표준이란 무엇인가요?',
    answer:
      'ISO-14083은 물류 및 운송 서비스의 온실가스 배출량 정량화 및 보고를 위한 국제표준입니다. 2023년 3월 발표된 이 표준은 전 세계 물류기업이 일관된 방식으로 탄소배출량을 측정할 수 있도록 합니다. GLEC의 모든 제품은 이 표준을 100% 준수합니다.',
  },
  {
    id: '3',
    category: 'PRODUCT',
    question: 'GLEC DTG Series5의 특징은 무엇인가요?',
    answer:
      'GLEC DTG Series5는 세계 최초로 스마트폰 CPU를 탑재한 차량용 탄소배출 측정 장치입니다. 80만원의 일회성 비용으로 구매 가능하며, ISO-14083 엔진이 내장되어 실시간으로 탄소배출량을 계산합니다. GPS, 속도, 연료 소비량 등의 데이터를 자동으로 수집하여 서버로 전송합니다.',
  },
  {
    id: '4',
    category: 'PRODUCT',
    question: 'Carbon API는 어떻게 사용하나요?',
    answer:
      'Carbon API는 RESTful API로 제공되며, 48개의 엔드포인트를 통해 5개 운송모드(육로, 해상, 물류허브, 항공, 철도)의 탄소배출량을 계산할 수 있습니다. API 키를 발급받은 후 HTTP 요청으로 간단하게 연동 가능하며, 물류기업과 화주사를 위한 PDF 보고서 자동 생성 기능도 제공합니다.',
  },
  {
    id: '5',
    category: 'PRODUCT',
    question: 'GLEC Cloud와 DTG의 차이점은 무엇인가요?',
    answer:
      'GLEC DTG는 차량에 설치하는 하드웨어 장치이고, GLEC Cloud는 DTG에서 수집된 데이터를 실시간으로 모니터링하고 분석하는 클라우드 플랫폼입니다. GLEC Cloud는 월 12만원으로 화주기업과 물류기업 모두를 위한 대시보드, 자동 보고서 생성, 데이터 내보내기 기능을 제공합니다.',
  },
  {
    id: '6',
    category: 'PRICING',
    question: '가격 정책은 어떻게 되나요?',
    answer:
      'GLEC DTG Series5는 80만원(일회성 구매), Carbon API는 사용량 기반 종량제, GLEC Cloud는 월 12만원 구독 모델입니다. 대규모 도입 시 별도 협의를 통해 할인이 가능하며, 1개월 무료 파일럿 프로그램도 제공합니다.',
  },
  {
    id: '7',
    category: 'PRICING',
    question: '무료 체험이 가능한가요?',
    answer:
      '네, 1개월 무료 파일럿 프로그램을 제공합니다. GLEC DTG 5대와 GLEC Cloud 계정을 무료로 제공하여 실제 운영 환경에서 테스트할 수 있습니다. 파일럿 기간 동안 전담 컨설턴트가 배정되어 기술 지원을 제공합니다.',
  },
  {
    id: '8',
    category: 'TECHNICAL',
    question: '설치는 어떻게 진행되나요?',
    answer:
      'GLEC DTG는 차량의 OBD-II 포트에 플러그인 방식으로 간편하게 설치됩니다. 별도의 배선 작업이 필요 없으며, 설치 시간은 차량 1대당 약 5분입니다. 전국 서비스 센터를 통해 방문 설치 서비스도 제공합니다.',
  },
  {
    id: '9',
    category: 'TECHNICAL',
    question: '데이터는 얼마나 자주 업데이트되나요?',
    answer:
      'GLEC DTG는 5분마다 데이터를 서버로 전송하며, GLEC Cloud 대시보드는 실시간으로 업데이트됩니다. 네트워크 연결이 끊긴 경우 DTG 내부 메모리에 최대 72시간 분량의 데이터를 저장하고, 연결 복구 시 자동으로 동기화됩니다.',
  },
  {
    id: '10',
    category: 'TECHNICAL',
    question: '어떤 차량에 설치할 수 있나요?',
    answer:
      'OBD-II 포트가 있는 모든 차량에 설치 가능합니다. 2000년 이후 출시된 대부분의 승용차, 화물차, 버스가 해당됩니다. 전기차와 하이브리드 차량도 지원하며, 특수 차량의 경우 별도 문의 주시기 바랍니다.',
  },
];

const categories = {
  GENERAL: '일반',
  PRODUCT: '제품',
  PRICING: '가격',
  TECHNICAL: '기술',
};

export function FAQSection() {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categories | 'ALL'>('ALL');
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);

  const filteredFAQs =
    selectedCategory === 'ALL'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  return (
    <section
      ref={elementRef}
      className="py-20 lg:py-32 bg-white"
      aria-label="자주 묻는 질문 섹션"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div
            className={cn(
              'text-center mb-12',
              'transition-all duration-700 ease-out',
              isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              자주 묻는 질문
            </h2>
            <p className="text-xl text-gray-600">
              GLEC에 대해 궁금하신 점을 확인해보세요
            </p>
          </div>

          {/* Category Filters */}
          <div
            className={cn(
              'flex flex-wrap justify-center gap-3 mb-12',
              'transition-all duration-700 ease-out',
              isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{
              transitionDelay: isIntersecting ? '200ms' : '0ms',
            }}
          >
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                'px-6 py-2 rounded-full font-semibold transition-all duration-200',
                selectedCategory === 'ALL'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              전체
            </button>
            {(Object.keys(categories) as Array<keyof typeof categories>).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-6 py-2 rounded-full font-semibold transition-all duration-200',
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {categories[category]}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div
            className={cn(
              'space-y-4',
              'transition-all duration-700 ease-out',
              isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{
              transitionDelay: isIntersecting ? '400ms' : '0ms',
            }}
          >
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className={cn(
                  'bg-gray-50 rounded-lg overflow-hidden transition-all duration-700 ease-out',
                  isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{
                  transitionDelay: isIntersecting ? `${400 + index * 50}ms` : '0ms',
                }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors duration-200"
                  aria-expanded={openFAQId === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div className="flex items-start flex-1">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full mr-4 flex-shrink-0">
                      {categories[faq.category]}
                    </span>
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                  </div>
                  <svg
                    className={cn(
                      'w-6 h-6 text-gray-500 transition-transform duration-200 flex-shrink-0',
                      openFAQId === faq.id ? 'transform rotate-180' : ''
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Answer */}
                <div
                  id={`faq-answer-${faq.id}`}
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    openFAQId === faq.id ? 'max-h-96' : 'max-h-0'
                  )}
                >
                  <div className="px-6 pb-4 pl-20">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div
            className={cn(
              'mt-12 text-center p-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg',
              'transition-all duration-700 ease-out',
              isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{
              transitionDelay: isIntersecting ? '800ms' : '0ms',
            }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              더 궁금한 점이 있으신가요?
            </h3>
            <p className="text-gray-600 mb-6">
              전문 상담사가 친절하게 답변해드립니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:010-4481-5189"
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-primary-500 rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                전화 상담
              </a>

              <a
                href="mailto:contact@glec.io"
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 active:bg-primary-100 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                이메일 문의
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
