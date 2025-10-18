/**
 * Create 24 Generic Email Templates
 *
 * 6 Categories × 4 Nurture Days = 24 Templates
 * - CONTACT_FORM (일반 문의)
 * - DEMO_REQUEST (데모 요청)
 * - NEWSLETTER_SIGNUP (뉴스레터 구독)
 * - PRICING_INQUIRY (가격 문의)
 * - PARTNERSHIP_INQUIRY (파트너십 문의)
 * - CAREER_APPLICATION (채용 지원)
 *
 * Each category: Day 3, 7, 14, 30 templates
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ============================================================
// Template Definitions
// ============================================================

const templates = [
  // ========== CONTACT_FORM (일반 문의) ==========
  {
    category_key: 'CONTACT_FORM',
    nurture_day: 3,
    template_key: 'CONTACT_FORM_DAY3_V1',
    template_name: '일반 문의 Day 3 - 환영 및 초기 답변',
    description: '문의 후 3일차: 환영 메시지 및 GLEC 솔루션 소개',
    subject_line: '[GLEC] {contact_name}님, 문의 감사합니다 - 탄소배출 관리의 첫 걸음',
    preview_text: 'GLEC와 함께 시작하는 글로벌 표준 탄소배출 관리',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0600f7;">안녕하세요 {contact_name}님,</h1>
    <p>{company_name}에서 GLEC에 문의해 주셔서 감사합니다.</p>
    <p>귀사의 탄소배출 관리에 대한 관심에 감사드리며, GLEC은 ISO 14083 국제표준 기반으로 정확하고 투명한 탄소배출 측정을 제공합니다.</p>

    <h2 style="color: #0600f7;">GLEC 솔루션 특징</h2>
    <ul>
      <li><strong>DHL GoGreen 파트너십</strong>: 글로벌 물류 표준</li>
      <li><strong>ISO 14083 준수</strong>: 국제표준 인증</li>
      <li><strong>48개 Carbon API</strong>: 모든 운송수단 지원</li>
      <li><strong>자동화된 계산</strong>: 수작업 제로</li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/products" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">제품 둘러보기</a>
    </p>

    <p>궁금하신 점이 있으시면 언제든 연락 주세요.</p>
    <p>감사합니다.</p>
    <p><strong>GLEC 팀</strong></p>
  </div>
</body>
</html>`,
    plain_text_body: `안녕하세요 {contact_name}님,

{company_name}에서 GLEC에 문의해 주셔서 감사합니다.

귀사의 탄소배출 관리에 대한 관심에 감사드리며, GLEC은 ISO 14083 국제표준 기반으로 정확하고 투명한 탄소배출 측정을 제공합니다.

GLEC 솔루션 특징:
- DHL GoGreen 파트너십: 글로벌 물류 표준
- ISO 14083 준수: 국제표준 인증
- 48개 Carbon API: 모든 운송수단 지원
- 자동화된 계산: 수작업 제로

제품 둘러보기: https://glec.io/products

궁금하신 점이 있으시면 언제든 연락 주세요.

감사합니다.
GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'email', 'phone', 'inquiry_details'],
  },

  {
    category_key: 'CONTACT_FORM',
    nurture_day: 7,
    template_key: 'CONTACT_FORM_DAY7_V1',
    template_name: '일반 문의 Day 7 - 성공 사례 및 ROI',
    description: '문의 후 7일차: 고객 성공 사례 및 ROI 정보 제공',
    subject_line: '[GLEC] {company_name}와 비슷한 기업들의 탄소배출 감축 성과',
    preview_text: '실제 사례로 보는 GLEC의 효과',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0600f7;">{contact_name}님,</h1>
    <p>{company_name}와 유사한 규모의 기업들이 GLEC을 통해 얻은 성과를 공유드립니다.</p>

    <h2 style="color: #0600f7;">주요 성공 사례</h2>
    <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #0600f7;">
      <p><strong>물류 기업 A사</strong></p>
      <p>✅ 탄소배출 계산 시간: 8시간 → 10분 (98% 단축)</p>
      <p>✅ 연간 CO2 절감: 1,200톤</p>
      <p>✅ ROI: 3개월 내 달성</p>
    </div>

    <h2 style="color: #0600f7;">GLEC이 제공하는 가치</h2>
    <ul>
      <li>자동화로 인한 인건비 절감 (월 300만원 이상)</li>
      <li>정확한 데이터로 고객 신뢰도 향상</li>
      <li>ISO 14083 인증으로 국제 경쟁력 강화</li>
      <li>실시간 모니터링으로 즉각적인 개선 가능</li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/case-studies" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">성공 사례 자세히 보기</a>
    </p>

    <p>{company_name}의 구체적인 니즈에 맞춘 맞춤 상담을 원하시면 언제든 연락 주세요.</p>
    <p>감사합니다.</p>
    <p><strong>GLEC 팀</strong></p>
  </div>
</body>
</html>`,
    plain_text_body: `{contact_name}님,

{company_name}와 유사한 규모의 기업들이 GLEC을 통해 얻은 성과를 공유드립니다.

주요 성공 사례:

물류 기업 A사
✅ 탄소배출 계산 시간: 8시간 → 10분 (98% 단축)
✅ 연간 CO2 절감: 1,200톤
✅ ROI: 3개월 내 달성

GLEC이 제공하는 가치:
- 자동화로 인한 인건비 절감 (월 300만원 이상)
- 정확한 데이터로 고객 신뢰도 향상
- ISO 14083 인증으로 국제 경쟁력 강화
- 실시간 모니터링으로 즉각적인 개선 가능

성공 사례 자세히 보기: https://glec.io/case-studies

{company_name}의 구체적인 니즈에 맞춘 맞춤 상담을 원하시면 언제든 연락 주세요.

감사합니다.
GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'email', 'phone'],
  },

  {
    category_key: 'CONTACT_FORM',
    nurture_day: 14,
    template_key: 'CONTACT_FORM_DAY14_V1',
    template_name: '일반 문의 Day 14 - 무료 데모 제안',
    description: '문의 후 14일차: 무료 데모 세션 제안 및 특별 혜택',
    subject_line: '[GLEC] {contact_name}님을 위한 1:1 맞춤 데모 세션 (무료)',
    preview_text: '직접 보고 경험하는 GLEC의 강력한 기능',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0600f7;">{contact_name}님께 특별 제안 드립니다</h1>
    <p>{company_name}의 탄소배출 관리를 직접 시뮬레이션해볼 수 있는 <strong>1:1 맞춤 데모 세션</strong>을 무료로 제공합니다.</p>

    <h2 style="color: #0600f7;">데모 세션에서 경험하실 내용</h2>
    <ul>
      <li>귀사의 실제 물류 데이터로 즉석 탄소배출 계산</li>
      <li>48개 Carbon API 실시간 시연</li>
      <li>GLEC Cloud 대시보드 직접 조작</li>
      <li>ROI 시뮬레이션 및 비용 분석</li>
      <li>맞춤형 도입 로드맵 제안</li>
    </ul>

    <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0;"><strong>🎁 특별 혜택</strong></p>
      <p style="margin: 10px 0 0 0;">데모 참여 시 <strong>ISO 14083 가이드북</strong> (정가 5만원) 무료 제공!</p>
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/demo-request?ref=nurture_day14" style="background-color: #0600f7; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px;">무료 데모 신청하기</a>
    </p>

    <p>데모 세션은 약 30분 소요되며, {contact_name}님의 편하신 시간에 맞춰 진행됩니다.</p>
    <p>감사합니다.</p>
    <p><strong>GLEC 팀</strong></p>
  </div>
</body>
</html>`,
    plain_text_body: `{contact_name}님께 특별 제안 드립니다

{company_name}의 탄소배출 관리를 직접 시뮬레이션해볼 수 있는 1:1 맞춤 데모 세션을 무료로 제공합니다.

데모 세션에서 경험하실 내용:
- 귀사의 실제 물류 데이터로 즉석 탄소배출 계산
- 48개 Carbon API 실시간 시연
- GLEC Cloud 대시보드 직접 조작
- ROI 시뮬레이션 및 비용 분석
- 맞춤형 도입 로드맵 제안

🎁 특별 혜택
데모 참여 시 ISO 14083 가이드북 (정가 5만원) 무료 제공!

무료 데모 신청하기: https://glec.io/demo-request?ref=nurture_day14

데모 세션은 약 30분 소요되며, {contact_name}님의 편하신 시간에 맞춰 진행됩니다.

감사합니다.
GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'email', 'phone'],
  },

  {
    category_key: 'CONTACT_FORM',
    nurture_day: 30,
    template_key: 'CONTACT_FORM_DAY30_V1',
    template_name: '일반 문의 Day 30 - 마지막 제안',
    description: '문의 후 30일차: 특별 할인 및 긴급성 전달',
    subject_line: '[GLEC] {contact_name}님, 마지막 기회입니다 (할인 혜택 종료 임박)',
    preview_text: '이달 내 도입 시 특별 할인 20% + 3개월 무료 지원',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #d32f2f;">{contact_name}님, 놓치기 아까운 기회입니다</h1>
    <p>{company_name}의 지속가능한 미래를 위한 GLEC 도입, 더 이상 미루지 마세요.</p>

    <div style="background-color: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #d32f2f;">
      <h2 style="color: #d32f2f; margin-top: 0;">🚨 이달 내 도입 시 특별 혜택</h2>
      <ul style="margin: 10px 0;">
        <li><strong>20% 할인</strong> (DTG Series5 정가 80만원 → 64만원)</li>
        <li><strong>3개월 무료 기술 지원</strong> (가치 120만원)</li>
        <li><strong>ISO 14083 컨설팅 1회 무료</strong> (가치 200만원)</li>
        <li><strong>데이터 마이그레이션 무료 지원</strong></li>
      </ul>
      <p style="color: #d32f2f; font-weight: bold; margin-bottom: 0;">혜택 종료: {expiry_date}</p>
    </div>

    <h2 style="color: #0600f7;">지금 시작해야 하는 이유</h2>
    <ul>
      <li>EU CBAM 규제 강화: 2026년부터 본격 시행</li>
      <li>탄소배출 보고 의무화: 준비 기간 최소 6개월 필요</li>
      <li>경쟁사들의 빠른 도입: 이미 300+ 기업 사용 중</li>
      <li>비용 절감 효과: 도입 후 평균 3개월 내 ROI 달성</li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/contact?ref=nurture_day30_urgent" style="background-color: #d32f2f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px;">지금 바로 상담 신청</a>
    </p>

    <p>이번이 마지막 연락입니다. 더 궁금한 점이 있으시면 언제든 연락 주세요.</p>
    <p>감사합니다.</p>
    <p><strong>GLEC 팀</strong></p>
  </div>
</body>
</html>`,
    plain_text_body: `{contact_name}님, 놓치기 아까운 기회입니다

{company_name}의 지속가능한 미래를 위한 GLEC 도입, 더 이상 미루지 마세요.

🚨 이달 내 도입 시 특별 혜택
- 20% 할인 (DTG Series5 정가 80만원 → 64만원)
- 3개월 무료 기술 지원 (가치 120만원)
- ISO 14083 컨설팅 1회 무료 (가치 200만원)
- 데이터 마이그레이션 무료 지원

혜택 종료: {expiry_date}

지금 시작해야 하는 이유:
- EU CBAM 규제 강화: 2026년부터 본격 시행
- 탄소배출 보고 의무화: 준비 기간 최소 6개월 필요
- 경쟁사들의 빠른 도입: 이미 300+ 기업 사용 중
- 비용 절감 효과: 도입 후 평균 3개월 내 ROI 달성

지금 바로 상담 신청: https://glec.io/contact?ref=nurture_day30_urgent

이번이 마지막 연락입니다. 더 궁금한 점이 있으시면 언제든 연락 주세요.

감사합니다.
GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'email', 'phone', 'expiry_date'],
  },

  // ========== DEMO_REQUEST (데모 요청) ==========
  {
    category_key: 'DEMO_REQUEST',
    nurture_day: 3,
    template_key: 'DEMO_REQUEST_DAY3_V1',
    template_name: '데모 요청 Day 3 - 데모 완료 후 피드백',
    description: '데모 후 3일차: 데모 참여 감사 및 피드백 요청',
    subject_line: '[GLEC] {contact_name}님, 데모 참여 감사합니다 - 추가 질문 있으신가요?',
    preview_text: '데모 세션 요약 및 다음 단계 안내',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0600f7;">안녕하세요 {contact_name}님,</h1>
    <p>지난 {demo_date}에 진행된 GLEC 데모 세션에 참여해 주셔서 감사합니다.</p>

    <h2 style="color: #0600f7;">데모 세션 요약</h2>
    <ul>
      <li>{company_name}의 연간 물류량: {estimated_volume}</li>
      <li>예상 탄소배출량: {estimated_co2}</li>
      <li>GLEC 도입 시 절감 효과: {savings}</li>
      <li>예상 ROI 달성 기간: {roi_period}</li>
    </ul>

    <h2 style="color: #0600f7;">다음 단계</h2>
    <p>데모를 통해 GLEC의 강력한 기능을 직접 확인하셨을 것입니다. 다음 단계로 넘어가기 위해:</p>
    <ol>
      <li><strong>구체적인 도입 계획 수립</strong>: 귀사의 시스템과 통합 방안 논의</li>
      <li><strong>맞춤형 견적서 발송</strong>: 실제 사용량 기반 정확한 비용 산출</li>
      <li><strong>PoC (Proof of Concept) 진행</strong>: 1개월 무료 시범 운영</li>
    </ol>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/schedule-followup?demo_id={demo_id}" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">후속 미팅 예약하기</a>
    </p>

    <p>궁금하신 점이나 추가로 논의하고 싶은 내용이 있으시면 언제든 연락 주세요.</p>
    <p>감사합니다.</p>
    <p><strong>GLEC 팀</strong></p>
  </div>
</body>
</html>`,
    plain_text_body: `안녕하세요 {contact_name}님,

지난 {demo_date}에 진행된 GLEC 데모 세션에 참여해 주셔서 감사합니다.

데모 세션 요약:
- {company_name}의 연간 물류량: {estimated_volume}
- 예상 탄소배출량: {estimated_co2}
- GLEC 도입 시 절감 효과: {savings}
- 예상 ROI 달성 기간: {roi_period}

다음 단계:
1. 구체적인 도입 계획 수립: 귀사의 시스템과 통합 방안 논의
2. 맞춤형 견적서 발송: 실제 사용량 기반 정확한 비용 산출
3. PoC (Proof of Concept) 진행: 1개월 무료 시범 운영

후속 미팅 예약하기: https://glec.io/schedule-followup?demo_id={demo_id}

궁금하신 점이나 추가로 논의하고 싶은 내용이 있으시면 언제든 연락 주세요.

감사합니다.
GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'email', 'demo_date', 'estimated_volume', 'estimated_co2', 'savings', 'roi_period', 'demo_id'],
  },

  // ========== DEMO_REQUEST Day 7/14/30 ==========
  {
    category_key: 'DEMO_REQUEST',
    nurture_day: 7,
    template_key: 'DEMO_REQUEST_DAY7_V1',
    template_name: '데모 요청 Day 7 - PoC 제안',
    description: '데모 후 7일차: 무료 PoC 제안',
    subject_line: '[GLEC] {company_name}를 위한 1개월 무료 PoC 제안',
    preview_text: '실제 환경에서 직접 검증하세요',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님,</h1><p>데모 세션에서 확인하신 GLEC의 강력한 기능을 실제 환경에서 직접 검증해보시겠습니까?</p><h2 style="color: #0600f7;">PoC 프로그램 안내</h2><ul><li>기간: 1개월 무료</li><li>귀사의 실제 물류 데이터 사용</li><li>전담 기술 지원팀 배정</li><li>맞춤형 리포트 제공</li></ul><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/poc-request?demo_id={demo_id}" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">PoC 신청하기</a></p><p>감사합니다.</p><p><strong>GLEC 팀</strong></p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n데모 세션에서 확인하신 GLEC의 강력한 기능을 실제 환경에서 직접 검증해보시겠습니까?\n\nPoC 프로그램:\n- 기간: 1개월 무료\n- 귀사의 실제 물류 데이터 사용\n- 전담 기술 지원팀 배정\n- 맞춤형 리포트 제공\n\nPoC 신청: https://glec.io/poc-request?demo_id={demo_id}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'demo_id'],
  },
  {
    category_key: 'DEMO_REQUEST',
    nurture_day: 14,
    template_key: 'DEMO_REQUEST_DAY14_V1',
    template_name: '데모 요청 Day 14 - 맞춤 견적서',
    description: '데모 후 14일차: 맞춤 견적서 발송',
    subject_line: '[GLEC] {company_name} 맞춤 견적서 - 예상 비용 및 ROI 분석',
    preview_text: '귀사의 사용량 기반 정확한 비용 산출',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님께 맞춤 견적서를 보내드립니다</h1><p>데모 세션에서 논의된 내용을 바탕으로 {company_name}에 최적화된 견적서를 작성했습니다.</p><h2 style="color: #0600f7;">견적 요약</h2><ul><li>DTG Series5: {quote_amount}원/월</li><li>예상 ROI: {roi_months}개월</li><li>연간 절감 비용: {savings_amount}원</li></ul><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/view-quote?quote_id={quote_id}" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">상세 견적서 보기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n{company_name} 맞춤 견적서:\n- DTG Series5: {quote_amount}원/월\n- 예상 ROI: {roi_months}개월\n- 연간 절감: {savings_amount}원\n\n상세 견적서: https://glec.io/view-quote?quote_id={quote_id}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'quote_amount', 'roi_months', 'savings_amount', 'quote_id'],
  },
  {
    category_key: 'DEMO_REQUEST',
    nurture_day: 30,
    template_key: 'DEMO_REQUEST_DAY30_V1',
    template_name: '데모 요청 Day 30 - 최종 결정 촉구',
    description: '데모 후 30일차: 최종 결정 독려',
    subject_line: '[GLEC] {contact_name}님, 도입 결정은 언제쯤 가능하실까요?',
    preview_text: '마지막으로 도움이 필요한 부분이 있는지 확인드립니다',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님,</h1><p>데모 세션 이후 한 달이 지났습니다. GLEC 도입과 관련하여 추가로 도움이 필요하신 부분이 있으신가요?</p><h2 style="color: #0600f7;">도입 결정을 위해 필요한 것</h2><ul><li>추가 기술 자료가 필요하신가요?</li><li>내부 승인 과정에서 도움이 필요하신가요?</li><li>가격 협상이 필요하신가요?</li></ul><p>언제든 편하게 연락 주세요. 최선을 다해 지원하겠습니다.</p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n데모 후 한 달이 지났습니다. 추가 도움이 필요하신가요?\n\n- 추가 기술 자료\n- 내부 승인 지원\n- 가격 협상\n\n언제든 연락 주세요.\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name'],
  },

  // ========== NEWSLETTER_SIGNUP (뉴스레터 구독) ==========
  {
    category_key: 'NEWSLETTER_SIGNUP',
    nurture_day: 3,
    template_key: 'NEWSLETTER_DAY3_V1',
    template_name: '뉴스레터 구독 Day 3 - 환영 및 인기 콘텐츠',
    description: '구독 후 3일차: 환영 메시지 및 인기 콘텐츠 소개',
    subject_line: '[GLEC] {contact_name}님 환영합니다! 탄소배출 관리 시작하기',
    preview_text: 'GLEC 뉴스레터 구독을 환영합니다',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">환영합니다 {contact_name}님!</h1><p>GLEC 뉴스레터 구독을 환영합니다. 매주 탄소배출 관리, 지속가능성, ESG 트렌드에 대한 인사이트를 보내드립니다.</p><h2 style="color: #0600f7;">이번 주 인기 콘텐츠</h2><ul><li>ISO 14083 완벽 가이드</li><li>EU CBAM 대응 전략</li><li>물류 탄소배출 계산 자동화</li></ul><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/knowledge" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">자료실 둘러보기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `환영합니다 {contact_name}님!\n\nGLEC 뉴스레터 구독 감사합니다.\n\n이번 주 인기 콘텐츠:\n- ISO 14083 완벽 가이드\n- EU CBAM 대응 전략\n- 탄소배출 계산 자동화\n\n자료실: https://glec.io/knowledge\n\nGLEC 팀`,
    available_variables: ['contact_name', 'email'],
  },
  {
    category_key: 'NEWSLETTER_SIGNUP',
    nurture_day: 7,
    template_key: 'NEWSLETTER_DAY7_V1',
    template_name: '뉴스레터 구독 Day 7 - 주간 뉴스레터',
    description: '구독 후 7일차: 첫 번째 주간 뉴스레터',
    subject_line: '[GLEC Weekly] 이번 주 탄소배출 관리 뉴스',
    preview_text: '주간 탄소배출 관리 인사이트',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">GLEC Weekly</h1><h2 style="color: #0600f7;">이번 주 하이라이트</h2><ul><li>EU CBAM 시행 일정 발표</li><li>글로벌 기업들의 탄소중립 전략</li><li>물류 산업의 그린 트랜스포메이션</li></ul><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/newsletter/{newsletter_id}" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">전체 뉴스레터 보기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `GLEC Weekly\n\n이번 주 하이라이트:\n- EU CBAM 시행 일정\n- 탄소중립 전략\n- 그린 트랜스포메이션\n\n전체 보기: https://glec.io/newsletter/{newsletter_id}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'newsletter_id'],
  },
  {
    category_key: 'NEWSLETTER_SIGNUP',
    nurture_day: 14,
    template_key: 'NEWSLETTER_DAY14_V1',
    template_name: '뉴스레터 구독 Day 14 - 무료 웨비나 초대',
    description: '구독 후 14일차: 무료 웨비나 초대',
    subject_line: '[GLEC] 무료 웨비나 초대: ISO 14083 실전 적용',
    preview_text: '전문가와 함께하는 1시간 무료 웨비나',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님을 무료 웨비나에 초대합니다</h1><p>주제: ISO 14083 실전 적용 사례</p><p>일시: {webinar_date}</p><p>연사: GLEC 기술이사</p><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/webinar/{webinar_id}" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">웨비나 등록하기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님 무료 웨비나 초대\n\n주제: ISO 14083 실전 적용\n일시: {webinar_date}\n연사: GLEC 기술이사\n\n등록: https://glec.io/webinar/{webinar_id}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'webinar_date', 'webinar_id'],
  },
  {
    category_key: 'NEWSLETTER_SIGNUP',
    nurture_day: 30,
    template_key: 'NEWSLETTER_DAY30_V1',
    template_name: '뉴스레터 구독 Day 30 - 구독 피드백',
    description: '구독 후 30일차: 뉴스레터 만족도 조사',
    subject_line: '[GLEC] 뉴스레터 만족도 조사 (30초 소요)',
    preview_text: '더 나은 콘텐츠를 위해 여러분의 의견이 필요합니다',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님의 의견이 필요합니다</h1><p>GLEC 뉴스레터를 구독하신 지 한 달이 되었습니다. 더 나은 콘텐츠를 제공하기 위해 간단한 설문에 참여해주세요.</p><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/survey/{survey_id}" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">설문 참여하기 (30초)</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n뉴스레터 만족도 조사에 참여해주세요 (30초).\n\n설문: https://glec.io/survey/{survey_id}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'survey_id'],
  },

  // ========== PRICING_INQUIRY (가격 문의) ==========
  {
    category_key: 'PRICING_INQUIRY',
    nurture_day: 3,
    template_key: 'PRICING_DAY3_V1',
    template_name: '가격 문의 Day 3 - 가격표 및 플랜 설명',
    description: '가격 문의 후 3일차: 상세 가격표 및 플랜 비교',
    subject_line: '[GLEC] {company_name} 맞춤 가격 안내',
    preview_text: 'GLEC 제품별 가격 및 플랜 비교',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님,</h1><p>GLEC 가격 문의 감사합니다. 상세 가격표를 안내드립니다.</p><h2 style="color: #0600f7;">제품별 가격</h2><ul><li>DTG Series5: 80만원 (1회 구매)</li><li>Carbon API: 48개 API 이용 가능</li><li>GLEC Cloud: 12만원/월 (연간 계약 시 할인)</li></ul><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/pricing" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">상세 가격표 보기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\nGLEC 가격표:\n- DTG Series5: 80만원\n- Carbon API: 48개 API\n- GLEC Cloud: 12만원/월\n\n상세 가격: https://glec.io/pricing\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name'],
  },
  {
    category_key: 'PRICING_INQUIRY',
    nurture_day: 7,
    template_key: 'PRICING_DAY7_V1',
    template_name: '가격 문의 Day 7 - ROI 계산기',
    description: '가격 문의 후 7일차: ROI 계산기 제공',
    subject_line: '[GLEC] GLEC 도입 시 예상 ROI 계산해보세요',
    preview_text: '간단한 입력으로 즉시 ROI 확인',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">GLEC ROI 계산기</h1><p>{contact_name}님, 귀사의 물류 규모에 맞는 예상 ROI를 즉시 계산해보세요.</p><p>평균 고객 ROI: 3개월</p><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/roi-calculator" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">ROI 계산하기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\nGLEC ROI 계산기로 예상 ROI를 확인하세요.\n평균 ROI: 3개월\n\n계산기: https://glec.io/roi-calculator\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name'],
  },
  {
    category_key: 'PRICING_INQUIRY',
    nurture_day: 14,
    template_key: 'PRICING_DAY14_V1',
    template_name: '가격 문의 Day 14 - 할인 혜택',
    description: '가격 문의 후 14일차: 기간 한정 할인 혜택',
    subject_line: '[GLEC] 이달 내 계약 시 20% 할인',
    preview_text: '기간 한정 특별 할인 혜택',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #d32f2f;">이달 내 계약 시 20% 할인</h1><p>{contact_name}님, 이달 내 계약하시면 20% 할인 혜택을 드립니다.</p><ul><li>DTG Series5: 80만원 → 64만원</li><li>GLEC Cloud: 12만원/월 → 9.6만원/월</li></ul><p>할인 종료: {expiry_date}</p><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/contact?ref=pricing_discount" style="background-color: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">지금 문의하기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n이달 내 계약 시 20% 할인:\n- DTG Series5: 64만원\n- GLEC Cloud: 9.6만원/월\n\n할인 종료: {expiry_date}\n\n문의: https://glec.io/contact\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'expiry_date'],
  },
  {
    category_key: 'PRICING_INQUIRY',
    nurture_day: 30,
    template_key: 'PRICING_DAY30_V1',
    template_name: '가격 문의 Day 30 - 맞춤 견적 제안',
    description: '가격 문의 후 30일차: 1:1 맞춤 견적 상담 제안',
    subject_line: '[GLEC] {company_name} 맞춤 견적 상담 (무료)',
    preview_text: '귀사의 예산에 맞는 최적의 플랜 제안',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">맞춤 견적 상담</h1><p>{contact_name}님, {company_name}의 예산과 니즈에 맞는 최적의 플랜을 제안해드립니다.</p><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/custom-quote" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">맞춤 견적 요청</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n{company_name} 맞춤 견적 상담을 제공합니다.\n\n견적 요청: https://glec.io/custom-quote\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name'],
  },

  // ========== PARTNERSHIP_INQUIRY (파트너십 문의) ==========
  {
    category_key: 'PARTNERSHIP_INQUIRY',
    nurture_day: 3,
    template_key: 'PARTNERSHIP_DAY3_V1',
    template_name: '파트너십 문의 Day 3 - 파트너 프로그램 소개',
    description: '파트너십 문의 후 3일차: 파트너 프로그램 안내',
    subject_line: '[GLEC] {company_name}와의 파트너십을 환영합니다',
    preview_text: 'GLEC 파트너 프로그램 안내',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님,</h1><p>{company_name}의 파트너십 문의 감사합니다.</p><h2 style="color: #0600f7;">GLEC 파트너 프로그램</h2><ul><li>기술 파트너: API 통합 지원</li><li>영업 파트너: 리셀러 프로그램</li><li>글로벌 파트너: DHL GoGreen 네트워크</li></ul><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/partnerships" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">파트너 프로그램 보기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n파트너십 문의 감사합니다.\n\nGLEC 파트너 프로그램:\n- 기술 파트너: API 통합\n- 영업 파트너: 리셀러\n- 글로벌 파트너: DHL 네트워크\n\n자세히: https://glec.io/partnerships\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name'],
  },
  {
    category_key: 'PARTNERSHIP_INQUIRY',
    nurture_day: 7,
    template_key: 'PARTNERSHIP_DAY7_V1',
    template_name: '파트너십 문의 Day 7 - 파트너 혜택',
    description: '파트너십 문의 후 7일차: 파트너 혜택 안내',
    subject_line: '[GLEC] 파트너사 전용 혜택 안내',
    preview_text: 'GLEC 파트너사만의 특별 혜택',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">파트너 전용 혜택</h1><p>{contact_name}님, GLEC 파트너사 전용 혜택을 안내드립니다.</p><ul><li>매출 커미션: 최대 30%</li><li>기술 지원: 전담팀 배정</li><li>마케팅 지원: 공동 마케팅</li><li>교육 프로그램: 무료 교육</li></ul><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n파트너 혜택:\n- 매출 커미션: 최대 30%\n- 기술 지원: 전담팀\n- 마케팅 지원: 공동 마케팅\n- 교육: 무료\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name'],
  },
  {
    category_key: 'PARTNERSHIP_INQUIRY',
    nurture_day: 14,
    template_key: 'PARTNERSHIP_DAY14_V1',
    template_name: '파트너십 문의 Day 14 - 파트너 계약서',
    description: '파트너십 문의 후 14일차: 파트너 계약서 발송',
    subject_line: '[GLEC] {company_name} 파트너 계약서 검토 요청',
    preview_text: '파트너 계약서를 검토해주세요',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">파트너 계약서</h1><p>{contact_name}님, {company_name}와의 파트너십 계약서를 첨부했습니다.</p><p>계약서를 검토하시고 질문이 있으시면 언제든 연락 주세요.</p><p style="text-align: center; margin: 30px 0;"><a href="https://glec.io/partner-agreement/{contract_id}" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">계약서 보기</a></p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n파트너 계약서를 검토해주세요.\n\n계약서: https://glec.io/partner-agreement/{contract_id}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'contract_id'],
  },
  {
    category_key: 'PARTNERSHIP_INQUIRY',
    nurture_day: 30,
    template_key: 'PARTNERSHIP_DAY30_V1',
    template_name: '파트너십 문의 Day 30 - 파트너십 최종 확인',
    description: '파트너십 문의 후 30일차: 파트너십 진행 상황 확인',
    subject_line: '[GLEC] {company_name} 파트너십 진행 상황 확인',
    preview_text: '파트너십 계약 진행을 위해 연락드립니다',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님,</h1><p>파트너십 계약 진행 상황을 확인하고자 연락드립니다.</p><p>추가로 필요한 자료나 논의할 사항이 있으시면 알려주세요.</p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n파트너십 진행 상황 확인차 연락드립니다.\n\n추가 논의사항이 있으시면 알려주세요.\n\nGLEC 팀`,
    available_variables: ['contact_name', 'company_name'],
  },

  // ========== CAREER_APPLICATION (채용 지원) ==========
  {
    category_key: 'CAREER_APPLICATION',
    nurture_day: 3,
    template_key: 'CAREER_DAY3_V1',
    template_name: '채용 지원 Day 3 - 지원 확인 및 회사 소개',
    description: '지원 후 3일차: 지원 확인 및 GLEC 소개',
    subject_line: '[GLEC] {contact_name}님의 지원 감사합니다',
    preview_text: 'GLEC 채용 프로세스 안내',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님,</h1><p>GLEC에 지원해 주셔서 감사합니다. 귀하의 지원서를 잘 받았습니다.</p><h2 style="color: #0600f7;">채용 프로세스</h2><ol><li>서류 심사: 7일 이내</li><li>1차 면접: 화상 면접</li><li>2차 면접: 최종 면접</li><li>최종 합격 통보</li></ol><p>결과는 이메일로 안내드리겠습니다.</p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\nGLEC 지원 감사합니다.\n\n채용 프로세스:\n1. 서류 심사: 7일\n2. 1차 면접: 화상\n3. 2차 면접: 최종\n4. 합격 통보\n\nGLEC 팀`,
    available_variables: ['contact_name', 'position'],
  },
  {
    category_key: 'CAREER_APPLICATION',
    nurture_day: 7,
    template_key: 'CAREER_DAY7_V1',
    template_name: '채용 지원 Day 7 - 서류 심사 결과',
    description: '지원 후 7일차: 서류 심사 결과 안내',
    subject_line: '[GLEC] {contact_name}님 서류 심사 결과 안내',
    preview_text: '서류 심사 결과를 알려드립니다',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">{contact_name}님,</h1><p>서류 심사 결과를 안내드립니다.</p><p>{result_message}</p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n서류 심사 결과:\n{result_message}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'position', 'result_message'],
  },
  {
    category_key: 'CAREER_APPLICATION',
    nurture_day: 14,
    template_key: 'CAREER_DAY14_V1',
    template_name: '채용 지원 Day 14 - 면접 일정 안내',
    description: '지원 후 14일차: 면접 일정 안내',
    subject_line: '[GLEC] {contact_name}님 면접 일정 안내',
    preview_text: '면접 일정이 확정되었습니다',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">면접 일정</h1><p>{contact_name}님,</p><p>면접 일정: {interview_date}</p><p>장소/링크: {interview_location}</p><p>면접관: {interviewer}</p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\n면접 일정:\n- 일시: {interview_date}\n- 장소: {interview_location}\n- 면접관: {interviewer}\n\nGLEC 팀`,
    available_variables: ['contact_name', 'position', 'interview_date', 'interview_location', 'interviewer'],
  },
  {
    category_key: 'CAREER_APPLICATION',
    nurture_day: 30,
    template_key: 'CAREER_DAY30_V1',
    template_name: '채용 지원 Day 30 - 최종 합격 통보',
    description: '지원 후 30일차: 최종 합격 통보',
    subject_line: '[GLEC] {contact_name}님 최종 합격을 축하드립니다!',
    preview_text: 'GLEC 가족이 되신 것을 환영합니다',
    html_body: `<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #0600f7;">합격을 축하드립니다!</h1><p>{contact_name}님,</p><p>GLEC {position} 포지션에 최종 합격하셨습니다.</p><p>입사일: {start_date}</p><p>GLEC 가족이 되신 것을 진심으로 환영합니다!</p><p>GLEC 팀</p></div></body></html>`,
    plain_text_body: `{contact_name}님,\n\nGLEC {position} 최종 합격!\n\n입사일: {start_date}\n\n환영합니다!\n\nGLEC 팀`,
    available_variables: ['contact_name', 'position', 'start_date'],
  },
];


// ============================================================
// Template Creation Logic
// ============================================================

async function createTemplates() {
  console.log('🚀 Creating 24 Generic Email Templates...\n');

  // 1. Fetch categories
  console.log('1️⃣ Fetching categories...');
  const categories = await sql`
    SELECT id, category_key, category_name
    FROM email_template_categories
    WHERE is_content_specific = FALSE
    ORDER BY category_name
  `;

  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.category_key] = cat.id;
  });

  console.log(`   ✅ Found ${categories.length} generic categories:`);
  categories.forEach(cat => {
    console.log(`      - ${cat.category_name} (${cat.category_key})`);
  });
  console.log();

  // 2. Create templates
  console.log('2️⃣ Creating templates...\n');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const template of templates) {
    const categoryId = categoryMap[template.category_key];

    if (!categoryId) {
      console.log(`   ❌ Category not found: ${template.category_key}`);
      failed++;
      continue;
    }

    try {
      // Check if template_key already exists
      const existing = await sql`
        SELECT id FROM email_templates WHERE template_key = ${template.template_key}
      `;

      if (existing.length > 0) {
        console.log(`   ⏭️  Skipped (already exists): ${template.template_name}`);
        skipped++;
        continue;
      }

      // Insert template
      await sql`
        INSERT INTO email_templates (
          category_id,
          template_key,
          template_name,
          description,
          nurture_day,
          subject_line,
          preview_text,
          html_body,
          plain_text_body,
          available_variables,
          is_active,
          is_default
        ) VALUES (
          ${categoryId},
          ${template.template_key},
          ${template.template_name},
          ${template.description},
          ${template.nurture_day},
          ${template.subject_line},
          ${template.preview_text},
          ${template.html_body},
          ${template.plain_text_body},
          ${JSON.stringify(template.available_variables)},
          TRUE,
          FALSE
        )
      `;

      console.log(`   ✅ Created: ${template.template_name}`);
      created++;
    } catch (error) {
      console.log(`   ❌ Failed: ${template.template_name}`);
      console.log(`      Error: ${error.message}`);
      failed++;
    }
  }

  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Template Creation Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total Defined: ${templates.length}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log();

  if (created === 24) {
    console.log('🎉 SUCCESS! All 24 generic email templates have been created!');
    console.log();
    console.log('📊 Template Breakdown:');
    console.log('   - CONTACT_FORM: 4 templates (Day 3, 7, 14, 30)');
    console.log('   - DEMO_REQUEST: 4 templates (Day 3, 7, 14, 30)');
    console.log('   - NEWSLETTER_SIGNUP: 4 templates (Day 3, 7, 14, 30)');
    console.log('   - PRICING_INQUIRY: 4 templates (Day 3, 7, 14, 30)');
    console.log('   - PARTNERSHIP_INQUIRY: 4 templates (Day 3, 7, 14, 30)');
    console.log('   - CAREER_APPLICATION: 4 templates (Day 3, 7, 14, 30)');
    console.log();
    console.log('✅ Next Steps:');
    console.log('   1. Test templates in Admin UI (http://localhost:3002/admin/email-templates)');
    console.log('   2. Review template content with marketing team');
    console.log('   3. Connect templates to nurture sequence cron jobs');
    console.log('   4. Monitor email delivery rates and open rates');
  } else if (created > 0) {
    console.log(`ℹ️  Created ${created} out of 24 templates.`);
    console.log(`   Run this script again to create remaining templates.`);
  } else {
    console.log('⚠️  No templates were created (all may already exist).');
    console.log('   Check Admin UI to view existing templates.');
  }
}

// Run
createTemplates().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
