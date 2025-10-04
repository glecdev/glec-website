/**
 * Partnership Page
 *
 * Based on: GLEC-Page-Structure-Standards.md, GLEC-Design-System-Standards.md
 * Purpose: Partnership program introduction with application form
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface PartnershipFormData {
  companyName: string;
  contactName: string;
  email: string;
  partnershipType: string;
  proposal: string;
}

interface FormErrors {
  companyName?: string;
  contactName?: string;
  email?: string;
  partnershipType?: string;
  proposal?: string;
}

export default function PartnershipPage() {
  const [formData, setFormData] = useState<PartnershipFormData>({
    companyName: '',
    contactName: '',
    email: '',
    partnershipType: '',
    proposal: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const partnershipTypes = [
    { value: 'tech', label: '기술 파트너' },
    { value: 'reseller', label: '리셀러' },
    { value: 'consulting', label: '컨설팅' },
    { value: 'other', label: '기타' },
  ];

  const partners = [
    {
      name: 'DHL GoGreen',
      logo: '/images/logos/dhl.png',
      description: '글로벌 물류 파트너십',
    },
    {
      name: 'Smart Freight Centre',
      logo: '/images/logos/sfc.png',
      description: 'ISO-14083 국제표준',
    },
    {
      name: 'ISO-14083',
      logo: '/images/logos/iso.png',
      description: '국제표준 인증',
    },
  ];

  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: '비즈니스 성장',
      description: 'GLEC의 글로벌 네트워크를 활용한 시장 확대 기회',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      title: '기술 지원',
      description: 'ISO-14083 기술 표준 및 API 연동 지원',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: '수익 공유',
      description: '파트너십 유형에 따른 경쟁력 있는 수익 배분 구조',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      title: '브랜드 제휴',
      description: 'DHL GoGreen 등 글로벌 브랜드와의 공동 마케팅',
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '회사명을 입력해주세요';
    } else if (formData.companyName.length > 100) {
      newErrors.companyName = '회사명은 100자 이하로 입력해주세요';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = '담당자 이름을 입력해주세요';
    } else if (formData.contactName.length > 50) {
      newErrors.contactName = '담당자 이름은 50자 이하로 입력해주세요';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.partnershipType) {
      newErrors.partnershipType = '파트너십 유형을 선택해주세요';
    }

    if (!formData.proposal.trim()) {
      newErrors.proposal = '제안 내용을 입력해주세요';
    } else if (formData.proposal.length < 10) {
      newErrors.proposal = '제안 내용을 최소 10자 이상 입력해주세요';
    } else if (formData.proposal.length > 1000) {
      newErrors.proposal = '제안 내용은 1000자 이하로 입력해주세요';
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
      const response = await fetch('/api/partnership', {
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

      setSubmitStatus('success');
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        partnershipType: '',
        proposal: '',
      });
      setErrors({});

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

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 to-navy-900 text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              파트너십
            </h1>
            <p className="text-xl lg:text-2xl text-gray-100 leading-relaxed mb-8">
              글로벌 리더들과 함께 탄소중립 미래를 만들어갑니다
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-primary-500">
                파트너 혜택 보기
              </Button>
              <Button variant="primary" size="lg" className="bg-white text-primary-500 hover:bg-gray-100">
                파트너십 신청
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Existing Partners Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              함께하는 파트너
            </h2>
            <p className="text-xl text-gray-600">
              글로벌 표준 기관 및 물류 선도 기업과 협력하고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12">
            {partners.map((partner, index) => (
              <div
                key={partner.name}
                className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center"
              >
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={partner.logo}
                    alt={`${partner.name} 로고`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 128px, 128px"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{partner.name}</h3>
                <p className="text-sm text-gray-600 text-center">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              파트너 혜택
            </h2>
            <p className="text-xl text-gray-600">
              GLEC 파트너로서 누릴 수 있는 특별한 혜택
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Application Form */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                파트너십 신청
              </h2>
              <p className="text-xl text-gray-600">
                귀사의 제안을 기다립니다
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 mb-2">
                    회사명 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.companyName ? 'border-error-500' : 'border-gray-300'
                    )}
                    placeholder="(주)글로벌솔루션"
                    maxLength={100}
                    aria-invalid={!!errors.companyName}
                    aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                  />
                  {errors.companyName && (
                    <p id="companyName-error" className="mt-1 text-sm text-error-500">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                {/* Contact Name */}
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-gray-900 mb-2">
                    담당자 이름 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.contactName ? 'border-error-500' : 'border-gray-300'
                    )}
                    placeholder="홍길동"
                    maxLength={50}
                    aria-invalid={!!errors.contactName}
                    aria-describedby={errors.contactName ? 'contactName-error' : undefined}
                  />
                  {errors.contactName && (
                    <p id="contactName-error" className="mt-1 text-sm text-error-500">
                      {errors.contactName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    이메일 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.email ? 'border-error-500' : 'border-gray-300'
                    )}
                    placeholder="contact@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-error-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Partnership Type */}
                <div>
                  <label htmlFor="partnershipType" className="block text-sm font-semibold text-gray-900 mb-2">
                    파트너십 유형 <span className="text-error-500">*</span>
                  </label>
                  <select
                    id="partnershipType"
                    name="partnershipType"
                    value={formData.partnershipType}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
                      errors.partnershipType ? 'border-error-500' : 'border-gray-300'
                    )}
                    aria-invalid={!!errors.partnershipType}
                    aria-describedby={errors.partnershipType ? 'partnershipType-error' : undefined}
                  >
                    <option value="">유형을 선택하세요</option>
                    {partnershipTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.partnershipType && (
                    <p id="partnershipType-error" className="mt-1 text-sm text-error-500">
                      {errors.partnershipType}
                    </p>
                  )}
                </div>

                {/* Proposal */}
                <div>
                  <label htmlFor="proposal" className="block text-sm font-semibold text-gray-900 mb-2">
                    제안 내용 <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    id="proposal"
                    name="proposal"
                    value={formData.proposal}
                    onChange={handleChange}
                    rows={6}
                    className={cn(
                      'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none',
                      errors.proposal ? 'border-error-500' : 'border-gray-300'
                    )}
                    placeholder="파트너십 제안 내용을 자세히 작성해주세요. (최소 10자, 최대 1000자)"
                    maxLength={1000}
                    aria-invalid={!!errors.proposal}
                    aria-describedby={errors.proposal ? 'proposal-error' : undefined}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.proposal && (
                      <p id="proposal-error" className="text-sm text-error-500">
                        {errors.proposal}
                      </p>
                    )}
                    <p className={cn('text-sm ml-auto', formData.proposal.length > 1000 ? 'text-error-500' : 'text-gray-500')}>
                      {formData.proposal.length} / 1000
                    </p>
                  </div>
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
                    '파트너십 신청하기'
                  )}
                </button>

                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-success-50 border border-success-200 rounded-lg" role="alert">
                    <p className="text-success-800 font-semibold">
                      ✓ 파트너십 신청이 완료되었습니다!
                    </p>
                    <p className="text-success-700 text-sm mt-1">
                      영업일 기준 3일 내에 담당자가 연락드리겠습니다.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-error-50 border border-error-200 rounded-lg" role="alert">
                    <p className="text-error-800 font-semibold">
                      ✗ 전송 중 오류가 발생했습니다
                    </p>
                    <p className="text-error-700 text-sm mt-1">
                      잠시 후 다시 시도하거나 contact@glec.io로 연락주세요.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-2">파트너십 관련 문의</p>
              <a
                href="mailto:partnership@glec.io"
                className="text-primary-500 hover:text-primary-600 font-semibold transition-colors duration-200"
              >
                partnership@glec.io
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
