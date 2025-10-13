/**
 * GET /api/admin/partnerships/stats
 *
 * Purpose: Get partnership statistics for insights dashboard
 * Security: JWT authentication, SUPER_ADMIN and CONTENT_MANAGER roles only
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "total": 150,
 *     "byStatus": { "NEW": 50, "IN_PROGRESS": 30, "ACCEPTED": 60, "REJECTED": 10 },
 *     "byType": { "tech": 80, "reseller": 40, "consulting": 20, "other": 10 },
 *     "recentSubmissions": [{ id, companyName, status, createdAt }],
 *     "trend": { "thisMonth": 20, "lastMonth": 15, "growth": 33.3 }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface StatsResponse {
  success: true;
  data: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentSubmissions: Array<{
      id: string;
      companyName: string;
      status: string;
      createdAt: string;
    }>;
    trend: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check role permission
    if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'CONTENT_MANAGER') {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Calculate date ranges
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get total count
    const total = await prisma.partnership.count();

    // Get count by status
    const statusGroups = await prisma.partnership.groupBy({
      by: ['status'],
      _count: true,
    });

    const byStatus: Record<string, number> = {};
    statusGroups.forEach((group) => {
      byStatus[group.status] = group._count;
    });

    // Get count by type
    const typeGroups = await prisma.partnership.groupBy({
      by: ['partnershipType'],
      _count: true,
    });

    const byType: Record<string, number> = {};
    typeGroups.forEach((group) => {
      byType[group.partnershipType] = group._count;
    });

    // Get recent submissions (last 10)
    const recentPartnerships = await prisma.partnership.findMany({
      select: {
        id: true,
        companyName: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const recentSubmissions = recentPartnerships.map((p) => ({
      id: p.id,
      companyName: p.companyName,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
    }));

    // Calculate trend (this month vs last month)
    const thisMonthCount = await prisma.partnership.count({
      where: {
        createdAt: {
          gte: startOfThisMonth,
        },
      },
    });

    const lastMonthCount = await prisma.partnership.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const growth = lastMonthCount === 0
      ? (thisMonthCount > 0 ? 100 : 0)
      : ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;

    // Success response
    const response: StatsResponse = {
      success: true,
      data: {
        total,
        byStatus,
        byType,
        recentSubmissions,
        trend: {
          thisMonth: thisMonthCount,
          lastMonth: lastMonthCount,
          growth: Math.round(growth * 10) / 10, // Round to 1 decimal place
        },
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/partnerships/stats] Error:', error);

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
