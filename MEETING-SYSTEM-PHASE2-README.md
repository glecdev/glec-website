# 리드 통합 관리 & 미팅 시스템 - Phase 2 진행 상황

## ✅ 완료된 작업 (Phase 1 + Phase 2 부분 완료)

### Phase 1: 인프라 구축 ✅
- Migration 004 실행 완료
- meeting_slots, meeting_bookings, meeting_proposal_tokens, lead_activities 테이블 생성
- contacts 테이블 리드 추적 필드 추가
- unified_leads 뷰 업데이트
- GET/POST /api/admin/meetings/slots API 구현

### Phase 2: 미팅 제안 이메일 (부분 완료)
- ✅ lib/email-templates/meeting-proposal.ts - 미팅 제안 이메일 템플릿
- ✅ lib/meeting-tokens.ts - 보안 토큰 생성/검증 유틸리티
- ⏳ app/api/admin/leads/send-meeting-proposal/route.ts - API (작성 중)

## 📋 Phase 2 남은 작업

### 1. Send Meeting Proposal API 완성
파일: `app/api/admin/leads/send-meeting-proposal/route.ts`

기능:
- 리드 정보 조회 (contacts or library_leads)
- 가능한 미팅 슬롯 개수 조회
- 보안 토큰 생성 및 저장
- Resend API로 이메일 발송
- lead_activities 로그 기록
- last_contacted_at 업데이트

### 2. 고객용 미팅 예약 API
파일: `app/api/meetings/availability/route.ts`, `app/api/meetings/book/route.ts`

## 📊 전체 시스템 아키텍처

### 워크플로우
```
1. 어드민 → 리드 관리 페이지에서 "미팅 제안" 버튼 클릭
2. API → 토큰 생성 + 이메일 발송
3. 고객 → 이메일 링크 클릭 (https://glec.io/meetings/schedule/{token})
4. 고객 → 가능한 시간대 확인 + 예약
5. 시스템 → 예약 확인 이메일 발송
6. 어드민 → 미팅 관리 페이지에서 예약 확인
```

### 데이터베이스 관계
```
contacts / library_leads (리드)
    ↓
meeting_proposal_tokens (1회용 링크)
    ↓
meeting_slots (가능한 시간대)
    ↓
meeting_bookings (예약 완료)
    ↓
lead_activities (모든 활동 로그)
```

## 🎯 다음 단계 우선순위

### High Priority (핵심 워크플로우)
1. ✅ 미팅 제안 이메일 템플릿
2. ⏳ Send Meeting Proposal API 완성
3. ⏳ 고객용 미팅 시간 선택 페이지
4. ⏳ 고객용 미팅 예약 API

### Medium Priority (어드민 UI)
5. 리드 관리 페이지에 "미팅 제안" 버튼 추가
6. 어드민 미팅 관리 기본 페이지

### Low Priority (고급 기능)
7. 미팅 리마인더 이메일
8. 미팅 결과 기록
9. 통계 및 리포트

## 🔒 보안 고려사항

1. **토큰 보안**
   - 64자 hex 토큰 (crypto.randomBytes)
   - 1회용 (used flag)
   - 만료 시간 (7일)

2. **입력 검증**
   - lead_id UUID 형식 검증
   - email 형식 검증
   - SQL injection 방지 (tagged template)

3. **권한 검증**
   - 어드민 API는 인증 필요 (TODO: JWT 미들웨어)
   - 고객 API는 토큰 검증만

## 📝 API 명세

### POST /api/admin/leads/send-meeting-proposal
```json
Request:
{
  "lead_type": "CONTACT",
  "lead_id": "uuid",
  "meeting_purpose": "GLEC 제품 상세 상담",
  "admin_name": "홍길동",
  "admin_email": "admin@glec.io",
  "admin_phone": "02-1234-5678",
  "token_expiry_days": 7
}

Response:
{
  "success": true,
  "data": {
    "token": "abc123...",
    "booking_url": "https://glec.io/meetings/schedule/abc123",
    "expires_at": "2025-10-19T12:00:00Z",
    "email_id": "re_...",
    "proposed_slots": 5
  }
}
```

## 🚀 배포 전 체크리스트

- [ ] Migration 004 프로덕션 실행
- [ ] NEXT_PUBLIC_SITE_URL 환경 변수 설정
- [ ] Resend API 키 검증
- [ ] 이메일 템플릿 테스트
- [ ] 토큰 생성/검증 테스트
- [ ] E2E 워크플로우 테스트

## 📈 현재 진행률

- Phase 1 (인프라): 100% ✅
- Phase 2 (이메일): 60% ⏳
- Phase 3 (고객 UI): 0%
- Phase 4 (어드민 UI): 0%

**전체**: 약 40% 완료
