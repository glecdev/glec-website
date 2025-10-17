'use client';

import { useState, useEffect } from 'react';

// ============================================================
// Types
// ============================================================

interface EmailTemplate {
  id: string;
  category_id: string;
  category_name?: string;
  category_key?: string;
  category_icon?: string;
  content_type?: string | null;
  content_id?: string | null;
  template_key: string;
  template_name: string;
  description?: string | null;
  nurture_day: number;
  subject_line: string;
  preview_text?: string | null;
  html_body: string;
  plain_text_body: string;
  available_variables?: string[];
  is_active: boolean;
  is_default: boolean;
  version?: number;
  ab_test_group?: string | null;
  ab_test_weight?: number;
  send_delay_hours?: number;
  created_at: string;
  updated_at: string;

  // Stats
  total_sent?: number;
  total_delivered?: number;
  total_opened?: number;
  total_clicked?: number;
  delivery_rate?: number;
  open_rate?: number;
  click_rate?: number;
  last_sent_at?: string | null;
}

interface EmailTemplateCategory {
  id: string;
  category_key: string;
  category_name: string;
  description?: string;
  is_content_specific: boolean;
  icon?: string;
}

interface FormData {
  category_id: string;
  content_type?: string;
  content_id?: string;
  template_key: string;
  template_name: string;
  description?: string;
  nurture_day: number;
  subject_line: string;
  preview_text?: string;
  html_body: string;
  plain_text_body: string;
  available_variables?: string[];
  is_active: boolean;
  is_default: boolean;
  ab_test_group?: string;
  ab_test_weight?: number;
  send_delay_hours?: number;
}

// ============================================================
// Admin Email Templates Page
// ============================================================

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [nurtureDayFilter, setNurtureDayFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    category_id: '',
    template_key: '',
    template_name: '',
    nurture_day: 3,
    subject_line: '',
    html_body: '',
    plain_text_body: '',
    is_active: true,
    is_default: false,
  });

  // ============================================================
  // Data Fetching
  // ============================================================

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter, nurtureDayFilter, searchQuery]);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/admin/email-template-categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        showError('카테고리 로드 실패: ' + data.error?.message);
      }
    } catch (err) {
      showError('카테고리 로드 중 오류 발생');
      console.error(err);
    }
  }

  async function fetchTemplates() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category_id', categoryFilter);
      if (nurtureDayFilter) params.append('nurture_day', nurtureDayFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/email-templates?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data);
      } else {
        setError(data.error?.message || '템플릿 로드 실패');
      }
    } catch (err) {
      setError('템플릿 로드 중 오류 발생');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // CRUD Operations
  // ============================================================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.category_id || !formData.template_key || !formData.template_name ||
        !formData.subject_line || !formData.html_body || !formData.plain_text_body) {
      showError('필수 항목을 모두 입력해주세요');
      return;
    }

    try {
      const url = editingTemplate
        ? `/api/admin/email-templates/${editingTemplate.id}`
        : '/api/admin/email-templates';

      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(data.message || (editingTemplate ? '템플릿이 수정되었습니다' : '템플릿이 생성되었습니다'));
        setShowForm(false);
        setEditingTemplate(null);
        resetForm();
        fetchTemplates();
      } else {
        showError(data.error?.message || '저장 실패');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : '저장 중 오류 발생');
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!deletingTemplate) return;

    try {
      const response = await fetch(`/api/admin/email-templates/${deletingTemplate.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('템플릿이 삭제되었습니다');
        setShowDeleteConfirm(false);
        setDeletingTemplate(null);
        fetchTemplates();
      } else {
        showError(data.error?.message || '삭제 실패');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : '삭제 중 오류 발생');
      console.error(err);
    }
  }

  function handleEdit(template: EmailTemplate) {
    setEditingTemplate(template);
    setFormData({
      category_id: template.category_id,
      content_type: template.content_type || undefined,
      content_id: template.content_id || undefined,
      template_key: template.template_key,
      template_name: template.template_name,
      description: template.description || undefined,
      nurture_day: template.nurture_day,
      subject_line: template.subject_line,
      preview_text: template.preview_text || undefined,
      html_body: template.html_body,
      plain_text_body: template.plain_text_body,
      available_variables: template.available_variables || [],
      is_active: template.is_active,
      is_default: template.is_default,
      ab_test_group: template.ab_test_group || undefined,
      ab_test_weight: template.ab_test_weight || 100,
      send_delay_hours: template.send_delay_hours || 0,
    });
    setShowForm(true);
  }

  function handleDeleteClick(template: EmailTemplate) {
    setDeletingTemplate(template);
    setShowDeleteConfirm(true);
  }

  function resetForm() {
    setFormData({
      category_id: '',
      template_key: '',
      template_name: '',
      nurture_day: 3,
      subject_line: '',
      html_body: '',
      plain_text_body: '',
      is_active: true,
      is_default: false,
    });
  }

  function handleCreateNew() {
    setEditingTemplate(null);
    resetForm();
    setShowForm(true);
  }

  // ============================================================
  // UI Helpers
  // ============================================================

  function showError(message: string) {
    alert('❌ ' + message);
  }

  function showSuccess(message: string) {
    alert('✅ ' + message);
  }

  function formatRate(rate?: number | null): string {
    if (rate === null || rate === undefined) return '-';
    return `${(rate * 100).toFixed(1)}%`;
  }

  function getNurtureDayBadge(day: number) {
    const colors: Record<number, string> = {
      3: 'bg-blue-100 text-blue-800',
      7: 'bg-green-100 text-green-800',
      14: 'bg-yellow-100 text-yellow-800',
      30: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[day] || 'bg-gray-100 text-gray-800'}`}>
        Day {day}
      </span>
    );
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">이메일 템플릿 관리</h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + 새 템플릿 생성
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">모든 카테고리</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.category_name}
            </option>
          ))}
        </select>

        <select
          value={nurtureDayFilter}
          onChange={(e) => setNurtureDayFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">모든 Nurture Day</option>
          <option value="3">Day 3</option>
          <option value="7">Day 7</option>
          <option value="14">Day 14</option>
          <option value="30">Day 30</option>
        </select>

        <input
          type="text"
          placeholder="템플릿 이름 또는 제목 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded flex-1"
        />
      </div>

      {/* Templates Table */}
      {loading && <p className="text-center py-8">로딩 중...</p>}
      {error && <p className="text-center py-8 text-red-600">❌ {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">템플릿 이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">발송</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">오픈률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">클릭률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    템플릿이 없습니다. 새 템플릿을 생성해주세요.
                  </td>
                </tr>
              )}

              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{template.template_name}</div>
                    <div className="text-xs text-gray-500">{template.subject_line}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{template.category_name}</td>
                  <td className="px-6 py-4">{getNurtureDayBadge(template.nurture_day)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{template.total_sent || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatRate(template.open_rate)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatRate(template.click_rate)}</td>
                  <td className="px-6 py-4">
                    {template.is_active ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">활성</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">비활성</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteClick(template)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingTemplate ? '템플릿 수정' : '새 템플릿 생성'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">선택하세요</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  템플릿 키 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.template_key}
                  onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="예: CONTACT_FORM_DAY3_V1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">영문, 숫자, 언더스코어만 사용 (고유값)</p>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  템플릿 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="예: 일반 문의 Day 3 - 환영 이메일"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
                  placeholder="이 템플릿의 목적과 사용 시나리오를 설명하세요"
                />
              </div>

              {/* Nurture Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nurture Day <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.nurture_day}
                  onChange={(e) => setFormData({ ...formData, nurture_day: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value={3}>Day 3</option>
                  <option value={7}>Day 7</option>
                  <option value={14}>Day 14</option>
                  <option value={30}>Day 30</option>
                </select>
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject_line}
                  onChange={(e) => setFormData({ ...formData, subject_line: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="예: [GLEC] 문의 감사합니다 - 빠른 답변 드리겠습니다"
                  required
                />
              </div>

              {/* Preview Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">미리보기 텍스트</label>
                <input
                  type="text"
                  value={formData.preview_text || ''}
                  onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="이메일 클라이언트에서 제목 옆에 표시될 텍스트"
                />
              </div>

              {/* HTML Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HTML 본문 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.html_body}
                  onChange={(e) => setFormData({ ...formData, html_body: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={8}
                  placeholder="HTML 이메일 본문 (변수: {contact_name}, {company_name}, {library_item_title} 등)"
                  required
                />
              </div>

              {/* Plain Text Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plain Text 본문 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.plain_text_body}
                  onChange={(e) => setFormData({ ...formData, plain_text_body: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={6}
                  placeholder="텍스트 전용 이메일 본문"
                  required
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                  id="is_active"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  활성화 (비활성화 시 발송되지 않음)
                </label>
              </div>

              {/* Default Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="mr-2"
                  id="is_default"
                />
                <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
                  기본 템플릿으로 설정
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTemplate(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingTemplate ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold">템플릿 삭제 확인</h2>
            </div>
            <div className="px-6 py-4">
              <p className="mb-4">
                정말로 <strong>{deletingTemplate.template_name}</strong> 템플릿을 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-600">
                ⚠️ 이미 발송 이력이 있는 템플릿은 삭제할 수 없습니다. 대신 비활성화를 권장합니다.
              </p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingTemplate(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
