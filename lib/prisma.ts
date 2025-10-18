/**
 * Prisma Client Singleton Instance
 *
 * Purpose: Prevent multiple Prisma Client instances in development (hot reload)
 * and avoid "too many connections" errors in production serverless environments.
 *
 * Benefits:
 * - Single connection pool shared across all API routes
 * - Prevents connection exhaustion (Neon free tier: 100 connections max)
 * - Better performance in serverless (Vercel, Cloudflare Workers)
 *
 * Reference: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown helper
 *
 * Usage: Call in process exit handlers to ensure clean disconnection
 *
 * @example
 * process.on('SIGTERM', async () => {
 *   await disconnectPrisma();
 *   process.exit(0);
 * });
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Connection health check
 *
 * Usage: Call in health check endpoints to verify database connectivity
 *
 * @returns {Promise<boolean>} true if database is reachable
 *
 * @example
 * export async function GET() {
 *   const isHealthy = await checkPrismaConnection();
 *   return NextResponse.json({ database: isHealthy ? 'connected' : 'disconnected' });
 * }
 */
export async function checkPrismaConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[Prisma Health Check] Database connection failed:', error);
    return false;
  }
}

/**
 * Get connection pool statistics
 *
 * Usage: Monitor connection pool usage in production
 *
 * @returns {Promise<object>} Connection pool metrics
 *
 * @example
 * const stats = await getPrismaConnectionStats();
 * console.log(`Active connections: ${stats.activeConnections}`);
 */
export async function getPrismaConnectionStats(): Promise<{
  activeConnections: number;
  maxConnections: number;
}> {
  try {
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
      AND state = 'active';
    `;

    const maxResult = await prisma.$queryRaw<Array<{ max_conn: number }>>`
      SHOW max_connections;
    `;

    return {
      activeConnections: Number(result[0].count),
      maxConnections: maxResult[0].max_conn,
    };
  } catch (error) {
    console.error('[Prisma Stats] Failed to retrieve connection stats:', error);
    return { activeConnections: 0, maxConnections: 0 };
  }
}

/**
 * Type exports for convenience
 */
export type { EmailTemplate, AutomationRule, EmailSend } from '@prisma/client';

export default prisma;
