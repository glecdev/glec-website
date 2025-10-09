/**
 * Unified Insights Data Fetching Utility
 *
 * Purpose: Fetch and aggregate insights from all content types
 * Used in: /admin/dashboard
 */

import type { ContentTypeStats, UnifiedInsightsData } from '@/components/admin/UnifiedInsightsDashboard';

/**
 * Fetch all insights data and aggregate
 */
export async function fetchUnifiedInsights(token: string): Promise<UnifiedInsightsData> {
  const contentTypes: ContentTypeStats[] = [];

  // Fetch notices
  try {
    const noticesRes = await fetch('/api/admin/notices?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const noticesData = await noticesRes.json();

    if (noticesData.success) {
      const notices = noticesData.data;
      const published = notices.filter((n: any) => n.status === 'PUBLISHED').length;
      const draft = notices.filter((n: any) => n.status === 'DRAFT').length;
      const archived = notices.filter((n: any) => n.status === 'ARCHIVED').length;
      const totalViews = notices.reduce((sum: number, n: any) => sum + (n.viewCount || 0), 0);

      contentTypes.push({
        type: 'notices',
        label: '공지사항',
        total: notices.length,
        published,
        draft,
        archived,
        totalViews,
        avgViews: notices.length > 0 ? Math.round(totalViews / notices.length) : 0,
        color: '#0600f7',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch notices:', error);
  }

  // Fetch press releases
  try {
    const pressRes = await fetch('/api/admin/press?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pressData = await pressRes.json();

    if (pressData.success) {
      const press = pressData.data;
      const published = press.filter((p: any) => p.status === 'PUBLISHED').length;
      const draft = press.filter((p: any) => p.status === 'DRAFT').length;
      const archived = press.filter((p: any) => p.status === 'ARCHIVED').length;
      const totalViews = press.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0);

      contentTypes.push({
        type: 'press',
        label: '보도자료',
        total: press.length,
        published,
        draft,
        archived,
        totalViews,
        avgViews: press.length > 0 ? Math.round(totalViews / press.length) : 0,
        color: '#8b5cf6',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch press:', error);
  }

  // Fetch popups
  try {
    const popupsRes = await fetch('/api/admin/popups?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const popupsData = await popupsRes.json();

    if (popupsData.success) {
      const popups = popupsData.data;
      const active = popups.filter((p: any) => p.isActive).length;
      const inactive = popups.filter((p: any) => !p.isActive).length;
      const totalViews = popups.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0);

      contentTypes.push({
        type: 'popups',
        label: '팝업',
        total: popups.length,
        published: active,
        draft: 0,
        archived: inactive,
        totalViews,
        avgViews: popups.length > 0 ? Math.round(totalViews / popups.length) : 0,
        color: '#10b981',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch popups:', error);
  }

  // Fetch events
  try {
    const eventsRes = await fetch('/api/admin/events?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const eventsData = await eventsRes.json();

    if (eventsData.success) {
      const events = eventsData.data;
      const published = events.filter((e: any) => e.status === 'PUBLISHED').length;
      const draft = events.filter((e: any) => e.status === 'DRAFT').length;
      const archived = events.filter((e: any) => e.status === 'ARCHIVED').length;
      const totalViews = events.reduce((sum: number, e: any) => sum + (e.viewCount || 0), 0);

      contentTypes.push({
        type: 'events',
        label: '이벤트',
        total: events.length,
        published,
        draft,
        archived,
        totalViews,
        avgViews: events.length > 0 ? Math.round(totalViews / events.length) : 0,
        color: '#f59e0b',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch events:', error);
  }

  // Fetch knowledge library
  try {
    const libraryRes = await fetch('/api/admin/knowledge/library?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const libraryData = await libraryRes.json();

    if (libraryData.success) {
      const library = libraryData.data;
      const totalDownloads = library.reduce((sum: number, l: any) => sum + (l.downloadCount || 0), 0);

      contentTypes.push({
        type: 'library',
        label: '라이브러리',
        total: library.length,
        published: library.length,
        draft: 0,
        archived: 0,
        totalViews: totalDownloads,
        avgViews: library.length > 0 ? Math.round(totalDownloads / library.length) : 0,
        color: '#ef4444',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch library:', error);
  }

  // Fetch knowledge videos
  try {
    const videosRes = await fetch('/api/admin/knowledge/videos?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const videosData = await videosRes.json();

    if (videosData.success) {
      const videos = videosData.data;
      const totalViews = videos.reduce((sum: number, v: any) => sum + (v.viewCount || 0), 0);

      contentTypes.push({
        type: 'videos',
        label: '비디오',
        total: videos.length,
        published: videos.length,
        draft: 0,
        archived: 0,
        totalViews,
        avgViews: videos.length > 0 ? Math.round(totalViews / videos.length) : 0,
        color: '#06b6d4',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch videos:', error);
  }

  // Fetch knowledge blog
  try {
    const blogRes = await fetch('/api/admin/knowledge/blog?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blogData = await blogRes.json();

    if (blogData.success) {
      const blog = blogData.data;
      const totalViews = blog.reduce((sum: number, b: any) => sum + (b.viewCount || 0), 0);

      contentTypes.push({
        type: 'blog',
        label: '블로그',
        total: blog.length,
        published: blog.length,
        draft: 0,
        archived: 0,
        totalViews,
        avgViews: blog.length > 0 ? Math.round(totalViews / blog.length) : 0,
        color: '#ec4899',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch blog:', error);
  }

  // Fetch demo requests
  try {
    const demoRes = await fetch('/api/admin/demo-requests?per_page=1000', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const demoData = await demoRes.json();

    if (demoData.success) {
      const demo = demoData.data;
      const completed = demo.filter((d: any) => d.status === 'COMPLETED').length;
      const pending = demo.filter((d: any) => ['NEW', 'CONTACTED', 'SCHEDULED'].includes(d.status)).length;
      const cancelled = demo.filter((d: any) => d.status === 'CANCELLED').length;

      contentTypes.push({
        type: 'demo-requests',
        label: '문의내역',
        total: demo.length,
        published: completed,
        draft: pending,
        archived: cancelled,
        totalViews: 0,
        avgViews: 0,
        color: '#64748b',
      });
    }
  } catch (error) {
    console.error('[UnifiedInsights] Failed to fetch demo requests:', error);
  }

  // Calculate aggregates
  const totalContent = contentTypes.reduce((sum, ct) => sum + ct.total, 0);
  const totalPublished = contentTypes.reduce((sum, ct) => sum + ct.published, 0);
  const totalViews = contentTypes.reduce((sum, ct) => sum + ct.totalViews, 0);

  // Find most active type (by total items)
  const mostActiveType = contentTypes.length > 0
    ? contentTypes.reduce((max, ct) => (ct.total > max.total ? ct : max)).label
    : 'N/A';

  // Find most viewed type
  const mostViewedType = contentTypes.length > 0
    ? contentTypes.reduce((max, ct) => (ct.totalViews > max.totalViews ? ct : max)).label
    : 'N/A';

  return {
    contentTypes,
    totalContent,
    totalViews,
    totalPublished,
    mostActiveType,
    mostViewedType,
  };
}
