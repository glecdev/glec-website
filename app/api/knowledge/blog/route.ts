/**
 * Public Knowledge Blog API
 *
 * Endpoint: GET /api/knowledge/blog
 * Purpose: 사용자에게 공개된 블로그 글 목록 제공
 * Security: Public access (no auth required)
 * Filter: Only status='PUBLISHED' items
 *
 * Note: blogs table doesn't have 'category' column
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
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

    if (search) {
      conditions.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${search}%`);
    }

    // Count total
    const offset = (page - 1) * per_page;

    // Build dynamic query using tagged template
    let countResult;
    let items;

    if (search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM blogs
        WHERE status = 'PUBLISHED' AND title ILIKE ${`%${search}%`}
      `;
      items = await sql`
        SELECT
          b.id, b.title, b.slug, b.content, b.excerpt, b.thumbnail_url, b.tags,
          b.view_count, b.reading_time, b.published_at, b.created_at, b.updated_at,
          u.name as author_name
        FROM blogs b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.status = 'PUBLISHED' AND b.title ILIKE ${`%${search}%`}
        ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else {
      countResult = await sql`
        SELECT COUNT(*) as total FROM blogs
        WHERE status = 'PUBLISHED'
      `;
      items = await sql`
        SELECT
          b.id, b.title, b.slug, b.content, b.excerpt, b.thumbnail_url, b.tags,
          b.view_count, b.reading_time, b.published_at, b.created_at, b.updated_at,
          u.name as author_name
        FROM blogs b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.status = 'PUBLISHED'
        ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    }

    const total = parseInt(countResult[0].total, 10);

    // Transform to camelCase
    const transformedItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      content: item.content,
      excerpt: item.excerpt,
      thumbnailUrl: item.thumbnail_url,
      tags: item.tags || [],
      author: item.author_name || 'GLEC', // Default to 'GLEC' if author not found
      authorAvatar: null, // Users table doesn't have profile_image_url column
      readTime: item.reading_time ? `${item.reading_time}분` : '5분', // Format as Korean "X분"
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
    console.error('[GET /api/knowledge/blog] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
