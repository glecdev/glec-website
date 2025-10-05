/**
 * Demo Request - Customer Confirmation Email Template
 *
 * Sent to the customer who submits a demo request
 */

export interface DemoRequestCustomerEmailData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  productInterests: string[];
}

export function generateDemoRequestCustomerEmail(data: DemoRequestCustomerEmailData): string {
  const {
    companyName,
    contactName,
    email,
    phone,
    preferredDate,
    preferredTime,
    productInterests,
  } = data;

  const productNames: Record<string, string> = {
    dtg: 'DTG Series5 (80만원)',
    api: 'Carbon API (48 APIs)',
    cloud: 'GLEC Cloud (12만원/월)',
    ai: 'AI DTG (개발 중)',
  };

  const selectedProducts = productInterests.map(p => productNames[p] || p).join(', ');

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 데모 요청이 접수되었습니다</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', 'Noto Sans KR', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0600f7;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #0600f7;
      margin-bottom: 10px;
    }
    h1 {
      color: #0600f7;
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    .summary {
      background-color: #f8f9fa;
      border-left: 4px solid #0600f7;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .summary h2 {
      margin-top: 0;
      color: #0600f7;
      font-size: 18px;
    }
    .info-row {
      display: flex;
      margin: 10px 0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      width: 120px;
      flex-shrink: 0;
    }
    .info-value {
      color: #333;
    }
    .next-steps {
      margin: 30px 0;
    }
    .next-steps h2 {
      color: #0600f7;
      font-size: 18px;
    }
    .next-steps ol {
      padding-left: 20px;
    }
    .next-steps li {
      margin: 10px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #0600f7;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .footer a {
      color: #0600f7;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">GLEC</div>
      <h1>데모 요청이 접수되었습니다</h1>
      <p>귀하의 데모 요청을 성공적으로 접수했습니다</p>
    </div>

    <p>안녕하세요, <strong>${contactName}</strong> 님</p>

    <p>
      <strong>${companyName}</strong>의 GLEC 솔루션 데모 요청을 접수했습니다.
      곧 담당자가 연락드려 자세한 일정을 확정하겠습니다.
    </p>

    <div class="summary">
      <h2>📋 요청 정보</h2>
      <div class="info-row">
        <div class="info-label">회사명:</div>
        <div class="info-value">${companyName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">담당자:</div>
        <div class="info-value">${contactName}</div>
      </div>
      <div class="info-row">
        <div class="info-label">이메일:</div>
        <div class="info-value">${email}</div>
      </div>
      <div class="info-row">
        <div class="info-label">전화번호:</div>
        <div class="info-value">${phone}</div>
      </div>
      <div class="info-row">
        <div class="info-label">관심 제품:</div>
        <div class="info-value">${selectedProducts}</div>
      </div>
      <div class="info-row">
        <div class="info-label">희망 날짜:</div>
        <div class="info-value">${preferredDate} ${preferredTime}</div>
      </div>
    </div>

    <div class="next-steps">
      <h2>🚀 다음 단계</h2>
      <ol>
        <li><strong>담당자 배정</strong> - 영업 담당자가 배정됩니다 (1영업일 이내)</li>
        <li><strong>일정 확정</strong> - 담당자가 연락하여 정확한 미팅 일정을 확정합니다</li>
        <li><strong>데모 진행</strong> - 온라인 미팅으로 맞춤형 데모를 진행합니다 (30-60분)</li>
        <li><strong>Q&A 및 견적</strong> - 질문에 답변하고 맞춤 견적을 제공합니다</li>
      </ol>
    </div>

    <div style="text-align: center;">
      <a href="https://glec-website.vercel.app/about/company" class="cta-button">
        GLEC 자세히 알아보기
      </a>
    </div>

    <div class="footer">
      <p>
        <strong>GLEC (Green Logistics Emission Calculator)</strong><br>
        ISO-14083 국제표준 기반 물류 탄소배출 측정 플랫폼
      </p>
      <p>
        문의사항이 있으시면 언제든지 연락주세요<br>
        📧 <a href="mailto:demo@glec.io">demo@glec.io</a> |
        📞 1577-0000 |
        🌐 <a href="https://glec-website.vercel.app">glec-website.vercel.app</a>
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 20px;">
        본 이메일은 귀하의 데모 요청에 대한 자동 회신입니다.<br>
        이메일 수신을 원하지 않으시면 <a href="https://glec-website.vercel.app/unsubscribe">여기</a>를 클릭하세요.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
