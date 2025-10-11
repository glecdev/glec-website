/**
 * Contact Page - Enhanced Version
 *
 * Based on:
 * - FR-WEB-006: 문의 폼 기능
 * - GLEC-API-Specification.yaml: POST /api/contact
 * - GLEC-Page-Structure-Standards.md: /contact 레이아웃
 * - GLEC-Design-System-Standards.md: 컴포넌트 스타일
 *
 * Enhancements:
 * - Hero section with animated background
 * - Trust indicators (statistics, awards)
 * - Inquiry type detailed descriptions
 * - FAQ section
 * - Process timeline
 * - Office location with map
 * - Enhanced micro-interactions
 * - Accessibility improvements (WCAG 2.1 AA)
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

// ============================================================
// VALIDATION SCHEMA (Zod)
// ============================================================

const contactFormSchema = z.object({
  company_name: z
    .string()
    .min(1, '회사명을 입력해주세요')
    .max(100, '회사명은 100자 이하로 입력해주세요'),

  contact_name: z
    .string()
    .min(1, '담당자명을 입력해주세요')
    .max(50, '담당자명은 50자 이하로 입력해주세요'),

  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('유효한 이메일 형식이 아닙니다'),

  phone: z
    .string()
    .regex(
      /^010-\d{4}-\d{4}$/,
      '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'
    ),

  inquiry_type: z.enum(['PRODUCT', 'PARTNERSHIP', 'SUPPORT', 'GENERAL'], {
    required_error: '문의 유형을 선택해주세요',
  }),

  message: z
    .string()
    .min(10, '문의 내용은 최소 10자 이상 입력해주세요')
    .max(1000, '문의 내용은 1,000자 이하로 입력해주세요'),

  privacy_consent: z.boolean().refine((val) => val === true, {
    message: '개인정보 수집 및 이용에 동의해주세요',
  }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================================
// INQUIRY TYPE OPTIONS WITH DETAILED INFO
// ============================================================

const inquiryTypeOptions: SelectOption[] = [
  { value: 'PRODUCT', label: '제품 문의' },
  { value: 'PARTNERSHIP', label: '파트너십 문의' },
  { value: 'SUPPORT', label: '기술 지원' },
  { value: 'GENERAL', label: '기타 문의' },
];

const inquiryTypeDetails = {
  PRODUCT: {
    icon: '📦',
    title: '제품 문의',
    description:
      'DTG Series5, Carbon API, GLEC Cloud 등 제품에 대한 상세 정보, 가격, 데모 시연을 요청하실 수 있습니다.',
    examples: ['제품 기능 및 가격 안내', '무료 데모 시연', '맞춤형 솔루션 상담'],
  },
  PARTNERSHIP: {
    icon: '🤝',
    title: '파트너십 문의',
    description:
      '리셀러, 시스템 통합, 기술 제휴 등 다양한 협력 기회를 제안하실 수 있습니다.',
    examples: ['리셀러 파트너십', '기술 제휴', '공동 마케팅'],
  },
  SUPPORT: {
    icon: '🛠️',
    title: '기술 지원',
    description:
      '제품 사용 중 발생한 기술적 문제, API 연동, 시스템 장애 등에 대한 지원을 받으실 수 있습니다.',
    examples: ['API 연동 지원', '시스템 오류 해결', '기술 문서 요청'],
  },
  GENERAL: {
    icon: '💬',
    title: '기타 문의',
    description:
      '위 카테고리에 해당하지 않는 일반적인 문의사항을 접수하실 수 있습니다.',
    examples: ['회사 정보', '채용 문의', '미디어 협력'],
  },
};

// ============================================================
// FAQ DATA
// ============================================================

const faqs = [
  {
    question: '제품 데모는 어떻게 신청하나요?',
    answer:
      '문의 유형을 "제품 문의"로 선택하고 희망 날짜를 메시지에 기재해주시면, 영업일 기준 24시간 내에 연락드려 일정을 조율합니다.',
  },
  {
    question: '견적서는 언제 받을 수 있나요?',
    answer:
      '기본 견적서는 문의 접수 후 영업일 기준 2-3일 내에 발송됩니다. 맞춤형 견적이 필요한 경우 요구사항 검토 후 1주일 이내에 제공됩니다.',
  },
  {
    question: '해외 고객도 서비스를 이용할 수 있나요?',
    answer:
      '네, 글로벌 서비스를 제공합니다. ISO-14083 국제표준 기반으로 전 세계 어디서나 동일한 품질의 탄소배출 측정이 가능합니다.',
  },
  {
    question: '기술 지원은 어떻게 이루어지나요?',
    answer:
      '이메일, 전화, 원격 지원(TeamViewer, Zoom) 등 다양한 채널을 통해 지원합니다. 유료 고객의 경우 24/7 긴급 핫라인을 제공합니다.',
  },
  {
    question: '개인정보는 어떻게 보호되나요?',
    answer:
      '수집된 정보는 암호화되어 안전하게 저장되며, 문의 응대 목적으로만 사용됩니다. 답변 완료 후 즉시 파기하며, 제3자에게 제공하지 않습니다.',
  },
];

// ============================================================
// PROCESS STEPS
// ============================================================

const processSteps = [
  {
    step: 1,
    title: '문의 접수',
    description: '온라인 폼 또는 이메일로 문의 내용을 전달합니다.',
    duration: '즉시',
  },
  {
    step: 2,
    title: '담당자 배정',
    description: '문의 유형에 따라 전문 담당자가 배정됩니다.',
    duration: '2시간 이내',
  },
  {
    step: 3,
    title: '요구사항 분석',
    description: '고객님의 니즈를 정확히 파악하고 최적 솔루션을 검토합니다.',
    duration: '1-2일',
  },
  {
    step: 4,
    title: '제안 및 상담',
    description: '맞춤형 솔루션을 제안하고 상세 설명을 드립니다.',
    duration: '2-3일',
  },
];

// ============================================================
// STATISTICS DATA
// ============================================================

const statistics = [
  { value: '1,200+', label: '고객사' },
  { value: '24H', label: '평균 응답 시간' },
  { value: '98%', label: '고객 만족도' },
  { value: '10+', label: '수상 경력' },
];

// ============================================================
// COMPONENT
// ============================================================

export default function ContactPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = React.useState<ContactFormData>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    inquiry_type: 'PRODUCT',
    message: '',
    privacy_consent: false,
  });

  // Validation errors
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Toast state
  const [toast, setToast] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Selected inquiry type detail
  const selectedInquiryDetail =
    inquiryTypeDetails[formData.inquiry_type as keyof typeof inquiryTypeDetails];

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));

    // Clear error for this field
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ContactFormData];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));

    // Clear error for this field
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ContactFormData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const result = contactFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof ContactFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // API call
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (response.status === 429) {
          throw new Error(
            '잠시 후 다시 시도해주세요 (시간당 3회 제한)'
          );
        }

        if (data.error?.details) {
          // Field-specific errors from API
          const apiErrors: Partial<Record<keyof ContactFormData, string>> =
            {};
          data.error.details.forEach(
            (detail: { field: string; message: string }) => {
              apiErrors[detail.field as keyof ContactFormData] =
                detail.message;
            }
          );
          setErrors(apiErrors);
          throw new Error(data.error.message || '문의 접수에 실패했습니다');
        }

        throw new Error(data.error?.message || '문의 접수에 실패했습니다');
      }

      // Success
      setToast({
        type: 'success',
        message: '문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
      });

      // Reset form
      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        inquiry_type: 'PRODUCT',
        message: '',
        privacy_consent: false,
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      setToast({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : '문의 접수에 실패했습니다',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-navy-900 text-white py-20 lg:py-28 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              영업일 기준 24시간 내 답변
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              전문가와 상담하고
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                최적의 솔루션
              </span>
              을 찾아보세요
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-gray-100 mb-8 max-w-2xl mx-auto animate-fade-in-up delay-200">
              ISO-14083 국제표준 기반 물류 탄소배출 측정 솔루션
              <br />
              DHL GoGreen 파트너십으로 검증된 기술력
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-12 animate-fade-in-up delay-300">
              {statistics.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-3xl lg:text-4xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm lg:text-base text-gray-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-12 lg:h-16 fill-gray-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Inquiry Type Cards Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              문의 유형별 안내
            </h2>
            <p className="text-lg text-gray-600">
              고객님의 니즈에 맞는 전문 상담을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(inquiryTypeDetails).map(([key, detail]) => (
              <div
                key={key}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {detail.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {detail.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {detail.description}
                </p>
                <div className="space-y-2">
                  {detail.examples.map((example, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <svg
                        className="w-4 h-4 text-primary-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  연락처 정보
                </h2>
                <p className="text-base text-gray-600 mb-8">
                  다양한 채널을 통해 글렉에 연락하실 수 있습니다
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <svg
                      className="w-6 h-6 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      이메일
                    </h3>
                    <a
                      href="mailto:contact@glec.io"
                      className="text-base text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                    >
                      contact@glec.io
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      24시간 이내 답변
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <svg
                      className="w-6 h-6 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      전화
                    </h3>
                    <p className="text-base text-gray-900 font-medium">
                      02-XXXX-XXXX
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      평일 09:00 - 18:00
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                  <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <svg
                      className="w-6 h-6 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      주소
                    </h3>
                    <p className="text-base text-gray-900">
                      서울특별시 강남구 테헤란로 123
                    </p>
                    <p className="text-base text-gray-900">
                      글렉 빌딩 10층
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      방문 상담은 사전 예약 필수
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200">
                <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  운영 시간
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary-700 font-medium">
                      평일
                    </span>
                    <span className="text-primary-900">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-700 font-medium">
                      점심시간
                    </span>
                    <span className="text-primary-900">12:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-700 font-medium">
                      주말/공휴일
                    </span>
                    <span className="text-gray-600">휴무</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-primary-200">
                  <p className="text-xs text-primary-700 leading-relaxed">
                    💡 긴급 기술 지원은 유료 고객에 한해 24/7 핫라인을
                    제공합니다.
                  </p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  신뢰할 수 있는 파트너
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    DHL GoGreen 공식 파트너십
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ISO-14083 국제표준 준수
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    1,200+ 글로벌 기업 신뢰
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg
                      className="w-4 h-4 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    98% 고객 만족도
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  문의하기
                </h2>
                <p className="text-base text-gray-600">
                  필수 정보를 입력하시면 빠르게 연락드리겠습니다
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <Input
                  type="text"
                  name="company_name"
                  label="회사명"
                  value={formData.company_name}
                  onChange={handleChange}
                  error={errors.company_name}
                  placeholder="(주)글렉"
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Contact Name */}
                <Input
                  type="text"
                  name="contact_name"
                  label="담당자명"
                  value={formData.contact_name}
                  onChange={handleChange}
                  error={errors.contact_name}
                  placeholder="홍길동"
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Email */}
                <Input
                  type="email"
                  name="email"
                  label="이메일"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="contact@example.com"
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Phone */}
                <Input
                  type="tel"
                  name="phone"
                  label="전화번호"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="010-1234-5678"
                  helperText="하이픈(-)을 포함하여 입력해주세요"
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Inquiry Type */}
                <Select
                  name="inquiry_type"
                  label="문의 유형"
                  value={formData.inquiry_type}
                  onChange={handleChange}
                  options={inquiryTypeOptions}
                  error={errors.inquiry_type}
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Selected Inquiry Type Info */}
                {selectedInquiryDetail && (
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{selectedInquiryDetail.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-primary-900 mb-1">
                          {selectedInquiryDetail.title}
                        </h4>
                        <p className="text-xs text-primary-700 leading-relaxed">
                          {selectedInquiryDetail.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <Textarea
                  name="message"
                  label="문의 내용"
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                  placeholder="문의하실 내용을 상세히 입력해주세요&#10;&#10;예시:&#10;- 도입 희망 시기&#10;- 예상 차량 대수&#10;- 기존 시스템 유무&#10;- 예산 범위"
                  rows={6}
                  maxLength={1000}
                  showCharCount
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Privacy Consent */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="privacy_consent"
                      checked={formData.privacy_consent}
                      onChange={handleCheckboxChange}
                      className="mt-1 w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-semibold">
                        개인정보 수집 및 이용에 동의합니다
                      </span>{' '}
                      <span className="text-error-500">*</span>
                    </span>
                  </label>
                  {errors.privacy_consent && (
                    <p className="mt-2 text-sm text-error-500 ml-8">
                      {errors.privacy_consent}
                    </p>
                  )}
                  <div className="mt-3 ml-8 text-xs text-gray-500 leading-relaxed space-y-1">
                    <p>• 수집 항목: 회사명, 담당자명, 이메일, 전화번호, 문의 내용</p>
                    <p>• 수집 목적: 문의 응대 및 상담 서비스 제공</p>
                    <p>• 보유 기간: 문의 응대 완료 후 즉시 파기</p>
                    <p>• 제3자 제공: 제공하지 않음</p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  className="mt-8 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5 animate-spin"
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
                      제출 중...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      문의하기
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              문의 처리 프로세스
            </h2>
            <p className="text-lg text-gray-600">
              체계적인 프로세스로 빠르고 정확한 상담을 제공합니다
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600"></div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {processSteps.map((step) => (
                <div key={step.step} className="relative">
                  <div className="flex flex-col items-center text-center group">
                    {/* Step Number */}
                    <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.step}
                    </div>

                    {/* Step Content */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {step.duration}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600">
              고객님들이 자주 문의하시는 내용입니다
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                      Q{index + 1}
                    </span>
                    {faq.question}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                      A
                    </span>
                    <p className="pt-1">{faq.answer}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              더 궁금한 사항이 있으신가요?
            </h3>
            <p className="text-gray-600 mb-4">
              언제든지 문의해주시면 친절하게 답변드리겠습니다
            </p>
            <a
              href="mailto:contact@glec.io"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              이메일로 문의하기
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
