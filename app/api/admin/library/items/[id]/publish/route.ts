/**
 * PATCH /api/admin/library/items/[id]/publish
 *
 * Toggle publish status (DRAFT <-> PUBLISHED)
 *
 * Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

type RouteContext = {
  params: { id: string };
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;

    // Validate UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_ID', message: '유효하지 않은 ID입니다' },
        },
        { status: 400 }
      );
    }

    // Get current item
    const items = await sql`
      SELECT id, status FROM library_items WHERE id = ${id} LIMIT 1
    `;

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Library item을 찾을 수 없습니다' },
        },
        { status: 404 }
      );
    }

    const item = items[0];

    // Toggle status
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const newPublishedAt = newStatus === 'PUBLISHED' ? new Date().toISOString() : null;

    // Update status
    const updatedItems = await sql`
      UPDATE library_items
      SET status = ${newStatus},
          published_at = ${newPublishedAt},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: `Library item이 ${newStatus === 'PUBLISHED' ? '게시' : '게시 취소'}되었습니다`,
      data: updatedItems[0],
    });
  } catch (error: any) {
    console.error('[Admin Library Item Publish] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}
