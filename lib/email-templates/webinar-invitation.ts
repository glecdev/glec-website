/**
 * Webinar Invitation Email Template
 *
 * Purpose: 고객이 웨비나 이벤트 참가 신청 완료 후 받는 Zoom 초대장 이메일
 * Design: GLEC branding with gradient (#0600f7, #000a42)
 */

export interface WebinarInvitationData {
  // Participant Info
  participantName: string;

  // Event Details
  eventTitle: string;
  eventDescription: string;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  location: string; // e.g. "ONLINE", "서울시 강남구..."
  thumbnailUrl?: string;

  // Zoom Webinar Info
  webinarJoinUrl: string; // Zoom webinar join URL (Primary CTA)

  // Calendar Files
  icsDownloadUrl?: string; // ICS calendar file
  googleCalendarUrl?: string; // Google Calendar add event link
}

export function renderWebinarInvitation(data: WebinarInvitationData): string {
  const startDate = new Date(data.startTime);
  const endDate = new Date(data.endTime);

  const formattedDate = startDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const formattedStartTime = startDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const formattedEndTime = endDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Calculate duration in minutes
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  const durationHours = Math.floor(durationMinutes / 60);
  const durationRemainingMinutes = durationMinutes % 60;
  const durationLabel =
    durationHours > 0
      ? `${durationHours}시간${durationRemainingMinutes > 0 ? ` ${durationRemainingMinutes}분` : ''}`
      : `${durationMinutes}분`;

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 웨비나 초대장</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f3f4f6;
  color: #1f2937;
">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <div style="
      background: linear-gradient(135deg, #0600f7 0%, #000a42 100%);
      padding: 40px 20px;
      text-align: center;
    ">
      <h1 style="
        margin: 0 0 10px 0;
        font-size: 32px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.5px;
      ">🎉 웨비나 초대장이 도착했습니다</h1>

      <p style="
        margin: 0;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
      ">GLEC Webinar Invitation</p>
    </div>

    <!-- Event Thumbnail (if available) -->
    ${
      data.thumbnailUrl
        ? `
    <div style="
      width: 100%;
      overflow: hidden;
    ">
      <img src="${data.thumbnailUrl}" alt="${data.eventTitle}" style="
        width: 100%;
        height: auto;
        display: block;
      " />
    </div>
    `
        : ''
    }

    <!-- Content -->
    <div style="padding: 40px 30px;">

      <!-- Greeting -->
      <p style="
        margin: 0 0 30px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #1f2937;
      ">
        안녕하세요, <strong style="color: #0600f7;">${data.participantName}</strong>님
      </p>

      <p style="
        margin: 0 0 30px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #4b5563;
      ">
        GLEC 웨비나 참가 신청이 완료되었습니다. 아래 일정과 참여 방법을 확인해 주세요.
      </p>

      <!-- Webinar Details Card -->
      <div style="
        background-color: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 30px;
      ">
        <h2 style="
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 700;
          color: #0600f7;
        ">📅 웨비나 일정</h2>

        <table style="
          width: 100%;
          border-collapse: collapse;
        ">
          <tr>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
              width: 30%;
            ">웨비나 제목</td>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 15px;
              font-weight: 600;
              color: #1f2937;
            ">${data.eventTitle}</td>
          </tr>

          <tr>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
            ">날짜</td>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 15px;
              color: #1f2937;
            ">${formattedDate}</td>
          </tr>

          <tr>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
            ">시간</td>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 15px;
              color: #1f2937;
            ">${formattedStartTime} - ${formattedEndTime} (${durationLabel})</td>
          </tr>

          <tr>
            <td style="
              padding: 12px 0;
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
            ">장소</td>
            <td style="
              padding: 12px 0;
              font-size: 15px;
              color: #1f2937;
            ">${data.location === 'ONLINE' ? '온라인 (Zoom 웨비나)' : data.location}</td>
          </tr>
        </table>

        ${
          data.eventDescription
            ? `
        <div style="
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        ">
          <p style="
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
          ">웨비나 소개</p>
          <p style="
            margin: 0;
            font-size: 15px;
            color: #1f2937;
            line-height: 1.6;
          ">${data.eventDescription}</p>
        </div>
        `
            : ''
        }
      </div>

      <!-- Zoom Webinar Join Button (Primary CTA) -->
      <div style="
        text-align: center;
        margin-bottom: 30px;
        padding: 24px;
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border-radius: 12px;
        border: 2px solid #10b981;
      ">
        <p style="
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        ">🎥 웨비나 참여 링크</p>

        <a href="${data.webinarJoinUrl}" style="
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #0600f7 0%, #0500d0 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(6, 0, 247, 0.3);
        ">🚀 Zoom 웨비나 참여하기</a>

        <p style="
          margin: 15px 0 0 0;
          font-size: 13px;
          color: #6b7280;
        ">웨비나 시작 시간에 위 버튼을 클릭하여 참여해 주세요</p>

        <p style="
          margin: 10px 0 0 0;
          font-size: 12px;
          color: #9ca3af;
        ">⚠️ 이 링크는 본인만 사용할 수 있습니다. 타인과 공유하지 마세요.</p>
      </div>

      <!-- Calendar Actions -->
      ${
        data.googleCalendarUrl || data.icsDownloadUrl
          ? `
      <div style="
        text-align: center;
        margin-bottom: 30px;
      ">
        <p style="
          margin: 0 0 15px 0;
          font-size: 14px;
          color: #6b7280;
        ">📆 캘린더에 추가하세요</p>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          ${
            data.googleCalendarUrl
              ? `
          <a href="${data.googleCalendarUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #ffffff;
            border: 2px solid #0600f7;
            color: #0600f7;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
          ">📅 Google Calendar 추가</a>
          `
              : ''
          }

          ${
            data.icsDownloadUrl
              ? `
          <a href="${data.icsDownloadUrl}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #ffffff;
            border: 2px solid #0600f7;
            color: #0600f7;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
          ">📥 ICS 다운로드</a>
          `
              : ''
          }
        </div>
      </div>
      `
          : ''
      }

      <!-- 참여 안내 -->
      <div style="
        background-color: #fffbeb;
        border-left: 4px solid #f59e0b;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 30px;
      ">
        <h3 style="
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        ">⚠️ 참여 전 확인사항</h3>

        <ul style="
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
          line-height: 1.8;
          color: #4b5563;
        ">
          <li>웨비나 시작 5분 전부터 입장이 가능합니다.</li>
          <li>안정적인 인터넷 환경에서 접속해 주세요.</li>
          <li>Zoom 앱을 미리 설치하시면 더욱 원활하게 참여하실 수 있습니다.</li>
          <li>웨비나 참여 링크는 본인만 사용할 수 있으며, 타인과 공유할 수 없습니다.</li>
          <li>질문이 있으시면 웨비나 중 Q&A 세션을 이용해 주세요.</li>
        </ul>
      </div>

      <!-- Technical Requirements -->
      <div style="
        background-color: #f0f9ff;
        border-left: 4px solid #0600f7;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 30px;
      ">
        <h3 style="
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        ">💻 권장 환경</h3>

        <div style="font-size: 14px; line-height: 1.8; color: #4b5563;">
          <p style="margin: 0 0 8px 0;">
            <strong style="color: #1f2937;">PC/Mac:</strong> Chrome, Firefox, Safari 최신 버전
          </p>
          <p style="margin: 0 0 8px 0;">
            <strong style="color: #1f2937;">모바일:</strong> Zoom 앱 설치 권장
          </p>
          <p style="margin: 0 0 8px 0;">
            <strong style="color: #1f2937;">인터넷:</strong> 다운로드 5Mbps 이상 권장
          </p>
          <p style="margin: 0;">
            <strong style="color: #1f2937;">장비:</strong> 마이크, 스피커 (질문 시 필요)
          </p>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="
          margin: 0 0 20px 0;
          font-size: 15px;
          color: #4b5563;
          line-height: 1.6;
        ">
          웨비나와 관련하여 궁금한 점이 있으시면 언제든지 문의해 주세요.
        </p>

        <a href="mailto:${process.env.RESEND_FROM_EMAIL}" style="
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #0600f7 0%, #0500d0 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(6, 0, 247, 0.3);
        ">✉️ 문의하기</a>
      </div>

      <!-- Footer -->
      <div style="
        text-align: center;
        padding-top: 30px;
        border-top: 1px solid #e5e7eb;
      ">
        <p style="
          margin: 0 0 20px 0;
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.6;
        ">
          이 이메일은 GLEC 웨비나 참가 신청 시 자동으로 발송됩니다.<br>
          참가 신청을 하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
        </p>

        <div style="
          display: inline-block;
          padding: 15px 20px;
          background-color: #f9fafb;
          border-radius: 8px;
        ">
          <p style="
            margin: 0;
            font-size: 18px;
            font-weight: 800;
            color: #0600f7;
            letter-spacing: 1px;
          ">GLEC</p>
          <p style="
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #6b7280;
          ">ISO-14083 국제표준 물류 탄소배출 측정</p>
        </div>

        <p style="
          margin: 20px 0 0 0;
          font-size: 12px;
          color: #9ca3af;
        ">
          © ${new Date().getFullYear()} GLEC. All rights reserved.
        </p>
      </div>

    </div>

  </div>
</body>
</html>
`.trim();
}
