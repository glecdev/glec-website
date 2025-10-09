/**
 * Admin Popups API Route
 *
 * Purpose: 팝업 관리 (생성, 조회, 수정, 삭제)
 * Auth: JWT required (CONTENT_MANAGER role)
 * Data Source: Neon PostgreSQL (popups table)
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-ADMIN-006)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import type { PopupDisplayType } from '@prisma/client';

const sql = neon(process.env.DATABASE_URL!);

// ============================================
// VALIDATION SCHEMAS
// ============================================

const PopupCreateSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(255, '제목은 최대 255자입니다'),
  content: z.string().optional().nullable(),
  imageUrl: z.string().url('유효한 URL이 아닙니다').or(z.literal('')).optional().nullable(),
  linkUrl: z.string().url('유효한 URL이 아닙니다').or(z.literal('')).optional().nullable(),
  displayType: z.enum(['MODAL', 'BANNER', 'CORNER']).default('MODAL'),
  isActive: z.boolean().default(false),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  zIndex: z.number().int().min(0).max(9999).default(1000),
  showOncePerDay: z.boolean().default(true),
  position: z.string().optional().nullable(), // JSON: {top, right, bottom, left}
  size: z.string().optional().nullable(), // JSON: {width, height}
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '유효한 색상 코드가 아닙니다').default('#ffffff'),
});

const PopupUpdateSchema = PopupCreateSchema.partial();

// ============================================
// HELPER FUNCTIONS
// ============================================

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
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// GET - List all popups (including inactive for admin)
// ============================================
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '100', 10), 100);
      const is_active = searchParams.get('is_active'); // 'true' | 'false' | null

      if (page < 1 || isNaN(page)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PAGE', message: 'Page number must be >= 1' } },
          { status: 400 }
        );
      }

      // Count total and fetch popups based on is_active filter
      let countResult;
      let popups;
      const offset = (page - 1) * per_page;

      if (is_active === 'true') {
        countResult = await sql`
          SELECT COUNT(*) as total
          FROM popups
          WHERE deleted_at IS NULL AND is_active = true
        `;
        popups = await sql`
          SELECT
            id, title, content, image_url, link_url, display_type,
            is_active, start_date, end_date, z_index, show_once_per_day,
            position, size, background_color, deleted_at, created_at, updated_at
          FROM popups
          WHERE deleted_at IS NULL AND is_active = true
          ORDER BY z_index DESC, created_at DESC
          LIMIT ${per_page}
          OFFSET ${offset}
        `;
      } else if (is_active === 'false') {
        countResult = await sql`
          SELECT COUNT(*) as total
          FROM popups
          WHERE deleted_at IS NULL AND is_active = false
        `;
        popups = await sql`
          SELECT
            id, title, content, image_url, link_url, display_type,
            is_active, start_date, end_date, z_index, show_once_per_day,
            position, size, background_color, deleted_at, created_at, updated_at
          FROM popups
          WHERE deleted_at IS NULL AND is_active = false
          ORDER BY z_index DESC, created_at DESC
          LIMIT ${per_page}
          OFFSET ${offset}
        `;
      } else {
        countResult = await sql`
          SELECT COUNT(*) as total
          FROM popups
          WHERE deleted_at IS NULL
        `;
        popups = await sql`
          SELECT
            id, title, content, image_url, link_url, display_type,
            is_active, start_date, end_date, z_index, show_once_per_day,
            position, size, background_color, deleted_at, created_at, updated_at
          FROM popups
          WHERE deleted_at IS NULL
          ORDER BY z_index DESC, created_at DESC
          LIMIT ${per_page}
          OFFSET ${offset}
        `;
      }

      const total = parseInt(countResult[0]?.total || '0', 10);

      const transformedPopups = popups.map(transformPopupToResponse);

      return NextResponse.json({
        success: true,
        data: transformedPopups,
        meta: {
          page,
          perPage: per_page,
          total,
          totalPages: Math.ceil(total / per_page),
        },
      });
    } catch (error) {
      console.error('[GET /api/admin/popups] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================
// POST - Create new popup
// ============================================
export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const validation = PopupCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const input = validation.data;

      // Insert popup
      const result = await sql`
        INSERT INTO popups (
          title, content, image_url, link_url, display_type,
          is_active, start_date, end_date, z_index, show_once_per_day,
          position, size, background_color, created_at, updated_at
        ) VALUES (
          ${input.title},
          ${input.content || null},
          ${input.imageUrl || null},
          ${input.linkUrl || null},
          ${input.displayType as PopupDisplayType},
          ${input.isActive},
          ${input.startDate || null},
          ${input.endDate || null},
          ${input.zIndex},
          ${input.showOncePerDay},
          ${input.position || null},
          ${input.size || null},
          ${input.backgroundColor},
          NOW(),
          NOW()
        )
        RETURNING
          id, title, content, image_url, link_url, display_type,
          is_active, start_date, end_date, z_index, show_once_per_day,
          position, size, background_color, deleted_at, created_at, updated_at
      `;

      const popup = transformPopupToResponse(result[0]);

      console.log('[POST /api/admin/popups] Created popup:', {
        id: popup.id,
        title: popup.title,
        displayType: popup.displayType,
        userId: user.id,
      });

      return NextResponse.json(
        { success: true, data: popup },
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/admin/popups] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================
// PUT - Update existing popup
// ============================================
export const PUT = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, ...data } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Popup ID is required' } },
          { status: 400 }
        );
      }

      const validation = PopupUpdateSchema.safeParse(data);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const input = validation.data;

      // Check if popup exists and is not deleted
      const existing = await sql`
        SELECT id FROM popups WHERE id = ${id} AND deleted_at IS NULL
      `;

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Popup not found' } },
          { status: 404 }
        );
      }

      // Update popup (only provided fields using COALESCE)
      const result = await sql`
        UPDATE popups
        SET
          title = COALESCE(${input.title || null}, title),
          content = COALESCE(${input.content !== undefined ? input.content : null}, content),
          image_url = COALESCE(${input.imageUrl !== undefined ? input.imageUrl : null}, image_url),
          link_url = COALESCE(${input.linkUrl !== undefined ? input.linkUrl : null}, link_url),
          display_type = COALESCE(${input.displayType || null}, display_type),
          is_active = COALESCE(${input.isActive !== undefined ? input.isActive : null}, is_active),
          start_date = COALESCE(${input.startDate !== undefined ? input.startDate : null}, start_date),
          end_date = COALESCE(${input.endDate !== undefined ? input.endDate : null}, end_date),
          z_index = COALESCE(${input.zIndex !== undefined ? input.zIndex : null}, z_index),
          show_once_per_day = COALESCE(${input.showOncePerDay !== undefined ? input.showOncePerDay : null}, show_once_per_day),
          position = COALESCE(${input.position !== undefined ? input.position : null}, position),
          size = COALESCE(${input.size !== undefined ? input.size : null}, size),
          background_color = COALESCE(${input.backgroundColor || null}, background_color),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING
          id, title, content, image_url, link_url, display_type,
          is_active, start_date, end_date, z_index, show_once_per_day,
          position, size, background_color, deleted_at, created_at, updated_at
      `;

      const popup = transformPopupToResponse(result[0]);

      console.log('[PUT /api/admin/popups] Updated popup:', {
        id: popup.id,
        title: popup.title,
        userId: user.id,
      });

      return NextResponse.json({ success: true, data: popup });
    } catch (error) {
      console.error('[PUT /api/admin/popups] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================
// DELETE - Soft delete popup
// ============================================
export const DELETE = withAuth(
  async (request: NextRequest, { user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Popup ID is required' } },
          { status: 400 }
        );
      }

      // Check if popup exists and is not already deleted
      const existing = await sql`
        SELECT id FROM popups WHERE id = ${id} AND deleted_at IS NULL
      `;

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Popup not found' } },
          { status: 404 }
        );
      }

      // Soft delete
      await sql`
        UPDATE popups
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('[DELETE /api/admin/popups] Soft deleted popup:', {
        id,
        userId: user.id,
      });

      return NextResponse.json({
        success: true,
        data: { id },
      });
    } catch (error) {
      console.error('[DELETE /api/admin/popups] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
