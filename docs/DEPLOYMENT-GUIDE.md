# GLEC 프로젝트 배포 가이드

> **배포 일자**: 2025-10-04
> **배포 플랫폼**: Cloudflare Pages + Workers Functions
> **아키텍처**: Hybrid Static + Server-Side Rendering
> **월 비용**: $0 (Free Tier)

---

## 📋 목차

1. [배포 전 준비사항](#1-배포-전-준비사항)
2. [Cloudflare 설정](#2-cloudflare-설정)
3. [Neon DB 설정](#3-neon-db-설정)
4. [프로덕션 빌드](#4-프로덕션-빌드)
5. [Cloudflare Pages 배포](#5-cloudflare-pages-배포)
6. [환경 변수 설정](#6-환경-변수-설정)
7. [배포 검증](#7-배포-검증)
8. [트러블슈팅](#8-트러블슈팅)

---

## 1. 배포 전 준비사항

### 1.1 필수 계정 생성

- ✅ [Cloudflare](https://dash.cloudflare.com/sign-up) 계정 (Free)
- ✅ [Neon](https://neon.tech) PostgreSQL 계정 (Free Tier)
- ✅ [Resend](https://resend.com) 이메일 서비스 계정 (Free: 100 emails/day)
- ✅ [GitHub](https://github.com) 계정 (코드 저장소)

### 1.2 로컬 개발 환경 확인

```bash
# Node.js 버전 확인 (18.0.0 이상)
node --version

# npm 버전 확인
npm --version

# Git 설정 확인
git config --list
```

### 1.3 프로젝트 의존성 설치

```bash
cd glec-website
npm install
```

### 1.4 배포 전 체크리스트

- [ ] 모든 E2E 테스트 통과 (`npm run test:e2e`)
- [ ] TypeScript 에러 없음 (`npx tsc --noEmit`)
- [ ] ESLint 경고 확인 (`npm run lint`)
- [ ] 환경 변수 준비 (`.env.local.example` 참조)
- [ ] Git 저장소 최신 상태 (`git push origin main`)

---

## 2. Cloudflare 설정

### 2.1 Wrangler CLI 설치

```bash
# Wrangler 전역 설치
npm install -g wrangler

# 버전 확인 (3.0.0 이상)
wrangler --version

# Cloudflare 계정 로그인
wrangler login
```

브라우저가 열리면 **"Allow"** 클릭하여 인증 완료.

### 2.2 Cloudflare Pages 프로젝트 생성

#### 방법 1: 웹 대시보드 사용 (권장)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 접속
2. **"Pages"** 메뉴 클릭
3. **"Create a project"** 클릭
4. **"Connect to Git"** 선택
5. GitHub 계정 연결 및 `glec-website` 저장소 선택
6. **Build settings**:
   ```yaml
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: glec-website
   Node version: 18
   ```
7. **"Save and Deploy"** 클릭

#### 방법 2: Wrangler CLI 사용

```bash
# 프로젝트 생성
wrangler pages project create glec-website

# Git 연동
wrangler pages project connect glec-website --github
```

### 2.3 Cloudflare R2 설정 (파일 스토리지)

```bash
# R2 버킷 생성
wrangler r2 bucket create glec-assets

# 버킷 목록 확인
wrangler r2 bucket list

# CORS 설정 (외부 도메인에서 접근 허용)
wrangler r2 bucket cors set glec-assets --allow-origin "*" --allow-method GET,HEAD,OPTIONS
```

**R2 공개 URL 설정**:

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** 메뉴
2. `glec-assets` 버킷 클릭
3. **Settings** → **Public access** → **Allow Access** 클릭
4. **R2.dev subdomain** 활성화
5. 공개 URL 복사: `https://glec-assets.{account-id}.r2.dev`

### 2.4 Cloudflare Workers KV 설정 (캐시/세션)

```bash
# KV namespace 생성 (Production)
wrangler kv:namespace create "GLEC_KV"

# 출력 예시:
# { binding = "GLEC_KV", id = "abc123..." }

# KV namespace 생성 (Preview - 로컬 개발용)
wrangler kv:namespace create "GLEC_KV" --preview

# 출력 예시:
# { binding = "GLEC_KV", preview_id = "xyz789..." }
```

생성된 `id`와 `preview_id`를 메모해두세요.

---

## 3. Neon DB 설정

### 3.1 Neon 프로젝트 생성

1. [Neon Console](https://console.neon.tech) 접속
2. **"Create Project"** 클릭
3. 프로젝트 설정:
   ```yaml
   Project name: GLEC Website
   PostgreSQL version: 15
   Region: Asia (Seoul) 또는 가장 가까운 리전
   ```
4. **"Create Project"** 클릭

### 3.2 데이터베이스 연결 정보 복사

Neon 대시보드에서 **"Connection String"** 복사:

```bash
# Pooled connection (권장)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&pgbouncer=true"

# Direct connection
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"
```

### 3.3 데이터베이스 마이그레이션

```bash
# Prisma 마이그레이션 생성
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate
```

### 3.4 초기 데이터 시딩 (선택사항)

```bash
# Admin 계정 생성 스크립트 실행
node scripts/create-admin.js
```

---

## 4. 프로덕션 빌드

### 4.1 환경 변수 설정

`.env.production` 파일 생성 (로컬 테스트용):

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# Authentication
JWT_SECRET="your-production-jwt-secret-minimum-32-characters-long"
NEXTAUTH_URL="https://glec.io"

# Email (Resend)
RESEND_API_KEY="re_your_production_resend_api_key"
RESEND_FROM_EMAIL="noreply@glec.io"

# Cloudflare R2 (File Storage)
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="glec-assets"
R2_PUBLIC_URL="https://glec-assets.{account-id}.r2.dev"

# Cloudflare Workers KV
KV_NAMESPACE_ID="your-kv-namespace-id"
```

### 4.2 프로덕션 빌드 테스트

```bash
# 빌드 실행
NODE_ENV=production npm run build

# 빌드 결과 확인
ls -la .next/
```

예상 출력:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (XX/XX)
✓ Finalizing page optimization

Build completed in XX.XXs
```

### 4.3 로컬에서 프로덕션 빌드 테스트

```bash
# 프로덕션 서버 시작
npm start

# 브라우저에서 http://localhost:3000 접속 확인
```

---

## 5. Cloudflare Pages 배포

### 5.1 GitHub Push (자동 배포)

```bash
# 변경사항 커밋
git add .
git commit -m "Deploy: Production build ready"

# GitHub에 푸시
git push origin main
```

Cloudflare Pages가 자동으로 빌드 및 배포를 시작합니다.

### 5.2 Wrangler CLI로 수동 배포

```bash
# 빌드 후 배포
npm run build
wrangler pages deploy .next --project-name=glec-website
```

### 5.3 배포 상태 확인

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages** → **glec-website**
2. **Deployments** 탭에서 빌드 로그 확인
3. 배포 완료 후 **Preview URL** 클릭하여 확인

---

## 6. 환경 변수 설정

### 6.1 Cloudflare Pages 환경 변수 추가

1. Cloudflare Dashboard → **Pages** → **glec-website**
2. **Settings** → **Environment variables** 클릭
3. **Production** 탭에서 다음 변수 추가:

```yaml
DATABASE_URL: postgresql://...
DIRECT_URL: postgresql://...
JWT_SECRET: your-jwt-secret-32-chars-min
NEXTAUTH_URL: https://glec.io
NEXTAUTH_SECRET: your-nextauth-secret
RESEND_API_KEY: re_your_api_key
RESEND_FROM_EMAIL: noreply@glec.io
R2_ACCOUNT_ID: your-account-id
R2_ACCESS_KEY_ID: your-access-key
R2_SECRET_ACCESS_KEY: your-secret-key
R2_BUCKET_NAME: glec-assets
R2_PUBLIC_URL: https://glec-assets.xxx.r2.dev
KV_NAMESPACE_ID: your-kv-id
```

4. **"Save"** 클릭
5. **"Redeploy"** 클릭하여 새로운 환경 변수 적용

---

## 7. 배포 검증

### 7.1 프로덕션 사이트 확인

배포된 URL (예: `https://glec-website.pages.dev`) 접속 후 확인:

- [ ] Homepage 로딩 확인
- [ ] 모든 정적 페이지 로딩 (Products, About, Contact)
- [ ] 동적 페이지 로딩 (`/notices/[slug]`)
- [ ] Admin 로그인 확인 (`/admin/login`)
- [ ] API 응답 확인 (`/api/notices`)
- [ ] 이미지 및 파일 로딩 (R2)
- [ ] 폼 제출 (Contact form)
- [ ] 이메일 발송 (Resend)

### 7.2 성능 테스트

```bash
# Lighthouse 분석
npx lighthouse https://glec-website.pages.dev --view

# 목표:
# - Performance: 90+
# - Accessibility: 100
# - Best Practices: 90+
# - SEO: 90+
```

### 7.3 E2E 테스트 (프로덕션)

```bash
# 프로덕션 URL로 테스트
BASE_URL=https://glec-website.pages.dev npm run test:e2e
```

---

## 8. 트러블슈팅

### 문제 1: 빌드 실패 - TypeScript 에러

**증상**:
```
Type error: Cannot find module 'xxx' or its corresponding type declarations
```

**해결**:
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 캐시 제거
rm -rf .next tsconfig.tsbuildinfo
npm run build
```

### 문제 2: 환경 변수 인식 안 됨

**증상**:
```
Error: DATABASE_URL is not defined
```

**해결**:
1. Cloudflare Dashboard → Pages → Settings → Environment variables
2. **Production** 탭에서 변수가 올바르게 설정되었는지 확인
3. 변수 값에 공백이나 특수문자가 있으면 따옴표로 감싸기
4. **Redeploy** 클릭하여 재배포

### 문제 3: Database 연결 실패

**증상**:
```
Error: P1001: Can't reach database server
```

**해결**:
1. Neon Dashboard에서 데이터베이스 상태 확인
2. Connection String이 **Pooled** 버전인지 확인 (`?pgbouncer=true`)
3. IP Whitelist 설정 (Neon Settings → Allowed IPs → `0.0.0.0/0` 추가)
4. SSL 모드 확인 (`?sslmode=require`)

### 문제 4: Cloudflare Workers CPU 제한 초과

**증상**:
```
Error: CPU time limit exceeded (10ms)
```

**해결**:
1. 무거운 연산을 클라이언트 사이드로 이동
2. Database 쿼리 최적화 (인덱스 추가)
3. 캐싱 활용 (Workers KV)
4. Static Export 가능한 페이지는 정적 생성

### 문제 5: R2 이미지 로딩 실패 (CORS)

**증상**:
```
Access to image at 'https://xxx.r2.dev/image.jpg' has been blocked by CORS policy
```

**해결**:
```bash
# CORS 설정 재적용
wrangler r2 bucket cors set glec-assets \
  --allow-origin "*" \
  --allow-method GET,HEAD,OPTIONS \
  --allow-header "*"
```

---

## 9. 커스텀 도메인 설정

### 9.1 DNS 설정

1. Cloudflare Dashboard → **Pages** → **glec-website**
2. **Custom domains** → **Set up a domain**
3. 도메인 입력: `glec.io` 및 `www.glec.io`
4. DNS 레코드 자동 생성 확인

### 9.2 SSL 인증서

Cloudflare가 자동으로 Let's Encrypt SSL 인증서 발급 (무료)

---

## 10. 모니터링 및 유지보수

### 10.1 로그 확인

```bash
# Cloudflare Pages 로그
wrangler pages deployment tail glec-website

# Workers 로그
wrangler tail
```

### 10.2 Analytics

1. Cloudflare Dashboard → **Pages** → **glec-website**
2. **Analytics** 탭에서 트래픽 확인

### 10.3 정기 업데이트

```bash
# 주간 작업 (매주 월요일)
- [ ] npm 의존성 업데이트 (`npm update`)
- [ ] 보안 취약점 스캔 (`npm audit fix`)
- [ ] E2E 테스트 실행
- [ ] Lighthouse 점수 확인

# 월간 작업 (매월 1일)
- [ ] Neon DB 사용량 확인 (100 compute hours/월 이내)
- [ ] Cloudflare Pages 사용량 확인 (500 빌드/월 이내)
- [ ] R2 스토리지 확인 (10GB 이내)
- [ ] Resend 이메일 발송량 확인 (3,000/월 이내)
```

---

## 11. 비용 최적화 팁

### 11.1 무료 티어 제한

| 서비스 | 무료 제한 | 현재 사용량 | 초과 시 비용 |
|--------|-----------|-------------|--------------|
| Cloudflare Pages | 500 빌드/월 | ~50 빌드/월 | $5/월 (무제한) |
| Neon PostgreSQL | 100 compute hours/월 | ~80 hours/월 | $19/월 (Starter) |
| Cloudflare R2 | 10GB 저장 | ~2GB | $0.015/GB |
| Cloudflare KV | 100K reads/일 | ~50K/일 | $0.50/million reads |
| Resend | 100 emails/일 | ~30/일 | $10/월 (1,000 emails) |

### 11.2 최적화 전략

1. **빌드 횟수 줄이기**:
   - 개발은 로컬에서 진행
   - PR 병합 시에만 자동 배포
   - Preview 배포는 중요한 경우에만 사용

2. **Database 사용 최적화**:
   - Connection Pooling 활성화
   - Scale to Zero 활용 (5분 후 자동 슬립)
   - 불필요한 쿼리 제거

3. **R2 스토리지 최적화**:
   - 이미지 압축 (WebP, 80% 품질)
   - Lazy loading 활용
   - CDN 캐싱 활용

4. **Workers 최적화**:
   - CPU 시간 10ms 이내 유지
   - 무거운 연산은 클라이언트 사이드로
   - KV 캐싱 적극 활용

---

## 12. 배포 체크리스트

### 배포 전

- [ ] E2E 테스트 통과 (7/7 tests)
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 확인
- [ ] 환경 변수 준비 완료
- [ ] Git 저장소 최신 상태
- [ ] .gitignore 확인 (`.env.local` 포함)
- [ ] README.md 업데이트
- [ ] CHANGELOG.md 작성

### 배포 중

- [ ] Cloudflare Pages 프로젝트 생성
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 설정 (Production)
- [ ] R2 버킷 생성 및 CORS 설정
- [ ] KV Namespace 생성
- [ ] Neon DB 마이그레이션 완료
- [ ] 빌드 성공 확인

### 배포 후

- [ ] 프로덕션 URL 접속 확인
- [ ] 모든 페이지 로딩 확인
- [ ] API 응답 확인
- [ ] Admin 로그인 테스트
- [ ] Contact form 제출 테스트
- [ ] Lighthouse 점수 확인 (90+)
- [ ] E2E 테스트 (프로덕션 URL)
- [ ] Custom domain 설정
- [ ] SSL 인증서 발급 확인

---

## 13. 긴급 롤백 절차

배포 후 문제 발생 시:

1. **Cloudflare Dashboard** → **Pages** → **glec-website**
2. **Deployments** 탭에서 이전 배포 찾기
3. **Rollback** 버튼 클릭
4. 롤백 완료 후 사이트 확인 (1-2분 소요)

또는 CLI로:

```bash
# 이전 배포 조회
wrangler pages deployment list --project-name=glec-website

# 특정 배포로 롤백
wrangler pages deployment promote <deployment-id> --project-name=glec-website
```

---

## 14. 참고 자료

- [Cloudflare Pages 공식 문서](https://developers.cloudflare.com/pages/)
- [Next.js Cloudflare 배포 가이드](https://nextjs.org/docs/deployment#cloudflare-pages)
- [Neon PostgreSQL 문서](https://neon.tech/docs)
- [Resend API 문서](https://resend.com/docs)
- [Wrangler CLI 레퍼런스](https://developers.cloudflare.com/workers/wrangler/)

---

**마지막 업데이트**: 2025-10-04
**작성자**: Claude AI
**버전**: 1.0.0
