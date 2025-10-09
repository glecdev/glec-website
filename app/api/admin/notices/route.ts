/**
 * Admin Notices API - Complete CRUD (Neon PostgreSQL)
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
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import type { NoticeCategory, ContentStatus } from '@prisma/client';
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit-log';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

// ============================================================
// Validation Schemas
// ============================================================

/**
 * Notice Create Schema
 * Based on: GLEC-API-Specification.yaml (lines 1338-1367)
 */
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
  thumbnail_url: z.string().url('Invalid URL format').optional().nullable(),
});

type NoticeCreateInput = z.infer<typeof NoticeCreateSchema>;

/**
 * Notice Update Schema (same as create but all fields optional except ID)
 */
const NoticeUpdateSchema = NoticeCreateSchema.partial();

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
 * Generate unique slug with numeric suffix if needed
 * Example: "dhl-gogreen" → "dhl-gogreen-2" (if "dhl-gogreen" exists)
 */
async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(title);
  let counter = 2;

  while (true) {
    const existing = await sql`
      SELECT id FROM notices
      WHERE slug = ${slug}
        ${excludeId ? sql`AND id != ${excludeId}` : sql``}
      LIMIT 1
    `;

    if (existing.length === 0) {
      return slug;
    }

    slug = `${generateSlug(title)}-${counter}`;
    counter++;
  }
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
        const notices = await sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE id = ${id} AND deleted_at IS NULL
          LIMIT 1
        `;

        if (notices.length === 0) {
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

        const notice = notices[0];

        return NextResponse.json(
          {
            success: true,
            data: {
              id: notice.id,
              title: notice.title,
              slug: notice.slug,
              content: notice.content,
              excerpt: notice.excerpt,
              status: notice.status,
              category: notice.category,
              thumbnailUrl: notice.thumbnail_url,
              viewCount: notice.view_count,
              publishedAt: notice.published_at,
              authorId: notice.author_id,
              createdAt: notice.created_at,
              updatedAt: notice.updated_at,
              deletedAt: notice.deleted_at,
            },
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

      // Build SQL query with filters
      let countQuery;
      let dataQuery;

      if (status && category && search) {
        // All filters
        const searchPattern = `%${search}%`;
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND category = ${category}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND category = ${category}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (status && category) {
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND category = ${category}
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND category = ${category}
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (status && search) {
        const searchPattern = `%${search}%`;
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (category && search) {
        const searchPattern = `%${search}%`;
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
            AND category = ${category}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
            AND category = ${category}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (status) {
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
            AND status = ${status}
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (category) {
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
            AND category = ${category}
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
            AND category = ${category}
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (search) {
        const searchPattern = `%${search}%`;
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else {
        // No filters
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM notices
          WHERE deleted_at IS NULL
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status, category,
            thumbnail_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM notices
          WHERE deleted_at IS NULL
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      }

      // Execute queries
      const countResult = await countQuery;
      const total = Number(countResult[0]?.count || 0);
      const total_pages = Math.ceil(total / per_page);

      const notices = await dataQuery;

      // Transform to camelCase
      const transformedNotices = notices.map((notice: any) => ({
        id: notice.id,
        title: notice.title,
        slug: notice.slug,
        content: notice.content,
        excerpt: notice.excerpt,
        status: notice.status,
        category: notice.category,
        thumbnailUrl: notice.thumbnail_url,
        viewCount: notice.view_count,
        publishedAt: notice.published_at,
        authorId: notice.author_id,
        createdAt: notice.created_at,
        updatedAt: notice.updated_at,
        deletedAt: notice.deleted_at,
      }));

      return NextResponse.json(
        {
          success: true,
          data: transformedNotices,
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

      // Validate input
      const validation = NoticeCreateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const input = validation.data;

      // Generate unique slug
      const slug = await generateUniqueSlug(input.title);

      // Generate excerpt if not provided
      const excerpt = input.excerpt || generateExcerpt(input.content);

      // Determine publishedAt
      const publishedAt = input.status === 'PUBLISHED' ? new Date() : null;

      // Generate UUID
      const newId = crypto.randomUUID();

      // Insert into database
      const result = await sql`
        INSERT INTO notices (
          id, title, slug, content, excerpt, status, category,
          thumbnail_url, view_count, published_at, author_id,
          created_at, updated_at
        )
        VALUES (
          ${newId},
          ${input.title},
          ${slug},
          ${input.content},
          ${excerpt},
          ${input.status},
          ${input.category},
          ${input.thumbnail_url || null},
          0,
          ${publishedAt},
          ${user.userId},
          NOW(),
          NOW()
        )
        RETURNING
          id, title, slug, content, excerpt, status, category,
          thumbnail_url, view_count, published_at, author_id,
          created_at, updated_at
      `;

      const notice = result[0];

      // Create audit log
      await auditCreate(
        user.userId,
        'notices',
        notice.id,
        {
          title: notice.title,
          slug: notice.slug,
          status: notice.status,
          category: notice.category,
        },
        request
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            id: notice.id,
            title: notice.title,
            slug: notice.slug,
            content: notice.content,
            excerpt: notice.excerpt,
            status: notice.status,
            category: notice.category,
            thumbnailUrl: notice.thumbnail_url,
            viewCount: notice.view_count,
            publishedAt: notice.published_at,
            authorId: notice.author_id,
            createdAt: notice.created_at,
            updatedAt: notice.updated_at,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/admin/notices] Error:', error);
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
// PUT /api/admin/notices?id=xxx - Update existing notice
// ============================================================

/**
 * PUT /api/admin/notices?id=xxx
 *
 * Based on: GLEC-API-Specification.yaml (lines 1388-1454)
 * Requirements: FR-ADMIN-005 (공지사항 수정)
 *
 * Query Parameters:
 * - id: string (UUID) - required
 *
 * Request Body (all fields optional):
 * {
 *   title?: string (1-200 chars),
 *   content?: string (HTML),
 *   excerpt?: string (max 300 chars),
 *   category?: "GENERAL" | "PRODUCT" | "EVENT" | "PRESS",
 *   status?: "DRAFT" | "PUBLISHED",
 *   thumbnail_url?: string (URL)
 * }
 *
 * Response: { success: true, data: Notice }
 */
export const PUT = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_ID',
              message: 'Notice ID is required',
            },
          },
          { status: 400 }
        );
      }

      // Check if notice exists
      const existing = await sql`
        SELECT id, title, slug, status, category
        FROM notices
        WHERE id = ${id} AND deleted_at IS NULL
        LIMIT 1
      `;

      if (existing.length === 0) {
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

      // Parse request body
      const body = await request.json();

      // Validate input
      const validation = NoticeUpdateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const input = validation.data;

      // Generate new slug if title changed
      let slug = existing[0].slug;
      if (input.title) {
        slug = await generateUniqueSlug(input.title, id);
      }

      // Update publishedAt if status changed from DRAFT to PUBLISHED
      let publishedAt = null;
      if (input.status === 'PUBLISHED' && existing[0].status === 'DRAFT') {
        publishedAt = new Date();
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (input.title !== undefined) {
        updates.push(`title = $${values.length + 1}`);
        values.push(input.title);
      }
      if (input.title !== undefined) {
        updates.push(`slug = $${values.length + 1}`);
        values.push(slug);
      }
      if (input.content !== undefined) {
        updates.push(`content = $${values.length + 1}`);
        values.push(input.content);
      }
      if (input.excerpt !== undefined) {
        updates.push(`excerpt = $${values.length + 1}`);
        values.push(input.excerpt);
      }
      if (input.category !== undefined) {
        updates.push(`category = $${values.length + 1}`);
        values.push(input.category);
      }
      if (input.status !== undefined) {
        updates.push(`status = $${values.length + 1}`);
        values.push(input.status);
      }
      if (input.thumbnail_url !== undefined) {
        updates.push(`thumbnail_url = $${values.length + 1}`);
        values.push(input.thumbnail_url);
      }
      if (publishedAt) {
        updates.push(`published_at = $${values.length + 1}`);
        values.push(publishedAt);
      }

      if (updates.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NO_UPDATES',
              message: 'No fields to update',
            },
          },
          { status: 400 }
        );
      }

      // Update notice
      const result = await sql`
        UPDATE notices
        SET
          title = COALESCE(${input.title}, title),
          slug = ${slug},
          content = COALESCE(${input.content}, content),
          excerpt = COALESCE(${input.excerpt}, excerpt),
          category = COALESCE(${input.category}, category),
          status = COALESCE(${input.status}, status),
          thumbnail_url = COALESCE(${input.thumbnail_url}, thumbnail_url),
          published_at = COALESCE(${publishedAt}, published_at),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING
          id, title, slug, content, excerpt, status, category,
          thumbnail_url, view_count, published_at, author_id,
          created_at, updated_at
      `;

      const notice = result[0];

      // Create audit log
      await auditUpdate(
        user.userId,
        'notices',
        notice.id,
        {
          title: existing[0].title,
          slug: existing[0].slug,
          status: existing[0].status,
        },
        {
          title: notice.title,
          slug: notice.slug,
          status: notice.status,
          category: notice.category,
        },
        request
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            id: notice.id,
            title: notice.title,
            slug: notice.slug,
            content: notice.content,
            excerpt: notice.excerpt,
            status: notice.status,
            category: notice.category,
            thumbnailUrl: notice.thumbnail_url,
            viewCount: notice.view_count,
            publishedAt: notice.published_at,
            authorId: notice.author_id,
            createdAt: notice.created_at,
            updatedAt: notice.updated_at,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('[PUT /api/admin/notices] Error:', error);
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
 * Based on: GLEC-API-Specification.yaml (lines 1456-1511)
 * Requirements: FR-ADMIN-006 (공지사항 삭제 - Soft Delete)
 *
 * Query Parameters:
 * - id: string (UUID) - required
 *
 * Response: { success: true }
 */
export const DELETE = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_ID',
              message: 'Notice ID is required',
            },
          },
          { status: 400 }
        );
      }

      // Check if notice exists
      const existing = await sql`
        SELECT id, title
        FROM notices
        WHERE id = ${id} AND deleted_at IS NULL
        LIMIT 1
      `;

      if (existing.length === 0) {
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

      // Soft delete (set deleted_at timestamp)
      await sql`
        UPDATE notices
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${id}
      `;

      // Create audit log
      await auditDelete(
        user.userId,
        'notices',
        id,
        {
          id: existing[0].id,
          title: existing[0].title,
        },
        request
      );

      return NextResponse.json(
        {
          success: true,
          message: '공지사항이 삭제되었습니다',
        },
        { status: 200 }
      );
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
