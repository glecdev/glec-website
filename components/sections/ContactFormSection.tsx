/**
 * ContactFormSection Component
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-WEB-008 estimated)
 * Purpose: Contact form with validation and submission
 */

'use client';

import React, { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  vehicleCount: string;
  message: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export function ContactFormSection() {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    vehicleCount: '10-50',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    // Company validation
    if (!formData.company.trim()) {
      newErrors.company = '회사명을 입력해주세요';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // Phone validation
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!phoneRegex.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = '문의 내용을 입력해주세요';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = '문의 내용을 최소 10자 이상 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Call API endpoint
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to submit form');
      }

      // Success
      setSubmitStatus('success');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        vehicleCount: '10-50',
        message: '',
      });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <section
      ref={elementRef}
      className="py-20 lg:py-32 bg-gray-50"
      aria-label="무료 상담 신청 폼 섹션"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div
            className={cn(
              'text-center mb-12',
              'transition-all duration-700 ease-out',
              isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              무료 상담 신청
            </h2>
            <p className="text-xl text-gray-600">
              전문 컨설턴트가 귀사의 탄소배출 측정 전략을 설계해드립니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div
              className={cn(
                'transition-all duration-700 ease-out',
                isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{
                transitionDelay: isIntersecting ? '200ms' : '0ms',
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="홍길동"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                    회사명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="(주)글로벌물류"
                    aria-invalid={!!errors.company}
                    aria-describedby={errors.company ? 'company-error' : undefined}
                  />
                  {errors.company && (
                    <p id="company-error" className="mt-1 text-sm text-red-500">
                      {errors.company}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="contact@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="010-1234-5678"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="mt-1 text-sm text-red-500">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Vehicle Count */}
                <div>
                  <label htmlFor="vehicleCount" className="block text-sm font-semibold text-gray-900 mb-2">
                    보유 차량 대수
                  </label>
                  <select
                    id="vehicleCount"
                    name="vehicleCount"
                    value={formData.vehicleCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="1-10">1-10대</option>
                    <option value="10-50">10-50대</option>
                    <option value="50-100">50-100대</option>
                    <option value="100-500">100-500대</option>
                    <option value="500+">500대 이상</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none',
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="탄소배출 측정과 관련하여 궁금하신 점을 자유롭게 작성해주세요."
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1 text-sm text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full px-8 py-4 text-lg font-semibold text-white bg-primary-500 rounded-lg transition-all duration-200',
                    isSubmitting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-primary-600 active:bg-primary-700 shadow-lg hover:shadow-xl'
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      전송 중...
                    </span>
                  ) : (
                    '무료 상담 신청하기'
                  )}
                </button>

                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                  <div
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                    role="alert"
                  >
                    <p className="text-green-800 font-semibold">
                      ✓ 상담 신청이 완료되었습니다!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      영업일 기준 24시간 내에 담당자가 연락드리겠습니다.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                    role="alert"
                  >
                    <p className="text-red-800 font-semibold">
                      ✗ 전송 중 오류가 발생했습니다
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      잠시 후 다시 시도하거나 010-4481-5189로 연락주세요.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info & Benefits */}
            <div
              className={cn(
                'space-y-8',
                'transition-all duration-700 ease-out',
                isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}
              style={{
                transitionDelay: isIntersecting ? '400ms' : '0ms',
              }}
            >
              {/* Direct Contact */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">직접 문의하기</h3>
                <div className="space-y-3">
                  <a
                    href="tel:010-4481-5189"
                    className="flex items-center text-gray-700 hover:text-primary-500 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-primary-500"
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
                    010-4481-5189
                  </a>

                  <a
                    href="mailto:contact@glec.io"
                    className="flex items-center text-gray-700 hover:text-primary-500 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-primary-500"
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
                    contact@glec.io
                  </a>

                  <div className="flex items-start text-gray-700">
                    <svg
                      className="w-5 h-5 mr-3 text-primary-500 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold">상담 가능 시간</p>
                      <p className="text-sm text-gray-600">평일 09:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Benefits */}
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">무료 상담 혜택</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-primary-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">맞춤형 탄소배출 측정 전략</p>
                      <p className="text-sm text-gray-600 mt-1">
                        귀사의 물류 규모와 업종에 최적화된 솔루션 제안
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-primary-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">ROI 예상 분석 리포트</p>
                      <p className="text-sm text-gray-600 mt-1">
                        도입 시 예상되는 비용 절감 효과 분석 자료 제공
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <svg
                      className="w-6 h-6 text-primary-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">무료 파일럿 프로그램</p>
                      <p className="text-sm text-gray-600 mt-1">
                        1개월 무료 체험을 통한 실제 데이터 기반 검증 기회
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Trust Badge */}
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="flex justify-center mb-3">
                  <svg
                    className="w-12 h-12 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-semibold mb-1">개인정보 보호</p>
                <p className="text-sm text-gray-600">
                  모든 정보는 암호화되어 안전하게 보관되며,
                  <br />
                  상담 목적 외에는 절대 사용되지 않습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
