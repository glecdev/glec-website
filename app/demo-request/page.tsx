/**
 * Demo Request Page - Multi-Step Form
 * Purpose: World-class 3-step wizard form for demo requests
 * Features:
 * - Progress indicator
 * - Zod validation
 * - localStorage auto-save
 * - Analytics tracking
 * - Calendar download (.ics)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useAnalytics } from '@/hooks/useAnalytics';

// ============================================================
// ZOD VALIDATION SCHEMAS
// ============================================================

const Step1Schema = z.object({
  companyName: z.string().min(1, '회사명을 입력해주세요'),
  contactName: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    errorMap: () => ({ message: '회사 규모를 선택해주세요' }),
  }),
});

const Step2Schema = z.object({
  productInterests: z
    .array(z.string())
    .min(1, '최소 1개 이상의 제품을 선택해주세요'),
  useCase: z.string().min(10, '사용 목적을 최소 10자 이상 입력해주세요'),
  currentSolution: z.string().optional(),
  monthlyShipments: z.enum(['<100', '100-1000', '1000-10000', '10000+'], {
    errorMap: () => ({ message: '월간 배송량을 선택해주세요' }),
  }),
});

const Step3Schema = z.object({
  preferredDate: z.string().min(1, '희망 날짜를 선택해주세요'),
  preferredTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, '시간을 선택해주세요'),
  additionalMessage: z.string().optional(),
});

type Step1Data = z.infer<typeof Step1Schema>;
type Step2Data = z.infer<typeof Step2Schema>;
type Step3Data = z.infer<typeof Step3Schema>;

type FormData = Step1Data & Step2Data & Step3Data;

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DemoRequestPage() {
  const router = useRouter();
  const { trackEvent, trackConversion } = useAnalytics();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<FormData>>({
    productInterests: [],
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================
  // LOCAL STORAGE AUTO-SAVE
  // ============================================================

  const STORAGE_KEY = 'glec_demo_request_draft';

  useEffect(() => {
    // Load from localStorage on mount
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || {});
        setCurrentStep(parsed.currentStep || 1);
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage on every change
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        formData,
        currentStep,
        savedAt: new Date().toISOString(),
      })
    );
  }, [formData, currentStep]);

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const handleInputChange = (
    field: keyof FormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleCheckboxChange = (product: string, checked: boolean) => {
    const current = formData.productInterests || [];
    const updated = checked
      ? [...current, product]
      : current.filter((p) => p !== product);
    handleInputChange('productInterests', updated);
  };

  const validateStep = (step: number): boolean => {
    setErrors({});

    try {
      if (step === 1) {
        Step1Schema.parse({
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          companySize: formData.companySize,
        });
      } else if (step === 2) {
        Step2Schema.parse({
          productInterests: formData.productInterests,
          useCase: formData.useCase,
          currentSolution: formData.currentSolution,
          monthlyShipments: formData.monthlyShipments,
        });
      } else if (step === 3) {
        Step3Schema.parse({
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          additionalMessage: formData.additionalMessage,
        });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      trackEvent('form_step_completed', `demo_request_step_${currentStep}`);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to submit');
      }

      // Track conversion
      await trackConversion(
        'demo_request',
        {
          company: formData.companyName,
          products: formData.productInterests,
          useCase: formData.useCase,
        },
        1000000 // 1M KRW estimated value
      );

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Redirect to success page
      router.push(`/demo-request/success?id=${data.data.id}`);
    } catch (error) {
      console.error('Failed to submit demo request:', error);
      alert('데모 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">무료 데모 신청</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            GLEC 솔루션을 직접 체험하고 맞춤 컨설팅을 받아보세요
          </p>
        </div>
      </section>

      {/* Progress Indicator */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                    ${
                      currentStep >= step
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {step}
                </div>
                <div className="ml-4 flex-1">
                  <p
                    className={`font-semibold ${
                      currentStep >= step ? 'text-primary-500' : 'text-gray-500'
                    }`}
                  >
                    {step === 1 && '회사 정보'}
                    {step === 2 && '요구사항'}
                    {step === 3 && '일정 선택'}
                  </p>
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 w-full mx-4 ${
                      currentStep > step ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  회사 정보를 입력해주세요
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    회사명 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.companyName ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="주식회사 글렉"
                  />
                  {errors.companyName && (
                    <p className="text-error-500 text-sm mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이름 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.contactName ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.contactName || ''}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="홍길동"
                  />
                  {errors.contactName && (
                    <p className="text-error-500 text-sm mt-1">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    이메일 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="hongildong@glec.io"
                  />
                  {errors.email && (
                    <p className="text-error-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    전화번호 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.phone ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.phone || ''}
                    onChange={(e) =>
                      handleInputChange('phone', formatPhoneNumber(e.target.value))
                    }
                    placeholder="010-1234-5678"
                    maxLength={13}
                  />
                  {errors.phone && (
                    <p className="text-error-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    회사 규모 <span className="text-error-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.companySize ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.companySize || ''}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                  >
                    <option value="">선택해주세요</option>
                    <option value="1-10">1-10명</option>
                    <option value="11-50">11-50명</option>
                    <option value="51-200">51-200명</option>
                    <option value="201-1000">201-1,000명</option>
                    <option value="1000+">1,000명 이상</option>
                  </select>
                  {errors.companySize && (
                    <p className="text-error-500 text-sm mt-1">{errors.companySize}</p>
                  )}
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    다음 단계
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Interest & Requirements */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  어떤 솔루션이 필요하신가요?
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    관심 제품 <span className="text-error-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {[
                      'DTG Series5',
                      'Carbon API',
                      'GLEC Cloud',
                      'AI DTG',
                    ].map((product) => (
                      <label
                        key={product}
                        className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                          checked={formData.productInterests?.includes(product)}
                          onChange={(e) =>
                            handleCheckboxChange(product, e.target.checked)
                          }
                        />
                        <span className="ml-3 font-medium text-gray-900">
                          {product}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.productInterests && (
                    <p className="text-error-500 text-sm mt-1">
                      {errors.productInterests}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    사용 목적 <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                      errors.useCase ? 'border-error-500' : 'border-gray-300'
                    }`}
                    rows={5}
                    value={formData.useCase || ''}
                    onChange={(e) => handleInputChange('useCase', e.target.value)}
                    placeholder="예: 물류 배송 차량의 탄소배출량을 측정하고 ISO-14083 인증을 받고 싶습니다."
                  />
                  {errors.useCase && (
                    <p className="text-error-500 text-sm mt-1">{errors.useCase}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    현재 사용 중인 솔루션 (선택)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.currentSolution || ''}
                    onChange={(e) =>
                      handleInputChange('currentSolution', e.target.value)
                    }
                    placeholder="예: 엑셀, 자체 개발 시스템 등"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    월간 배송량 <span className="text-error-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.monthlyShipments ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.monthlyShipments || ''}
                    onChange={(e) =>
                      handleInputChange('monthlyShipments', e.target.value)
                    }
                  >
                    <option value="">선택해주세요</option>
                    <option value="<100">100건 미만</option>
                    <option value="100-1000">100-1,000건</option>
                    <option value="1000-10000">1,000-10,000건</option>
                    <option value="10000+">10,000건 이상</option>
                  </select>
                  {errors.monthlyShipments && (
                    <p className="text-error-500 text-sm mt-1">
                      {errors.monthlyShipments}
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={handleBack}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-all hover:-translate-y-0.5 shadow-lg"
                  >
                    다음 단계
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Schedule Demo */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  데모 일정을 선택해주세요
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    희망 날짜 <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.preferredDate ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.preferredDate || ''}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.preferredDate && (
                    <p className="text-error-500 text-sm mt-1">
                      {errors.preferredDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    희망 시간 <span className="text-error-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.preferredTime ? 'border-error-500' : 'border-gray-300'
                    }`}
                    value={formData.preferredTime || ''}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  >
                    <option value="">선택해주세요</option>
                    <option value="10:00">오전 10:00</option>
                    <option value="11:00">오전 11:00</option>
                    <option value="14:00">오후 2:00</option>
                    <option value="15:00">오후 3:00</option>
                    <option value="16:00">오후 4:00</option>
                  </select>
                  {errors.preferredTime && (
                    <p className="text-error-500 text-sm mt-1">
                      {errors.preferredTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    추가 메시지 (선택)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                    value={formData.additionalMessage || ''}
                    onChange={(e) =>
                      handleInputChange('additionalMessage', e.target.value)
                    }
                    placeholder="추가로 문의하실 내용이 있다면 작성해주세요."
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={handleBack}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    이전
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-all hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '제출 중...' : '데모 신청하기'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              평균 응답 시간: <span className="font-semibold">24시간 이내</span>
            </p>
            <p className="text-sm mt-2">
              1,200+ 기업이 GLEC을 선택했습니다
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
