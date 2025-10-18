/**
 * Video Detail API
 *
 * GET /api/knowledge/videos/[id]
 * - Returns single video details with related videos
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface Video {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  thumbnail_url: string;
  duration: string;
  tab?: string; // Database column is 'tab', not 'category'
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid video ID',
          },
        },
        { status: 400 }
      );
    }

    // Fetch video details
    const videos = await sql`
      SELECT
        id,
        title,
        description,
        youtube_url,
        youtube_video_id,
        thumbnail_url,
        duration,
        tab,
        view_count,
        published_at,
        created_at,
        updated_at
      FROM videos
      WHERE id = ${id}
    `;

    if (videos.length === 0) {
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

    const video = videos[0] as Video;

    // Increment view count
    await sql`
      UPDATE videos
      SET view_count = view_count + 1
      WHERE id = ${id}
    `;

    // Fetch related videos (same tab, excluding current video, limit 3)
    let relatedVideos: Video[] = [];

    if (video.tab) {
      relatedVideos = (await sql`
        SELECT
          id,
          title,
          description,
          youtube_url,
          youtube_video_id,
          thumbnail_url,
          duration,
          tab,
          view_count,
          published_at
        FROM videos
        WHERE tab = ${video.tab}
          AND id != ${id}
        ORDER BY view_count DESC, published_at DESC
        LIMIT 3
      `) as Video[];
    }

    // If not enough related videos, fill with recent videos
    if (relatedVideos.length < 3) {
      const limit = 3 - relatedVideos.length;
      const additionalVideos = (await sql`
        SELECT
          id,
          title,
          description,
          youtube_url,
          youtube_video_id,
          thumbnail_url,
          duration,
          tab,
          view_count,
          published_at
        FROM videos
        WHERE id != ${id}
        ORDER BY published_at DESC
        LIMIT ${limit}
      `) as Video[];

      relatedVideos = [...relatedVideos, ...additionalVideos];
    }

    // Transform to camelCase (map 'tab' to 'category' for frontend compatibility)
    const transformVideo = (v: Video) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      youtubeUrl: v.youtube_url,
      youtubeVideoId: v.youtube_video_id,
      thumbnailUrl: v.thumbnail_url,
      duration: v.duration,
      category: v.tab, // Frontend expects 'category' field
      viewCount: v.view_count + (v.id === id ? 1 : 0),
      publishedAt: v.published_at,
      createdAt: (v as any).created_at,
      updatedAt: (v as any).updated_at,
    });

    return NextResponse.json({
      success: true,
      data: {
        video: transformVideo(video),
        relatedVideos: relatedVideos.map(transformVideo),
      },
    });
  } catch (error) {
    console.error('[GET /api/knowledge/videos/[id]] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch video details',
        },
      },
      { status: 500 }
    );
  }
}
