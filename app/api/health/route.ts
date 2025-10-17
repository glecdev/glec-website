/**
 * GET /api/health
 *
 * Production Health Check Endpoint
 *
 * Returns:
 * - System status
 * - Database connectivity
 * - Environment configuration
 * - Uptime
 *
 * Used by:
 * - Monitoring systems
 * - Load balancers
 * - Status pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const startTime = Date.now();

export async function GET(req: NextRequest) {
  const checkStart = Date.now();

  try {
    // 1. Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      CRON_SECRET: !!process.env.CRON_SECRET,
      RESEND_WEBHOOK_SECRET: !!process.env.RESEND_WEBHOOK_SECRET,
      ADMIN_NOTIFICATION_EMAIL: !!process.env.ADMIN_NOTIFICATION_EMAIL,
    };

    const envHealthy = Object.values(envCheck).every(v => v === true);

    // 2. Check database connectivity
    let dbHealthy = false;
    let dbLatency = 0;
    let dbError = null;

    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);
      const dbStart = Date.now();

      try {
        await sql`SELECT 1 as health_check`;
        dbLatency = Date.now() - dbStart;
        dbHealthy = true;
      } catch (error) {
        dbError = error instanceof Error ? error.message : 'Unknown database error';
      }
    }

    // 3. Calculate uptime
    const uptimeMs = Date.now() - startTime;
    const uptimeSeconds = Math.floor(uptimeMs / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);

    // 4. Overall health status
    const healthy = envHealthy && dbHealthy;
    const status = healthy ? 'healthy' : 'degraded';
    const httpStatus = healthy ? 200 : 503;

    // 5. Response time
    const responseTime = Date.now() - checkStart;

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        uptime: {
          ms: uptimeMs,
          seconds: uptimeSeconds,
          minutes: uptimeMinutes,
          hours: uptimeHours,
          human: `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`,
        },
        checks: {
          environment: {
            status: envHealthy ? 'pass' : 'fail',
            variables: envCheck,
          },
          database: {
            status: dbHealthy ? 'pass' : 'fail',
            latency: dbLatency,
            error: dbError,
          },
        },
        performance: {
          responseTime,
        },
        version: {
          api: '1.0.0',
          node: process.version,
          platform: process.platform,
        },
      },
      { status: httpStatus }
    );
  } catch (error) {
    const responseTime = Date.now() - checkStart;

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        performance: {
          responseTime,
        },
      },
      { status: 500 }
    );
  }
}
