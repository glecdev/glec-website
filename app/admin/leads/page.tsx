/**
 * Unified Leads Dashboard
 * Path: /admin/leads
 *
 * Purpose: 모든 리드 소스(Library, Contact, Demo, Event)를 통합 관리
 *
 * Features:
 * - Tab 1: 리스트 뷰 (필터, 검색, 페이지네이션)
 * - Tab 2: 통계 뷰 (퍼널 분석, 소스별 차트)
 * - 소스별 색상 배지
 * - 리드 액션 (미팅 제안, 이메일 발송)
 * - 리드 스코어 표시
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

// ====================================================================
// Types
// ====================================================================

interface UnifiedLead {
  lead_source_type: 'LIBRARY_LEAD' | 'CONTACT_FORM' | 'DEMO_REQUEST' | 'EVENT_REGISTRATION';
  lead_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  lead_status: string;
  lead_score: number;
  created_at: string;
  updated_at: string;
  inquiry_type?: string;
  demo_product?: string;
  event_name?: string;
  source_detail?: string;
  email_sent: boolean;
  email_opened: boolean;
  email_clicked: boolean;
  days_old: number;
}

interface LeadStats {
  total_leads: number;
  avg_score: number;
  by_status: Record<string, number>;
  by_source: Record<string, number>;
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

type ViewMode = 'list' | 'stats';

export default function UnifiedLeadsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sourceType, setSourceType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(100);
  const [page, setPage] = useState(1);

  // Stats
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);

  const { showToast } = useToast();

  // ====================================================================
  // Data Fetching
  // ====================================================================

  useEffect(() => {
    fetchLeads();
  }, [sourceType, status, search, scoreMin, scoreMax, page]);

  async function fetchLeads() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        source_type: sourceType,
        status,
        search,
        score_min: scoreMin.toString(),
        score_max: scoreMax.toString(),
        page: page.toString(),
        per_page: '20',
      });

      const response = await fetch(`/api/admin/leads?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch leads');
      }

      setLeads(result.data);
      setStats(result.stats);
      setMeta(result.meta);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ====================================================================
  // Lead Actions
  // ====================================================================

  async function handleSendMeetingProposal(lead: UnifiedLead) {
    try {
      const response = await fetch('/api/admin/leads/send-meeting-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_type: lead.lead_source_type,
          lead_id: lead.lead_id,
          meeting_purpose: `${lead.company_name} 상담`,
          admin_name: '강덕호',
          admin_email: 'deokho.kang@glec.io',
          admin_phone: '010-1234-5678',
          token_expiry_days: 7,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to send proposal');
      }

      showToast(`${lead.company_name}님에게 미팅 제안 이메일이 발송되었습니다.`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  }

  // ====================================================================
  // Helper Functions
  // ====================================================================

  function getSourceColor(sourceType: string) {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      LIBRARY_LEAD: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
      CONTACT_FORM: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' },
      DEMO_REQUEST: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' },
      EVENT_REGISTRATION: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500' },
    };
    return colors[sourceType] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' };
  }

  function getSourceLabel(sourceType: string) {
    const labels: Record<string, string> = {
      LIBRARY_LEAD: '라이브러리',
      CONTACT_FORM: '문의폼',
      DEMO_REQUEST: '데모신청',
      EVENT_REGISTRATION: '이벤트',
    };
    return labels[sourceType] || sourceType;
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  }

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">통합 리드 관리</h1>
          <p className="text-gray-600 mt-2">모든 리드 소스를 하나의 대시보드에서 관리합니다</p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            📋 리스트 뷰
          </Button>
          <Button
            variant={viewMode === 'stats' ? 'primary' : 'outline'}
            onClick={() => setViewMode('stats')}
          >
            📊 통계 뷰
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">전체 리드</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total_leads}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">평균 스코어</div>
            <div className="text-2xl font-bold text-primary-600 mt-1">{stats.avg_score}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">신규</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">{stats.by_status.NEW || 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">성공</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.by_status.WON || 0}</div>
          </Card>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="회사명, 담당자, 이메일..."
                />
              </div>

              {/* Source Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">리드 소스</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={sourceType}
                  onChange={(e) => {
                    setSourceType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">전체</option>
                  <option value="LIBRARY_LEAD">라이브러리</option>
                  <option value="CONTACT_FORM">문의폼</option>
                  <option value="DEMO_REQUEST">데모신청</option>
                  <option value="EVENT_REGISTRATION">이벤트</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">상태</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">전체</option>
                  <option value="NEW">신규</option>
                  <option value="CONTACTED">접촉함</option>
                  <option value="QUALIFIED">자격검증</option>
                  <option value="WON">성공</option>
                </select>
              </div>

              {/* Score Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  스코어 ({scoreMin}-{scoreMax})
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreMin}
                    onChange={(e) => setScoreMin(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scoreMax}
                    onChange={(e) => setScoreMax(parseInt(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Leads List */}
          <div className="space-y-4">
            {loading ? (
              <Card className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="text-gray-500 mt-4">로딩 중...</p>
              </Card>
            ) : error ? (
              <Card className="p-12 text-center">
                <p className="text-error-500">{error}</p>
                <Button variant="outline" className="mt-4" onClick={fetchLeads}>
                  다시 시도
                </Button>
              </Card>
            ) : leads.length === 0 ? (
              <Card className="p-12 text-center text-gray-500">리드가 없습니다</Card>
            ) : (
              leads.map((lead) => {
                const sourceColor = getSourceColor(lead.lead_source_type);

                return (
                  <Card key={lead.lead_id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      {/* Lead Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {/* Source Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${sourceColor.bg} ${sourceColor.text}`}
                          >
                            {getSourceLabel(lead.lead_source_type)}
                          </span>

                          {/* Score Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(lead.lead_score)}`}>
                            ⭐ {lead.lead_score}
                          </span>

                          {/* Status Badge */}
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {lead.lead_status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900">{lead.company_name}</h3>
                        <p className="text-gray-600 mt-1">
                          {lead.contact_name} • {lead.email}
                          {lead.phone && ` • ${lead.phone}`}
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span>📅 {lead.days_old}일 전</span>
                          {lead.email_sent && <span className="text-blue-500">✉️ 이메일 발송</span>}
                          {lead.email_opened && <span className="text-green-500">👁️ 열람함</span>}
                          {lead.email_clicked && <span className="text-primary-500">🔗 클릭함</span>}
                        </div>

                        {lead.source_detail && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {lead.source_detail}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleSendMeetingProposal(lead)}
                          className="whitespace-nowrap"
                        >
                          📅 미팅 제안
                        </Button>
                        <Button size="sm" variant="outline" className="whitespace-nowrap">
                          ✉️ 이메일
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <Card className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                전체 {meta.total}개 중 {(meta.page - 1) * meta.per_page + 1}-
                {Math.min(meta.page * meta.per_page, meta.total)}개 표시
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
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
            </Card>
          )}
        </>
      )}

      {/* Stats View */}
      {viewMode === 'stats' && stats && (
        <div className="space-y-6">
          {/* Source Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📥 소스별 리드 현황</h2>
            <div className="space-y-3">
              {Object.entries(stats.by_source).map(([source, count]) => {
                if (count === 0) return null;
                const percentage = ((count / stats.total_leads) * 100).toFixed(1);
                const sourceColor = getSourceColor(source);

                return (
                  <div key={source} className="flex items-center gap-4">
                    <div className="w-32">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sourceColor.bg} ${sourceColor.text}`}>
                        {getSourceLabel(source)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${sourceColor.bg} ${sourceColor.border} border-l-4`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-32 text-right">
                      <span className="font-semibold text-gray-900">{count}개</span>
                      <span className="text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Status Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 상태별 분포</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.by_status).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600 mt-1">{status}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
