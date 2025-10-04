/**
 * CaseStudiesSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-004)
 * Purpose: Display customer success cases with DHL counter, ROI calculator, testimonials
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';

export function CaseStudiesSection() {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    triggerOnce: true,
  });

  // DHL Counter Animation
  const dhlCount = useCounterAnimation(158, 2000, isIntersecting);

  // ROI Calculator State
  const [vehicles, setVehicles] = useState(50);
  const [trips, setTrips] = useState(2000);

  // ROI Calculations
  const savedHours = vehicles * trips * 0.5;
  const savedCost = savedHours * 15000;
  const investment = vehicles * 800000;
  const roi = (savedCost / investment) * 100;

  // Testimonials
  const testimonials = [
    {
      company: 'CJ대한통운',
      logo: '/images/logos/cj-logistics.png',
      name: '김철수',
      position: '물류혁신팀 팀장',
      content: 'GLEC 도입 후 탄소배출 보고서 작성 시간이 80% 단축되었습니다. 이제 주말에 엑셀 작업을 하지 않아도 됩니다.',
      rating: 5,
    },
    {
      company: '한진',
      logo: '/images/logos/hanjin.png',
      name: '박영희',
      position: 'ESG 담당 이사',
      content: 'ISO-14083 국제표준을 자동으로 적용해주니 화주사 요청에 즉시 대응할 수 있게 되었습니다.',
      rating: 5,
    },
    {
      company: '롯데글로벌로지스',
      logo: '/images/logos/lotte-logistics.png',
      name: '이민수',
      position: '운영본부장',
      content: 'DTG 장착 후 실시간 데이터가 자동으로 수집되어 데이터 수집 인력이 50% 감소했습니다.',
      rating: 5,
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 lg:py-32 bg-white" ref={elementRef}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            검증된 성과
          </h2>
          <p className="text-xl text-gray-600">
            1,200개 기업이 선택한 GLEC의 실제 성과를 확인하세요
          </p>
        </div>

        {/* DHL Case Study */}
        <div className="max-w-4xl mx-auto mb-20 bg-gradient-to-br from-yellow-50 to-red-50 rounded-2xl p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center shadow-lg p-6">
                <Image
                  src="/images/logos/dhl.png"
                  alt="DHL GoGreen Partner"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
                {dhlCount.toLocaleString()}
                <span className="text-3xl lg:text-4xl ml-2">만 톤</span>
              </div>
              <p className="text-xl lg:text-2xl text-gray-700 font-semibold">
                연간 CO₂ 감축량
              </p>
              <p className="text-gray-600 mt-4">
                DHL GoGreen 프로그램과 GLEC의 파트너십을 통해 달성한 성과
              </p>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="max-w-4xl mx-auto mb-20 bg-gray-50 rounded-2xl p-8 lg:p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            우리 회사의 ROI 계산하기
          </h3>

          <div className="space-y-8">
            {/* Vehicle Slider */}
            <div>
              <label htmlFor="vehicle-slider" className="block text-lg font-semibold text-gray-700 mb-3">
                차량 대수: <span className="text-primary-500">{vehicles}대</span>
              </label>
              <input
                id="vehicle-slider"
                type="range"
                min="1"
                max="500"
                value={vehicles}
                onChange={(e) => setVehicles(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                aria-label="차량 대수 선택"
              />
            </div>

            {/* Trips Slider */}
            <div>
              <label htmlFor="trips-slider" className="block text-lg font-semibold text-gray-700 mb-3">
                월 운행 횟수: <span className="text-primary-500">{trips.toLocaleString()}회</span>
              </label>
              <input
                id="trips-slider"
                type="range"
                min="100"
                max="10000"
                step="100"
                value={trips}
                onChange={(e) => setTrips(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                aria-label="월 운행 횟수 선택"
              />
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-3 gap-6 pt-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary-500 mb-2">
                  {savedHours.toLocaleString()}h
                </div>
                <div className="text-gray-600">절감 시간/월</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary-500 mb-2">
                  ₩{(savedCost / 10000).toLocaleString()}만
                </div>
                <div className="text-gray-600">절감 비용/월</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {roi.toFixed(1)}%
                </div>
                <div className="text-gray-600">월간 ROI</div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center mt-4">
              * 계산 기준: 시간당 15,000원, DTG 단가 80만원
            </p>
          </div>
        </div>

        {/* Customer Testimonials */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            고객 후기
          </h3>

          <div className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <div className="flex flex-col items-center text-center">
              {/* Company Logo */}
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 p-4">
                <Image
                  src={testimonials[currentTestimonial].logo}
                  alt={`${testimonials[currentTestimonial].company} 로고`}
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>

              {/* Quote */}
              <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed max-w-2xl">
                &ldquo;{testimonials[currentTestimonial].content}&rdquo;
              </blockquote>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-6 h-6 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Author */}
              <div className="text-gray-900 font-semibold">
                {testimonials[currentTestimonial].name}
              </div>
              <div className="text-gray-600">
                {testimonials[currentTestimonial].company} {testimonials[currentTestimonial].position}
              </div>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-primary-500 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`후기 ${index + 1}번으로 이동`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
