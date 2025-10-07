/**
 * Popups API Route - GET (Public)
 *
 * Purpose: 활성화된 팝업 목록 조회 (웹사이트용)
 * Standards: GLEC-API-Specification.yaml
 * Data Source: Neon PostgreSQL (popups table)
 * Security: Public access (no auth required)
 * Filter: Only is_active=true and within date range
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Transform database row (snake_case) to API response (camelCase)
 */
function transformPopupToResponse(row: any) {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    displayType: row.display_type,
    isActive: row.is_active,
    startDate: row.start_date,
    endDate: row.end_date,
    zIndex: row.z_index,
    showOncePerDay: row.show_once_per_day,
    position: row.position,
    size: row.size,
    backgroundColor: row.background_color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const now = new Date().toISOString();

    // Get active popups within date range
    // Only return popups where:
    // - is_active = true
    // - deleted_at IS NULL
    // - current date is between start_date and end_date (or dates are null)
    const popups = await sql`
      SELECT
        id, title, content, image_url, link_url, display_type,
        is_active, start_date, end_date, z_index, show_once_per_day,
        position, size, background_color, created_at, updated_at
      FROM popups
      WHERE
        is_active = true
        AND deleted_at IS NULL
        AND (start_date IS NULL OR start_date <= ${now})
        AND (end_date IS NULL OR end_date >= ${now})
      ORDER BY z_index DESC
    `;

    const transformedPopups = popups.map(transformPopupToResponse);

    return NextResponse.json({
      success: true,
      data: transformedPopups,
      meta: {
        total: transformedPopups.length,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('[GET /api/popups] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '팝업 목록 조회에 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
