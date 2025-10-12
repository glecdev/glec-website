/**
 * Contact Form - User Auto-Response Email Template
 * Purpose: Confirm inquiry receipt to customer
 */

export interface ContactUserAutoResponseData {
  contactName: string;
  companyName: string;
  inquiryTypeLabel: string;
  contactId: string;
  timestamp: string;
}

export function renderContactUserAutoResponse(data: ContactUserAutoResponseData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 문의 접수 확인</title>
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
        ✅ 문의 접수 완료
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px 20px;">
      <!-- Greeting -->
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
        안녕하세요, <strong>${data.contactName}</strong>님
      </p>

      <!-- Main Message -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0600f7;">
        <p style="margin: 0 0 15px 0; font-size: 15px; color: #333; line-height: 1.8;">
          <strong style="color: #0600f7;">${data.companyName}</strong> 고객님의 문의가 정상적으로 접수되었습니다.
        </p>
        <p style="margin: 0; font-size: 15px; color: #555; line-height: 1.8;">
          담당자가 확인 후 <strong style="color: #0600f7;">영업일 기준 1-2일 내</strong>에 답변드리겠습니다.
        </p>
      </div>

      <!-- Receipt Info -->
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">📋 접수 정보</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; width: 120px; color: #666;">접수 번호:</td>
            <td style="padding: 8px 0;">
              <code style="background-color: #e8e8e8; padding: 4px 8px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 13px; color: #333;">${data.contactId}</code>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">접수 시간:</td>
            <td style="padding: 8px 0; color: #333;">${data.timestamp}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">문의 유형:</td>
            <td style="padding: 8px 0;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #0600f7; color: #ffffff; border-radius: 4px; font-size: 13px;">
                ${data.inquiryTypeLabel}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Contact Info -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">📞 긴급 문의</h3>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">
          빠른 상담이 필요하신 경우 아래 연락처로 문의해주세요.
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: 600; width: 80px; color: #666;">전화:</td>
            <td style="padding: 6px 0; color: #0600f7; font-weight: 500;">
              <a href="tel:02-1234-5678" style="color: #0600f7; text-decoration: none;">02-1234-5678</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #666;">이메일:</td>
            <td style="padding: 6px 0; color: #0600f7; font-weight: 500;">
              <a href="mailto:contact@glec.io" style="color: #0600f7; text-decoration: none;">contact@glec.io</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: 600; color: #666;">운영 시간:</td>
            <td style="padding: 6px 0; color: #555;">평일 09:00 - 18:00 (주말/공휴일 제외)</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://glec-website.vercel.app" style="display: inline-block; padding: 14px 32px; background-color: #0600f7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(6, 0, 247, 0.2);">
          GLEC 웹사이트 방문하기 →
        </a>
      </div>

      <!-- Closing -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">
          감사합니다.
        </p>
        <p style="margin: 0; font-size: 14px; color: #0600f7; font-weight: 600;">
          GLEC 드림
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">이 이메일은 GLEC 웹사이트 Contact Form에서 자동 발송되었습니다.</p>
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">본 메일은 발신 전용이므로 회신하실 수 없습니다.</p>
      <p style="margin: 0; font-size: 12px; color: #999;">
        <a href="https://glec-website.vercel.app" style="color: #0600f7; text-decoration: none;">glec-website.vercel.app</a> |
        <a href="mailto:contact@glec.io" style="color: #0600f7; text-decoration: none;">contact@glec.io</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
