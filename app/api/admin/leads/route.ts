/**
 * Unified Leads API
 * GET /api/admin/leads
 *
 * Purpose: 모든 리드 소스(Library, Contact, Demo, Event)를 통합하여 조회
 *
 * Features:
 * - Multi-source filtering
 * - Status filtering
 * - Date range filtering
 * - Score range filtering
 * - Search (company, contact, email)
 * - Pagination
 * - Statistics aggregation
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract parameters
    const sourceType = searchParams.get('source_type') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const scoreMin = parseInt(searchParams.get('score_min') || '0');
    const scoreMax = parseInt(searchParams.get('score_max') || '100');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    // Build WHERE clause (using template literals with Neon SQL)
    const conditions: string[] = [];

    // Source type filter
    if (sourceType !== 'ALL') {
      conditions.push(`lead_source_type = '${sourceType}'`);
    }

    // Status filter
    if (status !== 'ALL') {
      conditions.push(`lead_status = '${status}'`);
    }

    // Date range filter
    if (dateFrom) {
      conditions.push(`created_at >= '${dateFrom}'`);
    }

    if (dateTo) {
      conditions.push(`created_at <= '${dateTo}'`);
    }

    // Score range filter
    conditions.push(`lead_score >= ${scoreMin}`);
    conditions.push(`lead_score <= ${scoreMax}`);

    // Search filter (escape for SQL injection prevention)
    if (search) {
      const escapedSearch = search.replace(/'/g, "''");
      conditions.push(`(
        company_name ILIKE '%${escapedSearch}%' OR
        contact_name ILIKE '%${escapedSearch}%' OR
        email ILIKE '%${escapedSearch}%'
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM unified_leads
      ${sql.unsafe(whereClause)}
    `;

    const total = countResult && countResult[0] ? parseInt(countResult[0].total) : 0;

    // Fetch leads with pagination
    const offset = (page - 1) * perPage;
    const leads = await sql`
      SELECT *
      FROM unified_leads
      ${sql.unsafe(whereClause)}
      ORDER BY lead_score DESC, created_at DESC
      LIMIT ${perPage} OFFSET ${offset}
    `;

    // Get statistics
    const statsResult = await sql`
      SELECT
        COUNT(*) as total_leads,
        COALESCE(AVG(lead_score)::INTEGER, 0) as avg_score,
        COUNT(CASE WHEN lead_status = 'NEW' THEN 1 END) as new_count,
        COUNT(CASE WHEN lead_status = 'CONTACTED' THEN 1 END) as contacted_count,
        COUNT(CASE WHEN lead_status = 'QUALIFIED' THEN 1 END) as qualified_count,
        COUNT(CASE WHEN lead_status = 'WON' THEN 1 END) as won_count,
        COUNT(CASE WHEN lead_source_type = 'LIBRARY_LEAD' THEN 1 END) as library_count,
        COUNT(CASE WHEN lead_source_type = 'CONTACT_FORM' THEN 1 END) as contact_count,
        COUNT(CASE WHEN lead_source_type = 'DEMO_REQUEST' THEN 1 END) as demo_count,
        COUNT(CASE WHEN lead_source_type = 'EVENT_REGISTRATION' THEN 1 END) as event_count
      FROM unified_leads
      ${sql.unsafe(whereClause)}
    `;

    const stats = statsResult[0];

    return NextResponse.json({
      success: true,
      data: leads,
      meta: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
      stats: {
        total_leads: parseInt(stats.total_leads),
        avg_score: stats.avg_score,
        by_status: {
          NEW: parseInt(stats.new_count),
          CONTACTED: parseInt(stats.contacted_count),
          QUALIFIED: parseInt(stats.qualified_count),
          WON: parseInt(stats.won_count),
        },
        by_source: {
          LIBRARY_LEAD: parseInt(stats.library_count),
          CONTACT_FORM: parseInt(stats.contact_count),
          DEMO_REQUEST: parseInt(stats.demo_count),
          EVENT_REGISTRATION: parseInt(stats.event_count),
        },
      },
    });
  } catch (error: any) {
    console.error('[Unified Leads API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to fetch unified leads',
        },
      },
      { status: 500 }
    );
  }
}
