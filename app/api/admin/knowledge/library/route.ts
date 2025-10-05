/**
 * Admin Knowledge Library API - Database Implementation
 *
 * Endpoints:
 * - GET /api/admin/knowledge/library - List library items (paginated)
 * - POST /api/admin/knowledge/library - Create new library item
 * - PUT /api/admin/knowledge/library?id={id} - Update library item
 * - DELETE /api/admin/knowledge/library?id={id} - Delete library item
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 * Database: Neon PostgreSQL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// Validation Schemas
// ============================================================

const LibraryItemCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.enum(['TECHNICAL', 'GUIDE', 'NEWS', 'CASE_STUDY', 'TUTORIAL', 'WHITEPAPER', 'REPORT', 'RESEARCH']),
  fileType: z.enum(['PDF', 'DOCX', 'XLSX', 'PPTX']),
  fileSize: z.string().min(1),
  fileUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).min(1),
});

const LibraryItemUpdateSchema = LibraryItemCreateSchema.partial();

// ============================================================
// Helper: Generate slug from title
// ============================================================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 200) + '-' + Date.now().toString(36);
}

// ============================================================
// GET /api/admin/knowledge/library - List library items
// ============================================================

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
      const category = searchParams.get('category');
      const fileType = searchParams.get('fileType');
      const search = searchParams.get('search');

      if (page < 1 || isNaN(page)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PAGE', message: 'Page number must be >= 1' } },
          { status: 400 }
        );
      }

      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];

      if (category) {
        conditions.push(`category = $${params.length + 1}`);
        params.push(category);
      }

      if (fileType) {
        conditions.push(`file_type = $${params.length + 1}`);
        params.push(fileType);
      }

      if (search) {
        conditions.push(`title ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total using sql.query()
      const countQuery = `SELECT COUNT(*) as total FROM libraries ${whereClause}`;
      const countResult = await sql.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total, 10);

      // Get paginated items using sql.query()
      const offset = (page - 1) * per_page;
      const itemsQuery = `
        SELECT *
        FROM libraries
        ${whereClause}
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(per_page, offset);

      const itemsResult = await sql.query(itemsQuery, params);

      // Transform to camelCase
      const transformedItems = itemsResult.rows.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        fileType: item.file_type,
        fileSize: item.file_size,
        fileUrl: item.file_url,
        thumbnailUrl: item.thumbnail_url,
        tags: item.tags || [],
        downloadCount: item.download_count,
        publishedAt: item.published_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return NextResponse.json({
        success: true,
        data: transformedItems,
        meta: {
          page,
          perPage: per_page,
          total,
          totalPages: Math.ceil(total / per_page),
        },
      });
    } catch (error) {
      console.error('[GET /api/admin/knowledge/library] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// POST /api/admin/knowledge/library - Create library item
// ============================================================

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const validationResult = LibraryItemCreateSchema.safeParse(body);

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
      const id = randomUUID();
      const slug = generateSlug(validated.title);

      // Insert new item using tagged template with explicit UUID
      const newItem = await sql`
        INSERT INTO libraries (
          id, title, slug, description, category, file_type, file_size, file_url,
          thumbnail_url, tags, author_id, status, published_at
        ) VALUES (
          ${id}, ${validated.title}, ${slug}, ${validated.description}, ${validated.category},
          ${validated.fileType}, ${validated.fileSize}, ${validated.fileUrl},
          ${validated.thumbnailUrl || null}, ${validated.tags}, ${user.userId}, 'PUBLISHED', NOW()
        )
        RETURNING *
      `;

      const created = newItem[0];

      return NextResponse.json(
        {
          success: true,
          data: {
            id: created.id,
            title: created.title,
            description: created.description,
            category: created.category,
            fileType: created.file_type,
            fileSize: created.file_size,
            fileUrl: created.file_url,
            thumbnailUrl: created.thumbnail_url,
            tags: created.tags,
            downloadCount: created.download_count,
            publishedAt: created.published_at,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/admin/knowledge/library] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// PUT /api/admin/knowledge/library - Update library item
// ============================================================

export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Library item ID is required' } },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validationResult = LibraryItemUpdateSchema.safeParse(body);

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

      // Check if item exists
      const existingResult = await sql.query('SELECT id FROM libraries WHERE id = $1', [id]);
      if (existingResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Library item not found' } },
          { status: 404 }
        );
      }

      // Build UPDATE query dynamically
      const updates: string[] = [];
      const params: any[] = [];

      if (validated.title !== undefined) {
        updates.push(`title = $${params.length + 1}`);
        params.push(validated.title);
        const newSlug = generateSlug(validated.title);
        updates.push(`slug = $${params.length + 1}`);
        params.push(newSlug);
      }
      if (validated.description !== undefined) {
        updates.push(`description = $${params.length + 1}`);
        params.push(validated.description);
      }
      if (validated.category !== undefined) {
        updates.push(`category = $${params.length + 1}`);
        params.push(validated.category);
      }
      if (validated.fileType !== undefined) {
        updates.push(`file_type = $${params.length + 1}`);
        params.push(validated.fileType);
      }
      if (validated.fileSize !== undefined) {
        updates.push(`file_size = $${params.length + 1}`);
        params.push(validated.fileSize);
      }
      if (validated.fileUrl !== undefined) {
        updates.push(`file_url = $${params.length + 1}`);
        params.push(validated.fileUrl);
      }
      if (validated.thumbnailUrl !== undefined) {
        updates.push(`thumbnail_url = $${params.length + 1}`);
        params.push(validated.thumbnailUrl);
      }
      if (validated.tags !== undefined) {
        updates.push(`tags = $${params.length + 1}`);
        params.push(validated.tags);
      }

      updates.push(`updated_at = NOW()`);

      const updateQuery = `
        UPDATE libraries
        SET ${updates.join(', ')}
        WHERE id = $${params.length + 1}
        RETURNING *
      `;
      params.push(id);

      const updatedResult = await sql.query(updateQuery, params);
      const result = updatedResult.rows[0];

      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          title: result.title,
          description: result.description,
          category: result.category,
          fileType: result.file_type,
          fileSize: result.file_size,
          fileUrl: result.file_url,
          thumbnailUrl: result.thumbnail_url,
          tags: result.tags,
          downloadCount: result.download_count,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        },
      });
    } catch (error) {
      console.error('[PUT /api/admin/knowledge/library] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// DELETE /api/admin/knowledge/library - Delete library item
// ============================================================

export const DELETE = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Library item ID is required' } },
          { status: 400 }
        );
      }

      // Check if item exists
      const existingResult = await sql.query('SELECT id FROM libraries WHERE id = $1', [id]);
      if (existingResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Library item not found' } },
          { status: 404 }
        );
      }

      // Delete item
      await sql.query('DELETE FROM libraries WHERE id = $1', [id]);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[DELETE /api/admin/knowledge/library] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
