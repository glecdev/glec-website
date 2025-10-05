/**
 * Admin Knowledge Blog API - Database Implementation
 *
 * Endpoints:
 * - GET /api/admin/knowledge/blog - List blog posts (paginated)
 * - POST /api/admin/knowledge/blog - Create new blog post
 * - PUT /api/admin/knowledge/blog?id={id} - Update blog post
 * - DELETE /api/admin/knowledge/blog?id={id} - Delete blog post
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 * Database: Neon PostgreSQL (blogs table)
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

const BlogPostCreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(50),
  excerpt: z.string().max(300),
  author: z.string().min(1),
  category: z.enum(['TECHNICAL', 'GUIDE', 'NEWS', 'CASE_STUDY', 'TUTORIAL', 'INDUSTRY_INSIGHTS', 'PRODUCT_UPDATES']),
  tags: z.array(z.string()).min(1),
  thumbnailUrl: z.string().url().optional(),
});

const BlogPostUpdateSchema = BlogPostCreateSchema.partial();

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
// GET /api/admin/knowledge/blog - List blog posts
// ============================================================

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
      const category = searchParams.get('category');
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

      // Note: Blogs table doesn't have a category field in schema, filtering by tags instead
      if (category) {
        conditions.push(`$${params.length + 1} = ANY(tags)`);
        params.push(category);
      }

      if (search) {
        conditions.push(`title ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total using sql.query()
      const countQuery = `SELECT COUNT(*) as total FROM blogs ${whereClause}`;
      const countResult = await sql.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total, 10);

      // Get paginated items using sql.query()
      const offset = (page - 1) * per_page;
      const itemsQuery = `
        SELECT *
        FROM blogs
        ${whereClause}
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(per_page, offset);

      const itemsResult = await sql.query(itemsQuery, params);

      // Transform to Knowledge Blog format
      const transformedItems = itemsResult.rows.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        excerpt: item.excerpt || '',
        author: 'GLEC Team', // Default author since blogs table doesn't have author field
        category: 'TECHNICAL', // Default category
        tags: item.tags || [],
        thumbnailUrl: item.thumbnail_url,
        viewCount: item.view_count,
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
      console.error('[GET /api/admin/knowledge/blog] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// POST /api/admin/knowledge/blog - Create blog post
// ============================================================

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const validationResult = BlogPostCreateSchema.safeParse(body);

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

      // Insert new blog post with explicit UUID
      const newItem = await sql`
        INSERT INTO blogs (
          id, title, slug, content, excerpt, thumbnail_url, tags, author_id, status, published_at
        ) VALUES (
          ${id}, ${validated.title}, ${slug}, ${validated.content}, ${validated.excerpt},
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
            content: created.content,
            excerpt: created.excerpt,
            author: validated.author,
            category: validated.category,
            tags: created.tags,
            thumbnailUrl: created.thumbnail_url,
            viewCount: created.view_count,
            publishedAt: created.published_at,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/admin/knowledge/blog] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// PUT /api/admin/knowledge/blog - Update blog post
// ============================================================

export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Blog post ID is required' } },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validationResult = BlogPostUpdateSchema.safeParse(body);

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
      const existingResult = await sql.query('SELECT id FROM blogs WHERE id = $1', [id]);
      if (existingResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
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
      if (validated.content !== undefined) {
        updates.push(`content = $${params.length + 1}`);
        params.push(validated.content);
      }
      if (validated.excerpt !== undefined) {
        updates.push(`excerpt = $${params.length + 1}`);
        params.push(validated.excerpt);
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
        UPDATE blogs
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
          content: result.content,
          excerpt: result.excerpt,
          author: validated.author || 'GLEC Team',
          category: validated.category || 'TECHNICAL',
          tags: result.tags,
          thumbnailUrl: result.thumbnail_url,
          viewCount: result.view_count,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        },
      });
    } catch (error) {
      console.error('[PUT /api/admin/knowledge/blog] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// DELETE /api/admin/knowledge/blog - Delete blog post
// ============================================================

export const DELETE = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Blog post ID is required' } },
          { status: 400 }
        );
      }

      // Check if item exists
      const existingResult = await sql.query('SELECT id FROM blogs WHERE id = $1', [id]);
      if (existingResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
          { status: 404 }
        );
      }

      // Delete item
      await sql.query('DELETE FROM blogs WHERE id = $1', [id]);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[DELETE /api/admin/knowledge/blog] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
