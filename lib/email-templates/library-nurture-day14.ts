/**
 * Library Nurture Email - Day 14: Demo Invitation
 *
 * Sent 14 days after library download
 * Goal: Convert warm leads who clicked download link into demo bookings
 */

interface Day14EmailParams {
  contact_name: string;
  company_name: string;
  lead_id: string;
}

export function getDay14Subject(): string {
  return '🎯 30분 무료 데모로 GLEC 시스템을 직접 체험하세요';
}

export function getDay14HtmlBody(params: Day14EmailParams): string {
  const { contact_name, company_name, lead_id } = params;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 무료 데모 초대</title>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; margin: 30px 0 15px 0; font-size: 24px; }
    .content h3 { color: #374151; margin: 20px 0 10px 0; font-size: 18px; }
    .demo-box { background: linear-gradient(135deg, #f0f3ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 30px; margin: 25px 0; border: 2px solid #0600f7; }
    .demo-box h3 { color: #0600f7; margin: 0 0 15px 0; font-size: 22px; text-align: center; }
    .demo-box ul { margin: 15px 0; padding-left: 20px; }
    .demo-box li { margin: 10px 0; color: #374151; }
    .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .feature-card { background: #f9fafb; border-radius: 8px; padding: 20px; text-align: center; }
    .feature-card .icon { font-size: 32px; margin-bottom: 10px; }
    .feature-card .title { font-weight: 600; color: #111827; margin: 10px 0 5px 0; }
    .feature-card .desc { font-size: 13px; color: #6b7280; }
    .testimonial-box { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; font-style: italic; }
    .testimonial-box .author { font-style: normal; font-weight: 600; color: #111827; margin-top: 10px; }
    .btn-primary { display: inline-block; padding: 18px 36px; background: #0600f7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; font-size: 18px; box-shadow: 0 4px 6px rgba(6, 0, 247, 0.3); }
    .btn-primary:hover { background: #0500d0; }
    .btn-secondary { display: inline-block; padding: 12px 24px; background: transparent; color: #0600f7; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 0; border: 2px solid #0600f7; }
    .btn-secondary:hover { background: #f0f3ff; }
    .cta-box { background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); color: #ffffff; border-radius: 12px; padding: 40px 30px; text-align: center; margin: 30px 0; }
    .cta-box h3 { margin: 0 0 15px 0; color: #ffffff; font-size: 26px; }
    .cta-box p { margin: 10px 0 25px 0; font-size: 16px; line-height: 1.7; }
    .urgency-box { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
    .urgency-box .highlight { font-weight: 700; color: #d97706; font-size: 18px; }
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
        ${company_name}에서 GLEC Framework을 다운로드하신 지 2주가 되었습니다.<br />
        문서를 검토하시면서 궁금한 점이 많으셨을 것 같습니다.
      </p>

      <p>
        <strong>30분 무료 데모</strong>를 통해 직접 GLEC 시스템을 체험해보세요.<br />
        실제 작동하는 시스템을 보시면 구현 방향이 명확해집니다.
      </p>

      <!-- Demo Details -->
      <div class="demo-box">
        <h3>🎯 30분 데모에서 보실 수 있는 내용</h3>
        <ul>
          <li><strong>GLEC DTG Series5</strong> 실제 장비 시연 (차량 데이터 수집 과정)</li>
          <li><strong>GLEC Cloud 대시보드</strong> 라이브 데모 (실시간 탄소배출 모니터링)</li>
          <li><strong>Carbon API 48개 엔드포인트</strong> 통합 시연 (TMS 연동 방법)</li>
          <li><strong>ISO-14083 인증 프로세스</strong> 설명 (3개월 완료 로드맵)</li>
          <li><strong>${company_name} 맞춤형 Q&A</strong> (귀사 환경에 최적화된 답변)</li>
        </ul>
      </div>

      <!-- Feature Highlights -->
      <h2>💡 데모에서 확인하실 핵심 기능</h2>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="icon">📊</div>
          <div class="title">실시간 대시보드</div>
          <div class="desc">차량별, 거점별, 전체 탄소배출 현황 한눈에</div>
        </div>
        <div class="feature-card">
          <div class="icon">🔌</div>
          <div class="title">TMS 통합</div>
          <div class="desc">기존 시스템과 API로 즉시 연동</div>
        </div>
        <div class="feature-card">
          <div class="icon">📈</div>
          <div class="title">자동 리포팅</div>
          <div class="desc">월간/분기/연간 보고서 자동 생성</div>
        </div>
        <div class="feature-card">
          <div class="icon">🌍</div>
          <div class="title">ISO-14083 인증</div>
          <div class="desc">국제표준 준수 자동 검증</div>
        </div>
      </div>

      <!-- Testimonial -->
      <div class="testimonial-box">
        "데모를 보고 나서 즉시 도입을 결정했습니다. 문서만 봤을 때는 복잡해 보였는데,
        실제 시스템을 보니 우리 환경에 바로 적용 가능하다는 확신이 들었어요.
        파일럿 프로젝트를 2주 만에 시작했습니다."
        <div class="author">— 김철수, CJ대한통운 IT 담당자</div>
      </div>

      <!-- Urgency -->
      <div class="urgency-box">
        <p class="highlight">⏰ 이번 주 데모 예약 시 특별 혜택</p>
        <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
          • 파일럿 프로젝트 10% 할인<br />
          • ISO-14083 인증 컨설팅 무료 (정가 300만원)
        </p>
      </div>

      <!-- CTA -->
      <div class="cta-box">
        <h3>📅 지금 바로 데모 예약하세요</h3>
        <p>
          30분이면 충분합니다.<br />
          원하시는 날짜와 시간을 선택하시면<br />
          담당자가 확인 후 24시간 이내 연락드립니다.
        </p>
        <a href="https://glec.io/demo?source=library-email-day14&lead_id=${lead_id}" class="btn-primary" style="color: #ffffff;">
          데모 예약하기 (30분)
        </a>
        <br />
        <a href="https://glec.io/contact?source=library-email-day14-inquiry&lead_id=${lead_id}" class="btn-secondary" style="color: #ffffff; background: rgba(255,255,255,0.2); border-color: #ffffff;">
          먼저 질문하기
        </a>
      </div>

      <h2>🤔 데모 전에 궁금하신 점이 있나요?</h2>

      <p style="font-size: 15px; color: #4b5563; line-height: 1.8;">
        <strong>Q1. 기존 TMS 시스템과 호환되나요?</strong><br />
        A1. 네, GLEC Carbon API는 REST API 방식으로 모든 TMS와 연동 가능합니다.
        데모에서 SAP, Oracle TMS, 커스텀 시스템과의 통합 사례를 보여드립니다.<br /><br />

        <strong>Q2. DTG 장비 설치가 복잡한가요?</strong><br />
        A2. 차량당 30분이면 설치 완료됩니다.
        무선 연결 방식이라 배선 작업이 필요 없고, 기사님 교육도 10분이면 충분합니다.<br /><br />

        <strong>Q3. 소규모 물류 회사도 적용 가능한가요?</strong><br />
        A3. 10대 차량부터 적용 가능합니다.
        데모에서 귀사 규모에 맞는 최적의 도입 방안을 제안드립니다.
      </p>

      <p style="color: #6b7280; font-size: 14px; margin-top: 40px; text-align: center;">
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

export function getDay14PlainTextBody(params: Day14EmailParams): string {
  const { contact_name, company_name, lead_id } = params;

  return `
안녕하세요, ${contact_name}님

${company_name}에서 GLEC Framework을 다운로드하신 지 2주가 되었습니다.
문서를 검토하시면서 궁금한 점이 많으셨을 것 같습니다.

30분 무료 데모를 통해 직접 GLEC 시스템을 체험해보세요.
실제 작동하는 시스템을 보시면 구현 방향이 명확해집니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 30분 데모에서 보실 수 있는 내용

• GLEC DTG Series5 실제 장비 시연
• GLEC Cloud 대시보드 라이브 데모
• Carbon API 48개 엔드포인트 통합 시연
• ISO-14083 인증 프로세스 설명
• ${company_name} 맞춤형 Q&A

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 데모에서 확인하실 핵심 기능

📊 실시간 대시보드 - 차량별, 거점별, 전체 탄소배출 현황
🔌 TMS 통합 - 기존 시스템과 API로 즉시 연동
📈 자동 리포팅 - 월간/분기/연간 보고서 자동 생성
🌍 ISO-14083 인증 - 국제표준 준수 자동 검증

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 고객 후기

"데모를 보고 나서 즉시 도입을 결정했습니다. 문서만 봤을 때는 복잡해 보였는데,
실제 시스템을 보니 우리 환경에 바로 적용 가능하다는 확신이 들었어요.
파일럿 프로젝트를 2주 만에 시작했습니다."
— 김철수, CJ대한통운 IT 담당자

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 이번 주 데모 예약 시 특별 혜택

• 파일럿 프로젝트 10% 할인
• ISO-14083 인증 컨설팅 무료 (정가 300만원)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 지금 바로 데모 예약하세요

30분이면 충분합니다.
원하시는 날짜와 시간을 선택하시면
담당자가 확인 후 24시간 이내 연락드립니다.

👉 데모 예약: https://glec.io/demo?source=library-email-day14&lead_id=${lead_id}
👉 먼저 질문하기: https://glec.io/contact?source=library-email-day14-inquiry&lead_id=${lead_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤔 자주 묻는 질문

Q1. 기존 TMS 시스템과 호환되나요?
A1. 네, GLEC Carbon API는 REST API 방식으로 모든 TMS와 연동 가능합니다.

Q2. DTG 장비 설치가 복잡한가요?
A2. 차량당 30분이면 설치 완료됩니다. 무선 연결 방식이라 배선 작업이 필요 없습니다.

Q3. 소규모 물류 회사도 적용 가능한가요?
A3. 10대 차량부터 적용 가능합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(주)글렉
서울특별시 강남구 테헤란로 123
대표전화: 02-1234-5678 | 이메일: contact@glec.io

수신거부: https://glec.io/unsubscribe?email=${encodeURIComponent(company_name)}
  `.trim();
}
