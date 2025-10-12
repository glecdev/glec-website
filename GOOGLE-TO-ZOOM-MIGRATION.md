# Google Calendar → Zoom API Migration

**Date**: 2025-10-12
**Reason**: Google Workspace 조직 정책으로 인한 Service Account 제한
**Decision**: Zoom API로 전환

---

## 🚫 Google Calendar Integration - ARCHIVED

### 시도한 내용
- ✅ Phase 1-4: Planning, Packages, Infrastructure, Database Migration (Complete)
- ✅ Phase 5: API Integration (Complete)
- ✅ Phase 6: Service Account Setup (Complete)
- ❌ **Issue**: Service Account cannot create Google Meet events without Domain-Wide Delegation
- ❌ **Blocker**: 조직 정책으로 인해 Domain-Wide Delegation 설정 불가

### 발견된 제한사항
1. **Google Meet 생성 불가**: Service Account는 `conferenceData` (Google Meet) 생성 불가
2. **Attendees 초대 불가**: "Service accounts cannot invite attendees without Domain-Wide Delegation"
3. **조직 정책**: Google Workspace 조직에서 Service Account 권한 제한

### 보존할 코드
- `lib/google-calendar.ts` - 참고용으로 보관 (삭제하지 않음)
- Database schema (google_event_id, google_meet_link, google_calendar_link) - Zoom으로 재사용 가능
- Email templates with meet link - Zoom 링크로 재사용

---

## ✅ Zoom API Integration - NEW PLAN

### Why Zoom?
1. ✅ **간단한 API 구조**: OAuth 또는 Server-to-Server OAuth
2. ✅ **Meeting 생성 보장**: API만 있으면 무조건 가능
3. ✅ **조직 정책 독립적**: Google Workspace 제한 없음
4. ✅ **한국에서 널리 사용**: 고객들이 익숙함
5. ✅ **무료 플랜**: 40분 제한이지만 충분

### Zoom API Setup Steps

#### Step 1: Create Zoom Account (이미 완료)
- Email: contact@glec.io
- 계정 확인 필요

#### Step 2: Create Server-to-Server OAuth App
- Zoom Marketplace: https://marketplace.zoom.us/develop/create
- App Type: **Server-to-Server OAuth**
- App Name: GLEC Meeting System
- Short Description: Automated meeting scheduling for GLEC customers

#### Step 3: Get Credentials
- Account ID
- Client ID
- Client Secret

#### Step 4: Required Scopes
- `meeting:write:admin` - Create meetings
- `meeting:write:meeting` - Manage meetings
- `user:read:admin` - Read user info

---

## 📋 Implementation Plan

### Phase 7.1: Zoom API Setup (Playwright Automation)
**Duration**: 30분
**Task**: Playwright로 Zoom에 로그인하여 Server-to-Server OAuth App 생성

**Steps**:
1. Playwright 스크립트 생성: `scripts/zoom-api-setup.ts`
2. contact@glec.io로 https://marketplace.zoom.us/develop 로그인
3. "Build App" → "Server-to-Server OAuth" 선택
4. App 정보 입력 및 생성
5. Account ID, Client ID, Client Secret 캡처
6. .env.local에 credentials 추가

### Phase 7.2: Zoom API Client Library
**Duration**: 45분
**File**: `lib/zoom.ts`

**Functions**:
```typescript
// OAuth Token 획득
export async function getZoomAccessToken(): Promise<string>

// Zoom Meeting 생성
export async function createZoomMeeting(data: ZoomMeetingData): Promise<ZoomMeeting>

// Zoom Meeting 삭제
export async function deleteZoomMeeting(meetingId: string): Promise<void>
```

**ZoomMeetingData Interface**:
```typescript
interface ZoomMeetingData {
  topic: string;          // Meeting 제목
  type: 2;                // Scheduled meeting
  start_time: string;     // ISO 8601 (e.g., "2025-10-14T10:00:00Z")
  duration: number;       // Minutes
  timezone: string;       // "Asia/Seoul"
  agenda?: string;        // Meeting 설명
  settings?: {
    host_video: boolean;
    participant_video: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    waiting_room: boolean;
    auto_recording: 'none' | 'local' | 'cloud';
  };
}
```

**ZoomMeeting Response**:
```typescript
interface ZoomMeeting {
  id: number;             // Zoom meeting ID
  host_id: string;
  topic: string;
  start_url: string;      // Host용 시작 링크
  join_url: string;       // 참석자용 입장 링크 ⭐
  password?: string;
  h323_password?: string;
}
```

### Phase 7.3: Update Database Schema
**Status**: ✅ Already compatible!

**Current schema** (from Google Calendar migration):
```sql
-- meeting_bookings table
google_meet_link TEXT  -- 재사용: zoom_join_url로 사용
google_calendar_link TEXT  -- 재사용: zoom_start_url로 사용
google_event_id TEXT  -- 재사용: zoom_meeting_id로 사용
calendar_sync_status TEXT  -- 재사용: zoom_sync_status로 사용
```

**Column mapping**:
- `google_event_id` → Zoom meeting ID 저장
- `google_meet_link` → Zoom join URL 저장
- `google_calendar_link` → Zoom start URL 저장
- `calendar_sync_status` → Zoom 동기화 상태

**No migration needed!** 🎉

### Phase 7.4: Update `/api/meetings/book`
**Duration**: 30분

**Changes**:
```typescript
// 기존: createGoogleMeetEvent()
import { createZoomMeeting } from '@/lib/zoom';

// Step 6: Create Zoom meeting
const zoomMeeting = await createZoomMeeting({
  topic: `${slot.title} - ${lead.company_name}`,
  type: 2,
  start_time: new Date(slot.start_time).toISOString(),
  duration: 60,
  timezone: 'Asia/Seoul',
  agenda: `회사: ${lead.company_name}\n담당자: ${lead.contact_name}\n이메일: ${lead.email}\n\n${body.requested_agenda || ''}`,
  settings: {
    join_before_host: true,
    mute_upon_entry: true,
    waiting_room: false,
    auto_recording: 'none',
  },
});

// Step 7: Update booking with Zoom info
await sql`
  UPDATE meeting_bookings
  SET
    google_event_id = ${zoomMeeting.id.toString()},
    google_meet_link = ${zoomMeeting.join_url},
    google_calendar_link = ${zoomMeeting.start_url},
    calendar_sync_status = 'SYNCED'
  WHERE id = ${booking.id}
`;
```

### Phase 7.5: Update Email Templates
**Status**: ✅ Already compatible!

**Current template**:
- `googleMeetLink` → Zoom join URL
- `googleCalendarLink` → Zoom start URL (관리자용)

**Email template 변경 불필요** - 변수명만 재사용!

### Phase 7.6: Testing
**Duration**: 30분

**Test script**: `scripts/test-zoom-connection.ts`

```typescript
async function testZoomConnection() {
  // 1. Get access token
  const token = await getZoomAccessToken();

  // 2. Create test meeting
  const meeting = await createZoomMeeting({...});

  // 3. Verify meeting created
  console.log('Join URL:', meeting.join_url);

  // 4. Delete test meeting
  await deleteZoomMeeting(meeting.id.toString());
}
```

---

## 📊 Migration Checklist

### Files to Archive (NOT DELETE)
- [ ] `lib/google-calendar.ts` → Rename to `lib/google-calendar.archived.ts`
- [ ] `GOOGLE-APIS-*.md` documents → Move to `docs/archived/`

### Files to Create
- [ ] `lib/zoom.ts` - Zoom API client
- [ ] `scripts/zoom-api-setup.ts` - Playwright automation for API setup
- [ ] `scripts/test-zoom-connection.ts` - Connection test

### Files to Update
- [ ] `app/api/meetings/book/route.ts` - Replace Google with Zoom
- [ ] `.env.local` - Add Zoom credentials
- [ ] `.env.local.example` - Document Zoom env vars

### Database
- [ ] ✅ No changes needed! (Reuse existing columns)

---

## 🎯 Success Criteria

### Phase 7 Complete When:
- [ ] Zoom Server-to-Server OAuth App created
- [ ] Account ID, Client ID, Client Secret obtained
- [ ] `lib/zoom.ts` working and tested
- [ ] Booking API creates Zoom meetings
- [ ] Email template shows Zoom join link
- [ ] Test booking creates real Zoom meeting

---

## 📝 Environment Variables (.env.local)

```bash
# Zoom API (Meeting System - Server-to-Server OAuth)
ZOOM_ACCOUNT_ID="your_account_id"
ZOOM_CLIENT_ID="your_client_id"
ZOOM_CLIENT_SECRET="your_client_secret"

# Optional: User ID (if not using default user)
ZOOM_USER_ID="me"  # or specific user email
```

---

## 🔗 References

- Zoom API Documentation: https://developers.zoom.us/docs/api/
- Server-to-Server OAuth: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
- Create Meeting API: https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate
- Zoom Marketplace: https://marketplace.zoom.us/develop/create

---

**Migration Status**: 🚀 Ready to Start
**Next Action**: Run Playwright automation to create Zoom OAuth App
