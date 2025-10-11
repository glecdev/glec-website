/**
 * Admin Library Items Page
 *
 * /admin/library-items
 *
 * Features:
 * - List all library items (including DRAFT, ARCHIVED)
 * - Filters: status, category, search
 * - Actions: Create, Edit, Delete, Publish/Unpublish
 * - Responsive DataTable with pagination
 *
 * Based on: GLEC-Admin-Design-Specification.md
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { LibraryItemForm } from './LibraryItemForm';

// ====================================================================
// Types
// ====================================================================

interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  file_type: string;
  file_size_mb: number | null;
  file_url: string;
  download_type: string;
  category: string;
  tags: string[];
  language: string;
  version: string | null;
  requires_form: boolean;
  download_count: number;
  view_count: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Meta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  status: string;
  category: string;
  search: string | null;
}

// ====================================================================
// Main Component
// ====================================================================

export default function AdminLibraryItemsPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LibraryItem | null>(null);

  // Toast
  const { showToast } = useToast();

  // ====================================================================
  // Data Fetching
  // ====================================================================

  useEffect(() => {
    fetchItems();
  }, [status, category, search, page]);

  async function fetchItems() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status,
        category,
        search,
        page: page.toString(),
        per_page: '20',
      });

      const response = await fetch(`/api/admin/library/items?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch items');
      }

      setItems(result.data);
      setMeta(result.meta);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ====================================================================
  // Actions
  // ====================================================================

  async function handlePublishToggle(item: LibraryItem) {
    try {
      const response = await fetch(`/api/admin/library/items/${item.id}/publish`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message);
      }

      showToast('success', result.message || 'Success');
      fetchItems();
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed');
    }
  }

  async function handleDelete(item: LibraryItem) {
    if (!confirm(`"${item.title}"을(를) 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/library/items/${item.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message);
      }

      showToast('success', result.message || 'Success');
      fetchItems();
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed');
    }
  }

  // ====================================================================
  // Render
  // ====================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">지식센터 라이브러리</h1>
          <p className="text-gray-600 mt-1">
            Framework, Whitepaper, Case Study 등의 자료를 관리합니다
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + 새 자료 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              label="검색"
              placeholder="제목 또는 설명 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">전체</option>
              <option value="DRAFT">임시저장</option>
              <option value="PUBLISHED">게시됨</option>
              <option value="ARCHIVED">보관됨</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">전체</option>
              <option value="FRAMEWORK">Framework</option>
              <option value="WHITEPAPER">Whitepaper</option>
              <option value="CASE_STUDY">Case Study</option>
              <option value="DATASHEET">Datasheet</option>
              <option value="OTHER">기타</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        {meta && (
          <div className="mt-4 text-sm text-gray-600">
            총 <strong>{meta.total}</strong>개 자료
            {search && ` (검색: "${search}")`}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            <p className="mt-4">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-error-600">
            <p>⚠️ {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchItems()}>
              다시 시도
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">📭 자료가 없습니다</p>
            <Button variant="primary" className="mt-4" onClick={() => setShowCreateModal(true)}>
              첫 번째 자료 추가하기
            </Button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    다운로드
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="text-2xl mr-3">
                          {item.file_type === 'PDF' && '📄'}
                          {item.file_type === 'VIDEO' && '🎬'}
                          {item.file_type === 'DOCX' && '📝'}
                          {item.file_type === 'XLSX' && '📊'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.slug} · {item.language === 'ko' ? '한국어' : 'English'}
                            {item.version && ` · v${item.version}`}
                          </div>
                          {item.file_size_mb && (
                            <div className="text-xs text-gray-400 mt-1">
                              {item.file_size_mb} MB
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          item.category === 'FRAMEWORK'
                            ? 'bg-purple-100 text-purple-700'
                            : item.category === 'WHITEPAPER'
                            ? 'bg-blue-100 text-blue-700'
                            : item.category === 'CASE_STUDY'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.status === 'PUBLISHED' && '✓ 게시됨'}
                        {item.status === 'DRAFT' && '📝 임시저장'}
                        {item.status === 'ARCHIVED' && '📦 보관됨'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.download_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePublishToggle(item)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {item.status === 'PUBLISHED' ? '게시 취소' : '게시하기'}
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-sm text-error-600 hover:text-error-700 font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {meta && meta.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {meta.page} of {meta.total_pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    이전
                  </Button>
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

      {/* Create/Edit Modals */}
      {showCreateModal && (
        <LibraryItemForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            showToast('success', '자료가 추가되었습니다');
            fetchItems();
          }}
          onError={(message) => showToast('error', message)}
        />
      )}

      {editingItem && (
        <LibraryItemForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            showToast('success', '자료가 수정되었습니다');
            fetchItems();
          }}
          onError={(message) => showToast('error', message)}
        />
      )}
    </div>
  );
}
