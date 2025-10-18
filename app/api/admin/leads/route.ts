/**
 * Unified Leads API (v2.0 - Performance Optimized)
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
 * - Cursor-based pagination (optimized for large datasets)
 * - Statistics aggregation
 *
 * Security:
 * - ✅ 100% Parameterized queries (NO sql.unsafe())
 * - ✅ Input validation (Zod schema)
 * - ✅ Rate limiting (100 req/15min)
 * - ✅ SQL Injection prevention
 *
 * Performance:
 * - ✅ Cursor-based pagination (O(1) vs O(n))
 * - ✅ Single optimized query (3 queries → 1 query with CTE)
 * - ✅ Database indexes (see migration file)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { rateLimiters, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limit';

const sql = neon(process.env.DATABASE_URL!);

// ====================================================================
// Input Validation Schema
// ====================================================================

const LeadSourceTypeEnum = z.enum(['LIBRARY_LEAD', 'CONTACT_FORM', 'DEMO_REQUEST', 'EVENT_REGISTRATION', 'ALL']);
const LeadStatusEnum = z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ALL']);

const GetLeadsQuerySchema = z.object({
  source_type: LeadSourceTypeEnum.default('ALL'),
  status: LeadStatusEnum.default('ALL'),
  date_from: z.string().datetime().optional().or(z.literal('')).or(z.null()).transform(val => val || undefined),
  date_to: z.string().datetime().optional().or(z.literal('')).or(z.null()).transform(val => val || undefined),
  score_min: z.coerce.number().int().min(0).max(100).default(0),
  score_max: z.coerce.number().int().min(0).max(100).default(100),
  search: z.string().max(255).optional().or(z.literal('')).or(z.null()).transform(val => val || undefined),

  // Cursor-based pagination
  cursor: z.string().optional().or(z.literal('')).or(z.null()).transform(val => val || undefined), // Format: "score_createdAt_leadId"
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Legacy page-based pagination (backward compatible)
  page: z.coerce.number().int().min(1).optional().or(z.literal('')).or(z.null()).transform(val => val || undefined),
  per_page: z.coerce.number().int().min(1).max(100).optional().or(z.literal('')).or(z.null()).transform(val => val || undefined),
});

// ====================================================================
// Main GET Handler
// ====================================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Check rate limit (100 requests per 15 minutes per IP)
    const rateLimitResult = rateLimiters.generalApi.check(req);

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        createRateLimitResponse(rateLimitResult),
        { status: 429 }
      );
      addRateLimitHeaders(response.headers, rateLimitResult);
      return response;
    }

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(req.url);
    const rawParams = {
      source_type: searchParams.get('source_type') || 'ALL',
      status: searchParams.get('status') || 'ALL',
      date_from: searchParams.get('date_from'),
      date_to: searchParams.get('date_to'),
      score_min: searchParams.get('score_min') || '0',
      score_max: searchParams.get('score_max') || '100',
      search: searchParams.get('search'),
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit') || '20',
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
    };

    const validationResult = GetLeadsQuerySchema.safeParse(rawParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // 3. Build safe WHERE conditions using parameterized queries
    const conditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Source type filter
    if (params.source_type !== 'ALL') {
      conditions.push(`lead_source_type = $${paramIndex}`);
      queryParams.push(params.source_type);
      paramIndex++;
    }

    // Status filter
    if (params.status !== 'ALL') {
      conditions.push(`lead_status = $${paramIndex}`);
      queryParams.push(params.status);
      paramIndex++;
    }

    // Date range filter
    if (params.date_from) {
      conditions.push(`created_at >= $${paramIndex}`);
      queryParams.push(params.date_from);
      paramIndex++;
    }

    if (params.date_to) {
      conditions.push(`created_at <= $${paramIndex}`);
      queryParams.push(params.date_to);
      paramIndex++;
    }

    // Score range filter
    conditions.push(`lead_score >= $${paramIndex}`);
    queryParams.push(params.score_min);
    paramIndex++;

    conditions.push(`lead_score <= $${paramIndex}`);
    queryParams.push(params.score_max);
    paramIndex++;

    // Search filter (safe parameterized ILIKE)
    if (params.search && params.search.length >= 2) {
      const searchPattern = `%${params.search}%`;
      conditions.push(`(
        company_name ILIKE $${paramIndex} OR
        contact_name ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex}
      )`);
      queryParams.push(searchPattern);
      paramIndex++;
    }

    // Cursor-based pagination filter
    let cursorCondition = '';
    if (params.cursor) {
      // Cursor format: "score_createdAt_leadId"
      const [cursorScore, cursorCreatedAt, cursorLeadId] = params.cursor.split('_');

      cursorCondition = `AND (
        (lead_score < $${paramIndex}) OR
        (lead_score = $${paramIndex} AND created_at < $${paramIndex + 1}) OR
        (lead_score = $${paramIndex} AND created_at = $${paramIndex + 1} AND lead_id < $${paramIndex + 2})
      )`;

      queryParams.push(parseInt(cursorScore), cursorCreatedAt, cursorLeadId);
      paramIndex += 3;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')} ${cursorCondition}` : (cursorCondition ? `WHERE ${cursorCondition.replace('AND ', '')}` : '');

    // 4. Optimized single query with CTE (Common Table Expression)
    // This replaces 3 separate queries (count, leads, stats) with 1 query
    const optimizedQuery = `
      WITH filtered_leads AS (
        SELECT
          lead_source_type,
          lead_id,
          company_name,
          contact_name,
          email,
          phone,
          lead_status,
          lead_score,
          created_at,
          updated_at,
          inquiry_type,
          demo_product,
          event_name,
          source_detail,
          email_sent,
          email_opened,
          email_clicked,
          days_old
        FROM unified_leads
        ${whereClause}
        ORDER BY lead_score DESC, created_at DESC, lead_id DESC
        LIMIT $${paramIndex}
      ),
      stats AS (
        SELECT
          COUNT(*) as total_leads,
          COALESCE(AVG(lead_score)::INTEGER, 0) as avg_score,
          COUNT(CASE WHEN lead_status = 'NEW' THEN 1 END) as new_count,
          COUNT(CASE WHEN lead_status = 'CONTACTED' THEN 1 END) as contacted_count,
          COUNT(CASE WHEN lead_status = 'QUALIFIED' THEN 1 END) as qualified_count,
          COUNT(CASE WHEN lead_status = 'PROPOSAL_SENT' THEN 1 END) as proposal_count,
          COUNT(CASE WHEN lead_status = 'NEGOTIATION' THEN 1 END) as negotiation_count,
          COUNT(CASE WHEN lead_status = 'WON' THEN 1 END) as won_count,
          COUNT(CASE WHEN lead_status = 'LOST' THEN 1 END) as lost_count,
          COUNT(CASE WHEN lead_source_type = 'LIBRARY_LEAD' THEN 1 END) as library_count,
          COUNT(CASE WHEN lead_source_type = 'CONTACT_FORM' THEN 1 END) as contact_count,
          COUNT(CASE WHEN lead_source_type = 'DEMO_REQUEST' THEN 1 END) as demo_count,
          COUNT(CASE WHEN lead_source_type = 'EVENT_REGISTRATION' THEN 1 END) as event_count
        FROM unified_leads
        ${whereClause.replace(cursorCondition, '')}
      )
      SELECT
        'lead' as row_type,
        to_jsonb(fl.*) as data
      FROM filtered_leads fl
      UNION ALL
      SELECT
        'stats' as row_type,
        to_jsonb(s.*) as data
      FROM stats s;
    `;

    queryParams.push(params.limit);

    const result = await sql.query(optimizedQuery, queryParams);

    // 5. Parse results from single query
    const leads: any[] = [];
    let stats: any = null;

    for (const row of result) {
      if (row.row_type === 'lead') {
        leads.push(row.data);
      } else if (row.row_type === 'stats') {
        stats = row.data;
      }
    }

    // 6. Generate next cursor
    let nextCursor: string | null = null;
    if (leads.length === params.limit) {
      const lastLead = leads[leads.length - 1];
      nextCursor = `${lastLead.lead_score}_${lastLead.created_at}_${lastLead.lead_id}`;
    }

    // 7. Return response with rate limit headers
    const response = NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        limit: params.limit,
        next_cursor: nextCursor,
        has_more: nextCursor !== null,
      },
      stats: stats ? {
        total_leads: parseInt(String(stats.total_leads)),
        avg_score: stats.avg_score,
        by_status: {
          NEW: parseInt(String(stats.new_count)),
          CONTACTED: parseInt(String(stats.contacted_count)),
          QUALIFIED: parseInt(String(stats.qualified_count)),
          PROPOSAL_SENT: parseInt(String(stats.proposal_count)),
          NEGOTIATION: parseInt(String(stats.negotiation_count)),
          WON: parseInt(String(stats.won_count)),
          LOST: parseInt(String(stats.lost_count)),
        },
        by_source: {
          LIBRARY_LEAD: parseInt(String(stats.library_count)),
          CONTACT_FORM: parseInt(String(stats.contact_count)),
          DEMO_REQUEST: parseInt(String(stats.demo_count)),
          EVENT_REGISTRATION: parseInt(String(stats.event_count)),
        },
      } : null,
    });

    addRateLimitHeaders(response.headers, rateLimitResult);
    return response;
  } catch (error: any) {
    console.error('[Unified Leads API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch unified leads',
        },
      },
      { status: 500 }
    );
  }
}
