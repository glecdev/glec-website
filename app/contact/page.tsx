/**
 * Contact Page
 *
 * Based on:
 * - FR-WEB-006: 문의 폼 기능
 * - GLEC-API-Specification.yaml: POST /api/contact
 * - GLEC-Page-Structure-Standards.md: /contact 레이아웃
 * - GLEC-Design-System-Standards.md: 컴포넌트 스타일
 *
 * Features:
 * - Zod schema validation
 * - Rate limiting: 시간당 3회/IP
 * - Toast notifications
 * - Form reset on success
 * - Auto-redirect after 3 seconds
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
// INQUIRY TYPE OPTIONS
// ============================================================

const inquiryTypeOptions: SelectOption[] = [
  { value: 'PRODUCT', label: '제품 문의' },
  { value: 'PARTNERSHIP', label: '파트너십 문의' },
  { value: 'SUPPORT', label: '기술 지원' },
  { value: 'GENERAL', label: '기타' },
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

      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-500 to-navy-900 text-white py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">문의하기</h1>
          <p className="text-lg lg:text-xl text-gray-100">
            전문가 상담을 통해 최적의 솔루션을 찾아드립니다
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                연락처 정보
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <svg
                    className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0"
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
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      이메일
                    </h3>
                    <a
                      href="mailto:contact@glec.io"
                      className="text-base text-primary-500 hover:text-primary-600"
                    >
                      contact@glec.io
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg
                    className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0"
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
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      전화
                    </h3>
                    <p className="text-base text-gray-600">02-XXXX-XXXX</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg
                    className="w-6 h-6 text-primary-500 mt-1 flex-shrink-0"
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
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      운영 시간
                    </h3>
                    <p className="text-base text-gray-600">
                      평일: 09:00 - 18:00
                    </p>
                    <p className="text-base text-gray-600">
                      주말/공휴일: 휴무
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-lg border border-primary-200">
                <h3 className="text-base font-semibold text-primary-900 mb-2">
                  빠른 응답 안내
                </h3>
                <p className="text-sm text-primary-700">
                  영업일 기준 24시간 내에 답변드립니다.
                  <br />
                  긴급한 문의는 전화로 연락주시기 바랍니다.
                </p>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                문의 폼
              </h2>

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

                {/* Message */}
                <Textarea
                  name="message"
                  label="문의 내용"
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                  placeholder="문의하실 내용을 상세히 입력해주세요"
                  rows={6}
                  maxLength={1000}
                  showCharCount
                  isRequired
                  disabled={isSubmitting}
                />

                {/* Privacy Consent */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="privacy_consent"
                      checked={formData.privacy_consent}
                      onChange={handleCheckboxChange}
                      className="mt-1 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">
                      개인정보 수집 및 이용에 동의합니다{' '}
                      <span className="text-error-500">*</span>
                    </span>
                  </label>
                  {errors.privacy_consent && (
                    <p className="mt-1 text-sm text-error-500">
                      {errors.privacy_consent}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    수집된 개인정보는 문의 응대 목적으로만 사용되며, 답변 완료
                    후 즉시 파기됩니다.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
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
                    '문의하기'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
