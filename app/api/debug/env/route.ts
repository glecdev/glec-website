/**
 * GET /api/debug/env
 *
 * Debug endpoint to inspect environment variables
 * ONLY enabled in development
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const cronSecret = process.env.CRON_SECRET;
  const resendSecret = process.env.RESEND_WEBHOOK_SECRET;

  return NextResponse.json({
    CRON_SECRET: {
      exists: !!cronSecret,
      length: cronSecret?.length,
      raw: cronSecret,
      trimmed: cronSecret?.trim(),
      trimmed_length: cronSecret?.trim().length,
      hex: cronSecret ? Buffer.from(cronSecret).toString('hex') : null,
      trimmed_hex: cronSecret ? Buffer.from(cronSecret.trim()).toString('hex') : null,
    },
    RESEND_WEBHOOK_SECRET: {
      exists: !!resendSecret,
      length: resendSecret?.length,
      raw: resendSecret,
      trimmed: resendSecret?.trim(),
      trimmed_length: resendSecret?.trim().length,
    },
  });
}
