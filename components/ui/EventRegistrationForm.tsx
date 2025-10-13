/**
 * Event Registration Form Component
 *
 * Based on:
 * - GLEC-API-Specification.yaml (POST /api/events/{slug}/register)
 * - GLEC-Functional-Requirements-Specification.md (FR-WEB-016)
 * - GLEC-Design-System-Standards.md (Form inputs, Button)
 *
 * Purpose: Event registration form with validation
 * Design: Modal dialog with form inputs
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

export interface EventRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  eventSlug: string;
  eventTitle: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  job_title?: string;
  message?: string;
  privacy_consent: boolean;
  marketing_consent: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  privacy_consent?: string;
}

export function EventRegistrationForm({
  isOpen,
  onClose,
  eventSlug,
  eventTitle,
}: EventRegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    message: '',
    privacy_consent: false,
    marketing_consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 최소 2자 이상이어야 합니다';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^[0-9-]{10,13}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
      newErrors.phone = '유효한 전화번호를 입력해주세요 (예: 010-1234-5678)';
    }

    // Privacy consent validation (required)
    if (!formData.privacy_consent) {
      newErrors.privacy_consent = '개인정보 처리방침에 동의해야 참가신청이 가능합니다';
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
    setSubmitError(null);

    try {
      const response = await fetch(`/api/events/${eventSlug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || '참가신청에 실패했습니다');
      }

      // Success!
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form after closing
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          job_title: '',
          message: '',
          privacy_consent: false,
          marketing_consent: false,
        });
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('[EventRegistrationForm] Error:', error);
      setSubmitError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`참가 신청`}
      description={eventTitle}
      size="lg"
      variant="primary"
      closeOnBackdropClick={!isSubmitting}
      showCloseButton={!isSubmitting}
    >
      {submitSuccess ? (
        <div className="text-center py-12">
          <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">참가신청이 완료되었습니다!</h3>
          <p className="text-gray-600 mb-2">입력하신 이메일로 신청 확인 메일을 보내드렸습니다.</p>
          <p className="text-gray-600">빠른 시일 내에 연락드리겠습니다.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="홍길동"
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="example@company.com"
              disabled={isSubmitting}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="010-1234-5678"
              disabled={isSubmitting}
            />
          </div>

          {/* Company (Optional) */}
          <div>
            <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
              회사명 (선택)
            </label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="(주)회사명"
              disabled={isSubmitting}
            />
          </div>

          {/* Job Title (Optional) */}
          <div>
            <label htmlFor="job_title" className="block text-sm font-semibold text-gray-900 mb-2">
              직책 (선택)
            </label>
            <Input
              id="job_title"
              type="text"
              value={formData.job_title}
              onChange={(e) => handleChange('job_title', e.target.value)}
              placeholder="부장, 팀장, 대리 등"
              disabled={isSubmitting}
            />
          </div>

          {/* Message (Optional) */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
              문의사항 (선택)
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="이벤트 관련 문의사항이 있으시면 작성해주세요"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Privacy Consent (Required) */}
          <div>
            <Checkbox
              id="privacy_consent"
              checked={formData.privacy_consent}
              onChange={(checked) => handleChange('privacy_consent', checked)}
              label={
                <span>
                  <span className="text-red-500">* </span>
                  개인정보 수집 및 이용에 동의합니다{' '}
                  <a href="/privacy" target="_blank" className="text-primary-600 hover:text-primary-700 underline">
                    (자세히 보기)
                  </a>
                </span>
              }
              error={errors.privacy_consent}
              disabled={isSubmitting}
            />
          </div>

          {/* Marketing Consent (Optional) */}
          <div>
            <Checkbox
              id="marketing_consent"
              checked={formData.marketing_consent}
              onChange={(checked) => handleChange('marketing_consent', checked)}
              label="마케팅 정보 수신에 동의합니다 (선택)"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  처리중...
                </span>
              ) : (
                '참가 신청하기'
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
