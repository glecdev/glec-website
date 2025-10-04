/**
 * Admin API: Knowledge Library CRUD
 *
 * Purpose: Full CRUD operations for Knowledge Library items
 * Auth: JWT Bearer token required
 * Standards: GLEC-API-Specification.yaml, CLAUDE.md (NO HARDCODING)
 *
 * Endpoints:
 * - GET    /api/admin/knowledge/library (List with pagination/filtering)
 * - POST   /api/admin/knowledge/library (Create new item)
 * - PUT    /api/admin/knowledge/library?id=xxx (Update item)
 * - DELETE /api/admin/knowledge/library?id=xxx (Delete item)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  KnowledgeLibraryItem,
  CreateKnowledgeLibraryItemInput,
  UpdateKnowledgeLibraryItemInput,
  KnowledgeCategory,
} from '@/lib/types/knowledge';
import { generateMockLibraryItems, searchLibraryItems } from '@/lib/mock-knowledge-data';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const CreateLibraryItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'TECHNICAL',
    'GUIDE',
    'NEWS',
    'CASE_STUDY',
    'TUTORIAL',
    'WHITEPAPER',
    'REPORT',
    'RESEARCH',
  ]),
  fileType: z.enum(['PDF', 'DOCX', 'XLSX', 'PPTX']),
  fileSize: z.string().regex(/^\d+(\.\d+)?\s?(MB|KB|GB)$/, 'Invalid file size format'),
  fileUrl: z.string().url('Invalid file URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  publishedAt: z.string().datetime().optional(),
});

const UpdateLibraryItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).optional(),
  category: z
    .enum([
      'TECHNICAL',
      'GUIDE',
      'NEWS',
      'CASE_STUDY',
      'TUTORIAL',
      'WHITEPAPER',
      'REPORT',
      'RESEARCH',
    ])
    .optional(),
  fileType: z.enum(['PDF', 'DOCX', 'XLSX', 'PPTX']).optional(),
  fileSize: z.string().regex(/^\d+(\.\d+)?\s?(MB|KB|GB)$/).optional(),
  fileUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).min(1).optional(),
  publishedAt: z.string().datetime().optional(),
});

// ============================================================
// IN-MEMORY STORAGE (Mock Database)
// ============================================================

let libraryItems: KnowledgeLibraryItem[] = generateMockLibraryItems(25);

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  // TODO: Verify JWT token (for now, just check presence)
  const token = authHeader.substring(7);
  return token.length > 0;
}

// ============================================================
// GET - List library items with pagination/filtering
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Auth check
    if (!verifyAuth(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '20', 10);
    const category = searchParams.get('category') as KnowledgeCategory | null;
    const search = searchParams.get('search') || '';

    let filteredItems = [...libraryItems];

    // Filter by category
    if (category) {
      filteredItems = filteredItems.filter((item) => item.category === category);
    }

    // Search filter
    if (search) {
      filteredItems = searchLibraryItems(filteredItems, search);
    }

    // Sort by publishedAt DESC
    filteredItems.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Pagination
    const total = filteredItems.length;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedItems = filteredItems.slice(start, end);

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('[API /admin/knowledge/library GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch library items',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new library item
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Auth check
    if (!verifyAuth(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation
    const validation = CreateLibraryItemSchema.safeParse(body);
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

    const input: CreateKnowledgeLibraryItemInput = validation.data;
    const now = new Date().toISOString();

    // Create new item
    const newItem: KnowledgeLibraryItem = {
      id: `lib-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: input.title,
      description: input.description,
      category: input.category,
      fileType: input.fileType,
      fileSize: input.fileSize,
      fileUrl: input.fileUrl,
      thumbnailUrl: input.thumbnailUrl || null,
      downloadCount: 0,
      tags: input.tags,
      publishedAt: input.publishedAt || now,
      createdAt: now,
      updatedAt: now,
    };

    libraryItems.push(newItem);

    return NextResponse.json(
      {
        success: true,
        data: newItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /admin/knowledge/library POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create library item',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT - Update library item
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    // Auth check
    if (!verifyAuth(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID parameter is required',
          },
        },
        { status: 400 }
      );
    }

    const itemIndex = libraryItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Library item not found',
          },
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validation
    const validation = UpdateLibraryItemSchema.safeParse(body);
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

    const input: UpdateKnowledgeLibraryItemInput = validation.data;

    // Update item
    libraryItems[itemIndex] = {
      ...libraryItems[itemIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: libraryItems[itemIndex],
    });
  } catch (error) {
    console.error('[API /admin/knowledge/library PUT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update library item',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Delete library item
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    // Auth check
    if (!verifyAuth(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID parameter is required',
          },
        },
        { status: 400 }
      );
    }

    const itemIndex = libraryItems.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Library item not found',
          },
        },
        { status: 404 }
      );
    }

    // Remove item
    libraryItems.splice(itemIndex, 1);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API /admin/knowledge/library DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete library item',
        },
      },
      { status: 500 }
    );
  }
}
