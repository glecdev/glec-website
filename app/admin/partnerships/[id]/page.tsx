'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Partnership {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string | null;
  partnershipType: 'tech' | 'reseller' | 'consulting' | 'other';
  proposal: string;
  status: 'NEW' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Partnership;
  error?: {
    code: string;
    message: string;
  };
}

interface UpdateResponse {
  success: boolean;
  data: Partnership;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export default function AdminPartnershipDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [status, setStatus] = useState<Partnership['status']>('NEW');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartnership();
  }, [id]);

  const fetchPartnership = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/partnerships/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        if (result.error?.code === 'INVALID_TOKEN' || result.error?.code === 'UNAUTHORIZED') {
          localStorage.removeItem('admin_token');
          router.push('/admin/login?expired=true');
          return;
        }
        if (result.error?.code === 'NOT_FOUND') {
          setError('파트너십 신청을 찾을 수 없습니다.');
          return;
        }
        throw new Error(result.error?.message || 'Failed to fetch partnership');
      }

      setPartnership(result.data);
      setStatus(result.data.status);
      setAdminNotes(result.data.adminNotes || '');
    } catch (err) {
      console.error('[Partnership Detail] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/partnerships/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes.trim() || null,
        }),
      });

      const result: UpdateResponse = await response.json();

      if (!response.ok || !result.success) {
        if (result.error?.code === 'INVALID_TOKEN' || result.error?.code === 'UNAUTHORIZED') {
          localStorage.removeItem('admin_token');
          router.push('/admin/login?expired=true');
          return;
        }
        if (result.error?.details) {
          const errorMessages = result.error.details.map((d) => d.message).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.error?.message || 'Failed to update partnership');
      }

      setPartnership(result.data);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('[Partnership Detail] Save error:', err);
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (statusValue: Partnership['status']) => {
    const styles = {
      NEW: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-amber-100 text-amber-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    const labels = {
      NEW: '신규',
      IN_PROGRESS: '진행중',
      ACCEPTED: '승인',
      REJECTED: '거절',
    };
    return (
      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${styles[statusValue]}`}>
        {labels[statusValue]}
      </span>
    );
  };

  const getTypeBadge = (type: Partnership['partnershipType']) => {
    const labels = {
      tech: '기술 파트너',
      reseller: '리셀러',
      consulting: '컨설팅',
      other: '기타',
    };
    return (
      <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-700">
        {labels[type]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !partnership) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/partnerships"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-red-700 font-medium">에러가 발생했습니다</p>
              <p className="text-red-600 mt-1">{error || '파트너십 정보를 불러올 수 없습니다.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/partnerships"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{partnership.companyName}</h1>
            <p className="mt-2 text-gray-600">파트너십 신청 상세 정보</p>
          </div>
          {getStatusBadge(partnership.status)}
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 font-medium">변경사항이 저장되었습니다.</p>
          </div>
        </div>
      )}

      {/* Save Error Message */}
      {saveError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-red-700 font-medium">저장 실패: {saveError}</p>
          </div>
        </div>
      )}

      {/* Partnership Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
            <p className="text-gray-900">{partnership.companyName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">파트너십 유형</label>
            {getTypeBadge(partnership.partnershipType)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
            <p className="text-gray-900">{partnership.contactName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <a href={`mailto:${partnership.email}`} className="text-primary-600 hover:text-primary-700">
              {partnership.email}
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <a href={`tel:${partnership.phone}`} className="text-primary-600 hover:text-primary-700">
              {partnership.phone}
            </a>
          </div>

          {partnership.website && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">웹사이트</label>
              <a
                href={partnership.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                {partnership.website}
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">신청일</label>
            <p className="text-gray-900">{formatDate(partnership.createdAt)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최종 수정일</label>
            <p className="text-gray-900">{formatDate(partnership.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Proposal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">제안 내용</h2>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{partnership.proposal}</p>
        </div>
      </div>

      {/* Status Update and Admin Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">관리자 정보</h2>

        <div className="space-y-6">
          {/* Status Selection */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              처리 상태
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Partnership['status'])}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="NEW">신규</option>
              <option value="IN_PROGRESS">진행중</option>
              <option value="ACCEPTED">승인</option>
              <option value="REJECTED">거절</option>
            </select>
          </div>

          {/* Admin Notes */}
          <div>
            <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
              관리자 메모
            </label>
            <textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="내부 메모를 입력하세요. (선택사항)"
            />
            <p className="mt-1 text-sm text-gray-500">
              이 메모는 관리자만 볼 수 있으며, 신청자에게 표시되지 않습니다.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  저장 중...
                </span>
              ) : (
                '변경사항 저장'
              )}
            </button>

            <button
              onClick={() => router.push('/admin/partnerships')}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
