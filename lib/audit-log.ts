/**
 * Audit Log Helper
 *
 * Purpose: Create audit log entries for admin actions
 * Based on: GLEC-API-Specification.yaml (Audit Logs section)
 *
 * Usage:
 * ```typescript
 * import { createAuditLog } from '@/lib/audit-log';
 *
 * await createAuditLog({
 *   userId: user.id,
 *   action: 'CREATE',
 *   resource: 'notices',
 *   resourceId: notice.id,
 *   changes: { after: notice },
 *   ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
 *   userAgent: request.headers.get('user-agent') || 'Unknown',
 * });
 * ```
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditAction = 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE';

export interface CreateAuditLogParams {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  changes?: any;
  ipAddress: string;
  userAgent: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        changes: params.changes || null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    console.log(`[AUDIT] ${params.action} on ${params.resource} by user ${params.userId}`);
  } catch (error) {
    // Log error but don't throw - audit log failure shouldn't block main operation
    console.error('[AUDIT LOG ERROR]', error);
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return '127.0.0.1';
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'Unknown';
}

/**
 * Create audit log for CREATE action
 */
export async function auditCreate(
  userId: string,
  resource: string,
  resourceId: string,
  data: any,
  request: Request
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'CREATE',
    resource,
    resourceId,
    changes: { after: data },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });
}

/**
 * Create audit log for UPDATE action
 */
export async function auditUpdate(
  userId: string,
  resource: string,
  resourceId: string,
  before: any,
  after: any,
  request: Request
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'UPDATE',
    resource,
    resourceId,
    changes: { before, after },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });
}

/**
 * Create audit log for DELETE action
 */
export async function auditDelete(
  userId: string,
  resource: string,
  resourceId: string,
  data: any,
  request: Request
): Promise<void> {
  await createAuditLog({
    userId,
    action: 'DELETE',
    resource,
    resourceId,
    changes: { before: data },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });
}
