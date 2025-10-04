/**
 * Knowledge Center Type Definitions
 *
 * Purpose: TypeScript interfaces for Knowledge Library, Videos, and Blog
 * Standards: GLEC-Coding-Conventions.md (Strict TypeScript)
 * API: GLEC-API-Specification.yaml
 *
 * NO HARDCODING: All data must be dynamically fetched from API
 */

// ============================================================
// KNOWLEDGE LIBRARY
// ============================================================

export type KnowledgeCategory =
  | 'TECHNICAL'
  | 'GUIDE'
  | 'NEWS'
  | 'CASE_STUDY'
  | 'TUTORIAL'
  | 'WHITEPAPER'
  | 'REPORT'
  | 'RESEARCH';

export interface KnowledgeLibraryItem {
  id: string;
  title: string;
  description: string;
  category: KnowledgeCategory;
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';
  fileSize: string; // e.g., "2.5 MB"
  fileUrl: string;
  thumbnailUrl: string | null;
  downloadCount: number;
  tags: string[];
  publishedAt: string; // ISO 8601 date
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeLibraryItemInput {
  title: string;
  description: string;
  category: KnowledgeCategory;
  fileType: KnowledgeLibraryItem['fileType'];
  fileSize: string;
  fileUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  publishedAt?: string;
}

export interface UpdateKnowledgeLibraryItemInput {
  title?: string;
  description?: string;
  category?: KnowledgeCategory;
  fileType?: KnowledgeLibraryItem['fileType'];
  fileSize?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  publishedAt?: string;
}

// ============================================================
// KNOWLEDGE VIDEOS
// ============================================================

export type VideoCategory =
  | 'TECHNICAL'
  | 'GUIDE'
  | 'TUTORIAL'
  | 'WEBINAR'
  | 'CASE_STUDY'
  | 'PRODUCT_DEMO';

export interface KnowledgeVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube, Vimeo, or direct upload
  thumbnailUrl: string | null;
  duration: string; // e.g., "10:35"
  category: VideoCategory;
  viewCount: number;
  tags: string[];
  publishedAt: string; // ISO 8601 date
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeVideoInput {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  category: VideoCategory;
  tags: string[];
  publishedAt?: string;
}

export interface UpdateKnowledgeVideoInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  category?: VideoCategory;
  tags?: string[];
  publishedAt?: string;
}

// ============================================================
// KNOWLEDGE BLOG
// ============================================================

export type BlogCategory =
  | 'TECHNICAL'
  | 'GUIDE'
  | 'NEWS'
  | 'CASE_STUDY'
  | 'TUTORIAL'
  | 'INDUSTRY_INSIGHTS'
  | 'PRODUCT_UPDATES';

export interface KnowledgeBlogPost {
  id: string;
  title: string;
  content: string; // HTML content (TipTap editor)
  excerpt: string;
  author: string;
  category: BlogCategory;
  tags: string[];
  thumbnailUrl: string | null;
  viewCount: number;
  publishedAt: string; // ISO 8601 date
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeBlogPostInput {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: BlogCategory;
  tags: string[];
  thumbnailUrl?: string;
  publishedAt?: string;
}

export interface UpdateKnowledgeBlogPostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  category?: BlogCategory;
  tags?: string[];
  thumbnailUrl?: string;
  publishedAt?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface KnowledgeLibraryResponse {
  success: boolean;
  data: KnowledgeLibraryItem[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

export interface KnowledgeVideoResponse {
  success: boolean;
  data: KnowledgeVideo[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

export interface KnowledgeBlogResponse {
  success: boolean;
  data: KnowledgeBlogPost[];
  meta: PaginationMeta;
  error?: {
    code: string;
    message: string;
  };
}

export interface SingleItemResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================
// CATEGORY LABELS (for UI display)
// ============================================================

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  TECHNICAL: '기술 문서',
  GUIDE: '가이드',
  NEWS: '뉴스',
  CASE_STUDY: '사례 연구',
  TUTORIAL: '튜토리얼',
  WHITEPAPER: '백서',
  REPORT: '보고서',
  RESEARCH: '연구 자료',
};

export const VIDEO_CATEGORY_LABELS: Record<VideoCategory, string> = {
  TECHNICAL: '기술 영상',
  GUIDE: '가이드',
  TUTORIAL: '튜토리얼',
  WEBINAR: '웨비나',
  CASE_STUDY: '사례 연구',
  PRODUCT_DEMO: '제품 데모',
};

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  TECHNICAL: '기술 블로그',
  GUIDE: '가이드',
  NEWS: '뉴스',
  CASE_STUDY: '사례 연구',
  TUTORIAL: '튜토리얼',
  INDUSTRY_INSIGHTS: '업계 인사이트',
  PRODUCT_UPDATES: '제품 업데이트',
};
