/**
 * YouTube Channel Video Scraper
 *
 * Purpose: Scrape GLEC Inc YouTube channel videos for Knowledge Videos
 * MCP Tools: Playwright for browser automation
 * Output: JSON file with video data ready for database import
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface YouTubeVideoData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  category: 'TECHNICAL' | 'GUIDE' | 'TUTORIAL' | 'WEBINAR' | 'CASE_STUDY' | 'PRODUCT_DEMO';
  tags: string[];
  publishedAt?: string;
  viewCount?: number;
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

/**
 * Convert duration string (e.g., "10:23") to MM:SS format
 */
function normalizeDuration(duration: string): string {
  const parts = duration.split(':');
  if (parts.length === 2) {
    const [mm, ss] = parts;
    return `${mm.padStart(2, '0')}:${ss.padStart(2, '0')}`;
  } else if (parts.length === 3) {
    // HH:MM:SS format - convert to MM:SS
    const [hh, mm, ss] = parts;
    const totalMinutes = parseInt(hh, 10) * 60 + parseInt(mm, 10);
    return `${totalMinutes}:${ss.padStart(2, '0')}`;
  }
  return duration;
}

/**
 * Categorize video based on title keywords
 */
function categorizeVideo(title: string, description: string): YouTubeVideoData['category'] {
  const combined = `${title} ${description}`.toLowerCase();

  if (combined.includes('webinar') || combined.includes('웨비나')) {
    return 'WEBINAR';
  }
  if (combined.includes('tutorial') || combined.includes('튜토리얼') || combined.includes('사용법')) {
    return 'TUTORIAL';
  }
  if (combined.includes('case study') || combined.includes('사례') || combined.includes('고객')) {
    return 'CASE_STUDY';
  }
  if (combined.includes('demo') || combined.includes('시연') || combined.includes('제품')) {
    return 'PRODUCT_DEMO';
  }
  if (combined.includes('guide') || combined.includes('가이드')) {
    return 'GUIDE';
  }

  return 'TECHNICAL';
}

/**
 * Extract tags from title and description
 */
function extractTags(title: string, description: string): string[] {
  const tags = new Set<string>();

  // Default GLEC tags
  tags.add('GLEC');

  const combined = `${title} ${description}`.toLowerCase();

  // Common keywords
  const keywords = [
    { pattern: /iso[\s-]?14083/i, tag: 'ISO-14083' },
    { pattern: /탄소배출|carbon emission/i, tag: '탄소배출' },
    { pattern: /물류|logistics/i, tag: '물류' },
    { pattern: /클라우드|cloud/i, tag: 'GLEC Cloud' },
    { pattern: /api/i, tag: 'API' },
    { pattern: /dtg|series5/i, tag: 'DTG Series5' },
    { pattern: /국제표준|international standard/i, tag: '국제표준' },
    { pattern: /측정|measurement/i, tag: '측정' },
    { pattern: /리포트|report/i, tag: '리포트' },
  ];

  keywords.forEach(({ pattern, tag }) => {
    if (pattern.test(combined)) {
      tags.add(tag);
    }
  });

  return Array.from(tags).slice(0, 5); // Limit to 5 tags
}

async function scrapeYouTubeChannel(channelUrl: string): Promise<YouTubeVideoData[]> {
  console.log('🚀 Starting YouTube channel scraper...');
  console.log(`📺 Target channel: ${channelUrl}`);

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 500, // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    console.log('🌐 Navigating to channel page...');
    await page.goto(channelUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Close any cookie consent dialogs
    try {
      const cookieButton = page.locator('button:has-text("Reject all"), button:has-text("거부")').first();
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('ℹ️ No cookie dialog found');
    }

    // Scroll down to load more videos
    console.log('📜 Scrolling to load videos...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1500);
    }

    console.log('🔍 Extracting video data...');

    // Extract video data from page
    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-rich-item-renderer, ytd-grid-video-renderer');
      const results: any[] = [];

      videoElements.forEach((element) => {
        try {
          // Title
          const titleElement = element.querySelector('#video-title');
          const title = titleElement?.getAttribute('title') || titleElement?.textContent?.trim() || '';

          // Video URL
          const linkElement = element.querySelector('a#video-title-link, a#thumbnail');
          const href = linkElement?.getAttribute('href') || '';
          const videoUrl = href.startsWith('/') ? `https://www.youtube.com${href}` : href;

          // Thumbnail
          const imgElement = element.querySelector('img');
          let thumbnailUrl = imgElement?.getAttribute('src') || '';

          // YouTube lazy loads images - check for data-src
          if (!thumbnailUrl || thumbnailUrl.includes('data:image')) {
            thumbnailUrl = imgElement?.getAttribute('data-src') || '';
          }

          // Ensure high-quality thumbnail
          if (thumbnailUrl && thumbnailUrl.includes('i.ytimg.com')) {
            thumbnailUrl = thumbnailUrl.replace(/\/[^\/]+default\.jpg/, '/maxresdefault.jpg');
          }

          // Duration
          const durationElement = element.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
          const duration = durationElement?.textContent?.trim() || '0:00';

          // Metadata (views, published date)
          const metadataElements = element.querySelectorAll('#metadata-line span');
          let viewCount = 0;
          let publishedAt = '';

          metadataElements.forEach((meta, index) => {
            const text = meta.textContent?.trim() || '';
            if (index === 0 && text.includes('views') || text.includes('조회수')) {
              // Extract number from "1.2K views" or "1,234 views"
              const match = text.match(/[\d,.]+/);
              if (match) {
                const numStr = match[0].replace(/,/g, '');
                if (text.includes('K')) {
                  viewCount = parseFloat(numStr) * 1000;
                } else if (text.includes('M')) {
                  viewCount = parseFloat(numStr) * 1000000;
                } else {
                  viewCount = parseInt(numStr, 10);
                }
              }
            }
            if (index === 1) {
              publishedAt = text; // "2 months ago", "3일 전"
            }
          });

          if (title && videoUrl) {
            results.push({
              title,
              videoUrl,
              thumbnailUrl,
              duration,
              viewCount,
              publishedAt,
            });
          }
        } catch (err) {
          console.error('Error parsing video element:', err);
        }
      });

      return results;
    });

    console.log(`✅ Found ${videos.length} videos`);

    // Process and enhance video data
    const processedVideos: YouTubeVideoData[] = videos.map((video: any) => {
      const videoId = extractVideoId(video.videoUrl);
      const thumbnailUrl = videoId
        ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        : video.thumbnailUrl;

      const category = categorizeVideo(video.title, '');
      const tags = extractTags(video.title, '');
      const duration = normalizeDuration(video.duration);

      return {
        title: video.title,
        description: '', // Will need to be filled manually or via API
        videoUrl: video.videoUrl,
        thumbnailUrl,
        duration,
        category,
        tags,
        viewCount: video.viewCount || 0,
        publishedAt: video.publishedAt || new Date().toISOString(),
      };
    });

    return processedVideos;

  } catch (error) {
    console.error('❌ Scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Main execution
 */
async function main() {
  const channelUrl = 'https://www.youtube.com/@GLEC_Inc/videos';

  try {
    const videos = await scrapeYouTubeChannel(channelUrl);

    // Save to JSON file
    const outputPath = path.join(__dirname, '..', 'data', 'youtube-videos.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(videos, null, 2), 'utf-8');

    console.log('\n📊 Scraping Results:');
    console.log(`   Total videos: ${videos.length}`);
    console.log(`   Output file: ${outputPath}`);
    console.log('\n📋 Sample data:');
    console.log(JSON.stringify(videos[0], null, 2));

    console.log('\n✅ Scraping completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Review the scraped data in data/youtube-videos.json');
    console.log('   2. Manually add descriptions for each video');
    console.log('   3. Run the import script to add videos to database');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { scrapeYouTubeChannel };
export type { YouTubeVideoData };
