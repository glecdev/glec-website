/**
 * Import YouTube Videos to Database
 *
 * Purpose: Bulk insert scraped YouTube videos into knowledge_videos table
 * Input: data/youtube-videos-enriched.json
 * Database: Neon PostgreSQL
 */

import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

interface VideoData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  category: 'TECHNICAL' | 'GUIDE' | 'TUTORIAL' | 'WEBINAR' | 'CASE_STUDY' | 'PRODUCT_DEMO';
  tags: string[];
  viewCount: number;
  publishedAt: string;
}

/**
 * Generate description from title if empty
 */
function generateDescription(title: string): string {
  // Remove special characters and emoji
  const cleanTitle = title.replace(/["""]/g, '').trim();

  return `${cleanTitle}에 대한 영상입니다. GLEC의 물류 탄소배출 측정 및 관리 솔루션에 대해 자세히 알아보세요.`;
}

/**
 * Convert relative date to ISO timestamp
 */
function convertPublishedAt(relativeDate: string): string {
  const now = new Date();

  if (relativeDate.includes('일 전')) {
    const days = parseInt(relativeDate.match(/\d+/)?.[0] || '0', 10);
    now.setDate(now.getDate() - days);
  } else if (relativeDate.includes('주 전')) {
    const weeks = parseInt(relativeDate.match(/\d+/)?.[0] || '0', 10);
    now.setDate(now.getDate() - weeks * 7);
  } else if (relativeDate.includes('개월 전')) {
    const months = parseInt(relativeDate.match(/\d+/)?.[0] || '0', 10);
    now.setMonth(now.getMonth() - months);
  } else if (relativeDate.includes('년 전')) {
    const years = parseInt(relativeDate.match(/\d+/)?.[0] || '0', 10);
    now.setFullYear(now.getFullYear() - years);
  }

  return now.toISOString();
}

/**
 * Import videos to database
 */
async function importVideosToDatabase(inputPath: string, limit: number = 10) {
  console.log('🚀 Starting video import to database...');
  console.log(`📂 Input: ${inputPath}`);
  console.log(`🔢 Import limit: ${limit} videos`);

  // Read enriched data
  const videos: VideoData[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`📊 Total videos available: ${videos.length}`);

  // Connect to database
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = neon(databaseUrl);

  try {
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process only first N videos
    const videosToImport = videos.slice(0, limit);

    for (const video of videosToImport) {
      try {
        // Generate description if empty
        const description = video.description === '이 영상에 대한 설명이 없습니다.' || !video.description
          ? generateDescription(video.title)
          : video.description;

        // Convert publishedAt to ISO timestamp
        const publishedAt = convertPublishedAt(video.publishedAt);

        // Check if video already exists (by URL)
        const existing = await sql`
          SELECT id FROM knowledge_videos WHERE video_url = ${video.videoUrl}
        `;

        if (existing.length > 0) {
          console.log(`   ⏭️  Skipping (already exists): ${video.title.substring(0, 50)}...`);
          skippedCount++;
          continue;
        }

        // Insert video
        await sql`
          INSERT INTO knowledge_videos (
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            category,
            tags,
            view_count,
            published_at,
            created_at,
            updated_at
          ) VALUES (
            ${video.title},
            ${description},
            ${video.videoUrl},
            ${video.thumbnailUrl},
            ${video.duration},
            ${video.category},
            ${video.tags},
            ${video.viewCount},
            ${publishedAt},
            NOW(),
            NOW()
          )
        `;

        importedCount++;
        console.log(`   ✅ [${importedCount}/${videosToImport.length - skippedCount}] Imported: ${video.title.substring(0, 50)}...`);

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error importing video: ${video.title.substring(0, 50)}...`);
        console.error(`      ${error}`);
      }
    }

    console.log('\n✅ Import completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Imported: ${importedCount}`);
    console.log(`   - Skipped (already exists): ${skippedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - Total processed: ${videosToImport.length}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

async function main() {
  // Load environment variables
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) {
        return;
      }

      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        // Remove surrounding quotes
        value = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  }

  const inputPath = path.join(__dirname, '..', 'data', 'youtube-videos-enriched.json');

  // Import all 88 videos
  const limit = 88;

  await importVideosToDatabase(inputPath, limit);
}

if (require.main === module) {
  main();
}

export { importVideosToDatabase };
