# GLEC Website - 체계적 배포 계획

**작성일**: 2025-10-04
**배포 플랫폼**: Vercel + Neon PostgreSQL + Cloudflare R2 + Resend

---

## 🎯 배포 목표

1. ✅ **웹사이트 (Public)**: 정적 페이지 + 동적 뉴스/공지사항
2. ✅ **어드민 CMS**: 콘텐츠 관리 시스템
3. ✅ **실시간 동기화**: CMS 수정 → 웹사이트 즉시 반영

---

## 📦 Phase 1: 인프라 설정 (현재 단계)

### 1.1 Vercel 호스팅 ✅ 완료
- **Status**: 배포 성공
- **URL**: https://glec-website.vercel.app
- **프로젝트 ID**: `prj_KpvFGT6jYZmn1NkaGQYrXulyvoUc`
- **다음 단계**: 환경 변수 추가

### 1.2 Neon PostgreSQL 설정 ⏳ 진행 중
- **필요한 작업**:
  1. Neon 계정 생성 (https://neon.tech)
  2. 프로젝트 생성: `glec-production`
  3. 데이터베이스 생성: `glec_db`
  4. Connection String 복사
  5. Vercel에 환경 변수 추가

- **환경 변수**:
  ```
  DATABASE_URL=postgresql://...@....neon.tech/glec_db?sslmode=require
  DIRECT_URL=postgresql://...@....neon.tech/glec_db?sslmode=require
  ```

### 1.3 Resend 이메일 설정 ⏳ 대기
- **필요한 작업**:
  1. Resend 계정 생성 (https://resend.com)
  2. API Key 생성
  3. 발신 도메인 설정 (또는 `onboarding@resend.dev` 사용)
  4. Vercel에 환경 변수 추가

- **환경 변수**:
  ```
  RESEND_API_KEY=re_...
  RESEND_FROM_EMAIL=noreply@glec.io
  ```

### 1.4 Cloudflare R2 설정 ⏳ 대기
- **필요한 작업**:
  1. Cloudflare 계정 생성/로그인
  2. R2 버킷 생성: `glec-assets`
  3. API Token 생성 (R2 권한)
  4. Public Access 설정
  5. Vercel에 환경 변수 추가

- **환경 변수**:
  ```
  R2_ACCOUNT_ID=...
  R2_ACCESS_KEY_ID=...
  R2_SECRET_ACCESS_KEY=...
  R2_BUCKET_NAME=glec-assets
  R2_PUBLIC_URL=https://pub-....r2.dev
  ```

### 1.5 기타 환경 변수 ⏳ 대기
- **필요한 작업**:
  1. JWT Secret 생성 (32자 이상 랜덤 문자열)
  2. Admin 비밀번호 해시 생성
  3. Vercel에 환경 변수 추가

- **환경 변수**:
  ```
  JWT_SECRET=<32-char-random-string>
  ADMIN_EMAIL=admin@glec.io
  ADMIN_PASSWORD_HASH=<bcrypt-hash>
  NEXTAUTH_SECRET=<32-char-random-string>
  NEXTAUTH_URL=https://glec-website.vercel.app
  ```

---

## 📦 Phase 2: 데이터베이스 마이그레이션

### 2.1 Prisma 설정 확인
```bash
cd glec-website
npm install
npx prisma generate
```

### 2.2 마이그레이션 실행
```bash
# Neon DATABASE_URL 설정 후
npx prisma migrate deploy

# 초기 데이터 시딩 (선택)
npx prisma db seed
```

### 2.3 데이터베이스 스키마 검증
```bash
npx prisma studio
# http://localhost:5555 에서 데이터 확인
```

---

## 📦 Phase 3: 어드민 초기 계정 생성

### 3.1 비밀번호 해시 생성
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-admin-password', 10));"
```

### 3.2 환경 변수에 추가
```
ADMIN_EMAIL=admin@glec.io
ADMIN_PASSWORD_HASH=<위에서 생성한 해시>
```

### 3.3 Vercel 재배포
```bash
vercel --prod
```

---

## 📦 Phase 4: 기능 테스트

### 4.1 웹사이트 페이지 테스트
- [ ] Homepage (/)
- [ ] About Company (/about/company)
- [ ] About Certifications (/about/certifications)
- [ ] Products DTG (/products/dtg)
- [ ] Products API (/products/api)
- [ ] Products Cloud (/products/cloud)
- [ ] Knowledge Library (/knowledge/library)
- [ ] Knowledge Videos (/knowledge/videos)
- [ ] Knowledge Blog (/knowledge/blog)
- [ ] News/Notices (/news)
- [ ] Contact (/contact)
- [ ] Press (/press)

### 4.2 어드민 CMS 테스트
- [ ] 로그인 (/admin/login)
- [ ] 대시보드 (/admin/dashboard)
- [ ] 공지사항 CRUD (/admin/notices)
- [ ] 팝업 관리 (/admin/popups)
- [ ] 분석 대시보드 (/admin/analytics)
- [ ] 문의 관리 (/admin/contact-requests)

### 4.3 실시간 동기화 테스트
1. **어드민에서 공지사항 생성**
   - /admin/notices → "새 공지사항" 작성
   - 저장 후 ID 확인

2. **웹사이트에서 즉시 확인**
   - /news 페이지 새로고침
   - 새 공지사항이 목록에 표시되는지 확인

3. **어드민에서 공지사항 수정**
   - 제목/내용 변경 후 저장

4. **웹사이트에서 변경 확인**
   - /news/{slug} 페이지 새로고침
   - 변경 내용이 즉시 반영되는지 확인

---

## 📦 Phase 5: 성능 최적화

### 5.1 이미지 최적화
- WebP 변환
- Lazy Loading 확인
- R2 CDN 캐싱 설정

### 5.2 API 응답 캐싱
- Vercel Edge Cache 활용
- `revalidate` 설정 최적화

### 5.3 Lighthouse 점수 확인
```bash
# 목표
Performance: 90+
Accessibility: 100
Best Practices: 95+
SEO: 100
```

---

## 📦 Phase 6: 모니터링 설정

### 6.1 Vercel Analytics (선택)
- Web Analytics 활성화
- Real-time 모니터링

### 6.2 Sentry 에러 추적 (선택)
- Sentry 프로젝트 생성
- DSN 환경 변수 추가

---

## 🔄 배포 워크플로우

### 개발 → 프로덕션 플로우
```
1. 로컬 개발
   ↓
2. Feature 브랜치 생성
   git checkout -b feature/new-feature
   ↓
3. 코드 작성 및 테스트
   npm run dev
   npm run test
   ↓
4. Commit & Push
   git add .
   git commit -m "feat: Add new feature"
   git push origin feature/new-feature
   ↓
5. Pull Request 생성
   GitHub → Create PR
   ↓
6. Vercel Preview Deployment
   자동 생성된 Preview URL 확인
   ↓
7. 리뷰 & Merge
   main 브랜치로 Merge
   ↓
8. Production Deployment
   Vercel이 자동으로 https://glec-website.vercel.app 배포
```

---

## ✅ 배포 체크리스트

### 배포 전
- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 어드민 계정 생성 완료
- [ ] 로컬 테스트 통과
- [ ] 코드 린트/타입 체크 통과

### 배포 후
- [ ] Homepage 정상 로드
- [ ] API 엔드포인트 응답 확인
- [ ] 어드민 로그인 성공
- [ ] CMS 기능 정상 작동
- [ ] 실시간 동기화 작동
- [ ] 이메일 발송 테스트
- [ ] 파일 업로드 테스트

### 성능 확인
- [ ] Lighthouse Performance 90+
- [ ] LCP < 2.5s
- [ ] FCP < 1.8s
- [ ] CLS < 0.1

---

## 🚨 알려진 이슈

### Issue #1: useSearchParams() Suspense 에러
- **상태**: ✅ 해결됨 (Commit 9b72e7f)
- **해결 방법**: Suspense boundary 추가

### Issue #2: Vercel 환경 변수 누락
- **상태**: ⏳ 진행 중
- **필요 작업**: Vercel Dashboard에서 환경 변수 추가

---

## 📞 문의

배포 중 문제 발생 시:
1. GitHub Issues: https://github.com/glecdev/glec-website/issues
2. Vercel Logs 확인: https://vercel.com/glecdevs-projects/glec-website
3. Neon Dashboard: https://console.neon.tech

---

**최종 업데이트**: 2025-10-04
**버전**: 1.0.0
**담당**: GLEC Development Team
