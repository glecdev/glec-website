/**
 * Admin Popups Reorder API
 *
 * Purpose: 팝업 레이어 순서 변경 (Drag & Drop)
 * Method: POST
 * Body: { popups: Array<{ id: string, zIndex: number }> }
 */

import { NextRequest, NextResponse } from 'next/server';

// Import from parent route (임시 - 실제는 DB 사용)
// TODO: 실제 구현 시 Database에서 가져오기

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { popups } = body; // Array<{ id: string, zIndex: number }>

    if (!Array.isArray(popups)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'popups 배열이 필요합니다.' },
        },
        { status: 400 }
      );
    }

    // TODO: 실제 구현
    // 각 팝업의 zIndex 업데이트
    // for (const { id, zIndex } of popups) {
    //   await db.popup.update({ where: { id }, data: { zIndex } });
    // }

    console.log('[POST /api/admin/popups/reorder] Updated z-index for popups:', popups);

    return NextResponse.json({
      success: true,
      data: { updated: popups.length },
      message: `${popups.length}개 팝업 순서가 변경되었습니다.`,
    });
  } catch (error) {
    console.error('[POST /api/admin/popups/reorder] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '순서 변경에 실패했습니다.' },
      },
      { status: 500 }
    );
  }
}
