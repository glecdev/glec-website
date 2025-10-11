/**
 * GET /api/admin/library/items
 * POST /api/admin/library/items
 *
 * Admin API for Library Items CRUD
 *
 * Security:
 * - Requires authentication (admin_token in Authorization header)
 * - Only SUPER_ADMIN and CONTENT_MANAGER roles
 *
 * Features:
 * - GET: Returns ALL items (including DRAFT, ARCHIVED)
 * - POST: Create new library item
 * - Supports filters: status, category, search
 * - Pagination: page, per_page
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

// ====================================================================
// Types & Schemas
// ====================================================================

const LibraryItemCreateSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200),
  slug: z.string().min(1, 'Slug를 입력해주세요').max(200).regex(/^[a-z0-9-]+$/, 'Slug는 소문자, 숫자, 하이픈만 사용 가능합니다'),
  description: z.string().optional(),
  file_type: z.enum(['PDF', 'DOCX', 'XLSX', 'PPTX', 'VIDEO', 'OTHER']).default('PDF'),
  file_size_mb: z.number().positive().optional(),
  file_url: z.string().url('유효한 URL을 입력해주세요'),
  download_type: z.enum(['EMAIL', 'DIRECT', 'GOOGLE_DRIVE']).default('EMAIL'),
  category: z.enum(['FRAMEWORK', 'WHITEPAPER', 'CASE_STUDY', 'DATASHEET', 'OTHER']),
  tags: z.array(z.string()).optional().default([]),
  language: z.enum(['ko', 'en']).default('ko'),
  version: z.string().optional(),
  requires_form: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

type LibraryItemCreate = z.infer<typeof LibraryItemCreateSchema>;

// ====================================================================
// GET /api/admin/library/items - List all items (Admin only)
// ====================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const per_page = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20')));
    const offset = (page - 1) * per_page;

    // 2. Build WHERE conditions using tagged template
    const searchPattern = search ? `%${search}%` : '';

    // 3. Get total count with filters
    let countResult;
    if (status !== 'ALL' && category !== 'ALL' && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_items
        WHERE status = ${status} AND category = ${category}
        AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
      `;
    } else if (status !== 'ALL' && category !== 'ALL') {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_items
        WHERE status = ${status} AND category = ${category}
      `;
    } else if (status !== 'ALL' && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_items
        WHERE status = ${status}
        AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
      `;
    } else if (category !== 'ALL' && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_items
        WHERE category = ${category}
        AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
      `;
    } else if (status !== 'ALL') {
      countResult = await sql`SELECT COUNT(*) as total FROM library_items WHERE status = ${status}`;
    } else if (category !== 'ALL') {
      countResult = await sql`SELECT COUNT(*) as total FROM library_items WHERE category = ${category}`;
    } else if (search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_items
        WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
      `;
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM library_items`;
    }

    const total = parseInt(countResult[0].total);

    // 4. Get items with pagination
    let items;
    if (status !== 'ALL' && category !== 'ALL' && search) {
      items = await sql`
        SELECT * FROM library_items
        WHERE status = ${status} AND category = ${category}
        AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (status !== 'ALL' && category !== 'ALL') {
      items = await sql`
        SELECT * FROM library_items
        WHERE status = ${status} AND category = ${category}
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (status !== 'ALL' && search) {
      items = await sql`
        SELECT * FROM library_items
        WHERE status = ${status}
        AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (category !== 'ALL' && search) {
      items = await sql`
        SELECT * FROM library_items
        WHERE category = ${category}
        AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (status !== 'ALL') {
      items = await sql`
        SELECT * FROM library_items
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (category !== 'ALL') {
      items = await sql`
        SELECT * FROM library_items
        WHERE category = ${category}
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (search) {
      items = await sql`
        SELECT * FROM library_items
        WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else {
      items = await sql`
        SELECT * FROM library_items
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    }

    // 5. Return response
    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
        status,
        category,
        search: search || null,
      },
    });
  } catch (error: any) {
    console.error('[Admin Library Items GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// POST /api/admin/library/items - Create new item (Admin only)
// ====================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json();

    // 2. Validate with Zod
    const data = LibraryItemCreateSchema.parse(body);

    // 3. Check for duplicate slug
    const existingItems = await sql`
      SELECT id FROM library_items WHERE slug = ${data.slug} LIMIT 1
    `;

    if (existingItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: '이미 존재하는 Slug입니다',
            details: `Slug "${data.slug}"는 이미 사용 중입니다`,
          },
        },
        { status: 400 }
      );
    }

    // 4. Insert new item
    const newItems = await sql`
      INSERT INTO library_items (
        title, slug, description, file_type, file_size_mb, file_url, download_type,
        category, tags, language, version, requires_form, status,
        published_at, created_at, updated_at
      ) VALUES (
        ${data.title},
        ${data.slug},
        ${data.description || null},
        ${data.file_type},
        ${data.file_size_mb || null},
        ${data.file_url},
        ${data.download_type},
        ${data.category},
        ${data.tags},
        ${data.language},
        ${data.version || null},
        ${data.requires_form},
        ${data.status},
        ${data.status === 'PUBLISHED' ? new Date().toISOString() : null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const newItem = newItems[0];

    // 5. Return created item
    return NextResponse.json(
      {
        success: true,
        message: 'Library item이 생성되었습니다',
        data: newItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Admin Library Items POST] Error:', error);

    // Zod validation error
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

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '서버 오류가 발생했습니다',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
