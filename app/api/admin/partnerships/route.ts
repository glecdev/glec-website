/**
 * Admin Partnerships API
 *
 * GET /api/admin/partnerships - List all partnership submissions
 * Requires authentication (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyAdminAuth } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: authResult.error || 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
    const status = searchParams.get('status'); // NEW, IN_PROGRESS, ACCEPTED, REJECTED
    const search = searchParams.get('search');

    // Validate page
    if (page < 1 || isNaN(page)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAGE',
            message: 'Page number must be >= 1',
          },
        },
        { status: 400 }
      );
    }

    // Build WHERE clause
    const conditions: string[] = [];

    if (status && ['NEW', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED'].includes(status)) {
      conditions.push(`status = '${status}'::"PartnershipStatus"`);
    }

    if (search) {
      const escapedSearch = search.replace(/'/g, "''");
      conditions.push(`(company_name ILIKE '%${escapedSearch}%' OR contact_name ILIKE '%${escapedSearch}%' OR email ILIKE '%${escapedSearch}%')`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countResult = await sql`
      SELECT COUNT(*)::int as total
      FROM partnerships
      ${sql.unsafe(whereClause)}
    `;

    const total = countResult && countResult.length > 0 && countResult[0]?.total != null
      ? parseInt(String(countResult[0].total))
      : 0;

    // Fetch data with pagination
    const offset = (page - 1) * per_page;

    const partnerships = await sql`
      SELECT * FROM partnerships
      ${sql.unsafe(whereClause)}
      ORDER BY
        CASE status
          WHEN 'NEW' THEN 1
          WHEN 'IN_PROGRESS' THEN 2
          WHEN 'ACCEPTED' THEN 3
          WHEN 'REJECTED' THEN 4
        END,
        created_at DESC
      LIMIT ${per_page} OFFSET ${offset}
    `;

    // Transform to camelCase
    const transformedData = partnerships.map((p: any) => ({
      id: p.id,
      companyName: p.company_name,
      contactName: p.contact_name,
      email: p.email,
      partnershipType: p.partnership_type,
      proposal: p.proposal,
      status: p.status,
      adminNotes: p.admin_notes,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: {
        page,
        perPage: per_page,
        total,
        totalPages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/partnerships] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
