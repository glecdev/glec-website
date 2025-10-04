# GLEC Website - 원클릭 배포 가이드

**현재 상태**: ✅ 80% 완료 (Vercel 배포 + 환경 변수 12개 추가 완료)
**남은 작업**: Neon 데이터베이스 연결만 하면 끝! (5분)

---

## 🎯 3단계로 끝내기

### Step 1: Neon 데이터베이스 생성 (3분)

1. **Neon 가입** (GitHub 계정으로 간편 가입)
   ```
   https://console.neon.tech/signup
   ```

2. **프로젝트 생성**
   - Project name: `glec-production`
   - PostgreSQL version: `16`
   - Region: `AWS ap-northeast-1 (Tokyo)` 선택

3. **Connection String 복사**
   - Dashboard에서 "Connection Details" 클릭
   - ⚠️ **"Pooled connection"** 선택 (중요!)
   - Connection string 복사 (예시):
     ```
     postgresql://neondb_owner:AbCd123XyZ@ep-xxx.aws.neon.tech/neondb?sslmode=require
     ```

---

### Step 2: 원클릭 자동 배포 (2분) ⭐

**Windows PowerShell**에서 실행:

```powershell
cd d:\GLEC-Website\glec-website

# Step 1에서 복사한 connection string을 붙여넣으세요
.\scripts\complete-deployment.ps1 -DatabaseUrl "postgresql://neondb_owner:AbCd123XyZ@ep-xxx.aws.neon.tech/neondb?sslmode=require"
```

**자동으로 실행되는 작업**:
1. ✅ DATABASE_URL을 Vercel에 추가
2. ✅ DIRECT_URL을 Vercel에 추가
3. ✅ Prisma Client 생성
4. ✅ 데이터베이스 테이블 생성 (마이그레이션)
5. ✅ Admin 계정 생성
6. ✅ Vercel 프로덕션 배포

**예상 소요 시간**: 2분

---

### Step 3: 배포 검증 (2분)

#### 3.1 웹사이트 접속
```
https://glec-website.vercel.app
```
- [ ] 홈페이지 정상 로딩
- [ ] 네비게이션 작동 확인

#### 3.2 Admin 로그인
```
https://glec-website.vercel.app/admin/login
```

**로그인 정보**:
- Email: `admin@glec.io`
- Password: `GLEC2025Admin!`

- [ ] 로그인 성공
- [ ] Dashboard 표시

#### 3.3 실시간 동기화 테스트 ⭐
1. Admin에서 **Notices** 메뉴 클릭
2. **+ New Notice** 클릭
3. 작성:
   - Title: `Welcome to GLEC`
   - Content: `GLEC Website is now live!`
   - Category: `GENERAL`
   - Status: `PUBLISHED`
4. **Create** 클릭

5. 새 탭에서 열기:
   ```
   https://glec-website.vercel.app/news
   ```

- [ ] ✅ **"Welcome to GLEC" 공지사항이 즉시 표시됨**
- [ ] ✅ **CMS ↔ 웹사이트 실시간 동기화 작동!**

---

## 🎉 배포 완료!

모든 체크리스트가 ✅이면 배포 성공입니다!

**Production URLs**:
- 메인 사이트: https://glec-website.vercel.app
- Admin CMS: https://glec-website.vercel.app/admin/login

**Admin 계정**:
- Email: `admin@glec.io`
- Password: `GLEC2025Admin!`
- ⚠️ 첫 로그인 후 비밀번호 변경 권장

---

## 🚨 문제 해결

### 문제: "Database connection failed"
**해결**: Vercel 환경 변수에서 DATABASE_URL 확인
```powershell
node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env ls production --token=4WjWFbv1BRjxABWdkzCI6jF0
```

### 문제: "Migration failed"
**해결**: 로컬에서 재시도
```powershell
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

## 📊 배포 아키텍처

```
[Users] → Vercel Edge Network (Global CDN)
           ↓
        Next.js 15.5.2 (React 18)
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

## 🔄 선택사항: 추가 기능

### Resend 이메일 활성화 (Contact Form)
1. https://resend.com/signup 가입
2. API Key 생성
3. Vercel에 추가:
   ```powershell
   "re_your_api_key" | node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env add RESEND_API_KEY production --token=4WjWFbv1BRjxABWdkzCI6jF0
   ```
4. 재배포

### Cloudflare R2 파일 저장소
1. https://dash.cloudflare.com/r2 접속
2. Bucket 생성: `glec-assets`
3. API Token 생성
4. Vercel에 추가:
   ```powershell
   "your_account_id" | node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env add R2_ACCOUNT_ID production --token=4WjWFbv1BRjxABWdkzCI6jF0
   ```

---

**버전**: 1.0.0
**최종 업데이트**: 2025-10-04
**예상 총 소요 시간**: 7분 (Neon 3분 + 자동 배포 2분 + 검증 2분)
