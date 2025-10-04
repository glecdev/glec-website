# GitHub 연동 체크리스트

> **작성일**: 2025-10-04
> **프로젝트**: GLEC Website
> **목적**: Cloudflare Pages와 GitHub 연동 완료 확인

---

## 📋 연동 전 준비사항

### 1. GitHub 저장소 상태 확인

- [ ] 저장소 생성 완료: https://github.com/glecdev/website
- [ ] 로컬 커밋 완료: 252 files committed
- [ ] `.gitignore` 설정 확인 (node_modules, .env, .next 제외)
- [ ] Git remote origin 설정: `git remote -v`

```bash
# 확인 명령어
cd d:\GLEC-Website\glec-website
git status
git log -1
git remote -v
```

### 2. Cloudflare 계정 상태 확인

- [x] Cloudflare 계정 인증 완료: contact@glec.io
- [x] Pages 프로젝트 생성 완료: glec-website
- [x] Wrangler CLI 설치 완료: 4.42.0
- [x] API Token 활성화: JPknWNL_t5tNS7ffoeKQZS41nrfSgUcuUpw8hLE3

### 3. 환경 변수 준비

#### 준비 완료된 환경 변수
- [x] RESEND_FROM_EMAIL: noreply@glec.io
- [x] R2_ACCOUNT_ID: c3f6cde2ef3a46eb48b8e215535a4a9e
- [x] R2_BUCKET_NAME: glec-files
- [x] ADMIN_EMAIL: admin@glec.io

#### 생성 필요한 환경 변수
- [ ] DATABASE_URL (Neon PostgreSQL)
- [ ] JWT_SECRET (32자 랜덤 문자열)
- [ ] RESEND_API_KEY (Resend Dashboard)
- [ ] R2_ACCESS_KEY_ID (Cloudflare R2 Dashboard)
- [ ] R2_SECRET_ACCESS_KEY (Cloudflare R2 Dashboard)
- [ ] ADMIN_PASSWORD_HASH (bcrypt hash)

---

## 🔗 Step 1: GitHub 연동 시작

### 1.1 Cloudflare Dashboard 접속

```
URL: https://dash.cloudflare.com/
이메일: contact@glec.io
```

- [ ] Dashboard 접속 완료
- [ ] "Workers & Pages" 메뉴 클릭
- [ ] "glec-website" 프로젝트 확인

### 1.2 GitHub 연동 설정

**방법 1: 기존 프로젝트에 연동**
```
1. glec-website 프로젝트 클릭
2. "Settings" 탭 선택
3. "Builds & deployments" 섹션
4. "Connect to Git" 버튼 클릭
```

**방법 2: 새 프로젝트 생성 (현재 프로젝트 삭제 후)**
```
1. "Create application" 버튼
2. "Pages" 선택
3. "Connect to Git" 선택
```

- [ ] "Connect to Git" 버튼 클릭 완료

### 1.3 GitHub 인증

```
1. Git provider: "GitHub" 선택
2. "Authorize Cloudflare Workers & Pages" 클릭
3. GitHub 계정 로그인 (glecdev)
4. 권한 요청 승인:
   - Read access to code
   - Read access to metadata
   - Read and write access to checks
   - Read and write access to deployments
```

- [ ] GitHub 인증 완료
- [ ] Cloudflare GitHub App 설치 완료

### 1.4 저장소 선택

```
Organization: glecdev
Repository: website
```

- [ ] 저장소 선택 완료
- [ ] "Begin setup" 버튼 클릭

---

## ⚙️ Step 2: 빌드 설정 구성

### 2.1 프로젝트 기본 정보

```yaml
Project name: glec-website
Production branch: main
```

- [ ] 프로젝트명 입력 완료
- [ ] Production branch 선택 완료

### 2.2 빌드 설정

```yaml
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: glec-website
Node.js version: 18
Install command: npm ci
```

**자동 감지 확인**:
Cloudflare는 Next.js 프로젝트를 자동으로 감지하여 위 설정을 제안합니다.

- [ ] Framework preset: Next.js 선택됨
- [ ] Build command 확인: `npm run build`
- [ ] Output directory 확인: `.next`
- [ ] Root directory 설정: `glec-website`
- [ ] Node.js version 설정: `18`

---

## 🔐 Step 3: 환경 변수 설정

### 3.1 필수 환경 변수 추가

**위치**: Settings → Environment variables → Add variable

#### 1. DATABASE_URL (Neon PostgreSQL)

```bash
# Neon Console에서 복사
# https://console.neon.tech/app/projects

Variable name: DATABASE_URL
Value: postgresql://neondb_owner:npg_...@ep-...region.aws.neon.tech/neondb?sslmode=require
Environment: Production
```

- [ ] DATABASE_URL 추가 완료

#### 2. JWT_SECRET

```bash
# 로컬에서 생성
openssl rand -base64 32

# 또는 Node.js에서 생성
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

Variable name: JWT_SECRET
Value: [생성된 32자 문자열]
Environment: Production
```

- [ ] JWT_SECRET 생성 완료
- [ ] JWT_SECRET 추가 완료

#### 3. RESEND_API_KEY

```bash
# Resend Dashboard에서 복사
# https://resend.com/api-keys

Variable name: RESEND_API_KEY
Value: re_...
Environment: Production
```

- [ ] RESEND_API_KEY 추가 완료

#### 4. RESEND_FROM_EMAIL

```bash
Variable name: RESEND_FROM_EMAIL
Value: noreply@glec.io
Environment: All deployments
```

- [ ] RESEND_FROM_EMAIL 추가 완료

#### 5. Cloudflare R2 (파일 스토리지)

```bash
# R2 Dashboard에서 API Token 생성
# https://dash.cloudflare.com/ → R2 → Manage R2 API Tokens

# 5-1. R2_ACCOUNT_ID
Variable name: R2_ACCOUNT_ID
Value: c3f6cde2ef3a46eb48b8e215535a4a9e
Environment: All deployments

# 5-2. R2_ACCESS_KEY_ID
Variable name: R2_ACCESS_KEY_ID
Value: [R2에서 생성한 Access Key ID]
Environment: Production

# 5-3. R2_SECRET_ACCESS_KEY
Variable name: R2_SECRET_ACCESS_KEY
Value: [R2에서 생성한 Secret Access Key]
Environment: Production

# 5-4. R2_BUCKET_NAME
Variable name: R2_BUCKET_NAME
Value: glec-files
Environment: All deployments
```

- [ ] R2 API Token 생성 완료
- [ ] R2_ACCOUNT_ID 추가 완료
- [ ] R2_ACCESS_KEY_ID 추가 완료
- [ ] R2_SECRET_ACCESS_KEY 추가 완료
- [ ] R2_BUCKET_NAME 추가 완료

#### 6. Admin 계정

```bash
# 6-1. ADMIN_EMAIL
Variable name: ADMIN_EMAIL
Value: admin@glec.io
Environment: Production

# 6-2. ADMIN_PASSWORD_HASH
# 로컬에서 비밀번호 해시 생성
npx bcrypt-cli hash "your-secure-password" 10

Variable name: ADMIN_PASSWORD_HASH
Value: $2b$10$...
Environment: Production
```

- [ ] ADMIN_EMAIL 추가 완료
- [ ] ADMIN_PASSWORD_HASH 생성 완료
- [ ] ADMIN_PASSWORD_HASH 추가 완료

### 3.2 환경 변수 검증

```bash
# 추가된 환경 변수 확인
Settings → Environment variables

총 10개 환경 변수:
1. DATABASE_URL (Production)
2. JWT_SECRET (Production)
3. RESEND_API_KEY (Production)
4. RESEND_FROM_EMAIL (All)
5. R2_ACCOUNT_ID (All)
6. R2_ACCESS_KEY_ID (Production)
7. R2_SECRET_ACCESS_KEY (Production)
8. R2_BUCKET_NAME (All)
9. ADMIN_EMAIL (Production)
10. ADMIN_PASSWORD_HASH (Production)
```

- [ ] 모든 환경 변수 추가 완료
- [ ] Production/Preview 범위 확인 완료

---

## 🚀 Step 4: 첫 배포 실행

### 4.1 GitHub Push (자동 배포 트리거)

```bash
cd d:\GLEC-Website\glec-website

# 변경사항 확인
git status

# 커밋 (이미 완료됨)
# git add .
# git commit -m "feat: Initial production deployment setup"

# Push to GitHub
git push origin main
```

**타임아웃 발생 시 대안**:
```bash
# Git LFS 사용 (대용량 파일 처리)
git lfs install
git lfs track "*.jpg" "*.png" "*.webp"
git add .gitattributes
git commit -m "chore: Add Git LFS for large files"
git push origin main

# 또는 압축 레벨 낮추기
git config --global core.compression 0
git push origin main
```

- [ ] Git push 성공
- [ ] GitHub에서 커밋 확인: https://github.com/glecdev/website/commits/main

### 4.2 Cloudflare 자동 배포 확인

```
위치: Cloudflare Dashboard → Pages → glec-website → Deployments

확인 사항:
- 새 배포 항목 생성됨
- Status: "Building" → "Success"
- Build time: 약 5-10분
- Production URL: https://glec-website.pages.dev/
```

- [ ] 새 배포 항목 확인
- [ ] 빌드 로그 확인 (실시간)
- [ ] 빌드 성공 확인

### 4.3 빌드 로그 모니터링

**빌드 로그에서 확인할 사항**:
```
✓ Installing dependencies (npm ci)
✓ Running build command (npm run build)
✓ Compiling Next.js app
✓ Generating static pages (64/64)
✓ Deploying to Cloudflare Workers
✓ Deployment successful
```

**빌드 실패 시 확인**:
- [ ] 에러 메시지 확인
- [ ] 환경 변수 누락 여부
- [ ] 의존성 설치 오류
- [ ] TypeScript 타입 에러

---

## ✅ Step 5: 배포 검증

### 5.1 Production URL 접속

```
URL: https://glec-website.pages.dev/
```

- [ ] Homepage 로딩 확인
- [ ] Hero section 표시 확인
- [ ] Navigation 메뉴 작동 확인
- [ ] Footer 표시 확인
- [ ] 콘솔 에러 없음 확인 (F12 → Console)

### 5.2 주요 페이지 테스트

```bash
# 수동 브라우저 테스트
https://glec-website.pages.dev/                # Homepage
https://glec-website.pages.dev/products        # Products
https://glec-website.pages.dev/about           # About
https://glec-website.pages.dev/contact         # Contact
https://glec-website.pages.dev/admin/login     # Admin Login
```

- [ ] 모든 주요 페이지 로딩 확인
- [ ] 404 페이지 없음
- [ ] 이미지 로딩 확인
- [ ] API 응답 확인

### 5.3 Playwright E2E 테스트

```bash
cd d:\GLEC-Website\glec-website

# Production URL로 E2E 테스트 실행
BASE_URL=https://glec-website.pages.dev npx playwright test tests/e2e/homepage.spec.ts --project=chromium --reporter=list --timeout=60000
```

**기대 결과**:
```
✅ Homepage › should display hero section with CTA buttons
✅ Homepage › should have responsive navigation
✅ Homepage › should display features section
✅ Homepage › should have footer with links
✅ Homepage › should be accessible (WCAG 2.1 AA)
✅ Homepage › should load within 3 seconds

6 passed (6/6)
```

- [ ] 6개 테스트 모두 통과
- [ ] 스크린샷 확인 (test-results/)
- [ ] 접근성 테스트 통과

### 5.4 Lighthouse 성능 분석

```bash
# Lighthouse CI 실행
npx lighthouse https://glec-website.pages.dev/ --view

# 또는 Chrome DevTools
# F12 → Lighthouse 탭 → Analyze page load
```

**목표 스코어**:
- Performance: 90+ (Desktop), 80+ (Mobile)
- Accessibility: 100
- Best Practices: 100
- SEO: 100

- [ ] Lighthouse 분석 완료
- [ ] Performance 스코어 확인
- [ ] Accessibility 100점 확인

---

## 🔄 Step 6: 지속적 배포 (CI/CD) 설정

### 6.1 Branch Deployment Controls

```
위치: Settings → Builds & deployments → Branch deployment controls

Production branch: main
Preview branches: All branches
```

- [ ] Production branch 설정: main
- [ ] Preview deployments 활성화
- [ ] Branch deployment controls 확인

### 6.2 배포 알림 설정

```
위치: Settings → Notifications

이메일 알림:
- Deployment success
- Deployment failure
- Build errors
```

- [ ] 배포 알림 활성화
- [ ] 이메일 주소 확인: contact@glec.io

### 6.3 Custom Domain 설정 (선택)

```
위치: Custom domains → Set up a custom domain

도메인: glec.io, www.glec.io
```

- [ ] DNS 레코드 추가 (Cloudflare DNS)
- [ ] SSL/TLS 인증서 자동 발급 확인
- [ ] Custom domain 활성화

---

## 📊 최종 검증 체크리스트

### GitHub 연동 상태
- [ ] GitHub repository 연결됨
- [ ] Cloudflare GitHub App 설치됨
- [ ] Webhook 활성화됨
- [ ] Push 이벤트 트리거 작동

### 빌드 설정 상태
- [ ] Next.js framework 감지됨
- [ ] Build command 정상 작동
- [ ] Output directory 올바름
- [ ] Node.js 18 버전 사용

### 환경 변수 상태
- [ ] 10개 환경 변수 모두 설정됨
- [ ] Production/Preview 범위 올바름
- [ ] 민감 정보 암호화됨

### 배포 상태
- [ ] 첫 배포 성공
- [ ] Production URL 활성화
- [ ] Preview URL 생성됨 (PR 시)
- [ ] 빌드 로그 접근 가능

### 검증 상태
- [ ] Homepage 정상 작동
- [ ] Playwright 테스트 통과
- [ ] Lighthouse 스코어 목표 달성
- [ ] 콘솔 에러 없음

---

## 🎯 다음 단계

### 단기 (배포 완료 직후)
1. [ ] 모든 E2E 테스트 실행 및 통과 확인
2. [ ] 모든 페이지 수동 검증
3. [ ] 성능 최적화 (이미지, CSS, JS)

### 중기 (1주일 이내)
1. [ ] Custom domain 연결 (glec.io)
2. [ ] Neon Database 프로덕션 데이터 마이그레이션
3. [ ] Resend 도메인 인증 (glec.io)
4. [ ] Admin 계정 실제 비밀번호로 변경

### 장기 (1개월 이내)
1. [ ] 모니터링 대시보드 구축
2. [ ] CI/CD 파이프라인 강화 (GitHub Actions)
3. [ ] Staging 환경 구축
4. [ ] Performance monitoring (Web Vitals)

---

## 📞 트러블슈팅

### 문제 1: GitHub Push 타임아웃
```bash
# 해결 방법 1: Git LFS 사용
git lfs install
git lfs track "*.jpg" "*.png"
git add .gitattributes
git commit -m "chore: Add Git LFS"
git push origin main

# 해결 방법 2: 압축 레벨 낮추기
git config --global core.compression 0
git push origin main

# 해결 방법 3: 웹 대시보드에서 수동 배포
Cloudflare Dashboard → Pages → glec-website → Deployments → "Retry deployment"
```

### 문제 2: 빌드 실패 (환경 변수 누락)
```bash
# 에러 메시지 예시
Error: DATABASE_URL is not defined

# 해결 방법
1. Settings → Environment variables
2. 누락된 환경 변수 추가
3. "Retry deployment" 클릭
```

### 문제 3: Next.js 빌드 에러
```bash
# 에러 메시지 예시
Error: Page "/news" couldn't be rendered statically

# 해결 방법
1. 로컬에서 빌드 테스트
   npm run build
2. 에러 수정 후 commit & push
3. 자동 재배포 대기
```

### 문제 4: Playwright 테스트 실패
```bash
# 에러 메시지 예시
Error: expect(locator).toBeVisible() failed

# 해결 방법
1. 스크린샷 확인 (test-results/)
2. 에러 컨텍스트 분석 (error-context.md)
3. 로컬 테스트 실행 및 디버깅
   BASE_URL=http://localhost:3006 npx playwright test --headed
4. 수정 후 재배포
```

---

**최종 업데이트**: 2025-10-04
**작성자**: Claude (AI Agent)
**버전**: 1.0.0
