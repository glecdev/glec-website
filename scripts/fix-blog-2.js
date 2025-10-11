const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const newExcerpt = 'ESG를 비용이 아닌 수익으로 전환하는 7가지 검증된 비즈니스 모델을 소개합니다. DHL GoGreen Plus, UPS Carbon Neutral 등 글로벌 기업의 실제 사례를 기반으로 저탄소 프리미엄 서비스, 탄소 데이터 서비스, 정부 보조금 활용, 탄소 크레딧 판매 등 구체적인 수익 창출 방법을 제시합니다.';

const newTitle = 'ESG를 수익으로 전환하는 7가지 검증된 비즈니스 모델 - DHL, UPS 실제 사례 분석';

(async () => {
  await sql`
    UPDATE blogs
    SET
      title = ${newTitle},
      excerpt = ${newExcerpt}
    WHERE slug = 'esg-revenue-green-logistics-business-model-2025'
  `;

  console.log('✅ 블로그 #2 제목과 요약 수정 완료 (허위 세미나 내용 제거)');
})();
