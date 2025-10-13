/**
 * Google Calendar API Client
 *
 * Purpose: Google Calendar 및 Google Meet 통합
 * Features:
 * - Service Account 인증
 * - Calendar events 생성/조회/삭제
 * - Google Meet 링크 자동 생성
 * - Freebusy 체크
 */

import { google } from 'googleapis';
import type { calendar_v3 } from 'googleapis';

// ====================================================================
// Types
// ====================================================================

export interface GoogleCalendarConfig {
  serviceAccountKey: string;
  calendarId?: string;
}

export interface MeetingEventData {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  timeZone?: string;
}

export interface CreatedEvent {
  eventId: string;
  meetLink: string | null | undefined;
  htmlLink: string | null | undefined;
  status: string | null | undefined;
}

export interface FreeBusySlot {
  start: Date;
  end: Date;
}

// ====================================================================
// Google Calendar Client
// ====================================================================

/**
 * Google Calendar API 클라이언트 생성
 *
 * @returns calendar_v3.Calendar instance
 */
export function getGoogleCalendarClient(): calendar_v3.Calendar {
  try {
    // 환경 변수에서 Service Account Key 가져오기
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    // JSON 파싱
    const credentials = JSON.parse(serviceAccountKey);

    // Google Auth 설정
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    // Calendar API 클라이언트 생성
    const calendar = google.calendar({ version: 'v3', auth });

    return calendar;
  } catch (error) {
    console.error('Failed to create Google Calendar client:', error);
    throw new Error(`Google Calendar client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ====================================================================
// Calendar Event Operations
// ====================================================================

/**
 * Google Calendar에 이벤트 생성 + Google Meet 링크 자동 생성
 *
 * @param data - Meeting event 데이터
 * @returns Created event with Meet link
 */
export async function createGoogleMeetEvent(
  data: MeetingEventData
): Promise<CreatedEvent> {
  try {
    const calendar = getGoogleCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Google Calendar 이벤트 생성 요청
    // Note: Service Account는 attendees를 초대할 수 없으므로 (Domain-Wide Delegation 없이)
    // 이벤트만 생성하고 Google Meet 링크를 얻은 후, Resend를 통해 직접 이메일로 초대합니다.
    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1, // Google Meet 링크 생성 활성화
      requestBody: {
        summary: data.summary,
        description: `${data.description}\n\n참석자 이메일: ${data.attendees.join(', ')}`,
        start: {
          dateTime: data.startTime.toISOString(),
          timeZone: data.timeZone || 'Asia/Seoul',
        },
        end: {
          dateTime: data.endTime.toISOString(),
          timeZone: data.timeZone || 'Asia/Seoul',
        },
        // Service Account는 attendees를 초대할 수 없으므로 제거
        // attendees: data.attendees.map(email => ({ email, responseStatus: 'needsAction' })),
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(), // 고유 요청 ID
            conferenceSolutionKey: {
              type: 'hangoutMeet', // Google Meet 사용 (단수형)
            },
          },
        },
        visibility: 'public', // Public visibility
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 }, // 1시간 전 이메일 (Service Account만 받음)
            { method: 'popup', minutes: 30 }, // 30분 전 팝업 (Service Account만 받음)
          ],
        },
      },
    });

    return {
      eventId: event.data.id!,
      meetLink: event.data.hangoutLink || event.data.conferenceData?.entryPoints?.[0]?.uri,
      htmlLink: event.data.htmlLink,
      status: event.data.status,
    };
  } catch (error) {
    console.error('Failed to create Google Meet event:', error);
    throw new Error(`Google Meet event creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Google Calendar 이벤트 조회
 *
 * @param eventId - Google Calendar event ID
 * @returns Event details
 */
export async function getCalendarEvent(eventId: string) {
  try {
    const calendar = getGoogleCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const event = await calendar.events.get({
      calendarId,
      eventId,
    });

    return event.data;
  } catch (error) {
    console.error(`Failed to get calendar event ${eventId}:`, error);
    throw new Error(`Calendar event retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Google Calendar 이벤트 삭제
 *
 * @param eventId - Google Calendar event ID
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const calendar = getGoogleCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    console.log(`Calendar event ${eventId} deleted successfully`);
  } catch (error) {
    console.error(`Failed to delete calendar event ${eventId}:`, error);
    throw new Error(`Calendar event deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Google Calendar 이벤트 업데이트
 *
 * @param eventId - Google Calendar event ID
 * @param updates - 업데이트할 필드
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<calendar_v3.Schema$Event>
): Promise<CreatedEvent> {
  try {
    const calendar = getGoogleCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // 기존 이벤트 가져오기
    const existingEvent = await getCalendarEvent(eventId);

    // 업데이트 적용
    const updatedEvent = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        ...existingEvent,
        ...updates,
      },
    });

    return {
      eventId: updatedEvent.data.id!,
      meetLink: updatedEvent.data.hangoutLink || updatedEvent.data.conferenceData?.entryPoints?.[0]?.uri,
      htmlLink: updatedEvent.data.htmlLink,
      status: updatedEvent.data.status,
    };
  } catch (error) {
    console.error(`Failed to update calendar event ${eventId}:`, error);
    throw new Error(`Calendar event update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ====================================================================
// Freebusy Checking
// ====================================================================

/**
 * Google Calendar freebusy 조회 (이중 예약 방지)
 *
 * @param startDate - 조회 시작 날짜
 * @param endDate - 조회 종료 날짜
 * @returns Busy 시간대 목록
 */
export async function getFreeBusySlots(
  startDate: Date,
  endDate: Date
): Promise<FreeBusySlot[]> {
  try {
    const calendar = getGoogleCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busySlots = response.data.calendars?.[calendarId]?.busy || [];

    return busySlots.map(slot => ({
      start: new Date(slot.start!),
      end: new Date(slot.end!),
    }));
  } catch (error) {
    console.error('Failed to get freebusy slots:', error);
    throw new Error(`Freebusy query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 특정 시간대가 사용 가능한지 체크
 *
 * @param startTime - 시작 시간
 * @param endTime - 종료 시간
 * @returns true if available, false if busy
 */
export async function isTimeSlotAvailable(
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    // 버퍼 시간 추가 (전후 15분)
    const bufferStart = new Date(startTime);
    bufferStart.setMinutes(bufferStart.getMinutes() - 15);

    const bufferEnd = new Date(endTime);
    bufferEnd.setMinutes(bufferEnd.getMinutes() + 15);

    const busySlots = await getFreeBusySlots(bufferStart, bufferEnd);

    // Busy 슬롯과 겹치는지 체크
    const isOverlapping = busySlots.some(busy =>
      startTime < busy.end && endTime > busy.start
    );

    return !isOverlapping;
  } catch (error) {
    console.error('Failed to check time slot availability:', error);
    // 에러 발생 시 안전하게 false 반환 (이중 예약 방지)
    return false;
  }
}

// ====================================================================
// Event Listing
// ====================================================================

/**
 * 특정 기간의 모든 이벤트 조회
 *
 * @param startDate - 조회 시작 날짜
 * @param endDate - 조회 종료 날짜
 * @returns List of calendar events
 */
export async function listCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<calendar_v3.Schema$Event[]> {
  try {
    const calendar = getGoogleCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Failed to list calendar events:', error);
    throw new Error(`Calendar events listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ====================================================================
// Test Connection
// ====================================================================

/**
 * Google Calendar API 연결 테스트
 *
 * @returns true if connection successful
 */
export async function testGoogleCalendarConnection(): Promise<boolean> {
  try {
    const calendar = getGoogleCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // 간단한 calendar 조회로 연결 테스트
    await calendar.calendars.get({ calendarId });

    console.log('✅ Google Calendar API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Google Calendar API connection failed:', error);
    return false;
  }
}
