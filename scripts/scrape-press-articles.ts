/**
 * Scrape GLEC Press Articles from Google News
 *
 * Purpose: Scrape real press articles about GLEC Inc (주식회사 글렉)
 * Exclude: Brunch articles
 * Source: Google News search results
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface PressArticle {
  title: string;
  mediaOutlet: string;
  externalUrl: string;
  publishedAt: string; // ISO format
  excerpt?: string;
}

const SEARCH_URLS = [
  'https://www.google.com/search?q=%22%EC%98%A4%EC%9D%BC%EB%A0%89%EC%8A%A4%22&sca_esv=bbf23e8cd9a48da6&rlz=1C1SQJL_koKR1134KR1134&biw=1920&bih=953&tbm=nws&sxsrf=ADLYWIIhXDIb6_vPr--vhh0qKVmm8_Mk0Q%3A1736498690134&ei=Bi-CZ9mLGPrV2roPqo77sQk&ved=0ahUKEwiZqd2d-uGKAxX6qlYBHSrHPpYQ4dUDCA0&uact=5&oq=%22%EC%98%A4%EC%9D%BC%EB%A0%89%EC%8A%A4%22&gs_lp=Eg xnd3Mtd2l6LW5ld3MiDyLsmKTsnbzro4nsiqQiMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEjTGFCbCFi1FnABeACQAQCYAcwBoAH3B6oBAzAuNrgBA8gBAPgBAZgCCaAC-AfCAgoQABiwAxjWBBhHwgINEAAYgAQYsAMYQxiKBcICDRAAGLADGNYEGEcYiwPCAg4QLhiABBjHARiOBRivAcICBhAAGBYYHsICCBAAGBYYHhgPmAMAiAYBkAYKkgcFMS44LjGgB-BV&sclient=gws-wiz-news',
  'https://www.google.com/search?q=%22%EA%B8%80%EB%A0%89%22&sca_esv=bbf23e8cd9a48da6&rlz=1C1SQJL_koKR1134KR1134&biw=1920&bih=953&tbm=nws&sxsrf=ADLYWIIS0QJrp4fDEcUw1Vvv2RsY7s25CQ%3A1736498717856&ei=IS-CZ8-xMdSy2roP99q3-Ao&ved=0ahUKEwjP2Kur-uGKAxVUmVYBHXftDa8Q4dUDCA0&uact=5&oq=%22%EA%B8%80%EB%A0%89%22&gs_lp=Egxnd3Mtd2l6LW5ld3MiCCLquIDroYkiMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEj9BVAAWOIEcAB4AJABAJgBuwGgAfcEqgEDMC40uAEDyAEA-AEBmAIFoAKqBcICChAAGLADGNYEGEfCAg0QABiABBiwAxhDGIoFwgINEAAYsAMY1gQYRxiLA8ICDhAuGIAEGMcBGI4FGK8BwgIGEAAYFhgewgIIEAAYFhgeGA_CAgcQABiABBgNmAMAiAYBkAYKkgcDMS40oAf7TA&sclient=gws-wiz-news',
  'https://www.google.com/search?q=%22glec%22&sca_esv=bbf23e8cd9a48da6&rlz=1C1SQJL_koKR1134KR1134&biw=1920&bih=953&tbm=nws&sxsrf=ADLYWIICYtHH5yfJF-KJg7O3aFGQC-M7Jw%3A1736498737002&ei=NC-CZ9-YEL2j2roP3N6f8QE&ved=0ahUKEwjfhKy0-uGKAxW9kVYBHVzvJx4Q4dUDCA0&uact=5&oq=%22glec%22&gs_lp=Egxnd3Mtd2l6LW5ld3MiByJnbGVjIjIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARIihxQlwhY9RlwAXgAkAEAmAHcAaABvguqAQUwLjcuMbgBA8gBAPgBAZgCCqAC0QvCAgoQABiwAxjWBBhHwgINEAAYgAQYsAMYQxiKBcICDRAAGLADGNYEGEcYiwPCAggQABiABBiiBMICBhAAGBYYHsICCBAAGBYYHhgPmAMAiAYBkAYKkgcFMS44LjGgB_Bd&sclient=gws-wiz-news'
];

const EXCLUDED_DOMAINS = [
  'brunch.co.kr'
];

/**
 * Extract published date from Google News article metadata
 */
function extractPublishedDate(dateText: string): string {
  const now = new Date();

  // "N시간 전"
  if (dateText.includes('시간 전')) {
    const hours = parseInt(dateText.match(/(\d+)시간/)?.[1] || '0', 10);
    now.setHours(now.getHours() - hours);
    return now.toISOString();
  }

  // "N일 전"
  if (dateText.includes('일 전')) {
    const days = parseInt(dateText.match(/(\d+)일/)?.[1] || '0', 10);
    now.setDate(now.getDate() - days);
    return now.toISOString();
  }

  // "N주 전"
  if (dateText.includes('주 전')) {
    const weeks = parseInt(dateText.match(/(\d+)주/)?.[1] || '0', 10);
    now.setDate(now.getDate() - (weeks * 7));
    return now.toISOString();
  }

  // "N개월 전"
  if (dateText.includes('개월 전')) {
    const months = parseInt(dateText.match(/(\d+)개월/)?.[1] || '0', 10);
    now.setMonth(now.getMonth() - months);
    return now.toISOString();
  }

  // "N년 전"
  if (dateText.includes('년 전')) {
    const years = parseInt(dateText.match(/(\d+)년/)?.[1] || '0', 10);
    now.setFullYear(now.getFullYear() - years);
    return now.toISOString();
  }

  // Default: current timestamp
  return now.toISOString();
}

/**
 * Check if URL is from excluded domain
 */
function isExcludedDomain(url: string): boolean {
  return EXCLUDED_DOMAINS.some(domain => url.includes(domain));
}

/**
 * Extract media outlet name from URL
 */
function extractMediaOutlet(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');

    // Map common domains to readable names
    const outletMap: Record<string, string> = {
      'chosun.com': '조선일보',
      'joins.com': '중앙일보',
      'donga.com': '동아일보',
      'khan.co.kr': '경향신문',
      'hani.co.kr': '한겨레',
      'mt.co.kr': '머니투데이',
      'mk.co.kr': '매일경제',
      'hankyung.com': '한국경제',
      'sedaily.com': '서울경제',
      'etnews.com': '전자신문',
      'zdnet.co.kr': 'ZDNet Korea',
      'yna.co.kr': '연합뉴스',
      'newsis.com': '뉴시스',
      'newspim.com': '뉴스핌',
      'ajunews.com': '아주경제',
      'edaily.co.kr': '이데일리',
      'heraldcorp.com': '헤럴드경제',
      'asiae.co.kr': '아시아경제',
      'fnnews.com': '파이낸셜뉴스',
      'businesspost.co.kr': '비즈니스포스트',
      'sporbiz.co.kr': '스포츠비즈',
      'news1.kr': '뉴스1'
    };

    return outletMap[hostname] || hostname;
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Scrape Google News for GLEC press articles
 */
async function scrapePressArticles(): Promise<PressArticle[]> {
  console.log('🚀 Starting press article scraping...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const allArticles: PressArticle[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < SEARCH_URLS.length; i++) {
    const searchUrl = SEARCH_URLS[i];
    const queryName = i === 0 ? '오일렉스' : i === 1 ? '글렉' : 'GLEC';
    console.log(`🔍 Searching for: ${queryName}`);

    const page = await context.newPage();

    try {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for any news results to load
      await page.waitForTimeout(3000);

      // Try multiple selectors for Google News results
      const articles = await page.evaluate(() => {
        const results: Array<{title: string; url: string; source: string; date: string}> = [];

        // Try selector 1: Standard news cards
        const newsCards = document.querySelectorAll('div.SoaBEf, div.WlydOe, div[jscontroller]');

        newsCards.forEach(card => {
          // Find title link
          const linkEl = card.querySelector('a') as HTMLAnchorElement;
          if (!linkEl) return;

          const title = linkEl.textContent?.trim() || '';
          const url = linkEl.href || '';

          // Find source and date (usually in small text)
          const metaText = Array.from(card.querySelectorAll('span, div'))
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 0);

          const source = metaText.find(text =>
            text && !text.includes('시간') && !text.includes('일 전') &&
            !text.includes('주 전') && !text.includes('개월') && text.length < 50
          ) || '';

          const date = metaText.find(text =>
            text && (text.includes('시간') || text.includes('일 전') ||
            text.includes('주 전') || text.includes('개월') || text.includes('년 전'))
          ) || '';

          if (title && url && url.startsWith('http')) {
            results.push({ title, url, source, date });
          }
        });

        return results;
      });

      console.log(`   Found ${articles.length} articles`);

      // Process each article
      for (const article of articles) {
        // Skip if already processed
        if (seenUrls.has(article.url)) continue;

        // Skip if excluded domain
        if (isExcludedDomain(article.url)) {
          console.log(`   ⏭️  Skipped (Brunch): ${article.title.substring(0, 50)}...`);
          continue;
        }

        // Skip if URL is Google redirect
        if (article.url.startsWith('/url?')) {
          const urlParams = new URLSearchParams(article.url.split('?')[1]);
          const actualUrl = urlParams.get('q') || urlParams.get('url');
          if (actualUrl) {
            article.url = actualUrl;
          }
        }

        // Skip invalid URLs
        if (!article.url.startsWith('http')) continue;

        // Extract data
        const pressArticle: PressArticle = {
          title: article.title,
          mediaOutlet: extractMediaOutlet(article.url),
          externalUrl: article.url,
          publishedAt: extractPublishedDate(article.date),
          excerpt: article.title // Use title as excerpt for now
        };

        allArticles.push(pressArticle);
        seenUrls.add(article.url);

        console.log(`   ✅ ${pressArticle.mediaOutlet}: ${pressArticle.title.substring(0, 50)}...`);
      }

    } catch (error) {
      console.error(`   ❌ Error searching "${queryName}":`, error instanceof Error ? error.message : error);
    } finally {
      await page.close();
    }

    // Delay between searches
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await browser.close();

  console.log(`\n✅ Total articles scraped: ${allArticles.length}\n`);

  return allArticles;
}

/**
 * Main execution
 */
async function main() {
  try {
    const articles = await scrapePressArticles();

    // Save to JSON file
    const outputPath = join(__dirname, '..', 'data', 'press-articles.json');
    writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');

    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 Total articles: ${articles.length}`);

    // Display statistics
    const outletCounts = articles.reduce((acc, article) => {
      acc[article.mediaOutlet] = (acc[article.mediaOutlet] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📈 Articles by Media Outlet:');
    Object.entries(outletCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([outlet, count]) => {
        console.log(`   ${outlet}: ${count}`);
      });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
