import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const runtime = 'edge';

/**
 * GET /api/knowledge/blog/[slug]
 * Get blog post by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SLUG',
            message: 'Slug is required',
          },
        },
        { status: 400 }
      );
    }

    // Get blog post with author info
    const result = await sql`
      SELECT
        b.id, b.title, b.slug, b.content, b.excerpt, b.thumbnail_url, b.tags,
        b.view_count, b.reading_time, b.published_at, b.created_at, b.updated_at,
        u.name as author_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'PUBLISHED' AND b.slug = ${slug}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Blog post not found',
          },
        },
        { status: 404 }
      );
    }

    const post = result[0];

    // Increment view count
    await sql`
      UPDATE blogs
      SET view_count = view_count + 1
      WHERE id = ${post.id}
    `;

    // Transform to camelCase
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      thumbnailUrl: post.thumbnail_url,
      tags: post.tags || [],
      author: post.author_name || 'GLEC',
      authorAvatar: null,
      readTime: post.reading_time ? `${post.reading_time}분` : '5분',
      viewCount: post.view_count + 1, // Return updated count
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };

    // Get related posts (same tags, excluding current post)
    let relatedPosts: any[] = [];
    if (post.tags && post.tags.length > 0) {
      const relatedResult = await sql`
        SELECT
          b.id, b.title, b.slug, b.excerpt, b.thumbnail_url, b.tags,
          b.view_count, b.reading_time, b.published_at,
          u.name as author_name
        FROM blogs b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.status = 'PUBLISHED'
          AND b.id != ${post.id}
          AND b.tags && ${post.tags}
        ORDER BY b.published_at DESC NULLS LAST
        LIMIT 3
      `;

      relatedPosts = relatedResult.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        thumbnailUrl: item.thumbnail_url,
        tags: item.tags || [],
        author: item.author_name || 'GLEC',
        authorAvatar: null,
        readTime: item.reading_time ? `${item.reading_time}분` : '5분',
        viewCount: item.view_count,
        publishedAt: item.published_at,
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        post: transformedPost,
        relatedPosts,
      },
    });
  } catch (error) {
    console.error('[GET /api/knowledge/blog/[slug]] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
