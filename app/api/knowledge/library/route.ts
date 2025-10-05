/**
 * Public Knowledge Library API
 *
 * Endpoint: GET /api/knowledge/library
 * Purpose: 사용자에게 공개된 라이브러리 목록 제공
 * Security: Public access (no auth required)
 * Filter: Only status='PUBLISHED' items
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
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

    // Build WHERE clause (always filter by PUBLISHED status)
    const conditions: string[] = ["status = 'PUBLISHED'"];
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

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM libraries ${whereClause}`;
    const countResult = await sql.query(countQuery, params);
    const total = parseInt(countResult[0].total, 10);

    // Get paginated items
    const offset = (page - 1) * per_page;
    const itemsQuery = `
      SELECT
        id, title, description, category, file_type, file_size, file_url,
        thumbnail_url, tags, download_count, published_at, created_at, updated_at
      FROM libraries
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
    console.error('[GET /api/knowledge/library] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
