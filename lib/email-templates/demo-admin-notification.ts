/**
 * Demo Request Admin Notification Email
 *
 * Sent to sales team when new demo request is created
 * Goal: Immediate notification with all details for quick follow-up
 */

export interface DemoAdminNotificationParams {
  demo_request_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  company_size: string;
  product_interests: string[];
  use_case: string;
  current_solution?: string;
  monthly_shipments: string;
  preferred_date: string;
  preferred_time: string;
  additional_message?: string;
  created_at: string;
}

export function getDemoAdminNotificationSubject(company_name: string): string {
  return `🔔 새 데모 신청: ${company_name} (24시간 내 연락 필요)`;
}

export function getDemoAdminNotificationHtmlBody(params: DemoAdminNotificationParams): string {
  const {
    demo_request_id,
    company_name,
    contact_name,
    email,
    phone,
    company_size,
    product_interests,
    use_case,
    current_solution,
    monthly_shipments,
    preferred_date,
    preferred_time,
    additional_message,
    created_at,
  } = params;

  const productsHtml = product_interests.map((p) => `<li>${p}</li>`).join('');
  const requestIdShort = demo_request_id.substring(0, 8).toUpperCase();

  // Calculate lead score based on company size and monthly shipments
  let leadScore = 50; // base score
  if (company_size === '1000+') leadScore += 30;
  else if (company_size === '201-1000') leadScore += 20;
  else if (company_size === '51-200') leadScore += 10;

  if (monthly_shipments === '10000+') leadScore += 20;
  else if (monthly_shipments === '1000-10000') leadScore += 15;
  else if (monthly_shipments === '100-1000') leadScore += 10;

  const priority = leadScore >= 80 ? 'P0 - HOT' : leadScore >= 60 ? 'P1 - WARM' : 'P2 - COLD';
  const priorityColor = leadScore >= 80 ? '#dc2626' : leadScore >= 60 ? '#f59e0b' : '#6b7280';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>새 데모 신청 알림</title>
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; line-height: 1.6; color: #333; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 700px; margin: 0 auto; background: #ffffff; }
    .header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px; }
    .content { padding: 30px; }
    .urgent-banner { background: #fef2f2; border: 3px solid #dc2626; border-radius: 8px; padding: 20px; margin: 0 0 25px 0; text-align: center; }
    .urgent-banner .title { font-size: 20px; font-weight: 700; color: #991b1b; margin: 0 0 10px 0; }
    .urgent-banner .subtitle { font-size: 14px; color: #7f1d1d; }
    .priority-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; margin: 10px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .info-card { background: #f9fafb; border-radius: 8px; padding: 15px; border-left: 4px solid #0600f7; }
    .info-card .label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin: 0 0 5px 0; }
    .info-card .value { font-size: 16px; color: #111827; font-weight: 600; }
    .section { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .section h3 { color: #111827; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #0600f7; padding-bottom: 10px; }
    .section ul { margin: 10px 0; padding-left: 20px; }
    .section li { margin: 8px 0; }
    .use-case-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .use-case-box p { margin: 0; color: #92400e; font-style: italic; }
    .action-buttons { text-align: center; margin: 30px 0; }
    .btn { display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 5px; font-size: 15px; }
    .btn-primary { background: #0600f7; color: #ffffff; }
    .btn-primary:hover { background: #0500d0; }
    .btn-success { background: #10b981; color: #ffffff; }
    .btn-success:hover { background: #059669; }
    .btn-warning { background: #f59e0b; color: #ffffff; }
    .btn-warning:hover { background: #d97706; }
    .quick-actions { background: #f0f3ff; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .quick-actions h4 { margin: 0 0 15px 0; color: #0600f7; }
    .quick-actions ul { margin: 0; padding-left: 20px; }
    .quick-actions li { margin: 8px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🔔 새 데모 신청 알림</h1>
      <p>GLEC Admin Dashboard</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <!-- Urgent Banner -->
      <div class="urgent-banner">
        <div class="title">⏰ 24시간 내 연락 필요</div>
        <div class="subtitle">빠른 응대가 전환율을 높입니다</div>
      </div>

      <!-- Priority Badge -->
      <div style="text-align: center;">
        <span class="priority-badge" style="background: ${priorityColor}; color: #ffffff;">
          우선순위: ${priority} (Score: ${leadScore})
        </span>
      </div>

      <!-- Quick Info Grid -->
      <div class="info-grid">
        <div class="info-card">
          <div class="label">회사명</div>
          <div class="value">${company_name}</div>
        </div>
        <div class="info-card">
          <div class="label">담당자</div>
          <div class="value">${contact_name}</div>
        </div>
        <div class="info-card">
          <div class="label">이메일</div>
          <div class="value">${email}</div>
        </div>
        <div class="info-card">
          <div class="label">전화번호</div>
          <div class="value">${phone}</div>
        </div>
        <div class="info-card">
          <div class="label">회사 규모</div>
          <div class="value">${company_size}명</div>
        </div>
        <div class="info-card">
          <div class="label">월간 물류량</div>
          <div class="value">${monthly_shipments}건</div>
        </div>
      </div>

      <!-- Request Details -->
      <div class="section">
        <h3>📋 신청 상세 정보</h3>
        <p><strong>신청 번호:</strong> ${requestIdShort}</p>
        <p><strong>신청 일시:</strong> ${created_at}</p>
        <p><strong>희망 데모 일시:</strong> ${preferred_date} ${preferred_time}</p>
      </div>

      <!-- Product Interests -->
      <div class="section">
        <h3>🎯 관심 제품</h3>
        <ul>
          ${productsHtml}
        </ul>
      </div>

      <!-- Use Case -->
      <div class="section">
        <h3>💼 사용 목적 (Use Case)</h3>
        <div class="use-case-box">
          <p>"${use_case}"</p>
        </div>
      </div>

      ${
        current_solution
          ? `
      <!-- Current Solution -->
      <div class="section">
        <h3>🔧 현재 사용 중인 솔루션</h3>
        <p>${current_solution}</p>
      </div>
      `
          : ''
      }

      ${
        additional_message
          ? `
      <!-- Additional Message -->
      <div class="section">
        <h3>💬 추가 메시지</h3>
        <p>${additional_message}</p>
      </div>
      `
          : ''
      }

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h4>✅ 담당자 체크리스트</h4>
        <ul>
          <li>24시간 내 ${contact_name}님께 전화 (${phone})</li>
          <li>희망 일시 (${preferred_date} ${preferred_time}) 확인 및 조율</li>
          <li>사전 준비 자료 발송 (회사 규모: ${company_size}, 물류량: ${monthly_shipments})</li>
          <li>Zoom 링크 생성 및 캘린더 초대 발송</li>
          <li>CRM에 리드 정보 입력 (우선순위: ${priority})</li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <a href="https://glec-website.vercel.app/admin/demo-requests" class="btn btn-primary" style="color: #ffffff;">
          📊 Admin에서 확인하기
        </a>
        <br />
        <a href="mailto:${email}" class="btn btn-success" style="color: #ffffff;">
          ✉️ 이메일 보내기
        </a>
        <a href="tel:${phone}" class="btn btn-warning" style="color: #ffffff;">
          📞 전화 걸기
        </a>
      </div>

      <!-- Lead Score Breakdown -->
      <div class="section">
        <h3>📊 Lead Score 분석</h3>
        <p><strong>총점: ${leadScore}점</strong></p>
        <ul style="font-size: 14px; color: #6b7280;">
          <li>기본 점수: 50점</li>
          <li>회사 규모 (${company_size}): +${
    company_size === '1000+' ? 30 : company_size === '201-1000' ? 20 : company_size === '51-200' ? 10 : 0
  }점</li>
          <li>월간 물류량 (${monthly_shipments}): +${
    monthly_shipments === '10000+' ? 20 : monthly_shipments === '1000-10000' ? 15 : monthly_shipments === '100-1000' ? 10 : 0
  }점</li>
        </ul>
        <p style="font-size: 13px; color: #6b7280; margin-top: 10px;">
          * P0 (80+): 즉시 대응 필요 | P1 (60-79): 당일 대응 | P2 (<60): 48시간 내 대응
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        GLEC Admin Dashboard | 이 메일은 자동으로 발송되었습니다.<br />
        신청 번호: ${demo_request_id}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getDemoAdminNotificationPlainTextBody(params: DemoAdminNotificationParams): string {
  const {
    demo_request_id,
    company_name,
    contact_name,
    email,
    phone,
    company_size,
    product_interests,
    use_case,
    current_solution,
    monthly_shipments,
    preferred_date,
    preferred_time,
    additional_message,
    created_at,
  } = params;

  const productsText = product_interests.map((p) => `  • ${p}`).join('\n');
  const requestIdShort = demo_request_id.substring(0, 8).toUpperCase();

  // Calculate lead score
  let leadScore = 50;
  if (company_size === '1000+') leadScore += 30;
  else if (company_size === '201-1000') leadScore += 20;
  else if (company_size === '51-200') leadScore += 10;

  if (monthly_shipments === '10000+') leadScore += 20;
  else if (monthly_shipments === '1000-10000') leadScore += 15;
  else if (monthly_shipments === '100-1000') leadScore += 10;

  const priority = leadScore >= 80 ? 'P0 - HOT' : leadScore >= 60 ? 'P1 - WARM' : 'P2 - COLD';

  return `
🔔 새 데모 신청 알림

⏰ 24시간 내 연락 필요 - 빠른 응대가 전환율을 높입니다

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

우선순위: ${priority} (Score: ${leadScore}점)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 신청 정보

신청 번호: ${requestIdShort}
신청 일시: ${created_at}
희망 데모 일시: ${preferred_date} ${preferred_time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 고객 정보

회사명: ${company_name}
담당자: ${contact_name}
이메일: ${email}
전화번호: ${phone}
회사 규모: ${company_size}명
월간 물류량: ${monthly_shipments}건

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 관심 제품

${productsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 사용 목적 (Use Case)

"${use_case}"

${current_solution ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🔧 현재 사용 중인 솔루션\n\n${current_solution}\n` : ''}
${additional_message ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n💬 추가 메시지\n\n${additional_message}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 담당자 체크리스트

• 24시간 내 ${contact_name}님께 전화 (${phone})
• 희망 일시 (${preferred_date} ${preferred_time}) 확인 및 조율
• 사전 준비 자료 발송
• Zoom 링크 생성 및 캘린더 초대 발송
• CRM에 리드 정보 입력 (우선순위: ${priority})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Lead Score 분석

총점: ${leadScore}점
• 기본 점수: 50점
• 회사 규모 (${company_size}): +${company_size === '1000+' ? 30 : company_size === '201-1000' ? 20 : company_size === '51-200' ? 10 : 0}점
• 월간 물류량 (${monthly_shipments}): +${monthly_shipments === '10000+' ? 20 : monthly_shipments === '1000-10000' ? 15 : monthly_shipments === '100-1000' ? 10 : 0}점

* P0 (80+): 즉시 대응 필요
* P1 (60-79): 당일 대응
* P2 (<60): 48시간 내 대응

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 빠른 액션

Admin Dashboard: https://glec-website.vercel.app/admin/demo-requests
이메일 보내기: ${email}
전화 걸기: ${phone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GLEC Admin Dashboard
이 메일은 자동으로 발송되었습니다.
신청 번호: ${demo_request_id}
  `.trim();
}
