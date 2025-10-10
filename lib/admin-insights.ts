/**
 * Admin Insights Utilities
 *
 * Common statistics calculation functions for admin content pages
 */

export interface BaseStats {
  totalItems: number;
  draftCount: number;
  publishedCount: number;
  archivedCount: number;
  totalViews: number;
  avgViewsPerItem: number;
}

export interface ContentItem {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount?: number;
  downloadCount?: number; // For Knowledge Library
  publishedAt: string | null;
  title: string;
  [key: string]: any;
}

/**
 * Calculate basic statistics for any content type
 */
export function calculateBaseStats<T extends ContentItem>(items: T[]): BaseStats {
  const totalItems = items.length;
  const draftCount = items.filter(item => item.status === 'DRAFT').length;
  const publishedCount = items.filter(item => item.status === 'PUBLISHED').length;
  const archivedCount = items.filter(item => item.status === 'ARCHIVED').length;
  // Support both viewCount and downloadCount (for Knowledge Library)
  const totalViews = items.reduce((sum, item) => {
    const count = item.viewCount ?? item.downloadCount ?? 0;
    return sum + count;
  }, 0);
  const avgViewsPerItem = totalItems > 0 ? Math.round(totalViews / totalItems) : 0;

  return {
    totalItems,
    draftCount,
    publishedCount,
    archivedCount,
    totalViews,
    avgViewsPerItem,
  };
}

/**
 * Get top N items by view count
 */
export function getTopViewed<T extends ContentItem>(items: T[], limit: number = 5): T[] {
  return [...items]
    .sort((a, b) => {
      const aCount = a.viewCount ?? a.downloadCount ?? 0;
      const bCount = b.viewCount ?? b.downloadCount ?? 0;
      return bCount - aCount;
    })
    .slice(0, limit);
}

/**
 * Get recently published items
 */
export function getRecentPublished<T extends ContentItem>(items: T[], limit: number = 5): T[] {
  return items
    .filter(item => item.status === 'PUBLISHED' && item.publishedAt)
    .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
    .slice(0, limit);
}

/**
 * Calculate category distribution (for items with category field)
 */
export function calculateCategoryDistribution<T extends ContentItem & { category?: string }>(
  items: T[],
  categories: string[]
): Record<string, number> {
  const distribution: Record<string, number> = {};
  categories.forEach(cat => {
    distribution[cat] = items.filter(item => item.category === cat).length;
  });
  return distribution;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
