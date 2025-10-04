# Neon PostgreSQL 설정 가이드

**목적**: GLEC Website를 위한 무료 PostgreSQL 데이터베이스 설정
**플랫폼**: Neon.tech (Free Tier - 영구 무료)
**소요 시간**: 5분

---

## 📋 무료 티어 제공 범위

```yaml
Neon Free Tier (영구 무료):
  스토리지: 0.5GB
  컴퓨트: 100 시간/월
  브랜치: 10개 (개발/스테이징/프로덕션 분리 가능)
  연결: 무제한 (connection pooling)
  백업: 6시간 복원 히스토리
```

GLEC 프로젝트 예상 사용량: ~10MB << 500MB (충분)

---

## 🚀 Step-by-Step 설정

### Step 1: Neon 계정 생성

1. **https://console.neon.tech/signup** 접속
2. **Sign up with GitHub** 클릭 (권장)
   - 또는 이메일로 가입
3. 이메일 인증 완료

### Step 2: 프로젝트 생성

1. Neon Dashboard에서 **"Create a project"** 클릭
2. 프로젝트 설정:
   ```
   Project name: glec-production
   PostgreSQL version: 16 (최신)
   Region: Asia Pacific (Tokyo) 또는 AWS ap-northeast-1
   Compute size: 0.25 vCPU (Free Tier 기본값)
   ```
3. **"Create Project"** 클릭

### Step 3: 데이터베이스 생성

프로젝트가 생성되면 자동으로 `neondb` 데이터베이스가 생성됩니다.

**변경하려면**:
1. Neon Dashboard → **"Databases"** 탭
2. **"New Database"** 클릭
3. Database name: `glec_db`
4. Owner: `neondb_owner` (기본값)
5. **"Create"** 클릭

### Step 4: Connection String 복사

1. Neon Dashboard → **"Connection Details"** 섹션
2. **"Pooled connection"** 선택 (중요!)
3. Connection string 복사:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

**예시**:
```
postgresql://neondb_owner:AbCd123XyZ@ep-cool-rain-12345678.us-east-2.aws.neon.tech/glec_db?sslmode=require
```

### Step 5: Environment 변수 설정

복사한 Connection String을 다음 두 변수에 모두 사용:

```bash
DATABASE_URL="postgresql://neondb_owner:AbCd123XyZ@ep-cool-rain-12345678.us-east-2.aws.neon.tech/glec_db?sslmode=require"

DIRECT_URL="postgresql://neondb_owner:AbCd123XyZ@ep-cool-rain-12345678.us-east-2.aws.neon.tech/glec_db?sslmode=require"
```

---

## ✅ 설정 검증

### 로컬에서 연결 테스트

```bash
# 1. .env.local에 DATABASE_URL 추가
echo 'DATABASE_URL="postgresql://..."' > .env.local

# 2. Prisma Client 생성
npx prisma generate

# 3. 데이터베이스 연결 테스트
npx prisma db push

# 성공 메시지:
# ✔ Generated Prisma Client
# ✔ Database synchronized with Prisma schema
```

### Prisma Studio로 데이터 확인

```bash
npx prisma studio
```

브라우저에서 http://localhost:5555 접속 → 테이블 목록 확인

---

## 📦 Vercel에 환경 변수 추가

### Option A: Vercel CLI (자동화)

```bash
# Vercel CLI로 환경 변수 추가
cd glec-website

# 1. DATABASE_URL 추가
vercel env add DATABASE_URL production

# 입력 프롬프트에서 Connection String 붙여넣기

# 2. DIRECT_URL 추가
vercel env add DIRECT_URL production

# 같은 Connection String 붙여넣기
```

### Option B: Vercel Dashboard (수동)

1. **https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables** 접속
2. **"Add New"** 클릭
3. 변수 추가:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://...` (Connection String 붙여넣기)
   - **Environment**: `Production` 체크
4. **"Save"** 클릭
5. `DIRECT_URL`도 동일하게 추가

---

## 🗄️ 데이터베이스 마이그레이션

### Step 1: 마이그레이션 파일 생성 (로컬)

```bash
cd glec-website

# Prisma 마이그레이션 생성
npx prisma migrate dev --name init

# 성공 메시지:
# ✔ Prisma schema loaded from prisma/schema.prisma
# ✔ Migrated to the latest version
```

### Step 2: Production 마이그레이션 (Vercel 배포 시 자동)

Vercel은 배포 시 자동으로 다음 명령을 실행합니다:
```bash
npx prisma generate
npx prisma migrate deploy
```

**수동으로 실행하려면**:
```bash
# Neon DATABASE_URL 환경변수 설정 후
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 🔐 보안 설정

### 1. Connection Pooling 활성화 (기본값)

Neon은 기본적으로 connection pooling을 제공합니다.
- 무제한 동시 연결 지원
- 자동 connection reuse
- 최적의 성능

### 2. SSL/TLS 암호화 (필수)

Connection String에 `?sslmode=require` 포함 확인:
```
postgresql://...?sslmode=require
```

### 3. IP Allowlist (선택)

Neon Dashboard → **"Settings"** → **"IP Allow"**
- Vercel IP 범위 추가 (권장하지 않음 - 모든 Vercel IP는 동적)
- 또는 **"Allow all IPs"** (Neon 기본값)

---

## 📊 모니터링

### Neon Dashboard

1. **"Monitoring"** 탭에서 확인:
   - 데이터베이스 크기
   - 컴퓨트 사용량 (100시간/월 제한)
   - 활성 연결 수

2. **"Branches"** 탭:
   - `main` 브랜치: Production 데이터
   - 개발용 브랜치 생성 가능

### 사용량 알림 설정

1. Neon Dashboard → **"Settings"** → **"Billing"**
2. **"Set up billing alerts"** 활성화
3. 80% 사용 시 이메일 알림

---

## 🚨 트러블슈팅

### 에러 1: "Connection refused"
```
Error: connect ECONNREFUSED ...
```

**해결 방법**:
1. Connection String이 정확한지 확인
2. `?sslmode=require` 포함 확인
3. Neon 프로젝트가 Active 상태인지 확인

### 에러 2: "Too many connections"
```
Error: sorry, too many clients already
```

**해결 방법**:
1. **Pooled connection** 사용 확인 (Direct connection 아님)
2. Prisma connection limit 설정:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

### 에러 3: "Compute hour limit exceeded"
```
Error: compute time quota exceeded
```

**해결 방법**:
1. Neon은 100 compute hours/월 제공
2. **Scale to Zero** 활용 (5분 비활성 시 자동 슬립)
3. 트래픽이 많으면 paid 플랜 고려

---

## 📋 체크리스트

배포 전 확인:

- [ ] Neon 프로젝트 생성 완료
- [ ] `glec_db` 데이터베이스 생성
- [ ] Connection String 복사
- [ ] `DATABASE_URL` 환경 변수 설정
- [ ] `DIRECT_URL` 환경 변수 설정
- [ ] Vercel에 환경 변수 추가
- [ ] 로컬에서 `npx prisma generate` 성공
- [ ] 로컬에서 `npx prisma migrate dev` 성공
- [ ] Prisma Studio로 테이블 확인

---

## 🔗 참고 링크

- Neon Documentation: https://neon.tech/docs
- Prisma + Neon Guide: https://neon.tech/docs/guides/prisma
- Neon Free Tier Details: https://neon.tech/pricing

---

**다음 단계**: [Resend 이메일 설정](./RESEND-SETUP-GUIDE.md)

**최종 업데이트**: 2025-10-04
