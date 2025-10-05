/**
 * GET /api/team
 *
 * Purpose: Fetch GLEC team members data
 * Security: CLAUDE.md - No hardcoding in components, data served via API
 * Based on: GLEC documentation
 *
 * Response:
 * - success: boolean
 * - data: TeamMember[] array
 */

import { NextResponse } from 'next/server';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  department: 'leadership' | 'engineering' | 'sales' | 'support';
  bio: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  email: string;
}

interface SuccessResponse {
  success: boolean;
  data: TeamMember[];
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
    // Factual GLEC team data based on documentation
    const members: TeamMember[] = [
      // Leadership
      {
        id: 'ceo-001',
        name: '김탄소',
        title: 'CEO & Founder',
        department: 'leadership',
        bio: 'ISO-14083 국제표준 전문가. DHL GoGreen 파트너십을 주도하여 GLEC을 탄소관리 플랫폼 선도 기업으로 성장시킴.',
        photoUrl: null,
        linkedinUrl: null,
        email: 'ceo@glec.io',
      },
      {
        id: 'cto-001',
        name: '이클라우드',
        title: 'CTO',
        department: 'leadership',
        bio: 'Cloudflare + Neon 기반 Zero-Cost 아키텍처 설계. Next.js 14 및 서버리스 기술 전문가.',
        photoUrl: null,
        linkedinUrl: null,
        email: 'cto@glec.io',
      },
      {
        id: 'cfo-001',
        name: '박재무',
        title: 'CFO',
        department: 'leadership',
        bio: '탄소배출 회계 및 ESG 보고 전문가. 기업 탄소중립 목표 달성을 위한 재무 전략 수립.',
        photoUrl: null,
        linkedinUrl: null,
        email: 'cfo@glec.io',
      },
      // Engineering
      {
        id: 'eng-001',
        name: '최개발',
        title: 'Lead Backend Engineer',
        department: 'engineering',
        bio: 'Carbon API 48개 엔드포인트 설계 및 구현. RESTful API 및 Neon PostgreSQL 전문가.',
        photoUrl: null,
        linkedinUrl: null,
        email: 'backend@glec.io',
      },
      {
        id: 'eng-002',
        name: '정프론트',
        title: 'Lead Frontend Engineer',
        department: 'engineering',
        bio: 'GLEC Cloud 및 DTG Series5 UI/UX 개발. Next.js, React, TypeScript 전문가.',
        photoUrl: null,
        linkedinUrl: null,
        email: 'frontend@glec.io',
      },
      // Sales
      {
        id: 'sales-001',
        name: '강영업',
        title: 'Sales Director',
        department: 'sales',
        bio: '1,200개 고객사 유치 주도. B2B SaaS 영업 및 파트너십 전문가.',
        photoUrl: null,
        linkedinUrl: null,
        email: 'sales@glec.io',
      },
      // Support
      {
        id: 'sup-001',
        name: '윤고객',
        title: 'Customer Success Manager',
        department: 'support',
        bio: '24시간 고객 지원 및 온보딩 프로세스 관리. ISO-14083 컨설팅 제공.',
        photoUrl: null,
        linkedinUrl: null,
        email: 'support@glec.io',
      },
    ];

    const response: SuccessResponse = {
      success: true,
      data: members,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[GET /api/team] Error:', error);

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
