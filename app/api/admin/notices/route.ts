/**
 * Admin Notices API - Complete CRUD (Static Export Compatible)
 *
 * Based on: GLEC-API-Specification.yaml (lines 1255-1511)
 * Requirements:
 * - FR-ADMIN-003: 공지사항 목록 조회
 * - FR-ADMIN-004: 공지사항 작성
 * - FR-ADMIN-005: 공지사항 수정
 * - FR-ADMIN-006: 공지사항 삭제
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 *
 * Endpoints (Query Parameter Pattern - Static Export Compatible):
 * - GET /api/admin/notices - 모든 상태의 공지사항 목록
 * - POST /api/admin/notices - 새 공지사항 생성
 * - PUT /api/admin/notices?id=xxx - 공지사항 수정
 * - DELETE /api/admin/notices?id=xxx - 공지사항 삭제 (Soft Delete)
 *
 * Note: Query parameter pattern used instead of dynamic routes (/notices/[id])
 * due to Next.js Static Export limitations. This ensures compatibility with
 * Cloudflare Pages deployment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { getMockNoticesWithIds, addMockNotice, updateMockNotice, deleteMockNotice } from '@/lib/mock-data';
import type { Notice, NoticeCategory, ContentStatus } from '@prisma/client';

// ============================================================
// Validation Schemas
// ============================================================

/**
 * Notice Create Schema
 * Based on: GLEC-API-Specification.yaml (lines 1338-1367)
 */

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const NoticeCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt must be 300 characters or less').optional(),
  category: z.enum(['GENERAL', 'PRODUCT', 'EVENT', 'PRESS'], {
    errorMap: () => ({ message: 'Category must be one of: GENERAL, PRODUCT, EVENT, PRESS' }),
  }),
  status: z.enum(['DRAFT', 'PUBLISHED'], {
    errorMap: () => ({ message: 'Status must be either DRAFT or PUBLISHED' }),
  }),
  thumbnail_url: z.string().url('Invalid URL format').optional(),
});

type NoticeCreateInput = z.infer<typeof NoticeCreateSchema>;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate slug from title
 * Example: "DHL GoGreen 파트너십" → "dhl-gogreen-partnership"
 *
 * Based on: GLEC-API-Specification.yaml (line 1327 - slug 자동 생성)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9가-힣\s-]/g, '') // Keep alphanumeric, Korean, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Check if slug is unique (mock implementation)
 * TODO: Replace with Prisma query when DB connected
 */
function isSlugUnique(slug: string, existingNotices: Notice[]): boolean {
  return !existingNotices.some((n) => n.slug === slug);
}

/**
 * Generate unique slug with numeric suffix if needed
 * Example: "dhl-gogreen" → "dhl-gogreen-2" (if "dhl-gogreen" exists)
 *
 * Based on: GLEC-API-Specification.yaml (line 1327 - 중복 시 숫자 추가)
 */
function generateUniqueSlug(title: string, existingNotices: Notice[]): string {
  let slug = generateSlug(title);
  let counter = 2;

  while (!isSlugUnique(slug, existingNotices)) {
    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Generate mock UUID (deterministic for testing)
 */
function generateMockUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Create excerpt from HTML content if not provided
 * Strips HTML tags and truncates to 300 chars
 */
function generateExcerpt(content: string, maxLength: number = 300): string {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '').trim();

  if (text.length <= maxLength) {
    return text;
  }

  // Truncate and add ellipsis
  return text.substring(0, maxLength - 3) + '...';
}

// ============================================================
// GET /api/admin/notices - List all notices (including DRAFT)
// ============================================================

/**
 * GET /api/admin/notices
 *
 * Based on: GLEC-API-Specification.yaml (lines 1256-1315)
 * Requirements: FR-ADMIN-003 (공지사항 목록 조회)
 *
 * Query Parameters:
 * - page (default: 1)
 * - per_page (default: 20, max: 100)
 * - status (DRAFT, PUBLISHED, ARCHIVED)
 * - category (GENERAL, PRODUCT, EVENT, PRESS)
 * - search (title search)
 *
 * Response: { success: true, data: Notice[], meta: PaginationMeta }
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      // If ID is provided, return single notice (Query Parameter Pattern)
      if (id) {
        const allNotices = getMockNoticesWithIds();
        const notice = allNotices.find((n) => n.id === id);

        if (!notice) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'NOT_FOUND',
                message: '공지사항을 찾을 수 없습니다',
              },
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            data: notice,
          },
          {
            headers: {
              'Cache-Control': 'no-store, must-revalidate',
            },
          }
        );
      }

      // Otherwise, return paginated list
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
      const status = searchParams.get('status') as ContentStatus | null;
      const category = searchParams.get('category') as NoticeCategory | null;
      const search = searchParams.get('search');

      // Validation
      if (page < 1 || isNaN(page)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_PAGE',
              message: 'Page number must be >= 1',
            },
          },
          { status: 400 }
        );
      }

      // TODO: Replace with Prisma when DB connected
      // const notices = await prisma.notice.findMany({ where: { ... } });
      let allNotices = getMockNoticesWithIds();

      // Filter by status (admin can see all statuses)
      if (status) {
        allNotices = allNotices.filter((n) => n.status === status);
      }

      // Filter by category
      if (category) {
        allNotices = allNotices.filter((n) => n.category === category);
      }

      // Search by title
      if (search) {
        const searchLower = search.toLowerCase();
        allNotices = allNotices.filter((n) => n.title.toLowerCase().includes(searchLower));
      }

      // Sort by publishedAt desc (or createdAt if no publishedAt)
      allNotices.sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return dateB.getTime() - dateA.getTime();
      });

      // Pagination
      const total = allNotices.length;
      const total_pages = Math.ceil(total / per_page);
      const start = (page - 1) * per_page;
      const end = start + per_page;
      const paginatedNotices = allNotices.slice(start, end);

      return NextResponse.json(
        {
          success: true,
          data: paginatedNotices,
          meta: {
            page,
            per_page,
            total,
            total_pages,
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate', // Admin data should not be cached
          },
        }
      );
    } catch (error) {
      console.error('[GET /api/admin/notices] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// POST /api/admin/notices - Create new notice
// ============================================================

/**
 * POST /api/admin/notices
 *
 * Based on: GLEC-API-Specification.yaml (lines 1317-1386)
 * Requirements: FR-ADMIN-004 (공지사항 작성)
 *
 * Request Body:
 * {
 *   title: string (1-200 chars),
 *   content: string (HTML),
 *   excerpt?: string (max 300 chars),
 *   category: "GENERAL" | "PRODUCT" | "EVENT" | "PRESS",
 *   status: "DRAFT" | "PUBLISHED",
 *   thumbnail_url?: string (URL)
 * }
 *
 * Auto-generated fields:
 * - slug: from title (unique)
 * - authorId: current user ID
 * - publishedAt: now (if status === PUBLISHED)
 *
 * Response: { success: true, data: Notice }
 */
export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      // Parse request body
      const body = await request.json();

      // Validate with Zod
      const validationResult = NoticeCreateSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const validated = validationResult.data;

      // TODO: Replace with Prisma when DB connected
      // Get existing notices to check slug uniqueness
      const existingNotices = getMockNoticesWithIds();

      // Generate unique slug
      const slug = generateUniqueSlug(validated.title, existingNotices);

      // Generate excerpt if not provided
      const excerpt = validated.excerpt || generateExcerpt(validated.content);

      // Create notice object
      const now = new Date();
      const newNotice: Notice = {
        id: generateMockUUID(),
        title: validated.title,
        slug,
        content: validated.content,
        excerpt,
        status: validated.status as ContentStatus,
        category: validated.category as NoticeCategory,
        thumbnailUrl: validated.thumbnail_url || null,
        viewCount: 0,
        publishedAt: validated.status === 'PUBLISHED' ? now : null,
        authorId: user.userId, // From JWT token
        createdAt: now,
        updatedAt: now,
      };

      // TODO: Replace with Prisma when DB connected
      // const createdNotice = await prisma.notice.create({ data: newNotice });

      // MVP: Add to in-memory store (will persist until server restart)
      addMockNotice(newNotice);

      console.log('[POST /api/admin/notices] Created notice (MOCK - in-memory):', {
        id: newNotice.id,
        title: newNotice.title,
        slug: newNotice.slug,
        status: newNotice.status,
        authorId: newNotice.authorId,
      });

      return NextResponse.json(
        {
          success: true,
          data: newNotice,
        },
        {
          status: 201,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[POST /api/admin/notices] Error:', error);

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_JSON',
              message: 'Invalid JSON in request body',
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// PUT /api/admin/notices?id=xxx - Update notice by ID
// ============================================================

/**
 * Notice Update Schema
 * Based on: GLEC-API-Specification.yaml (lines 1450-1470)
 */
const NoticeUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(300).optional(),
  category: z.enum(['GENERAL', 'PRODUCT', 'EVENT', 'PRESS']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  thumbnail_url: z.string().url('Invalid URL format').optional().nullable(),
});

/**
 * PUT /api/admin/notices?id=xxx
 *
 * Based on: GLEC-API-Specification.yaml (lines 1424-1483)
 * Requirements: FR-ADMIN-005 (공지사항 수정)
 *
 * Query Parameters:
 * - id: Notice UUID (required)
 *
 * Request Body (all fields optional):
 * {
 *   title?: string,
 *   content?: string,
 *   excerpt?: string,
 *   category?: "GENERAL" | "PRODUCT" | "EVENT" | "PRESS",
 *   status?: "DRAFT" | "PUBLISHED" | "ARCHIVED",
 *   thumbnail_url?: string | null
 * }
 *
 * Auto-updates:
 * - publishedAt: set to now if status changes from DRAFT → PUBLISHED
 * - updatedAt: always set to now
 *
 * Response: { success: true, data: Notice }
 */
export const PUT = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const { searchParams } = request.nextUrl;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_ID',
              message: 'Notice ID is required in query parameter (?id=xxx)',
            },
          },
          { status: 400 }
        );
      }

      // Parse request body
      const body = await request.json();

      // Validate with Zod
      const validationResult = NoticeUpdateSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const validated = validationResult.data;

      // TODO: Replace with Prisma when DB connected
      // const existingNotice = await prisma.notice.findUnique({ where: { id } });
      const allNotices = getMockNoticesWithIds();
      const existingNotice = allNotices.find((n) => n.id === id);

      if (!existingNotice) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '공지사항을 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      // Prepare update data
      const now = new Date();
      const updatedNotice: Notice = {
        ...existingNotice,
        ...validated,
        updatedAt: now,
      };

      // Auto-update publishedAt if status changes to PUBLISHED
      if (validated.status === 'PUBLISHED' && existingNotice.status !== 'PUBLISHED') {
        updatedNotice.publishedAt = now;
      }

      // Handle thumbnail_url null explicitly
      if ('thumbnail_url' in validated) {
        updatedNotice.thumbnailUrl = validated.thumbnail_url ?? null;
      }

      // TODO: Replace with Prisma when DB connected
      // const updated = await prisma.notice.update({ where: { id }, data: updatedNotice });

      // MVP: Update in-memory store
      const result = updateMockNotice(id, {
        ...validated,
        updatedAt: now,
        publishedAt: updatedNotice.publishedAt,
        thumbnailUrl: updatedNotice.thumbnailUrl,
      });

      // If not found in in-memory store, it might be a static mock notice
      // In that case, we can't update it (DB would handle this)
      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UPDATE_FAILED',
              message: 'Cannot update static mock notices. Only dynamically created notices can be updated.',
            },
          },
          { status: 400 }
        );
      }

      console.log('[PUT /api/admin/notices] Updated notice (MOCK - in-memory):', {
        id: result.id,
        title: result.title,
        status: result.status,
        publishedAt: result.publishedAt,
      });

      return NextResponse.json(
        {
          success: true,
          data: result,
        },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    } catch (error) {
      console.error('[PUT /api/admin/notices] Error:', error);

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_JSON',
              message: 'Invalid JSON in request body',
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// DELETE /api/admin/notices?id=xxx - Soft delete notice
// ============================================================

/**
 * DELETE /api/admin/notices?id=xxx
 *
 * Based on: GLEC-API-Specification.yaml (lines 1485-1511)
 * Requirements: FR-ADMIN-006 (공지사항 삭제)
 *
 * Query Parameters:
 * - id: Notice UUID (required)
 *
 * Soft Delete: Sets deleted_at timestamp instead of actually deleting
 *
 * Response: 204 No Content
 */
export const DELETE = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const { searchParams } = request.nextUrl;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_ID',
              message: 'Notice ID is required in query parameter (?id=xxx)',
            },
          },
          { status: 400 }
        );
      }

      // TODO: Replace with Prisma when DB connected
      // const existingNotice = await prisma.notice.findUnique({ where: { id } });
      const allNotices = getMockNoticesWithIds();
      const existingNotice = allNotices.find((n) => n.id === id);

      if (!existingNotice) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '공지사항을 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      // TODO: Replace with Prisma when DB connected
      // Soft Delete: Update deleted_at instead of actual deletion
      // await prisma.notice.update({
      //   where: { id },
      //   data: { deleted_at: new Date() }
      // });

      // MVP: Soft delete in-memory store
      const deleted = deleteMockNotice(id);

      // If not found in in-memory store, it might be a static mock notice
      if (!deleted) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DELETE_FAILED',
              message: 'Cannot delete static mock notices. Only dynamically created notices can be deleted.',
            },
          },
          { status: 400 }
        );
      }

      console.log('[DELETE /api/admin/notices] Soft deleted notice (MOCK - in-memory):', {
        id: existingNotice.id,
        title: existingNotice.title,
        deleted_at: new Date(),
      });

      // Return 204 No Content (as per API spec)
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      });
    } catch (error) {
      console.error('[DELETE /api/admin/notices] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
