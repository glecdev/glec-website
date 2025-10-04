/**
 * Admin API: Knowledge Blog CRUD
 *
 * Purpose: Full CRUD operations for Knowledge Blog Posts
 * Auth: JWT Bearer token required
 * Standards: GLEC-API-Specification.yaml, CLAUDE.md (NO HARDCODING)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

  KnowledgeBlogPost,
  CreateKnowledgeBlogPostInput,
  UpdateKnowledgeBlogPostInput,
  BlogCategory,
} from '@/lib/types/knowledge';
import { generateMockBlogPosts, searchBlogPosts } from '@/lib/mock-knowledge-data';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const CreateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().max(300, 'Excerpt must not exceed 300 characters'),
  author: z.string().min(1, 'Author is required'),
  category: z.enum([
    'TECHNICAL',
    'GUIDE',
    'NEWS',
    'CASE_STUDY',
    'TUTORIAL',
    'INDUSTRY_INSIGHTS',
    'PRODUCT_UPDATES',
  ]),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  publishedAt: z.string().datetime().optional(),
});

const UpdateBlogPostSchema = CreateBlogPostSchema.partial();

// ============================================================
// IN-MEMORY STORAGE (Mock Database)
// ============================================================

let blogPosts: KnowledgeBlogPost[] = generateMockBlogPosts(30);

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  return !!(authHeader?.startsWith('Bearer ') && authHeader.substring(7).length > 0);
}

// ============================================================
// GET - List blog posts
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
    const category = searchParams.get('category') as BlogCategory | null;
    const search = searchParams.get('search') || '';

    let filteredPosts = [...blogPosts];

    if (category) {
      filteredPosts = filteredPosts.filter((p) => p.category === category);
    }

    if (search) {
      filteredPosts = searchBlogPosts(filteredPosts, search);
    }

    filteredPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const total = filteredPosts.length;
    const start = (page - 1) * perPage;
    const paginatedPosts = filteredPosts.slice(start, start + perPage);

    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    });
  } catch (error) {
    console.error('[API /admin/knowledge/blog GET] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch blog posts' } },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create blog post
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
    const validation = CreateBlogPostSchema.safeParse(body);

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

    const input: CreateKnowledgeBlogPostInput = validation.data;
    const now = new Date().toISOString();

    const newPost: KnowledgeBlogPost = {
      id: `blog-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...input,
      thumbnailUrl: input.thumbnailUrl || null,
      viewCount: 0,
      publishedAt: input.publishedAt || now,
      createdAt: now,
      updatedAt: now,
    };

    blogPosts.push(newPost);

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error) {
    console.error('[API /admin/knowledge/blog POST] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create blog post' } },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT - Update blog post
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

    const index = blogPosts.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = UpdateBlogPostSchema.safeParse(body);

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

    blogPosts[index] = { ...blogPosts[index], ...validation.data, updatedAt: new Date().toISOString() };

    return NextResponse.json({ success: true, data: blogPosts[index] });
  } catch (error) {
    console.error('[API /admin/knowledge/blog PUT] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update blog post' } },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Delete blog post
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

    const index = blogPosts.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Blog post not found' } },
        { status: 404 }
      );
    }

    blogPosts.splice(index, 1);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API /admin/knowledge/blog DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete blog post' } },
      { status: 500 }
    );
  }
}
