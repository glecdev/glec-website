/**
 * Admin API: Knowledge Videos CRUD
 *
 * Purpose: Full CRUD operations for Knowledge Videos
 * Auth: JWT Bearer token required
 * Standards: GLEC-API-Specification.yaml, CLAUDE.md (NO HARDCODING)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

  KnowledgeVideo,
  CreateKnowledgeVideoInput,
  UpdateKnowledgeVideoInput,
  VideoCategory,
} from '@/lib/types/knowledge';
import { generateMockVideos, searchVideos } from '@/lib/mock-knowledge-data';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const CreateVideoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  videoUrl: z.string().url('Invalid video URL'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  duration: z.string().regex(/^\d+:\d{2}$/, 'Duration must be in format MM:SS'),
  category: z.enum(['TECHNICAL', 'GUIDE', 'TUTORIAL', 'WEBINAR', 'CASE_STUDY', 'PRODUCT_DEMO']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  publishedAt: z.string().datetime().optional(),
});

const UpdateVideoSchema = CreateVideoSchema.partial();

// ============================================================
// IN-MEMORY STORAGE (Mock Database)
// ============================================================

let videos: KnowledgeVideo[] = generateMockVideos(30);

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  return !!(authHeader?.startsWith('Bearer ') && authHeader.substring(7).length > 0);
}

// ============================================================
// GET - List videos
// ============================================================

export async function GET(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '20', 10);
    const category = searchParams.get('category') as VideoCategory | null;
    const search = searchParams.get('search') || '';

    let filteredVideos = [...videos];

    if (category) {
      filteredVideos = filteredVideos.filter((v) => v.category === category);
    }

    if (search) {
      filteredVideos = searchVideos(filteredVideos, search);
    }

    filteredVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const total = filteredVideos.length;
    const start = (page - 1) * perPage;
    const paginatedVideos = filteredVideos.slice(start, start + perPage);

    return NextResponse.json({
      success: true,
      data: paginatedVideos,
      meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    });
  } catch (error) {
    console.error('[API /admin/knowledge/videos GET] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch videos' } },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create video
// ============================================================

export async function POST(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = CreateVideoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validation.error.errors.map((err) => ({ field: err.path.join('.'), message: err.message })),
          },
        },
        { status: 400 }
      );
    }

    const input: CreateKnowledgeVideoInput = validation.data;
    const now = new Date().toISOString();

    const newVideo: KnowledgeVideo = {
      id: `vid-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...input,
      thumbnailUrl: input.thumbnailUrl || null,
      viewCount: 0,
      publishedAt: input.publishedAt || now,
      createdAt: now,
      updatedAt: now,
    };

    videos.push(newVideo);

    return NextResponse.json({ success: true, data: newVideo }, { status: 201 });
  } catch (error) {
    console.error('[API /admin/knowledge/videos POST] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create video' } },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT - Update video
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID parameter is required' } },
        { status: 400 }
      );
    }

    const index = videos.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Video not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = UpdateVideoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validation.error.errors.map((err) => ({ field: err.path.join('.'), message: err.message })),
          },
        },
        { status: 400 }
      );
    }

    videos[index] = { ...videos[index], ...validation.data, updatedAt: new Date().toISOString() };

    return NextResponse.json({ success: true, data: videos[index] });
  } catch (error) {
    console.error('[API /admin/knowledge/videos PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update video' } },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Delete video
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID parameter is required' } },
        { status: 400 }
      );
    }

    const index = videos.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Video not found' } },
        { status: 404 }
      );
    }

    videos.splice(index, 1);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API /admin/knowledge/videos DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete video' } },
      { status: 500 }
    );
  }
}
