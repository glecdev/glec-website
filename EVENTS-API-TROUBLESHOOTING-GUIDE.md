# Events API 프로덕션 에러 트러블슈팅 가이드

**날짜**: 2025-10-07
**상태**: ⚠️ 로컬 정상, 프로덕션 500 에러
**우선순위**: P1 (Medium) - Events 테이블 비어있음, 실사용 없음

---

## 🔍 문제 요약

### 현상
- **로컬 환경**: ✅ 200 OK, 빈 배열 반환
- **프로덕션 환경**: ❌ 500 Internal Server Error
- **에러 메시지**: "An unexpected error occurred"

### 영향 범위
- Events 관리 페이지 (`/admin/events`) 접근 불가
- **실제 영향**: 낮음 (events 테이블이 비어있어 실사용 없음)

---

## ✅ 시도한 해결 방법

### 1. Neon SQL 드라이버 API 수정 ✅
**커밋**: af06f02
```typescript
// ❌ 구형 패턴 (더 이상 지원 안 함)
const result = await sql(query, params);

// ✅ 신규 패턴 (Neon 1.0+)
const result = await sql`SELECT * FROM events WHERE id = ${id}`;
```
**결과**: 로컬 정상 작동, 프로덕션 여전히 500

---

### 2. 강제 재배포 (캐시 무효화) ✅
**커밋**: 1fe9003 (empty commit)
**방법**: `git commit --allow-empty` 후 push
**결과**: 변화 없음 (여전히 500)

---

### 3. Neon 드라이버 버전 고정 ✅
**커밋**: 88bfb60
```json
// Before
"@neondatabase/serverless": "^1.0.2"  // 1.0.x 범위

// After
"@neondatabase/serverless": "1.0.2"   // 정확히 1.0.2만
```
**이유**: 프로덕션이 1.0.3+ 버전을 설치하여 동작이 다를 가능성
**결과**: 변화 없음 (여전히 500)

---

### 4. 에러 로깅 강화 ✅
**커밋**: 88bfb60
```typescript
catch (error) {
  console.error('[GET /api/admin/events] Error Details:', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : undefined,
    code: (error as any)?.code,
    detail: (error as any)?.detail,
  });
}
```
**목적**: 프로덕션 환경의 실제 에러 메시지 파악
**다음 단계**: Vercel Function Logs 확인 필요

---

## 🎯 다음 조치 (사용자 직접 수행)

### STEP 1: Vercel Function Logs 확인 ⭐ **필수**

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - `glec-website` 프로젝트 선택

2. **Function Logs 확인**
   - 상단 메뉴: **"Functions"** 탭 클릭
   - `GET /api/admin/events` 함수 선택
   - 최근 로그 확인

3. **에러 메시지 확인**
   ```
   [GET /api/admin/events] Error Details: {
     message: "...",  ← 실제 에러 메시지
     stack: "...",
     code: "...",
     detail: "..."
   }
   ```

4. **확인할 정보**
   - `message`: 정확한 에러 내용
   - `code`: NeonDbError 코드 (예: `23503`, `42P01` 등)
   - `detail`: 데이터베이스 상세 정보

---

### STEP 2: Vercel 환경 변수 확인

1. **Settings → Environment Variables**
   - `DATABASE_URL` 값 확인
   - Neon connection string 형식 확인:
     ```
     postgresql://user:password@host/database?sslmode=require
     ```

2. **권한 확인**
   - Neon 대시보드에서 해당 Role의 권한 확인
   - `events` 테이블 SELECT 권한 확인

---

### STEP 3: Vercel 수동 재배포 (선택사항)

1. **Deployments 탭**
2. 최신 배포 선택 (88bfb60)
3. **"Redeploy"** 버튼 클릭
4. ✅ "Use existing Build Cache" **체크 해제**
5. Redeploy 클릭

**목적**: 완전히 깨끗한 환경에서 재빌드

---

## 🔬 가능한 원인 분석

### 가설 1: 데이터베이스 권한 문제
**가능성**: ⭐⭐⭐ 높음
```sql
-- Neon 데이터베이스에서 권한 확인
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'events';
```
**해결책**: Neon 대시보드에서 SELECT 권한 부여

---

### 가설 2: events 테이블 구조 불일치
**가능성**: ⭐⭐ 중간
- 로컬 DB와 프로덕션 DB의 스키마가 다를 수 있음
- `event_registrations` 테이블이 없어서 LEFT JOIN 실패 가능

**확인 방법** (Neon SQL Editor):
```sql
-- events 테이블 존재 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'events';

-- event_registrations 테이블 존재 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'event_registrations';

-- events 테이블 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```

---

### 가설 3: Vercel Edge Runtime 제한
**가능성**: ⭐ 낮음
- Vercel Edge Runtime은 일부 Node.js API 미지원
- 하지만 Neon 드라이버는 Edge 호환

**확인 방법**: `route.ts`에 다음 추가
```typescript
export const runtime = 'nodejs'; // Force Node.js runtime
```

---

## 📝 임시 해결책 (Workaround)

Events 페이지가 긴급하게 필요한 경우:

### Option 1: Notices API 패턴 사용
Notices API는 정상 작동하므로 동일한 패턴 적용:
```typescript
// Events API를 Notices API와 동일한 구조로 변경
// (현재 코드는 이미 유사하지만 세부사항 재검토)
```

### Option 2: 간단한 쿼리로 테스트
```typescript
// GET 엔드포인트를 최소한의 쿼리로 변경
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const events = await sql`SELECT * FROM events LIMIT 10`;
      return NextResponse.json({ success: true, data: events });
    } catch (error) {
      console.error('[GET /api/admin/events] Simple Query Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
```

---

## 🎓 학습 및 예방책

### 로컬/프로덕션 환경 동기화
1. **동일한 Neon 데이터베이스 사용**
   - 로컬: `DATABASE_URL` (Pooled connection)
   - Vercel: 동일한 `DATABASE_URL`

2. **Prisma 마이그레이션 사용**
   ```bash
   npx prisma migrate dev --name add_events_table
   npx prisma migrate deploy  # 프로덕션 적용
   ```

3. **환경 변수 검증 스크립트**
   ```bash
   npm run verify:env
   ```

### 프로덕션 디버깅 도구
1. **Vercel Integration 추가**
   - Sentry: 에러 트래킹
   - LogRocket: 세션 리플레이
   - Datadog: APM 모니터링

2. **Health Check 엔드포인트**
   ```typescript
   // /api/health
   export async function GET() {
     try {
       await sql`SELECT 1`;
       return NextResponse.json({ status: 'ok', db: 'connected' });
     } catch (error) {
       return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 500 });
     }
   }
   ```

---

## ✅ 최종 체크리스트

### 완료된 작업
- [✅] Neon SQL 드라이버 패턴 수정 (Tagged Template Literals)
- [✅] Neon 드라이버 버전 고정 (1.0.2)
- [✅] 에러 로깅 강화 (상세 정보 출력)
- [✅] 강제 재배포 (캐시 무효화)
- [✅] 로컬 환경 정상 작동 확인

### 대기 중인 작업
- [ ] **Vercel Function Logs 확인** ⭐ 우선순위 높음
- [ ] Neon 데이터베이스 권한 확인
- [ ] events/event_registrations 테이블 존재 확인
- [ ] Prisma schema와 실제 DB 스키마 동기화 확인

---

## 📞 지원 요청

이 가이드로 해결되지 않을 경우:

1. **Vercel Function Logs 캡처**
   - 스크린샷 또는 텍스트 복사
   - 에러 메시지 전문 확인

2. **Neon 데이터베이스 정보**
   ```sql
   -- Neon SQL Editor에서 실행
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

3. **제공 필요 정보**
   - Vercel Function Logs 내용
   - Neon 테이블 목록
   - events 테이블 컬럼 구조

---

**작성일**: 2025-10-07 17:50 KST
**작성자**: Claude Code (Sonnet 4.5)
**관련 커밋**: af06f02, 88bfb60
**상태**: ⏳ Vercel Logs 확인 대기 중
