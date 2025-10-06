/**
 * Public Knowledge Videos API
 *
 * Endpoint: GET /api/knowledge/videos
 * Purpose: 사용자에게 공개된 비디오 목록 제공
 * Security: Public access (no auth required)
 * Filter: Only status='PUBLISHED' items
 *
 * Note: videos table doesn't have 'category' column
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
    const tab = searchParams.get('tab');
    const search = searchParams.get('search');

    if (page < 1 || isNaN(page)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PAGE', message: 'Page number must be >= 1' } },
        { status: 400 }
      );
    }

    // Build WHERE clause (always filter by PUBLISHED status)
    const conditions: string[] = ["status = 'PUBLISHED'"];
    const params: any[] = [];

    if (tab) {
      conditions.push(`tab = $${params.length + 1}`);
      params.push(tab);
    }

    if (search) {
      conditions.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Count total
    const offset = (page - 1) * per_page;

    // Build dynamic query using tagged template
    let countResult;
    let items;

    if (tab && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
        WHERE status = 'PUBLISHED' AND tab = ${tab} AND title ILIKE ${`%${search}%`}
      `;
      items = await sql`
        SELECT
          id, title, description, youtube_url, youtube_video_id, thumbnail_url,
          duration, tab, view_count, published_at, created_at, updated_at
        FROM videos
        WHERE status = 'PUBLISHED' AND tab = ${tab} AND title ILIKE ${`%${search}%`}
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (tab) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
        WHERE status = 'PUBLISHED' AND tab = ${tab}
      `;
      items = await sql`
        SELECT
          id, title, description, youtube_url, youtube_video_id, thumbnail_url,
          duration, tab, view_count, published_at, created_at, updated_at
        FROM videos
        WHERE status = 'PUBLISHED' AND tab = ${tab}
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
        WHERE status = 'PUBLISHED' AND title ILIKE ${`%${search}%`}
      `;
      items = await sql`
        SELECT
          id, title, description, youtube_url, youtube_video_id, thumbnail_url,
          duration, tab, view_count, published_at, created_at, updated_at
        FROM videos
        WHERE status = 'PUBLISHED' AND title ILIKE ${`%${search}%`}
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
        WHERE status = 'PUBLISHED'
      `;
      items = await sql`
        SELECT
          id, title, description, youtube_url, youtube_video_id, thumbnail_url,
          duration, tab, view_count, published_at, created_at, updated_at
        FROM videos
        WHERE status = 'PUBLISHED'
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    }

    const total = parseInt(countResult[0].total, 10);

    // Transform to camelCase
    const transformedItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      youtubeUrl: item.youtube_url,
      youtubeVideoId: item.youtube_video_id,
      thumbnailUrl: item.thumbnail_url,
      duration: item.duration || '0:00',
      tab: item.tab,
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
    console.error('[GET /api/knowledge/videos] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
