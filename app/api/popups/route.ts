/**
 * Popups API Route - GET (Public)
 *
 * Purpose: 활성화된 팝업 목록 조회 (웹사이트용)
 * Standards: GLEC-API-Specification.yaml
 * Data Source: Shared popup-store (same as admin API)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PopupStore } from '../_shared/popup-store';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    // Get active popups from shared store
    const activePopups = PopupStore.getActive();

    return NextResponse.json({
      success: true,
      data: activePopups,
      meta: {
        total: activePopups.length,
        timestamp: new Date().toISOString(),
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
