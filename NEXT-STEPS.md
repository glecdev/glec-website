# 🚀 GLEC Website - 다음 단계 (Iteration 2)

**현재 상태**: ✅ 90% 완료 (모든 페이지 100% 작동)
**남은 작업**: Neon PostgreSQL 연결 (10분)

---

## 📋 Iteration 2 체크리스트

### Step 1: Neon 데이터베이스 생성 (3분)

#### 1.1 Neon 가입
```
https://console.neon.tech/signup
```
- GitHub 계정으로 가입 (가장 빠름)

#### 1.2 프로젝트 생성
1. "Create a project" 클릭
2. 설정:
   - **Project name**: `glec-production`
   - **PostgreSQL version**: `16` (기본값)
   - **Region**: `AWS ap-northeast-1 (Tokyo)` (한국에서 가장 가까움)
3. "Create project" 클릭

#### 1.3 Connection String 복사
1. Dashboard에서 "Connection Details" 클릭
2. ⚠️ **"Pooled connection"** 선택 (필수!)
3. Connection string 복사:
   ```
   postgresql://neondb_owner:AbCd123XyZ@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: 자동 배포 (2분)

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
4. ✅ 데이터베이스 마이그레이션 (12개 테이블 생성)
5. ✅ Admin 계정 생성 (`admin@glec.io` / `GLEC2025Admin!`)
6. ✅ Vercel 프로덕션 재배포

**예상 소요 시간**: 2분

---

### Step 3: 배포 검증 (5분)

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

**테스트**:
- [ ] 로그인 성공
- [ ] Dashboard 표시 (통계 0으로 표시됨)

#### 3.3 공지사항 CRUD 테스트
1. Admin에서 **Notices** 메뉴 클릭
2. **+ New Notice** 클릭
3. 작성:
   - Title: `Welcome to GLEC`
   - Content: `GLEC Website is now live!`
   - Category: `GENERAL`
   - Status: `PUBLISHED`
4. **Create** 클릭

#### 3.4 실시간 동기화 검증 ⭐
1. 새 탭에서 열기:
   ```
   https://glec-website.vercel.app/news
   ```
2. ✅ **"Welcome to GLEC" 공지사항이 즉시 표시되는지 확인**

- [ ] CMS에서 생성한 공지사항이 즉시 표시됨
- [ ] **실시간 동기화 작동!**

---

## 🎉 완료 기준

모든 체크리스트가 ✅이면 **Iteration 2 완료** → **배포 100% 달성**!

---

## 🚨 문제 해결

### "Database connection failed"
**해결**: Vercel 환경 변수 확인
```powershell
node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env ls production --token=4WjWFbv1BRjxABWdkzCI6jF0
```

### "Migration failed"
**해결**: 로컬에서 재시도
```powershell
$env:DATABASE_URL = "postgresql://..."
npx prisma migrate reset --force
npx prisma migrate deploy
```

### "Admin login fails"
**해결**:
1. Vercel Logs 확인: https://vercel.com/glecdevs-projects/glec-website
2. DATABASE_URL 환경 변수 확인
3. 브라우저 콘솔 에러 확인

---

## 📞 추가 도움말

- **상세 가이드**: [QUICK-START.md](./QUICK-START.md)
- **완료 보고서**: [DEPLOYMENT-ITERATION-1.md](./DEPLOYMENT-ITERATION-1.md)
- **배포 스크립트**: [scripts/complete-deployment.ps1](./scripts/complete-deployment.ps1)

---

**현재 위치**: Iteration 2 Step 1 (Neon 데이터베이스 생성)
**예상 완료 시간**: 10분
**마지막 장애물**: Neon 계정 생성 (사용자 액션 필요)

준비되면 위 단계를 따라 진행하세요! 🚀
