# 🚀 Vercel 환경 변수 빠른 설정 가이드

**상태**: ✅ 웹사이트 배포 완료, ⚠️ 환경 변수 설정 필요
**URL**: https://glec-website.vercel.app
**테스트 결과**: 로그인 실패 - "Invalid email or password" (환경 변수 미설정)

---

## 📋 5분 안에 환경 변수 설정하기

### Step 1: Vercel Dashboard 접속 (30초)

1. 브라우저에서 https://vercel.com/dashboard 접속
2. `glec-website` 프로젝트 클릭
3. 상단 탭에서 **"Settings"** 클릭
4. 왼쪽 메뉴에서 **"Environment Variables"** 클릭

---

### Step 2: 필수 환경 변수 추가 (4분)

아래 표의 **모든 환경 변수**를 추가하세요:

| # | Name | Value | Environments |
|---|------|-------|--------------|
| 1 | `DATABASE_URL` | `postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` | ✅ Production<br>✅ Preview<br>✅ Development |
| 2 | `DIRECT_URL` | `postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require` | ✅ Production<br>✅ Preview<br>✅ Development |
| 3 | `JWT_SECRET` | `qzs1M2W/J+FALLBWRWITPkNstWi9W1rr5nvlo2Uax2w=` | ✅ Production<br>✅ Preview<br>❌ Development |
| 4 | `NEXTAUTH_SECRET` | `t6SzA1D1Sn8r3ACMKR7jgFX73JjxsfdQXpeTNVPBWPE=` | ✅ Production<br>✅ Preview<br>❌ Development |
| 5 | `NEXTAUTH_URL` | `https://glec-website.vercel.app` | ✅ Production<br>❌ Preview<br>❌ Development |

**각 변수 추가 방법**:
1. "Add New" 버튼 클릭
2. **Name**에 위 표의 이름 입력 (예: `DATABASE_URL`)
3. **Value**에 위 표의 값 복사/붙여넣기
4. **Environments**에서 해당하는 체크박스 선택
5. "Save" 클릭
6. 다음 변수 반복

---

### Step 3: 재배포 트리거 (30초)

환경 변수 추가 완료 후:

1. 상단 탭에서 **"Deployments"** 클릭
2. 가장 최신 배포 찾기 (맨 위)
3. 우측 "**...**" 메뉴 클릭
4. **"Redeploy"** 선택
5. **"Redeploy"** 버튼 다시 클릭 (확인)
6. 5분 대기 ⏳

---

### Step 4: 배포 완료 확인 (1분)

1. "Deployments" 탭에서 최신 배포 상태 확인
2. **"Ready"** 표시 대기 (약 3-5분)
3. **"Visit"** 버튼 클릭하여 사이트 확인

---

## 🧪 로그인 테스트

배포 완료 후 어드민 로그인 테스트:

```
URL: https://glec-website.vercel.app/admin/login

테스트 계정:
이메일: admin@glec.io
비밀번호: AdminPass123!
```

**예상 결과**:
- ✅ 로그인 성공
- ✅ `/admin/dashboard` 또는 `/admin/demo-requests`로 리다이렉트
- ✅ 대시보드 정상 표시

---

## ❌ 문제 해결

### 문제 1: 로그인 시 "Invalid email or password"

**원인**:
- 환경 변수가 아직 적용되지 않음
- 재배포를 하지 않음

**해결**:
1. Vercel Dashboard → Deployments
2. 최신 배포의 "..." 메뉴 → "Redeploy"
3. 5분 대기 후 다시 테스트

---

### 문제 2: "Database connection failed"

**원인**: `DATABASE_URL`이 잘못 설정됨

**확인사항**:
```bash
# 올바른 URL (반드시 -pooler 포함!)
postgresql://...@ep-name-pooler.c-2.us-east-1.aws.neon.tech/...
#                      ^^^^^^^ 주목!

# 잘못된 URL
postgresql://...@ep-name.us-east-1.aws.neon.tech/...
#                      ^^^^^^^ -pooler 누락
```

**해결**:
1. Settings → Environment Variables
2. `DATABASE_URL` 찾기
3. "Edit" 클릭
4. 값에 `-pooler` 포함되었는지 확인
5. 수정 후 Save
6. Redeploy

---

### 문제 3: 재배포 후에도 로그인 실패

**원인**: Admin 계정이 데이터베이스에 없음

**해결** (로컬에서 실행):
```bash
# 프로젝트 폴더에서
cd D:\GLEC-Website\glec-website

# Prisma Studio 열기
npx prisma studio

# User 테이블에서 확인:
# email: admin@glec.io
# role: SUPER_ADMIN
# 계정이 있는지 확인

# 없으면 seed 실행
npm run prisma:seed
```

---

## 📸 스크린샷 참고

테스트 중 생성된 스크린샷:

| 파일 | 설명 |
|------|------|
| `test-results/vercel-admin-login-issue.png` | 현재 로그인 실패 화면 |
| `test-results/vercel-admin-dashboard-success.png` | 성공 시 대시보드 (환경 변수 설정 후 생성됨) |

---

## ✅ 최종 체크리스트

환경 변수 설정 완료 확인:

- [ ] `DATABASE_URL` 추가 (Pooled connection, -pooler 포함)
- [ ] `DIRECT_URL` 추가 (Direct connection)
- [ ] `JWT_SECRET` 추가 (Production, Preview만)
- [ ] `NEXTAUTH_SECRET` 추가 (Production, Preview만)
- [ ] `NEXTAUTH_URL` 추가 (Production만)
- [ ] Redeploy 실행
- [ ] 배포 상태 "Ready" 확인
- [ ] 어드민 로그인 테스트 성공
- [ ] 대시보드 정상 표시

---

## 🎉 성공 시 예상 결과

환경 변수를 올바르게 설정하고 재배포하면:

1. ✅ https://glec-website.vercel.app/ - 홈페이지 정상
2. ✅ https://glec-website.vercel.app/admin/login - 로그인 가능
3. ✅ https://glec-website.vercel.app/admin/dashboard - 대시보드 표시
4. ✅ https://glec-website.vercel.app/admin/demo-requests - 데모 요청 관리 (1.5초 로딩)
5. ✅ 모든 어드민 기능 정상 작동

---

## 📞 추가 도움

설정 중 문제가 발생하면:

1. **Build Logs 확인**:
   - Vercel Dashboard → Deployments → 최신 배포 클릭
   - "Build Logs" 탭에서 에러 메시지 확인

2. **Runtime Logs 확인**:
   - Vercel Dashboard → Deployments → 최신 배포 클릭
   - "Functions" 탭 → 함수 클릭 → Logs 확인

3. **에러 메시지 검색**:
   - 에러 메시지를 복사하여 검색
   - 또는 Claude Code에게 전달

---

**Last Updated**: 2025-10-06 14:30 KST
**Test Status**: ✅ Deployment OK, ⚠️ Login Failed (환경 변수 필요)
**Next Step**: Vercel Dashboard에서 위 5개 환경 변수 추가 → Redeploy
