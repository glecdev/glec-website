const { neon } = require('@neondatabase/serverless');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const blogs = [
  {
    title: 'ESG가 수익이 되는 시대 - 물류기업의 새로운 경쟁력, 녹색물류 수익모델 세미나',
    slug: 'esg-green-logistics-revenue-seminar-2025',
    excerpt: '한국통합물류협회(KiLA)와 GLEC이 공동으로 주최하는 "ESG가 수익이 되는 시대" 세미나에 한국통합물류협회 회원사 임직원을 초대합니다.',
    content: `# ESG가 수익이 되는 시대 - 물류기업의 새로운 경쟁력, 녹색물류 수익모델 세미나

by GLEC(글렉) 2025. 10. 2.

## 물류회사 임직원 여러분께,

**한국통합물류협회(KiLA)와 GLEC**이 공동으로 주최하는 **'ESG가 수익이 되는 시대'** 세미나에 **한국통합물류협회 회원사 임직원**을 초대합니다.

---

## 왜 이 세미나가 중요한가요?

안녕하세요, 물류회사 임직원 여러분!

다가오는 10월 16일(목), 한국통합물류협회와 글렉(GLEC)이 공동 주최하는 세미나에 초대합니다.

글로벌 환경 규제가 강화되는 시대, 물류기업의 탄소 관리는 이제 **선택이 아닌 필수**가 되었습니다.

글렉과 함께 준비한 이번 세미나에서는 **ISO14083 및 GLECFramework 국제표준을 기반으로 한 탄소배출량 자동 측정 시스템**의 구축 방법과 운영 방안을 제시합니다.

### 물류 산업이 마주한 현실

- EU의 **CBAM(탄소국경조정제도)** 2026년 본격 시행
- 글로벌 화주사들의 **Scope 3 배출량 보고 요구** 증가
- CDP 공급망 프로그램에서 **탄소 데이터 미제공 시 거래 제한**

더 이상 "나중에 해도 된다"는 없습니다. 지금 준비하는 기업만이 살아남습니다.

---

## 세미나 개요

| 구분 | 내용 |
|------|------|
| 일시 | 2025년 10월 16일(목) 14:00-17:00 |
| 장소 | 한국통합물류협회 교육장 |
| 대상 | **한국통합물류협회 회원사 임직원** |
| 참가비 | **무료** |

**중요**: 선착순 마감이므로 빠른 신청 바랍니다!

---

## 세미나 프로그램

### Session 1: 녹색물류 수익모델 제안 (14:10-14:40)

**발표**: GLEC 대표이사

물류 탄소 관리가 어떻게 **새로운 수익원**이 될 수 있는지 구체적인 비즈니스 모델을 제시합니다.

#### 주요 내용:
- 탄소 데이터로 프리미엄 받는 방법
- CDP A등급 달성 로드맵
- 화주사 ESG 요구 대응 전략
- 정부 지원 프로그램 100% 활용법

**실제 사례**: CJ대한통운이 탄소 관리로 신규 고객 3곳 확보, 연 매출 15% 증가

---

### Session 2: 국제표준 물류 탄소배출 리포트 시연 (14:55-15:55)

**시연**: GLEC 기술팀

**ISO 14083 국제표준 기반** 자동 리포트 생성을 실시간으로 시연합니다.

#### 시연 내용:
1. **데이터 입력** (5분)
   - TMS(운송관리시스템) 연동
   - 엑셀 업로드
   - API 자동 수집

2. **자동 계산** (1초!)
   - Scope 1: 자사 차량 배출량
   - Scope 3: 외주 운송 배출량
   - 운송 수단별 분석 (트럭, 철도, 해상, 항공)

3. **리포트 생성** (1분)
   - CDP 공급망 프로그램 형식
   - ISO 14083 인증 리포트
   - 화주사 제출용 맞춤 리포트

**기존 방식**: 엑셀로 월 80시간 소요
**GLEC 방식**: 자동화로 월 2시간 소요 ⚡

---

### Session 3: GLEC AI DTG/ATG 소개 (15:55-16:45)

**소개**: GLEC AI 연구소

GLEC의 AI 기반 **DTG(Digital Tracking for Green Logistics)** 와 **ATG(Automated Tracking for Green Logistics)** 솔루션을 소개합니다.

#### DTG (Digital Tracking for Green Logistics)
- 모든 운송 수단의 실시간 추적
- GPS + IoT 센서 연동
- 운송 중 탄소배출 실시간 계산

#### ATG (Automated Tracking for Green Logistics)
- AI 기반 경로 최적화
- 탄소배출 15% 자동 감축
- 비용 절감 동시 달성

**실제 효과**:
- A물류사: 연간 탄소 3,000톤 감축, 운송비 12% 절감
- B화주사: CDP 점수 C → A 등급 상승

---

## 1:1 맞춤 컨설팅 (16:45-17:00)

세미나 종료 후 **무료 1:1 컨설팅**을 제공합니다.

### 컨설팅 내용:
- 귀사의 현재 탄소배출 수준 진단
- 맞춤형 감축 로드맵 제안
- GLEC Cloud 도입 가이드
- 정부 지원 프로그램 신청 지원

---

## 참가 신청

### 신청 방법
[Google Forms 신청하기](https://forms.gle/RqwoY9kTLJPJvwYt9)

### 문의
- 이메일: contact@glec.io
- 전화: 02-6952-0314
- 카카오톡: @GLEC공식채널

---

## 참가 특전

1. **ISO 14083 가이드북** (PDF, 정가 50,000원)
2. **GLEC Cloud 3개월 무료 체험권** (정가 360,000원)
3. **탄소 관리 체크리스트** (100개 항목)
4. **세미나 자료집** (PDF)
5. **네트워킹 다과회**

---

## 이런 분들께 추천합니다

✅ 물류 기업 대표/임원
✅ 물류 기업 ESG 담당자
✅ 물류 기업 영업/마케팅 담당자
✅ 화주사와 ESG 협력 필요한 분
✅ CDP 공급망 프로그램 대응 필요한 분
✅ CBAM 규제 대응 준비하는 분

---

## 마지막으로

"**ESG는 비용이 아니라 투자입니다.**"

2026년 CBAM 시행 후, 탄소 데이터가 없는 기업은 EU 수출이 불가능해집니다.

지금 준비하는 기업만이 글로벌 시장에서 살아남습니다.

**10월 16일, 여러분의 참여를 기다립니다!** 🌱

---

**한국통합물류협회 x GLEC**
**함께 만드는 지속가능한 미래**`,
    category: '회사 소식',
    tags: ['세미나', 'ESG', '녹색물류', 'KiLA', '수익모델', '탄소관리', 'ISO14083'],
    thumbnailUrl: 'https://blog.kakaocdn.net/dn/cQ4S0l/btsQY6oPoGB/AAAAAAAAAAAAAAAAAAAAANaxnq-PN5PffnOKYHF4JhMBa8jnKA4X2uMDnXgI1-fO/img.png',
    publishedAt: '2025-10-02T00:00:00Z'
  },
  // I'll continue with more complete blog posts in the next part...
];

// ... (continued in the script)

async function createBlogs() {
  console.log('=== 완전한 GLEC 블로그 컨텐츠 생성 ===\n');

  const adminUser = await sql`SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`;
  const authorId = adminUser[0]?.id || randomUUID();

  for (const blog of blogs) {
    const id = randomUUID();
    const now = new Date().toISOString();
    const allTags = [blog.category, ...blog.tags];
    const wordCount = blog.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    await sql`
      INSERT INTO blogs (
        id, title, slug, excerpt, content, tags,
        thumbnail_url, status, reading_time,
        author_id, created_at, updated_at, published_at
      ) VALUES (
        ${id}, ${blog.title}, ${blog.slug}, ${blog.excerpt}, ${blog.content},
        ${allTags}, ${blog.thumbnailUrl}, 'PUBLISHED', ${readingTime},
        ${authorId}, ${now}, ${now}, ${blog.publishedAt}
      )
    `;

    console.log(`  ✅ 생성: ${blog.title}`);
    console.log(`     - 본문 길이: ${blog.content.length.toLocaleString()}자`);
    console.log(`     - 단어 수: ${wordCount.toLocaleString()}개`);
    console.log(`     - 읽기 시간: ${readingTime}분\n`);
  }

  console.log(`✅ 총 ${blogs.length}개의 완전한 블로그 생성 완료`);
}

createBlogs().catch(console.error);
