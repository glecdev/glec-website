/**
 * GET    /api/admin/library/items/[id] - Get single item
 * PUT    /api/admin/library/items/[id] - Update item
 * DELETE /api/admin/library/items/[id] - Delete item
 *
 * Admin API for Library Items CRUD
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

// ====================================================================
// Types & Schemas
// ====================================================================

const LibraryItemUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  file_type: z.enum(['PDF', 'DOCX', 'XLSX', 'PPTX', 'VIDEO', 'OTHER']).optional(),
  file_size_mb: z.number().positive().optional(),
  file_url: z.string().url().optional(),
  download_type: z.enum(['EMAIL', 'DIRECT', 'GOOGLE_DRIVE']).optional(),
  category: z.enum(['FRAMEWORK', 'WHITEPAPER', 'CASE_STUDY', 'DATASHEET', 'OTHER']).optional(),
  tags: z.array(z.string()).optional(),
  language: z.enum(['ko', 'en']).optional(),
  version: z.string().optional(),
  requires_form: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

type RouteContext = {
  params: { id: string };
};

// ====================================================================
// GET /api/admin/library/items/[id] - Get single item
// ====================================================================

export async function GET(req: NextRequest, { params }: RouteContext) {
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

    const items = await sql`
      SELECT * FROM library_items WHERE id = ${id} LIMIT 1
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

    return NextResponse.json({
      success: true,
      data: items[0],
    });
  } catch (error: any) {
    console.error('[Admin Library Item GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// PUT /api/admin/library/items/[id] - Update item
// ====================================================================

export async function PUT(req: NextRequest, { params }: RouteContext) {
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

    // Parse and validate request body
    const body = await req.json();
    const data = LibraryItemUpdateSchema.parse(body);

    // Check if item exists
    const existingItems = await sql`
      SELECT * FROM library_items WHERE id = ${id} LIMIT 1
    `;

    if (existingItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Library item을 찾을 수 없습니다' },
        },
        { status: 404 }
      );
    }

    const existingItem = existingItems[0];

    // Check for duplicate slug (if changing slug)
    if (data.slug && data.slug !== existingItem.slug) {
      const duplicateItems = await sql`
        SELECT id FROM library_items WHERE slug = ${data.slug} AND id != ${id} LIMIT 1
      `;

      if (duplicateItems.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_SLUG',
              message: '이미 존재하는 Slug입니다',
            },
          },
          { status: 400 }
        );
      }
    }

    // Check if no fields to update
    if (Object.keys(data).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Library item이 업데이트되었습니다',
        data: existingItem,
      });
    }

    // Auto-update published_at based on status
    const newPublishedAt =
      data.status === 'PUBLISHED' && existingItem.status !== 'PUBLISHED'
        ? new Date().toISOString()
        : data.status && data.status !== 'PUBLISHED'
        ? null
        : existingItem.published_at;

    // Build merged data with existing item
    const merged = {
      title: data.title ?? existingItem.title,
      slug: data.slug ?? existingItem.slug,
      description: data.description ?? existingItem.description,
      file_type: data.file_type ?? existingItem.file_type,
      file_size_mb: data.file_size_mb ?? existingItem.file_size_mb,
      file_url: data.file_url ?? existingItem.file_url,
      download_type: data.download_type ?? existingItem.download_type,
      category: data.category ?? existingItem.category,
      tags: data.tags ?? existingItem.tags,
      language: data.language ?? existingItem.language,
      version: data.version ?? existingItem.version,
      requires_form: data.requires_form ?? existingItem.requires_form,
      status: data.status ?? existingItem.status,
      published_at: newPublishedAt,
    };

    // Execute UPDATE with all fields (Neon requires tagged template)
    const updatedItems = await sql`
      UPDATE library_items
      SET
        title = ${merged.title},
        slug = ${merged.slug},
        description = ${merged.description},
        file_type = ${merged.file_type},
        file_size_mb = ${merged.file_size_mb},
        file_url = ${merged.file_url},
        download_type = ${merged.download_type},
        category = ${merged.category},
        tags = ${merged.tags},
        language = ${merged.language},
        version = ${merged.version},
        requires_form = ${merged.requires_form},
        status = ${merged.status},
        published_at = ${merged.published_at},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Library item이 업데이트되었습니다',
      data: updatedItems[0],
    });
  } catch (error: any) {
    console.error('[Admin Library Item PUT] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// DELETE /api/admin/library/items/[id] - Delete item
// ====================================================================

export async function DELETE(req: NextRequest, { params }: RouteContext) {
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

    // Check if item exists
    const existingItems = await sql`
      SELECT * FROM library_items WHERE id = ${id} LIMIT 1
    `;

    if (existingItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Library item을 찾을 수 없습니다' },
        },
        { status: 404 }
      );
    }

    // Check if item has associated leads
    const leadsCount = await sql`
      SELECT COUNT(*) as count FROM library_leads WHERE library_item_id = ${id}
    `;

    const hasLeads = parseInt(leadsCount[0].count) > 0;

    if (hasLeads) {
      // Soft delete: Change status to ARCHIVED instead of hard delete
      await sql`
        UPDATE library_items
        SET status = 'ARCHIVED', updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({
        success: true,
        message: '연관된 리드가 있어 ARCHIVED 상태로 변경되었습니다',
        data: { id, archived: true },
      });
    }

    // Hard delete: No associated leads
    await sql`
      DELETE FROM library_items WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Library item이 삭제되었습니다',
      data: { id, deleted: true },
    });
  } catch (error: any) {
    console.error('[Admin Library Item DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}
