/**
 * Admin Knowledge Videos API - Database Implementation
 *
 * Endpoints:
 * - GET /api/admin/knowledge/videos - List videos (paginated)
 * - POST /api/admin/knowledge/videos - Create new video
 * - PUT /api/admin/knowledge/videos?id={id} - Update video
 * - DELETE /api/admin/knowledge/videos?id={id} - Delete video
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 * Database: Neon PostgreSQL (videos table)
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

const VideoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.string().regex(/^\d+:\d{2}$/, 'Duration must be in format MM:SS'),
  category: z.enum(['TECHNICAL', 'GUIDE', 'TUTORIAL', 'WEBINAR', 'CASE_STUDY', 'PRODUCT_DEMO']),
  tags: z.array(z.string()).min(1),
});

const VideoUpdateSchema = VideoCreateSchema.partial();

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
// Helper: Extract YouTube video ID from URL
// ============================================================

function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^?&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return 'unknown';
}

// ============================================================
// GET /api/admin/knowledge/videos - List videos
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

      // Note: Videos table doesn't have a category column, so we filter by tab instead
      // Map Knowledge categories to video tabs
      if (category) {
        conditions.push(`tab = $${params.length + 1}`);
        params.push('전체'); // Default to "전체" tab for now
      }

      if (search) {
        conditions.push(`title ILIKE $${params.length + 1}`);
        params.push(`%${search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total using sql.query() - returns array directly
      const countQuery = `SELECT COUNT(*) as total FROM videos ${whereClause}`;
      const countResult = await sql.query(countQuery, params);
      const total = parseInt(countResult[0].total, 10);

      // Get paginated items using sql.query() - returns array directly
      const offset = (page - 1) * per_page;
      const itemsQuery = `
        SELECT *
        FROM videos
        ${whereClause}
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      params.push(per_page, offset);

      const items = await sql.query(itemsQuery, params);

      // Transform to Knowledge Video format
      const transformedItems = items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        videoUrl: item.youtube_url,
        thumbnailUrl: item.thumbnail_url,
        duration: item.duration || '0:00',
        category: 'TUTORIAL', // Default category since videos table doesn't have this
        tags: [], // Videos table doesn't have tags
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
      console.error('[GET /api/admin/knowledge/videos] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// POST /api/admin/knowledge/videos - Create video
// ============================================================

export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const validationResult = VideoCreateSchema.safeParse(body);

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
      const youtubeVideoId = extractYouTubeId(validated.videoUrl);

      // Insert new video with explicit UUID
      const newItem = await sql`
        INSERT INTO videos (
          id, title, slug, description, youtube_url, youtube_video_id, thumbnail_url,
          duration, tab, author_id, status, published_at
        ) VALUES (
          ${id}, ${validated.title}, ${slug}, ${validated.description}, ${validated.videoUrl},
          ${youtubeVideoId}, ${validated.thumbnailUrl || `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`},
          ${validated.duration}, '전체', ${user.userId}, 'PUBLISHED', NOW()
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
            videoUrl: created.youtube_url,
            thumbnailUrl: created.thumbnail_url,
            duration: created.duration,
            category: 'TUTORIAL',
            tags: [],
            viewCount: created.view_count,
            publishedAt: created.published_at,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/admin/knowledge/videos] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// PUT /api/admin/knowledge/videos - Update video
// ============================================================

export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Video ID is required' } },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validationResult = VideoUpdateSchema.safeParse(body);

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
      const existing = await sql.query('SELECT id FROM videos WHERE id = $1', [id]);
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Video not found' } },
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
      if (validated.videoUrl !== undefined) {
        updates.push(`youtube_url = $${params.length + 1}`);
        params.push(validated.videoUrl);
        const newVideoId = extractYouTubeId(validated.videoUrl);
        updates.push(`youtube_video_id = $${params.length + 1}`);
        params.push(newVideoId);
      }
      if (validated.thumbnailUrl !== undefined) {
        updates.push(`thumbnail_url = $${params.length + 1}`);
        params.push(validated.thumbnailUrl);
      }
      if (validated.duration !== undefined) {
        updates.push(`duration = $${params.length + 1}`);
        params.push(validated.duration);
      }

      updates.push(`updated_at = NOW()`);

      const updateQuery = `
        UPDATE videos
        SET ${updates.join(', ')}
        WHERE id = $${params.length + 1}
        RETURNING *
      `;
      params.push(id);

      const updated = await sql.query(updateQuery, params);
      const result = updated[0];

      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          title: result.title,
          description: result.description,
          videoUrl: result.youtube_url,
          thumbnailUrl: result.thumbnail_url,
          duration: result.duration,
          category: 'TUTORIAL',
          tags: [],
          viewCount: result.view_count,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        },
      });
    } catch (error) {
      console.error('[PUT /api/admin/knowledge/videos] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// DELETE /api/admin/knowledge/videos - Delete video
// ============================================================

export const DELETE = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Video ID is required' } },
          { status: 400 }
        );
      }

      // Check if item exists
      const existing = await sql.query('SELECT id FROM videos WHERE id = $1', [id]);
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Video not found' } },
          { status: 404 }
        );
      }

      // Delete item
      await sql.query('DELETE FROM videos WHERE id = $1', [id]);

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[DELETE /api/admin/knowledge/videos] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
