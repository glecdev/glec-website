/**
 * GET /api/debug/cron-secret
 *
 * Debug endpoint to inspect CRON_SECRET environment variable
 * Shows raw value, length, and hex representation
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || '';

  return NextResponse.json({
    exists: !!cronSecret,
    length: cronSecret.length,
    raw: cronSecret,
    trimmed: cronSecret.trim(),
    trimmed_length: cronSecret.trim().length,
    with_quotes_removed: cronSecret.trim().replace(/^["']|["']$/g, ''),
    final_length: cronSecret.trim().replace(/^["']|["']$/g, '').length,
    hex: Buffer.from(cronSecret).toString('hex'),
    chars: cronSecret.split('').map((c, i) => ({ i, char: c, code: c.charCodeAt(0), hex: c.charCodeAt(0).toString(16) })),
  });
}
