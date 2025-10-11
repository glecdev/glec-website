/**
 * Library Page (/library)
 *
 * GLEC 지식 라이브러리 - PDF, 백서, 케이스 스터디 다운로드
 *
 * Features:
 * - Hero section
 * - Category filter tabs
 * - Library cards grid (3-column)
 * - Download request modal (gated content)
 * - Download count display
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { z } from 'zod';

// ============================================================
// TYPES
// ============================================================

interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  file_type: string;
  file_size_mb: number;
  download_type: string;
  category: string;
  tags: string[];
  language: string;
  version: string;
  requires_form: boolean;
  download_count: number;
  view_count: number;
  published_at: string;
}

interface ApiResponse {
  success: boolean;
  data: LibraryItem[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    category: string;
  };
}

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const downloadRequestSchema = z.object({
  library_item_id: z.string().uuid(),
  company_name: z.string().min(1, '회사명을 입력해주세요').max(100),
  contact_name: z.string().min(1, '담당자명을 입력해주세요').max(50),
  email: z.string().email('유효한 이메일 형식이 아닙니다'),
  phone: z.string().optional(),
  industry: z.string().min(1),
  job_title: z.string().optional(),
  message: z.string().optional(),
});

type DownloadRequestForm = z.infer<typeof downloadRequestSchema>;

// ============================================================
// COMPONENTS
// ============================================================

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { elementRef: heroRef, isIntersecting: heroVisible } = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { elementRef: gridRef, isIntersecting: gridVisible } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Fetch library items
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const response = await fetch(`/api/library/items?category=${selectedCategory}&per_page=50`);
        if (!response.ok) throw new Error('Failed to fetch library items');

        const result: ApiResponse = await response.json();
        if (!result.success) throw new Error('API returned error');

        setItems(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('[Library] Failed to fetch items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [selectedCategory]);

  const handleDownloadClick = (item: LibraryItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      library_item_id: selectedItem.id,
      company_name: formData.get('company_name') as string,
      contact_name: formData.get('contact_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      industry: formData.get('industry') as string,
      job_title: formData.get('job_title') as string,
      message: '', // Optional field
    };

    try {
      // Validate
      downloadRequestSchema.parse(data);

      setSubmitting(true);

      const response = await fetch('/api/library/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Download request failed');
      }

      // Success
      setShowModal(false);
      setToastMessage(`${data.email}로 다운로드 링크를 전송했습니다`);
      setShowSuccessToast(true);

      // Update download count locally
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, download_count: item.download_count + 1 } : item
        )
      );
    } catch (err) {
      console.error('[Library] Download request failed:', err);
      setToastMessage(err instanceof Error ? err.message : '다운로드 신청에 실패했습니다');
      setShowErrorToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-20 lg:py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-navy-900 text-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              'max-w-4xl mx-auto text-center',
              'transition-all duration-700 ease-out',
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              GLEC 지식 라이브러리
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8">
              ISO-14083 국제표준 자료, 백서, 케이스 스터디를 무료로 다운로드하세요
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { value: 'ALL', label: '전체' },
              { value: 'FRAMEWORK', label: 'Framework' },
              { value: 'WHITEPAPER', label: 'Whitepaper' },
              { value: 'CASE_STUDY', label: 'Case Study' },
              { value: 'DATASHEET', label: 'Datasheet' },
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
                  selectedCategory === cat.value
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Library Items Grid */}
      <section ref={gridRef} className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2].map((index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-4" />
                  <div className="h-32 bg-gray-200 rounded mb-4" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">해당 카테고리의 자료가 없습니다</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, index) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  index={index}
                  isIntersecting={gridVisible}
                  onDownloadClick={() => handleDownloadClick(item)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Download Request Modal */}
      {showModal && selectedItem && (
        <DownloadModal
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
          submitting={submitting}
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
          duration={5000}
        />
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowErrorToast(false)}
          duration={5000}
        />
      )}
    </div>
  );
}

// ============================================================
// LIBRARY CARD COMPONENT
// ============================================================

interface LibraryCardProps {
  item: LibraryItem;
  index: number;
  isIntersecting: boolean;
  onDownloadClick: () => void;
}

function LibraryCard({ item, index, isIntersecting, onDownloadClick }: LibraryCardProps) {
  const categoryColors: Record<string, string> = {
    FRAMEWORK: 'bg-blue-100 text-blue-700',
    WHITEPAPER: 'bg-purple-100 text-purple-700',
    CASE_STUDY: 'bg-green-100 text-green-700',
    DATASHEET: 'bg-orange-100 text-orange-700',
    OTHER: 'bg-gray-100 text-gray-700',
  };

  const fileTypeIcons: Record<string, string> = {
    PDF: '📄',
    EXCEL: '📊',
    PPT: '📑',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group',
        'transition-all duration-700 ease-out',
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{
        transitionDelay: isIntersecting ? `${index * 100}ms` : '0ms',
      }}
    >
      {/* Icon */}
      <div className="p-8 pb-0">
        <div className="text-6xl mb-4">{fileTypeIcons[item.file_type] || '📄'}</div>
        <span className={cn('inline-block px-3 py-1 text-xs font-semibold rounded-full', categoryColors[item.category])}>
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
          {item.title}
        </h3>

        {item.version && (
          <p className="text-sm text-gray-500 mb-2">Version {item.version}</p>
        )}

        <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-500">
          <span>📎 {item.file_type}</span>
          <span>💾 {item.file_size_mb} MB</span>
          <span>🌐 {item.language === 'ko' ? '한국어' : 'English'}</span>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            ⬇️ {item.download_count.toLocaleString()} 다운로드
          </span>
        </div>

        {/* CTA */}
        <Button onClick={onDownloadClick} variant="primary" fullWidth>
          무료 다운로드
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// DOWNLOAD MODAL COMPONENT
// ============================================================

interface DownloadModalProps {
  item: LibraryItem;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}

function DownloadModal({ item, onClose, onSubmit, submitting }: DownloadModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">자료 다운로드 신청</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Item Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">다운로드할 자료</p>
          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {item.file_type} · {item.file_size_mb} MB
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <Input
            label="회사명"
            name="company_name"
            required
            placeholder="예: 삼성전자"
          />

          <Input
            label="담당자명"
            name="contact_name"
            required
            placeholder="예: 홍길동"
          />

          <Input
            label="이메일"
            name="email"
            type="email"
            required
            placeholder="예: hong@samsung.com"
            helperText="다운로드 링크가 이 이메일로 전송됩니다"
          />

          <Input
            label="전화번호"
            name="phone"
            required
            placeholder="예: 010-1234-5678"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              산업 <span className="text-error-500">*</span>
            </label>
            <select
              name="industry"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">산업 선택...</option>
              <option value="Manufacturing">제조업</option>
              <option value="Logistics">물류업</option>
              <option value="Retail">소매업</option>
              <option value="E-commerce">전자상거래</option>
              <option value="Technology">기술/IT</option>
              <option value="Consulting">컨설팅</option>
              <option value="Government">공공기관</option>
              <option value="Other">기타</option>
            </select>
          </div>

          <Input
            label="직책"
            name="job_title"
            required
            placeholder="예: 팀장, 부장, 대표 등"
          />

          {/* Privacy Notice */}
          <div className="pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">개인정보 수집 및 이용 안내</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>수집 항목: 회사명, 담당자명, 이메일, 전화번호, 산업, 직책</li>
              <li>이용 목적: 자료 다운로드 링크 발송, 문의사항 응대</li>
              <li>보유 기간: 3년</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              위 사항에 동의하시고 계속 진행하시려면 아래 버튼을 클릭해주세요.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📧 입력하신 이메일로 즉시 다운로드 링크를 전송해드립니다
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting ? '처리 중...' : '이메일로 받기'}
          </Button>
        </form>
      </div>
    </div>
  );
}
