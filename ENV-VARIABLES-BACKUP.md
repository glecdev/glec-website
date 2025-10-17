# GLEC Website - Environment Variables Backup

**작성일**: 2025-10-17 18:00 KST
**작성자**: Claude AI Agent
**목적**: 프로덕션 환경 변수 백업 및 이메일 주소 정보 기록

---

## 📧 이메일 주소 정보 (중요!)

### 공식 어드민 이메일
```
admin@glec.io
```
**용도**:
- 시스템 공식 관리자 이메일
- 프로덕션 환경에서 사용
- 고객 대응 및 공식 알림용

### 클라이언트 테스트용 이메일
```
oillex.co.kr@gmail.com
```
**용도**:
- 개발/테스트 환경에서 사용
- 내부 테스트용 알림 수신
- 데모 및 QA 테스트용

---

## 🔐 프로덕션 환경 변수 목록

### 최근 추가된 변수 (4h ago)

| 변수명 | 용도 | 환경 |
|--------|------|------|
| `ADMIN_NOTIFICATION_EMAIL` | 어드민 알림 이메일 주소 | Production |
| `RESEND_WEBHOOK_SECRET` | Resend Webhook 서명 검증 시크릿 | Production |
| `CRON_SECRET` | Cron Job 인증 시크릿 | Production |

**⚠️ 중요**: `ADMIN_NOTIFICATION_EMAIL` 값은 `admin@glec.io`로 설정되어야 합니다.

### 기존 변수 (5d ago)

| 변수명 | 용도 | 환경 |
|--------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 사이트 공개 URL | Production |
| `ADMIN_EMAIL` | 일반 어드민 이메일 | Production, Preview, Development |
| `RESEND_FROM_EMAIL` | 이메일 발신자 주소 | Production, Preview, Development |
| `RESEND_API_KEY` | Resend API 키 | Production, Preview, Development |

### 코어 변수 (13d ago)

| 변수명 | 용도 | 환경 |
|--------|------|------|
| `DATABASE_URL` | Neon PostgreSQL 연결 URL (Pooled) | Production |
| `DIRECT_URL` | Neon PostgreSQL 직접 연결 URL | Production |
| `JWT_SECRET` | JWT 토큰 서명 시크릿 | Production |
| `NEXTAUTH_URL` | NextAuth.js 기본 URL | Production |
| `NEXTAUTH_SECRET` | NextAuth.js 시크릿 | Production |
| `ADMIN_PASSWORD_HASH` | 어드민 비밀번호 해시 | Production |

### Cloudflare R2 변수 (13d ago)

| 변수명 | 용도 | 환경 |
|--------|------|------|
| `R2_ACCOUNT_ID` | Cloudflare R2 계정 ID | Production |
| `R2_ACCESS_KEY_ID` | R2 액세스 키 ID | Production |
| `R2_SECRET_ACCESS_KEY` | R2 시크릿 액세스 키 | Production |
| `R2_BUCKET_NAME` | R2 버킷 이름 | Production |
| `R2_PUBLIC_URL` | R2 공개 URL | Production |

### Stack Auth 변수 (13d ago)

| 변수명 | 용도 | 환경 |
|--------|------|------|
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Stack Auth 프로젝트 ID | Production |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth 공개 클라이언트 키 | Production |
| `STACK_SECRET_SERVER_KEY` | Stack Auth 서버 시크릿 키 | Production |

---

## 🔧 환경 변수 수정 필요 사항

### ADMIN_NOTIFICATION_EMAIL 수정

**현재 값** (추정): `oillex.co.kr@gmail.com` (테스트용)
**변경 필요**: `admin@glec.io` (공식 어드민 이메일)

**수정 방법**:

#### Option 1: Vercel CLI (권장)
```bash
cd glec-website

# 기존 변수 삭제
npx vercel env rm ADMIN_NOTIFICATION_EMAIL production --yes

# 새 값으로 추가
printf 'admin@glec.io' | npx vercel env add ADMIN_NOTIFICATION_EMAIL production

# 재배포
npx vercel --prod --yes --force
```

#### Option 2: Vercel 대시보드
1. https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables
2. `ADMIN_NOTIFICATION_EMAIL` 찾기
3. "Edit" (연필 아이콘) 클릭
4. Value를 `admin@glec.io`로 변경
5. Save 클릭
6. 재배포 (Deployments → "..." → "Redeploy")

---

## 📝 환경 변수 값 (참고용)

### RESEND_WEBHOOK_SECRET
```
Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=
```

### CRON_SECRET
```
OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=
```

### ADMIN_NOTIFICATION_EMAIL (올바른 값)
```
admin@glec.io
```

---

## 🔍 환경 변수 조회 명령어

```bash
# 프로덕션 환경 변수 목록
npx vercel env ls production

# 특정 환경의 모든 변수 다운로드
npx vercel env pull .env.production --environment=production

# 개발 환경 변수
npx vercel env pull .env.local --environment=development
```

---

## ⚠️ 보안 주의사항

1. **절대 Git에 커밋하지 마세요**
   - `.env.*` 파일은 `.gitignore`에 포함되어 있음
   - 이 문서는 로컬에만 보관하거나 암호화된 저장소에 저장

2. **환경 변수 값 공유 금지**
   - Slack, 이메일 등 외부 채널에 값 공유 금지
   - 필요 시 1Password, LastPass 등 비밀번호 관리 도구 사용

3. **정기적인 시크릿 교체**
   - JWT_SECRET, NEXTAUTH_SECRET: 3개월마다
   - API 키: 문제 발생 시 즉시 교체

4. **접근 권한 관리**
   - Vercel 대시보드 접근 권한 최소화
   - 2FA 활성화 필수

---

## 📊 환경 변수 상태

| 변수 | 상태 | 마지막 확인 |
|------|------|-------------|
| RESEND_WEBHOOK_SECRET | ✅ 설정됨 | 2025-10-17 18:00 |
| CRON_SECRET | ✅ 설정됨 | 2025-10-17 18:00 |
| ADMIN_NOTIFICATION_EMAIL | ⚠️ 수정 필요 | 2025-10-17 18:00 |
| DATABASE_URL | ✅ 정상 | 2025-10-17 18:00 |
| RESEND_API_KEY | ✅ 정상 | 2025-10-17 18:00 |
| JWT_SECRET | ✅ 정상 | 2025-10-17 18:00 |

---

## 🔄 변경 이력

| 날짜 | 변경 내용 | 작업자 |
|------|-----------|--------|
| 2025-10-17 | RESEND_WEBHOOK_SECRET, CRON_SECRET 추가 | Claude AI |
| 2025-10-17 | ADMIN_NOTIFICATION_EMAIL 추가 (수정 필요) | Claude AI |
| 2025-10-12 | NEXT_PUBLIC_SITE_URL 추가 | glecdev |
| 2025-10-05 | 초기 환경 변수 설정 | glecdev |

---

**다음 작업**: `ADMIN_NOTIFICATION_EMAIL`을 `admin@glec.io`로 수정 후 재배포
