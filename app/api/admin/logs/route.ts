/**
 * GET /api/admin/logs
 *
 * Purpose: Retrieve audit logs with filtering, search, and pagination
 * Access: SUPER_ADMIN only
 *
 * Query Parameters:
 * - action: "LOGIN" | "CREATE" | "UPDATE" | "DELETE" | "ALL" (default: ALL)
 * - resource: "notices" | "events" | "contacts" | ... | "ALL" (default: ALL)
 * - user_id: UUID (optional)
 * - start_date: ISO 8601 (optional)
 * - end_date: ISO 8601 (optional)
 * - page: number (default: 1)
 * - per_page: number (default: 20, max: 100)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "uuid",
 *       "user": {
 *         "id": "uuid",
 *         "email": "admin@glec.io",
 *         "name": "Admin User"
 *       },
 *       "action": "UPDATE",
 *       "resource": "notices",
 *       "resourceId": "uuid",
 *       "changes": { "before": {...}, "after": {...} },
 *       "ipAddress": "192.168.1.0",
 *       "userAgent": "Mozilla/5.0...",
 *       "createdAt": "2025-01-07T14:32:15Z"
 *     }
 *   ],
 *   "meta": {
 *     "page": 1,
 *     "per_page": 20,
 *     "total_pages": 15,
 *     "total_count": 289
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

// Query parameter validation schema
const LogsQuerySchema = z.object({
  action: z.enum(['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'ALL']).optional().default('ALL'),
  resource: z.string().optional().default('ALL'),
  user_id: z.string().uuid().optional(),
  start_date: z.string().optional(), // ISO 8601
  end_date: z.string().optional(), // ISO 8601
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
});

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

interface AuditLogResponse {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  action: string;
  resource: string;
  resourceId: string | null;
  changes: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface SuccessResponse {
  success: true;
  data: AuditLogResponse[];
  meta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired JWT token.',
        },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // 2. Check if user is SUPER_ADMIN
    if (decodedToken.role !== 'SUPER_ADMIN') {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only SUPER_ADMIN can access audit logs',
        },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      action: searchParams.get('action'),
      resource: searchParams.get('resource'),
      user_id: searchParams.get('user_id'),
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
    };

    const validationResult = LogsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { action, resource, user_id, start_date, end_date, page, per_page } = validationResult.data;

    // 4. Build filter conditions
    const where: any = {};

    if (action !== 'ALL') {
      where.action = action;
    }

    if (resource !== 'ALL') {
      where.resource = resource;
    }

    if (user_id) {
      where.userId = user_id;
    }

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) {
        where.createdAt.gte = new Date(start_date);
      }
      if (end_date) {
        where.createdAt.lte = new Date(end_date);
      }
    }

    // 5. Query audit logs with pagination
    const skip = (page - 1) * per_page;

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: per_page,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // 6. Format response
    const formattedLogs: AuditLogResponse[] = logs.map((log) => ({
      id: log.id,
      user: {
        id: log.user.id,
        email: log.user.email,
        name: log.user.name,
      },
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      changes: log.changes,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
    }));

    const totalPages = Math.ceil(totalCount / per_page);

    const response: SuccessResponse = {
      success: true,
      data: formattedLogs,
      meta: {
        page,
        per_page,
        total_pages: totalPages,
        total_count: totalCount,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/logs] Error:', error);

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
