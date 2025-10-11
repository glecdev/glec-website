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

    // Get video from knowledge_videos table
    const result = await sql`
      SELECT *
      FROM knowledge_videos
      WHERE id = ${id}
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
      UPDATE knowledge_videos
      SET view_count = view_count + 1
      WHERE id = ${video.id}
    `;

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url: string): string => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : '';
    };

    // Transform to camelCase
    const transformedVideo = {
      id: video.id,
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.video_url,
      youtubeVideoId: extractYouTubeId(video.video_url),
      thumbnailUrl: video.thumbnail_url,
      duration: video.duration || '0:00',
      category: video.category,
      tags: video.tags || [],
      viewCount: video.view_count + 1, // Return updated count
      publishedAt: video.published_at,
      createdAt: video.created_at,
      updatedAt: video.updated_at,
    };

    // Get related videos (same category, excluding current video)
    const relatedResult = await sql`
      SELECT *
      FROM knowledge_videos
      WHERE id != ${video.id}
        AND category = ${video.category}
      ORDER BY published_at DESC, created_at DESC
      LIMIT 3
    `;

    const relatedVideos = relatedResult.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      youtubeUrl: item.video_url,
      youtubeVideoId: extractYouTubeId(item.video_url),
      thumbnailUrl: item.thumbnail_url,
      duration: item.duration || '0:00',
      category: item.category,
      tags: item.tags || [],
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
