const { neon } = require('@neondatabase/serverless');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// GLEC 전문 블로그 9개 추가
const blogs = [
  {
    title: '2030년 물류혁명을 이끌 7대 기술',
    slug: 'logistics-revolution-7-technologies-2030',
    excerpt: '2030년까지 물류 산업을 혁명적으로 변화시킬 7대 핵심 기술을 소개합니다. AI 경로 최적화부터 자율주행 전기트럭, 드론 배송, 블록체인 투명성까지 미래 물류의 청사진을 확인하세요.',
    content: `# 2030년 물류혁명을 이끌 7대 기술

안녕하세요, 물류&운송산업 탄소배출량 측정 전문기업 GLEC입니다.

## 2030년 물류 시장 전망

- **물류 자동화 시장**: 2030년 **1,474억 달러** (연평균 11.9% 성장)
- **물류 로봇 시장**: 2030년 **419억 달러** (연평균 14.9% 성장)
- **자율주행 트럭**: 2030년 **117억 달러** (연평균 19.3% 성장)

## 7대 핵심 기술

### 1. AI 기반 경로 최적화
실시간 교통, 날씨, 우선순위 분석으로 탄소배출 15-20% 감축

### 2. 자율주행 전기 트럭
2030년까지 도심 배송의 40%가 자율주행 전기차로 전환

### 3. 드론 배송 네트워크
마지막 1km 배송의 혁신, 탄소배출과 시간 동시 단축

### 4. 스마트 창고 (IoT & 로봇)
IoT 센서와 로봇으로 에너지 소비 30% 이상 절감

### 5. 블록체인 투명성
변조 불가능한 ESG 리포트 생성, 공급망 전체 추적

### 6. 녹색 수소 연료전지
장거리 운송의 디젤 대체, 탄소 제로 달성

### 7. 디지털 트윈
가상 시뮬레이션으로 최적의 탄소 감축 전략 도출

## GLEC의 역할

GLEC은 이러한 기술이 생성하는 데이터를 ISO 14083 기반으로 통합 측정합니다.

**지금 준비하는 기업만이 미래의 리더가 됩니다.** 🚀`,
    category: '기술 트렌드',
    tags: ['AI물류', '물류자동화', '미래물류', '자율주행', '드론배송', '블록체인', '수소경제'],
    thumbnailUrl: 'https://blog.kakaocdn.net/dn/lTVy7/btsQXBhflsl/img.png',
    publishedAt: '2025-10-01T00:00:00Z'
  },
  {
    title: '2025년 그린물류 선두기업 10곳의 Movement',
    slug: 'green-logistics-leading-companies-2025',
    excerpt: 'DHL, UPS, FedEx, Amazon, Maersk, CJ대한통운, 쿠팡 등 글로벌 그린물류 선두기업들의 혁신 사례와 탄소중립 전략을 상세히 분석합니다.',
    content: `# 2025년 그린물류 선두기업 10곳의 Movement

## 글로벌 시장 현황

- 그린물류 시장: 2023년 **1조 1,600억 달러**
- 2032년까지 연평균 **9.5%** 성장 전망
- 전기차, 재생에너지, AI 소프트웨어가 성장 주도

## 글로벌 선두기업

### 1. DHL - GoGreen Plus
- SAF(지속가능 항공유) 사용
- 2025년까지 탄소배출 40% 감축

### 2. UPS - eQuad 전기 자전거
- 도심 배송 제로 에미션
- 대체 연료 차량 투자 확대

### 3. FedEx - 전기 배송 차량
- 대규모 전기차 배치
- AI/IoT 물류 최적화

### 4. Amazon - 2040 탄소중립
- 전기 배송차량 100,000대 주문
- 재생에너지 물류센터

### 5. Maersk - 탄소중립 해운
- 메탄올 연료 컨테이너선
- 2040년 탄소중립 목표

## 한국 선두기업

### CJ대한통운
- AI 포장 최적화
- 수소 화물 차량
- 테이프 프리 포장

### 쿠팡
- AI 물류 플랫폼
- 80,000명 고용
- 저배출 배송 인프라

## 미래 트렌드

1. ESG 통합
2. AI 수요 예측
3. 블록체인 투명성
4. 자율주행 기술

**그린물류는 이제 필수입니다.** 🌱`,
    category: '산업 동향',
    tags: ['그린물류', 'DHL', 'CJ대한통운', '쿠팡', '탄소중립', 'ESG'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    publishedAt: '2025-10-01T00:00:00Z'
  },
  {
    title: 'EU CBAM 완벽 대응 가이드 - 2026년 본격 시행 준비',
    slug: 'eu-cbam-complete-guide-2026',
    excerpt: 'EU 탄소국경조정제도(CBAM) 2026년 본격 시행에 대비한 물류 기업의 완벽 대응 전략을 제시합니다.',
    content: `# EU CBAM 완벽 대응 가이드

## CBAM이란?

EU 탄소국경조정제도는 탄소배출이 많은 수입 제품에 관세를 부과하는 제도입니다.

### 시행 일정
- 2023-2025: 전환기 (보고만)
- 2026년 1월: 본격 시행 (관세)

## 적용 대상

### 1단계 (2026)
1. 철강/강철
2. 알루미늄
3. 시멘트
4. 비료
5. 전력
6. 수소

### 2030년 확대
모든 제품으로 확대 예정

## 물류 기업 영향

- 화주사의 배출량 데이터 요구 증가
- 정확한 운송 배출량 측정 필수
- CDP 미제공 시 거래 제한

## 대응 전략

### 1. ISO 14083 기반 측정
GLEC Cloud로 자동 계산

### 2. 데이터 관리 체계
Scope 1, 2, 3 전체 측정

### 3. 친환경 운송 전환
전기/수소 트럭 도입

### 4. 정부 지원 활용
보조금 및 R&D 지원

### 5. ESG 거버넌스
이사회 수준의 관리

## GLEC 솔루션

- 자동 배출량 측정
- CBAM 형식 리포트
- 제3자 검증 지원

**지금 준비하지 않으면 2026년 EU 수출이 불가능합니다.** 🌍`,
    category: '규제 대응',
    tags: ['CBAM', 'EU', '탄소국경세', '규제', 'ISO14083'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
    publishedAt: '2025-09-30T00:00:00Z'
  },
  {
    title: 'ISO 14083 국제표준 완벽 가이드 (2025 최신판)',
    slug: 'iso-14083-complete-guide-2025',
    excerpt: 'ISO 14083:2023 물류 탄소배출 측정 국제표준의 모든 것. 적용 범위, 계산 방법론, 실무 적용 사례를 상세히 안내합니다.',
    content: `# ISO 14083 국제표준 완벽 가이드

## ISO 14083이란?

물류 및 운송 서비스의 온실가스 배출량을 정량화하고 보고하기 위한 국제표준입니다.

## 5대 핵심 원칙

### 1. 일관성 (Consistency)
동일한 방법론을 지속적으로 적용

### 2. 투명성 (Transparency)
모든 계산 근거와 데이터 출처 명확화

### 3. 정확성 (Accuracy)
실제 배출량을 정확히 반영

### 4. 완전성 (Completeness)
모든 관련 배출원 포함

### 5. 비교 가능성 (Comparability)
표준화된 방법으로 비교 가능

## 적용 범위

- 도로 운송 (트럭, 밴)
- 철도 운송
- 해상 운송 (컨테이너선)
- 항공 운송 (화물기)
- 복합 운송

## 계산 방법론

### 연료 기반
배출량 = 연료 소비량 × 배출계수

### 활동 기반
배출량 = 거리 × 무게 × 배출 집약도

## GLEC Framework

GLEC Framework는 ISO 14083의 기반이 된 실무 표준입니다.

GLEC Cloud는 ISO 14083을 100% 준수하며 자동 리포트를 생성합니다.

## 실무 체크리스트

- [ ] 측정 범위 정의
- [ ] 데이터 수집 시스템
- [ ] 배출계수 선택
- [ ] 계산 도구 선택
- [ ] 검증 프로세스
- [ ] 외부 인증 준비

**ISO 14083은 글로벌 물류의 새로운 표준입니다.** 📊`,
    category: '가이드',
    tags: ['ISO14083', '국제표준', 'GLEC Framework', '탄소측정', '방법론'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
    publishedAt: '2025-09-29T00:00:00Z'
  },
  {
    title: 'Scope 3 배출량 완벽 계산 가이드',
    slug: 'scope-3-emissions-calculation-guide',
    excerpt: 'GHG Protocol Scope 3의 Category 4, 9 (물류 운송) 배출량 계산 방법과 GLEC 자동화 솔루션을 상세히 설명합니다.',
    content: `# Scope 3 배출량 완벽 계산 가이드

## Scope 3이란?

가치사슬 전체의 간접 배출량 (15개 범주)

### 물류 관련 범주
- Category 4: Upstream Transportation
- Category 9: Downstream Transportation

## 중요성

- 전체 배출량의 70-90% 차지
- CDP A등급 필수 요건
- TCFD 공시 권고 사항

## 계산 방법 3가지

### 1. 연료 기반 (가장 정확)
배출량 = 연료량 × 배출계수

### 2. 거리 기반 (권장)
배출량 = 거리 × 무게 × 집약도

### 3. 지출 기반 (간단)
배출량 = 비용 × 집약도

## GLEC 자동화

### 1단계: 데이터 연동
ERP/TMS/WMS API 연동

### 2단계: 자동 계산
ISO 14083 기반

### 3단계: 리포트
CDP/TCFD/GRI 형식

### 4단계: 검증
제3자 검증 준비

## 실제 사례

전자제품 제조사 B사
- 도입 전: 월 80시간 소요
- 도입 후: 월 2시간 소요
- CDP: C등급 → A등급

**Scope 3 측정은 이제 필수입니다.** 📈`,
    category: '가이드',
    tags: ['Scope3', 'GHG Protocol', 'CDP', '배출량계산'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    publishedAt: '2025-09-28T00:00:00Z'
  },
  {
    title: 'CDP 공급망 프로그램 A등급 달성 전략',
    slug: 'cdp-supply-chain-a-rating-strategy',
    excerpt: 'CDP 공급망 프로그램에서 A등급을 받기 위한 단계별 전략과 GLEC이 제공하는 자동화 솔루션을 소개합니다.',
    content: `# CDP 공급망 프로그램 A등급 달성 전략

## CDP란?

글로벌 기업들이 공급사에게 탄소배출 정보를 요청하는 프로그램

- 참여 기업: 23,000개
- 요청받는 공급사: 37,000개
- 한국: 삼성, LG, 현대차, SK

## A등급의 가치

### 1. 거래 유지
A/B등급 공급사 우선 선정

### 2. 신규 거래
ESG 경쟁력 증명

### 3. 금융 혜택
ESG 대출 금리 우대 (0.5%p)

## 등급 체계

- **A (Leadership)**: 리더십
- **B (Management)**: 관리
- **C (Awareness)**: 인식
- **D (Disclosure)**: 공개

## A등급 체크리스트

### 거버넌스 (25점)
- [ ] 이사회 기후변화 책임
- [ ] 기후 인센티브 제도
- [ ] 연간 리스크 평가

### 배출량 (30점)
- [ ] Scope 1, 2, 3 측정
- [ ] ISO 14083 기반
- [ ] 제3자 검증

### 감축 목표 (25점)
- [ ] SBTi 승인 목표
- [ ] 절대량 감축
- [ ] Scope 3 포함

### 실적 (20점)
- [ ] 배출량 감소 실적
- [ ] 대응 전략 문서화
- [ ] 재생에너지 계획

## GLEC 솔루션

- Scope 3 자동 측정
- CDP 형식 리포트
- 검증 자료 자동화
- 감축 시나리오 분석

## 성공 사례

물류 C사: 2년 만에 D → A
- 신규 고객 3곳
- 매출 15% 증가

**CDP A등급으로 경쟁력을 확보하세요.** 🏆`,
    category: 'ESG 전략',
    tags: ['CDP', 'A등급', '공급망', 'ESG평가'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    publishedAt: '2025-09-27T00:00:00Z'
  },
  {
    title: 'DHL GoGreen Plus 파트너십 완벽 가이드',
    slug: 'dhl-gogreen-plus-partnership-guide',
    excerpt: 'DHL GoGreen Plus 서비스와 GLEC의 ISO 14083 측정 플랫폼을 연동하여 글로벌 물류 탄소중립을 달성하는 방법을 안내합니다.',
    content: `# DHL GoGreen Plus 파트너십 완벽 가이드

## 파트너십 개요

GLEC은 DHL 공식 GoGreen Plus 파트너로서 ISO 14083 기반 측정과 SAF 감축 솔루션을 제공합니다.

## DHL GoGreen Plus

### 1. Insetting (내부 감축)
- SAF (지속가능 항공유)
- 전기차 배송
- 재생에너지 창고

### 2. Offsetting (탄소상쇄)
- Gold Standard 인증 프로젝트

### 3. Reporting (리포팅)
- ISO 14083 기반
- CDP, TCFD 형식

## GLEC 역할

### 배출량 측정
DHL API → GLEC Platform → 자동 계산

### 감축 목표 관리
탄소중립 로드맵 최적화

### ESG 리포팅
CDP, TCFD, GRI 자동 생성

## 사용 사례

### 전자제품 제조사 A사
- 과제: 연 50,000건 국제배송
- 솔루션: GLEC + DHL 통합
- 결과:
  - 측정 자동화 (월 40시간 절약)
  - SAF로 20% 감축
  - CDP A등급 달성

## 시작하기

1. GLEC Cloud 가입
2. DHL 계정 연동
3. 자동 측정 시작

**DHL + GLEC로 글로벌 탄소중립을 달성하세요.** ✈️`,
    category: '파트너십',
    tags: ['DHL', 'GoGreen Plus', 'SAF', 'API연동'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800',
    publishedAt: '2025-09-26T00:00:00Z'
  },
  {
    title: '물류 ESG가 곧 경쟁력이다',
    slug: 'logistics-esg-competitive-advantage',
    excerpt: '왜 물류 산업에서 ESG 관리가 핵심 경쟁력이 되었는지, 글로벌 트렌드와 실제 사례를 통해 분석합니다.',
    content: `# 물류 ESG가 곧 경쟁력이다

## 물류가 ESG 핵심인 이유

### 1. 배출량 비중
제조업 Scope 3의 40-60%가 물류

### 2. 측정 가능성
명확한 데이터 (거리, 무게, 연료)

### 3. 감축 잠재력
운송 수단 전환으로 즉시 감축

## 글로벌 트렌드

### Amazon
2040년 탄소중립, 전기차 10만대

### IKEA
2025년 모든 배송 전기화

### Maersk
2040년 탄소중립 해운

### DHL
2030년 Last Mile 70% 전기차

## 국내 사례

### 삼성전자
물류 탄소 30% 감축 (2020-2023)

### CJ대한통운
2040년 탄소중립, 전기트럭 1,000대

### 쿠팡
AI 최적화, 전기차 확대

## 3단계 전략

### 1. 측정
ISO 14083 기반 GLEC Cloud

### 2. 감축
운송 수단 최적화, AI 경로

### 3. 상쇄
재생에너지, 탄소상쇄

## 규제 동향

- 한국: 2025년 K-TCFD
- EU: 2026년 CBAM
- 미국: SEC 기후 공시

## 비즈니스 가치

1. 리스크 관리
2. 비용 절감 (10-15%)
3. 브랜드 가치
4. 신규 매출

**물류 ESG는 선택이 아닌 필수입니다.** 💚`,
    category: 'ESG 전략',
    tags: ['ESG', '물류', '경쟁력', '탄소배출'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    publishedAt: '2025-09-25T00:00:00Z'
  },
  {
    title: '택배 한 상자의 탄소발자국',
    slug: 'delivery-box-carbon-footprint',
    excerpt: '우리가 주문한 택배 한 상자가 지구에 미치는 영향을 수치로 분석하고, 지속가능한 배송의 미래를 제시합니다.',
    content: `# 택배 한 상자의 탄소발자국

## 충격적인 통계

### 글로벌 배출
- 2024년: 374억 톤
- 에너지 부문: 86.9%

### 한국 배출
- 2022년: 7억 2,430만 톤
- 도로 운송: 다른 운송의 6배

## 택배 물량 폭발

- 2019년: 27만 9천 건
- 2022년: 42만 1천 건 (51% 증가)

## 배송 시스템 딜레마

### Hub and Spoke
- 장점: 빠른 배송
- 단점: 높은 배출량

### 개선 가능성
적재율 최대화로 탄소 감축

## 긍정적 변화

### GS25 사례
2022년 250톤 감축
- 기존 차량 공간 활용
- 추가 차량 없이 통합

## 2025년 전망

### 1. 주 5일 근무
배송 효율성 증가 필요

### 2. 공유 배송
여러 기업 통합 배송

### 3. 경계 흐림
물류-유통-제조 통합

## 실천 방안

### 소비자
- 느린 배송 선택
- 통합 배송 이용
- 불필요한 반품 최소화

### 기업
- 전기/수소 차량
- AI 경로 최적화
- 친환경 포장재
- GLEC Cloud 측정

## GLEC 솔루션

- 실시간 배출량 측정
- AI 최적화 제안
- 투명한 보고

**지구를 위한 작은 기다림이 가장 큰 선물입니다.** 📦💚`,
    category: '산업 동향',
    tags: ['택배', '탄소발자국', '지속가능배송', '그린물류'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
    publishedAt: '2025-09-24T00:00:00Z'
  }
];

async function addBlogs() {
  console.log('=== 추가 블로그 9개 생성 시작 ===\n');

  const adminUser = await sql`SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`;
  const authorId = adminUser[0]?.id || randomUUID();

  let successCount = 0;

  for (const blog of blogs) {
    try {
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

      successCount++;
      console.log(`  ✅ [${successCount}/${blogs.length}] ${blog.title}`);
    } catch (error) {
      console.error(`  ❌ 실패: ${blog.title} - ${error.message}`);
    }
  }

  console.log(`\n✅ 총 ${successCount}개 블로그 추가 완료`);
}

addBlogs().catch(console.error);
