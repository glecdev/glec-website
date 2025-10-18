/**
 * 📊 Advanced Analytics View Component - Production Grade
 *
 * Features:
 * - Time-series lead acquisition chart (Recharts LineChart)
 * - Lead score distribution histogram (Recharts BarChart)
 * - Source distribution pie chart (Recharts PieChart)
 * - Conversion funnel visualization
 * - Email engagement timeline
 * - Top performers leaderboard
 * - Date range filtering
 * - Export to CSV functionality
 *
 * Version: 1.0.0
 * Created: 2025-10-18
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

// Color constants
const COLORS = {
  CONTACT_FORM: '#3b82f6', // blue-500
  DEMO_REQUEST: '#10b981', // green-500
  EVENT_REGISTRATION: '#f97316', // orange-500
  LIBRARY_LEAD: '#a855f7', // purple-500
};

interface AnalyticsData {
  date_range: {
    from: string;
    to: string;
    granularity: string;
  };
  time_series: Array<{
    date: string;
    contact_form: number;
    demo_request: number;
    event_registration: number;
    total: number;
  }>;
  score_distribution: Array<{
    range: string;
    count: number;
  }>;
  status_distribution: Array<{
    status: string;
    count: number;
  }>;
  source_distribution: Array<{
    source: string;
    count: number;
  }>;
  conversion_funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  email_engagement: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
    open_rate: number;
    click_rate: number;
  }>;
  top_performers: {
    top_templates: Array<{
      template_name: string;
      sent_count: number;
      open_count: number;
      open_rate: number;
    }>;
    top_rules: Array<{
      rule_name: string;
      sent_count: number;
    }>;
  };
}

interface AnalyticsViewProps {
  stats: {
    total_leads: number;
    avg_score: number;
    by_status: Record<string, number>;
    by_source: Record<string, number>;
  };
}

export default function AnalyticsView({ stats }: AnalyticsViewProps) {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const { showToast } = useToast();

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo,
        granularity,
      });

      const response = await fetch(`/api/admin/leads/analytics?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch analytics');
      }

      setAnalyticsData(result.data);
    } catch (err: any) {
      showToast(err.message, 'error');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, granularity, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    if (!analyticsData) return;

    // Create CSV content
    const csvRows = [
      ['GLEC Analytics Report'],
      [`Period: ${analyticsData.date_range.from} to ${analyticsData.date_range.to}`],
      [],
      ['Time Series Data'],
      ['Date', 'Contact Form', 'Demo Request', 'Event Registration', 'Total'],
      ...analyticsData.time_series.map((row) => [
        row.date,
        row.contact_form,
        row.demo_request,
        row.event_registration,
        row.total,
      ]),
      [],
      ['Score Distribution'],
      ['Score Range', 'Count'],
      ...analyticsData.score_distribution.map((row) => [row.range, row.count]),
      [],
      ['Email Engagement'],
      ['Date', 'Sent', 'Opened', 'Clicked', 'Open Rate %', 'Click Rate %'],
      ...analyticsData.email_engagement.map((row) => [
        row.date,
        row.sent,
        row.opened,
        row.clicked,
        row.open_rate,
        row.click_rate,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `glec-analytics-${dateFrom}-to-${dateTo}.csv`;
    link.click();

    showToast('CSV 파일이 다운로드되었습니다', 'success');
  }, [analyticsData, dateFrom, dateTo, showToast]);

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        <p className="text-gray-500 mt-4 text-lg">분석 데이터 로딩 중...</p>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="p-12 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg mb-4">분석 데이터를 불러오는 데 실패했습니다</p>
        <Button variant="outline" onClick={fetchAnalytics}>
          🔄 다시 시도
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">시작일</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">종료일</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">세분화</label>
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as 'day' | 'week' | 'month')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="day">일별</option>
                <option value="week">주별</option>
                <option value="month">월별</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAnalytics}>🔄 새로고침</Button>
            <Button variant="outline" onClick={handleExportCSV}>
              📥 CSV 내보내기
            </Button>
          </div>
        </div>
      </Card>

      {/* Time-Series Chart */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 리드 획득 추이</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analyticsData.time_series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="contact_form"
              name="문의폼"
              stroke={COLORS.CONTACT_FORM}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="demo_request"
              name="데모신청"
              stroke={COLORS.DEMO_REQUEST}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="event_registration"
              name="이벤트"
              stroke={COLORS.EVENT_REGISTRATION}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="전체"
              stroke="#000"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Two-column layout: Source Distribution + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Pie Chart */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🥧 소스별 분포</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.source_distribution.map((item) => ({
                  name:
                    item.source === 'CONTACT_FORM'
                      ? '문의폼'
                      : item.source === 'DEMO_REQUEST'
                      ? '데모신청'
                      : item.source === 'EVENT_REGISTRATION'
                      ? '이벤트'
                      : '라이브러리',
                  value: item.count,
                  source: item.source,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}개 (${((entry.value / stats.total_leads) * 100).toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.source_distribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.source as keyof typeof COLORS] ||
                      COLORS.LIBRARY_LEAD
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 전환 퍼널</h2>
          <div className="space-y-4">
            {analyticsData.conversion_funnel.map((stage, index) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-primary-500'];
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{stage.stage}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {stage.count}개 ({stage.percentage}%)
                    </span>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full ${colors[index]} transition-all duration-500 flex items-center justify-center text-white font-bold`}
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Score Distribution Histogram */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 리드 스코어 분포</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analyticsData.score_distribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="range" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Bar dataKey="count" name="리드 수" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Email Engagement Timeline */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✉️ 이메일 인게이지먼트 추이</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={analyticsData.email_engagement}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="sent"
              name="발송"
              stroke="#6b7280"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="opened"
              name="열람"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="clicked"
              name="클릭"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏅 최고 성과 템플릿 (Open Rate)</h2>
          <div className="space-y-3">
            {analyticsData.top_performers.top_templates.map((template, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{template.template_name}</div>
                    <div className="text-sm text-gray-600">
                      {template.sent_count}회 발송 • {template.open_count}회 열람
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{template.open_rate}%</div>
                  <div className="text-xs text-gray-500">열람률</div>
                </div>
              </div>
            ))}
            {analyticsData.top_performers.top_templates.length === 0 && (
              <p className="text-gray-500 text-center py-8">데이터가 없습니다</p>
            )}
          </div>
        </Card>

        {/* Top Rules */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔥 최다 발송 규칙</h2>
          <div className="space-y-3">
            {analyticsData.top_performers.top_rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
                  <div className="font-semibold text-gray-900">{rule.rule_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">{rule.sent_count}</div>
                  <div className="text-xs text-gray-500">발송 수</div>
                </div>
              </div>
            ))}
            {analyticsData.top_performers.top_rules.length === 0 && (
              <p className="text-gray-500 text-center py-8">데이터가 없습니다</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
