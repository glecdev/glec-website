/**
 * Library Nurture Email - Day 7: Customer Case Study
 *
 * Sent 7 days after library download
 * Goal: Show proof of success with CJ Logistics case study
 */

interface Day7EmailParams {
  contact_name: string;
  company_name: string;
  lead_id: string;
}

export function getDay7Subject(): string {
  return 'CJ대한통운은 GLEC으로 연간 1,200톤 CO2를 절감했습니다';
}

export function getDay7HtmlBody(params: Day7EmailParams): string {
  const { contact_name, company_name, lead_id } = params;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CJ대한통운 성공 사례</title>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; margin: 30px 0 15px 0; font-size: 24px; }
    .content h3 { color: #374151; margin: 20px 0 10px 0; font-size: 18px; }
    .stat-box { background: #f0f3ff; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center; }
    .stat-box .number { font-size: 48px; font-weight: bold; color: #0600f7; margin: 0; line-height: 1; }
    .stat-box .label { font-size: 14px; color: #6b7280; margin: 10px 0 0 0; }
    .challenge-box { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .solution-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .result-box { background: #f0f3ff; border-left: 4px solid #0600f7; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .result-box ul { margin: 10px 0; padding-left: 20px; }
    .result-box li { margin: 8px 0; }
    .btn-primary { display: inline-block; padding: 16px 32px; background: #0600f7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .btn-primary:hover { background: #0500d0; }
    .cta-box { background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); color: #ffffff; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
    .cta-box h3 { margin: 0 0 10px 0; color: #ffffff; }
    .footer { text-align: center; padding: 30px 20px; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
    .footer a { color: #0600f7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>GLEC</h1>
      <p>ISO-14083 국제표준 물류 탄소배출 측정</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <h2>안녕하세요, ${contact_name}님</h2>

      <p>
        GLEC Framework을 다운로드하신 지 일주일이 되었습니다.<br />
        구현 과정은 순조로우신가요?
      </p>

      <p>
        오늘은 <strong>CJ대한통운 사례</strong>를 공유드립니다.
      </p>

      <!-- Challenge -->
      <div class="challenge-box">
        <h3>🎯 도전 과제</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>전국 <strong>200개 물류 거점</strong>, <strong>5,000대 차량</strong> 관리</li>
          <li>탄소배출 데이터 수집 자동화 필요 (기존: 수작업 엑셀)</li>
          <li>ISO-14083 국제표준 준수 필수 (글로벌 화주 요구사항)</li>
          <li>실시간 탄소배출 모니터링 시스템 부재</li>
        </ul>
      </div>

      <!-- Solution -->
      <div class="solution-box">
        <h3>💡 GLEC 솔루션</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>GLEC DTG Series5</strong> 5,000대 설치 (차량 위치, 연료, 거리 자동 수집)</li>
          <li><strong>Carbon API</strong> 48개 엔드포인트 연동 (TMS 시스템과 실시간 연계)</li>
          <li><strong>GLEC Cloud</strong> 대시보드 구축 (경영진 실시간 모니터링)</li>
          <li>ISO-14083 인증 컨설팅 (3개월 완료)</li>
        </ul>
      </div>

      <!-- Results -->
      <div class="result-box">
        <h3>✅ 성과</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>연간 1,200톤 CO2 절감</strong> (루트 최적화로 불필요한 이동 25% 감소)</li>
          <li><strong>데이터 수집 시간 95% 단축</strong> (월 40시간 → 2시간)</li>
          <li><strong>DHL GoGreen 파트너십 체결</strong> (글로벌 인증 획득)</li>
          <li><strong>탄소배출 리포트 자동화</strong> (월간/분기/연간 자동 생성)</li>
        </ul>
      </div>

      <!-- Stats -->
      <h2>📊 주요 성과 지표</h2>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div class="stat-box">
          <p class="number">1,200톤</p>
          <p class="label">연간 CO2 절감</p>
        </div>
        <div class="stat-box">
          <p class="number">95%</p>
          <p class="label">작업 시간 단축</p>
        </div>
        <div class="stat-box">
          <p class="number">5,000대</p>
          <p class="label">DTG 설치 차량</p>
        </div>
        <div class="stat-box">
          <p class="number">3개월</p>
          <p class="label">ISO 인증 완료</p>
        </div>
      </div>

      <h2>💬 ${company_name}도 가능할까요?</h2>

      <p>
        <strong>네, 가능합니다.</strong><br />
        CJ대한통운처럼 대규모 물류가 아니어도 GLEC 시스템은 <strong>10대 차량</strong>부터 적용 가능합니다.
      </p>

      <p>
        무료 데모를 통해 귀사 환경에서 직접 테스트해보세요.<br />
        파일럿 프로젝트는 <strong>2주 이내</strong>에 시작할 수 있습니다.
      </p>

      <!-- CTA -->
      <div class="cta-box">
        <h3>📄 Full Case Study 다운로드</h3>
        <p>
          CJ대한통운 성공 사례 전문 (PDF 30페이지)을 다운로드하세요.
        </p>
        <a href="https://drive.google.com/file/d/1mS9i6Mj5z68Vefmyu3OM_YZYobVEu1UZ/view" class="btn-primary" style="color: #ffffff;">
          Case Study PDF 다운로드
        </a>
        <br />
        <a href="https://glec.io/demo?source=library-email-day7&lead_id=${lead_id}" class="btn-primary" style="color: #ffffff; margin-top: 10px;">
          무료 데모 신청하기
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
        이메일이 제대로 표시되지 않나요? <a href="https://glec.io/library" style="color: #0600f7;">웹 브라우저에서 보기</a>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>(주)글렉</strong><br />
        서울특별시 강남구 테헤란로 123<br />
        대표전화: 02-1234-5678 | 이메일: contact@glec.io
      </p>
      <p>
        <a href="https://glec.io/privacy-policy">개인정보처리방침</a> |
        <a href="https://glec.io/terms">이용약관</a> |
        <a href="https://glec.io/unsubscribe?email=${encodeURIComponent(company_name)}">수신거부</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getDay7PlainTextBody(params: Day7EmailParams): string {
  const { contact_name, company_name, lead_id } = params;

  return `
안녕하세요, ${contact_name}님

GLEC Framework을 다운로드하신 지 일주일이 되었습니다.
구현 과정은 순조로우신가요?

오늘은 CJ대한통운 사례를 공유드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 도전 과제

• 전국 200개 물류 거점, 5,000대 차량 관리
• 탄소배출 데이터 수집 자동화 필요
• ISO-14083 국제표준 준수 필수
• 실시간 탄소배출 모니터링 시스템 부재

💡 GLEC 솔루션

• GLEC DTG Series5 5,000대 설치
• Carbon API 48개 엔드포인트 연동
• GLEC Cloud 대시보드 구축
• ISO-14083 인증 컨설팅

✅ 성과

• 연간 1,200톤 CO2 절감
• 데이터 수집 시간 95% 단축
• DHL GoGreen 파트너십 체결
• 탄소배출 리포트 자동화

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 주요 성과 지표

1,200톤 - 연간 CO2 절감
   95% - 작업 시간 단축
5,000대 - DTG 설치 차량
  3개월 - ISO 인증 완료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 ${company_name}도 가능할까요?

네, 가능합니다.
10대 차량부터 적용 가능하며, 무료 데모를 통해 테스트할 수 있습니다.

👉 Case Study PDF: https://drive.google.com/file/d/1mS9i6Mj5z68Vefmyu3OM_YZYobVEu1UZ/view
👉 무료 데모 신청: https://glec.io/demo?source=library-email-day7&lead_id=${lead_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(주)글렉
서울특별시 강남구 테헤란로 123
대표전화: 02-1234-5678 | 이메일: contact@glec.io

수신거부: https://glec.io/unsubscribe?email=${encodeURIComponent(company_name)}
  `.trim();
}
