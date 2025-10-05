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

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM blogs ${whereClause}`;
    const countResult = await sql.query(countQuery, params);
    const total = parseInt(countResult[0].total, 10);

    // Get paginated items
    const offset = (page - 1) * per_page;
    const itemsQuery = `
      SELECT
        id, title, content, excerpt, thumbnail_url, tags,
        view_count, published_at, created_at, updated_at
      FROM blogs
      ${whereClause}
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(per_page, offset);

    const items = await sql.query(itemsQuery, params);

    // Transform to camelCase
    const transformedItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      excerpt: item.excerpt,
      thumbnailUrl: item.thumbnail_url,
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
    console.error('[GET /api/knowledge/blog] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
