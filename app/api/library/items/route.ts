/**
 * GET /api/library/items
 *
 * 공개된 라이브러리 자료 목록 조회 (PUBLISHED only)
 *
 * Query Parameters:
 * - category: FRAMEWORK | WHITEPAPER | CASE_STUDY | DATASHEET | ALL
 * - page: number (default: 1)
 * - per_page: number (default: 20, max: 100)
 * - sort: download_count_desc | published_at_desc (default: published_at_desc)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  file_type: string;
  file_size_mb: number;
  download_type: string;
  category: string;
  tags: string[];
  language: string;
  version: string;
  requires_form: boolean;
  download_count: number;
  view_count: number;
  published_at: string;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category') || 'ALL';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const per_page = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20')));
    const sort = searchParams.get('sort') || 'published_at_desc';

    // 2. Build WHERE clause
    let whereClause = "status = 'PUBLISHED'";
    const params: any[] = [];

    if (category !== 'ALL') {
      params.push(category);
      whereClause += ` AND category = $${params.length}`;
    }

    // 3. Build ORDER BY clause
    let orderBy = 'published_at DESC';
    if (sort === 'download_count_desc') {
      orderBy = 'download_count DESC, published_at DESC';
    } else if (sort === 'published_at_desc') {
      orderBy = 'published_at DESC';
    }

    // 4. Calculate offset
    const offset = (page - 1) * per_page;
    params.push(per_page, offset);

    // 5. Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM library_items
      WHERE ${sql.unsafe(whereClause)}
    `;
    const total = parseInt(countResult[0].total);

    // 6. Get items
    const items = await sql`
      SELECT
        id,
        title,
        slug,
        description,
        file_type,
        file_size_mb,
        download_type,
        category,
        tags,
        language,
        version,
        requires_form,
        download_count,
        view_count,
        published_at
      FROM library_items
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY ${sql.unsafe(orderBy)}
      LIMIT ${per_page}
      OFFSET ${offset}
    `;

    // 7. Return response
    return NextResponse.json({
      success: true,
      data: items as LibraryItem[],
      meta: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
        category,
        sort,
      },
    });
  } catch (error) {
    console.error('[Library Items] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
