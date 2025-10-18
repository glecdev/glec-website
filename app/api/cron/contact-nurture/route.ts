/**
 * GET /api/cron/contact-nurture
 *
 * Cron Job: Send Contact Form Nurture Sequence Emails
 *
 * Schedule: Daily at 10 AM KST (0 10 * * *)
 *
 * Process:
 * 1. Find contact form leads created N days ago
 * 2. Check if nurture email for that day has been sent
 * 3. Send appropriate nurture email (Day 3, 7, 14, 30) using template system
 * 4. Update nurture flags in database
 * 5. Log email send to email_send_history table
 *
 * Security:
 * - Requires cron_secret query parameter (set in .env)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import {
  getContactFormNurtureEmail,
  logEmailSend,
} from '@/lib/email-templates/template-renderer';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

// ============================================================
// TYPES
// ============================================================

interface ContactLead {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  inquiry_details: string | null;
}

// ============================================================
// CRON JOB HANDLER
// ============================================================

export async function GET(req: NextRequest) {
  try {
    // 1. Verify cron secret (security)
    const cronSecret = req.nextUrl.searchParams.get('cron_secret');
    const rawSecret = process.env.CRON_SECRET || '';
    const expectedSecret = rawSecret
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\\n$/, '');

    console.log('[Contact Nurture] Secret verification:', {
      expected_length: expectedSecret.length,
      received_length: cronSecret?.length,
      match: cronSecret === expectedSecret,
    });

    if (!expectedSecret) {
      console.error('[Contact Nurture] CRON_SECRET not configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    if (cronSecret !== expectedSecret) {
      console.error('[Contact Nurture] Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Contact Nurture] Starting cron job...');

    const results = {
      day3: { sent: 0, failed: 0 },
      day7: { sent: 0, failed: 0 },
      day14: { sent: 0, failed: 0 },
      day30: { sent: 0, failed: 0 },
    };

    // ========================================
    // Day 3: Welcome & Solution Introduction
    // ========================================
    await processNurtureDay(3, results);

    // ========================================
    // Day 7: Success Cases & ROI
    // ========================================
    await processNurtureDay(7, results);

    // ========================================
    // Day 14: Free Demo Invitation
    // ========================================
    await processNurtureDay(14, results);

    // ========================================
    // Day 30: Last Chance Offer
    // ========================================
    await processNurtureDay(30, results);

    console.log('[Contact Nurture] Cron job completed:', results);

    return NextResponse.json(
      {
        success: true,
        message: 'Contact nurture emails processed',
        results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Contact Nurture] Cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// HELPER: Process Nurture Day
// ============================================================

async function processNurtureDay(
  day: 3 | 7 | 14 | 30,
  results: {
    day3: { sent: number; failed: number };
    day7: { sent: number; failed: number };
    day14: { sent: number; failed: number };
    day30: { sent: number; failed: number };
  }
) {
  const dayKey = `day${day}` as 'day3' | 'day7' | 'day14' | 'day30';

  // Build query conditions based on day
  const whereClauses = [
    `created_at <= NOW() - INTERVAL '${day} days'`,
    `nurture_${dayKey}_sent = FALSE`,
    `marketing_consent = TRUE`,
    `(email_bounced = FALSE OR email_bounced IS NULL)`,
    `(email_complained = FALSE OR email_complained IS NULL)`,
  ];

  // Add dependency check (must have received previous email)
  if (day > 3) {
    const prevDay = day === 7 ? 3 : day === 14 ? 7 : 14;
    whereClauses.push(`nurture_day${prevDay}_sent = TRUE`);
  }

  const queryText = `
    SELECT
      id,
      company_name,
      contact_name,
      email,
      phone,
      inquiry_details
    FROM contact_leads
    WHERE ${whereClauses.join(' AND ')}
    LIMIT 100
  `;

  const leads = await sql.query<ContactLead>(queryText);

  console.log(`[Contact Nurture] Found ${leads.length} leads for Day ${day}`);

  for (const lead of leads) {
    try {
      // Get rendered email from template system
      const emailContent = await getContactFormNurtureEmail(day, {
        contact_name: lead.contact_name,
        company_name: lead.company_name,
        email: lead.email,
        phone: lead.phone || '',
        inquiry_details: lead.inquiry_details || '',
        expiry_date: getExpiryDate(), // For Day 30 discount
      });

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: 'GLEC <noreply@no-reply.glec.io>',
        to: lead.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (error) {
        console.error(`[Contact Nurture] Day ${day} email failed for ${lead.email}:`, error);
        results[dayKey].failed++;

        // Log failed send
        await logEmailSend(
          emailContent.template_id,
          lead.id,
          lead.email,
          null,
          'failed',
          error.message
        );
      } else {
        // Update contact lead nurture flags
        const updateQuery = `
          UPDATE contact_leads
          SET
            nurture_${dayKey}_sent = TRUE,
            nurture_${dayKey}_sent_at = NOW(),
            resend_email_id = $1
          WHERE id = $2
        `;
        await sql.query(updateQuery, [data?.id || null, lead.id]);

        console.log(`[Contact Nurture] Day ${day} email sent to ${lead.email}`);
        results[dayKey].sent++;

        // Log successful send
        await logEmailSend(
          emailContent.template_id,
          lead.id,
          lead.email,
          data?.id || null,
          'sent'
        );
      }
    } catch (error) {
      console.error(`[Contact Nurture] Error processing Day ${day} for ${lead.email}:`, error);
      results[dayKey].failed++;
    }
  }
}

// ============================================================
// HELPER: Get Expiry Date (End of Current Month)
// ============================================================

function getExpiryDate(): string {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
