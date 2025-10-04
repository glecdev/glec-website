/**
 * Admin Popups API Route
 *
 * Purpose: 팝업 관리 (생성, 조회, 수정, 삭제, 순서 변경)
 * Auth: JWT required
 * Data Source: Shared popup-store (same as public API)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PopupStore, Popup } from '../../_shared/popup-store';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


// GET - 모든 팝업 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // TODO: JWT 인증 체크
    // const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    // z-index 순서대로 정렬
    const allPopups = PopupStore.getAll();
    const sortedPopups = [...allPopups].sort((a, b) => b.zIndex - a.zIndex);

    return NextResponse.json({
      success: true,
      data: sortedPopups,
      meta: {
        total: sortedPopups.length,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/popups] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '팝업 조회에 실패했습니다.' },
      },
      { status: 500 }
    );
  }
}

// POST - 팝업 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newPopup = PopupStore.create({
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl || null,
      linkUrl: body.linkUrl || null,
      linkText: body.linkText || null,
      isActive: body.isActive ?? true,
      zIndex: body.zIndex ?? 1000,
      displayType: body.displayType || 'modal',
      position: body.position || 'center',
      width: body.width || 500,
      height: body.height || 600,
      showOnce: body.showOnce ?? false,
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    });

    console.log('[POST /api/admin/popups] Created popup:', {
      id: newPopup.id,
      title: newPopup.title,
      displayType: newPopup.displayType,
    });

    return NextResponse.json({
      success: true,
      data: newPopup,
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/popups] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '팝업 생성에 실패했습니다.' },
      },
      { status: 500 }
    );
  }
}

// PUT - 팝업 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updated = PopupStore.update(id, data);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '팝업을 찾을 수 없습니다.' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[PUT /api/admin/popups] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '팝업 수정에 실패했습니다.' },
      },
      { status: 500 }
    );
  }
}

// DELETE - 팝업 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'ID가 필요합니다.' },
        },
        { status: 400 }
      );
    }

    const deleted = PopupStore.delete(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '팝업을 찾을 수 없습니다.' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('[DELETE /api/admin/popups] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '팝업 삭제에 실패했습니다.' },
      },
      { status: 500 }
    );
  }
}
