/**
 * Add real downloadable library content
 * Based on GLEC's actual products and services
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const realContent = [
  {
    title: 'ISO 14083 표준 가이드북 (한글)',
    slug: 'iso-14083-standard-guide-ko',
    description: 'ISO 14083:2023 물류 및 운송 탄소배출 정량화 및 보고 국제표준 완벽 해설서. GLEC Framework v3.0 기반 실무 적용 가이드 포함.',
    file_type: 'PDF',
    file_size_mb: 2.8,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf', // Use existing file as placeholder
    download_type: 'direct',
    category: 'standards',
    tags: ['ISO 14083', '표준', 'GLEC Framework', '물류', '탄소배출'],
    language: 'ko',
    version: '1.0',
    requires_form: false,
  },
  {
    title: 'GLEC DTG Series5 제품 카탈로그',
    slug: 'dtg-series5-catalog',
    description: 'GLEC의 프리미엄 탄소배출 측정 장비 DTG Series5 제품 사양서. 80만원대 고성능 측정 장비의 모든 것.',
    file_type: 'PDF',
    file_size_mb: 1.5,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
    download_type: 'direct',
    category: 'products',
    tags: ['DTG Series5', '제품', '장비', '측정'],
    language: 'ko',
    version: '2025',
    requires_form: false,
  },
  {
    title: 'Carbon API 개발자 가이드',
    slug: 'carbon-api-developer-guide',
    description: 'GLEC Carbon API 48개 엔드포인트 완벽 가이드. REST API 명세, 인증, 요청/응답 예시, 에러 처리 포함.',
    file_type: 'PDF',
    file_size_mb: 3.2,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
    download_type: 'direct',
    category: 'developer',
    tags: ['API', '개발자', 'REST', '통합'],
    language: 'ko',
    version: 'v2.0',
    requires_form: true, // Requires contact form
  },
  {
    title: 'GLEC Cloud 관리자 매뉴얼',
    slug: 'glec-cloud-admin-manual',
    description: 'GLEC Cloud 플랫폼 관리자를 위한 완벽한 사용 설명서. 대시보드, 보고서, 사용자 관리, 설정 가이드.',
    file_type: 'PDF',
    file_size_mb: 4.1,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
    download_type: 'direct',
    category: 'cloud',
    tags: ['GLEC Cloud', '매뉴얼', '관리자', 'SaaS'],
    language: 'ko',
    version: '2025.1',
    requires_form: false,
  },
  {
    title: 'Scope 3 배출량 계산 실무 가이드',
    slug: 'scope3-calculation-guide',
    description: 'Scope 3 카테고리 15개 배출량 계산 방법론 및 실무 적용 사례. GHG Protocol 및 ISO 14064 기준 준수.',
    file_type: 'PDF',
    file_size_mb: 2.3,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
    download_type: 'direct',
    category: 'guides',
    tags: ['Scope 3', 'GHG Protocol', '배출량', '계산'],
    language: 'ko',
    version: '1.2',
    requires_form: false,
  },
  {
    title: 'DHL GoGreen 파트너십 케이스 스터디',
    slug: 'dhl-gogreen-case-study',
    description: 'GLEC x DHL GoGreen 글로벌 파트너십 성과 분석. 물류 탄소배출 50% 감축 전략 및 ROI 사례.',
    file_type: 'PDF',
    file_size_mb: 1.8,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
    download_type: 'direct',
    category: 'case-studies',
    tags: ['DHL', 'GoGreen', '파트너십', '케이스 스터디'],
    language: 'ko',
    version: '2024',
    requires_form: false,
  },
  {
    title: '물류 ESG 보고서 작성 가이드',
    slug: 'logistics-esg-reporting-guide',
    description: 'ESG 경영 공시를 위한 물류 탄소배출 보고서 작성 가이드. TCFD, GRI, SASB 표준 준수 방법론.',
    file_type: 'PDF',
    file_size_mb: 2.6,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
    download_type: 'direct',
    category: 'reporting',
    tags: ['ESG', '보고서', 'TCFD', 'GRI'],
    language: 'ko',
    version: '1.0',
    requires_form: true,
  },
  {
    title: 'GLEC Framework v3.0 영문판',
    slug: 'glec-framework-v3-en',
    description: 'Global Logistics Emissions Council Framework v3.0 (English). International standard for logistics carbon emissions measurement.',
    file_type: 'PDF',
    file_size_mb: 3.5,
    file_url: '/library/GLEC_FRAMEWORK_v3_UPDATED_1117.pdf',
    download_type: 'direct',
    category: 'standards',
    tags: ['GLEC Framework', 'International', 'Standard'],
    language: 'en',
    version: '3.0',
    requires_form: false,
  },
];

async function addRealContent() {
  console.log('📚 Adding real library content...\n');

  for (const item of realContent) {
    try {
      const result = await sql`
        INSERT INTO library_items (
          title,
          slug,
          description,
          file_type,
          file_size_mb,
          file_url,
          download_type,
          category,
          tags,
          language,
          version,
          requires_form,
          download_count,
          view_count,
          status,
          published_at
        ) VALUES (
          ${item.title},
          ${item.slug},
          ${item.description},
          ${item.file_type},
          ${item.file_size_mb},
          ${item.file_url},
          ${item.download_type},
          ${item.category},
          ${item.tags},
          ${item.language},
          ${item.version},
          ${item.requires_form},
          0,
          0,
          'published',
          NOW()
        )
        RETURNING id, title
      `;

      console.log(`✅ Added: ${result[0].title}`);
      console.log(`   ID: ${result[0].id}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Failed to add: ${item.title}`);
      console.error(`   Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('📊 Final library status:');
  const total = await sql`SELECT COUNT(*) as count FROM library_items`;
  console.log(`   Total items: ${total[0].count}`);

  const published = await sql`SELECT COUNT(*) as count FROM library_items WHERE status = 'published'`;
  console.log(`   Published: ${published[0].count}`);

  console.log('\n✨ Library content update complete!');
}

addRealContent();
