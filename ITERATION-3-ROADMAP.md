# 🚀 GLEC Website - Iteration 3 로드맵

**목표**: Neon PostgreSQL 데이터베이스 연결 및 100% 배포 완료
**예상 소요 시간**: 10분
**현재 진행률**: 95%
**목표 진행률**: 100%

---

## 📋 Iteration 3 체크리스트

### ✅ 완료된 작업 (95%)
- [✅] Vercel 프로덕션 배포
- [✅] 모든 13개 페이지 100% 작동
- [✅] /news Suspense 에러 해결
- [✅] Playwright E2E 테스트 17/17 통과
- [✅] 성능 최적화 (LCP 평균 0.22s)
- [✅] 접근성 검증 (12/13 페이지 WCAG AA 통과)
- [✅] 환경 변수 12/14 추가
- [✅] 자동화 스크립트 작성 (6개)
- [✅] 배포 문서 작성 (8개)

### ⏳ 남은 작업 (5%)
- [ ] **Neon PostgreSQL 데이터베이스 생성** (사용자 액션 필요)
- [ ] **데이터베이스 환경 변수 추가** (자동)
- [ ] **Prisma 마이그레이션 실행** (자동)
- [ ] **Admin 계정 생성** (자동)
- [ ] **Admin 기능 검증** (수동)

---

## 🎯 Iteration 3 단계별 가이드

### Step 1: Neon 데이터베이스 생성 (3분) - 사용자 액션

#### 1.1 Neon 계정 가입
```
https://console.neon.tech/signup
```
- GitHub 계정으로 가입 (가장 빠름)
- 또는 이메일로 가입

#### 1.2 프로젝트 생성
1. Dashboard에서 **"Create a project"** 클릭
2. 설정:
   - **Project name**: `glec-production`
   - **PostgreSQL version**: `16` (기본값)
   - **Region**: `AWS ap-northeast-1 (Tokyo)` ⭐ 한국에서 가장 가까움
3. **"Create project"** 클릭

#### 1.3 Connection String 복사
1. Dashboard에서 **"Connection Details"** 클릭
2. ⚠️ **"Pooled connection"** 선택 (필수!)
   - Vercel Serverless Functions는 Pooled connection 필요
3. Connection string 복사:
   ```
   postgresql://neondb_owner:AbCd123XyZ@ep-xxx-xxx-xxx.aws-ap-northeast-1.aws.neon.tech/neondb?sslmode=require
   ```

**예상 소요 시간**: 3분

---

### Step 2: 자동 배포 스크립트 실행 (2분) - 자동화

#### 2.1 PowerShell에서 스크립트 실행
```powershell
cd d:\GLEC-Website\glec-website

# Step 1에서 복사한 connection string을 붙여넣으세요
.\scripts\complete-deployment.ps1 -DatabaseUrl "postgresql://neondb_owner:AbCd123XyZ@ep-xxx.aws.neon.tech/neondb?sslmode=require"
```

#### 2.2 자동으로 실행되는 작업
1. ✅ **DATABASE_URL 추가**: Vercel 환경 변수에 추가
2. ✅ **DIRECT_URL 추가**: Prisma Migrate용 환경 변수 추가
3. ✅ **Prisma Client 생성**: `npx prisma generate`
4. ✅ **데이터베이스 마이그레이션**: 12개 테이블 생성
   - users, notices, popup_banners, press_releases
   - contacts, analytics_events, analytics_page_views
   - knowledge_library, knowledge_videos, knowledge_blog
   - carbon_calculators, admin_sessions
5. ✅ **Admin 계정 생성**: `admin@glec.io` / `GLEC2025Admin!`
6. ✅ **Vercel 프로덕션 재배포**: 환경 변수 반영

**예상 소요 시간**: 2분

---

### Step 3: 배포 검증 (5분) - 수동 테스트

#### 3.1 웹사이트 접속
```
https://glec-website.vercel.app
```
- [ ] 홈페이지 정상 로딩
- [ ] 모든 페이지 정상 작동 (이미 100% 확인됨)

#### 3.2 Admin 로그인
```
https://glec-website.vercel.app/admin/login
```

**로그인 정보**:
- Email: `admin@glec.io`
- Password: `GLEC2025Admin!`

**체크리스트**:
- [ ] 로그인 성공
- [ ] Dashboard 표시 (통계 0으로 표시됨)
- [ ] 메뉴 표시 (Dashboard, Notices, Popups, Press, Knowledge, Analytics)

#### 3.3 공지사항 CRUD 테스트 ⭐
1. **CREATE (생성)**
   - Admin에서 **Notices** 메뉴 클릭
   - **+ New Notice** 클릭
   - 작성:
     - Title: `Welcome to GLEC`
     - Content: `GLEC Website is now live with full database integration!`
     - Category: `GENERAL`
     - Status: `PUBLISHED`
   - **Create** 클릭
   - [ ] 공지사항 생성 성공

2. **READ (조회)**
   - 새 탭에서 열기: `https://glec-website.vercel.app/news`
   - [ ] **"Welcome to GLEC" 공지사항이 즉시 표시됨**
   - [ ] **실시간 동기화 작동!** (CMS → Website)

3. **UPDATE (수정)**
   - Admin으로 돌아가서 "Welcome to GLEC" 클릭
   - Title 수정: `Welcome to GLEC - Updated!`
   - **Update** 클릭
   - [ ] 수정 성공
   - Website에서 새로고침 → 제목 변경 확인

4. **DELETE (삭제)**
   - Admin에서 "Welcome to GLEC - Updated!" 선택
   - **Delete** 버튼 클릭
   - [ ] 삭제 성공
   - Website에서 새로고침 → 공지사항 사라짐 확인

**예상 소요 시간**: 5분

---

## 🎯 완료 기준

모든 체크리스트가 ✅이면 **Iteration 3 완료** → **배포 100% 달성!**

- [ ] Neon 데이터베이스 생성 완료
- [ ] `complete-deployment.ps1` 실행 완료
- [ ] Admin 로그인 성공
- [ ] 공지사항 CRUD 모두 작동
- [ ] 실시간 동기화 작동 확인

---

## 🚨 문제 해결

### "Database connection failed"
**원인**: 환경 변수가 Vercel에 제대로 추가되지 않음

**해결**:
1. Vercel Dashboard에서 환경 변수 확인:
   ```
   https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables
   ```
2. `DATABASE_URL`과 `DIRECT_URL`이 있는지 확인
3. 없으면 수동으로 추가:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...` (Pooled connection)
   - Environment: Production

### "Migration failed"
**원인**: 데이터베이스에 이미 테이블이 존재하거나 권한 문제

**해결**:
1. Neon Dashboard에서 SQL Editor 열기
2. 모든 테이블 삭제:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
3. 로컬에서 마이그레이션 재실행:
   ```powershell
   $env:DATABASE_URL = "postgresql://..."
   npx prisma migrate reset --force
   npx prisma migrate deploy
   ```

### "Admin login fails"
**원인**:
1. 데이터베이스 연결 실패
2. Admin 계정이 생성되지 않음

**해결**:
1. Vercel Logs 확인:
   ```
   https://vercel.com/glecdevs-projects/glec-website
   ```
2. DATABASE_URL 환경 변수 확인
3. Neon Dashboard에서 SQL Editor로 확인:
   ```sql
   SELECT * FROM users WHERE email = 'admin@glec.io';
   ```
4. 계정이 없으면 수동 생성:
   ```powershell
   $env:DATABASE_URL = "postgresql://..."
   npm run prisma db seed
   ```

---

## 📊 예상 결과

### 데이터베이스 구조 (12개 테이블)
```
┌─────────────────────────┐
│ users                   │ (1 row - admin)
├─────────────────────────┤
│ notices                 │ (0 rows - 테스트 후 생성)
│ popup_banners           │ (0 rows)
│ press_releases          │ (0 rows)
│ contacts                │ (0 rows)
│ analytics_events        │ (0 rows)
│ analytics_page_views    │ (0 rows)
│ knowledge_library       │ (0 rows)
│ knowledge_videos        │ (0 rows)
│ knowledge_blog          │ (0 rows)
│ carbon_calculators      │ (0 rows)
│ admin_sessions          │ (0 rows)
└─────────────────────────┘
```

### Vercel 환경 변수 (14/14)
```
✅ DATABASE_URL          (Neon Pooled connection)
✅ DIRECT_URL            (Neon Direct connection)
✅ JWT_SECRET            (32자 랜덤 문자열)
✅ RESEND_API_KEY        (이메일 발송)
✅ RESEND_FROM_EMAIL     (noreply@glec.io)
✅ CLOUDFLARE_ACCOUNT_ID (R2 storage)
✅ CLOUDFLARE_ACCESS_KEY (R2 access)
✅ CLOUDFLARE_SECRET_KEY (R2 secret)
✅ R2_BUCKET_NAME        (glec-assets)
✅ R2_PUBLIC_URL         (CDN URL)
✅ ADMIN_EMAIL           (admin@glec.io)
✅ ADMIN_PASSWORD        (GLEC2025Admin!)
✅ NEXT_PUBLIC_API_URL   (https://glec-website.vercel.app)
✅ NODE_ENV              (production)
```

---

## 🎉 Iteration 3 성공 시

### 정량적 성과
- ✅ 배포 진행률: 95% → **100%** (+5%)
- ✅ 데이터베이스: **12개 테이블 생성**
- ✅ Admin 계정: **1개 생성**
- ✅ 환경 변수: **14/14 완료** (100%)
- ✅ CRUD 작동: **100%**
- ✅ 실시간 동기화: **작동**

### 정성적 성과
- ✅ **프로덕션 배포 100% 완료**
- ✅ **완전 자동화된 배포 프로세스**
- ✅ **CMS → Website 실시간 동기화**
- ✅ **Zero-cost 아키텍처 달성** ($0/month)

---

## 📞 추가 도움말

- **상세 가이드**: [NEXT-STEPS.md](./NEXT-STEPS.md)
- **완료 보고서**: [DEPLOYMENT-ITERATION-2.md](./DEPLOYMENT-ITERATION-2.md)
- **배포 스크립트**: [scripts/complete-deployment.ps1](./scripts/complete-deployment.ps1)
- **API 명세**: [GLEC-API-Specification.yaml](./GLEC-API-Specification.yaml)
- **환경 설정**: [GLEC-Environment-Setup-Guide.md](./GLEC-Environment-Setup-Guide.md)

---

**현재 위치**: Iteration 3 준비 완료
**다음 작업**: Neon 데이터베이스 생성 (사용자 액션)
**예상 완료 시간**: 10분
**마지막 장애물**: Neon 계정 생성 (수동)

준비되면 위 단계를 따라 진행하세요! 🚀

---

**작성일**: 2025-10-04
**버전**: 1.0.0
**기반**: CLAUDE.md Iteration 3 계획
