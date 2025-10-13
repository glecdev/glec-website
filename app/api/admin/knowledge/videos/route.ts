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

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://youtu.be/VIDEO_ID?si=SHARE_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
function extractYouTubeId(url: string): string {
  // Try URL parsing first
  try {
    const urlObj = new URL(url);

    // Case 1: youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }

    // Case 2: youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1); // Remove leading '/'
      if (videoId) return videoId;
    }

    // Case 3: youtube.com/embed/VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
      const videoId = urlObj.pathname.slice(7); // Remove '/embed/'
      if (videoId) return videoId;
    }

    // Case 4: youtube.com/v/VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/v/')) {
      const videoId = urlObj.pathname.slice(3); // Remove '/v/'
      if (videoId) return videoId;
    }
  } catch (err) {
    console.warn('[extractYouTubeId] URL parsing failed:', err);
  }

  // Fallback: regex patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  console.error('[extractYouTubeId] Failed to extract video ID from URL:', url);
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

      // Build WHERE clause (using template literals with SQL escaping)
      const conditions: string[] = [];

      if (category) {
        const escapedCategory = category.replace(/'/g, "''");
        conditions.push(`category = '${escapedCategory}'`);
      }

      if (search) {
        const escapedSearch = search.replace(/'/g, "''");
        conditions.push(`title ILIKE '%${escapedSearch}%'`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total
      const countResult = await sql`
        SELECT COUNT(*)::int as total
        FROM knowledge_videos
        ${sql.unsafe(whereClause)}
      `;

      const total = countResult && countResult.length > 0 && countResult[0]?.total != null
        ? parseInt(String(countResult[0].total))
        : 0;

      // Get paginated items
      const offset = (page - 1) * per_page;
      const items = await sql`
        SELECT *
        FROM knowledge_videos
        ${sql.unsafe(whereClause)}
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;

      // Transform to API response format
      const transformedItems = items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        videoUrl: item.video_url,
        thumbnailUrl: item.thumbnail_url,
        duration: item.duration,
        category: item.category,
        tags: item.tags || [],
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
      const youtubeVideoId = extractYouTubeId(validated.videoUrl);

      // Generate thumbnail URL if not provided
      const defaultThumbnail = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;

      // Insert new video
      const newItem = await sql`
        INSERT INTO knowledge_videos (
          title, description, video_url, thumbnail_url,
          duration, category, tags, view_count, published_at
        ) VALUES (
          ${validated.title}, ${validated.description}, ${validated.videoUrl},
          ${validated.thumbnailUrl || defaultThumbnail},
          ${validated.duration}, ${validated.category}, ${validated.tags},
          0, NOW()
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
            videoUrl: created.video_url,
            thumbnailUrl: created.thumbnail_url,
            duration: created.duration,
            category: created.category,
            tags: created.tags,
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
      const existing = await sql`
        SELECT id FROM knowledge_videos WHERE id = ${id}
      `;
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Video not found' } },
          { status: 404 }
        );
      }

      // Build UPDATE query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (validated.title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        values.push(validated.title);
        paramIndex++;
      }
      if (validated.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(validated.description);
        paramIndex++;
      }
      if (validated.videoUrl !== undefined) {
        updates.push(`video_url = $${paramIndex}`);
        values.push(validated.videoUrl);
        paramIndex++;
        // Auto-update thumbnail if not explicitly provided
        if (validated.thumbnailUrl === undefined) {
          const newVideoId = extractYouTubeId(validated.videoUrl);
          const defaultThumbnail = `https://img.youtube.com/vi/${newVideoId}/maxresdefault.jpg`;
          updates.push(`thumbnail_url = $${paramIndex}`);
          values.push(defaultThumbnail);
          paramIndex++;
        }
      }
      if (validated.thumbnailUrl !== undefined) {
        updates.push(`thumbnail_url = $${paramIndex}`);
        values.push(validated.thumbnailUrl);
        paramIndex++;
      }
      if (validated.duration !== undefined) {
        updates.push(`duration = $${paramIndex}`);
        values.push(validated.duration);
        paramIndex++;
      }
      if (validated.category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        values.push(validated.category);
        paramIndex++;
      }
      if (validated.tags !== undefined) {
        updates.push(`tags = $${paramIndex}`);
        values.push(validated.tags);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);

      values.push(id);

      const setClause = updates.join(', ');
      const updateQuery = `UPDATE knowledge_videos SET ${setClause} WHERE id = $${paramIndex} RETURNING *`;

      const updated = await sql.unsafe(updateQuery, values);
      const result = updated[0];

      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          title: result.title,
          description: result.description,
          videoUrl: result.video_url,
          thumbnailUrl: result.thumbnail_url,
          duration: result.duration,
          category: result.category,
          tags: result.tags,
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
      const existing = await sql`
        SELECT id FROM knowledge_videos WHERE id = ${id}
      `;
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Video not found' } },
          { status: 404 }
        );
      }

      // Delete item
      await sql`
        DELETE FROM knowledge_videos WHERE id = ${id}
      `;

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
