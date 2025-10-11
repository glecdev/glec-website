/**
 * Update Press Article Published Dates
 *
 * 스크래핑한 언론 기사의 실제 발행 날짜를 데이터베이스에 업데이트합니다.
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

// 실제 언론사의 기사만 추출 (Google 필터 메뉴 제외)
const realArticles = [
  {
    title: '콜드체인뉴스[인터뷰] 강덕호·김은우 오일렉스 공동대표',
    mediaOutlet: 'coldchainnews.kr',
    externalUrl: 'https://www.coldchainnews.kr/news/article.html?no=26751',
    publishedAt: '2024-10-15',
  },
  {
    title: '물류신문한국통합물류협회, 오일렉스와 물류부문 ESG 경영전환 협력',
    mediaOutlet: 'klnews.co.kr',
    externalUrl: 'https://www.klnews.co.kr/news/articleView.html?idxno=311848',
    publishedAt: '2024-04-04',
  },
  {
    title: '데일리경제오일렉스 강덕호 대표 2024 ESG친환경대전, ESG 스타트업 생존 전략 기조 강연 발표',
    mediaOutlet: 'kdpress.co.kr',
    externalUrl: 'http://www.kdpress.co.kr/news/articleView.html?idxno=132457',
    publishedAt: '2024-10-14',
  },
  {
    title: '세계일보\'리터 주유권\' 오일렉스, 한국석유공사 이어 보이미와 MOU 체결',
    mediaOutlet: 'segye.com',
    externalUrl: 'https://www.segye.com/newsView/20230406512209',
    publishedAt: '2023-04-06',
  },
  {
    title: '헬로티한국통합물류협회, 오일렉스와 MOU "물류 분야 ESG 선도"',
    mediaOutlet: 'hellot.net',
    externalUrl: 'https://www.hellot.net/news/article.html?no=88687',
    publishedAt: '2024-04-04',
  },
  {
    title: '프라임경제[카드] 오일렉스, 오피넷과 MOU 체결',
    mediaOutlet: 'm.newsprime.co.kr',
    externalUrl: 'https://m.newsprime.co.kr/section_view.html?no=595841',
    publishedAt: '2023-03-15',
  },
  {
    title: '에너지경제신문 모바일이퓨얼, 산업부-SK그룹 기술나눔 수혜 기업 선정',
    mediaOutlet: 'm.ekn.kr',
    externalUrl: 'https://m.ekn.kr/view.php?key=20240313022254507',
    publishedAt: '2024-03-14',
  },
  {
    title: '이투뉴스[이기업, 이사람] 프로그램 하나로 법인차 \'주유깡\' 근절',
    mediaOutlet: 'e2news.com',
    externalUrl: 'http://www.e2news.com/news/articleView.html?idxno=301406',
    publishedAt: '2023-10-16',
  },
  {
    title: '물류신문한국통합물류협회, 오일렉스·마리나체인과 통합 ESG경영 서비스 시작',
    mediaOutlet: 'klnews.co.kr',
    externalUrl: 'https://www.klnews.co.kr/news/articleView.html?idxno=312407',
    publishedAt: '2024-05-23',
  },
  {
    title: '데일리경제이퓨얼, 2024 데이터바우처 수요기업 대상 최대 3200만원 지원',
    mediaOutlet: 'kdpress.co.kr',
    externalUrl: 'http://www.kdpress.co.kr/news/articleView.html?idxno=127178',
    publishedAt: '2024-03-14',
  },
  {
    title: '시선뉴스한국 기업 글렉(GLEC), 실시간 탄소 측정이 가능한 AI Tachograph(ATG) 시스템 선보여',
    mediaOutlet: 'sisunnews.co.kr',
    externalUrl: 'http://www.sisunnews.co.kr/news/articleView.html?idxno=229051',
    publishedAt: '2024-09-20', // "3주 전" → 2025-10-11 기준 약 3주 전
  },
  {
    title: '필드뉴스GLEC, CES 2026서 AI 타코그래프 \'ATG AX\' 공개',
    mediaOutlet: 'fieldnews.kr',
    externalUrl: 'http://www.fieldnews.kr/news/articleView.html?idxno=21524',
    publishedAt: '2024-09-20',
  },
  {
    title: '미주중앙일보GLEC AI Tachograph (ATG) AX Solution: An Integrated Solution Predicting Everything from Driver Fatigue to Vehicle Failures',
    mediaOutlet: 'koreadaily.com',
    externalUrl: 'https://www.koreadaily.com/article/20250918180004796',
    publishedAt: '2024-09-18',
  },
  {
    title: '물류신문한국통합물류협회, 물류분야 탄소 배출량 산정 글로벌 표준 \'GLEC Framework v3.0\' 번역 출간',
    mediaOutlet: 'klnews.co.kr',
    externalUrl: 'https://www.klnews.co.kr/news/articleView.html?idxno=314741',
    publishedAt: '2024-11-29',
  },
  {
    title: '미주중앙일보GLEC AI Tachograph Sets New Benchmark for Logistics Industry with Real-Time Carbon Measurement Every Second',
    mediaOutlet: 'koreadaily.com',
    externalUrl: 'https://www.koreadaily.com/article/20250916180016517',
    publishedAt: '2024-09-16',
  },
];

async function updatePressDates() {
  console.log('🔄 Updating press article published dates...\n');

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const article of realArticles) {
    try {
      // Find press by external URL
      const result = await sql`
        UPDATE presses
        SET published_at = ${article.publishedAt},
            updated_at = NOW()
        WHERE external_url = ${article.externalUrl}
          AND deleted_at IS NULL
        RETURNING id, title, media_outlet, published_at
      `;

      if (result.length > 0) {
        updatedCount++;
        const press = result[0];
        console.log(`✅ Updated: ${press.title.substring(0, 50)}...`);
        console.log(`   📅 Date: ${press.published_at}`);
        console.log(`   📰 Outlet: ${press.media_outlet}\n`);
      } else {
        notFoundCount++;
        console.log(`⚠️  Not found: ${article.title.substring(0, 50)}...`);
        console.log(`   URL: ${article.externalUrl}\n`);
      }
    } catch (error) {
      console.error(`❌ Error updating article: ${article.title}`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Updated: ${updatedCount} articles`);
  console.log(`   ⚠️  Not found: ${notFoundCount} articles`);
  console.log(`   📋 Total processed: ${realArticles.length} articles`);

  // Verify updated dates
  console.log('\n🔍 Verifying updated dates...');
  const allPress = await sql`
    SELECT id, title, media_outlet, published_at, external_url
    FROM presses
    WHERE deleted_at IS NULL
      AND media_outlet NOT IN ('google.com')
    ORDER BY published_at DESC
  `;

  console.log(`\n📰 All Press Articles (${allPress.length} total):\n`);
  allPress.forEach((press, index) => {
    console.log(`${index + 1}. ${press.title.substring(0, 60)}...`);
    console.log(`   📅 ${press.published_at.toISOString().split('T')[0]} | 📰 ${press.media_outlet}`);
  });
}

updatePressDates()
  .then(() => {
    console.log('\n✅ Press date update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Press date update failed:', error);
    process.exit(1);
  });
