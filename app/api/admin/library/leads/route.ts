/**
 * Admin Library Leads API
 *
 * GET  /api/admin/library/leads - List all library leads with filters
 *
 * Based on: GLEC-API-Specification.yaml
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ====================================================================
// GET - List all library leads
// ====================================================================

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const lead_status = searchParams.get('lead_status') || 'ALL';
    const library_item_id = searchParams.get('library_item_id') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '20', 10), 100);

    const offset = (page - 1) * per_page;

    // Build WHERE conditions using tagged template (Neon requirement)
    const searchPattern = search ? `%${search}%` : '';

    // 1. Count total leads
    let countResult;
    if (lead_status !== 'ALL' && library_item_id !== 'ALL' && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_leads
        WHERE lead_status = ${lead_status} AND library_item_id = ${library_item_id}
        AND (company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
      `;
    } else if (lead_status !== 'ALL' && library_item_id !== 'ALL') {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_leads
        WHERE lead_status = ${lead_status} AND library_item_id = ${library_item_id}
      `;
    } else if (lead_status !== 'ALL' && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_leads
        WHERE lead_status = ${lead_status}
        AND (company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
      `;
    } else if (library_item_id !== 'ALL' && search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_leads
        WHERE library_item_id = ${library_item_id}
        AND (company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern})
      `;
    } else if (lead_status !== 'ALL') {
      countResult = await sql`SELECT COUNT(*) as total FROM library_leads WHERE lead_status = ${lead_status}`;
    } else if (library_item_id !== 'ALL') {
      countResult = await sql`SELECT COUNT(*) as total FROM library_leads WHERE library_item_id = ${library_item_id}`;
    } else if (search) {
      countResult = await sql`
        SELECT COUNT(*) as total FROM library_leads
        WHERE company_name ILIKE ${searchPattern} OR contact_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
      `;
    } else {
      countResult = await sql`SELECT COUNT(*) as total FROM library_leads`;
    }

    const total = parseInt(countResult[0].total);

    // 2. Get leads with pagination and JOIN library_items
    let leads;
    if (lead_status !== 'ALL' && library_item_id !== 'ALL' && search) {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.lead_status = ${lead_status} AND ll.library_item_id = ${library_item_id}
        AND (ll.company_name ILIKE ${searchPattern} OR ll.contact_name ILIKE ${searchPattern} OR ll.email ILIKE ${searchPattern})
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (lead_status !== 'ALL' && library_item_id !== 'ALL') {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.lead_status = ${lead_status} AND ll.library_item_id = ${library_item_id}
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (lead_status !== 'ALL' && search) {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.lead_status = ${lead_status}
        AND (ll.company_name ILIKE ${searchPattern} OR ll.contact_name ILIKE ${searchPattern} OR ll.email ILIKE ${searchPattern})
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (library_item_id !== 'ALL' && search) {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.library_item_id = ${library_item_id}
        AND (ll.company_name ILIKE ${searchPattern} OR ll.contact_name ILIKE ${searchPattern} OR ll.email ILIKE ${searchPattern})
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (lead_status !== 'ALL') {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.lead_status = ${lead_status}
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (library_item_id !== 'ALL') {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.library_item_id = ${library_item_id}
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else if (search) {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.company_name ILIKE ${searchPattern} OR ll.contact_name ILIKE ${searchPattern} OR ll.email ILIKE ${searchPattern}
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    } else {
      leads = await sql`
        SELECT ll.*, li.title as library_item_title, li.slug as library_item_slug
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        ORDER BY ll.created_at DESC
        LIMIT ${per_page} OFFSET ${offset}
      `;
    }

    // 3. Return response
    return NextResponse.json({
      success: true,
      data: leads,
      meta: {
        page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page),
        lead_status,
        library_item_id,
        search: search || null,
      },
    });
  } catch (error: any) {
    console.error('[Admin Library Leads GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch library leads',
        },
      },
      { status: 500 }
    );
  }
}
