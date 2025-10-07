/**
 * Admin Audit Logs Page
 *
 * Purpose: View audit trail of all admin actions
 * Access: SUPER_ADMIN only
 * API: GET /api/admin/logs
 *
 * Features:
 * - Paginated audit logs (20 items/page)
 * - Action filter (LOGIN, CREATE, UPDATE, DELETE)
 * - Resource filter (notices, events, contacts, etc.)
 * - Real-time updates (polling every 10s)
 * - View changes (before/after diff)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuditLog {
  id: string;
  user: User;
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  resourceId: string | null;
  changes: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

interface ApiResponse {
  success: boolean;
  data: AuditLog[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

export default function AdminLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filter states (from URL query params)
  const page = parseInt(searchParams.get('page') || '1', 10);
  const action = searchParams.get('action') || 'ALL';
  const resource = searchParams.get('resource') || 'ALL';

  /**
   * Fetch audit logs from API
   */
  useEffect(() => {
    fetchLogs();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [page, action, resource]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      });
      if (action !== 'ALL') params.append('action', action);
      if (resource !== 'ALL') params.append('resource', resource);

      const response = await fetch(`/api/admin/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        // Check for authentication errors
        if (result.error?.code === 'INVALID_TOKEN' || result.error?.code === 'UNAUTHORIZED') {
          localStorage.removeItem('admin_token');
          router.push('/admin/login?expired=true');
          return;
        }
        throw new Error(result.error?.message || 'Failed to fetch logs');
      }

      setLogs(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('[Logs] Fetch error:', err);

      // Check if error message contains token-related keywords
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login?expired=true');
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1');
    router.push(`/admin/logs?${params.toString()}`);
  };

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/logs?${params.toString()}`);
  };

  /**
   * Get action badge color
   */
  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      LOGIN: 'bg-blue-100 text-blue-800',
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Format datetime
   */
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">감사 로그</h1>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">감사 로그</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">감사 로그</h1>
        <p className="text-sm text-gray-600 mt-1">관리자 액션 추적 및 모니터링 (10초마다 자동 업데이트)</p>
      </div>

      <div className="mb-6 bg-white rounded-lg border p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">액션</label>
            <select
              value={action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ALL">전체</option>
              <option value="LOGIN">로그인</option>
              <option value="CREATE">생성</option>
              <option value="UPDATE">수정</option>
              <option value="DELETE">삭제</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">리소스</label>
            <select
              value={resource}
              onChange={(e) => handleFilterChange('resource', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ALL">전체</option>
              <option value="auth">인증</option>
              <option value="notices">공지사항</option>
              <option value="events">이벤트</option>
              <option value="press">보도자료</option>
              <option value="contacts">문의사항</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              총 <span className="font-semibold">{meta?.total_count || 0}</span>개
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">타임스탬프</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">리소스</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">{log.user.name}</div>
                    <div className="text-xs text-gray-500">{log.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{log.resource}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.ipAddress}</td>
                  <td className="px-6 py-4 text-sm">
                    {log.changes && (
                      <button
                        onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {expandedLogId === log.id ? '숨기기' : '보기'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedLogId === log.id && log.changes && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <pre className="text-xs overflow-x-auto">{JSON.stringify(log.changes, null, 2)}</pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">로그가 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total_pages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            페이지 {meta.page} / {meta.total_pages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= meta.total_pages}
              className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
