/**
 * GET /api/partners
 *
 * Purpose: Fetch GLEC partners data
 * Security: CLAUDE.md - No hardcoding in components, data served via API
 * Based on: GLEC documentation (GLEC-Zero-Cost-Architecture.md)
 *
 * Response:
 * - success: boolean
 * - data: Partner[] array
 */

import { NextResponse } from 'next/server';

interface Partner {
  id: string;
  name: string;
  type: 'technology' | 'channel' | 'strategic' | 'ecosystem';
  description: string;
  logoUrl: string | null;
  websiteUrl: string;
}

interface SuccessResponse {
  success: boolean;
  data: Partner[];
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
    // Factual GLEC partners data based on documentation
    const allPartners: Partner[] = [
      // Technology Partners
      {
        id: 'cloudflare-001',
        name: 'Cloudflare',
        type: 'technology',
        description:
          'Cloudflare Workers 및 R2 스토리지를 활용한 Zero-Cost 인프라 구축',
        logoUrl: null,
        websiteUrl: 'https://www.cloudflare.com',
      },
      {
        id: 'neon-001',
        name: 'Neon Database',
        type: 'technology',
        description:
          'Serverless PostgreSQL 데이터베이스로 탄소배출 데이터 실시간 저장',
        logoUrl: null,
        websiteUrl: 'https://neon.tech',
      },
      {
        id: 'vercel-001',
        name: 'Vercel',
        type: 'technology',
        description:
          'Next.js 14 기반 프론트엔드 배포 및 Edge Functions 활용',
        logoUrl: null,
        websiteUrl: 'https://vercel.com',
      },
      {
        id: 'resend-001',
        name: 'Resend',
        type: 'technology',
        description: '고객 알림 및 리포트 이메일 발송 서비스 (3,000/month)',
        logoUrl: null,
        websiteUrl: 'https://resend.com',
      },
    ];

    const response: SuccessResponse = {
      success: true,
      data: allPartners,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('[GET /api/partners] Error:', error);

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
