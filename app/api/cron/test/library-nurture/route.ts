/**
 * GET /api/cron/test/library-nurture
 *
 * Test Endpoint for Library Nurture Cron Job
 *
 * Allows manual triggering of nurture emails with custom date parameters
 * Only available in development environment for testing
 *
 * Query Parameters:
 * - cron_secret: Authentication secret (required)
 * - day: Which nurture email to test (3, 7, 14, 30)
 * - email: Optional - test with specific email address
 * - created_date: Optional - override created_at date (ISO format)
 *
 * Examples:
 * - Test Day 3 emails: /api/cron/test/library-nurture?cron_secret=xxx&day=3
 * - Test specific email: /api/cron/test/library-nurture?cron_secret=xxx&day=7&email=test@example.com
 * - Test with custom date: /api/cron/test/library-nurture?cron_secret=xxx&day=3&created_date=2025-01-10
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import {
  getDay3Subject,
  getDay3HtmlBody,
  getDay3PlainTextBody,
} from '@/lib/email-templates/library-nurture-day3';
import {
  getDay7Subject,
  getDay7HtmlBody,
  getDay7PlainTextBody,
} from '@/lib/email-templates/library-nurture-day7';
import {
  getDay14Subject,
  getDay14HtmlBody,
  getDay14PlainTextBody,
} from '@/lib/email-templates/library-nurture-day14';
import {
  getDay30Subject,
  getDay30HtmlBody,
  getDay30PlainTextBody,
} from '@/lib/email-templates/library-nurture-day30';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

// ============================================================
// TEST CRON JOB HANDLER
// ============================================================

export async function GET(req: NextRequest) {
  try {
    // 0. Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test endpoint not available in production' },
        { status: 403 }
      );
    }

    // 1. Verify cron secret
    const cronSecret = req.nextUrl.searchParams.get('cron_secret');
    // Handle trailing newlines, escaped newlines, and quotes from Vercel CLI
    const rawSecret = process.env.CRON_SECRET || '';
    const expectedSecret = rawSecret
      .trim()                    // Remove leading/trailing whitespace
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\\n$/, '');      // Remove escaped newline at end

    if (!expectedSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    if (cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse test parameters
    const dayParam = req.nextUrl.searchParams.get('day');
    const emailFilter = req.nextUrl.searchParams.get('email');
    const createdDate = req.nextUrl.searchParams.get('created_date');

    if (!dayParam) {
      return NextResponse.json(
        {
          error: 'Missing "day" parameter',
          usage: 'Add ?day=3 or ?day=7 or ?day=14 or ?day=30',
        },
        { status: 400 }
      );
    }

    const day = parseInt(dayParam, 10);
    if (![3, 7, 14, 30].includes(day)) {
      return NextResponse.json({ error: 'Invalid day. Must be 3, 7, 14, or 30' }, { status: 400 });
    }

    console.log('[Test Library Nurture] Starting test for Day', day);
    if (emailFilter) console.log('[Test Library Nurture] Filtering by email:', emailFilter);
    if (createdDate) console.log('[Test Library Nurture] Using custom date:', createdDate);

    const results = {
      day,
      sent: 0,
      failed: 0,
      leads: [] as Array<{ email: string; status: string; error?: string }>,
    };

    // ========================================
    // Build Dynamic SQL Query
    // ========================================
    let dateCondition = `DATE(created_at) = CURRENT_DATE - INTERVAL '${day} days'`;
    if (createdDate) {
      dateCondition = `DATE(created_at) = DATE('${createdDate}')`;
    }

    let emailCondition = '';
    if (emailFilter) {
      emailCondition = `AND email = '${emailFilter}'`;
    }

    // ========================================
    // Day 3: Implementation Guide
    // ========================================
    if (day === 3) {
      const day3Leads = await sql`
        SELECT
          id,
          company_name,
          contact_name,
          email,
          library_item_id
        FROM library_leads
        WHERE ${sql.unsafe(dateCondition)}
        AND email_sent = TRUE
        AND email_opened = TRUE
        AND nurture_day3_sent = FALSE
        AND marketing_consent = TRUE
        ${emailCondition ? sql.unsafe(emailCondition) : sql``}
        LIMIT 10
      `;

      console.log(`[Test Library Nurture] Found ${day3Leads.length} leads for Day 3`);

      for (const lead of day3Leads) {
        try {
          const items = await sql`
            SELECT title FROM library_items WHERE id = ${lead.library_item_id} LIMIT 1
          `;
          const libraryTitle = items[0]?.title || 'GLEC Framework';

          const { data, error } = await resend.emails.send({
            from: 'GLEC <noreply@no-reply.glec.io>',
            to: lead.email,
            subject: getDay3Subject(),
            html: getDay3HtmlBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              library_title: libraryTitle,
              lead_id: lead.id,
            }),
            text: getDay3PlainTextBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              library_title: libraryTitle,
              lead_id: lead.id,
            }),
          });

          if (error) {
            results.failed++;
            results.leads.push({ email: lead.email, status: 'failed', error: error.message });
          } else {
            await sql`
              UPDATE library_leads
              SET
                nurture_day3_sent = TRUE,
                nurture_day3_sent_at = NOW(),
                resend_email_id = ${data?.id || null}
              WHERE id = ${lead.id}
            `;
            results.sent++;
            results.leads.push({ email: lead.email, status: 'sent' });
          }
        } catch (error) {
          results.failed++;
          results.leads.push({
            email: lead.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // ========================================
    // Day 7: Customer Case Study
    // ========================================
    if (day === 7) {
      const day7Leads = await sql`
        SELECT
          id,
          company_name,
          contact_name,
          email
        FROM library_leads
        WHERE ${sql.unsafe(dateCondition)}
        AND email_sent = TRUE
        AND nurture_day3_sent = TRUE
        AND nurture_day7_sent = FALSE
        AND marketing_consent = TRUE
        ${emailCondition ? sql.unsafe(emailCondition) : sql``}
        LIMIT 10
      `;

      console.log(`[Test Library Nurture] Found ${day7Leads.length} leads for Day 7`);

      for (const lead of day7Leads) {
        try {
          const { data, error } = await resend.emails.send({
            from: 'GLEC <noreply@no-reply.glec.io>',
            to: lead.email,
            subject: getDay7Subject(),
            html: getDay7HtmlBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              lead_id: lead.id,
            }),
            text: getDay7PlainTextBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              lead_id: lead.id,
            }),
          });

          if (error) {
            results.failed++;
            results.leads.push({ email: lead.email, status: 'failed', error: error.message });
          } else {
            await sql`
              UPDATE library_leads
              SET
                nurture_day7_sent = TRUE,
                nurture_day7_sent_at = NOW(),
                resend_email_id = ${data?.id || null}
              WHERE id = ${lead.id}
            `;
            results.sent++;
            results.leads.push({ email: lead.email, status: 'sent' });
          }
        } catch (error) {
          results.failed++;
          results.leads.push({
            email: lead.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // ========================================
    // Day 14: Demo Invitation
    // ========================================
    if (day === 14) {
      const day14Leads = await sql`
        SELECT
          id,
          company_name,
          contact_name,
          email
        FROM library_leads
        WHERE ${sql.unsafe(dateCondition)}
        AND email_sent = TRUE
        AND nurture_day7_sent = TRUE
        AND nurture_day14_sent = FALSE
        AND download_link_clicked = TRUE
        AND marketing_consent = TRUE
        ${emailCondition ? sql.unsafe(emailCondition) : sql``}
        LIMIT 10
      `;

      console.log(`[Test Library Nurture] Found ${day14Leads.length} leads for Day 14`);

      for (const lead of day14Leads) {
        try {
          const { data, error } = await resend.emails.send({
            from: 'GLEC <noreply@no-reply.glec.io>',
            to: lead.email,
            subject: getDay14Subject(),
            html: getDay14HtmlBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              lead_id: lead.id,
            }),
            text: getDay14PlainTextBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              lead_id: lead.id,
            }),
          });

          if (error) {
            results.failed++;
            results.leads.push({ email: lead.email, status: 'failed', error: error.message });
          } else {
            await sql`
              UPDATE library_leads
              SET
                nurture_day14_sent = TRUE,
                nurture_day14_sent_at = NOW(),
                resend_email_id = ${data?.id || null}
              WHERE id = ${lead.id}
            `;
            results.sent++;
            results.leads.push({ email: lead.email, status: 'sent' });
          }
        } catch (error) {
          results.failed++;
          results.leads.push({
            email: lead.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // ========================================
    // Day 30: Re-engagement Campaign
    // ========================================
    if (day === 30) {
      const day30Leads = await sql`
        SELECT
          id,
          company_name,
          contact_name,
          email
        FROM library_leads
        WHERE ${sql.unsafe(dateCondition)}
        AND email_sent = TRUE
        AND nurture_day14_sent = TRUE
        AND nurture_day30_sent = FALSE
        AND email_opened = FALSE
        AND marketing_consent = TRUE
        ${emailCondition ? sql.unsafe(emailCondition) : sql``}
        LIMIT 10
      `;

      console.log(`[Test Library Nurture] Found ${day30Leads.length} leads for Day 30`);

      for (const lead of day30Leads) {
        try {
          const { data, error } = await resend.emails.send({
            from: 'GLEC <noreply@no-reply.glec.io>',
            to: lead.email,
            subject: getDay30Subject(),
            html: getDay30HtmlBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              lead_id: lead.id,
            }),
            text: getDay30PlainTextBody({
              contact_name: lead.contact_name,
              company_name: lead.company_name,
              lead_id: lead.id,
            }),
          });

          if (error) {
            results.failed++;
            results.leads.push({ email: lead.email, status: 'failed', error: error.message });
          } else {
            await sql`
              UPDATE library_leads
              SET
                nurture_day30_sent = TRUE,
                nurture_day30_sent_at = NOW(),
                resend_email_id = ${data?.id || null}
              WHERE id = ${lead.id}
            `;
            results.sent++;
            results.leads.push({ email: lead.email, status: 'sent' });
          }
        } catch (error) {
          results.failed++;
          results.leads.push({
            email: lead.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // ========================================
    // Return Test Results
    // ========================================
    console.log('[Test Library Nurture] Test completed:', results);

    return NextResponse.json(
      {
        success: true,
        message: `Test completed for Day ${day}`,
        results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Test Library Nurture] Test error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
