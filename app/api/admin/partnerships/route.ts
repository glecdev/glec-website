/**
 * Admin Partnerships API - Database Implementation
 *
 * Endpoints:
 * - GET /api/admin/partnerships - List partnerships (paginated)
 * - PUT /api/admin/partnerships?id={id} - Update partnership status
 * - DELETE /api/admin/partnerships?id={id} - Delete partnership
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

const PartnershipUpdateSchema = z.object({
  status: z.enum(['NEW', 'REVIEWING', 'APPROVED', 'REJECTED']).optional(),
  notes: z.string().optional(),
});

// ============================================================
// GET /api/admin/partnerships - List partnerships
// ============================================================

export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);
      const status = searchParams.get('status');
      const partnershipType = searchParams.get('partnershipType');
      const search = searchParams.get('search');

      if (page < 1 || isNaN(page)) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PAGE', message: 'Page number must be >= 1' } },
          { status: 400 }
        );
      }

      // Build WHERE clause (using template literals with SQL escaping)
      const conditions: string[] = [];

      if (status) {
        const escapedStatus = status.replace(/'/g, "''");
        conditions.push(`status = '${escapedStatus}'`);
      }

      if (partnershipType) {
        const escapedType = partnershipType.replace(/'/g, "''");
        conditions.push(`partnership_type = '${escapedType}'`);
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

      // Get paginated items
      const offset = (page - 1) * per_page;
      const items = await sql`
        SELECT *
        FROM partnerships
        ${sql.unsafe(whereClause)}
        ORDER BY created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;

      // Transform to camelCase
      const transformedItems = items.map((item: any) => ({
        id: item.id,
        companyName: item.company_name,
        contactName: item.contact_name,
        email: item.email,
        partnershipType: item.partnership_type,
        proposal: item.proposal,
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
      console.error('[GET /api/admin/partnerships] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// PUT /api/admin/partnerships - Update partnership status
// ============================================================

export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Partnership ID is required' } },
          { status: 400 }
        );
      }

      const body = await request.json();
      const validationResult = PartnershipUpdateSchema.safeParse(body);

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
      const existing = await sql`
        SELECT id FROM partnerships WHERE id = ${id}
      `;
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Partnership not found' } },
          { status: 404 }
        );
      }

      // Build UPDATE query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (validated.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(validated.status);
        paramIndex++;
      }
      if (validated.notes !== undefined) {
        updates.push(`notes = $${paramIndex}`);
        values.push(validated.notes);
        paramIndex++;
      }

      updates.push(`updated_at = NOW()`);

      values.push(id);

      const setClause = updates.join(', ');
      const updateQuery = `UPDATE partnerships SET ${setClause} WHERE id = $${paramIndex} RETURNING *`;

      const updated = await sql.unsafe(updateQuery, values);
      const result = updated[0];

      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          companyName: result.company_name,
          contactName: result.contact_name,
          email: result.email,
          partnershipType: result.partnership_type,
          proposal: result.proposal,
          status: result.status,
          notes: result.notes,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        },
      });
    } catch (error) {
      console.error('[PUT /api/admin/partnerships] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);

// ============================================================
// DELETE /api/admin/partnerships - Delete partnership
// ============================================================

export const DELETE = withAuth(
  async (request: NextRequest) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'Partnership ID is required' } },
          { status: 400 }
        );
      }

      // Check if item exists
      const existing = await sql`
        SELECT id FROM partnerships WHERE id = ${id}
      `;
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Partnership not found' } },
          { status: 404 }
        );
      }

      // Delete item
      await sql`
        DELETE FROM partnerships WHERE id = ${id}
      `;

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      console.error('[DELETE /api/admin/partnerships] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' } },
        { status: 500 }
      );
    }
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
