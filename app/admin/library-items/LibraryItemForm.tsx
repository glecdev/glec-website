/**
 * Library Item Form Modal Component
 *
 * Create/Edit library items with full validation
 * Based on: GLEC-API-Specification.yaml (POST/PUT /api/admin/library/items)
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { FileUpload, type UploadedFileData } from '@/components/admin/FileUpload';
import { z } from 'zod';

// ====================================================================
// Types
// ====================================================================

export interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  file_type: string;
  file_size_mb: string;
  file_url: string;
  download_type: 'EMAIL' | 'DIRECT';
  category: 'FRAMEWORK' | 'WHITEPAPER' | 'CASE_STUDY' | 'DATASHEET' | 'OTHER';
  tags: string[] | null;
  language: string;
  version: string | null;
  requires_form: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LibraryItemFormProps {
  item?: LibraryItem; // undefined = create mode, defined = edit mode
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

// ====================================================================
// Validation Schema
// ====================================================================

const LibraryItemSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(200, '제목은 200자 이내여야 합니다'),
  slug: z
    .string()
    .min(1, 'Slug를 입력하세요')
    .max(200, 'Slug는 200자 이내여야 합니다')
    .regex(/^[a-z0-9-]+$/, 'Slug는 소문자, 숫자, 하이픈(-만 사용 가능합니다'),
  description: z.string().min(1, '설명을 입력하세요').max(1000, '설명은 1000자 이내여야 합니다'),
  file_type: z.string().min(1, '파일 형식을 입력하세요'),
  file_size_mb: z.number().min(0.01, '파일 크기를 입력하세요').max(100, '파일 크기는 100MB 이하여야 합니다'),
  file_url: z.string().url('유효한 URL을 입력하세요'),
  download_type: z.enum(['EMAIL', 'DIRECT'], { errorMap: () => ({ message: '다운로드 방식을 선택하세요' }) }),
  category: z.enum(['FRAMEWORK', 'WHITEPAPER', 'CASE_STUDY', 'DATASHEET', 'OTHER'], {
    errorMap: () => ({ message: '카테고리를 선택하세요' }),
  }),
  tags: z.string().optional(), // comma-separated string, will be parsed
  language: z.string().min(2, '언어 코드를 입력하세요').max(2, '언어 코드는 2자여야 합니다'),
  version: z.string().optional(),
  requires_form: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'], { errorMap: () => ({ message: '상태를 선택하세요' }) }),
});

type FormData = z.infer<typeof LibraryItemSchema>;

// ====================================================================
// Component
// ====================================================================

export function LibraryItemForm({ item, onClose, onSuccess, onError }: LibraryItemFormProps) {
  const isEditMode = !!item;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: item?.title || '',
    slug: item?.slug || '',
    description: item?.description || '',
    file_type: item?.file_type || 'PDF',
    file_size_mb: item?.file_size_mb ? parseFloat(item.file_size_mb) : 1.0,
    file_url: item?.file_url || '',
    download_type: item?.download_type || 'EMAIL',
    category: item?.category || 'FRAMEWORK',
    tags: item?.tags?.join(', ') || '',
    language: item?.language || 'ko',
    version: item?.version || '',
    requires_form: item?.requires_form !== undefined ? item.requires_form : true,
    status: item?.status || 'DRAFT',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'local' | 'url' | 'google_drive'>('local');
  const [uploadedFileData, setUploadedFileData] = useState<UploadedFileData | null>(null);

  // Handle input change
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    handleChange('title', value);

    // Auto-generate slug if not in edit mode
    if (!isEditMode) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/[\s]+/g, '-')
        .replace(/^-+|-+$/g, '');
      handleChange('slug', autoSlug);
    }
  };

  // Handle file upload success
  const handleFileUploadSuccess = (data: UploadedFileData) => {
    setUploadedFileData(data);
    // Auto-fill form fields with uploaded file data
    handleChange('file_url', data.file_url);
    handleChange('file_type', data.file_type);
    handleChange('file_size_mb', data.file_size_mb);
    handleChange('download_type', 'DIRECT');
  };

  // Handle file upload error
  const handleFileUploadError = (error: string) => {
    onError(error);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const result = LibraryItemSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare request body
      const body = {
        ...result.data,
        tags: result.data.tags ? result.data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        version: result.data.version || null,
      };

      // API call
      const url = isEditMode ? `/api/admin/library/items/${item.id}` : '/api/admin/library/items';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const resultData = await response.json();

      if (!resultData.success) {
        throw new Error(resultData.error?.message || 'Failed to save item');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      onError(err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
        <h2 className="text-2xl font-bold mb-6">{isEditMode ? '자료 수정' : '새 자료 추가'}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              제목 <span className="text-error-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="GLEC Framework v3.0 한글 버전"
              className={errors.title ? 'border-error-500' : ''}
            />
            {errors.title && <p className="text-error-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Slug <span className="text-error-500">*</span>
            </label>
            <Input
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="glec-framework-v3-korean"
              className={errors.slug ? 'border-error-500' : ''}
            />
            {errors.slug && <p className="text-error-500 text-sm mt-1">{errors.slug}</p>}
            <p className="text-gray-500 text-xs mt-1">소문자, 숫자, 하이픈(-)만 사용 가능</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              설명 <span className="text-error-500">*</span>
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="ISO-14083 국제표준 기반 물류 탄소배출 측정 프레임워크..."
              rows={4}
              className={errors.description ? 'border-error-500' : ''}
            />
            {errors.description && <p className="text-error-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* File Type & Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                파일 형식 <span className="text-error-500">*</span>
              </label>
              <Input
                value={formData.file_type}
                onChange={(e) => handleChange('file_type', e.target.value)}
                placeholder="PDF"
                className={errors.file_type ? 'border-error-500' : ''}
              />
              {errors.file_type && <p className="text-error-500 text-sm mt-1">{errors.file_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                파일 크기 (MB) <span className="text-error-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.file_size_mb}
                onChange={(e) => handleChange('file_size_mb', parseFloat(e.target.value) || 0)}
                placeholder="2.50"
                className={errors.file_size_mb ? 'border-error-500' : ''}
              />
              {errors.file_size_mb && <p className="text-error-500 text-sm mt-1">{errors.file_size_mb}</p>}
            </div>
          </div>

          {/* File Upload Method Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              파일 업로드 방식 <span className="text-error-500">*</span>
            </label>
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setUploadMethod('local')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMethod === 'local'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                로컬 파일 업로드
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMethod === 'url'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                URL 직접 입력
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('google_drive')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMethod === 'google_drive'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Google Drive
              </button>
            </div>

            {/* Local File Upload */}
            {uploadMethod === 'local' && item && (
              <FileUpload
                itemId={item.id}
                onUploadSuccess={handleFileUploadSuccess}
                onUploadError={handleFileUploadError}
                currentFileUrl={formData.file_url}
              />
            )}

            {uploadMethod === 'local' && !item && (
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>안내:</strong> 먼저 라이브러리 항목을 생성한 후에 파일을 업로드할 수 있습니다.
                  <br />
                  현재는 임시 URL을 입력하고, 생성 후 수정 화면에서 파일을 업로드하세요.
                </p>
                <Input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => handleChange('file_url', e.target.value)}
                  placeholder="https://placeholder.com/temp"
                  className={`mt-3 ${errors.file_url ? 'border-error-500' : ''}`}
                />
              </div>
            )}

            {/* Manual URL Input */}
            {uploadMethod === 'url' && (
              <div>
                <Input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => handleChange('file_url', e.target.value)}
                  placeholder="https://example.com/files/glec-framework-v3.pdf"
                  className={errors.file_url ? 'border-error-500' : ''}
                />
                <p className="text-gray-500 text-xs mt-1">외부 서버에 호스팅된 파일의 전체 URL을 입력하세요</p>
              </div>
            )}

            {/* Google Drive Link */}
            {uploadMethod === 'google_drive' && (
              <div>
                <Input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => {
                    handleChange('file_url', e.target.value);
                    handleChange('download_type', 'GOOGLE_DRIVE');
                  }}
                  placeholder="https://drive.google.com/file/d/..."
                  className={errors.file_url ? 'border-error-500' : ''}
                />
                <p className="text-gray-500 text-xs mt-1">
                  Google Drive 파일의 공유 링크를 입력하세요 (링크 공유가 &quot;링크가 있는 모든 사용자&quot;로 설정되어야 합니다)
                </p>
              </div>
            )}

            {errors.file_url && <p className="text-error-500 text-sm mt-1">{errors.file_url}</p>}
          </div>

          {/* Download Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                다운로드 방식 <span className="text-error-500">*</span>
              </label>
              <Select value={formData.download_type} onChange={(e) => handleChange('download_type', e.target.value)}>
                <option value="EMAIL">이메일 입력 필요</option>
                <option value="DIRECT">직접 다운로드</option>
              </Select>
              {errors.download_type && <p className="text-error-500 text-sm mt-1">{errors.download_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                카테고리 <span className="text-error-500">*</span>
              </label>
              <Select value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
                <option value="FRAMEWORK">프레임워크</option>
                <option value="WHITEPAPER">백서</option>
                <option value="CASE_STUDY">사례 연구</option>
                <option value="DATASHEET">데이터 시트</option>
                <option value="OTHER">기타</option>
              </Select>
              {errors.category && <p className="text-error-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">태그 (쉼표로 구분)</label>
            <Input
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="ISO-14083, 탄소배출, 물류"
            />
            <p className="text-gray-500 text-xs mt-1">예: ISO-14083, 탄소배출, 물류</p>
          </div>

          {/* Language & Version */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                언어 코드 <span className="text-error-500">*</span>
              </label>
              <Select value={formData.language} onChange={(e) => handleChange('language', e.target.value)}>
                <option value="ko">한국어 (ko)</option>
                <option value="en">영어 (en)</option>
                <option value="ja">일본어 (ja)</option>
                <option value="zh">중국어 (zh)</option>
              </Select>
              {errors.language && <p className="text-error-500 text-sm mt-1">{errors.language}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">버전</label>
              <Input
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="v3.0"
              />
            </div>
          </div>

          {/* Requires Form & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">폼 입력 필요 여부</label>
              <Select
                value={formData.requires_form ? 'true' : 'false'}
                onChange={(e) => handleChange('requires_form', e.target.value === 'true')}
              >
                <option value="true">필요</option>
                <option value="false">불필요</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                상태 <span className="text-error-500">*</span>
              </label>
              <Select value={formData.status} onChange={(e) => handleChange('status', e.target.value)}>
                <option value="DRAFT">초안</option>
                <option value="PUBLISHED">게시됨</option>
                <option value="ARCHIVED">보관됨</option>
              </Select>
              {errors.status && <p className="text-error-500 text-sm mt-1">{errors.status}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : isEditMode ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
