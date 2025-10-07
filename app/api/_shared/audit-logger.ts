/**
 * Audit Logger Middleware
 * 
 * Purpose: Track all admin actions (LOGIN, CREATE, UPDATE, DELETE)
 * Usage: Import and call logAudit() in API routes
 * 
 * Security:
 * - IP address is captured for security auditing
 * - Changes are stored as JSONB for flexibility
 * - User agent tracking for device identification
 */

import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export type AuditAction = 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogParams {
  userId: string;
  action: AuditAction;
  resource: string; // e.g., "notices", "events", "contacts", "demo_requests"
  resourceId?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  req: NextRequest;
}

/**
 * Extract IP address from request headers
 * Priority: x-forwarded-for > x-real-ip > remote address
 */
function extractIpAddress(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
    // Return the first one (client IP)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to localhost for development
  return '127.0.0.1';
}

/**
 * Extract user agent from request headers
 */
function extractUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'Unknown';
}

/**
 * Log an audit entry to the database
 * 
 * @throws Error if database write fails
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  const ipAddress = extractIpAddress(params.req);
  const userAgent = extractUserAgent(params.req);

  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        changes: params.changes ? JSON.parse(JSON.stringify(params.changes)) : null,
        ipAddress,
        userAgent,
      },
    });

    console.log(`[AUDIT] ${params.action} on ${params.resource} by user ${params.userId}`);
  } catch (error) {
    // Don't throw error to prevent audit logging from breaking the main request
    // But log the error for monitoring
    console.error('[AUDIT ERROR] Failed to log audit entry:', error);
  }
}

/**
 * Helper: Create audit log for LOGIN action
 */
export async function logLogin(userId: string, req: NextRequest): Promise<void> {
  await logAudit({
    userId,
    action: 'LOGIN',
    resource: 'auth',
    req,
  });
}

/**
 * Helper: Create audit log for CREATE action
 */
export async function logCreate(
  userId: string,
  resource: string,
  resourceId: string,
  data: any,
  req: NextRequest
): Promise<void> {
  await logAudit({
    userId,
    action: 'CREATE',
    resource,
    resourceId,
    changes: {
      after: data,
    },
    req,
  });
}

/**
 * Helper: Create audit log for UPDATE action
 */
export async function logUpdate(
  userId: string,
  resource: string,
  resourceId: string,
  before: any,
  after: any,
  req: NextRequest
): Promise<void> {
  await logAudit({
    userId,
    action: 'UPDATE',
    resource,
    resourceId,
    changes: {
      before,
      after,
    },
    req,
  });
}

/**
 * Helper: Create audit log for DELETE action
 */
export async function logDelete(
  userId: string,
  resource: string,
  resourceId: string,
  data: any,
  req: NextRequest
): Promise<void> {
  await logAudit({
    userId,
    action: 'DELETE',
    resource,
    resourceId,
    changes: {
      before: data,
    },
    req,
  });
}
