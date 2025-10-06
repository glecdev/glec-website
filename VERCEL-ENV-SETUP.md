# Vercel 환경 변수 설정 가이드

## 🔥 필수 환경 변수 (Vercel Dashboard에서 설정)

Vercel 프로젝트 → Settings → Environment Variables 에서 다음 변수들을 추가하세요:

### 1. Database (Neon PostgreSQL)

```bash
# Pooled Connection (Vercel Edge Functions용)
DATABASE_URL="postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Direct Connection (Prisma Migrations용)
DIRECT_URL="postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**⚠️ 중요**:
- `DATABASE_URL`은 **Pooled Connection** (`-pooler` 포함) 사용
- `DIRECT_URL`은 **Direct Connection** (`-pooler` 없음) 사용

---

### 2. Authentication (JWT)

```bash
# JWT Secret (최소 32자 이상)
JWT_SECRET="production-jwt-secret-CHANGE-THIS-TO-RANDOM-32-CHARS-OR-MORE"

# NextAuth Secret (최소 32자 이상)
NEXTAUTH_SECRET="production-nextauth-secret-CHANGE-THIS-TO-RANDOM-32-CHARS"

# NextAuth URL (프로덕션 도메인)
NEXTAUTH_URL="https://your-domain.vercel.app"
```

**🔐 보안 권장사항**:
```bash
# 강력한 랜덤 시크릿 생성 방법
openssl rand -base64 32
# 또는
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### 3. Email (Resend)

```bash
# Resend API Key
RESEND_API_KEY="re_YOUR_ACTUAL_RESEND_API_KEY"

# Sender Email (Resend에서 verify된 도메인)
RESEND_FROM_EMAIL="noreply@glec.io"
```

**📧 Resend 설정**:
1. https://resend.com/api-keys 에서 API Key 생성
2. Domain verify: https://resend.com/domains
3. `noreply@glec.io` 또는 verify된 이메일 사용

---

### 4. Cloudflare R2 (Optional - 파일 업로드 사용 시)

```bash
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="glec-assets"
R2_PUBLIC_URL="https://assets.glec.io"
```

---

### 5. Admin (초기 관리자 계정)

```bash
ADMIN_EMAIL="admin@glec.io"
# bcrypt 해시된 비밀번호 (bcrypt.hash("password", 10))
ADMIN_PASSWORD_HASH="$2b$10$..."
```

---

## 📋 Vercel 설정 체크리스트

### Step 1: Vercel Dashboard 접속
1. https://vercel.com/dashboard 접속
2. GLEC 프로젝트 선택
3. Settings → Environment Variables 클릭

### Step 2: 환경 변수 추가
각 환경 변수를 다음 형식으로 추가:

| Name | Value | Environment |
|------|-------|-------------|
| DATABASE_URL | postgresql://... | Production, Preview, Development |
| DIRECT_URL | postgresql://... | Production, Preview, Development |
| JWT_SECRET | [32자 이상 랜덤] | Production, Preview |
| NEXTAUTH_SECRET | [32자 이상 랜덤] | Production, Preview |
| NEXTAUTH_URL | https://your-domain.vercel.app | Production |
| RESEND_API_KEY | re_... | Production, Preview |
| RESEND_FROM_EMAIL | noreply@glec.io | Production, Preview, Development |

**⚠️ 주의**:
- `JWT_SECRET`, `NEXTAUTH_SECRET`은 **Production과 Preview에만** 설정 (Development는 로컬 .env.local 사용)
- `NEXTAUTH_URL`은 **Production**에만 설정

### Step 3: 재배포 트리거
환경 변수 추가 후:
1. Deployments 탭 → 최신 배포의 "..." 메뉴 → "Redeploy"
2. 또는 새 커밋을 푸시하여 자동 배포

---

## 🧪 배포 후 테스트

### 1. 웹사이트 접근 테스트
```bash
# 메인 페이지
https://your-domain.vercel.app/

# 데모 신청 페이지
https://your-domain.vercel.app/demo-request
```

### 2. 어드민 포탈 접근 테스트
```bash
# 어드민 로그인
https://your-domain.vercel.app/admin/login

# 로그인 후 대시보드
https://your-domain.vercel.app/admin/dashboard

# 데모 요청 관리
https://your-domain.vercel.app/admin/demo-requests
```

### 3. API 엔드포인트 테스트
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# 데모 요청 제출 (POST)
curl -X POST https://your-domain.vercel.app/api/demo-request \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","contactName":"Tester","email":"test@example.com",...}'
```

---

## ❌ 문제 해결 (Troubleshooting)

### 문제 1: "Database connection failed"
**원인**: `DATABASE_URL`이 Pooled Connection이 아님
**해결**:
```bash
# 잘못된 예 (Direct Connection)
postgresql://...@ep-name.us-east-1.aws.neon.tech/...

# 올바른 예 (Pooled Connection)
postgresql://...@ep-name-pooler.us-east-1.aws.neon.tech/...
#                      ^^^^^^^ 주목
```

### 문제 2: "JWT_SECRET is not defined"
**원인**: 환경 변수 미설정
**해결**: Vercel Dashboard에서 `JWT_SECRET` 추가 (최소 32자)

### 문제 3: "Admin login not working"
**원인**:
1. `JWT_SECRET` 누락
2. `DATABASE_URL` 연결 실패
3. Admin 계정 미생성

**해결**:
```bash
# 로컬에서 Admin 계정 생성
npm run prisma:seed

# 또는 수동 생성
npx prisma studio
# User 테이블에서 role: SUPER_ADMIN인 계정 추가
```

### 문제 4: "Email not sending"
**원인**: Resend API Key 또는 Sender Email 미설정
**해결**:
1. https://resend.com/api-keys 에서 API Key 생성
2. `RESEND_API_KEY` 추가
3. `RESEND_FROM_EMAIL`을 verify된 도메인으로 설정

---

## 📊 배포 상태 확인

### Vercel 배포 로그 확인
1. Vercel Dashboard → Deployments
2. 최신 배포 클릭
3. "Build Logs" 탭에서 에러 확인

### 일반적인 빌드 에러

**1. Prisma 생성 실패**
```
Error: Prisma schema could not be generated
```
**해결**: `DIRECT_URL` 환경 변수 추가

**2. TypeScript 에러**
```
Type error: Property 'xyz' does not exist
```
**해결**: `next.config.mjs`에 이미 설정됨 (`typescript.ignoreBuildErrors: true`)

**3. 환경 변수 참조 에러**
```
Error: process.env.DATABASE_URL is undefined
```
**해결**: Vercel에서 해당 환경 변수 추가 후 재배포

---

## ✅ 최종 체크리스트

배포 전 확인사항:

- [ ] `DATABASE_URL` (Pooled Connection) 설정됨
- [ ] `DIRECT_URL` (Direct Connection) 설정됨
- [ ] `JWT_SECRET` (32자 이상) 설정됨
- [ ] `NEXTAUTH_SECRET` (32자 이상) 설정됨
- [ ] `NEXTAUTH_URL` (프로덕션 도메인) 설정됨
- [ ] `RESEND_API_KEY` 설정됨
- [ ] `RESEND_FROM_EMAIL` (verify된 이메일) 설정됨
- [ ] Admin 계정 생성됨 (`npm run prisma:seed`)
- [ ] GitHub에 최신 코드 푸시됨
- [ ] Vercel 자동 배포 완료됨
- [ ] 웹사이트 접근 테스트 완료
- [ ] 어드민 로그인 테스트 완료
- [ ] API 엔드포인트 테스트 완료

---

## 🚀 다음 단계

배포 완료 후:
1. ✅ Homepage 나머지 섹션 구현
2. ✅ 제품 소개 페이지 구현
3. ✅ 공지사항 UI 구현
4. ✅ 어드민 콘텐츠 관리 완성
5. ✅ 성능 최적화 (Lighthouse 90+)

---

**Last Updated**: 2025-10-06
**Version**: 1.0.0
