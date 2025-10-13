/**
 * Admin Partnership Detail API
 *
 * GET /api/admin/partnerships/[id] - Get single partnership
 * PUT /api/admin/partnerships/[id] - Update partnership status/notes
 * Requires authentication (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyAdminAuth } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = context.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid partnership ID format',
          },
        },
        { status: 400 }
      );
    }

    // Fetch partnership by ID
    const result = await sql`
      SELECT * FROM partnerships
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Partnership not found',
          },
        },
        { status: 404 }
      );
    }

    const partnership = result[0];

    // Transform to camelCase
    const transformedData = {
      id: partnership.id,
      companyName: partnership.company_name,
      contactName: partnership.contact_name,
      email: partnership.email,
      partnershipType: partnership.partnership_type,
      proposal: partnership.proposal,
      status: partnership.status,
      adminNotes: partnership.admin_notes,
      createdAt: partnership.created_at,
      updatedAt: partnership.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('[GET /api/admin/partnerships/[id]] Error:', error);
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

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = context.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: 'Invalid partnership ID format',
          },
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, adminNotes } = body;

    // Validate status
    const validStatuses = ['NEW', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Status must be one of: NEW, IN_PROGRESS, ACCEPTED, REJECTED',
          },
        },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}::"PartnershipStatus"`);
      params.push(status);
      paramIndex++;
    }

    if (adminNotes !== undefined) {
      updates.push(`admin_notes = $${paramIndex}`);
      params.push(adminNotes);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update',
          },
        },
        { status: 400 }
      );
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    // Add ID parameter
    params.push(id);

    // Execute update
    const query = `
      UPDATE partnerships
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.unsafe(query, params);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Partnership not found',
          },
        },
        { status: 404 }
      );
    }

    const partnership = result[0];

    // Transform to camelCase
    const transformedData = {
      id: partnership.id,
      companyName: partnership.company_name,
      contactName: partnership.contact_name,
      email: partnership.email,
      partnershipType: partnership.partnership_type,
      proposal: partnership.proposal,
      status: partnership.status,
      adminNotes: partnership.admin_notes,
      createdAt: partnership.created_at,
      updatedAt: partnership.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('[PUT /api/admin/partnerships/[id]] Error:', error);
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
