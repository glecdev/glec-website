/**
 * Admin Press API - Complete CRUD (Neon PostgreSQL)
 *
 * Based on: GLEC-API-Specification.yaml
 * Requirements:
 * - FR-ADMIN-007: 보도자료 목록 조회
 * - FR-ADMIN-008: 보도자료 작성
 * - FR-ADMIN-009: 보도자료 수정
 * - FR-ADMIN-010: 보도자료 삭제
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 *
 * Endpoints (Query Parameter Pattern - Static Export Compatible):
 * - GET /api/admin/press - 모든 상태의 보도자료 목록
 * - POST /api/admin/press - 새 보도자료 생성
 * - PUT /api/admin/press?id=xxx - 보도자료 수정
 * - DELETE /api/admin/press?id=xxx - 보도자료 삭제 (Soft Delete)
 *
 * Note: Query parameter pattern used instead of dynamic routes (/press/[id])
 * due to Next.js Static Export limitations. This ensures compatibility with
 * Cloudflare Pages deployment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import type { ContentStatus } from '@prisma/client';
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
 * Press Create Schema
 */
const PressCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt must be 300 characters or less').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED'], {
    errorMap: () => ({ message: 'Status must be either DRAFT or PUBLISHED' }),
  }),
  thumbnailUrl: z.string().url('Invalid URL format').or(z.literal('')).optional().nullable(),
  mediaOutlet: z.string().max(100, 'Media outlet must be 100 characters or less').optional().nullable(),
  externalUrl: z.string().url('Invalid URL format').or(z.literal('')).optional().nullable(),
});

type PressCreateInput = z.infer<typeof PressCreateSchema>;

/**
 * Press Update Schema (same as create but all fields optional except ID)
 */
const PressUpdateSchema = PressCreateSchema.partial();

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate slug from title
 * Example: "DHL GoGreen 파트너십" → "dhl-gogreen-partnership"
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
      SELECT id FROM presses
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
// GET /api/admin/press - List all press releases (including DRAFT)
// ============================================================

/**
 * GET /api/admin/press
 *
 * Query Parameters:
 * - page (default: 1)
 * - per_page (default: 20, max: 100)
 * - status (DRAFT, PUBLISHED, ARCHIVED)
 * - search (title search)
 *
 * Response: { success: true, data: Press[], meta: PaginationMeta }
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      // If ID is provided, return single press release (Query Parameter Pattern)
      if (id) {
        const presses = await sql`
          SELECT
            id, title, slug, content, excerpt, status,
            thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM presses
          WHERE id = ${id}
          LIMIT 1
        `;

        if (presses.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'NOT_FOUND',
                message: '보도자료를 찾을 수 없습니다',
              },
            },
            { status: 404 }
          );
        }

        const press = presses[0];

        return NextResponse.json(
          {
            success: true,
            data: {
              id: press.id,
              title: press.title,
              slug: press.slug,
              content: press.content,
              excerpt: press.excerpt,
              status: press.status,
              thumbnailUrl: press.thumbnail_url,
              mediaOutlet: press.media_outlet,
              externalUrl: press.external_url,
              viewCount: press.view_count,
              publishedAt: press.published_at,
              authorId: press.author_id,
              createdAt: press.created_at,
              updatedAt: press.updated_at,
              deletedAt: press.deleted_at,
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

      if (status && search) {
        // Both filters
        const searchPattern = `%${search}%`;
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM presses
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status,
            thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM presses
          WHERE deleted_at IS NULL
            AND status = ${status}
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (status) {
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM presses
          WHERE deleted_at IS NULL
            AND status = ${status}
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status,
            thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM presses
          WHERE deleted_at IS NULL
            AND status = ${status}
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT ${per_page}
          OFFSET ${(page - 1) * per_page}
        `;
      } else if (search) {
        const searchPattern = `%${search}%`;
        countQuery = sql`
          SELECT COUNT(*) as count
          FROM presses
          WHERE deleted_at IS NULL
            AND (title ILIKE ${searchPattern} OR content ILIKE ${searchPattern})
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status,
            thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM presses
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
          FROM presses
          WHERE deleted_at IS NULL
        `;
        dataQuery = sql`
          SELECT
            id, title, slug, content, excerpt, status,
            thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
            created_at, updated_at, deleted_at
          FROM presses
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

      const presses = await dataQuery;

      // Transform to camelCase
      const transformedPresses = presses.map((press: any) => ({
        id: press.id,
        title: press.title,
        slug: press.slug,
        content: press.content,
        excerpt: press.excerpt,
        status: press.status,
        thumbnailUrl: press.thumbnail_url,
        mediaOutlet: press.media_outlet,
        externalUrl: press.external_url,
        viewCount: press.view_count,
        publishedAt: press.published_at,
        authorId: press.author_id,
        createdAt: press.created_at,
        updatedAt: press.updated_at,
        deletedAt: press.deleted_at,
      }));

      return NextResponse.json(
        {
          success: true,
          data: transformedPresses,
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
      console.error('[GET /api/admin/press] Error:', error);
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
// POST /api/admin/press - Create new press release
// ============================================================

/**
 * POST /api/admin/press
 *
 * Request Body:
 * {
 *   title: string (1-200 chars),
 *   content: string (HTML),
 *   excerpt?: string (max 300 chars),
 *   status: "DRAFT" | "PUBLISHED",
 *   thumbnailUrl?: string (URL),
 *   mediaOutlet?: string (max 100 chars),
 *   externalUrl?: string (URL)
 * }
 *
 * Auto-generated fields:
 * - slug: from title (unique)
 * - authorId: current user ID
 * - publishedAt: now (if status === PUBLISHED)
 *
 * Response: { success: true, data: Press }
 */
export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      // Parse request body
      const body = await request.json();

      // Validate input
      const validation = PressCreateSchema.safeParse(body);
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
        INSERT INTO presses (
          id, title, slug, content, excerpt, status,
          thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
          created_at, updated_at
        )
        VALUES (
          ${newId},
          ${input.title},
          ${slug},
          ${input.content},
          ${excerpt},
          ${input.status},
          ${input.thumbnailUrl || null},
          ${input.mediaOutlet || null},
          ${input.externalUrl || null},
          0,
          ${publishedAt},
          ${user.userId},
          NOW(),
          NOW()
        )
        RETURNING
          id, title, slug, content, excerpt, status,
          thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
          created_at, updated_at
      `;

      const press = result[0];

      // Create audit log
      await auditCreate(
        user.userId,
        'press',
        press.id,
        {
          title: press.title,
          slug: press.slug,
          status: press.status,
          mediaOutlet: press.media_outlet,
        },
        request
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            id: press.id,
            title: press.title,
            slug: press.slug,
            content: press.content,
            excerpt: press.excerpt,
            status: press.status,
            thumbnailUrl: press.thumbnail_url,
            mediaOutlet: press.media_outlet,
            externalUrl: press.external_url,
            viewCount: press.view_count,
            publishedAt: press.published_at,
            authorId: press.author_id,
            createdAt: press.created_at,
            updatedAt: press.updated_at,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/admin/press] Error:', error);
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
// PUT /api/admin/press?id=xxx - Update existing press release
// ============================================================

/**
 * PUT /api/admin/press?id=xxx
 *
 * Query Parameters:
 * - id: string (UUID) - required
 *
 * Request Body (all fields optional):
 * {
 *   title?: string (1-200 chars),
 *   content?: string (HTML),
 *   excerpt?: string (max 300 chars),
 *   status?: "DRAFT" | "PUBLISHED",
 *   thumbnailUrl?: string (URL),
 *   mediaOutlet?: string (max 100 chars),
 *   externalUrl?: string (URL)
 * }
 *
 * Response: { success: true, data: Press }
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
              message: 'Press ID is required',
            },
          },
          { status: 400 }
        );
      }

      // Check if press release exists
      const existing = await sql`
        SELECT id, title, slug, status, media_outlet
        FROM presses
        WHERE id = ${id} AND deleted_at IS NULL
        LIMIT 1
      `;

      if (existing.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '보도자료를 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      // Parse request body
      const body = await request.json();

      // Validate input
      const validation = PressUpdateSchema.safeParse(body);
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

      // Update press release
      const result = await sql`
        UPDATE presses
        SET
          title = COALESCE(${input.title}, title),
          slug = ${slug},
          content = COALESCE(${input.content}, content),
          excerpt = COALESCE(${input.excerpt}, excerpt),
          status = COALESCE(${input.status}, status),
          thumbnail_url = COALESCE(${input.thumbnailUrl}, thumbnail_url),
          media_outlet = COALESCE(${input.mediaOutlet}, media_outlet),
          external_url = COALESCE(${input.externalUrl}, external_url),
          published_at = COALESCE(${publishedAt}, published_at),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING
          id, title, slug, content, excerpt, status,
          thumbnail_url, media_outlet, external_url, view_count, published_at, author_id,
          created_at, updated_at
      `;

      const press = result[0];

      // Create audit log with before/after diff
      await auditUpdate(
        user.userId,
        'press',
        press.id,
        {
          title: existing[0].title,
          slug: existing[0].slug,
          status: existing[0].status,
          mediaOutlet: existing[0].media_outlet,
        },
        {
          title: press.title,
          slug: press.slug,
          status: press.status,
          mediaOutlet: press.media_outlet,
        },
        request
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            id: press.id,
            title: press.title,
            slug: press.slug,
            content: press.content,
            excerpt: press.excerpt,
            status: press.status,
            thumbnailUrl: press.thumbnail_url,
            mediaOutlet: press.media_outlet,
            externalUrl: press.external_url,
            viewCount: press.view_count,
            publishedAt: press.published_at,
            authorId: press.author_id,
            createdAt: press.created_at,
            updatedAt: press.updated_at,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('[PUT /api/admin/press] Error:', error);
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
// DELETE /api/admin/press?id=xxx - Soft delete press release
// ============================================================

/**
 * DELETE /api/admin/press?id=xxx
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
              message: 'Press ID is required',
            },
          },
          { status: 400 }
        );
      }

      // Check if press release exists
      const existing = await sql`
        SELECT id, title, media_outlet
        FROM presses
        WHERE id = ${id} AND deleted_at IS NULL
        LIMIT 1
      `;

      if (existing.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '보도자료를 찾을 수 없습니다',
            },
          },
          { status: 404 }
        );
      }

      // Soft delete (set deleted_at timestamp)
      await sql`
        UPDATE presses
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${id}
      `;

      // Create audit log
      await auditDelete(
        user.userId,
        'press',
        id,
        {
          id: existing[0].id,
          title: existing[0].title,
          mediaOutlet: existing[0].media_outlet,
        },
        request
      );

      return NextResponse.json(
        {
          success: true,
          message: '보도자료가 삭제되었습니다',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('[DELETE /api/admin/press] Error:', error);
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
