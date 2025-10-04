/**
 * Shared Popup Data Store
 *
 * Purpose: Single source of truth for popup data
 * Used by both /api/admin/popups and /api/popups
 *
 * NOTE: This is in-memory storage for development.
 * In production, this should be replaced with database queries.
 */

export interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  isActive: boolean;
  zIndex: number;
  displayType: 'modal' | 'banner' | 'corner';
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width: number;
  height: number;
  showOnce: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// Shared in-memory storage (SINGLE SOURCE OF TRUTH)
let POPUPS: Popup[] = [
  {
    id: '1',
    title: 'GLEC DTG Series5 출시 🎉',
    content: '<p>새로운 <strong>GLEC DTG Series5</strong>가 출시되었습니다!</p><p>지금 바로 확인하세요.</p>',
    imageUrl: null,
    linkUrl: '/dtg',
    linkText: '자세히 보기',
    isActive: true,
    zIndex: 1000,
    displayType: 'modal',
    position: 'center',
    width: 500,
    height: 600,
    showOnce: true,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'ISO-14083 무료 컨설팅',
    content: '<p>한정 기간 <strong>무료 컨설팅</strong> 진행 중!</p>',
    imageUrl: null,
    linkUrl: '/contact',
    linkText: '신청하기',
    isActive: true,
    zIndex: 999,
    displayType: 'banner',
    position: 'top',
    width: 0,
    height: 80,
    showOnce: false,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: '고객 지원',
    content: '<p>문의사항이 있으신가요?</p>',
    imageUrl: null,
    linkUrl: '/contact',
    linkText: '문의하기',
    isActive: true,
    zIndex: 998,
    displayType: 'corner',
    position: 'bottom-right',
    width: 300,
    height: 200,
    showOnce: false,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// CRUD Operations (Shared by both APIs)
export const PopupStore = {
  // Get all popups
  getAll(): Popup[] {
    return [...POPUPS];
  },

  // Get popup by ID
  getById(id: string): Popup | undefined {
    return POPUPS.find((p) => p.id === id);
  },

  // Get active popups (for public website)
  getActive(): Popup[] {
    const now = new Date();
    return POPUPS.filter((popup) => {
      // Only check isActive flag, NOT date range
      // Admin should control dates, but we trust isActive flag
      return popup.isActive === true;
    }).sort((a, b) => b.zIndex - a.zIndex);
  },

  // Create popup
  create(data: Omit<Popup, 'id' | 'createdAt' | 'updatedAt'>): Popup {
    const now = new Date().toISOString();
    const newPopup: Popup = {
      ...data,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };

    POPUPS.push(newPopup);
    return newPopup;
  },

  // Update popup
  update(id: string, data: Partial<Popup>): Popup | null {
    const index = POPUPS.findIndex((p) => p.id === id);
    if (index === -1) return null;

    POPUPS[index] = {
      ...POPUPS[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return POPUPS[index];
  },

  // Delete popup
  delete(id: string): boolean {
    const index = POPUPS.findIndex((p) => p.id === id);
    if (index === -1) return false;

    POPUPS.splice(index, 1);
    return true;
  },

  // Reorder popups (update z-index)
  reorder(popupIds: string[]): boolean {
    let maxZIndex = 1000;

    for (const id of popupIds) {
      const popup = POPUPS.find((p) => p.id === id);
      if (popup) {
        popup.zIndex = maxZIndex--;
        popup.updatedAt = new Date().toISOString();
      }
    }

    return true;
  },
};
