/**
 * Admin Audit Logs API - Read-only (Neon PostgreSQL)
 *
 * Purpose: 관리자 활동 로그 조회 (읽기 전용)
 * Security: SUPER_ADMIN 권한 필요
 * Data Source: Neon PostgreSQL (audit_logs table)
 *
 * Endpoints:
 * - GET /api/admin/audit-logs - 로그 이력 조회
 *
 * Note: Audit logs are automatically created by other APIs.
 * This API is read-only for security auditing purposes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';
import type { AuditAction } from '@prisma/client';

const sql = neon(process.env.DATABASE_URL!);

// ============================================
// GET - List audit logs (read-only)
// ============================================
/**
 * GET /api/admin/audit-logs
 *
 * Query Parameters:
 * - page (default: 1)
 * - per_page (default: 50, max: 200)
 * - user_id (optional) - Filter by user
 * - action (optional) - LOGIN, CREATE, UPDATE, DELETE
 * - resource (optional) - notices, events, contacts, etc.
 * - start_date (optional) - ISO 8601 datetime
 * - end_date (optional) - ISO 8601 datetime
 *
 * Response: { success: true, data: AuditLog[], meta: PaginationMeta }
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '50', 10), 200);
      const user_id = searchParams.get('user_id');
      const action = searchParams.get('action') as AuditAction | null;
      const resource = searchParams.get('resource');
      const start_date = searchParams.get('start_date');
      const end_date = searchParams.get('end_date');

      if (page < 1 || isNaN(page)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PAGE', message: 'Page number must be >= 1' } },
          { status: 400 }
        );
      }

      // Build WHERE clause dynamically
      const conditions: any[] = [sql`1=1`]; // Always true base condition

      if (user_id) {
        conditions.push(sql`al.user_id = ${user_id}`);
      }
      if (action) {
        conditions.push(sql`al.action = ${action}`);
      }
      if (resource) {
        conditions.push(sql`al.resource = ${resource}`);
      }
      if (start_date) {
        conditions.push(sql`al.created_at >= ${start_date}`);
      }
      if (end_date) {
        conditions.push(sql`al.created_at <= ${end_date}`);
      }

      // Count total
      const countResult = await sql`
        SELECT COUNT(*) as total
        FROM audit_logs al
        WHERE ${sql.join(conditions, sql` AND `)}
      `;
      const total = parseInt(countResult[0]?.total || '0', 10);

      // Fetch logs with user details (JOIN)
      const offset = (page - 1) * per_page;
      const logs = await sql`
        SELECT
          al.id, al.action, al.resource, al.resource_id,
          al.changes, al.ip_address, al.user_agent, al.created_at,
          u.id as user_id, u.name as user_name, u.email as user_email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE ${sql.join(conditions, sql` AND `)}
        ORDER BY al.created_at DESC
        LIMIT ${per_page}
        OFFSET ${offset}
      `;

      // Transform to camelCase
      const transformedLogs = logs.map((log: any) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resource_id,
        changes: log.changes,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at,
        user: {
          id: log.user_id,
          name: log.user_name,
          email: log.user_email,
        },
      }));

      return NextResponse.json({
        success: true,
        data: transformedLogs,
        meta: {
          page,
          perPage: per_page,
          total,
          totalPages: Math.ceil(total / per_page),
        },
      });
    } catch (error) {
      console.error('[GET /api/admin/audit-logs] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'SUPER_ADMIN' } // Only SUPER_ADMIN can view audit logs
);
