/**
 * YouTube Video Description Enricher
 *
 * Purpose: Fetch full descriptions from YouTube video pages
 * Input: data/youtube-videos.json
 * Output: data/youtube-videos-enriched.json
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface VideoData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  tags: string[];
  viewCount: number;
  publishedAt: string;
}

/**
 * Extract description from YouTube video page
 */
async function fetchVideoDescription(page: any, videoUrl: string): Promise<string> {
  try {
    console.log(`   📄 Fetching: ${videoUrl}`);
    await page.goto(videoUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Click "Show more" button if exists
    try {
      const showMoreButton = page.locator('tp-yt-paper-button#expand, button:has-text("더보기")').first();
      if (await showMoreButton.isVisible({ timeout: 3000 })) {
        await showMoreButton.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // No "Show more" button
    }

    // Extract description
    const description = await page.evaluate(() => {
      // Try multiple selectors
      const selectors = [
        'ytd-text-inline-expander#description-inline-expander yt-formatted-string',
        'ytd-video-secondary-info-renderer #description yt-formatted-string',
        '#description yt-formatted-string',
        'yt-formatted-string.ytd-expandable-video-description-body-renderer',
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          return element.textContent.trim();
        }
      }

      return '';
    });

    return description || '이 영상에 대한 설명이 없습니다.';

  } catch (error) {
    console.error(`   ❌ Failed to fetch description: ${error}`);
    return '설명을 가져오지 못했습니다.';
  }
}

async function enrichVideoDescriptions(inputPath: string, outputPath: string, limit: number = 10) {
  console.log('🚀 Starting video description enrichment...');
  console.log(`📂 Input: ${inputPath}`);
  console.log(`📂 Output: ${outputPath}`);
  console.log(`🔢 Processing limit: ${limit} videos`);

  // Read input data
  const videos: VideoData[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`📊 Total videos to process: ${Math.min(videos.length, limit)}`);

  const browser = await chromium.launch({
    headless: true, // Run in background
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // Process only the first N videos
    const videosToProcess = videos.slice(0, limit);
    let processedCount = 0;

    for (const video of videosToProcess) {
      if (!video.description || video.description === '') {
        const description = await fetchVideoDescription(page, video.videoUrl);
        video.description = description;
        processedCount++;

        console.log(`   ✅ [${processedCount}/${videosToProcess.length}] ${video.title.substring(0, 50)}...`);

        // Rate limiting - wait 1-2 seconds between requests
        await page.waitForTimeout(1000 + Math.random() * 1000);
      } else {
        console.log(`   ⏭️  Skipping (already has description): ${video.title.substring(0, 50)}...`);
      }
    }

    // Save enriched data
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(videos, null, 2), 'utf-8');

    console.log('\n✅ Enrichment completed!');
    console.log(`📊 Processed: ${processedCount} videos`);
    console.log(`📂 Output file: ${outputPath}`);

  } catch (error) {
    console.error('❌ Enrichment failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function main() {
  const inputPath = path.join(__dirname, '..', 'data', 'youtube-videos.json');
  const outputPath = path.join(__dirname, '..', 'data', 'youtube-videos-enriched.json');

  // Process first 10 videos as a test
  // Change this number to process more videos
  const limit = 10;

  await enrichVideoDescriptions(inputPath, outputPath, limit);
}

if (require.main === module) {
  main();
}

export { enrichVideoDescriptions };
