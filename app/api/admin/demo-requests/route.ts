/**
 * Admin Demo Requests API - Database Implementation
 *
 * Endpoints:
 * - GET /api/admin/demo-requests - List demo requests (paginated)
 * - PUT /api/admin/demo-requests?id={id} - Update demo request status
 * - DELETE /api/admin/demo-requests?id={id} - Delete demo request
 *
 * Security: CONTENT_MANAGER 이상 권한 필요
 * Database: Neon PostgreSQL
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// Validation Schemas
// ============================================================

const DemoRequestUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

// ============================================================
// GET /api/admin/demo-requests - List demo requests
// ============================================================

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
      const status = searchParams.get('status');
      const search = searchParams.get('search');

      if (page < 1 || isNaN(page)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PAGE', message: 'Page number must be >= 1' } },
          { status: 400 }
        );
      }

      // Build dynamic query parts
      const whereParts: string[] = [];
      const searchPattern = search ? `%${search}%` : null;

      // Count total
      let countResult;
      if (status && searchPattern) {
        countResult = await sql`SELECT COUNT(*) as total FROM demo_requests WHERE status = ${status} AND (company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})`;
      } else if (status) {
        countResult = await sql`SELECT COUNT(*) as total FROM demo_requests WHERE status = ${status}`;
      } else if (searchPattern) {
        countResult = await sql`SELECT COUNT(*) as total FROM demo_requests WHERE (company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})`;
      } else {
        countResult = await sql`SELECT COUNT(*) as total FROM demo_requests`;
      }
      const total = parseInt(countResult[0].total, 10);

      // Get paginated items
      const offset = (page - 1) * per_page;
      let itemsResult;
      if (status && searchPattern) {
        itemsResult = await sql`SELECT * FROM demo_requests WHERE status = ${status} AND (company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}) ORDER BY created_at DESC LIMIT ${per_page} OFFSET ${offset}`;
      } else if (status) {
        itemsResult = await sql`SELECT * FROM demo_requests WHERE status = ${status} ORDER BY created_at DESC LIMIT ${per_page} OFFSET ${offset}`;
      } else if (searchPattern) {
        itemsResult = await sql`SELECT * FROM demo_requests WHERE (company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}) ORDER BY created_at DESC LIMIT ${per_page} OFFSET ${offset}`;
      } else {
        itemsResult = await sql`SELECT * FROM demo_requests ORDER BY created_at DESC LIMIT ${per_page} OFFSET ${offset}`;
      }

      // Transform to camelCase
      const transformedItems = itemsResult.map((item: any) => ({
        id: item.id,
        companyName: item.company_name,
        contactName: item.contact_name,
        email: item.email,
        phone: item.phone,
        companySize: item.company_size,
        productInterests: item.product_interests,
        useCase: item.use_case,
        currentSolution: item.current_solution,
        monthlyShipments: item.monthly_shipments,
        preferredDate: item.preferred_date,
        preferredTime: item.preferred_time,
        additionalMessage: item.additional_message,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      return NextResponse.json({
        success: true,
        data: transformedItems,
        meta: {
          page,
          perPage: per_page,
          total,
          totalPages: Math.ceil(total / per_page),
        },
      });
    } catch (error) {
      console.error('[GET /api/admin/demo-requests] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// PUT /api/admin/demo-requests - Update demo request status
// ============================================================

export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Demo request ID is required' } },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validationResult = DemoRequestUpdateSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
              })),
            },
          },
          { status: 400 }
        );
      }

      const validated = validationResult.data;

      // Check if item exists
      const existing = await sql`SELECT id FROM demo_requests WHERE id = ${id}`;
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Demo request not found' } },
          { status: 404 }
        );
      }

      // Update with dynamic fields
      let updated;
      if (validated.status !== undefined && validated.notes !== undefined) {
        updated = await sql`UPDATE demo_requests SET status = ${validated.status}, notes = ${validated.notes}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
      } else if (validated.status !== undefined) {
        updated = await sql`UPDATE demo_requests SET status = ${validated.status}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
      } else if (validated.notes !== undefined) {
        updated = await sql`UPDATE demo_requests SET notes = ${validated.notes}, updated_at = NOW() WHERE id = ${id} RETURNING *`;
      } else {
        updated = await sql`UPDATE demo_requests SET updated_at = NOW() WHERE id = ${id} RETURNING *`;
      }
      const result = updated[0];

      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          companyName: result.company_name,
          contactName: result.contact_name,
          email: result.email,
          phone: result.phone,
          companySize: result.company_size,
          productInterests: result.product_interests,
          useCase: result.use_case,
          currentSolution: result.current_solution,
          monthlyShipments: result.monthly_shipments,
          preferredDate: result.preferred_date,
          preferredTime: result.preferred_time,
          additionalMessage: result.additional_message,
          status: result.status,
          notes: result.notes,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        },
      });
    } catch (error) {
      console.error('[PUT /api/admin/demo-requests] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// DELETE /api/admin/demo-requests - Delete demo request
// ============================================================

export const DELETE = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Demo request ID is required' } },
          { status: 400 }
        );
      }

      // Check if item exists
      const existing = await sql`SELECT id FROM demo_requests WHERE id = ${id}`;
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Demo request not found' } },
          { status: 404 }
        );
      }

      // Delete item
      await sql`DELETE FROM demo_requests WHERE id = ${id}`;

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[DELETE /api/admin/demo-requests] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
