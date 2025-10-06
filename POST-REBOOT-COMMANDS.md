# 🚀 재부팅 후 실행 가이드

## ⚠️ 중요: 재부팅 전에 이 파일을 열어두세요!

---

## 📋 Step 1: 재부팅 (사용자 작업)

```
Windows 시작 → 재시작
```

---

## 🤖 Step 2: 재부팅 후 자동 실행 (CMD 관리자 권한)

### Option A: 한 번에 실행 (권장)

```cmd
cd D:\GLEC-Website\glec-website && rmdir /s /q .next && npm run dev
```

**새 CMD 창 열고** (서버는 그대로 두고):

```cmd
cd D:\GLEC-Website\glec-website && timeout /t 60 /nobreak && npx playwright test tests/e2e/admin-demo-requests.spec.ts --project=chromium --reporter=list --timeout=60000
```

### Option B: 단계별 실행

#### 1) Webpack 캐시 삭제
```cmd
cd D:\GLEC-Website\glec-website
rmdir /s /q .next
```

#### 2) 서버 시작
```cmd
npm run dev
```

**결과 확인**:
```
✓ Ready in 2-3s
- Local: http://localhost:3000
```

#### 3) 60초 대기 후 테스트 실행 (새 CMD 창)
```cmd
cd D:\GLEC-Website\glec-website
timeout /t 60 /nobreak
npx playwright test tests/e2e/admin-demo-requests.spec.ts --project=chromium --reporter=list --timeout=60000
```

---

## ✅ 예상 결과

### 🎯 성공 지표

1. **서버 로그**:
   ```
   GET /admin/demo-requests 200 in 200ms    ← 0.2초! (기존: 40초)
   ```

2. **페이지 로드**:
   - ✅ "로딩 중..." 즉시 사라짐
   - ✅ 테이블 즉시 표시

3. **E2E 테스트**:
   ```
   11 passed (1.5m)    ← 모든 테스트 통과!
   ```

### ❌ 만약 여전히 실패한다면

**문제 확인**:
```cmd
cd D:\GLEC-Website\glec-website
type app\admin\demo-requests\DemoRequestsClient.tsx | findstr /n "setPage"
```

**107번 라인 확인**:
```typescript
// Don't set page from response to avoid infinite loop
// setPage(data.meta.page);    ← 이 줄이 주석 처리되어 있어야 함
```

만약 주석이 안 되어 있다면:
```cmd
git status
git diff app/admin/demo-requests/DemoRequestsClient.tsx
```

---

## 🔧 트러블슈팅

### 문제 1: Port 3000이 여전히 사용 중
```cmd
netstat -ano | findstr ":3000"
taskkill /F /PID [PID번호]
```

### 문제 2: .next 폴더 삭제 안 됨
```cmd
# 관리자 권한 CMD에서:
takeown /f .next /r /d y
icacls .next /grant administrators:F /t
rmdir /s /q .next
```

### 문제 3: npm run dev 시작 안 됨
```cmd
# Node.js 재설치 또는:
npm cache clean --force
npm install
npm run dev
```

---

## 📊 성공 확인 체크리스트

- [ ] Windows 재부팅 완료
- [ ] .next 폴더 삭제 확인 (`dir .next` → 폴더 없음)
- [ ] 서버 시작 성공 (`✓ Ready in 2-3s`)
- [ ] 페이지 로드 2초 미만 확인
- [ ] E2E 테스트 11개 모두 통과
- [ ] "로딩 중..." 무한 루프 없음 확인

---

## 📝 완료 후 보고

다음 정보를 Claude에게 보고해주세요:

1. **서버 로그**:
   ```
   GET /admin/demo-requests 200 in [X]ms
   ```

2. **테스트 결과**:
   ```
   [N] passed ([X]m)
   ```

3. **성공 여부**: ✅ 성공 / ❌ 실패 (에러 메시지 첨부)

---

## 🎉 성공 시 다음 단계

1. **Git Commit**:
   ```cmd
   git add app/admin/demo-requests/DemoRequestsClient.tsx
   git add app/api/admin/demo-requests/route.ts
   git commit -m "fix(demo-requests): Remove infinite loop caused by setPage in useCallback dependency"
   ```

2. **Production 배포**:
   ```cmd
   git push origin main
   vercel --prod
   ```

---

**파일 위치**: `D:\GLEC-Website\glec-website\POST-REBOOT-COMMANDS.md`
**작성일**: 2025-10-06
**작성자**: Claude AI (CTO Mode)
