# Admin Tab Structure Implementation Guide

## Overview

All admin content management pages now follow a standardized two-tab structure:
- **Tab 1: 인사이트 (Insights)** - Statistics and analytics
- **Tab 2: 관리 (Management)** - CRUD operations

## Reusable Components Created

### 1. `components/admin/TabLayout.tsx`
Provides the tab navigation UI with icons.

```typescript
import TabLayout, { TabType } from '@/components/admin/TabLayout';

<TabLayout
  activeTab={activeTab}
  onTabChange={setActiveTab}
  insightsContent={<InsightsTab />}
  managementContent={<ManagementTab />}
/>
```

### 2. `components/admin/InsightsCards.tsx`
Reusable UI components for insights:
- `OverviewCards` - 4 metric cards (total, published, views, average)
- `StatusDistribution` - Status breakdown with progress bars
- `CategoryDistribution` - Category breakdown (generic, configurable)
- `TopViewedList<T>` - Top N viewed items (TypeScript generic)
- `RecentPublishedList<T>` - Recent N published items (TypeScript generic)

### 3. `lib/admin-insights.ts`
Utility functions for statistics calculation:
- `calculateBaseStats(items)` - Calculates totals, counts, views
- `getTopViewed(items, N)` - Returns top N items by view count
- `getRecentPublished(items, N)` - Returns recently published items
- `calculateCategoryDistribution(items, categories)` - Category breakdown
- `formatDate(dateStr)` - Korean date formatting

## Implementation Pattern

### Step 1: Add Imports

```typescript
import TabLayout, { TabType } from '@/components/admin/TabLayout';
import {
  OverviewCards,
  StatusDistribution,
  CategoryDistribution,
  TopViewedList,
  RecentPublishedList,
} from '@/components/admin/InsightsCards';
import {
  calculateBaseStats,
  getTopViewed,
  getRecentPublished,
  calculateCategoryDistribution,
  type BaseStats,
} from '@/lib/admin-insights';
```

### Step 2: Add State for Tabs and Statistics

```typescript
// Tab state
const [activeTab, setActiveTab] = useState<TabType>('management');

// Data states
const [allItems, setAllItems] = useState<YourType[]>([]); // For insights
const [stats, setStats] = useState<YourStatsType | null>(null);

// Define stats interface
interface YourStatsType extends BaseStats {
  categoryDistribution: Record<string, number>;
  recentPublished: YourType[];
  topViewed: YourType[];
}
```

### Step 3: Add Data Fetching for Insights

```typescript
useEffect(() => {
  if (activeTab === 'management') {
    fetchItems(); // Existing fetch with pagination
  } else if (activeTab === 'insights') {
    fetchAllItemsForInsights(); // Fetch all items (max 1000)
  }
}, [activeTab, page, status, category, search]);

const fetchAllItemsForInsights = async () => {
  try {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Fetch all items (no pagination)
    const response = await fetch('/api/admin/your-endpoint?per_page=1000', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'Failed to fetch items');
    }

    setAllItems(result.data);
    calculateStats(result.data);
  } catch (err) {
    console.error('[Insights] Fetch error:', err);
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Add Statistics Calculation

```typescript
const calculateStats = (itemsList: YourType[]) => {
  const baseStats = calculateBaseStats(itemsList);
  const categoryDistribution = calculateCategoryDistribution(itemsList, [
    'CATEGORY_1',
    'CATEGORY_2',
    'CATEGORY_3'
  ]);
  const topViewed = getTopViewed(itemsList, 5);
  const recentPublished = getRecentPublished(itemsList, 5);

  setStats({
    ...baseStats,
    categoryDistribution,
    recentPublished,
    topViewed,
  });
};
```

### Step 5: Render Insights Content

```typescript
const insightsContent = (
  <div className="space-y-6">
    {isLoading ? (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-600">통계 분석 중...</p>
      </div>
    ) : stats ? (
      <>
        <OverviewCards stats={stats} itemLabel="보도자료" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusDistribution stats={stats} />
          <CategoryDistribution
            distribution={stats.categoryDistribution}
            categories={[
              { key: 'CATEGORY_1', label: '카테고리 1', color: 'bg-blue-500' },
              { key: 'CATEGORY_2', label: '카테고리 2', color: 'bg-purple-500' },
            ]}
            totalItems={stats.totalItems}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopViewedList
            items={stats.topViewed}
            title="조회수 상위 5개"
            emptyMessage="데이터 없음"
          />
          <RecentPublishedList
            items={stats.recentPublished}
            title="최근 발행 5개"
            emptyMessage="데이터 없음"
            renderBadge={(item) => getCategoryBadge(item.category)}
          />
        </div>
      </>
    ) : null}
  </div>
);
```

### Step 6: Render Management Content (Existing CRUD)

```typescript
const managementContent = (
  <div className="space-y-6">
    {/* Existing CRUD UI - Action Button, Filters, Table, Pagination, Modal */}
  </div>
);
```

### Step 7: Use TabLayout

```typescript
return (
  <div className="max-w-7xl mx-auto">
    {/* Page Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">보도자료 관리</h1>
      <p className="mt-2 text-gray-600">보도자료 통계 분석 및 콘텐츠 관리</p>
    </div>

    {/* Tabs */}
    <TabLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      insightsContent={insightsContent}
      managementContent={managementContent}
    />
  </div>
);
```

## Pages to Update

### ✅ Completed
1. **app/admin/notices/page.tsx** - 공지사항 (Working with inline implementations)

### 🔄 To Be Updated
2. **app/admin/press/page.tsx** - 보도자료
3. **app/admin/popups/page.tsx** - 팝업관리
4. **app/admin/events/page.tsx** - 이벤트 (Also fix registrations icon error)
5. **app/admin/knowledge-library/page.tsx** - 지식센터 라이브러리
6. **app/admin/knowledge-videos/page.tsx** - 지식센터 비디오
7. **app/admin/demo-requests/page.tsx** - 문의내역

## Category Configuration Examples

### Notices (공지사항)
```typescript
const categories = [
  { key: 'GENERAL', label: '일반', color: 'bg-blue-500' },
  { key: 'PRODUCT', label: '제품', color: 'bg-purple-500' },
  { key: 'EVENT', label: '이벤트', color: 'bg-pink-500' },
  { key: 'PRESS', label: '보도', color: 'bg-indigo-500' },
];
```

### Events (이벤트)
```typescript
const categories = [
  { key: 'WEBINAR', label: '웨비나', color: 'bg-blue-500' },
  { key: 'CONFERENCE', label: '컨퍼런스', color: 'bg-purple-500' },
  { key: 'WORKSHOP', label: '워크샵', color: 'bg-green-500' },
  { key: 'NETWORKING', label: '네트워킹', color: 'bg-orange-500' },
];
```

### Knowledge Library (지식센터 라이브러리)
```typescript
const categories = [
  { key: 'GUIDE', label: '가이드', color: 'bg-blue-500' },
  { key: 'WHITEPAPER', label: '백서', color: 'bg-indigo-500' },
  { key: 'CASE_STUDY', label: '사례 연구', color: 'bg-purple-500' },
];
```

## Special Cases

### Popups (팝업관리)
- No category distribution (popups don't have categories)
- Skip `CategoryDistribution` component
- Use `displayType` distribution instead:
  ```typescript
  const displayTypes = [
    { key: 'modal', label: '모달', color: 'bg-blue-500' },
    { key: 'banner', label: '배너', color: 'bg-green-500' },
    { key: 'corner', label: '코너', color: 'bg-purple-500' },
  ];
  ```

### Demo Requests (문의내역)
- Read-only (no CREATE/EDIT, only VIEW/DELETE)
- No status filter (all requests are submitted)
- Add `source` distribution:
  ```typescript
  const sources = [
    { key: 'website', label: '웹사이트', color: 'bg-blue-500' },
    { key: 'email', label: '이메일', color: 'bg-green-500' },
    { key: 'phone', label: '전화', color: 'bg-purple-500' },
  ];
  ```

## Testing Checklist

For each page:
- [ ] Tab navigation works (switches between Insights and Management)
- [ ] Insights tab shows correct statistics
- [ ] Insights tab loads all items (up to 1000)
- [ ] Management tab shows paginated list
- [ ] Management tab filters work (status, category, search)
- [ ] Create/Edit/Delete operations work
- [ ] No console errors
- [ ] Responsive layout (mobile, tablet, desktop)

## Benefits of This Approach

1. **Consistency**: All admin pages have the same structure
2. **Maintainability**: Changes to insights UI only need to update reusable components
3. **Type Safety**: TypeScript generics ensure type-safe components
4. **Performance**: Client-side statistics calculation, no extra API calls
5. **Reusability**: Same components used across 7+ admin pages
6. **Scalability**: Easy to add new metrics or visualizations

## Next Steps

1. Apply this pattern to remaining 6 admin pages
2. Test all pages thoroughly
3. Fix any page-specific issues (e.g., Events page registrations icon error)
4. Update admin navigation to highlight current page
5. Add export functionality (CSV, Excel) to insights tab (future enhancement)

## Support

For questions or issues, refer to:
- [components/admin/TabLayout.tsx](components/admin/TabLayout.tsx)
- [components/admin/InsightsCards.tsx](components/admin/InsightsCards.tsx)
- [lib/admin-insights.ts](lib/admin-insights.ts)
- [app/admin/notices/page.tsx](app/admin/notices/page.tsx) (reference implementation)
