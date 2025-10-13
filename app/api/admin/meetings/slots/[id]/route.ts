/**
 * Admin Meeting Slot Management API (Single Slot)
 * /api/admin/meetings/slots/[id]
 *
 * Methods:
 * - PATCH: Update slot (is_available, title, etc.)
 * - DELETE: Delete slot
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ====================================================================
// PATCH /api/admin/meetings/slots/[id]
// ====================================================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const slotId = resolvedParams.id;
    const body = await req.json();

    // Validation
    if (!slotId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Slot ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Build SET clause dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }

    if (body.meeting_type !== undefined) {
      updates.push(`meeting_type = $${paramIndex++}`);
      values.push(body.meeting_type);
    }

    if (body.is_available !== undefined) {
      updates.push(`is_available = $${paramIndex++}`);
      values.push(body.is_available);
    }

    if (body.max_bookings !== undefined) {
      updates.push(`max_bookings = $${paramIndex++}`);
      values.push(body.max_bookings);
    }

    if (body.meeting_url !== undefined) {
      updates.push(`meeting_url = $${paramIndex++}`);
      values.push(body.meeting_url || null);
    }

    if (body.meeting_location !== undefined) {
      updates.push(`meeting_location = $${paramIndex++}`);
      values.push(body.meeting_location);
    }

    if (body.office_address !== undefined) {
      updates.push(`office_address = $${paramIndex++}`);
      values.push(body.office_address || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No fields to update',
          },
        },
        { status: 400 }
      );
    }

    // Build dynamic UPDATE with sql.unsafe for SET clause
    const setClause = updates
      .map((update, idx) => {
        const placeholder = `$${idx + 1}`;
        return update; // update already contains "$N" placeholders
      })
      .join(', ');

    // Add slot ID as last parameter
    values.push(slotId);

    // Execute update using tagged template with unsafe for dynamic SET
    const query = `UPDATE meeting_slots SET ${setClause}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await sql.unsafe(query, values);

    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Meeting slot not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error: any) {
    console.error('[PATCH /api/admin/meetings/slots/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to update meeting slot',
        },
      },
      { status: 500 }
    );
  }
}

// ====================================================================
// DELETE /api/admin/meetings/slots/[id]
// ====================================================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const slotId = resolvedParams.id;

    // Validation
    if (!slotId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Slot ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Check if slot has any bookings
    const bookingsCheck = await sql`
      SELECT COUNT(*) as count
      FROM meeting_bookings
      WHERE meeting_slot_id = ${slotId}
    `;

    const bookingCount = parseInt(bookingsCheck[0].count, 10);

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: `Cannot delete slot with ${bookingCount} booking(s). Cancel bookings first.`,
          },
        },
        { status: 409 }
      );
    }

    // Delete slot
    const result = await sql`
      DELETE FROM meeting_slots
      WHERE id = ${slotId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Meeting slot not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result[0].id,
        deleted: true,
      },
    });
  } catch (error: any) {
    console.error('[DELETE /api/admin/meetings/slots/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to delete meeting slot',
        },
      },
      { status: 500 }
    );
  }
}
