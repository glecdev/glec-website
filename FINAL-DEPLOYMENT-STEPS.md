# GLEC Website - 최종 배포 단계

**현재 상태**: ✅ 80% 완료
**남은 작업**: Neon 데이터베이스 연결 및 테스트

---

## ✅ 완료된 작업

1. ✅ Vercel 프로젝트 생성 및 배포
2. ✅ GitHub 저장소 연결
3. ✅ 12개 환경 변수 추가 완료:
   - JWT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - ADMIN_EMAIL
   - ADMIN_PASSWORD_HASH
   - RESEND_API_KEY (skip)
   - RESEND_FROM_EMAIL
   - R2_ACCOUNT_ID (skip)
   - R2_ACCESS_KEY_ID (skip)
   - R2_SECRET_ACCESS_KEY (skip)
   - R2_BUCKET_NAME
   - R2_PUBLIC_URL

4. ✅ 배포 자동화 스크립트 작성
5. ✅ 배포 가이드 문서 작성

---

## 🚀 남은 3단계 (5분)

### Step 1: Neon PostgreSQL 생성 (3분)

#### 1.1 Neon 가입
```
https://console.neon.tech/signup
```
- GitHub로 가입 (권장)

#### 1.2 프로젝트 생성
- Project name: `glec-production`
- PostgreSQL version: `16`
- Region: `AWS ap-northeast-1 (Tokyo)`

#### 1.3 Connection String 복사
- Dashboard → "Connection Details"
- **"Pooled connection"** 선택 ⚠️ 중요!
- Connection string 복사:
  ```
  postgresql://neondb_owner:AbCd123XyZ@ep-xxx.aws.neon.tech/neondb?sslmode=require
  ```

### Step 2: DATABASE_URL 추가 (1분)

#### Windows PowerShell
```powershell
cd d:\GLEC-Website\glec-website

# DATABASE_URL 추가
$dbUrl = "postgresql://neondb_owner:AbCd123XyZ@ep-xxx.aws.neon.tech/neondb?sslmode=require"
$dbUrl | node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env add DATABASE_URL production --token=4WjWFbv1BRjxABWdkzCI6jF0

# DIRECT_URL 추가 (같은 값)
$dbUrl | node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env add DIRECT_URL production --token=4WjWFbv1BRjxABWdkzCI6jF0
```

### Step 3: 마이그레이션 및 배포 (1분)

```powershell
# 환경 변수 설정
$env:DATABASE_URL = "postgresql://..."

# Prisma Client 생성
npx prisma generate

# 마이그레이션 생성 (첫 실행 시)
npx prisma migrate dev --name init

# Production 마이그레이션
npx prisma migrate deploy

# Vercel 재배포
node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" --prod --token=4WjWFbv1BRjxABWdkzCI6jF0
```

---

## ✅ 배포 검증 (5분)

### 1. Homepage
```
https://glec-website.vercel.app
```
- [ ] 페이지 로딩 확인
- [ ] 이미지 표시 확인
- [ ] 네비게이션 작동 확인

### 2. Admin 로그인
```
https://glec-website.vercel.app/admin/login
```
**로그인 정보**:
- Email: `admin@glec.io`
- Password: `GLEC2025Admin!`

- [ ] 로그인 성공
- [ ] Dashboard로 리다이렉트

### 3. Admin Dashboard
```
https://glec-website.vercel.app/admin/dashboard
```
- [ ] 통계 표시 (0은 정상)
- [ ] 메뉴 표시 확인

### 4. 공지사항 CRUD 테스트
```
https://glec-website.vercel.app/admin/notices
```

**테스트 시나리오**:
1. [ ] "+ New Notice" 클릭
2. [ ] 작성:
   - Title: "Welcome to GLEC"
   - Content: "GLEC Website is now live with real-time CMS!"
   - Category: GENERAL
   - Status: PUBLISHED
3. [ ] "Create" 클릭
4. [ ] 목록에 표시 확인

### 5. 실시간 동기화 검증 ⭐
```
https://glec-website.vercel.app/news
```
- [ ] "Welcome to GLEC" 공지사항이 **즉시** 표시됨
- [ ] 공지사항 클릭
- [ ] 상세 페이지 정상 표시
- [ ] ✅ **CMS ↔ 웹사이트 실시간 동기화 작동!**

### 6. 전체 페이지 테스트
- [ ] About Company: `/about/company`
- [ ] Products DTG: `/products/dtg`
- [ ] Products API: `/products/api`
- [ ] Products Cloud: `/products/cloud`
- [ ] Knowledge Library: `/knowledge/library`
- [ ] Knowledge Videos: `/knowledge/videos`
- [ ] Knowledge Blog: `/knowledge/blog`
- [ ] Contact: `/contact`
- [ ] Press: `/press`

---

## 🎉 배포 완료!

모든 체크리스트가 ✅이면 배포 성공입니다!

**Production URLs**:
- **메인 사이트**: https://glec-website.vercel.app
- **Admin CMS**: https://glec-website.vercel.app/admin/login

**Admin 계정**:
- Email: admin@glec.io
- Password: GLEC2025Admin!
- ⚠️ **첫 로그인 후 비밀번호 변경 권장**

---

## 📊 배포 아키텍처

```
[Users] → Vercel Edge Network (Global CDN)
           ↓
        Next.js 15.5.2
           ↓
    ┌──────────────────┐
    │  Public Website  │
    │  Admin CMS       │
    └──────────────────┘
           ↓
    Neon PostgreSQL
    (Real-time sync)
```

---

## 🔄 선택사항: Resend 이메일 활성화

Contact Form 기능을 활성화하려면:

1. https://resend.com/signup 가입
2. API Key 생성
3. Vercel에 추가:
   ```powershell
   "re_your_api_key" | node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env add RESEND_API_KEY production --token=4WjWFbv1BRjxABWdkzCI6jF0
   ```
4. 재배포

---

## 🔄 선택사항: Cloudflare R2 파일 저장소

파일 업로드 기능을 활성화하려면:

1. https://dash.cloudflare.com/r2 접속
2. Bucket 생성: `glec-assets`
3. API Token 생성
4. Vercel에 추가:
   ```powershell
   "your_r2_account_id" | node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env add R2_ACCOUNT_ID production --token=4WjWFbv1BRjxABWdkzCI6jF0
   # R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL도 동일하게 추가
   ```
5. 재배포

---

## 🚨 트러블슈팅

### 문제: "Database connection failed"
**해결**: Vercel 환경 변수에서 DATABASE_URL 확인

### 문제: "Migration failed"
**해결**:
```powershell
# 로컬에서 재시도
$env:DATABASE_URL = "postgresql://..."
npx prisma migrate reset
npx prisma migrate deploy
```

### 문제: "Admin login fails"
**해결**:
1. Vercel Logs 확인: https://vercel.com/glecdevs-projects/glec-website
2. JWT_SECRET 환경 변수 확인
3. 브라우저 콘솔 에러 확인

---

## 📞 지원

- **Vercel Dashboard**: https://vercel.com/glecdevs-projects/glec-website
- **Neon Dashboard**: https://console.neon.tech
- **GitHub**: https://github.com/glecdev/glec-website

---

**최종 업데이트**: 2025-10-04
**버전**: 1.0.0
**진행률**: 80% → 100% (Neon 연결 후)
