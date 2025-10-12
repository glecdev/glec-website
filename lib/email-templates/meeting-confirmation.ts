/**
 * Meeting Confirmation Email Template
 *
 * Purpose: 고객이 미팅 예약 완료 후 받는 확인 이메일
 * Design: GLEC branding with gradient (#0600f7, #000a42)
 */

export interface MeetingConfirmationData {
  // Lead Info
  contactName: string;
  companyName: string;
  email: string;
  phone?: string;

  // Meeting Details
  meetingTitle: string;
  meetingType: string; // DEMO, CONSULTATION, ONBOARDING, FOLLOWUP, OTHER
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  duration: string; // e.g. "1시간"
  meetingUrl?: string; // Google Meet, Zoom, etc.
  meetingLocation?: string; // ONLINE, OFFICE, CLIENT_OFFICE
  officeAddress?: string;

  // Admin Info
  adminName: string;
  adminEmail: string;
  adminPhone: string;

  // Booking Info
  bookingId: string;
  requestedAgenda?: string;

  // Calendar Files
  icsDownloadUrl?: string; // ICS calendar file
  googleCalendarUrl?: string; // Google Calendar add event link
}

export function renderMeetingConfirmation(data: MeetingConfirmationData): string {
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

  const meetingTypeLabel = {
    DEMO: '제품 데모',
    CONSULTATION: '상담',
    ONBOARDING: '온보딩',
    FOLLOWUP: '후속 미팅',
    OTHER: '미팅',
  }[data.meetingType] || '미팅';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC 미팅 예약 확인</title>
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
      ">✅ 미팅 예약이 확정되었습니다</h1>

      <p style="
        margin: 0;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
      ">Meeting Booking Confirmed</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">

      <!-- Greeting -->
      <p style="
        margin: 0 0 30px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #1f2937;
      ">
        안녕하세요, <strong style="color: #0600f7;">${data.companyName}</strong> <strong style="color: #0600f7;">${data.contactName}</strong>님
      </p>

      <p style="
        margin: 0 0 30px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #4b5563;
      ">
        GLEC ${meetingTypeLabel} 일정이 확정되었습니다. 아래 일정을 확인해 주세요.
      </p>

      <!-- Meeting Details Card -->
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
        ">📅 미팅 일정</h2>

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
            ">미팅 제목</td>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 15px;
              font-weight: 600;
              color: #1f2937;
            ">${data.meetingTitle}</td>
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
            ">${formattedStartTime} - ${formattedEndTime} (${data.duration})</td>
          </tr>

          ${
            data.meetingUrl
              ? `
          <tr>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
            ">참여 링크</td>
            <td style="
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            ">
              <a href="${data.meetingUrl}" style="
                color: #0600f7;
                text-decoration: none;
                font-weight: 600;
                font-size: 15px;
              ">${data.meetingUrl}</a>
            </td>
          </tr>
          `
              : ''
          }

          ${
            data.officeAddress
              ? `
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
            ">${data.officeAddress}</td>
          </tr>
          `
              : ''
          }
        </table>

        ${
          data.requestedAgenda
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
          ">요청 안건</p>
          <p style="
            margin: 0;
            font-size: 15px;
            color: #1f2937;
            line-height: 1.6;
          ">${data.requestedAgenda}</p>
        </div>
        `
            : ''
        }
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
        ">캘린더에 추가하세요</p>

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
          ">📅 Google Calendar</a>
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

      <!--담당자 정보 -->
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
        ">👤 담당자 정보</h3>

        <div style="font-size: 14px; line-height: 1.8; color: #4b5563;">
          <p style="margin: 0 0 8px 0;">
            <strong style="color: #1f2937;">이름:</strong> ${data.adminName}
          </p>
          <p style="margin: 0 0 8px 0;">
            <strong style="color: #1f2937;">이메일:</strong>
            <a href="mailto:${data.adminEmail}" style="color: #0600f7; text-decoration: none;">${data.adminEmail}</a>
          </p>
          <p style="margin: 0;">
            <strong style="color: #1f2937;">전화:</strong> ${data.adminPhone}
          </p>
        </div>
      </div>

      <!-- 안내사항 -->
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
        ">⚠️ 안내사항</h3>

        <ul style="
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
          line-height: 1.8;
          color: #4b5563;
        ">
          <li>미팅 시작 5분 전까지 접속 부탁드립니다.</li>
          <li>일정 변경이 필요한 경우, 최소 24시간 전에 담당자에게 연락 부탁드립니다.</li>
          <li>준비하실 자료나 질문사항이 있으시면 미리 공유해 주세요.</li>
          ${
            data.meetingUrl
              ? '<li>온라인 미팅은 안정적인 인터넷 환경에서 접속해 주세요.</li>'
              : ''
          }
        </ul>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="
          margin: 0 0 20px 0;
          font-size: 15px;
          color: #4b5563;
          line-height: 1.6;
        ">
          궁금한 점이 있으시면 언제든지 담당자에게 연락해 주세요.
        </p>

        <a href="mailto:${data.adminEmail}" style="
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #0600f7 0%, #0500d0 100%);
          color: #ffffff;
          text-decoration: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(6, 0, 247, 0.3);
        ">✉️ 담당자에게 문의하기</a>
      </div>

      <!-- Footer -->
      <div style="
        text-align: center;
        padding-top: 30px;
        border-top: 1px solid #e5e7eb;
      ">
        <p style="
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #6b7280;
        ">
          예약 번호: <strong style="color: #1f2937;">${data.bookingId}</strong>
        </p>

        <p style="
          margin: 0 0 20px 0;
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.6;
        ">
          이 이메일은 ${data.email} 주소로 발송되었습니다.<br>
          GLEC 미팅 예약 시스템을 통해 자동으로 발송된 이메일입니다.
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
      </div>

    </div>

  </div>
</body>
</html>
`.trim();
}
