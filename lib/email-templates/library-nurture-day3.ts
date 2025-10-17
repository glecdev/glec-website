/**
 * Library Nurture Email - Day 3: Implementation Guide
 *
 * Sent 3 days after library download
 * Goal: Help users implement the GLEC Framework
 */

interface Day3EmailParams {
  contact_name: string;
  company_name: string;
  library_title: string;
  lead_id: string;
}

export function getDay3Subject(): string {
  return 'GLEC Framework 구현 가이드를 보내드립니다';
}

export function getDay3HtmlBody(params: Day3EmailParams): string {
  const { contact_name, company_name, library_title, lead_id } = params;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC Framework 구현 가이드</title>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; margin: 30px 0 15px 0; font-size: 24px; }
    .content h3 { color: #374151; margin: 20px 0 10px 0; font-size: 18px; }
    .checklist { list-style: none; padding: 0; }
    .checklist li { margin: 12px 0; padding-left: 30px; position: relative; font-size: 15px; line-height: 1.6; }
    .checklist li:before { content: "☐"; position: absolute; left: 0; color: #0600f7; font-size: 20px; font-weight: bold; }
    .phase-box { background: #f0f3ff; border-left: 4px solid #0600f7; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .phase-box h3 { margin-top: 0; color: #0600f7; }
    .btn-primary { display: inline-block; padding: 16px 32px; background: #0600f7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; text-align: center; }
    .btn-primary:hover { background: #0500d0; }
    .btn-secondary { display: inline-block; padding: 16px 32px; background: #ffffff; color: #0600f7; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; border: 2px solid #0600f7; text-align: center; }
    .btn-secondary:hover { background: #f0f3ff; }
    .cta-box { background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); color: #ffffff; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
    .cta-box h3 { margin: 0 0 10px 0; color: #ffffff; }
    .cta-box p { color: rgba(255,255,255,0.9); margin: 0 0 20px 0; }
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
        지난 3일 전 다운로드하신 <strong>${library_title}</strong>은 잘 확인하셨나요?
      </p>

      <p>
        많은 고객사가 <em>"프레임워크를 다운로드했지만 어디서부터 시작해야 할지 모르겠다"</em>는 피드백을 주셨습니다.
        그래서 <strong>3단계 구현 가이드</strong>를 준비했습니다.
      </p>

      <!-- Phase 1 -->
      <div class="phase-box">
        <h3>📋 1단계: 현황 분석 (1주차)</h3>
        <ul class="checklist">
          <li>현재 물류 루트 매핑 (출발지 → 경유지 → 도착지)</li>
          <li>탄소배출 데이터 수집 범위 정의</li>
          <li>이해관계자 인터뷰 (물류팀, IT팀, 경영진)</li>
          <li>GLEC Framework 요구사항 체크리스트 작성</li>
        </ul>
      </div>

      <!-- Phase 2 -->
      <div class="phase-box">
        <h3>🧪 2단계: 파일럿 프로젝트 (2-3주차)</h3>
        <ul class="checklist">
          <li>1개 루트 선정 (예: 서울 → 부산)</li>
          <li>GLEC DTG Series5 설치 (무료 데모 신청 가능)</li>
          <li>2주간 데이터 수집 및 검증</li>
          <li>Carbon API 연동 테스트 (48개 API 활용)</li>
        </ul>
      </div>

      <!-- Phase 3 -->
      <div class="phase-box">
        <h3>🚀 3단계: 본격 도입 (4-8주차)</h3>
        <ul class="checklist">
          <li>전체 루트로 확장 (전국 거점 포함)</li>
          <li>GLEC Cloud 대시보드 구축</li>
          <li>ISO-14083 인증 준비 (글로벌 화주 대응)</li>
          <li>월간 탄소배출 리포트 자동화</li>
        </ul>
      </div>

      <h2>💡 구현 과정에서 자주 묻는 질문 (FAQ)</h2>

      <p><strong>Q1. 기존 시스템과 어떻게 연동하나요?</strong></p>
      <p>
        → GLEC Carbon API는 RESTful API 방식으로 제공되어 어떤 시스템과도 쉽게 연동됩니다.
        TMS(운송관리시스템), WMS(창고관리시스템), ERP와 표준 HTTP 통신으로 연결 가능합니다.
      </p>

      <p><strong>Q2. 도입 비용은 얼마나 드나요?</strong></p>
      <p>
        → 파일럿 프로젝트는 <strong>무료 데모</strong>로 진행 가능합니다.
        본격 도입 시 DTG Series5 (80만원), Carbon API (1,200만원/연), GLEC Cloud (12만원/월) 중 선택하실 수 있습니다.
      </p>

      <p><strong>Q3. ISO-14083 인증은 얼마나 걸리나요?</strong></p>
      <p>
        → 일반적으로 <strong>3-6개월</strong> 소요됩니다.
        GLEC 시스템을 사용하면 데이터 수집 자동화로 인증 기간을 <strong>50% 단축</strong>할 수 있습니다.
      </p>

      <!-- CTA -->
      <div class="cta-box">
        <h3>📞 무료 상담 신청</h3>
        <p>
          구현 과정에서 막히는 부분이 있으신가요?<br />
          전문 컨설턴트가 ${company_name}에 맞는 로드맵을 제안해드립니다.
        </p>
        <a href="https://glec.io/contact?source=library-email-day3&lead_id=${lead_id}" class="btn-primary" style="color: #ffffff;">
          무료 상담 신청하기
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
        <a href="https://glec.io/unsubscribe?email=${encodeURIComponent(params.company_name)}">수신거부</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
        본 이메일은 ${company_name}의 요청으로 발송되었습니다.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getDay3PlainTextBody(params: Day3EmailParams): string {
  const { contact_name, company_name, library_title, lead_id } = params;

  return `
안녕하세요, ${contact_name}님

지난 3일 전 다운로드하신 "${library_title}"은 잘 확인하셨나요?

많은 고객사가 "프레임워크를 다운로드했지만 어디서부터 시작해야 할지 모르겠다"는 피드백을 주셨습니다.
그래서 3단계 구현 가이드를 준비했습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 1단계: 현황 분석 (1주차)
  ☐ 현재 물류 루트 매핑
  ☐ 탄소배출 데이터 수집 범위 정의
  ☐ 이해관계자 인터뷰
  ☐ GLEC Framework 요구사항 체크리스트 작성

🧪 2단계: 파일럿 프로젝트 (2-3주차)
  ☐ 1개 루트 선정 (예: 서울 → 부산)
  ☐ GLEC DTG Series5 설치 (무료 데모 신청 가능)
  ☐ 2주간 데이터 수집 및 검증
  ☐ Carbon API 연동 테스트

🚀 3단계: 본격 도입 (4-8주차)
  ☐ 전체 루트로 확장
  ☐ GLEC Cloud 대시보드 구축
  ☐ ISO-14083 인증 준비
  ☐ 월간 탄소배출 리포트 자동화

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 자주 묻는 질문 (FAQ)

Q1. 기존 시스템과 어떻게 연동하나요?
→ GLEC Carbon API는 RESTful API 방식으로 제공되어 어떤 시스템과도 쉽게 연동됩니다.

Q2. 도입 비용은 얼마나 드나요?
→ 파일럿 프로젝트는 무료 데모로 진행 가능합니다.

Q3. ISO-14083 인증은 얼마나 걸리나요?
→ 일반적으로 3-6개월 소요됩니다. GLEC 시스템 사용 시 50% 단축 가능합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 무료 상담 신청

구현 과정에서 막히는 부분이 있으신가요?
전문 컨설턴트가 ${company_name}에 맞는 로드맵을 제안해드립니다.

👉 무료 상담 신청: https://glec.io/contact?source=library-email-day3&lead_id=${lead_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(주)글렉
서울특별시 강남구 테헤란로 123
대표전화: 02-1234-5678 | 이메일: contact@glec.io

수신거부: https://glec.io/unsubscribe?email=${encodeURIComponent(params.company_name)}
  `.trim();
}
