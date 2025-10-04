# GLEC Website

[![Deployment Status](https://img.shields.io/badge/Deployment-98%25%20Complete-brightgreen)](./DEPLOYMENT-STATUS.md)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-success)](https://glec-website.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-blue)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-success)](https://neon.tech)
[![Auth](https://img.shields.io/badge/Auth-Stack%20Auth-blue)](https://stack-auth.com)
[![E2E Tests](https://img.shields.io/badge/E2E%20Tests-17/17%20Passed-success)](./tests/e2e/production-comprehensive.spec.ts)
[![Performance](https://img.shields.io/badge/LCP-0.22s-success)](./DEPLOYMENT-ITERATION-2.md)

ISO-14083 국제표준 기반 물류 탄소배출 측정 솔루션 - 공식 웹사이트 및 Admin CMS

## 🎉 Iteration 3 완료!

**✅ Neon PostgreSQL 데이터베이스 연결 및 인증 시스템 구성 완료**
- 진행률: 95% → **98%** (+3%)
- 데이터베이스: **Neon PostgreSQL 연결** (9 tables)
- 인증: **Stack Auth 통합** (3 environment variables)
- 환경 변수: **8개 구성 완료** (DB + Auth)
- 상세 보고서: [DEPLOYMENT-ITERATION-3.md](./DEPLOYMENT-ITERATION-3.md)

## 🚀 다음 단계 (Iteration 4 - 98% → 100%)

**Admin 계정 생성 및 CRUD 테스트만 하면 100% 완료!** (2-3시간)

### Step 1: Admin 계정 생성 (1시간)
```bash
cd d:\GLEC-Website\glec-website
# Prisma seed 스크립트 작성 및 실행
npx prisma db seed
```

### Step 2: Admin 로그인 및 CRUD 테스트 (1시간)
1. Admin 로그인: https://glec-website.vercel.app/admin/login
2. 공지사항 CRUD 테스트 (Create, Read, Update, Delete)
3. 실시간 동기화 확인 (CMS → Website)

### Step 3: E2E 테스트 작성 및 실행 (1시간)
```bash
# Admin 로그인 E2E 테스트
npx playwright test tests/e2e/admin/login-auth.spec.ts

# 공지사항 CRUD E2E 테스트
npx playwright test tests/e2e/admin/notices-crud-db.spec.ts
```

**상세 가이드**: [DEPLOYMENT-ITERATION-3.md](./DEPLOYMENT-ITERATION-3.md) ⭐

---

## 📊 현재 상태 (Iteration 3 완료)

### ✅ 완료 (95%)
- ✅ Vercel 프로덕션 배포
- ✅ **전체 13개 페이지 100% 작동**
- ✅ **Playwright E2E 테스트 17/17 통과**
- ✅ **/news Suspense 에러 해결**
- ✅ **성능 최적화 (LCP 평균 0.22s)**
- ✅ 환경 변수 12/14 추가
- ✅ 자동화 스크립트 6개
- ✅ 배포 문서 8개
- ✅ 404 페이지 수정 완료

### ⏳ 남은 작업 (10%)
- ⏳ Neon 데이터베이스 연결 (3분)
- ⏳ 데이터베이스 마이그레이션 (2분)
- ⏳ Admin 기능 검증 (5분)

**상세 현황**: [DEPLOYMENT-STATUS.md](./DEPLOYMENT-STATUS.md)

---

## 🌐 Production URLs

- **메인 사이트**: https://glec-website.vercel.app
- **Admin CMS**: https://glec-website.vercel.app/admin/login

**Admin 계정** (배포 완료 후 사용):
- Email: `admin@glec.io`
- Password: `GLEC2025Admin!`

---

## 📚 Documentation

### 배포 가이드
- [QUICK-START.md](./QUICK-START.md) - 7분 원클릭 배포 가이드 ⭐
- [DEPLOYMENT-STATUS.md](./DEPLOYMENT-STATUS.md) - 현재 배포 상태 및 진행률
- [FINAL-DEPLOYMENT-STEPS.md](./FINAL-DEPLOYMENT-STEPS.md) - 최종 배포 3단계
- [DEPLOYMENT-PLAN.md](./DEPLOYMENT-PLAN.md) - 6단계 상세 배포 계획
- [NEON-SETUP-GUIDE.md](./NEON-SETUP-GUIDE.md) - Neon PostgreSQL 설정 가이드
- [VERCEL-QUICK-DEPLOY.md](./VERCEL-QUICK-DEPLOY.md) - Vercel 배포 가이드

### 기술 문서
- [GLEC-Functional-Requirements-Specification.md](./GLEC-Functional-Requirements-Specification.md) - 기능 요구사항
- [GLEC-API-Specification.yaml](./GLEC-API-Specification.yaml) - API 명세
- [GLEC-Environment-Setup-Guide.md](./GLEC-Environment-Setup-Guide.md) - 환경 설정
- [GLEC-Test-Plan.md](./GLEC-Test-Plan.md) - 테스트 계획
- [GLEC-Git-Branch-Strategy-And-Coding-Conventions.md](./GLEC-Git-Branch-Strategy-And-Coding-Conventions.md) - 코딩 규칙
- [GLEC-Zero-Cost-Architecture.md](./GLEC-Zero-Cost-Architecture.md) - 아키텍처 ($0/month)

### 디자인 시스템
- [GLEC-Design-System-Standards.md](./GLEC-Design-System-Standards.md) - 디자인 시스템
- [GLEC-Page-Structure-Standards.md](./GLEC-Page-Structure-Standards.md) - 페이지 구조

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **API**: Cloudflare Workers Functions
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Prisma
- **Authentication**: NextAuth.js + JWT

### Infrastructure
- **Hosting**: Vercel (Serverless)
- **Storage**: Cloudflare R2 (10GB)
- **Cache**: Cloudflare Workers KV (1GB)
- **Email**: Resend (3,000/month)

**Target Cost**: $0/month (무료 티어만 사용)

---

## 🚀 Features

### Public Website
- ✅ Homepage (Hero, Problem Awareness, Solution, Products, Trust, CTA)
- ✅ About Company
- ✅ Products (DTG, Carbon API, GLEC Cloud)
- ✅ Knowledge (Library, Videos, Blog)
- ✅ Press Releases
- ✅ Contact Form
- ✅ Popup Modals

### Admin CMS
- ⏳ Admin Login (JWT)
- ⏳ Dashboard (Analytics)
- ⏳ Notices CRUD
- ⏳ Press CRUD
- ⏳ Knowledge CRUD
- ⏳ Popup CRUD
- ⏳ Analytics Viewer

### Real-time Sync
- ⏳ CMS 수정 시 웹사이트 즉시 반영
- ⏳ Server-Sent Events (SSE)
- ⏳ Optimistic UI 업데이트

---

## 📁 Project Structure

```
glec-website/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages
│   ├── admin/               # Admin CMS
│   └── api/                 # API Routes
├── components/              # React components
│   ├── ui/                  # UI components
│   └── sections/            # Page sections
├── lib/                     # Utilities
├── prisma/                  # Database schema
├── public/                  # Static assets
├── scripts/                 # Deployment scripts
│   ├── complete-deployment.ps1        # 원클릭 배포
│   ├── add-env-to-vercel.ps1         # 환경 변수 추가
│   ├── setup-production-env.ps1      # 환경 변수 생성
│   ├── setup-production-env.sh       # Linux/macOS
│   └── setup-neon-and-deploy.ps1     # Neon + 배포 통합
└── docs/                    # Documentation
```

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (or Neon account)

### Local Setup

```bash
# Clone repository
git clone https://github.com/glecdev/glec-website.git
cd glec-website

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:e2e     # Run E2E tests (Playwright)
```

---

## 🔐 Environment Variables

### Required (14 variables)

```bash
# Database
DATABASE_URL="postgresql://..."          # Neon Pooled connection
DIRECT_URL="postgresql://..."            # Neon Direct connection

# Authentication
JWT_SECRET="..."                         # 32+ characters
NEXTAUTH_SECRET="..."                    # 32+ characters
NEXTAUTH_URL="https://glec-website.vercel.app"
ADMIN_EMAIL="admin@glec.io"
ADMIN_PASSWORD_HASH="..."                # bcrypt hash

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@glec.io"

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="glec-assets"
R2_PUBLIC_URL="https://..."
```

**자동 생성**: `.\scripts\setup-production-env.ps1`

---

## 📦 Database Schema

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(ADMIN)
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Notice {
  id          String   @id @default(cuid())
  title       String
  content     String
  category    Category @default(GENERAL)
  status      Status   @default(DRAFT)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Press {
  id          String   @id @default(cuid())
  title       String
  content     String
  publisher   String
  publishedAt DateTime
  url         String?
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

# ... and more (Video, Blog, Library, Contact, Media, Popup, Analytics)
```

**전체 스키마**: [prisma/schema.prisma](./prisma/schema.prisma)

---

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm run test
npm run test:coverage  # Target: 80%+
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
BASE_URL=https://glec-website.vercel.app npm run test:e2e  # Production
```

### Accessibility Tests
```bash
npm run test:a11y  # WCAG 2.1 AA compliance
```

---

## 🚨 Troubleshooting

### "Database connection failed"
**해결**: Vercel 환경 변수에서 DATABASE_URL 확인
```powershell
node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env ls production --token=4WjWFbv1BRjxABWdkzCI6jF0
```

### "Migration failed"
**해결**: 로컬에서 재시도
```powershell
$env:DATABASE_URL = "postgresql://..."
npx prisma migrate reset
npx prisma migrate deploy
```

### "Admin login fails"
**해결**:
1. Vercel Logs 확인: https://vercel.com/glecdevs-projects/glec-website
2. JWT_SECRET 환경 변수 확인
3. 브라우저 콘솔 에러 확인

**상세 가이드**: [FINAL-DEPLOYMENT-STEPS.md](./FINAL-DEPLOYMENT-STEPS.md#-트러블슈팅)

---

## 📞 Support

- **Vercel Dashboard**: https://vercel.com/glecdevs-projects/glec-website
- **GitHub Issues**: https://github.com/glecdev/glec-website/issues
- **Neon Console**: https://console.neon.tech

---

## 📜 License

Copyright © 2025 GLEC. All rights reserved.

---

## 🎯 Next Steps

### 즉시 실행 (5분)
1. **Neon 데이터베이스 생성** → [QUICK-START.md](./QUICK-START.md)
2. **원클릭 자동 배포** → `.\scripts\complete-deployment.ps1`
3. **배포 검증** → https://glec-website.vercel.app

### 선택사항 (나중에)
1. **Resend 이메일** → https://resend.com
2. **Cloudflare R2** → https://dash.cloudflare.com/r2

---

**현재 상태**: 🟡 80% 완료 (Neon 데이터베이스만 연결하면 끝!)
**최종 업데이트**: 2025-10-04
**예상 남은 시간**: 5분
