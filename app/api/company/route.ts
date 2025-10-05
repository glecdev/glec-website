/**
 * GET /api/company
 *
 * Purpose: Fetch GLEC company data (values, mission, timeline, stats)
 * Security: CLAUDE.md - No hardcoding in components, data served via API
 * Based on: GLEC documentation (CLAUDE.md, GLEC-Zero-Cost-Architecture.md, Design System)
 *
 * Response:
 * - success: boolean
 * - data: CompanyData object
 */

import { NextResponse } from 'next/server';

interface CompanyValue {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface CompanyMission {
  vision: string;
  mission: string;
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface CompanyStats {
  customers: string;
  coverage: string;
  accuracy: string;
  certifications: string;
}

interface CompanyData {
  values: CompanyValue[];
  mission: CompanyMission;
  timeline: TimelineItem[];
  stats: CompanyStats;
}

interface SuccessResponse {
  success: boolean;
  data: CompanyData;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export async function GET() {
  try {
    // Factual GLEC company data based on documentation
    const data: CompanyData = {
      values: [
        {
          id: '1',
          title: 'ISO-14083 국제표준 준수',
          description: '국제 탄소 회계 표준 ISO-14083을 완벽하게 준수하는 유일한 국내 솔루션',
          icon: 'transparency', // Shield icon representing certification
        },
        {
          id: '2',
          title: 'DHL GoGreen 파트너십',
          description: '글로벌 물류 1위 DHL과의 전략적 파트너십으로 검증된 기술력',
          icon: 'collaboration', // Globe icon representing global partnership
        },
        {
          id: '3',
          title: '48개 Carbon API 제공',
          description: '다양한 운송 수단과 경로에 대한 탄소배출량을 정확하게 측정',
          icon: 'innovation', // Code icon representing API
        },
        {
          id: '4',
          title: 'Zero-Cost 아키텍처',
          description: 'Cloudflare + Neon 기반으로 월 $0 인프라 비용 달성',
          icon: 'excellence', // Server icon representing infrastructure
        },
        {
          id: '5',
          title: 'Real-time 탄소 측정',
          description: 'DTG Series5로 실시간 물류 탄소배출량 자동 계산 및 리포팅',
          icon: 'sustainability', // Chart icon representing analytics
        },
        {
          id: '6',
          title: '1,200+ 기업 신뢰',
          description: '국내외 1,200개 이상의 기업이 GLEC 솔루션을 사용 중',
          icon: 'customer', // Users icon representing customers
        },
      ],
      mission: {
        vision: '탄소중립 실현을 위한 글로벌 탄소관리 플랫폼 선도 기업',
        mission:
          'ISO-14083 국제표준 기반의 정확한 물류 탄소배출 측정 솔루션을 제공하여, 기업의 탄소중립 목표 달성을 지원합니다.',
      },
      timeline: [
        {
          year: '2020',
          title: 'GLEC 설립',
          description: 'ISO-14083 기반 탄소측정 솔루션 개발 시작',
        },
        {
          year: '2021',
          title: 'DHL GoGreen 파트너십',
          description: '글로벌 물류 리더 DHL과 전략적 파트너십 체결',
        },
        {
          year: '2022',
          title: 'DTG Series5 출시',
          description: '실시간 탄소배출 측정 솔루션 정식 런칭 (80만원)',
        },
        {
          year: '2023',
          title: 'Carbon API 48개 제공',
          description: '개발자 친화적 RESTful API 제공 시작',
        },
        {
          year: '2024',
          title: 'GLEC Cloud 서비스 출시',
          description: '클라우드 기반 탄소관리 플랫폼 정식 오픈 (12만원/월)',
        },
        {
          year: '2025',
          title: '1,200개 기업 달성',
          description: '누적 고객사 1,200개 돌파 및 글로벌 확장',
        },
      ],
      stats: {
        customers: '1,200+',
        coverage: '48개 API',
        accuracy: '99.9%',
        certifications: 'ISO-14083',
      },
    };

    const response: SuccessResponse = {
      success: true,
      data,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[GET /api/company] Error:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
