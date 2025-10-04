/**
 * Mock Data for Development
 *
 * Based on: GLEC-API-Specification.yaml
 * Purpose: Provide realistic data for API endpoints before DB connection
 *
 * IMPORTANT: This is temporary mock data.
 * In production, all data comes from Neon PostgreSQL via Prisma.
 */

import type {
  Notice,
  Press,
  NoticeCategory,
  ContentStatus,
} from '@prisma/client';

/**
 * Mock Notices Data
 * Replaces hardcoded data in LatestNewsSection.tsx
 */
export const mockNotices: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'DHL GoGreen 파트너십 체결',
    slug: 'dhl-gogreen-partnership-2025',
    content: `
      <p>GLEC이 글로벌 물류 리더 DHL과 탄소배출 측정 기술 파트너십을 맺었습니다.</p>
      <h2>파트너십 주요 내용</h2>
      <ul>
        <li>DHL GoGreen 프로그램에 GLEC DTG 시리즈 공급</li>
        <li>ISO-14083 표준 기반 탄소배출량 측정</li>
        <li>연간 158만 톤 CO₂ 감축 목표</li>
      </ul>
      <p>이번 파트너십을 통해 GLEC은 국제 물류 탄소배출 표준화에 기여할 예정입니다.</p>
    `,
    excerpt: '글로벌 물류 리더 DHL과 탄소배출 측정 기술 파트너십을 맺고, 국제 물류 탄소배출 표준화에 나섭니다.',
    status: 'PUBLISHED' as ContentStatus,
    category: 'PRESS' as NoticeCategory,
    thumbnailUrl: '/images/news/dhl-partnership.svg',
    viewCount: 1250,
    publishedAt: new Date('2025-09-15T09:00:00Z'),
    authorId: 'mock-admin-id',
  },
  {
    title: 'GLEC DTG Series5 출시',
    slug: 'dtg-series5-launch-2025',
    content: `
      <p>세계 최초 스마트폰 CPU를 탑재한 DTG Series5가 출시되었습니다.</p>
      <h2>주요 특징</h2>
      <ul>
        <li>Snapdragon 기반 고성능 연산</li>
        <li>ISO-14083 엔진 내장으로 실시간 탄소배출량 계산</li>
        <li>LTE/5G 네트워크 지원으로 실시간 데이터 전송</li>
        <li>80만원의 일회성 비용 (월 구독료 없음)</li>
      </ul>
      <p>158만 톤의 탄소배출량 측정 성능을 자랑하는 GLEC DTG Series5를 만나보세요.</p>
    `,
    excerpt: '세계 최초 스마트폰 CPU를 탑재한 DTG Series5가 출시되었습니다. ISO-14083 엔진 내장으로 실시간 탄소배출량 계산이 가능합니다.',
    status: 'PUBLISHED' as ContentStatus,
    category: 'PRODUCT' as NoticeCategory,
    thumbnailUrl: '/images/news/dtg-series5-launch.svg',
    viewCount: 2840,
    publishedAt: new Date('2025-08-20T10:00:00Z'),
    authorId: 'mock-admin-id',
  },
  {
    title: 'ISO-14083 국제표준 인증 획득',
    slug: 'iso-14083-certification-2025',
    content: `
      <p>GLEC의 탄소배출 측정 방법론이 ISO-14083 국제표준 인증을 획득했습니다.</p>
      <h2>ISO-14083 인증의 의미</h2>
      <ul>
        <li>국제적으로 인정받는 탄소배출 측정 표준</li>
        <li>글로벌 물류 기업과의 협업 기반 마련</li>
        <li>ESG 보고서 작성 시 공인된 데이터 제공</li>
      </ul>
      <p>GLEC은 앞으로도 국제 표준을 준수하며 글로벌 신뢰성을 확보해 나가겠습니다.</p>
    `,
    excerpt: 'GLEC의 탄소배출 측정 방법론이 ISO-14083 국제표준 인증을 획득하며, 글로벌 신뢰성을 확보했습니다.',
    status: 'PUBLISHED' as ContentStatus,
    category: 'GENERAL' as NoticeCategory,
    thumbnailUrl: '/images/news/iso-certification.svg',
    viewCount: 980,
    publishedAt: new Date('2025-07-10T14:00:00Z'),
    authorId: 'mock-admin-id',
  },
];

/**
 * Mock Press Releases
 */
export const mockPress: Omit<Press, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'GLEC, DHL과 글로벌 물류 탄소중립 파트너십 체결',
    slug: 'glec-dhl-global-partnership',
    content: `
      <p>[서울, 2025년 9월 15일] GLEC이 세계 최대 물류 기업 DHL과 탄소중립 물류를 위한 전략적 파트너십을 체결했다고 발표했다.</p>
      <p>이번 파트너십을 통해 GLEC의 DTG 시리즈와 Carbon API가 DHL GoGreen 프로그램에 통합되어, 전 세계 DHL 물류 차량의 탄소배출량을 실시간으로 측정하고 관리하게 된다.</p>
    `,
    excerpt: 'GLEC이 DHL과 탄소중립 물류 파트너십을 체결하며 글로벌 시장 진출을 본격화합니다.',
    status: 'PUBLISHED' as ContentStatus,
    thumbnailUrl: '/images/news/dhl-partnership.svg',
    mediaOutlet: '매일경제',
    externalUrl: 'https://example.com/news/glec-dhl-partnership',
    viewCount: 3200,
    publishedAt: new Date('2025-09-15T09:00:00Z'),
    authorId: 'mock-admin-id',
  },
  {
    title: '\'화물차 탄소배출 측정의 표준\' GLEC DTG Series5 출시',
    slug: 'glec-dtg-series5-standard',
    content: `
      <p>[서울, 2025년 8월 20일] GLEC이 세계 최초로 스마트폰 CPU를 탑재한 차량용 탄소배출 측정 장치 'DTG Series5'를 출시했다.</p>
      <p>DTG Series5는 Snapdragon 프로세서 기반으로 실시간 ISO-14083 표준 연산을 수행하며, GPS, 속도, 연료 소비량을 자동으로 수집한다.</p>
    `,
    excerpt: '세계 최초 스마트폰 CPU 탑재 DTG Series5로 화물차 탄소배출 측정의 새로운 표준을 제시합니다.',
    status: 'PUBLISHED' as ContentStatus,
    thumbnailUrl: '/images/news/dtg-series5-launch.svg',
    mediaOutlet: '한국경제',
    externalUrl: 'https://example.com/news/dtg-series5-launch',
    viewCount: 2800,
    publishedAt: new Date('2025-08-20T10:00:00Z'),
    authorId: 'mock-admin-id',
  },
];

/**
 * Generate mock ID with timestamp for realistic ordering
 */
export function generateMockId(index: number): string {
  return `mock-${Date.now()}-${index.toString().padStart(3, '0')}`;
}

/**
 * In-memory store for dynamically created notices (MVP - until DB connected)
 * WARNING: Data will be lost on server restart
 */
const inMemoryNotices: Notice[] = [];

/**
 * Add mock IDs and timestamps to notices
 */
export function getMockNoticesWithIds(): Notice[] {
  const staticNotices = mockNotices.map((notice, index) => ({
    ...notice,
    id: generateMockId(index),
    createdAt: new Date(notice.publishedAt!),
    updatedAt: new Date(notice.publishedAt!),
  })) as Notice[];

  // Merge static mock data with in-memory created notices
  return [...staticNotices, ...inMemoryNotices];
}

/**
 * Add notice to in-memory store (MVP - until DB connected)
 */
export function addMockNotice(notice: Notice): void {
  inMemoryNotices.push(notice);
}

/**
 * Update notice in in-memory store (MVP - until DB connected)
 */
export function updateMockNotice(id: string, updates: Partial<Notice>): Notice | null {
  const index = inMemoryNotices.findIndex((n) => n.id === id);
  if (index === -1) return null;

  inMemoryNotices[index] = { ...inMemoryNotices[index], ...updates };
  return inMemoryNotices[index];
}

/**
 * Delete notice from in-memory store (MVP - until DB connected)
 */
export function deleteMockNotice(id: string): boolean {
  const index = inMemoryNotices.findIndex((n) => n.id === id);
  if (index === -1) return false;

  // Soft delete: set deletedAt
  inMemoryNotices[index].deletedAt = new Date();
  return true;
}

/**
 * Add mock IDs and timestamps to press releases
 */
export function getMockPressWithIds(): Press[] {
  return mockPress.map((press, index) => ({
    ...press,
    id: generateMockId(index + 100),
    createdAt: new Date(press.publishedAt!),
    updatedAt: new Date(press.publishedAt!),
  })) as Press[];
}
