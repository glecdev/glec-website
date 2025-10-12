/**
 * Zoom API Integration
 *
 * Server-to-Server OAuth를 사용하여 Zoom 미팅을 자동으로 생성합니다.
 *
 * @see https://developers.zoom.us/docs/internal-apps/s2s-oauth/
 * @see https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Zoom OAuth Token Response
 */
interface ZoomOAuthTokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  scope: string;
}

/**
 * Zoom Meeting Creation Request
 */
export interface CreateZoomMeetingRequest {
  /** 미팅 제목 */
  topic: string;
  /** 미팅 타입: 1=Instant, 2=Scheduled, 3=Recurring with no fixed time, 8=Recurring with fixed time */
  type: 1 | 2 | 3 | 8;
  /** 미팅 시작 시간 (ISO 8601 format: YYYY-MM-DDTHH:mm:ss) */
  start_time?: string;
  /** 미팅 시간 (분 단위) */
  duration?: number;
  /** 시간대 (예: Asia/Seoul) */
  timezone?: string;
  /** 미팅 설명 */
  agenda?: string;
  /** 미팅 설정 */
  settings?: {
    /** 호스트 비디오 켜기 */
    host_video?: boolean;
    /** 참가자 비디오 켜기 */
    participant_video?: boolean;
    /** 참가자 입장 전 대기실 사용 */
    waiting_room?: boolean;
    /** 참가자 음소거 */
    mute_upon_entry?: boolean;
    /** 회의 녹화 자동 시작 */
    auto_recording?: 'none' | 'local' | 'cloud';
  };
}

/**
 * Zoom Meeting Response
 */
export interface ZoomMeeting {
  /** 미팅 고유 ID */
  id: number;
  /** 미팅 제목 */
  topic: string;
  /** 미팅 타입 */
  type: number;
  /** 미팅 상태 */
  status: string;
  /** 미팅 시작 시간 */
  start_time: string;
  /** 미팅 시간 (분) */
  duration: number;
  /** 시간대 */
  timezone: string;
  /** 미팅 참가 URL (참가자용) */
  join_url: string;
  /** 미팅 시작 URL (호스트용) */
  start_url: string;
  /** 미팅 비밀번호 */
  password?: string;
  /** 생성 시각 */
  created_at: string;
}

/**
 * Zoom API Error Response
 */
interface ZoomErrorResponse {
  code: number;
  message: string;
}

// ============================================================================
// Configuration
// ============================================================================

function getZoomConfig() {
  return {
    accountId: process.env.ZOOM_ACCOUNT_ID,
    clientId: process.env.ZOOM_CLIENT_ID,
    clientSecret: process.env.ZOOM_CLIENT_SECRET,
    apiBaseUrl: 'https://api.zoom.us/v2',
    oauthTokenUrl: 'https://zoom.us/oauth/token',
  };
}

// Environment variable validation
function validateZoomConfig() {
  const config = getZoomConfig();
  const missing = [];
  if (!config.accountId) missing.push('ZOOM_ACCOUNT_ID');
  if (!config.clientId) missing.push('ZOOM_CLIENT_ID');
  if (!config.clientSecret) missing.push('ZOOM_CLIENT_SECRET');

  if (missing.length > 0) {
    throw new Error(
      `Missing required Zoom environment variables: ${missing.join(', ')}\n` +
      `Please add them to your .env.local file`
    );
  }

  return config;
}

// ============================================================================
// OAuth Token Management
// ============================================================================

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Zoom Server-to-Server OAuth 토큰을 획득합니다.
 *
 * 토큰은 1시간 동안 유효하며, 메모리에 캐싱됩니다.
 */
async function getAccessToken(): Promise<string> {
  // 캐시된 토큰이 있고 아직 유효하면 재사용
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const config = validateZoomConfig();

  // Base64 인코딩된 Client ID:Client Secret
  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString('base64');

  try {
    const response = await fetch(
      `${config.oauthTokenUrl}?grant_type=account_credentials&account_id=${config.accountId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get Zoom access token: ${response.status} ${response.statusText}\n` +
        `Details: ${JSON.stringify(errorData)}`
      );
    }

    const data: ZoomOAuthTokenResponse = await response.json();

    // 토큰 캐싱 (만료 5분 전까지 유효)
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return data.access_token;
  } catch (error) {
    console.error('❌ Failed to get Zoom access token:', error);
    throw error;
  }
}

// ============================================================================
// Zoom API Requests
// ============================================================================

/**
 * Zoom API에 인증된 요청을 보냅니다.
 */
async function zoomApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken();
  const config = getZoomConfig();

  const url = `${config.apiBaseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData: ZoomErrorResponse = await response.json().catch(() => ({
      code: response.status,
      message: response.statusText,
    }));

    throw new Error(
      `Zoom API request failed: ${errorData.code} - ${errorData.message}\n` +
      `Endpoint: ${endpoint}`
    );
  }

  // DELETE 요청은 빈 응답(204 No Content)을 반환할 수 있음
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Meeting Management Functions
// ============================================================================

/**
 * Zoom 미팅을 생성합니다.
 *
 * @param data - 미팅 생성 요청 데이터
 * @returns 생성된 미팅 정보
 *
 * @example
 * ```typescript
 * const meeting = await createZoomMeeting({
 *   topic: 'GLEC 상담 - 삼성전자',
 *   type: 2,
 *   start_time: '2025-10-15T14:00:00',
 *   duration: 60,
 *   timezone: 'Asia/Seoul',
 *   agenda: '물류 탄소배출 측정 상담',
 *   settings: {
 *     host_video: true,
 *     participant_video: true,
 *     waiting_room: true,
 *     mute_upon_entry: true,
 *   },
 * });
 *
 * console.log('Join URL:', meeting.join_url);
 * console.log('Start URL:', meeting.start_url);
 * ```
 */
export async function createZoomMeeting(
  data: CreateZoomMeetingRequest
): Promise<ZoomMeeting> {
  try {
    // Zoom API는 "me" 사용자로 미팅 생성
    // Server-to-Server OAuth는 자동으로 계정 소유자로 인증됨
    const meeting = await zoomApiRequest<ZoomMeeting>('/users/me/meetings', {
      method: 'POST',
      body: JSON.stringify({
        topic: data.topic,
        type: data.type,
        start_time: data.start_time,
        duration: data.duration || 60,
        timezone: data.timezone || 'Asia/Seoul',
        agenda: data.agenda || '',
        settings: {
          host_video: data.settings?.host_video ?? true,
          participant_video: data.settings?.participant_video ?? true,
          waiting_room: data.settings?.waiting_room ?? true,
          mute_upon_entry: data.settings?.mute_upon_entry ?? true,
          auto_recording: data.settings?.auto_recording ?? 'none',
          // 추가 보안 설정
          join_before_host: false, // 호스트 전 입장 불가
          approval_type: 2, // 수동 승인 불필요
        },
      }),
    });

    console.log(`✅ Zoom meeting created: ${meeting.id} - ${meeting.topic}`);
    return meeting;
  } catch (error) {
    console.error('❌ Failed to create Zoom meeting:', error);
    throw error;
  }
}

/**
 * Zoom 미팅을 삭제합니다.
 *
 * @param meetingId - 삭제할 미팅 ID
 *
 * @example
 * ```typescript
 * await deleteZoomMeeting(1234567890);
 * ```
 */
export async function deleteZoomMeeting(meetingId: number): Promise<void> {
  try {
    await zoomApiRequest(`/meetings/${meetingId}`, {
      method: 'DELETE',
    });

    console.log(`✅ Zoom meeting deleted: ${meetingId}`);
  } catch (error) {
    console.error(`❌ Failed to delete Zoom meeting ${meetingId}:`, error);
    throw error;
  }
}

/**
 * Zoom 미팅 정보를 조회합니다.
 *
 * @param meetingId - 조회할 미팅 ID
 * @returns 미팅 정보
 *
 * @example
 * ```typescript
 * const meeting = await getZoomMeeting(1234567890);
 * console.log('Status:', meeting.status);
 * ```
 */
export async function getZoomMeeting(meetingId: number): Promise<ZoomMeeting> {
  try {
    const meeting = await zoomApiRequest<ZoomMeeting>(`/meetings/${meetingId}`);
    return meeting;
  } catch (error) {
    console.error(`❌ Failed to get Zoom meeting ${meetingId}:`, error);
    throw error;
  }
}

/**
 * Zoom 미팅을 업데이트합니다.
 *
 * @param meetingId - 업데이트할 미팅 ID
 * @param data - 업데이트할 데이터 (일부만 제공 가능)
 *
 * @example
 * ```typescript
 * await updateZoomMeeting(1234567890, {
 *   topic: '변경된 제목',
 *   start_time: '2025-10-16T10:00:00',
 * });
 * ```
 */
export async function updateZoomMeeting(
  meetingId: number,
  data: Partial<CreateZoomMeetingRequest>
): Promise<void> {
  try {
    await zoomApiRequest(`/meetings/${meetingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    console.log(`✅ Zoom meeting updated: ${meetingId}`);
  } catch (error) {
    console.error(`❌ Failed to update Zoom meeting ${meetingId}:`, error);
    throw error;
  }
}

// ============================================================================
// Health Check
// ============================================================================

/**
 * Zoom API 연결 상태를 확인합니다.
 *
 * @returns 연결 성공 시 true
 */
export async function testZoomConnection(): Promise<boolean> {
  try {
    validateZoomConfig();
    const accessToken = await getAccessToken();

    // "me" 사용자 정보 조회로 연결 테스트
    await zoomApiRequest('/users/me', {
      method: 'GET',
    });

    console.log('✅ Zoom API connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Zoom API connection test failed:', error);
    return false;
  }
}
