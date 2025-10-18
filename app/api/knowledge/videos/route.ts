/**
 * Public Knowledge Videos API
 *
 * Endpoint: GET /api/knowledge/videos
 * Purpose: 사용자에게 공개된 비디오 목록 제공
 * Security: Public access (no auth required)
 * Database: videos table
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

    // Build WHERE clause
    const category = searchParams.get('category');
    const offset = (page - 1) * per_page;

    // Build dynamic query using tagged template
    let countResult;
    let items;

    if (category && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
        WHERE category = ${category} AND title ILIKE ${`%${search}%`}
      `;
      items = await sql`
        SELECT *
        FROM videos
        WHERE category = ${category} AND title ILIKE ${`%${search}%`}
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (category) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
        WHERE category = ${category}
      `;
      items = await sql`
        SELECT *
        FROM videos
        WHERE category = ${category}
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
        WHERE title ILIKE ${`%${search}%`}
      `;
      items = await sql`
        SELECT *
        FROM videos
        WHERE title ILIKE ${`%${search}%`}
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else {
      countResult = await sql`
        SELECT COUNT(*) as total FROM videos
      `;
      items = await sql`
        SELECT *
        FROM videos
        ORDER BY published_at DESC, created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    }

    const total = parseInt(countResult[0].total, 10);

    // Transform to camelCase
    const transformedItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      youtubeUrl: item.video_url,
      thumbnailUrl: item.thumbnail_url,
      duration: item.duration || '0:00',
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
    console.error('[GET /api/knowledge/videos] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
