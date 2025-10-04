/**
 * Admin API: GET /api/admin/demo-requests
 *
 * Purpose: List all demo request submissions
 * Authentication: Required (JWT)
 * Authorization: CONTENT_MANAGER or higher
 */

import { neon } from '@neondatabase/serverless';

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(DATABASE_URL);

// Error response helper
function errorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: status === 401 ? 'UNAUTHORIZED' : 'ERROR',
        message,
      },
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Success response helper
function successResponse(data: any, meta?: any) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...(meta && { meta }),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Main handler
export async function onRequestGet(context: {
  request: Request;
  env: {
    DATABASE_URL: string;
  };
}) {
  try {
    // TODO: Authentication check
    // const authHeader = context.request.headers.get('Authorization');
    // if (!authHeader) {
    //   return errorResponse('Authentication required', 401);
    // }

    // Parse query parameters
    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('per_page') || '20', 10);
    const status = url.searchParams.get('status') || '';
    const product = url.searchParams.get('product') || '';

    // Validate pagination
    if (page < 1 || perPage < 1 || perPage > 100) {
      return errorResponse('Invalid pagination parameters');
    }

    // Build query conditions
    const conditions = ['1=1']; // Always true base condition
    const params: any[] = [];

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (product) {
      conditions.push(`preferred_product = $${params.length + 1}`);
      params.push(product);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (page - 1) * perPage;

    // Count total records
    const countQuery = `SELECT COUNT(*) as total FROM demo_requests WHERE ${whereClause}`;
    const countResult = await sql(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Fetch paginated data
    const dataQuery = `
      SELECT
        id,
        company_name,
        contact_name,
        email,
        phone,
        preferred_date,
        preferred_product,
        message,
        status,
        assigned_to,
        notes,
        created_at,
        updated_at
      FROM demo_requests
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const data = await sql(dataQuery, [...params, perPage, offset]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / perPage);

    return successResponse(data, {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
      has_prev: page > 1,
      has_next: page < totalPages,
    });
  } catch (error) {
    console.error('Admin demo requests error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// PATCH handler for updating demo request status
export async function onRequestPatch(context: {
  request: Request;
  env: {
    DATABASE_URL: string;
  };
}) {
  try {
    // TODO: Authentication check
    // const authHeader = context.request.headers.get('Authorization');
    // if (!authHeader) {
    //   return errorResponse('Authentication required', 401);
    // }

    // Get ID from URL path
    const url = new URL(context.request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return errorResponse('Demo request ID is required');
    }

    // Parse request body
    const body = await context.request.json();
    const { status, assigned_to, notes } = body;

    // Validate status
    const validStatuses = ['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return errorResponse('Invalid status value');
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${params.length + 1}`);
      params.push(assigned_to);
    }

    if (notes !== undefined) {
      updates.push(`notes = $${params.length + 1}`);
      params.push(notes);
    }

    if (updates.length === 0) {
      return errorResponse('No fields to update');
    }

    params.push(id);

    const query = `
      UPDATE demo_requests
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await sql(query, params);

    if (result.length === 0) {
      return errorResponse('Demo request not found', 404);
    }

    return successResponse(result[0]);
  } catch (error) {
    console.error('Update demo request error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
