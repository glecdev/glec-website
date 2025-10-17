/**
 * GET /api/admin/email-template-categories
 *
 * Fetch all email template categories
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const categories = await sql`
      SELECT * FROM email_template_categories
      ORDER BY
        CASE
          WHEN is_content_specific = FALSE THEN 0
          ELSE 1
        END,
        category_name ASC
    `;

    return NextResponse.json({
      success: true,
      data: categories,
      meta: {
        total: categories.length,
      },
    });
  } catch (error) {
    console.error('[Admin] Email template categories list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch categories',
        },
      },
      { status: 500 }
    );
  }
}
