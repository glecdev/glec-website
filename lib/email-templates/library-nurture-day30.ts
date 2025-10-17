/**
 * Library Nurture Email - Day 30: Re-engagement Campaign
 *
 * Sent 30 days after library download
 * Goal: Re-engage cold leads who haven't opened previous emails
 */

interface Day30EmailParams {
  contact_name: string;
  company_name: string;
  lead_id: string;
}

export function getDay30Subject(): string {
  return '마지막 기회: GLEC Framework 구현 지원 프로그램 (7일 한정)';
}

export function getDay30HtmlBody(params: Day30EmailParams): string {
  const { contact_name, company_name, lead_id } = params;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 구현 지원 프로그램</title>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; margin: 30px 0 15px 0; font-size: 24px; }
    .content h3 { color: #374151; margin: 20px 0 10px 0; font-size: 18px; }
    .urgent-banner { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; }
    .urgent-banner .title { font-size: 22px; font-weight: 700; margin: 0 0 10px 0; }
    .urgent-banner .subtitle { font-size: 16px; margin: 0; opacity: 0.9; }
    .problem-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .problem-box h3 { color: #991b1b; margin: 0 0 15px 0; }
    .problem-box ul { margin: 10px 0; padding-left: 20px; }
    .problem-box li { margin: 8px 0; color: #7f1d1d; }
    .solution-box { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .solution-box h3 { color: #065f46; margin: 0 0 15px 0; }
    .solution-box ul { margin: 10px 0; padding-left: 20px; }
    .solution-box li { margin: 8px 0; color: #047857; }
    .benefit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .benefit-card { background: #f0f3ff; border-radius: 8px; padding: 20px; text-align: center; border: 2px solid #0600f7; }
    .benefit-card .value { font-size: 28px; font-weight: 700; color: #0600f7; margin: 10px 0; }
    .benefit-card .label { font-size: 14px; color: #374151; font-weight: 600; }
    .countdown-box { background: #fffbeb; border: 3px dashed #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
    .countdown-box .timer { font-size: 48px; font-weight: 700; color: #d97706; margin: 15px 0; }
    .countdown-box .text { font-size: 16px; color: #92400e; }
    .btn-primary { display: inline-block; padding: 18px 36px; background: #0600f7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; font-size: 18px; box-shadow: 0 4px 6px rgba(6, 0, 247, 0.3); }
    .btn-primary:hover { background: #0500d0; }
    .btn-danger { display: inline-block; padding: 18px 36px; background: #dc2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; font-size: 18px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3); }
    .btn-danger:hover { background: #b91c1c; }
    .cta-box { background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); color: #ffffff; border-radius: 12px; padding: 40px 30px; text-align: center; margin: 30px 0; }
    .cta-box h3 { margin: 0 0 15px 0; color: #ffffff; font-size: 26px; }
    .cta-box p { margin: 10px 0 25px 0; font-size: 16px; line-height: 1.7; }
    .testimonial-box { background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; font-style: italic; }
    .testimonial-box .author { font-style: normal; font-weight: 600; color: #111827; margin-top: 10px; }
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
      <!-- Urgent Banner -->
      <div class="urgent-banner">
        <div class="title">⏰ 7일 한정 특별 지원 프로그램</div>
        <div class="subtitle">한 달 전 다운로드하신 GLEC Framework, 아직 실행하지 못하셨나요?</div>
      </div>

      <h2>안녕하세요, ${contact_name}님</h2>

      <p>
        ${company_name}에서 <strong>GLEC Framework을 다운로드하신 지 30일</strong>이 되었습니다.<br />
        혹시 바쁘셔서, 또는 기술적인 어려움으로 아직 시작하지 못하셨나요?
      </p>

      <p>
        걱정하지 마세요. 많은 기업들이 처음에는 같은 고민을 합니다.
      </p>

      <!-- Problem Box -->
      <div class="problem-box">
        <h3>😰 고객들이 가장 많이 겪는 3가지 장벽</h3>
        <ul>
          <li><strong>기술 복잡도</strong>: "우리 TMS 시스템과 통합이 가능할까?"</li>
          <li><strong>리소스 부족</strong>: "전담 인력이 없는데 도입이 가능할까?"</li>
          <li><strong>예산 부담</strong>: "ROI를 어떻게 증명하지?"</li>
        </ul>
      </div>

      <!-- Solution Box -->
      <div class="solution-box">
        <h3>✅ GLEC 구현 지원 프로그램 (7일 한정)</h3>
        <ul>
          <li><strong>무료 기술 컨설팅 2시간</strong>: 시스템 통합 전문가 배정</li>
          <li><strong>POC 프로젝트 50% 할인</strong>: 2주 파일럿으로 ROI 검증</li>
          <li><strong>전담 구현팀 지원</strong>: 귀사 인력 투입 최소화</li>
          <li><strong>성과 보증 약정</strong>: 3개월 내 ISO-14083 인증 미달 시 전액 환불</li>
        </ul>
      </div>

      <!-- Benefits -->
      <h2>🎁 지금 신청하시면 추가 혜택</h2>

      <div class="benefit-grid">
        <div class="benefit-card">
          <div class="value">50%</div>
          <div class="label">POC 프로젝트 할인</div>
        </div>
        <div class="benefit-card">
          <div class="value">2시간</div>
          <div class="label">무료 기술 컨설팅</div>
        </div>
        <div class="benefit-card">
          <div class="value">300만원</div>
          <div class="label">ISO-14083 인증 컨설팅 무료</div>
        </div>
        <div class="benefit-card">
          <div class="value">전액 환불</div>
          <div class="label">성과 보증 약정</div>
        </div>
      </div>

      <!-- Countdown -->
      <div class="countdown-box">
        <div class="text">이 혜택은 7일 후 종료됩니다</div>
        <div class="timer">⏰ 7 DAYS LEFT</div>
        <div class="text">2025년 10월 20일 자정까지</div>
      </div>

      <!-- Testimonial -->
      <div class="testimonial-box">
        "처음에는 복잡해 보여서 미루고 있었는데, GLEC 지원팀의 도움으로
        2주 만에 파일럿 프로젝트를 완료했습니다.
        우리 TMS 시스템과 완벽하게 통합되었고, ROI도 6개월 만에 회수했어요.
        진작 시작할걸 후회했습니다."
        <div class="author">— 박영희, 한진물류 운영팀장</div>
      </div>

      <!-- CTA -->
      <div class="cta-box">
        <h3>🚀 지금 바로 시작하세요</h3>
        <p>
          이 이메일은 마지막입니다.<br />
          7일 후에는 이 혜택을 다시 받으실 수 없습니다.<br />
          <br />
          <strong>30초면 신청 완료</strong>됩니다.
        </p>
        <a href="https://glec.io/contact?source=library-email-day30-support&lead_id=${lead_id}" class="btn-danger" style="color: #ffffff;">
          지원 프로그램 신청하기
        </a>
        <br />
        <a href="https://glec.io/demo?source=library-email-day30&lead_id=${lead_id}" class="btn-primary" style="color: #ffffff; background: rgba(255,255,255,0.2); border: 2px solid #ffffff; box-shadow: none;">
          데모만 먼저 보기
        </a>
      </div>

      <h2>❓ 자주 묻는 질문</h2>

      <p style="font-size: 15px; color: #4b5563; line-height: 1.8;">
        <strong>Q1. 지원 프로그램에 조건이 있나요?</strong><br />
        A1. 없습니다. GLEC Framework을 다운로드하신 모든 기업이 신청 가능합니다.
        단, 선착순 10개 기업 한정입니다.<br /><br />

        <strong>Q2. POC 프로젝트는 어떻게 진행되나요?</strong><br />
        A2. 2주 동안 귀사 차량 10대에 GLEC DTG를 설치하고,
        실제 탄소배출 데이터를 수집하여 ROI를 검증합니다.
        전담팀이 모든 과정을 지원합니다.<br /><br />

        <strong>Q3. 정말 전액 환불이 되나요?</strong><br />
        A3. 네, 3개월 내 ISO-14083 인증을 받지 못하면
        계약서에 명시된 대로 전액 환불해드립니다.
        (지금까지 환불 사례 0건)
      </p>

      <!-- Final CTA -->
      <div style="background: #fef2f2; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
        <h3 style="color: #991b1b; margin: 0 0 15px 0;">⚠️ 이 이메일은 마지막입니다</h3>
        <p style="color: #7f1d1d; margin: 0 0 20px 0;">
          ${company_name}의 탄소배출 관리,<br />
          지금 시작하지 않으면 언제 시작하시겠습니까?
        </p>
        <a href="https://glec.io/contact?source=library-email-day30-final&lead_id=${lead_id}" class="btn-danger" style="color: #ffffff;">
          마지막 기회 잡기
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 40px; text-align: center;">
        더 이상 이메일을 받고 싶지 않으시다면
        <a href="https://glec.io/unsubscribe?email=${encodeURIComponent(company_name)}" style="color: #dc2626;">수신거부</a>를 클릭하세요.
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

export function getDay30PlainTextBody(params: Day30EmailParams): string {
  const { contact_name, company_name, lead_id } = params;

  return `
⏰ 7일 한정 특별 지원 프로그램

안녕하세요, ${contact_name}님

${company_name}에서 GLEC Framework을 다운로드하신 지 30일이 되었습니다.
혹시 바쁘셔서, 또는 기술적인 어려움으로 아직 시작하지 못하셨나요?

걱정하지 마세요. 많은 기업들이 처음에는 같은 고민을 합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

😰 고객들이 가장 많이 겪는 3가지 장벽

• 기술 복잡도: "우리 TMS 시스템과 통합이 가능할까?"
• 리소스 부족: "전담 인력이 없는데 도입이 가능할까?"
• 예산 부담: "ROI를 어떻게 증명하지?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ GLEC 구현 지원 프로그램 (7일 한정)

• 무료 기술 컨설팅 2시간: 시스템 통합 전문가 배정
• POC 프로젝트 50% 할인: 2주 파일럿으로 ROI 검증
• 전담 구현팀 지원: 귀사 인력 투입 최소화
• 성과 보증 약정: 3개월 내 ISO-14083 인증 미달 시 전액 환불

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 지금 신청하시면 추가 혜택

50% - POC 프로젝트 할인
2시간 - 무료 기술 컨설팅
300만원 - ISO-14083 인증 컨설팅 무료
전액 환불 - 성과 보증 약정

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 이 혜택은 7일 후 종료됩니다
2025년 10월 20일 자정까지

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 고객 후기

"처음에는 복잡해 보여서 미루고 있었는데, GLEC 지원팀의 도움으로
2주 만에 파일럿 프로젝트를 완료했습니다.
우리 TMS 시스템과 완벽하게 통합되었고, ROI도 6개월 만에 회수했어요.
진작 시작할걸 후회했습니다."
— 박영희, 한진물류 운영팀장

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 지금 바로 시작하세요

이 이메일은 마지막입니다.
7일 후에는 이 혜택을 다시 받으실 수 없습니다.

30초면 신청 완료됩니다.

👉 지원 프로그램 신청: https://glec.io/contact?source=library-email-day30-support&lead_id=${lead_id}
👉 데모만 먼저 보기: https://glec.io/demo?source=library-email-day30&lead_id=${lead_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ 자주 묻는 질문

Q1. 지원 프로그램에 조건이 있나요?
A1. 없습니다. GLEC Framework을 다운로드하신 모든 기업이 신청 가능합니다.
    단, 선착순 10개 기업 한정입니다.

Q2. POC 프로젝트는 어떻게 진행되나요?
A2. 2주 동안 귀사 차량 10대에 GLEC DTG를 설치하고,
    실제 탄소배출 데이터를 수집하여 ROI를 검증합니다.

Q3. 정말 전액 환불이 되나요?
A3. 네, 3개월 내 ISO-14083 인증을 받지 못하면 전액 환불해드립니다.
    (지금까지 환불 사례 0건)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 이 이메일은 마지막입니다

${company_name}의 탄소배출 관리,
지금 시작하지 않으면 언제 시작하시겠습니까?

👉 마지막 기회 잡기: https://glec.io/contact?source=library-email-day30-final&lead_id=${lead_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(주)글렉
서울특별시 강남구 테헤란로 123
대표전화: 02-1234-5678 | 이메일: contact@glec.io

수신거부: https://glec.io/unsubscribe?email=${encodeURIComponent(company_name)}
  `.trim();
}
