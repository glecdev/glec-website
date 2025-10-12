/**
 * Meeting Proposal Email Template
 * Purpose: 어드민이 리드에게 미팅을 제안하는 이메일
 * Features: 
 * - 개인화된 인사
 * - 미팅 목적 설명
 * - 시간 선택 링크 (보안 토큰 포함)
 * - 담당자 정보
 */

export interface MeetingProposalData {
  contactName: string;
  companyName: string;
  leadSource: string;
  leadSourceDetail: string;
  meetingPurpose: string;
  proposedSlotCount: number;
  bookingUrl: string; // https://glec.io/meetings/schedule/{token}
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  expiresAt: string;
}

export function renderMeetingProposal(data: MeetingProposalData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 미팅 일정 제안</title>
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
        📅 미팅 일정 제안
      </h1>
      <p style="color: #e0e0ff; margin: 0; font-size: 14px;">
        귀사와의 미팅을 제안드립니다
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 40px 30px;">
      <!-- Greeting -->
      <p style="margin: 0 0 25px 0; font-size: 16px; color: #333; line-height: 1.8;">
        안녕하세요, <strong>${data.companyName}</strong> <strong>${data.contactName}</strong>님
      </p>

      <!-- Main Message -->
      <div style="background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 5px solid #0600f7;">
        <p style="margin: 0 0 15px 0; font-size: 16px; color: #333; line-height: 1.8;">
          <strong style="color: #0600f7;">GLEC</strong> 담당자 <strong>${data.adminName}</strong>입니다.
        </p>
        <p style="margin: 0 0 15px 0; font-size: 15px; color: #555; line-height: 1.8;">
          귀사께서 ${data.leadSourceDetail}를 통해 문의주신 내용에 대해, 보다 자세한 상담을 위해 <strong style="color: #0600f7;">온라인 미팅</strong>을 제안드립니다.
        </p>
        <p style="margin: 0; font-size: 15px; color: #555; line-height: 1.8;">
          ${data.meetingPurpose}
        </p>
      </div>

      <!-- Meeting Info -->
      <div style="background-color: #ffffff; padding: 25px; border: 2px solid #e0e0e0; border-radius: 12px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 20px 0; font-size: 18px; color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px;">
          🎯 미팅 정보
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; font-weight: 600; width: 140px; color: #666; vertical-align: top;">미팅 형식:</td>
            <td style="padding: 12px 0; color: #333;">
              <strong style="color: #0600f7;">온라인 화상 미팅</strong> (Zoom/Google Meet)
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #666; vertical-align: top;">소요 시간:</td>
            <td style="padding: 12px 0; color: #333;">약 <strong>30-60분</strong></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #666; vertical-align: top;">가능한 시간:</td>
            <td style="padding: 12px 0; color: #333;">
              <strong style="color: #0600f7;">${data.proposedSlotCount}개 시간대</strong> 제안
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-weight: 600; color: #666; vertical-align: top;">예약 유효기간:</td>
            <td style="padding: 12px 0; color: #333;">${data.expiresAt}까지</td>
          </tr>
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0 30px 0;">
        <a href="${data.bookingUrl}" 
           style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #0600f7 0%, #0500d0 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-size: 17px; font-weight: 700; box-shadow: 0 4px 15px rgba(6, 0, 247, 0.3); transition: all 0.3s;">
          📅 미팅 시간 선택하기
        </a>
      </div>

      <p style="text-align: center; margin: 20px 0; font-size: 13px; color: #999;">
        위 버튼을 클릭하시면 가능한 시간대를 확인하고 예약하실 수 있습니다
      </p>

      <!-- Alternative Link -->
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
          버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 직접 입력해주세요:
        </p>
        <p style="margin: 0; word-break: break-all;">
          <a href="${data.bookingUrl}" style="color: #0600f7; text-decoration: underline; font-size: 13px;">
            ${data.bookingUrl}
          </a>
        </p>
      </div>

      <!-- Contact Info -->
      <div style="background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%); padding: 25px; border-radius: 12px; border: 1px solid #e0e0e0;">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">👤 담당자 정보</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; width: 80px; color: #666;">이름:</td>
            <td style="padding: 8px 0; color: #333;"><strong>${data.adminName}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">이메일:</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${data.adminEmail}" style="color: #0600f7; text-decoration: none;">
                ${data.adminEmail}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #666;">연락처:</td>
            <td style="padding: 8px 0;">
              <a href="tel:${data.adminPhone}" style="color: #0600f7; text-decoration: none;">
                ${data.adminPhone}
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0 0; font-size: 13px; color: #666; line-height: 1.6;">
          시간 선택이 어려우시거나 다른 문의사항이 있으시면 언제든지 연락주세요.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
        <strong style="color: #0600f7;">GLEC Inc.</strong> | ISO-14083 국제표준 물류 탄소배출 측정
      </p>
      <p style="margin: 0 0 15px 0; font-size: 13px; color: #999;">
        서울특별시 | contact@glec.io | www.glec.io
      </p>
      <div style="margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="margin: 0; font-size: 11px; color: #999; line-height: 1.6;">
          본 메일은 귀하께서 GLEC에 문의하신 내용에 대한 답변입니다.<br>
          더 이상 메일 수신을 원치 않으시면 회신을 통해 알려주세요.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`.trim();
}
