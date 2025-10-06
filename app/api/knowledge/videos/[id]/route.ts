import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const runtime = 'edge';

/**
 * GET /api/knowledge/videos/[id]
 * Get video by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Video ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Get video
    const result = await sql`
      SELECT
        id, title, description, youtube_url, youtube_video_id, thumbnail_url,
        duration, tab, view_count, published_at, created_at, updated_at
      FROM videos
      WHERE status = 'PUBLISHED' AND id = ${id}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Video not found',
          },
        },
        { status: 404 }
      );
    }

    const video = result[0];

    // Increment view count
    await sql`
      UPDATE videos
      SET view_count = view_count + 1
      WHERE id = ${video.id}
    `;

    // Transform to camelCase
    const transformedVideo = {
      id: video.id,
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.youtube_url,
      youtubeVideoId: video.youtube_video_id,
      thumbnailUrl: video.thumbnail_url,
      duration: video.duration || '0:00',
      category: video.tab,
      viewCount: video.view_count + 1, // Return updated count
      publishedAt: video.published_at,
      createdAt: video.created_at,
      updatedAt: video.updated_at,
    };

    // Get related videos (same category, excluding current video)
    const relatedResult = await sql`
      SELECT
        id, title, description, youtube_url, youtube_video_id, thumbnail_url,
        duration, tab, view_count, published_at
      FROM videos
      WHERE status = 'PUBLISHED'
        AND id != ${video.id}
        AND tab = ${video.tab}
      ORDER BY published_at DESC NULLS LAST, created_at DESC
      LIMIT 3
    `;

    const relatedVideos = relatedResult.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      youtubeUrl: item.youtube_url,
      youtubeVideoId: item.youtube_video_id,
      thumbnailUrl: item.thumbnail_url,
      duration: item.duration || '0:00',
      category: item.tab,
      viewCount: item.view_count,
      publishedAt: item.published_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        video: transformedVideo,
        relatedVideos,
      },
    });
  } catch (error) {
    console.error('[GET /api/knowledge/videos/[id]] Error:', error);

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
