'use client';

/**
 * Demo Requests Management - Client Component
 *
 * Based on: ADMIN-PORTAL-DEMO-REQUESTS-IMPLEMENTATION-PLAN.md
 * Features: List, Filter, Search, Update, Delete demo requests
 * Security: JWT authentication required
 */

import { useState, useEffect, useCallback } from 'react';
import TabLayout, { TabType } from '@/components/admin/TabLayout';
import {
  OverviewCards,
  StatusDistribution,
  TopViewedList,
  RecentPublishedList,
} from '@/components/admin/InsightsCards';
import {
  calculateBaseStats,
  getTopViewed,
  getRecentPublished,
  type BaseStats,
} from '@/lib/admin-insights';

interface DemoRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  companySize: string;
  productInterests: string[];
  useCase: string;
  currentSolution: string | null;
  monthlyShipments: string;
  preferredDate: string;
  preferredTime: string;
  additionalMessage: string | null;
  status: 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DemoRequestStats extends BaseStats {
  companySizeDistribution: Record<string, number>;
  productInterestDistribution: Record<string, number>;
  topCompanies: DemoRequest[];
  recentSubmissions: DemoRequest[];
}

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  data: DemoRequest[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

export default function DemoRequestsClient() {
  const [activeTab, setActiveTab] = useState<TabType>('management');
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [allDemoRequests, setAllDemoRequests] = useState<DemoRequest[]>([]);
  const [stats, setStats] = useState<DemoRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separate state for pagination to avoid infinite loop
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Use primitive state values to avoid object reference issues
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchDemoRequests = useCallback(async () => {
    console.log('[DemoRequestsClient] fetchDemoRequests called');
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (searchFilter) {
        params.append('search', searchFilter);
      }

      const token = localStorage.getItem('admin_token');

      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await fetch(`/api/admin/demo-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setDemoRequests(data.data);
        setTotal(data.meta.total);
        setTotalPages(data.meta.totalPages);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch demo requests');
      }
    } catch (err) {
      console.error('Error fetching demo requests:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setDemoRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusFilter, searchFilter]);

  const fetchAllDemoRequestsForInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');

      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const response = await fetch('/api/admin/demo-requests?per_page=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Convert to stats-compatible format
        const requestsWithStats = data.data.map(request => ({
          ...request,
          status: request.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
          viewCount: 0, // Demo requests don't have views
          publishedAt: request.createdAt, // Use createdAt as publishedAt
        }));

        setAllDemoRequests(data.data);
        calculateStats(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch demo requests');
      }
    } catch (err) {
      console.error('Error fetching demo requests for insights:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setAllDemoRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (requestsList: DemoRequest[]) => {
    // Map status to BaseStats format
    const mappedRequests = requestsList.map(r => ({
      ...r,
      status: (r.status === 'NEW' || r.status === 'CONTACTED' || r.status === 'SCHEDULED' ? 'DRAFT' :
               r.status === 'COMPLETED' ? 'PUBLISHED' : 'ARCHIVED') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      viewCount: 0,
      publishedAt: r.createdAt,
    }));

    const baseStats = calculateBaseStats(mappedRequests);

    // Company size distribution
    const companySizeDistribution: Record<string, number> = {
      'SMALL': requestsList.filter(r => r.companySize === 'SMALL').length,
      'MEDIUM': requestsList.filter(r => r.companySize === 'MEDIUM').length,
      'LARGE': requestsList.filter(r => r.companySize === 'LARGE').length,
      'ENTERPRISE': requestsList.filter(r => r.companySize === 'ENTERPRISE').length,
    };

    // Product interest distribution
    const allProducts: string[] = [];
    requestsList.forEach(r => allProducts.push(...r.productInterests));
    const productInterestDistribution: Record<string, number> = {
      'DTG Series5': allProducts.filter(p => p === 'DTG Series5').length,
      'Carbon API': allProducts.filter(p => p === 'Carbon API').length,
      'GLEC Cloud': allProducts.filter(p => p === 'GLEC Cloud').length,
    };

    // Top companies (by recent submissions)
    const topCompanies = [...requestsList]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Recent submissions
    const recentSubmissions = getRecentPublished(mappedRequests, 5);

    setStats({
      ...baseStats,
      companySizeDistribution,
      productInterestDistribution,
      topCompanies,
      recentSubmissions,
    });
  };

  useEffect(() => {
    if (activeTab === 'management') {
      fetchDemoRequests();
    } else if (activeTab === 'insights') {
      fetchAllDemoRequestsForInsights();
    }
  }, [fetchDemoRequests, activeTab]);

  const StatusBadge = ({ status }: { status: DemoRequest['status'] }) => {
    const statusConfig = {
      NEW: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
      CONTACTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Contacted' },
      SCHEDULED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Scheduled' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    };

    const config = statusConfig[status];

    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (value: string) => {
    setSearchFilter(value);
    setPage(1); // Reset to page 1 on search
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to page 1 on filter
  };

  if (loading && demoRequests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading demo requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-800 font-medium mb-2">Error loading demo requests</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchDemoRequests()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: DemoRequest['status']) => {
    const statusConfig = {
      NEW: { bg: 'bg-blue-100', text: 'text-blue-800', label: '신규' },
      CONTACTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '연락됨' },
      SCHEDULED: { bg: 'bg-purple-100', text: 'text-purple-800', label: '예약됨' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: '완료' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: '취소' },
    };
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const insightsContent = stats ? (
    <div className="space-y-6">
      {/* Overview Cards */}
      <OverviewCards stats={stats} itemLabel="문의" />

      {/* Status and Company Size Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution stats={stats} />

        {/* Company Size Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">기업 규모별 분포</h3>
          <div className="space-y-3">
            {Object.entries(stats.companySizeDistribution).map(([size, count]) => {
              const percentage = stats.totalItems > 0 ? (count / stats.totalItems) * 100 : 0;
              const labels: Record<string, { label: string; color: string }> = {
                SMALL: { label: '소규모', color: 'bg-blue-500' },
                MEDIUM: { label: '중규모', color: 'bg-green-500' },
                LARGE: { label: '대규모', color: 'bg-orange-500' },
                ENTERPRISE: { label: '기업', color: 'bg-purple-500' },
              };
              const { label, color } = labels[size];
              return (
                <div key={size}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm text-gray-600">{count}개 ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Interest Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">제품 관심도 분포</h3>
        <div className="space-y-3">
          {Object.entries(stats.productInterestDistribution).map(([product, count]) => {
            const totalInterests = Object.values(stats.productInterestDistribution).reduce((sum, c) => sum + c, 0);
            const percentage = totalInterests > 0 ? (count / totalInterests) * 100 : 0;
            const colors: Record<string, string> = {
              'DTG Series5': 'bg-blue-500',
              'Carbon API': 'bg-green-500',
              'GLEC Cloud': 'bg-purple-500',
            };
            return (
              <div key={product}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{product}</span>
                  <span className="text-sm text-gray-600">{count}건 ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`${colors[product]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 문의 5건</h3>
        {stats.topCompanies.length === 0 ? (
          <p className="text-gray-500 text-center py-8">최근 문의가 없습니다</p>
        ) : (
          <div className="space-y-3">
            {stats.topCompanies.map((request, index) => (
              <div key={request.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-900 truncate">{request.companyName}</p>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-xs text-gray-500 ml-8">{request.productInterests.join(', ')}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString('ko-KR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const managementContent = (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        >
          <option value="">전체 상태</option>
          <option value="NEW">신규</option>
          <option value="CONTACTED">연락됨</option>
          <option value="SCHEDULED">예약됨</option>
          <option value="COMPLETED">완료</option>
          <option value="CANCELLED">취소</option>
        </select>

        <input
          type="text"
          placeholder="회사명, 담당자, 이메일 검색..."
          value={searchFilter}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  회사
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  담당자
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  관심 제품
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  희망 날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  제출일
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demoRequests.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-gray-500" colSpan={6}>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-base font-medium">문의 내역이 없습니다</p>
                    <p className="text-sm mt-2">필터나 검색 조건을 조정해보세요</p>
                  </td>
                </tr>
              ) : (
                demoRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.companySize}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.contactName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.productInterests.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.preferredDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{(page - 1) * perPage + 1}</span>부터{' '}
            <span className="font-medium">
              {Math.min(page * perPage, total)}
            </span>까지 (전체 <span className="font-medium">{total}</span>건)
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              이전
            </button>
            <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700">
              {page} / {totalPages} 페이지
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">문의내역 관리</h1>
        <p className="text-base text-gray-600 mt-2">
          데모 문의 통계 분석 및 내역 관리
        </p>
      </div>

      <TabLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        insightsContent={insightsContent}
        managementContent={managementContent}
      />

    </div>
  );
}
