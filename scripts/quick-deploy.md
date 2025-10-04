# GLEC Website - Playwright 자동 배포 가이드

> **작성일**: 2025-10-04
> **소요 시간**: 15분 (자동 실행 시)
> **난이도**: ⭐⭐ 중간

---

## 🎯 목표

Playwright를 사용하여 GitHub 저장소 생성부터 Cloudflare Pages 배포까지 자동화

---

## 📋 사전 준비

### 1. 환경 변수 파일 작성

`.env.deployment` 파일을 열고 다음 정보를 입력하세요:

```bash
# GitHub Credentials
GITHUB_USERNAME=glecdev
GITHUB_PASSWORD=[GitHub 비밀번호 또는 Personal Access Token]

# Cloudflare Credentials
CLOUDFLARE_EMAIL=contact@glec.io
CLOUDFLARE_PASSWORD=[Cloudflare 비밀번호]

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-...region.aws.neon.tech/neondb?sslmode=require

# JWT Secret (Generate with: openssl rand -base64 32)
JWT_SECRET=[생성된 32자 문자열]

# Email (Resend)
RESEND_API_KEY=re_...

# Cloudflare R2
R2_ACCESS_KEY_ID=[R2 Access Key ID]
R2_SECRET_ACCESS_KEY=[R2 Secret Access Key]

# Admin
ADMIN_PASSWORD_HASH=[bcrypt hash]
```

### 2. 필수 값 생성

#### JWT_SECRET 생성
```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Git Bash
openssl rand -base64 32
```

#### ADMIN_PASSWORD_HASH 생성
```bash
npx bcrypt-cli hash "your-secure-password" 10
```

---

## 🚀 실행 방법

### Option 1: 헤드리스 모드 (자동 실행)

```bash
cd d:\GLEC-Website\glec-website

# 환경 변수 로드 및 Playwright 실행
npx playwright test tests/deployment/auto-deploy.spec.ts --project=chromium --reporter=list
```

### Option 2: 헤드 모드 (브라우저 UI 표시)

```bash
cd d:\GLEC-Website\glec-website

# 브라우저를 보면서 실행
npx playwright test tests/deployment/auto-deploy.spec.ts --project=chromium --reporter=list --headed
```

### Option 3: 디버그 모드 (단계별 실행)

```bash
cd d:\GLEC-Website\glec-website

# Playwright Inspector로 디버깅
npx playwright test tests/deployment/auto-deploy.spec.ts --project=chromium --debug
```

---

## 📊 실행 과정

스크립트가 자동으로 다음 단계를 수행합니다:

```
✅ Step 1: GitHub 로그인
✅ Step 2: GitHub 저장소 생성 (glecdev/website)
✅ Step 3: Cloudflare Dashboard 로그인
✅ Step 4: Pages 프로젝트 이동
✅ Step 5: GitHub 연동
✅ Step 6: 저장소 선택
✅ Step 7: 빌드 설정 구성
✅ Step 8: 환경 변수 추가 (10개)
✅ Step 9: 배포 트리거
✅ Step 10: 빌드 로그 모니터링 (5-10분)
✅ Step 11: 배포 검증
```

**총 소요 시간**: 약 15-20분

---

## ⚠️ 수동 개입 필요 시점

### 1. GitHub 2FA 인증
스크립트가 다음 메시지를 표시하면:
```
⚠️  2FA 인증 필요 - 수동으로 코드를 입력해주세요 (60초 대기)
```

→ **브라우저에서 2FA 코드를 입력**하세요 (GitHub Authenticator 앱)

### 2. Cloudflare 비밀번호 입력
스크립트가 다음 메시지를 표시하면:
```
⚠️  Cloudflare 비밀번호를 수동으로 입력해주세요 (60초 대기)
```

→ **브라우저에서 Cloudflare 비밀번호를 입력**하세요

---

## 📁 생성되는 파일

### deployment-result.json
배포 완료 후 다음 정보를 포함합니다:

```json
{
  "success": true,
  "productionURL": "https://glec-website.pages.dev",
  "timestamp": "2025-10-04T12:00:00.000Z",
  "message": "Deployment completed successfully"
}
```

---

## 🔧 트러블슈팅

### 문제 1: GitHub 로그인 실패
```
Error: Timeout waiting for login
```

**해결**:
1. GitHub 비밀번호가 정확한지 확인
2. Personal Access Token을 사용하는 경우 `repo` 권한이 있는지 확인
3. 2FA가 활성화되어 있다면 수동으로 코드 입력

### 문제 2: Cloudflare 로그인 실패
```
Error: Cannot find password input
```

**해결**:
1. Cloudflare 이메일 주소 확인 (contact@glec.io)
2. 비밀번호 정확성 확인
3. 수동으로 비밀번호 입력 (60초 대기 시간 활용)

### 문제 3: 빌드 실패
```
Error: Build failed
```

**해결**:
1. 환경 변수가 모두 올바르게 설정되었는지 확인
2. Cloudflare Dashboard → Pages → glec-website → Deployments에서 빌드 로그 확인
3. 에러 메시지 분석 후 환경 변수 수정

### 문제 4: 환경 변수 누락
```
⚠️  DATABASE_URL: 값이 없습니다. 건너뜁니다.
```

**해결**:
1. `.env.deployment` 파일에 해당 환경 변수 추가
2. 스크립트 재실행

---

## 🎉 배포 성공 확인

스크립트가 다음 메시지를 표시하면 성공:

```
✅ 빌드 성공!
🌐 Production URL: https://glec-website.pages.dev
✅ 배포 완료! 결과가 deployment-result.json에 저장되었습니다.
✅ Homepage 로딩 성공
✅ Hero section 표시됨
✅ Navigation 표시됨
✅ Footer 표시됨
✅ 콘솔 에러 없음
✅ 배포 검증 완료!
```

---

## 🔄 수동 Git Push (Playwright 사용 전)

Playwright 스크립트를 실행하기 전에 로컬 코드를 GitHub에 push해야 합니다:

```bash
cd d:\GLEC-Website\glec-website

# GitHub 저장소 생성 후 (Playwright Step 2 완료 후)
git remote add origin https://github.com/glecdev/website.git
git push -u origin main
```

---

## 📖 참고 문서

- [Playwright 자동 배포 스크립트](../tests/deployment/auto-deploy.spec.ts)
- [GITHUB-SETUP-GUIDE.md](../../GITHUB-SETUP-GUIDE.md)
- [DEPLOYMENT-GUIDE.md](../docs/DEPLOYMENT-GUIDE.md)

---

**작성일**: 2025-10-04
**버전**: 1.0.0
