/**
 * Admin Customer Leads Page
 *
 * /admin/customer-leads
 *
 * Features:
 * - List all library leads
 * - Filters: lead_status, library_item, search
 * - Lead details, email tracking, lead score
 *
 * Based on: GLEC-API-Specification.yaml
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';

// ====================================================================
// Types
// ====================================================================

interface LibraryLead {
  id: string;
  library_item_id: string;
  library_item_title: string;
  library_item_slug: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  lead_status: string;
  lead_score: number;
  email_sent: boolean;
  email_opened: boolean;
  download_link_clicked: boolean;
  created_at: string;
}

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ====================================================================
// Component
// ====================================================================

interface LibraryItemOption {
  id: string;
  title: string;
}

export default function CustomerLeadsPage() {
  // State
  const [leads, setLeads] = useState<LibraryLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [leadStatus, setLeadStatus] = useState('ALL');
  const [libraryItemId, setLibraryItemId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta | null>(null);

  // Library items for filter dropdown
  const [libraryItems, setLibraryItems] = useState<LibraryItemOption[]>([]);

  const { showToast } = useToast();

  // ====================================================================
  // Data Fetching
  // ====================================================================

  // Load library items for dropdown on mount
  useEffect(() => {
    fetchLibraryItems();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [leadStatus, libraryItemId, search, page]);

  async function fetchLibraryItems() {
    try {
      const response = await fetch('/api/admin/library/items?per_page=1000&status=ALL');
      const result = await response.json();

      if (result.success) {
        setLibraryItems(
          result.data.map((item: any) => ({
            id: item.id,
            title: item.title,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load library items:', err);
    }
  }

  async function fetchLeads() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        lead_status: leadStatus,
        library_item_id: libraryItemId,
        search,
        page: page.toString(),
        per_page: '20',
      });

      const response = await fetch(`/api/admin/library/leads?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch leads');
      }

      setLeads(result.data);
      setMeta(result.meta);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">리드 관리</h1>
        <p className="text-gray-600 mt-2">라이브러리 다운로드 리드를 관리합니다</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">검색</label>
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="회사명, 담당자명, 이메일 검색..."
            />
          </div>

          {/* Lead Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">리드 상태</label>
            <Select
              value={leadStatus}
              onChange={(e) => {
                setLeadStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">전체</option>
              <option value="NEW">신규</option>
              <option value="CONTACTED">접촉함</option>
              <option value="QUALIFIED">자격검증</option>
              <option value="PROPOSAL_SENT">제안발송</option>
              <option value="WON">성공</option>
              <option value="LOST">실패</option>
              <option value="NURTURING">육성중</option>
            </Select>
          </div>

          {/* Library Item */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">자료</label>
            <Select
              value={libraryItemId}
              onChange={(e) => {
                setLibraryItemId(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">전체 자료</option>
              {libraryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="text-gray-500 mt-4">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-error-500">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchLeads}>
              다시 시도
            </Button>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500">리드가 없습니다</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">회사명</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">담당자</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">이메일</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">자료</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">리드 스코어</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">상태</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">이메일 추적</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">등록일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.company_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{lead.contact_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{lead.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{lead.library_item_title}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                          {lead.lead_score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            lead.lead_status === 'NEW'
                              ? 'bg-blue-100 text-blue-700'
                              : lead.lead_status === 'CONTACTED'
                              ? 'bg-yellow-100 text-yellow-700'
                              : lead.lead_status === 'QUALIFIED'
                              ? 'bg-green-100 text-green-700'
                              : lead.lead_status === 'WON'
                              ? 'bg-success-100 text-success-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {lead.lead_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs">
                        <div className="flex justify-center gap-2">
                          {lead.email_sent && (
                            <span className="text-blue-500" title="이메일 발송됨">
                              ✉️
                            </span>
                          )}
                          {lead.email_opened && (
                            <span className="text-green-500" title="이메일 열림">
                              👁️
                            </span>
                          )}
                          {lead.download_link_clicked && (
                            <span className="text-primary-500" title="다운로드 링크 클릭됨">
                              ⬇️
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-center">
                        {new Date(lead.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  전체 {meta.total}개 중 {(meta.page - 1) * meta.per_page + 1}-
                  {Math.min(meta.page * meta.per_page, meta.total)}개 표시
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    이전
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    {page} / {meta.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                    disabled={page === meta.total_pages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
