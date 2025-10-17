/**
 * Demo Request Confirmation Email
 *
 * Sent immediately after user submits demo request
 * Goal: Confirm receipt, provide next steps, build trust
 */

export interface DemoConfirmationEmailParams {
  contact_name: string;
  company_name: string;
  preferred_date: string;
  preferred_time: string;
  demo_request_id: string;
  product_interests: string[];
}

export function getDemoConfirmationSubject(): string {
  return '✅ GLEC 데모 신청이 접수되었습니다 (24시간 내 연락)';
}

export function getDemoConfirmationHtmlBody(params: DemoConfirmationEmailParams): string {
  const { contact_name, company_name, preferred_date, preferred_time, demo_request_id, product_interests } = params;

  const productsHtml = product_interests.map((p) => `<li>${p}</li>`).join('');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 데모 신청 확인</title>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); }
    .header h1 { color: #ffffff; margin: 0; font-size: 32px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; margin: 30px 0 15px 0; font-size: 24px; }
    .content h3 { color: #374151; margin: 20px 0 10px 0; font-size: 18px; }
    .success-banner { background: linear-gradient(135deg, #10b981 0%, #047857 100%); color: #ffffff; padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; }
    .success-banner .icon { font-size: 48px; margin-bottom: 10px; }
    .success-banner .title { font-size: 22px; font-weight: 700; margin: 10px 0; }
    .success-banner .subtitle { font-size: 16px; margin: 5px 0; opacity: 0.9; }
    .info-box { background: #f0f3ff; border-left: 4px solid #0600f7; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-box h3 { color: #0600f7; margin: 0 0 15px 0; }
    .info-box .detail { margin: 10px 0; }
    .info-box .label { font-weight: 600; color: #374151; }
    .info-box .value { color: #111827; }
    .timeline-box { background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 25px 0; }
    .timeline-item { display: flex; margin: 20px 0; }
    .timeline-icon { width: 40px; height: 40px; background: #0600f7; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px; flex-shrink: 0; }
    .timeline-content { flex: 1; }
    .timeline-content .title { font-weight: 600; color: #111827; margin: 0 0 5px 0; }
    .timeline-content .desc { font-size: 14px; color: #6b7280; margin: 0; }
    .prep-box { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .prep-box h3 { color: #d97706; margin: 0 0 15px 0; }
    .prep-box ul { margin: 10px 0; padding-left: 20px; }
    .prep-box li { margin: 8px 0; color: #92400e; }
    .btn-primary { display: inline-block; padding: 16px 32px; background: #0600f7; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
    .btn-primary:hover { background: #0500d0; }
    .btn-secondary { display: inline-block; padding: 16px 32px; background: transparent; color: #0600f7; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; border: 2px solid #0600f7; }
    .btn-secondary:hover { background: #f0f3ff; }
    .cta-box { background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); color: #ffffff; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
    .cta-box h3 { margin: 0 0 15px 0; color: #ffffff; font-size: 22px; }
    .cta-box p { margin: 10px 0 20px 0; font-size: 15px; }
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
      <!-- Success Banner -->
      <div class="success-banner">
        <div class="icon">✅</div>
        <div class="title">데모 신청이 접수되었습니다!</div>
        <div class="subtitle">담당자가 24시간 이내에 연락드립니다</div>
      </div>

      <h2>안녕하세요, ${contact_name}님</h2>

      <p>
        ${company_name}에서 GLEC 제품 데모를 신청해주셔서 감사합니다.<br />
        귀사의 탄소배출 관리를 도울 수 있게 되어 기쁩니다.
      </p>

      <!-- Request Details -->
      <div class="info-box">
        <h3>📋 신청 정보</h3>
        <div class="detail">
          <span class="label">신청 번호:</span>
          <span class="value">${demo_request_id.substring(0, 8).toUpperCase()}</span>
        </div>
        <div class="detail">
          <span class="label">회사명:</span>
          <span class="value">${company_name}</span>
        </div>
        <div class="detail">
          <span class="label">담당자:</span>
          <span class="value">${contact_name}</span>
        </div>
        <div class="detail">
          <span class="label">희망 일시:</span>
          <span class="value">${preferred_date} ${preferred_time}</span>
        </div>
        <div class="detail">
          <span class="label">관심 제품:</span>
          <ul style="margin: 5px 0 0 0; padding-left: 20px;">
            ${productsHtml}
          </ul>
        </div>
      </div>

      <!-- Timeline -->
      <h2>🚀 다음 단계</h2>

      <div class="timeline-box">
        <div class="timeline-item">
          <div class="timeline-icon">1</div>
          <div class="timeline-content">
            <div class="title">담당자 배정 (24시간 이내)</div>
            <div class="desc">귀사 산업 분야에 경험이 있는 전문가가 배정됩니다</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">2</div>
          <div class="timeline-content">
            <div class="title">일정 확정 전화</div>
            <div class="desc">희망 일시를 확인하고 최종 일정을 조율합니다</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">3</div>
          <div class="timeline-content">
            <div class="title">사전 준비 자료 발송</div>
            <div class="desc">데모 전 귀사 환경에 맞춤화된 자료를 보내드립니다</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">4</div>
          <div class="timeline-content">
            <div class="title">30분 제품 데모 (온라인)</div>
            <div class="desc">Zoom으로 진행되며, 실시간 Q&A가 포함됩니다</div>
          </div>
        </div>
      </div>

      <!-- Preparation Tips -->
      <div class="prep-box">
        <h3>💡 데모 전 준비하시면 좋은 것들</h3>
        <ul>
          <li>현재 사용 중인 탄소배출 측정 방법 (엑셀 파일, 기존 시스템 등)</li>
          <li>월간 물류 운송량 및 차량 대수</li>
          <li>ISO-14083 인증 목표 시기</li>
          <li>기존 TMS 시스템 정보 (SAP, Oracle, 커스텀 등)</li>
          <li>궁금하신 점 리스트</li>
        </ul>
        <p style="font-size: 13px; color: #92400e; margin: 10px 0 0 0;">
          * 준비가 안 되셔도 괜찮습니다. 데모 중에 함께 확인하겠습니다.
        </p>
      </div>

      <!-- CTA -->
      <div class="cta-box">
        <h3>📞 긴급한 문의가 있으신가요?</h3>
        <p>
          일정 변경이나 추가 질문이 있으시면<br />
          언제든지 연락 주세요.
        </p>
        <a href="tel:02-1234-5678" class="btn-primary" style="color: #ffffff; background: rgba(255,255,255,0.2); border: 2px solid #ffffff;">
          📞 02-1234-5678
        </a>
        <br />
        <a href="mailto:contact@glec.io" class="btn-primary" style="color: #ffffff; background: rgba(255,255,255,0.2); border: 2px solid #ffffff;">
          ✉️ contact@glec.io
        </a>
      </div>

      <h2>📚 미리 둘러보기</h2>

      <p>
        데모 전까지 GLEC에 대해 더 알고 싶으시다면 아래 자료를 확인해보세요:
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://glec.io/knowledge-library" class="btn-secondary" style="color: #0600f7;">
          📖 자료실 둘러보기
        </a>
        <a href="https://glec.io/case-studies" class="btn-secondary" style="color: #0600f7;">
          🏢 고객 사례 보기
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 40px; text-align: center;">
        이메일이 제대로 표시되지 않나요? <a href="https://glec.io/demo-confirmation?id=${demo_request_id}" style="color: #0600f7;">웹 브라우저에서 보기</a>
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
        <a href="https://glec.io/terms">이용약관</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
        이 메일은 GLEC 데모를 신청하신 분께 발송되었습니다.<br />
        신청 번호: ${demo_request_id}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getDemoConfirmationPlainTextBody(params: DemoConfirmationEmailParams): string {
  const { contact_name, company_name, preferred_date, preferred_time, demo_request_id, product_interests } =
    params;

  const productsText = product_interests.map((p) => `  • ${p}`).join('\n');

  return `
✅ GLEC 데모 신청이 접수되었습니다!

안녕하세요, ${contact_name}님

${company_name}에서 GLEC 제품 데모를 신청해주셔서 감사합니다.
귀사의 탄소배출 관리를 도울 수 있게 되어 기쁩니다.

담당자가 24시간 이내에 연락드립니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 신청 정보

신청 번호: ${demo_request_id.substring(0, 8).toUpperCase()}
회사명: ${company_name}
담당자: ${contact_name}
희망 일시: ${preferred_date} ${preferred_time}

관심 제품:
${productsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 다음 단계

1. 담당자 배정 (24시간 이내)
   → 귀사 산업 분야에 경험이 있는 전문가가 배정됩니다

2. 일정 확정 전화
   → 희망 일시를 확인하고 최종 일정을 조율합니다

3. 사전 준비 자료 발송
   → 데모 전 귀사 환경에 맞춤화된 자료를 보내드립니다

4. 30분 제품 데모 (온라인)
   → Zoom으로 진행되며, 실시간 Q&A가 포함됩니다

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 데모 전 준비하시면 좋은 것들

• 현재 사용 중인 탄소배출 측정 방법
• 월간 물류 운송량 및 차량 대수
• ISO-14083 인증 목표 시기
• 기존 TMS 시스템 정보
• 궁금하신 점 리스트

* 준비가 안 되셔도 괜찮습니다. 데모 중에 함께 확인하겠습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 긴급한 문의가 있으신가요?

일정 변경이나 추가 질문이 있으시면 언제든지 연락 주세요.

전화: 02-1234-5678
이메일: contact@glec.io

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 미리 둘러보기

데모 전까지 GLEC에 대해 더 알고 싶으시다면:

• 자료실: https://glec.io/knowledge-library
• 고객 사례: https://glec.io/case-studies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(주)글렉
서울특별시 강남구 테헤란로 123
대표전화: 02-1234-5678 | 이메일: contact@glec.io

개인정보처리방침: https://glec.io/privacy-policy
이용약관: https://glec.io/terms

이 메일은 GLEC 데모를 신청하신 분께 발송되었습니다.
신청 번호: ${demo_request_id}
  `.trim();
}
