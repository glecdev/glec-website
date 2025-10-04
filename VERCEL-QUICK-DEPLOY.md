# GLEC Website - Vercel Quick Deployment Guide

**플랫폼**: Vercel + Neon PostgreSQL
**소요 시간**: 10분
**난이도**: ⭐ 쉬움

---

## 🎯 현재 상태

✅ **완료된 작업**:
- Vercel 프로젝트 생성 및 연결
- GitHub 저장소 푸시
- 초기 배포 성공
- Production URL: https://glec-website.vercel.app

⏳ **남은 작업**:
- Neon PostgreSQL 데이터베이스 생성
- 환경 변수 추가
- 데이터베이스 마이그레이션
- 기능 테스트

---

## 📝 Step 1: 환경 변수 생성 (자동)

이미 생성된 환경 변수:

\`\`\`
JWT_SECRET=l8QvGUhHvCRIWzp9jYd6spUWCl3SaVIX
NEXTAUTH_SECRET=dujOrSKI/WmIyszrDYWdunXZoMi4uIa/
ADMIN_PASSWORD_HASH=$2b$10$t8TJYW0ON/wyQ0/B1ZwnBubzKd2saGEjYYgVZs37wcFuxzaDDiQ0O
\`\`\`

**Admin 로그인 정보**:
- Email: admin@glec.io
- Password: GLEC2025Admin!

---

## 📝 Step 2: Neon PostgreSQL 설정 (5분)

### 2.1 Neon 계정 생성

1. Visit: **https://console.neon.tech/signup**
2. **Sign up with GitHub** (권장)
3. 이메일 인증 완료

### 2.2 프로젝트 생성

1. **"Create a project"** 클릭
2. 설정:
   - Project name: \`glec-production\`
   - PostgreSQL version: \`16\`
   - Region: \`AWS ap-northeast-1 (Tokyo)\`
3. **"Create Project"** 클릭

### 2.3 Connection String 복사

1. Dashboard에서 **"Connection Details"** 찾기
2. **"Pooled connection"** 선택 ⚠️ 중요!
3. Connection string 복사:

\`\`\`
postgresql://neondb_owner:AbCd123XyZ@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
\`\`\`

---

## 📝 Step 3: Vercel 환경 변수 추가 (3분)

### 3.1 Vercel Dashboard 접속

1. Visit: **https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables**
2. **"Add New"** 클릭

### 3.2 환경 변수 추가

아래 10개 변수를 하나씩 추가하세요:

| Key | Value | Environment |
|-----|-------|-------------|
| \`DATABASE_URL\` | \`postgresql://...\` (Neon에서 복사) | Production |
| \`DIRECT_URL\` | \`postgresql://...\` (DATABASE_URL과 동일) | Production |
| \`JWT_SECRET\` | \`l8QvGUhHvCRIWzp9jYd6spUWCl3SaVIX\` | Production |
| \`NEXTAUTH_SECRET\` | \`dujOrSKI/WmIyszrDYWdunXZoMi4uIa/\` | Production |
| \`NEXTAUTH_URL\` | \`https://glec-website.vercel.app\` | Production |
| \`ADMIN_EMAIL\` | \`admin@glec.io\` | Production |
| \`ADMIN_PASSWORD_HASH\` | \`$2b$10$t8TJYW0ON/wyQ0/B1ZwnBubzKd2saGEjYYgVZs37wcFuxzaDDiQ0O\` | Production |
| \`RESEND_API_KEY\` | \`skip\` (나중에 업데이트) | Production |
| \`RESEND_FROM_EMAIL\` | \`noreply@glec.io\` | Production |
| \`R2_ACCOUNT_ID\` | \`skip\` (나중에 업데이트) | Production |

**참고**: RESEND, R2는 선택사항입니다. 나중에 업데이트 가능합니다.

---

## 📝 Step 4: 데이터베이스 마이그레이션 (2분)

### 4.1 로컬에서 마이그레이션

\`\`\`bash
cd glec-website

# Neon CONNECTION_STRING을 환경변수로 설정
# Windows PowerShell
$env:DATABASE_URL="postgresql://neondb_owner:AbCd123XyZ@ep-xxx.aws.neon.tech/neondb?sslmode=require"
npx prisma migrate deploy

# Git Bash / Linux / macOS
DATABASE_URL="postgresql://..." npx prisma migrate deploy
\`\`\`

**성공 메시지**:
\`\`\`
✔ Generated Prisma Client
✔ Applied 1 migration
\`\`\`

### 4.2 데이터베이스 확인 (선택)

\`\`\`bash
npx prisma studio
\`\`\`

→ http://localhost:5555 접속
→ Tables 확인: users, notices, press, videos, blogs, etc.

---

## 📝 Step 5: Vercel 재배포 (1분)

환경 변수 추가 후 자동으로 재배포됩니다.

**수동으로 재배포하려면**:

\`\`\`bash
cd glec-website
vercel --prod --token=4WjWFbv1BRjxABWdkzCI6jF0
\`\`\`

또는 Vercel Dashboard에서:
1. Visit: https://vercel.com/glecdevs-projects/glec-website
2. **"Deployments"** 탭
3. **"Redeploy"** 클릭

---

## ✅ Step 6: 기능 테스트 (5-10분)

### 6.1 Homepage 테스트

- Visit: **https://glec-website.vercel.app**
- ✅ 페이지 로딩 확인
- ✅ 이미지 표시 확인
- ✅ 네비게이션 작동 확인

### 6.2 Admin 로그인 테스트

1. Visit: **https://glec-website.vercel.app/admin/login**
2. 로그인:
   - Email: \`admin@glec.io\`
   - Password: \`GLEC2025Admin!\`
3. ✅ 로그인 성공 → /admin/dashboard로 리다이렉트

### 6.3 Admin Dashboard 테스트

- Visit: **https://glec-website.vercel.app/admin/dashboard**
- ✅ 대시보드 표시 (통계 0은 정상)

### 6.4 공지사항 CRUD 테스트

1. Visit: **https://glec-website.vercel.app/admin/notices**
2. **"+ New Notice"** 클릭
3. 작성:
   - Title: "Welcome to GLEC"
   - Content: "This is a test notice"
   - Category: GENERAL
   - Status: PUBLISHED
4. **"Create"** 클릭
5. ✅ 공지사항이 목록에 표시됨

### 6.5 실시간 동기화 테스트

1. Visit: **https://glec-website.vercel.app/news**
2. ✅ "Welcome to GLEC" 공지사항이 표시됨
3. 공지사항 클릭
4. ✅ 상세 페이지 표시

---

## 🎉 배포 완료!

모든 테스트가 통과했다면 배포 성공입니다!

**Production URLs**:
- 메인: https://glec-website.vercel.app
- Admin: https://glec-website.vercel.app/admin/login

**Admin 계정**:
- Email: admin@glec.io
- Password: GLEC2025Admin!

---

## 📚 다음 단계 (선택사항)

### Resend 이메일 설정

Contact Form 기능 활성화:

1. Visit: **https://resend.com/signup**
2. API Key 생성
3. Vercel에 추가:
   - \`RESEND_API_KEY=re_xxx\`
4. 재배포

### Cloudflare R2 파일 저장소

파일 업로드 기능 활성화:

1. Visit: **https://dash.cloudflare.com/r2**
2. Bucket 생성: \`glec-assets\`
3. API Token 생성
4. Vercel에 추가:
   - \`R2_ACCOUNT_ID=xxx\`
   - \`R2_ACCESS_KEY_ID=xxx\`
   - \`R2_SECRET_ACCESS_KEY=xxx\`
   - \`R2_PUBLIC_URL=https://pub-xxx.r2.dev\`
5. 재배포

---

## 🚨 트러블슈팅

### 문제: "Database connection failed"

**해결**:
1. Vercel 환경 변수에서 \`DATABASE_URL\` 확인
2. Neon Dashboard에서 프로젝트가 Active 상태인지 확인
3. Connection String에 \`?sslmode=require\` 포함 확인

### 문제: "Admin login fails"

**해결**:
1. Vercel 환경 변수에서 \`ADMIN_EMAIL\`, \`ADMIN_PASSWORD_HASH\`, \`JWT_SECRET\` 확인
2. 브라우저 콘솔에서 에러 확인
3. Vercel Logs 확인: https://vercel.com/glecdevs-projects/glec-website

### 문제: "500 Internal Server Error"

**해결**:
1. Vercel Deployment Logs 확인
2. 누락된 환경 변수 찾기
3. 데이터베이스 마이그레이션 재실행

---

## 📞 Support

- GitHub Issues: https://github.com/glecdev/glec-website/issues
- Vercel Logs: https://vercel.com/glecdevs-projects/glec-website
- Neon Dashboard: https://console.neon.tech

---

**최종 업데이트**: 2025-10-04
**버전**: 1.0.0
