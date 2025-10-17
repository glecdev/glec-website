/**
 * GET /api/cron/library-nurture
 *
 * Cron Job: Send Library Nurture Sequence Emails
 *
 * Schedule: Daily at 9 AM KST (0 9 * * *)
 *
 * Process:
 * 1. Find library leads created exactly N days ago
 * 2. Check if nurture email for that day has been sent
 * 3. Send appropriate nurture email (Day 3, 7, 14, 30)
 * 4. Update nurture flags in database
 *
 * Security:
 * - Requires cron_secret query parameter (set in .env)
 * - Only runs in production environment
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
// CRON JOB HANDLER
// ============================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Verify cron secret (security)
    const cronSecret = req.nextUrl.searchParams.get('cron_secret');
    // Handle trailing newlines, escaped newlines, and quotes from Vercel CLI
    const rawSecret = process.env.CRON_SECRET || '';
    const expectedSecret = rawSecret
      .trim()                    // Remove leading/trailing whitespace
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\\n$/, '');      // Remove escaped newline at end

    console.log('[Library Nurture] Secret verification:', {
      raw_secret: rawSecret,
      raw_length: rawSecret.length,
      expected_secret: expectedSecret,
      expected_length: expectedSecret.length,
      received_secret: cronSecret,
      received_length: cronSecret?.length,
      match: cronSecret === expectedSecret,
    });

    if (!expectedSecret) {
      console.error('[Library Nurture] CRON_SECRET not configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    if (cronSecret !== expectedSecret) {
      console.error('[Library Nurture] Invalid cron secret - mismatch');
      return NextResponse.json({
        error: 'Unauthorized',
        debug: {
          raw_secret_length: rawSecret.length,
          expected_secret_length: expectedSecret.length,
          received_secret_length: cronSecret?.length,
          match: cronSecret === expectedSecret,
        }
      }, { status: 401 });
    }

    console.log('[Library Nurture] Starting cron job...');

    const results = {
      day3: { sent: 0, failed: 0 },
      day7: { sent: 0, failed: 0 },
      day14: { sent: 0, failed: 0 },
      day30: { sent: 0, failed: 0 },
    };

    // ========================================
    // Day 3: Implementation Guide
    // ========================================
    const day3Leads = await sql`
      SELECT
        id,
        company_name,
        contact_name,
        email,
        library_item_id
      FROM library_leads
      WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '3 days'
      AND email_sent = TRUE
      AND email_opened = TRUE
      AND nurture_day3_sent = FALSE
      AND marketing_consent = TRUE
      LIMIT 100
    `;

    console.log(`[Library Nurture] Found ${day3Leads.length} leads for Day 3`);

    for (const lead of day3Leads) {
      try {
        // Fetch library item title
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
          console.error(`[Library Nurture] Day 3 email failed for ${lead.email}:`, error);
          results.day3.failed++;
        } else {
          await sql`
            UPDATE library_leads
            SET
              nurture_day3_sent = TRUE,
              nurture_day3_sent_at = NOW(),
              resend_email_id = ${data?.id || null}
            WHERE id = ${lead.id}
          `;
          console.log(`[Library Nurture] Day 3 email sent to ${lead.email}`);
          results.day3.sent++;
        }
      } catch (error) {
        console.error(`[Library Nurture] Error processing Day 3 for ${lead.email}:`, error);
        results.day3.failed++;
      }
    }

    // ========================================
    // Day 7: Customer Case Study
    // ========================================
    const day7Leads = await sql`
      SELECT
        id,
        company_name,
        contact_name,
        email
      FROM library_leads
      WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '7 days'
      AND email_sent = TRUE
      AND nurture_day3_sent = TRUE
      AND nurture_day7_sent = FALSE
      AND marketing_consent = TRUE
      LIMIT 100
    `;

    console.log(`[Library Nurture] Found ${day7Leads.length} leads for Day 7`);

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
          console.error(`[Library Nurture] Day 7 email failed for ${lead.email}:`, error);
          results.day7.failed++;
        } else {
          await sql`
            UPDATE library_leads
            SET
              nurture_day7_sent = TRUE,
              nurture_day7_sent_at = NOW(),
              resend_email_id = ${data?.id || null}
            WHERE id = ${lead.id}
          `;
          console.log(`[Library Nurture] Day 7 email sent to ${lead.email}`);
          results.day7.sent++;
        }
      } catch (error) {
        console.error(`[Library Nurture] Error processing Day 7 for ${lead.email}:`, error);
        results.day7.failed++;
      }
    }

    // ========================================
    // Day 14: Demo Invitation
    // ========================================
    const day14Leads = await sql`
      SELECT
        id,
        company_name,
        contact_name,
        email
      FROM library_leads
      WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '14 days'
      AND email_sent = TRUE
      AND nurture_day7_sent = TRUE
      AND nurture_day14_sent = FALSE
      AND download_link_clicked = TRUE
      AND marketing_consent = TRUE
      LIMIT 100
    `;

    console.log(`[Library Nurture] Found ${day14Leads.length} leads for Day 14`);

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
          console.error(`[Library Nurture] Day 14 email failed for ${lead.email}:`, error);
          results.day14.failed++;
        } else {
          await sql`
            UPDATE library_leads
            SET
              nurture_day14_sent = TRUE,
              nurture_day14_sent_at = NOW(),
              resend_email_id = ${data?.id || null}
            WHERE id = ${lead.id}
          `;
          console.log(`[Library Nurture] Day 14 email sent to ${lead.email}`);
          results.day14.sent++;
        }
      } catch (error) {
        console.error(`[Library Nurture] Error processing Day 14 for ${lead.email}:`, error);
        results.day14.failed++;
      }
    }

    // ========================================
    // Day 30: Re-engagement Campaign
    // ========================================
    const day30Leads = await sql`
      SELECT
        id,
        company_name,
        contact_name,
        email
      FROM library_leads
      WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '30 days'
      AND email_sent = TRUE
      AND nurture_day14_sent = TRUE
      AND nurture_day30_sent = FALSE
      AND email_opened = FALSE
      AND marketing_consent = TRUE
      LIMIT 100
    `;

    console.log(`[Library Nurture] Found ${day30Leads.length} leads for Day 30`);

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
          console.error(`[Library Nurture] Day 30 email failed for ${lead.email}:`, error);
          results.day30.failed++;
        } else {
          await sql`
            UPDATE library_leads
            SET
              nurture_day30_sent = TRUE,
              nurture_day30_sent_at = NOW(),
              resend_email_id = ${data?.id || null}
            WHERE id = ${lead.id}
          `;
          console.log(`[Library Nurture] Day 30 email sent to ${lead.email}`);
          results.day30.sent++;
        }
      } catch (error) {
        console.error(`[Library Nurture] Error processing Day 30 for ${lead.email}:`, error);
        results.day30.failed++;
      }
    }

    // ========================================
    // Return Results
    // ========================================
    console.log('[Library Nurture] Cron job completed:', results);

    return NextResponse.json(
      {
        success: true,
        message: 'Library nurture emails processed',
        results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Library Nurture] Cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
