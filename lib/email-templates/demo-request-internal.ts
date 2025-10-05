/**
 * Demo Request - Internal Notification Email Template
 *
 * Sent to sales@glec.io when a new demo request is submitted
 */

export interface DemoRequestInternalEmailData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  companySize: string;
  productInterests: string[];
  useCase: string;
  currentSolution: string;
  monthlyShipments: string;
  preferredDate: string;
  preferredTime: string;
  additionalMessage: string;
  ipAddress: string;
  submittedAt: string;
}

export function generateDemoRequestInternalEmail(data: DemoRequestInternalEmailData): string {
  const {
    companyName,
    contactName,
    email,
    phone,
    companySize,
    productInterests,
    useCase,
    currentSolution,
    monthlyShipments,
    preferredDate,
    preferredTime,
    additionalMessage,
    ipAddress,
    submittedAt,
  } = data;

  const productNames: Record<string, string> = {
    dtg: 'DTG Series5 (80만원)',
    api: 'Carbon API (48 APIs)',
    cloud: 'GLEC Cloud (12만원/월)',
    ai: 'AI DTG (개발 중)',
  };

  const selectedProducts = productInterests.map(p => productNames[p] || p).join(', ');

  const companySizeLabels: Record<string, string> = {
    '1-10': '1-10명 (스타트업)',
    '11-50': '11-50명 (소기업)',
    '51-200': '51-200명 (중기업)',
    '201-500': '201-500명 (중견기업)',
    '501+': '501명 이상 (대기업)',
  };

  const companySizeLabel = companySizeLabels[companySize] || companySize;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>새로운 데모 요청: ${companyName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', 'Noto Sans KR', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 700px;
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
      background: linear-gradient(135deg, #0600f7 0%, #000a42 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      margin: -40px -40px 30px -40px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header .timestamp {
      font-size: 14px;
      opacity: 0.9;
    }
    .alert-banner {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .alert-banner strong {
      color: #856404;
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #0600f7;
    }
    .section h2 {
      color: #0600f7;
      font-size: 18px;
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 12px;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .info-value strong {
      color: #0600f7;
    }
    .priority-high {
      display: inline-block;
      background-color: #dc3545;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .priority-medium {
      display: inline-block;
      background-color: #ffc107;
      color: #333;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .action-buttons {
      display: flex;
      gap: 15px;
      margin: 30px 0;
    }
    .action-button {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      text-align: center;
      flex: 1;
    }
    .action-button-primary {
      background-color: #0600f7;
      color: #ffffff !important;
    }
    .action-button-secondary {
      background-color: #ffffff;
      color: #0600f7 !important;
      border: 2px solid #0600f7;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    .metadata {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 새로운 데모 요청</h1>
      <div class="timestamp">⏰ ${submittedAt}</div>
    </div>

    <div class="alert-banner">
      <strong>⚠️ 즉시 조치 필요:</strong> 1영업일 이내에 고객에게 연락하여 일정을 확정해주세요
    </div>

    <div class="section">
      <h2>🏢 회사 정보</h2>
      <div class="info-grid">
        <div class="info-label">회사명:</div>
        <div class="info-value"><strong>${companyName}</strong></div>

        <div class="info-label">규모:</div>
        <div class="info-value">${companySizeLabel}</div>

        <div class="info-label">담당자:</div>
        <div class="info-value">${contactName}</div>

        <div class="info-label">이메일:</div>
        <div class="info-value"><a href="mailto:${email}">${email}</a></div>

        <div class="info-label">전화번호:</div>
        <div class="info-value"><a href="tel:${phone}">${phone}</a></div>
      </div>
    </div>

    <div class="section">
      <h2>🎯 관심 제품 및 사용 사례</h2>
      <div class="info-grid">
        <div class="info-label">관심 제품:</div>
        <div class="info-value"><strong>${selectedProducts}</strong></div>

        <div class="info-label">사용 사례:</div>
        <div class="info-value">${useCase}</div>

        ${currentSolution ? `
        <div class="info-label">현재 솔루션:</div>
        <div class="info-value">${currentSolution}</div>
        ` : ''}

        ${monthlyShipments ? `
        <div class="info-label">월 배송량:</div>
        <div class="info-value">${monthlyShipments}건</div>
        ` : ''}
      </div>
    </div>

    <div class="section">
      <h2>📅 희망 일정</h2>
      <div class="info-grid">
        <div class="info-label">날짜:</div>
        <div class="info-value"><strong>${preferredDate}</strong></div>

        <div class="info-label">시간:</div>
        <div class="info-value"><strong>${preferredTime}</strong></div>

        ${additionalMessage ? `
        <div class="info-label">추가 메시지:</div>
        <div class="info-value">${additionalMessage}</div>
        ` : ''}
      </div>
    </div>

    <div class="action-buttons">
      <a href="https://glec-website.vercel.app/admin/demo-requests" class="action-button action-button-primary">
        어드민에서 관리하기
      </a>
      <a href="mailto:${email}" class="action-button action-button-secondary">
        고객에게 이메일 보내기
      </a>
    </div>

    <div class="section" style="background-color: #f0f0f0; border-left-color: #999;">
      <h2>📊 우선순위 분석</h2>
      <div class="info-grid">
        <div class="info-label">회사 규모:</div>
        <div class="info-value">
          ${companySize === '501+' || companySize === '201-500' ? '<span class="priority-high">HIGH</span>' : '<span class="priority-medium">MEDIUM</span>'}
        </div>

        <div class="info-label">제품 관심도:</div>
        <div class="info-value">
          ${productInterests.length >= 3 ? '<span class="priority-high">HIGH</span>' : '<span class="priority-medium">MEDIUM</span>'}
          (${productInterests.length}개 제품)
        </div>

        <div class="info-label">예상 ARR:</div>
        <div class="info-value">
          ${
            companySize === '501+' ? '12,000만원+' :
            companySize === '201-500' ? '3,600만원+' :
            companySize === '51-200' ? '1,440만원+' :
            '144만원+'
          }
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>GLEC Sales Team</strong></p>
      <p>이 이메일은 자동 생성되었습니다. 문의사항은 admin@glec.io로 연락주세요.</p>

      <div class="metadata">
        <p>
          IP Address: ${ipAddress}<br>
          Submitted via: glec-website.vercel.app<br>
          CRM Action: 자동으로 데모 요청이 추가되었습니다
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
