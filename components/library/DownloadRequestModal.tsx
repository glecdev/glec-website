/**
 * Download Request Modal Component
 *
 * Purpose: Form modal for requesting library item download
 * Used in: /library page
 * Based on: GLEC-API-Specification.yaml (POST /api/library/request)
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { LibraryItem } from './LibraryCard';

// ====================================================================
// Types
// ====================================================================

interface DownloadRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LibraryItem;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

interface FormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  job_title: string;
  message: string;
}

interface FormErrors {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  industry?: string;
  job_title?: string;
}

// ====================================================================
// Component
// ====================================================================

export function DownloadRequestModal({
  isOpen,
  onClose,
  item,
  onSuccess,
  onError,
}: DownloadRequestModalProps) {
  // State
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: '',
    job_title: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Industry options
  const industryOptions = [
    { value: '', label: '산업 선택...' },
    { value: 'Manufacturing', label: '제조업' },
    { value: 'Logistics', label: '물류업' },
    { value: 'Retail', label: '소매업' },
    { value: 'E-commerce', label: '전자상거래' },
    { value: 'Technology', label: '기술/IT' },
    { value: 'Consulting', label: '컨설팅' },
    { value: 'Government', label: '공공기관' },
    { value: 'Education', label: '교육' },
    { value: 'Healthcare', label: '의료' },
    { value: 'Finance', label: '금융' },
    { value: 'Other', label: '기타' },
  ];

  // ====================================================================
  // Handlers
  // ====================================================================

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.company_name.trim()) {
      newErrors.company_name = '회사명을 입력해주세요';
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = '담당자명을 입력해주세요';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '유효한 전화번호를 입력해주세요 (숫자와 하이픈만 가능)';
    }

    if (!formData.industry) {
      newErrors.industry = '산업을 선택해주세요';
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = '직책을 입력해주세요';
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

    try {
      const response = await fetch('/api/library/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          library_item_id: item.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          onError('이미 다운로드 요청이 처리되었습니다. 잠시 후 다시 시도해주세요.');
        } else if (result.error) {
          onError(result.error.message || '다운로드 요청에 실패했습니다');
        } else {
          onError('다운로드 요청에 실패했습니다');
        }
        return;
      }

      if (result.success) {
        onSuccess(
          result.message ||
            '다운로드 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.'
        );
        // Reset form
        setFormData({
          company_name: '',
          contact_name: '',
          email: '',
          phone: '',
          industry: '',
          job_title: '',
          message: '',
        });
        onClose();
      } else {
        onError('다운로드 요청에 실패했습니다');
      }
    } catch (error) {
      console.error('Download request error:', error);
      onError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="
          bg-white rounded-lg shadow-2xl
          w-full max-w-2xl max-h-[90vh] overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
              다운로드 요청
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {item.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="
              text-gray-400 hover:text-gray-600
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Company Name */}
          <Input
            label="회사명"
            type="text"
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            error={errors.company_name}
            placeholder="주식회사 글렉"
            required
            disabled={isSubmitting}
          />

          {/* Contact Name */}
          <Input
            label="담당자명"
            type="text"
            value={formData.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            error={errors.contact_name}
            placeholder="홍길동"
            required
            disabled={isSubmitting}
          />

          {/* Email */}
          <Input
            label="이메일"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="hong@glec.io"
            required
            disabled={isSubmitting}
            helperText="다운로드 링크가 이메일로 전송됩니다"
          />

          {/* Phone */}
          <Input
            label="전화번호"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="010-1234-5678"
            required
            disabled={isSubmitting}
          />

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              산업 <span className="text-error-500">*</span>
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              disabled={isSubmitting}
              className={`
                w-full px-4 py-2
                text-base text-gray-900
                border rounded-lg
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-0
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${
                  errors.industry
                    ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }
              `}
              aria-invalid={!!errors.industry}
            >
              {industryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-error-500">{errors.industry}</p>
            )}
          </div>

          {/* Job Title */}
          <Input
            label="직책"
            type="text"
            value={formData.job_title}
            onChange={(e) => handleChange('job_title', e.target.value)}
            error={errors.job_title}
            placeholder="팀장, 부장, 대표 등"
            required
            disabled={isSubmitting}
          />

          {/* Message (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              문의사항 (선택)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="문의하실 내용이 있으시면 입력해주세요"
              disabled={isSubmitting}
              rows={4}
              className={`
                w-full px-4 py-2
                text-base text-gray-900
                border border-gray-300 rounded-lg
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                resize-none
              `}
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">개인정보 수집 및 이용 안내</p>
            <ul className="list-disc list-inside space-y-1">
              <li>수집 항목: 회사명, 담당자명, 이메일, 전화번호, 산업, 직책</li>
              <li>이용 목적: 자료 다운로드 링크 발송, 문의사항 응대</li>
              <li>보유 기간: 3년 (마케팅 동의 시)</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              위 사항에 동의하시고 계속 진행하시려면 아래 버튼을 클릭해주세요.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              fullWidth
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </span>
              ) : (
                '다운로드 요청'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
