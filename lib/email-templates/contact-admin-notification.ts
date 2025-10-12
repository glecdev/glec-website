/**
 * Contact Form - Admin Notification Email Template
 * Purpose: Notify admin of new customer inquiry
 */

export interface ContactAdminNotificationData {
  inquiryType: string;
  inquiryTypeLabel: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  contactId: string;
  timestamp: string;
  ipAddress: string;
}

export function renderContactAdminNotification(data: ContactAdminNotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 고객 문의</title>
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
        🔔 새로운 고객 문의
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px 20px;">
      <!-- Inquiry Info Section -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0600f7;">
        <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0600f7;">📋 문의 정보</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; width: 120px; color: #666;">문의 유형:</td>
            <td style="padding: 8px 0; color: #333;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #0600f7; color: #ffffff; border-radius: 4px; font-size: 14px;">
                ${data.inquiryTypeLabel}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">회사명:</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500;">${data.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">담당자명:</td>
            <td style="padding: 8px 0; color: #333;">${data.contactName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">이메일:</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${data.email}" style="color: #0600f7; text-decoration: none; font-weight: 500;">${data.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">전화번호:</td>
            <td style="padding: 8px 0; color: #333;">${data.phone}</td>
          </tr>
        </table>
      </div>

      <!-- Message Section -->
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">💬 문의 내용</h3>
        <p style="margin: 0; white-space: pre-wrap; color: #555; line-height: 1.8;">${data.message}</p>
      </div>

      <!-- Metadata Section -->
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #666; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong style="color: #333;">접수 ID:</strong> <code style="background-color: #e8e8e8; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace;">${data.contactId}</code></p>
        <p style="margin: 0 0 8px 0;"><strong style="color: #333;">접수 시간:</strong> ${data.timestamp}</p>
        <p style="margin: 0;"><strong style="color: #333;">IP 주소:</strong> ${data.ipAddress}</p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://glec-website.vercel.app/admin/contacts" style="display: inline-block; padding: 14px 32px; background-color: #0600f7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(6, 0, 247, 0.2);">
          Admin Dashboard에서 확인하기 →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">이 이메일은 GLEC 웹사이트 Contact Form에서 자동 발송되었습니다.</p>
      <p style="margin: 0; font-size: 12px; color: #999;">
        <a href="https://glec-website.vercel.app" style="color: #0600f7; text-decoration: none;">GLEC Website</a> |
        <a href="https://glec-website.vercel.app/admin/contacts" style="color: #0600f7; text-decoration: none;">Admin Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
